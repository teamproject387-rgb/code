import React from 'react';
import type { AppSettings } from '../types';
import { Sliders, Code2, Shield, Trash2, CheckCircle2 } from 'lucide-react';

interface SettingsPaneProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearHistory: () => void;
}

export const SettingsPane: React.FC<SettingsPaneProps> = ({
  settings,
  onUpdateSettings,
  onClearHistory
}) => {
  const [savedToast, setSavedToast] = React.useState(false);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const updated = { ...settings, [key]: value };
    onUpdateSettings(updated);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  const handleResetDefaults = () => {
    const defaults: AppSettings = {
      fontSize: '13px',
      tabSize: 2,
      showLineNumbers: true,
      autoValidateOnFix: true,
      strictness: 'standard',
      defaultLanguage: 'javascript',
      sandboxTimeoutMs: 3000
    };
    onUpdateSettings(defaults);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 1500);
  };

  return (
    <div className="max-w-4xl space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" />
            <span>Application Settings & Engine Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure your workspace behavior, editor formatting, and execution parameters.
          </p>
        </div>

        {savedToast && (
          <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 animate-slide-down">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Settings Saved</span>
          </span>
        )}
      </div>

      {/* Group 1: Editor Preferences */}
      <div className="light-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Code2 className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Editor Display & Formatting
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Font Size */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Editor Font Size
            </label>
            <select
              value={settings.fontSize}
              onChange={(e) => update('fontSize', e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="12px">Compact (12px)</option>
              <option value="13px">Standard (13px)</option>
              <option value="14px">Comfortable (14px)</option>
            </select>
          </div>

          {/* Tab Indentation */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Tab Indentation
            </label>
            <select
              value={settings.tabSize}
              onChange={(e) => update('tabSize', Number(e.target.value) as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value={2}>2 Spaces (Modern Standard)</option>
              <option value={4}>4 Spaces (Classic)</option>
            </select>
          </div>

          {/* Line Numbers Toggle */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Show Line Numbers
            </label>
            <div className="flex items-center gap-3 pt-1">
              <label className="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.showLineNumbers}
                  onChange={(e) => update('showLineNumbers', e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span className="text-slate-700 font-medium">Display line number gutter</span>
              </label>
            </div>
          </div>

          {/* Default Language */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Default Session Language
            </label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => update('defaultLanguage', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
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
      </div>

      {/* Group 2: Analysis & Validation Rules */}
      <div className="light-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Shield className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Inspection & Sandbox Limits
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Auto-validate on fix */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Post-Fix Verification
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={settings.autoValidateOnFix}
                onChange={(e) => update('autoValidateOnFix', e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="text-slate-700 font-medium">Auto-execute sandbox test after applying a fix</span>
            </label>
          </div>

          {/* Strictness Level */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Inspection Rule Policy
            </label>
            <select
              value={settings.strictness}
              onChange={(e) => update('strictness', e.target.value as any)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value="standard">Standard (Recommended)</option>
              <option value="strict">Strict (Flags all loose types & deprecations)</option>
            </select>
          </div>

          {/* Timeout */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Sandbox Execution Timeout
            </label>
            <select
              value={settings.sandboxTimeoutMs}
              onChange={(e) => update('sandboxTimeoutMs', Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all cursor-pointer"
            >
              <option value={2000}>2.0 Seconds (Fast)</option>
              <option value={3000}>3.0 Seconds (Default)</option>
              <option value={5000}>5.0 Seconds (Extended)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Group 3: Data & Storage */}
      <div className="light-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Trash2 className="w-4 h-4 text-slate-700" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Local Data & Ledger
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div>
            <div className="font-semibold text-slate-800">Clear Audit History</div>
            <div className="text-slate-500">
              Permanently clears past analysis reports recorded in the local database.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDefaults}
              className="btn-secondary px-3.5 py-1.5 rounded-lg text-xs cursor-pointer"
            >
              Reset Settings
            </button>

            <button
              onClick={onClearHistory}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 cursor-pointer transition-all"
            >
              Clear Records
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
