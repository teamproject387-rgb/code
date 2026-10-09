export interface Finding {
  id: string;
  severity: 'critical' | 'error' | 'warning' | 'info';
  category: 'security' | 'syntax' | 'runtime' | 'logic' | 'performance' | 'a11y' | 'seo';
  message: string;
  line?: number;
  column?: number;
  file?: string;
  explanation?: string;
  root_cause?: string;
  suggestion?: string;
}

export interface AiDiagnostics {
  summary: string;
  beginnerExplanation: string;
  rootCauseAnalysis: string;
  stepByStepFix: string[];
  correctedCode: string;
  diffSummary: string;
}

export interface FixProposal {
  id: string;
  originalCode: string;
  correctedCode: string;
  diffSummary: string;
  isAccepted: boolean;
}

export interface AnalysisResponse {
  id: string;
  language: string;
  healthScore: number;
  metrics: {
    totalLines: number;
    characterCount: number;
    criticalCount: number;
    errorCount: number;
    warningCount: number;
    infoCount: number;
  };
  findings: Finding[];
  aiDiagnostics: AiDiagnostics;
  fixProposal: FixProposal;
}

export interface ValidationReport {
  passed: boolean;
  exitCode: number;
  runtime: string;
  outputLogs: string;
  durationMs: number;
  testsPassed: number;
  testsTotal: number;
  timestamp: string;
}

export interface ProjectAnalysisResponse {
  id: string;
  projectName: string;
  totalFiles: number;
  analyzedFilesCount: number;
  totalLinesOfCode: number;
  overallHealth: number;
  dependencies: {
    runtime: Array<{ name: string; version: string }>;
    dev: Array<{ name: string; version: string }>;
    packageManager: string;
    manifestFound: boolean;
    projectName?: string;
    version?: string;
  };
  fileTree: Array<{
    path: string;
    isDirectory: boolean;
    size: number;
    extension?: string;
  }>;
  analyzedFiles: Array<{
    path: string;
    language: string;
    lines: number;
    findingsCount: number;
    healthScore: number;
    contentPreview: string;
  }>;
  findings: Finding[];
  findingsSummary: {
    critical: number;
    error: number;
    warning: number;
    info: number;
  };
}

export interface UrlAnalysisResponse {
  id: string;
  url: string;
  statusCode: number;
  responseTimeMs: number;
  htmlSizeBytes: number;
  healthScore: number;
  securityHeaders: {
    csp: boolean;
    hsts: boolean;
    xContentTypeOptions: boolean;
    xFrameOptions: boolean;
    referrerPolicy: boolean;
  };
  findings: Array<{
    severity: 'critical' | 'error' | 'warning' | 'info';
    category: string;
    title: string;
    explanation: string;
    recommendation: string;
  }>;
  findingsCount: number;
  timestamp: string;
}

export interface AnalysisHistoryItem {
  id: string;
  type: string;
  title: string;
  language: string;
  health_score: number;
  findings_count: number;
  status: string;
  created_at: string;
}

export interface AppSettings {
  fontSize: '12px' | '13px' | '14px';
  tabSize: 2 | 4;
  showLineNumbers: boolean;
  autoValidateOnFix: boolean;
  strictness: 'standard' | 'strict';
  defaultLanguage: string;
  sandboxTimeoutMs: number;
}
