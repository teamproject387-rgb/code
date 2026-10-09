import crypto from 'crypto';

export function detectLanguage(code, filename = '') {
  if (filename) {
    const ext = filename.split('.').pop().toLowerCase();
    if (['js', 'jsx', 'mjs'].includes(ext)) return 'javascript';
    if (['ts', 'tsx'].includes(ext)) return 'typescript';
    if (['py'].includes(ext)) return 'python';
    if (['html', 'htm'].includes(ext)) return 'html';
    if (['css'].includes(ext)) return 'css';
    if (['json'].includes(ext)) return 'json';
    if (['sql'].includes(ext)) return 'sql';
    if (['go'].includes(ext)) return 'go';
    if (['rs'].includes(ext)) return 'rust';
    if (['java'].includes(ext)) return 'java';
    if (['c', 'cpp', 'h'].includes(ext)) return 'cpp';
  }

  // Simple heuristic language detection
  const lines = code.split('\n').slice(0, 30).join('\n');
  if (/^\s*<!DOCTYPE html>|<html>|<div|<head|<body/i.test(lines)) return 'html';
  if (/^\s*(\{|\[)\s*[\"\d]/.test(lines) && !/const|let|var|function|def|import/.test(lines)) {
    try {
      JSON.parse(code);
      return 'json';
    } catch (e) {}
  }
  if (/\bdef\s+\w+\s*\(|\bimport\s+[\w\s,]+|\bfrom\s+\w+\s+import|\belif\b|:\s*$/m.test(lines)) return 'python';
  if (/\binterface\s+\w+|\btype\s+\w+\s*=|:\s*(string|number|boolean|any)\b/.test(lines)) return 'typescript';
  if (/\bpackage\s+main|\bfunc\s+\w+\s*\(/.test(lines)) return 'go';
  if (/\bfn\s+main\s*\(|\blet\s+mut\b|impl\s+\w+/.test(lines)) return 'rust';
  if (/\bpublic\s+class\s+\w+|\bSystem\.out\.println/.test(lines)) return 'java';
  if (/\b#include\s+<|\bint\s+main\s*\(/.test(lines)) return 'cpp';
  if (/\bSELECT\b.*?\bFROM\b|\bINSERT\s+INTO\b|\bCREATE\s+TABLE\b/i.test(lines)) return 'sql';
  if (/\bbody\s*\{|\.[\w-]+\s*\{|#[\w-]+\s*\{/i.test(lines)) return 'css';
  return 'javascript';
}

export function analyzeCode(code, language = 'javascript') {
  const findings = [];
  const lines = code.split('\n');

  // Universal Checks: Passwords & Secret Keys left in code
  const secretPatterns = [
    { regex: /(?:api_?key|secret|password|access_?token|auth_?token|private_?key)\s*[:=]\s*['"]([a-zA-Z0-9_\-\.]{16,})['"]/i, title: 'Secret Password / API Key left out in the open' },
    { regex: /['"](?:sk_live_[0-9a-zA-Z]{24,}|ghp_[0-9a-zA-Z]{36}|AIza[0-9A-Za-z-_]{35})['"]/, title: 'Live Secret Token found in code' }
  ];

  lines.forEach((lineText, idx) => {
    secretPatterns.forEach(sp => {
      const match = lineText.match(sp.regex);
      if (match) {
        findings.push({
          id: `sec-${idx + 1}-${crypto.randomUUID().slice(0, 4)}`,
          severity: 'critical',
          category: 'security',
          message: sp.title,
          line: idx + 1,
          column: match.index + 1,
          explanation: 'You left a real secret password or key written directly in the file. Anyone who opens or copies your file can see it and use your account!',
          root_cause: 'Passwords should be kept in a private hidden locker (called an environment variable), not written directly in code.',
          suggestion: 'Store this key in a separate private `.env` file and read it safely without showing the actual password.'
        });
      }
    });
  });

  // Language Specific Analysis
  if (language === 'javascript' || language === 'typescript') {
    analyzeJavaScript(code, lines, findings);
  } else if (language === 'python') {
    analyzePython(code, lines, findings);
  } else if (language === 'html') {
    analyzeHTML(code, lines, findings);
  } else if (language === 'css') {
    analyzeCSS(code, lines, findings);
  } else if (language === 'sql') {
    analyzeSQL(code, lines, findings);
  }

  // Calculate Real, Honest Health Score based purely on issue severity
  let penalty = 0;
  findings.forEach(f => {
    if (f.severity === 'critical') penalty += 25;
    else if (f.severity === 'error') penalty += 15;
    else if (f.severity === 'warning') penalty += 8;
    else if (f.severity === 'info') penalty += 3;
  });

  const healthScore = Math.max(0, Math.min(100, 100 - penalty));

  return {
    language,
    healthScore,
    findings,
    findingsCount: findings.length,
    metrics: {
      totalLines: lines.length,
      characterCount: code.length,
      criticalCount: findings.filter(f => f.severity === 'critical').length,
      errorCount: findings.filter(f => f.severity === 'error').length,
      warningCount: findings.filter(f => f.severity === 'warning').length,
      infoCount: findings.filter(f => f.severity === 'info').length
    }
  };
}

function analyzeJavaScript(code, lines, findings) {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) continue;

    // Check innerHTML
    if (/\.innerHTML\s*=/.test(line) && !/sanitize|DOMPurify|escape/i.test(line)) {
      findings.push({
        id: `xss-${i + 1}`,
        severity: 'critical',
        category: 'security',
        message: 'Unsafe display: using innerHTML can let strangers run bad code',
        line: i + 1,
        column: line.indexOf('.innerHTML') + 1,
        explanation: 'When you use "innerHTML", the browser treats user words like computer programs. If a user enters special words like <script>, the computer will accidentally run it!',
        root_cause: 'Directly pasting text into innerHTML bypasses the browser safety shield.',
        suggestion: 'Change ".innerHTML" to ".textContent". This tells the computer to only display plain words, not run programs.'
      });
    }

    // Check eval()
    if (/\beval\s*\(|\bnew\s+Function\s*\(/.test(line)) {
      findings.push({
        id: `eval-${i + 1}`,
        severity: 'critical',
        category: 'security',
        message: 'Dangerous command "eval()" lets any text run as a program',
        line: i + 1,
        column: line.search(/\beval|\bnew Function/) + 1,
        explanation: '"eval()" takes any text and runs it immediately. It is like letting anyone press any button on your computer without asking.',
        root_cause: 'eval() executes arbitrary code strings.',
        suggestion: 'Use "JSON.parse()" if you are reading data, or use simple math instead of eval().'
      });
    }

    // Check SQL concatenation in JS
    if (/(?:SELECT|INSERT|UPDATE|DELETE).*?\+\s*[\w\.]+|['"`]\s*(?:SELECT|INSERT|UPDATE|DELETE).*?\$\{[\w\.]+\}/i.test(line)) {
      findings.push({
        id: `sqli-${i + 1}`,
        severity: 'critical',
        category: 'security',
        message: 'Database mistake: combining text into a SQL question allows data theft',
        line: i + 1,
        column: 1,
        explanation: 'Gluing words together into a database command allows someone to type "OR 1=1" and see everyone’s private data.',
        root_cause: 'Database queries must not combine unverified strings directly.',
        suggestion: 'Use safe parameters with "?" or placeholders so the database knows it is only text, not a command.'
      });
    }

    // Check loose equality ==
    if (/[^!=]==[^=]/.test(line) && !/typeof/.test(line)) {
      findings.push({
        id: `eq-${i + 1}`,
        severity: 'warning',
        category: 'logic',
        message: 'Double equals "==" makes the computer guess types',
        line: i + 1,
        column: line.search(/[^!=]==[^=]/) + 2,
        explanation: 'Using "==" makes the computer guess and convert values. For instance, it thinks the text "0" is equal to the number 0, which causes tricky bugs.',
        root_cause: 'Loose equality allows automatic type conversion.',
        suggestion: 'Change "==" to "===" to make sure both the value and the type match exactly.'
      });
    }

    // Check unhandled fetch
    if (/\bfetch\s*\(/.test(line) && !lines.slice(Math.max(0, i - 2), i + 3).some(l => /\.catch|try\s*\{|\bawait\b/.test(l))) {
      findings.push({
        id: `promise-${i + 1}`,
        severity: 'warning',
        category: 'logic',
        message: 'Internet request has no backup plan if connection drops',
        line: i + 1,
        column: line.indexOf('fetch') + 1,
        explanation: 'If the Wi-Fi turns off or the server is down, this "fetch" will fail silently and freeze your application.',
        root_cause: 'Async network request without an error catcher.',
        suggestion: 'Add ".catch(error => console.log(error))" at the end of fetch so it handles network problems gracefully.'
      });
    }

    // Check setInterval without cleanup
    if (/setInterval\s*\(/.test(line) && !lines.some(l => /clearInterval/.test(l))) {
      findings.push({
        id: `leak-${i + 1}`,
        severity: 'warning',
        category: 'performance',
        message: 'Timer runs continuously and never turns off',
        line: i + 1,
        column: line.indexOf('setInterval') + 1,
        explanation: 'This timer starts ticking and never stops. It slowly uses up the computer’s brain memory and makes the device sluggish.',
        root_cause: 'Timer identifier is not saved or cleared.',
        suggestion: 'Save the timer with "const timer = setInterval(...)" and call "clearInterval(timer)" when finished.'
      });
    }
  }

  // Syntax check
  try {
    new Function(code);
  } catch (err) {
    const matchLine = err.stack ? err.stack.match(/<anonymous>:(\d+):(\d+)/) : null;
    const errLine = matchLine ? parseInt(matchLine[1]) - 2 : 1;
    findings.unshift({
      id: `syn-err-1`,
      severity: 'error',
      category: 'syntax',
      message: `Syntax Error: ${err.message}`,
      line: Math.max(1, errLine),
      column: matchLine ? parseInt(matchLine[2]) : 1,
      explanation: `The computer cannot read your code because there is a grammar mistake: ${err.message}.`,
      root_cause: `The code does not follow proper language rules (like a missing bracket or quote).`,
      suggestion: `Check around line ${Math.max(1, errLine)} for missing brackets like "}", missing parentheses ")", or unclosed quotes.`
    });
  }
}

function analyzePython(code, lines, findings) {
  lines.forEach((line, idx) => {
    // Mutable default argument
    if (/def\s+\w+\s*\([^)]*=\s*(\[\]|\{\})/i.test(line)) {
      findings.push({
        id: `py-mut-${idx + 1}`,
        severity: 'error',
        category: 'logic',
        message: 'Shared list in function: Default list "[]" is remembered across every call',
        line: idx + 1,
        column: line.search(/=\s*(\[\]|\{\})/) + 1,
        explanation: 'In Python, default lists like "[]" are created only once. When one user adds an item, it stays in the list for every future user!',
        root_cause: 'Python evaluates function default arguments once when the program starts.',
        suggestion: 'Set the default to "None", then check "if items is None: items = []" inside your function.'
      });
    }

    // Bare except
    if (/^\s*except\s*:\s*$/.test(line)) {
      findings.push({
        id: `py-except-${idx + 1}`,
        severity: 'warning',
        category: 'logic',
        message: 'Empty "except:" hides all mistakes, even pressing Stop',
        line: idx + 1,
        column: line.indexOf('except') + 1,
        explanation: 'Writing just "except:" swallows every error and stops you from closing the program when you press Ctrl+C.',
        root_cause: 'Catches system signals instead of specific errors.',
        suggestion: 'Change "except:" to "except Exception as e:" so you can see what went wrong.'
      });
    }

    // SQL Injection in python
    if (/f["'].*?(?:SELECT|INSERT|UPDATE|DELETE).*?\{.*?\}/i.test(line) || /(?:SELECT|INSERT|UPDATE|DELETE).*?%\s*\(?/i.test(line)) {
      findings.push({
        id: `py-sqli-${idx + 1}`,
        severity: 'critical',
        category: 'security',
        message: 'Database query uses formatted text: allows data tampering',
        line: idx + 1,
        column: 1,
        explanation: 'Putting variables directly inside a SQL text string lets visitors alter your database questions and view hidden information.',
        root_cause: 'F-strings should never be used to construct database commands.',
        suggestion: 'Use safe parameters: "cursor.execute(\'SELECT * FROM users WHERE id = %s\', (user_id,))".'
      });
    }

    // Unclosed file
    if (/open\s*\([^)]+\)/.test(line) && !/with\s+open/.test(line) && !lines.slice(idx, idx + 10).some(l => /\.close\(\)/.test(l))) {
      findings.push({
        id: `py-file-${idx + 1}`,
        severity: 'warning',
        category: 'performance',
        message: 'File opened without a safe "with" block',
        line: idx + 1,
        column: line.indexOf('open') + 1,
        explanation: 'Opening a file without closing it keeps it locked on your computer, which can waste resources.',
        root_cause: 'File handle left open in memory.',
        suggestion: 'Use "with open(...) as f:" so the computer automatically closes the file when done.'
      });
    }
  });
}

function analyzeHTML(code, lines, findings) {
  lines.forEach((line, idx) => {
    // Missing alt on img
    if (/<img\b(?![^>]*\balt=)[^>]*>/i.test(line)) {
      findings.push({
        id: `html-alt-${idx + 1}`,
        severity: 'warning',
        category: 'a11y',
        message: 'Image is missing an "alt" word description',
        line: idx + 1,
        column: line.indexOf('<img') + 1,
        explanation: 'People who cannot see rely on computers to read pictures out loud. Without an "alt" description, they cannot know what the picture shows.',
        root_cause: 'Missing alt attribute on <img> element.',
        suggestion: 'Add an alt attribute like: <img src="..." alt="Description of picture">.'
      });
    }

    // Insecure HTTP script
    if (/<script[^>]+src=["']http:\/\//i.test(line)) {
      findings.push({
        id: `html-mixed-${idx + 1}`,
        severity: 'critical',
        category: 'security',
        message: 'Using an insecure "http://" web address instead of "https://"',
        line: idx + 1,
        column: line.indexOf('http://') + 1,
        explanation: 'Loading scripts through unencrypted "http://" allows anyone on public Wi-Fi to tamper with the code.',
        root_cause: 'Insecure transport protocol for external script.',
        suggestion: 'Change "http://" to secure "https://".'
      });
    }
  });
}

function analyzeCSS(code, lines, findings) {
  lines.forEach((line, idx) => {
    if (/!important/i.test(line)) {
      findings.push({
        id: `css-imp-${idx + 1}`,
        severity: 'info',
        category: 'performance',
        message: 'Using "!important" makes your style rules hard to change',
        line: idx + 1,
        column: line.indexOf('!important') + 1,
        explanation: '"!important" forces a color or style and makes it very difficult to update or adjust styles later.',
        root_cause: 'Forced CSS cascade override.',
        suggestion: 'Remove "!important" and use a clearer style name instead.'
      });
    }
  });
}

function analyzeSQL(code, lines, findings) {
  if (/SELECT\s+\*\s+FROM/i.test(code)) {
    findings.push({
      id: `sql-star-1`,
      severity: 'info',
      category: 'performance',
      message: '"SELECT *" asks for every single column from the database',
      line: 1,
      column: 1,
      explanation: 'Asking for all columns can slow down the computer if you only need the student\'s name or id.',
      root_cause: 'Wildcard query fetches unnecessary columns.',
      suggestion: 'Name the specific columns you need, like: "SELECT id, name FROM students".'
    });
  }
}
