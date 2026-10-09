import React, { useState } from 'react';
import { diffLines } from 'diff';
import type { Change } from 'diff';
import { Check, Copy, Split, AlignLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface DiffComparisonViewProps {
  originalCode: string;
  correctedCode: string;
  diffSummary: string;
  stepByStepFix: string[];
  onAcceptFix: (fixedCode: string) => void;
  onRejectFix: () => void;
  isAccepted: boolean;
}

export const DiffComparisonView: React.FC<DiffComparisonViewProps> = ({
  originalCode,
  correctedCode,
  diffSummary,
  stepByStepFix,
  onAcceptFix,
  onRejectFix,
  isAccepted
}) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const [copied, setCopied] = useState(false);

  const changes: Change[] = diffLines(originalCode, correctedCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(correctedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAccept = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.8 }
      });
    } catch (e) {}
    onAcceptFix(correctedCode);
  };

  const originalLines = originalCode.split('\n');
  const correctedLines = correctedCode.split('\n');

  return (
    <div className="light-card overflow-hidden mb-6 border border-emerald-200">
      
      {/* Header Bar */}
      <div className="p-4 bg-emerald-50/60 border-b border-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Proposed Fix: Compare Before & After</span>
              {isAccepted && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Fix Applied
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600">
              {diffSummary || 'Targeted adjustments made to clean up problems.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
            <button
              onClick={() => setViewMode('split')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'split' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Side-by-side comparison"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-medium">Side by Side</span>
            </button>
            <button
              onClick={() => setViewMode('unified')}
              className={`p-1.5 rounded text-xs flex items-center gap-1 cursor-pointer transition-all ${
                viewMode === 'unified' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Combined line list"
            >
              <AlignLeft className="w-3.5 h-3.5" />
              <span className="hidden md:inline font-medium">List</span>
            </button>
          </div>

          <button
            onClick={handleCopy}
            className="btn-secondary px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Code'}</span>
          </button>

          {!isAccepted ? (
            <button
              onClick={handleAccept}
              className="btn-success px-4 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Apply Fix to My Code</span>
            </button>
          ) : (
            <button
              onClick={onRejectFix}
              className="btn-secondary px-3 py-1.5 rounded-lg text-xs cursor-pointer text-slate-600"
            >
              Revert to Original
            </button>
          )}
        </div>
      </div>

      {/* Step by Step Breakdown */}
      {stepByStepFix && stepByStepFix.length > 0 && (
        <div className="p-3.5 bg-slate-50 border-b border-slate-200">
          <div className="text-xs font-bold text-slate-800 mb-1.5">
            What was changed in this fix:
          </div>
          <ul className="text-xs text-slate-600 space-y-1">
            {stepByStepFix.map((step, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-700 font-bold">✓ Step {idx + 1}:</span>
                <span>{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Code Comparison Content */}
      <div className="p-4 bg-white overflow-x-auto font-mono text-xs max-h-[460px] overflow-y-auto">
        {viewMode === 'split' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Before (Original) */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/20 p-3">
              <div className="text-[11px] font-bold text-rose-700 pb-2 border-b border-rose-200 mb-2 flex items-center justify-between">
                <span>BEFORE (Original Code with Problems)</span>
                <span className="text-[10px] bg-rose-100 px-2 py-0.5 rounded text-rose-800 font-medium">Needs Attention</span>
              </div>
              <div className="space-y-1">
                {originalLines.map((line, idx) => (
                  <div key={idx} className="flex gap-2 text-slate-700 hover:bg-rose-100/30 px-1 rounded">
                    <span className="w-6 text-right select-none text-slate-400 font-mono">{idx + 1}</span>
                    <pre className="font-mono whitespace-pre">{line}</pre>
                  </div>
                ))}
              </div>
            </div>

            {/* After (Corrected) */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/20 p-3">
              <div className="text-[11px] font-bold text-emerald-700 pb-2 border-b border-emerald-200 mb-2 flex items-center justify-between">
                <span>AFTER (Clean Fixed Code)</span>
                <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded text-emerald-800 font-medium">Fixed & Safe</span>
              </div>
              <div className="space-y-1">
                {correctedLines.map((line, idx) => (
                  <div key={idx} className="flex gap-2 text-emerald-900 bg-emerald-100/50 px-1 rounded">
                    <span className="w-6 text-right select-none text-emerald-600 font-mono">{idx + 1}</span>
                    <pre className="font-mono whitespace-pre font-medium">{line}</pre>
                  </div>
                ))}
              </div>
            </div>

          </div>
        ) : (
          /* Unified List */
          <div className="space-y-0.5 leading-relaxed">
            {changes.map((part, index) => {
              const lines = part.value.replace(/\n$/, '').split('\n');
              return lines.map((line, lIndex) => {
                if (part.added) {
                  return (
                    <div
                      key={`${index}-${lIndex}`}
                      className="bg-emerald-50 text-emerald-900 px-3 py-1 rounded flex items-start gap-3 border-l-3 border-emerald-500"
                    >
                      <span className="select-none text-emerald-600 font-bold w-4">+</span>
                      <pre className="font-mono whitespace-pre">{line}</pre>
                    </div>
                  );
                }
                if (part.removed) {
                  return (
                    <div
                      key={`${index}-${lIndex}`}
                      className="bg-rose-50 text-rose-800 px-3 py-1 rounded flex items-start gap-3 border-l-3 border-rose-500 line-through opacity-75"
                    >
                      <span className="select-none text-rose-500 font-bold w-4">-</span>
                      <pre className="font-mono whitespace-pre">{line}</pre>
                    </div>
                  );
                }
                return (
                  <div
                    key={`${index}-${lIndex}`}
                    className="text-slate-600 px-3 py-0.5 flex items-start gap-3 hover:bg-slate-50"
                  >
                    <span className="select-none text-slate-300 w-4 font-mono"> </span>
                    <pre className="font-mono whitespace-pre">{line}</pre>
                  </div>
                );
              });
            })}
          </div>
        )}
      </div>

    </div>
  );
};
