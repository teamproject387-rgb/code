import AdmZip from 'adm-zip';
import path from 'path';
import { analyzeCode, detectLanguage } from './analyzer.js';

/**
 * Project Upload Analysis Engine
 * Extracts ZIP files safely (ZipSlip protection), analyzes multi-file trees,
 * parses package manifests, maps dependencies, and checks for project-level vulnerabilities.
 */
export async function analyzeProjectZip(zipBuffer, originalFilename = 'project.zip') {
  const zip = new AdmZip(zipBuffer);
  const zipEntries = zip.getEntries();

  const fileTree = [];
  const analyzedFiles = [];
  const dependencies = {
    runtime: [],
    dev: [],
    packageManager: 'unknown',
    manifestFound: false
  };

  let totalLinesOfCode = 0;
  const projectFindings = [];

  // 1. Process entries safely
  for (const entry of zipEntries) {
    // ZipSlip protection: ensure entry does not contain '..' or absolute paths
    const normalizedPath = path.normalize(entry.entryName).replace(/^(\.\.[\/\\])+/, '');
    if (normalizedPath.includes('..') || path.isAbsolute(normalizedPath)) {
      continue; // Skip dangerous entries
    }

    if (entry.isDirectory) {
      fileTree.push({
        path: normalizedPath,
        isDirectory: true,
        size: 0
      });
      continue;
    }

    // Skip node_modules, .git, and binary blobs
    if (normalizedPath.includes('node_modules') || normalizedPath.includes('.git') || normalizedPath.includes('__pycache__')) {
      continue;
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const isText = ['.js', '.jsx', '.ts', '.tsx', '.py', '.html', '.css', '.json', '.sql', '.md', '.txt', '.yaml', '.yml'].includes(ext);

    fileTree.push({
      path: normalizedPath,
      isDirectory: false,
      size: entry.header.size,
      extension: ext
    });

    if (!isText || entry.header.size > 1024 * 512) {
      continue; // Skip large or binary files
    }

    const content = entry.getData().toString('utf8');
    const linesCount = content.split('\n').length;
    totalLinesOfCode += linesCount;

    // 2. Check for dependency manifests
    const baseName = path.basename(normalizedPath).toLowerCase();
    if (baseName === 'package.json') {
      try {
        const pkg = JSON.parse(content);
        dependencies.manifestFound = true;
        dependencies.packageManager = 'npm/yarn/pnpm';
        dependencies.projectName = pkg.name || 'unnamed-project';
        dependencies.version = pkg.version || '1.0.0';

        if (pkg.dependencies) {
          dependencies.runtime = Object.entries(pkg.dependencies).map(([name, ver]) => ({ name, version: ver }));
        }
        if (pkg.devDependencies) {
          dependencies.dev = Object.entries(pkg.devDependencies).map(([name, ver]) => ({ name, version: ver }));
        }
      } catch (e) {
        // malformed package.json
      }
    } else if (baseName === 'requirements.txt') {
      dependencies.manifestFound = true;
      dependencies.packageManager = 'pip';
      const lines = content.split('\n');
      lines.forEach(l => {
        const trimmed = l.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const parts = trimmed.split(/[==|>=|<=]/);
          dependencies.runtime.push({
            name: parts[0].trim(),
            version: parts[1] ? parts[1].trim() : 'latest'
          });
        }
      });
    }

    // 3. Analyze code file
    const lang = detectLanguage(content, normalizedPath);
    if (['javascript', 'typescript', 'python', 'html', 'css', 'sql'].includes(lang)) {
      const fileAnalysis = analyzeCode(content, lang);
      if (fileAnalysis.findings.length > 0) {
        fileAnalysis.findings.forEach(f => {
          projectFindings.push({
            ...f,
            file: normalizedPath
          });
        });
      }

      analyzedFiles.push({
        path: normalizedPath,
        language: lang,
        lines: linesCount,
        findingsCount: fileAnalysis.findings.length,
        healthScore: fileAnalysis.healthScore,
        contentPreview: content.slice(0, 300)
      });
    }
  }

  // Calculate Overall Project Health Score
  let deductions = 0;
  projectFindings.forEach(f => {
    if (f.severity === 'critical') deductions += 20;
    else if (f.severity === 'error') deductions += 10;
    else if (f.severity === 'warning') deductions += 4;
    else deductions += 1;
  });

  const overallHealth = Math.max(15, Math.min(100, 100 - deductions));

  return {
    projectName: originalFilename.replace(/\.zip$/i, ''),
    totalFiles: fileTree.filter(f => !f.isDirectory).length,
    analyzedFilesCount: analyzedFiles.length,
    totalLinesOfCode,
    overallHealth,
    dependencies,
    fileTree,
    analyzedFiles,
    findings: projectFindings,
    findingsSummary: {
      critical: projectFindings.filter(f => f.severity === 'critical').length,
      error: projectFindings.filter(f => f.severity === 'error').length,
      warning: projectFindings.filter(f => f.severity === 'warning').length,
      info: projectFindings.filter(f => f.severity === 'info').length
    }
  };
}
