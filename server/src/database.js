import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.resolve(__dirname, '../aether_audit.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err);
  } else {
    console.log('Connected to SQLite database at', dbPath);
  }
});

// Initialize tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      language TEXT,
      code_snippet TEXT,
      health_score INTEGER DEFAULT 100,
      findings_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS findings (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      severity TEXT NOT NULL,
      category TEXT NOT NULL,
      message TEXT NOT NULL,
      line INTEGER,
      column INTEGER,
      explanation TEXT,
      root_cause TEXT,
      suggestion TEXT,
      FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS fix_proposals (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      original_code TEXT NOT NULL,
      corrected_code TEXT NOT NULL,
      diff_summary TEXT,
      is_accepted INTEGER DEFAULT 0,
      FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS validation_reports (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      passed INTEGER NOT NULL,
      runtime TEXT,
      output_logs TEXT,
      duration_ms INTEGER,
      tests_passed INTEGER DEFAULT 0,
      tests_total INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (analysis_id) REFERENCES analyses (id) ON DELETE CASCADE
    )
  `);
});

export const runQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
};

export const getOne = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

export const getAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

export default db;
