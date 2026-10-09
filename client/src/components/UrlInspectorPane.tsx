import React, { useState } from 'react';
import type { UrlAnalysisResponse } from '../types';
import { Globe, ArrowRight, ShieldCheck, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';

interface UrlInspectorPaneProps {
  onAnalyzeUrl: (url: string) => void;
  urlResult: UrlAnalysisResponse | null;
  isLoading: boolean;
}

export const UrlInspectorPane: React.FC<UrlInspectorPaneProps> = ({
  onAnalyzeUrl,
  urlResult,
  isLoading
}) => {
  const [inputUrl, setInputUrl] = useState('https://example.com');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUrl.trim()) {
      onAnalyzeUrl(inputUrl.trim());
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Input Box */}
      <div className="light-card p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">Website Health & Security Checker</h3>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            Protected against internal network scans (SSRF)
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://example.com"
            required
            className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:bg-white focus:border-blue-500 transition-all"
          />

          <button
            type="submit"
            disabled={isLoading || !inputUrl.trim()}
            className="btn-primary px-5 py-2.5 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                <span>Checking Website...</span>
              </>
            ) : (
              <>
                <span>Check Website</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Results */}
      {urlResult && (
        <div className="space-y-6">
          
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="light-card p-4">
              <div className="text-xs font-semibold text-slate-500 mb-1">Website Score</div>
              <div className="text-2xl font-black text-slate-900">{urlResult.healthScore}%</div>
              <div className="text-xs text-emerald-700 mt-1">Status {urlResult.statusCode} OK</div>
            </div>

            <div className="light-card p-4">
              <div className="text-xs font-semibold text-slate-500 mb-1">Load Time</div>
              <div className="text-2xl font-black text-slate-900">{urlResult.responseTimeMs} ms</div>
              <div className="text-xs text-slate-500 mt-1">Server response speed</div>
            </div>

            <div className="light-card p-4">
              <div className="text-xs font-semibold text-slate-500 mb-1">Page Size</div>
              <div className="text-2xl font-black text-slate-900">{(urlResult.htmlSizeBytes / 1024).toFixed(1)} KB</div>
              <div className="text-xs text-slate-500 mt-1">HTML download size</div>
            </div>

            <div className="light-card p-4">
              <div className="text-xs font-semibold text-slate-500 mb-1">Issues Found</div>
              <div className="text-2xl font-black text-rose-600">{urlResult.findingsCount}</div>
              <div className="text-xs text-slate-500 mt-1">Things to improve</div>
            </div>

          </div>

          {/* Security Checklist */}
          <div className="light-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Security Checklist</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                urlResult.securityHeaders.csp ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <span>Content Policy (CSP)</span>
                {urlResult.securityHeaders.csp ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
              </div>

              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                urlResult.securityHeaders.hsts ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <span>Secure HTTPS (HSTS)</span>
                {urlResult.securityHeaders.hsts ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
              </div>

              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                urlResult.securityHeaders.xContentTypeOptions ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <span>Content-Type Shield</span>
                {urlResult.securityHeaders.xContentTypeOptions ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
              </div>

              <div className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                urlResult.securityHeaders.xFrameOptions ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-600'
              }`}>
                <span>Clickjack Shield</span>
                {urlResult.securityHeaders.xFrameOptions ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <ShieldAlert className="w-4 h-4 text-amber-500" />}
              </div>
            </div>
          </div>

          {/* Issues List */}
          <div className="light-card p-5 space-y-3">
            <h4 className="text-xs font-bold text-slate-800">Identified Items & Solutions</h4>

            {urlResult.findings.length === 0 ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Everything looks healthy! No problems detected on this website.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {urlResult.findings.map((f, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="font-bold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>{f.title}</span>
                    </div>
                    <p className="text-slate-600">{f.explanation}</p>
                    <p className="text-emerald-700 font-medium pt-1">Fix: {f.recommendation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
