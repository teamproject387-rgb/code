import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { StatsBar } from './components/StatsBar';
import { CodeEditorPane } from './components/CodeEditorPane';
import { AnalysisFindingsPane } from './components/AnalysisFindingsPane';
import { DiffComparisonView } from './components/DiffComparisonView';
import { ValidationTerminal } from './components/ValidationTerminal';
import { ZipProjectUploadPane } from './components/ZipProjectUploadPane';
import { UrlInspectorPane } from './components/UrlInspectorPane';
import { HistoryLogPane } from './components/HistoryLogPane';
import { SettingsPane } from './components/SettingsPane';
import type {
  AnalysisResponse,
  ValidationReport,
  ProjectAnalysisResponse,
  UrlAnalysisResponse,
  AnalysisHistoryItem,
  AppSettings
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE ?? (import.meta.env.DEV ? 'http://localhost:4000' : '');

const DEFAULT_SETTINGS: AppSettings = {
  fontSize: '13px',
  tabSize: 2,
  showLineNumbers: true,
  autoValidateOnFix: true,
  strictness: 'standard',
  defaultLanguage: 'javascript',
  sandboxTimeoutMs: 3000
};

export function App() {
  const [activeTab, setActiveTab] = useState<'editor' | 'project' | 'url' | 'sandbox' | 'history' | 'settings'>('editor');
  
  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('aether_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  });

  // Editor state - clean initial state without mock data
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>(settings.defaultLanguage || 'javascript');
  const [activeLine, setActiveLine] = useState<number | null>(null);

  // Analysis & Validation state
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [hasRunAnalysis, setHasRunAnalysis] = useState<boolean>(false);
  const [validationReport, setValidationReport] = useState<ValidationReport | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [fixAccepted, setFixAccepted] = useState<boolean>(false);

  // Project ZIP state
  const [projectResult, setProjectResult] = useState<ProjectAnalysisResponse | null>(null);
  const [isUploadingProject, setIsUploadingProject] = useState<boolean>(false);

  // URL state
  const [urlResult, setUrlResult] = useState<UrlAnalysisResponse | null>(null);
  const [isLoadingUrl, setIsLoadingUrl] = useState<boolean>(false);

  // History state
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // Fetch initial history only
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleUpdateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
    localStorage.setItem('aether_settings', JSON.stringify(newSettings));
  };

  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setIsAnalyzing(true);
    setFixAccepted(false);

    try {
      const res = await fetch(`${API_BASE}/api/analyze/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Inspection failed');

      setAnalysisResult(data);
      setHasRunAnalysis(true);
      
      // Auto-validate if enabled in settings
      if (settings.autoValidateOnFix) {
        handleValidate(code, language, data.id);
      }
      fetchHistory();
    } catch (err: any) {
      alert(`Inspection failed: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleValidate = async (codeToTest = code, lang = language, analysisId?: string) => {
    setIsValidating(true);
    try {
      const res = await fetch(`${API_BASE}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: codeToTest, language: lang, analysisId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Validation failed');
      setValidationReport(data);
    } catch (err: any) {
      console.error('Validation error:', err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleAcceptFix = async (correctedCode: string) => {
    setCode(correctedCode);
    setFixAccepted(true);

    if (analysisResult?.fixProposal?.id) {
      try {
        await fetch(`${API_BASE}/api/fixes/${analysisResult.fixProposal.id}/accept`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accepted: true })
        });
      } catch (e) {}
    }

    if (settings.autoValidateOnFix) {
      handleValidate(correctedCode, language, analysisResult?.id);
    }
  };

  const handleRejectFix = () => {
    setFixAccepted(false);
  };

  const handleAnalyzeProject = async (file: File) => {
    setIsUploadingProject(true);
    const formData = new FormData();
    formData.append('projectZip', file);

    try {
      const res = await fetch(`${API_BASE}/api/analyze/project`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Project archive inspection failed');
      setProjectResult(data);
      fetchHistory();
    } catch (err: any) {
      alert(`Project archive inspection failed: ${err.message}`);
    } finally {
      setIsUploadingProject(false);
    }
  };

  const handleAnalyzeUrl = async (url: string) => {
    setIsLoadingUrl(true);
    try {
      const res = await fetch(`${API_BASE}/api/analyze/url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Website audit failed');
      setUrlResult(data);
      fetchHistory();
    } catch (err: any) {
      alert(`Website audit failed: ${err.message}`);
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const fetchHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`${API_BASE}/api/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Are you sure you want to clear all past audit records?')) {
      try {
        await fetch(`${API_BASE}/api/history`, { method: 'DELETE' });
        setHistory([]);
      } catch (e) {
        alert('Failed to clear records.');
      }
    }
  };

  // Honest, direct numbers
  const healthScore = analysisResult ? analysisResult.healthScore : 100;
  const totalFindings = analysisResult ? analysisResult.findings.length : 0;
  const totalLines = code.trim() ? code.split('\n').length : 0;

  const getPageTitle = () => {
    switch (activeTab) {
      case 'editor': return 'Code Auditor & Auto-Fixer';
      case 'project': return 'Project Archive Scanner (ZIP)';
      case 'url': return 'Web Resource & Header Inspector';
      case 'sandbox': return 'Isolated Sandbox Test Terminal';
      case 'history': return 'Local Audit Ledger';
      case 'settings': return 'Preferences & System Settings';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans">
      
      {/* Left Sidebar: Features on a separate side */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-sm font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
            <p className="text-[11px] text-slate-500">
              Zero-barrier static analysis, error reasoning, and automated diffs
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
              Open Access / No Login
            </span>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-6">
          
          {/* Stats Bar */}
          {activeTab === 'editor' && (
            <StatsBar
              healthScore={healthScore}
              totalFindings={totalFindings}
              totalLines={totalLines}
              onRunValidation={() => handleValidate()}
              isValidating={isValidating}
            />
          )}

          {/* Feature 1: Code Editor & Analysis */}
          {activeTab === 'editor' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Editor (7 cols) */}
                <div className="lg:col-span-7 flex flex-col">
                  <CodeEditorPane
                    code={code}
                    setCode={setCode}
                    language={language}
                    setLanguage={setLanguage}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                    onApplyFix={() => {
                      if (analysisResult?.aiDiagnostics?.correctedCode) {
                        handleAcceptFix(analysisResult.aiDiagnostics.correctedCode);
                      }
                    }}
                    hasFixAvailable={Boolean(analysisResult?.aiDiagnostics?.correctedCode && !fixAccepted)}
                    activeLine={activeLine}
                    settings={settings}
                  />
                </div>

                {/* Findings & AI Diagnostics (5 cols) */}
                <div className="lg:col-span-5 flex flex-col">
                  <AnalysisFindingsPane
                    findings={analysisResult?.findings || []}
                    aiDiagnostics={analysisResult?.aiDiagnostics}
                    onSelectLine={(line) => setActiveLine(line)}
                    hasRunAnalysis={hasRunAnalysis}
                  />
                </div>

              </div>

              {/* Proposed Fix Diff Inspector */}
              {analysisResult?.aiDiagnostics && (
                <DiffComparisonView
                  originalCode={analysisResult.fixProposal?.originalCode || code}
                  correctedCode={analysisResult.aiDiagnostics.correctedCode}
                  diffSummary={analysisResult.aiDiagnostics.diffSummary}
                  stepByStepFix={analysisResult.aiDiagnostics.stepByStepFix}
                  onAcceptFix={handleAcceptFix}
                  onRejectFix={handleRejectFix}
                  isAccepted={fixAccepted}
                />
              )}

              {/* Sandbox Terminal */}
              {hasRunAnalysis && (
                <ValidationTerminal
                  report={validationReport}
                  isValidating={isValidating}
                  onRunValidation={() => handleValidate()}
                />
              )}

            </div>
          )}

          {/* Feature 2: ZIP Project Scanner */}
          {activeTab === 'project' && (
            <ZipProjectUploadPane
              onAnalyzeProject={handleAnalyzeProject}
              projectResult={projectResult}
              isUploading={isUploadingProject}
            />
          )}

          {/* Feature 3: Web URL Scanner */}
          {activeTab === 'url' && (
            <UrlInspectorPane
              onAnalyzeUrl={handleAnalyzeUrl}
              urlResult={urlResult}
              isLoading={isLoadingUrl}
            />
          )}

          {/* Feature 4: Standalone Sandbox Terminal */}
          {activeTab === 'sandbox' && (
            <div className="space-y-6">
              <ValidationTerminal
                report={validationReport}
                isValidating={isValidating}
                onRunValidation={() => handleValidate()}
              />
            </div>
          )}

          {/* Feature 5: History Ledger */}
          {activeTab === 'history' && (
            <HistoryLogPane
              history={history}
              isLoading={isLoadingHistory}
              onRefresh={fetchHistory}
            />
          )}

          {/* Feature 6: Settings */}
          {activeTab === 'settings' && (
            <SettingsPane
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onClearHistory={handleClearHistory}
            />
          )}

        </main>

        {/* Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 lg:px-8 text-center text-xs text-slate-400 font-medium">
          Aether Autonomous Code Engine • High-precision static auditing & automated remediation
        </footer>

      </div>

    </div>
  );
}

export default App;
