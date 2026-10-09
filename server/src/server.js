import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { runQuery, getOne, getAll } from './database.js';
import { analyzeCode, detectLanguage } from './analyzer.js';
import { generateAiDiagnostics } from './ai_engine.js';
import { validateCode } from './validator.js';
import { analyzeProjectZip } from './project_analyzer.js';
import { analyzeWebsiteUrl } from './url_analyzer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Multer memory storage for ZIP uploads (capped at 25MB for safety)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Aether Engine 2.0', mode: 'zero-login' });
});

// 1. Code Analysis API (Stage 3, 4, 5)
app.post('/api/analyze/code', async (req, res) => {
  try {
    const { code, language: reqLang, apiKey } = req.body;
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ error: 'Code content is required.' });
    }

    const language = reqLang || detectLanguage(code);
    const analysisId = 'an-' + crypto.randomUUID().slice(0, 8);

    // 1. Static and heuristic analysis
    const analysis = analyzeCode(code, language);

    // 2. AI Explanation and Correction
    const aiDiag = await generateAiDiagnostics(code, language, analysis.findings, apiKey);

    // 3. Save to database
    const title = `${language.toUpperCase()} Snippet (${code.split('\n')[0].slice(0, 30)}...)`;
    await runQuery(
      `INSERT INTO analyses (id, type, title, language, code_snippet, health_score, findings_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [analysisId, 'code', title, language, code, analysis.healthScore, analysis.findings.length, 'completed']
    );

    // Insert findings
    for (const f of analysis.findings) {
      const findingId = 'f-' + crypto.randomUUID();
      await runQuery(
        `INSERT INTO findings (id, analysis_id, severity, category, message, line, column, explanation, root_cause, suggestion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [findingId, analysisId, f.severity, f.category, f.message, f.line || 1, f.column || 1, f.explanation || '', f.root_cause || '', f.suggestion || '']
      );
    }

    // Insert fix proposal
    const fixId = 'fix-' + crypto.randomUUID().slice(0, 8);
    await runQuery(
      `INSERT INTO fix_proposals (id, analysis_id, original_code, corrected_code, diff_summary, is_accepted)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [fixId, analysisId, code, aiDiag.correctedCode, aiDiag.diffSummary, 0]
    );

    res.json({
      id: analysisId,
      language,
      healthScore: analysis.healthScore,
      metrics: analysis.metrics,
      findings: analysis.findings,
      aiDiagnostics: aiDiag,
      fixProposal: {
        id: fixId,
        originalCode: code,
        correctedCode: aiDiag.correctedCode,
        diffSummary: aiDiag.diffSummary,
        isAccepted: false
      }
    });
  } catch (err) {
    console.error('Error analyzing code:', err);
    res.status(500).json({ error: err.message || 'Analysis engine encountered an error.' });
  }
});

// 2. Isolated Validation Runner API (Stage 6)
app.post('/api/validate', async (req, res) => {
  try {
    const { code, language = 'javascript', analysisId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code to validate is required.' });
    }

    const report = await validateCode(code, language);

    if (analysisId) {
      const valId = 'val-' + crypto.randomUUID().slice(0, 8);
      await runQuery(
        `INSERT INTO validation_reports (id, analysis_id, passed, runtime, output_logs, duration_ms, tests_passed, tests_total)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [valId, analysisId, report.passed ? 1 : 0, report.runtime, report.outputLogs, report.durationMs, report.testsPassed, report.testsTotal]
      );
    }

    res.json(report);
  } catch (err) {
    console.error('Validation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 3. Project ZIP Upload Analysis API (Stage 7)
app.post('/api/analyze/project', upload.single('projectZip'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a valid .zip file.' });
    }

    const result = await analyzeProjectZip(req.file.buffer, req.file.originalname);
    const analysisId = 'proj-' + crypto.randomUUID().slice(0, 8);

    await runQuery(
      `INSERT INTO analyses (id, type, title, language, code_snippet, health_score, findings_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [analysisId, 'project', result.projectName, 'multi-file', `Files: ${result.totalFiles}`, result.overallHealth, result.findings.length, 'completed']
    );

    res.json({
      id: analysisId,
      ...result
    });
  } catch (err) {
    console.error('Project upload error:', err);
    res.status(500).json({ error: err.message || 'Failed to process project archive.' });
  }
});

// 4. Website URL Analysis API (Stage 8)
app.post('/api/analyze/url', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'Website URL is required.' });
    }

    const result = await analyzeWebsiteUrl(url);
    const analysisId = 'url-' + crypto.randomUUID().slice(0, 8);

    await runQuery(
      `INSERT INTO analyses (id, type, title, language, code_snippet, health_score, findings_count, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [analysisId, 'url', url, 'html/web', `Status: ${result.statusCode}`, result.healthScore, result.findingsCount, 'completed']
    );

    res.json({
      id: analysisId,
      ...result
    });
  } catch (err) {
    console.error('URL inspection error:', err);
    res.status(400).json({ error: err.message || 'URL inspection failed.' });
  }
});

// 5. Accept / Reject Fix Proposal (Stage 5)
app.post('/api/fixes/:fixId/accept', async (req, res) => {
  try {
    const { fixId } = req.params;
    const { accepted = true } = req.body;

    await runQuery(`UPDATE fix_proposals SET is_accepted = ? WHERE id = ?`, [accepted ? 1 : 0, fixId]);
    res.json({ success: true, isAccepted: accepted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Recent Analyses History (Stage 9 - No Account Needed)
app.get('/api/history', async (req, res) => {
  try {
    const rows = await getAll(`SELECT * FROM analyses ORDER BY created_at DESC LIMIT 20`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear History
app.delete('/api/history', async (req, res) => {
  try {
    await runQuery(`DELETE FROM findings`);
    await runQuery(`DELETE FROM fix_proposals`);
    await runQuery(`DELETE FROM validation_reports`);
    await runQuery(`DELETE FROM analyses`);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server locally
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`⚡ Aether Audit Backend running on http://localhost:${PORT}`);
  });
}

export default app;
