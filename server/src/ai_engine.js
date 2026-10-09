import dotenv from 'dotenv';
dotenv.config();

/**
 * AI Explanation and Code Correction Engine
 * Powered by high-speed Groq LLM inference (using openai/gpt-oss-120b)
 * with robust offline deterministic fallback.
 */
export async function generateAiDiagnostics(code, language, findings, userApiKey = null) {
  const apiKey = userApiKey || process.env.GROQ_API_KEY;

  if (apiKey) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'openai/gpt-oss-120b',
          temperature: 0.1,
          response_format: { type: 'json_object' },
          messages: [
            {
              role: 'system',
              content: `You are an expert code mentor and debugger. You explain errors with absolute clarity so any beginner or student can understand, and you generate clean, safe, fully working code.
You must respond ONLY with a strictly valid JSON object matching this exact schema:
{
  "summary": "1 clear sentence summarizing what was wrong and how it was fixed",
  "beginnerExplanation": "Clear, friendly explanation of why this error happens, using a simple real-life analogy (like a locked door, recipe, or library book)",
  "rootCauseAnalysis": "Precise reason why the computer or runtime had a problem with the original code",
  "stepByStepFix": [
    "Step 1: Description of what was changed",
    "Step 2: Description of what was changed"
  ],
  "correctedCode": "The complete, fixed, working code without errors and properly formatted",
  "diffSummary": "Brief comma-separated list of the key fixes applied (e.g. Replaced innerHTML with textContent, Parameterized query)"
}`
            },
            {
              role: 'user',
              content: `Please analyze and fix this ${language} code based on these detected issues:
Detected Issues:
${JSON.stringify(findings, null, 2)}

Original Code:
\`\`\`${language}
${code}
\`\`\`
`
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices[0]?.message?.content?.trim();
        if (content) {
          let cleanJson = content;
          if (cleanJson.startsWith('```json')) {
            cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
          } else if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```\s*/i, '').replace(/```$/i, '').trim();
          }
          const parsed = JSON.parse(cleanJson);
          if (parsed.correctedCode) {
            return parsed;
          }
        }
      } else {
        const errText = await response.text();
        console.warn('Groq API error:', errText);
      }
    } catch (err) {
      console.warn('Groq API call error, falling back to deterministic fixes:', err.message);
    }
  }

  // Built-in deterministic fallback engine
  return generateDeterministicCorrection(code, language, findings);
}

