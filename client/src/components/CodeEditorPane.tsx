import React, { useRef } from 'react';
import type { AppSettings } from '../types';
import { Search, Sparkles, RotateCcw, Code, Copy, Check } from 'lucide-react';

interface CodeEditorPaneProps {
  code: string;
  setCode: (code: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onApplyFix: () => void;
  hasFixAvailable: boolean;
  activeLine?: number | null;
  settings: AppSettings;
}

export const CodeEditorPane: React.FC<CodeEditorPaneProps> = ({
  code,
  setCode,
  language,
  setLanguage,
  onAnalyze,
  isAnalyzing,
  onApplyFix,
  hasFixAvailable,
  activeLine,
  settings
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = React.useState(false);

  const lines = code.split('\n');
  const lineCount = lines.length;

  const handleScroll = () => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="light-card overflow-hidden flex flex-col h-full shadow-sm">
      
      {/* Top Professional Toolbar */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Language Selection */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 text-xs shadow-sm">
            <Code className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-slate-500 font-medium">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-transparent text-slate-900 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="javascript">JavaScript (V8)</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python 3.12</option>
              <option value="html">HTML5</option>
              <option value="css">CSS3</option>
              <option value="sql">SQL</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {hasFixAvailable && (
            <button
              onClick={onApplyFix}
              className="btn-success px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Apply fixed code directly into the editor"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Apply Fix</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="btn-secondary px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => setCode('')}
            className="btn-secondary px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
            title="Clear all code"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={onAnalyze}
            disabled={isAnalyzing || !code.trim()}
            className="btn-primary px-4 py-1.5 rounded-lg text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Analyzing Code...</span>
              </>
            ) : (
              <>
                <Search className="w-3.5 h-3.5" />
                <span>Run Code Analysis</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Editor Textarea with Line Numbers */}
      <div 
        className="relative flex-1 bg-white flex min-h-[420px] font-mono"
        style={{ fontSize: settings.fontSize }}
      >
        
        {/* Line Numbers Column */}
        {settings.showLineNumbers && (
          <div
            ref={lineNumbersRef}
            className="select-none bg-slate-50 text-slate-400 px-3 py-3 text-right border-r border-slate-200 overflow-hidden flex flex-col items-end min-w-[46px]"
          >
            {Array.from({ length: Math.max(1, lineCount) }).map((_, idx) => {
              const lineNum = idx + 1;
              const isHighlighted = activeLine === lineNum;
              return (
                <div
                  key={idx}
                  className={`leading-5 text-[11px] h-5 transition-colors ${
                    isHighlighted ? 'text-amber-700 font-bold bg-amber-100 px-1 rounded' : ''
                  }`}
                >
                  {lineNum}
                </div>
              );
            })}
          </div>
        )}

        {/* Textarea */}
        <div className="relative flex-1">
          <textarea
            ref={textareaRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onScroll={handleScroll}
            placeholder="// Paste or type your code here..."
            spellCheck={false}
            className="w-full h-full bg-white text-slate-900 p-3 focus:outline-none resize-none font-mono leading-5 whitespace-pre overflow-auto"
            style={{ tabSize: settings.tabSize }}
          />
        </div>

      </div>

      {/* Footer Info */}
      <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div>
          <span>{lineCount} lines</span>
          <span className="mx-2">•</span>
          <span>{code.length} characters</span>
        </div>
        <div className="text-slate-500 font-sans">
          {code.trim() ? 'Ready for analysis' : 'Editor empty'}
        </div>
      </div>

    </div>
  );
};
