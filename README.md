# code

A high-performance autonomous code auditing and remediation platform powered by static AST parsing, isolated sandboxed execution, and Groq LLM inference.

## Features

- **Code Auditor**: Multi-language code editor with real-time error detection, forensic root cause analysis, and step-by-step beginner-friendly guidance.
- **Automated Fix Proposals**: Generates clean, corrected code with an interactive side-by-side / unified diff inspector.
- **Isolated Sandbox Runner**: Safely executes code in isolated child processes with resource caps (CPU time and memory).
- **Project ZIP Scanner**: Unpacks and audits multi-file ZIP archives with ZipSlip protection and dependency manifest mapping.
- **Web URL Inspector**: Inspects public website URLs for security headers (CSP, HSTS), mixed content, and browser-visible problems with strict SSRF protection.
- **Local Audit Ledger**: Stores audit records in a local SQLite database without requiring user accounts or logins.
- **Customizable Preferences**: Built-in settings for editor font size, tab spacing, line numbers, and strictness policy.

## Architecture

- **Frontend**: Vite + React + TypeScript + Tailwind CSS + Lucide Icons (Pure Light Mode).
- **Backend**: Express + SQLite3 + AdmZip + Multer + Groq LLM integration (`openai/gpt-oss-120b`).

## Quick Start

### 1. Install Dependencies
```bash
# In the root directory:
npm run server  # starts backend on http://localhost:4000
npm run client  # starts frontend on http://127.0.0.1:5173
```

### 2. Configure Environment
Copy `server/.env.example` to `server/.env` and add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
PORT=4000
```