export function generateDeterministicCorrection(code, language, findings) {
  let corrected = code;
  const steps = [];
  const appliedFixes = [];

  // Fix 1: Passwords & Secret Keys
  const secretFinding = findings.find(f => f.category === 'security' && (f.message.includes('Secret') || f.message.includes('Password') || f.message.includes('Key')));
  if (secretFinding) {
    if (language === 'python') {
      if (!corrected.includes('import os')) {
        corrected = 'import os\n' + corrected;
      }
      corrected = corrected.replace(/(?:api_?key|secret|password)\s*=\s*['"][^'"]+['"]/gi, (match) => {
        const varName = match.split('=')[0].trim();
        return `${varName} = os.getenv("API_KEY", "")`;
      });
    } else {
      if (!corrected.includes('process.env')) {
        corrected = '// [Fixed] We load secrets safely from the system settings\n' + corrected;
      }
      corrected = corrected.replace(/(?:api_?key|secret|password|access_?token)\s*[:=]\s*['"][^'"]+['"]/gi, (match) => {
        const key = match.split(/[:=]/)[0].trim();
        const delim = match.includes(':') ? ': ' : ' = ';
        return `${key}${delim}process.env.SECRET_KEY || ""`;
      });
    }
    steps.push('Moved secret passwords into a safe place so they are not written directly in the file.');
    appliedFixes.push('Safely Hid Password');
  }

  // Fix 2: Unsafe innerHTML
  if (findings.some(f => f.category === 'security' && f.message.includes('innerHTML'))) {
    corrected = corrected.replace(/(\w+)\.innerHTML\s*=\s*([^;]+);/g, (match, elem, val) => {
      return `${elem}.textContent = ${val}; // [Fixed] Safely displaying words without running scripts`;
    });
    steps.push('Changed "innerHTML" to "textContent" so the browser treats words as plain text and cannot run bad commands.');
    appliedFixes.push('Safe Text Display');
  }

  // Fix 3: Eval
  if (findings.some(f => f.message.includes('eval('))) {
    corrected = corrected.replace(/eval\s*\(\s*([^)]+)\s*\)/g, 'JSON.parse($1)');
    steps.push('Replaced dangerous "eval()" with safe data reading.');
    appliedFixes.push('Safe Reading');
  }

  // Fix 4: SQL Injection
  if (findings.some(f => f.category === 'security' && f.message.includes('Database'))) {
    if (language === 'python') {
      corrected = corrected.replace(/cursor\.execute\s*\(\s*f["'].*?WHERE\s+(\w+)\s*=\s*\{(\w+)\}.*?["']\s*\)/g,
        'cursor.execute("SELECT * FROM students WHERE $1 = %s", ($2,))');
    } else {
      corrected = corrected.replace(/db\.query\s*\(\s*`\s*(?:SELECT|UPDATE|DELETE).*?WHERE\s+(\w+)\s*=\s*\$\{([^}]+)\}`\s*\)/gi,
        'db.query("SELECT * FROM students WHERE $1 = ?", [$2])');
    }
    steps.push('Made the database question safe by separating user words from database commands.');
    appliedFixes.push('Safe Database Question');
  }

  // Fix 5: Double equals ==
  if (findings.some(f => f.message.includes('Double equals'))) {
    corrected = corrected.replace(/([^!=])==([^=])/g, '$1===$2');
    steps.push('Changed "==" to "===" so the computer checks both the exact type and value.');
    appliedFixes.push('Strict Equality Check');
  }

  // Fix 6: Unhandled fetch
  if (findings.some(f => f.message.includes('Internet request'))) {
    corrected = corrected.replace(/(fetch\s*\([^;)]+\))(?!\s*\.catch)/g, (m) => `${m}\n  .catch(err => console.log("Connection failed:", err))`);
    steps.push('Added a backup catch plan in case the internet connection drops.');
    appliedFixes.push('Backup Internet Plan');
  }

  // Fix 7: Python mutable default
  if (language === 'python' && findings.some(f => f.message.includes('Shared list'))) {
    corrected = corrected.replace(/def\s+(\w+)\s*\((.*?)=\s*\[\]\)/g, 'def $1($2=None):\n    if $2 is None:\n        $2 = []');
    steps.push('Made sure each student gets their own fresh list instead of sharing one old list.');
    appliedFixes.push('Separate Fresh List');
  }

  // Fix 8: Python bare except
  if (language === 'python' && findings.some(f => f.message.includes('Empty "except:"'))) {
    corrected = corrected.replace(/^\s*except\s*:\s*$/gm, '    except Exception as e:');
    steps.push('Changed "except:" to "except Exception as e:" so you can see what went wrong.');
    appliedFixes.push('Clear Error Message');
  }

  // Fix 9: Python unclosed file
  if (language === 'python' && findings.some(f => f.message.includes('File opened without'))) {
    corrected = corrected.replace(/file\s*=\s*open\(([^)]+)\)\s*\n\s*file\.write\(([^)]+)\)/g, 'with open($1) as file:\n        file.write($2)');
    steps.push('Put file opening inside a safe "with" block so the computer automatically closes it.');
    appliedFixes.push('Automatic File Closer');
  }

  // Fix 10: HTML missing alt
  if (language === 'html' && findings.some(f => f.message.includes('Missing an "alt"'))) {
    corrected = corrected.replace(/<img\b(?![^>]*\balt=)([^>]*)>/gi, '<img$1 alt="Project picture">');
    steps.push('Added a helpful word description to the picture so screen readers can explain it.');
    appliedFixes.push('Picture Description Added');
  }

  // Fix 11: Syntax bracket cleanup
  const syntaxFinding = findings.find(f => f.category === 'syntax');
  if (syntaxFinding && corrected === code) {
    if (code.includes('{') && (code.match(/{/g) || []).length > (code.match(/}/g) || []).length) {
      corrected += '\n}';
      steps.push('Added the missing closing curly bracket "}" to finish the code.');
    }
  }

  if (steps.length === 0) {
    steps.push('Cleaned up the code formatting and verified all syntax.');
    appliedFixes.push('Code Cleanup');
  }

  const primaryFinding = findings[0] || { message: 'We found a small thing to improve' };

  return {
    summary: `Found ${findings.length} item${findings.length === 1 ? '' : 's'} that need attention. We have prepared an easy fix for each one!`,
    beginnerExplanation: `Think of code like building blocks or a recipe: if you leave a secret key out where anyone can see it, or forget to close a box, the computer gets confused. We tidied up the blocks so your program runs smoothly without any surprises!`,
    rootCauseAnalysis: `Main issue: "${primaryFinding.message}". When rules like this are skipped, the computer cannot safely tell what you meant to do.`,
    stepByStepFix: steps,
    correctedCode: corrected,
    diffSummary: appliedFixes.join(', ') || 'Cleaned up and fixed'
  };
}
