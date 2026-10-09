import React from 'react';
import type { AnalysisHistoryItem } from '../types';
import { History, Clock, FileCode } from 'lucide-react';

interface HistoryLogPaneProps {
  history: AnalysisHistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const HistoryLogPane: React.FC<HistoryLogPaneProps> = ({
  history,
  isLoading,
  onRefresh
}) => {
  return (
    <div className="light-card p-6 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Past Checks (Saved on your computer)</h3>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs text-blue-600 hover:underline font-semibold cursor-pointer"
        >
          {isLoading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      <p className="text-xs text-slate-500">
        Every time you test code or a website, the results are saved right here in your local database. No login or account required.
      </p>

      {history.length === 0 ? (
        <div className="py-8 text-center text-slate-400 text-xs">
          No past checks yet. Check some code to see your history here!
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs hover:border-slate-300 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[11px]">
                  <FileCode className="w-4 h-4" />
                </div>

                <div>
                  <div className="font-bold text-slate-800">{item.title}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-2">
                    <span className="capitalize">{item.type} check</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                    item.health_score >= 80
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  Score: {item.health_score}%
                </span>

                <span className="text-slate-500 text-xs">
                  {item.findings_count} {item.findings_count === 1 ? 'issue' : 'issues'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
