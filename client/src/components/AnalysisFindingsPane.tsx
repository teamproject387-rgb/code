import React, { useState } from 'react';
import type { Finding, AiDiagnostics } from '../types';
import { AlertCircle, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle, Info, Terminal } from 'lucide-react';

interface AnalysisFindingsPaneProps {
  findings: Finding[];
  aiDiagnostics?: AiDiagnostics;
  onSelectLine?: (line: number) => void;
  hasRunAnalysis: boolean;
}

export const AnalysisFindingsPane: React.FC<AnalysisFindingsPaneProps> = ({
  findings,
  aiDiagnostics,
  onSelectLine,
  hasRunAnalysis
}) => {
  const [filter, setFilter] = useState<'all' | 'critical' | 'warning' | 'info'>('all');
  const [expandedId, setExpandedId] = useState<string | null>(findings[0]?.id || null);

  const filteredFindings = findings.filter(f => {
    if (filter === 'all') return true;
    if (filter === 'critical') return f.severity === 'critical' || f.severity === 'error';
    return f.severity === filter;
  });

  if (!hasRunAnalysis) {
    return (
      <div className="light-card p-8 text-center h-full flex flex-col items-center justify-center min-h-[350px]">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mb-3">
          <Terminal className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-slate-800 mb-1">
          Awaiting Code Input
        </h3>
        <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
          Type or paste code into the editor on the left and click "Run Code Analysis" to inspect for faults, security risks, and automatic corrections.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* 1. Diagnostic Summary Card */}
      {aiDiagnostics && (
        <div className="light-card p-5 bg-gradient-to-br from-blue-50/60 via-white to-slate-50/40 border border-blue-200">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Diagnostic Analysis Summary
              </h3>
              <p className="text-xs text-slate-500">
                Detailed root cause and remediation overview
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3.5 border border-blue-100 shadow-sm space-y-1.5 mb-3">
            <div className="text-xs font-semibold text-blue-900">
              Clear Explanation:
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {aiDiagnostics.beginnerExplanation}
            </p>
          </div>

          {aiDiagnostics.rootCauseAnalysis && (
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-1">
              <div className="text-xs font-semibold text-slate-800">
                Technical Root Cause:
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {aiDiagnostics.rootCauseAnalysis}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. Detected Issues List */}
      <div className="light-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-slate-700" />
            <h4 className="text-sm font-bold text-slate-900">
              Detected Issues ({findings.length})
            </h4>
          </div>

          {/* Clean Filter Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({findings.length})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${
                filter === 'critical' ? 'bg-white text-rose-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Errors
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer transition-all ${
                filter === 'warning' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Warnings
            </button>
          </div>
        </div>

        {filteredFindings.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs flex flex-col items-center justify-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            <span className="font-medium text-slate-700">No issues found in this category. Code passed inspection.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFindings.map((finding, idx) => {
              const isExpanded = expandedId === finding.id;
              const isSerious = finding.severity === 'critical' || finding.severity === 'error';

              return (
                <div
                  key={finding.id}
                  className={`rounded-xl border transition-all ${
                    isSerious
                      ? 'bg-rose-50/40 border-rose-200'
                      : finding.severity === 'warning'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : finding.id)}
                    className="p-3.5 flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {isSerious ? (
                          <AlertCircle className="w-4 h-4 text-rose-600" />
                        ) : finding.severity === 'warning' ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                        ) : (
                          <Info className="w-4 h-4 text-blue-600" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">
                            #{idx + 1}. {finding.message}
                          </span>
                          {finding.line && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (finding.line && onSelectLine) onSelectLine(finding.line);
                              }}
                              className="text-[11px] font-mono text-blue-700 hover:underline bg-blue-100/70 px-2 py-0.5 rounded"
                            >
                              Line {finding.line}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-slate-400">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded Explanation & Fix */}
                  {isExpanded && (
                    <div className="px-3.5 pb-3.5 pt-1 space-y-2.5 border-t border-slate-200/60 text-xs">
                      {finding.explanation && (
                        <div>
                          <div className="font-semibold text-slate-700 mb-0.5">Context & Impact:</div>
                          <p className="text-slate-600 leading-relaxed">{finding.explanation}</p>
                        </div>
                      )}

                      {finding.suggestion && (
                        <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                          <div className="font-semibold text-emerald-800 mb-0.5">
                            Recommended Action:
                          </div>
                          <p className="text-emerald-700">{finding.suggestion}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
