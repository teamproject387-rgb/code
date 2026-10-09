import React from 'react';
import { HeartPulse, AlertCircle, FileText, Play, CheckCircle } from 'lucide-react';

interface StatsBarProps {
  healthScore: number;
  totalFindings: number;
  totalLines: number;
  onRunValidation: () => void;
  isValidating: boolean;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  healthScore,
  totalFindings,
  totalLines,
  onRunValidation,
  isValidating
}) => {
  const isGood = healthScore >= 80;
  const isMedium = healthScore >= 50 && healthScore < 80;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* 1. Health Score */}
      <div className="light-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className="flex items-center gap-1.5">
            <HeartPulse className="w-4 h-4 text-rose-500" />
            <span>Health Score</span>
          </span>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              isGood
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isMedium
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {isGood ? 'Healthy' : isMedium ? 'Needs Care' : 'Action Needed'}
          </span>
        </div>

        <div className="flex items-baseline gap-1 my-1">
          <span className="text-3xl font-extrabold text-slate-900">{healthScore}</span>
          <span className="text-sm font-semibold text-slate-400">/ 100</span>
        </div>

        {/* Real Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isGood
                ? 'bg-emerald-500'
                : isMedium
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${Math.max(5, healthScore)}%` }}
          ></div>
        </div>
      </div>

      {/* 2. Problems Found */}
      <div className="light-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            <span>Problems Found</span>
          </span>
          <span className="text-[11px] text-slate-400">Exact Count</span>
        </div>

        <div className="my-1">
          <div className="text-3xl font-extrabold text-slate-900">{totalFindings}</div>
          <div className="text-xs text-slate-500 mt-1">
            {totalFindings === 0
              ? 'Great job! Zero issues found.'
              : `${totalFindings} item${totalFindings === 1 ? '' : 's'} to look at below.`}
          </div>
        </div>
      </div>

      {/* 3. Lines of Code */}
      <div className="light-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-blue-500" />
            <span>Lines of Code</span>
          </span>
          <span className="text-[11px] text-slate-400">Real Size</span>
        </div>

        <div className="my-1">
          <div className="text-3xl font-extrabold text-slate-900">{totalLines}</div>
          <div className="text-xs text-slate-500 mt-1">
            Total lines typed in this file.
          </div>
        </div>
      </div>

      {/* 4. Safe Sandbox Test Button */}
      <div className="light-card p-4 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
          <span className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Safe Test Runner</span>
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">Ready</span>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          Runs your code in a safe sandbox to verify it works without crashing.
        </p>

        <button
          onClick={onRunValidation}
          disabled={isValidating}
          className="btn-primary w-full py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {isValidating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              <span>Testing Code...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Test My Code Now</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
