import React from 'react';
import type { ValidationReport } from '../types';
import { Terminal, CheckCircle2, XCircle, Clock, Play } from 'lucide-react';

interface ValidationTerminalProps {
  report: ValidationReport | null;
  isValidating: boolean;
  onRunValidation: () => void;
}

export const ValidationTerminal: React.FC<ValidationTerminalProps> = ({
  report,
  isValidating,
  onRunValidation
}) => {
  return (
    <div className="light-card overflow-hidden">
      
      {/* Terminal Title Bar */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900">
              Safe Sandbox Test Runner
            </div>
            <p className="text-xs text-slate-500">
              Verifies whether your code compiles and runs without crashing
            </p>
          </div>
        </div>

        {/* Status & Action */}
        <div className="flex items-center gap-3">
          {report && (
            <div className="flex items-center gap-2">
              <span
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  report.passed
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-rose-50 text-rose-800 border-rose-300'
                }`}
              >
                {report.passed ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Passed Safely (Exit 0)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    <span>Failed with Error (Exit {report.exitCode})</span>
                  </>
                )}
              </span>

              <span className="flex items-center gap-1 text-slate-500 text-xs font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>{report.durationMs}ms</span>
              </span>
            </div>
          )}

          <button
            onClick={onRunValidation}
            disabled={isValidating}
            className="btn-primary px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isValidating ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Running Test...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Sandbox Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div className="p-4 bg-slate-900 text-slate-200 font-mono text-xs min-h-[180px] max-h-[320px] overflow-y-auto leading-relaxed">
        <div className="text-slate-400 text-[11px] pb-2 border-b border-slate-800 flex items-center justify-between mb-3">
          <span>// Safe Isolated Execution Runner</span>
          <span>Environment: {report ? report.runtime : 'Isolated Environment'}</span>
        </div>

        {report ? (
          <div>
            <div className="text-emerald-400 text-xs mb-1 font-semibold">
              $ test-runner --check-syntax
            </div>
            <pre className="whitespace-pre-wrap text-slate-300 font-mono text-xs">
              {report.outputLogs}
            </pre>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-xs">
            Click "Run Sandbox Test" above to execute and check your code.
          </div>
        )}
      </div>

    </div>
  );
};
