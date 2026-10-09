import React, { useState, useRef } from 'react';
import type { ProjectAnalysisResponse } from '../types';
import { Upload, FolderArchive, Folder, FileCode, CheckCircle, Package } from 'lucide-react';

interface ZipProjectUploadPaneProps {
  onAnalyzeProject: (file: File) => void;
  projectResult: ProjectAnalysisResponse | null;
  isUploading: boolean;
}

export const ZipProjectUploadPane: React.FC<ZipProjectUploadPaneProps> = ({
  onAnalyzeProject,
  projectResult,
  isUploading
}) => {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onAnalyzeProject(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.zip')) {
        onAnalyzeProject(file);
      } else {
        alert('Please choose a .zip file.');
      }
    }
  };

  const activeAnalyzedFile = projectResult?.analyzedFiles.find(f => f.path === selectedFile) || projectResult?.analyzedFiles[0];

  return (
    <div className="space-y-6">
      
      {/* Upload Zone Card */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="light-card-interactive border-2 border-dashed border-blue-200 hover:border-blue-400 p-8 text-center cursor-pointer group"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".zip"
          className="hidden"
        />

        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-105 transition-transform">
          {isUploading ? (
            <span className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></span>
          ) : (
            <Upload className="w-6 h-6" />
          )}
        </div>

        <h3 className="text-sm font-bold text-slate-900 mb-1">
          {isUploading ? 'Inspecting your project ZIP...' : 'Drop your project ZIP file here'}
        </h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto mb-3">
          Upload any ZIP folder to check all files inside, count lines, and find problems.
        </p>

        <button
          type="button"
          disabled={isUploading}
          className="btn-primary px-4 py-2 rounded-lg text-xs inline-flex items-center gap-1.5 shadow-sm"
        >
          <FolderArchive className="w-4 h-4" />
          <span>Choose ZIP File</span>
        </button>
      </div>

      {/* Results View */}
      {projectResult && (
        <div className="space-y-6">
          
          {/* Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="light-card p-4">
              <div className="text-xs font-semibold text-slate-500 mb-1">Project Health</div>
              <div className="text-2xl font-black text-slate-900">{projectResult.overallHealth}%</div>
              <div className="text-xs text-slate-500 mt-1">Based on issues found</div>
            </div>

            <div className="light-card p-4">
              <div className="text-xs font-semibold text-slate-500 mb-1">Total Files</div>
              <div className="text-2xl font-black text-slate-900">{projectResult.totalFiles}</div>
              <div className="text-xs text-slate-500 mt-1">{projectResult.analyzedFilesCount} code files checked</div>
            </div>

            <div className="light-card p-4">
              <div className="text-xs font-semibold text-slate-500 mb-1">Total Lines of Code</div>
              <div className="text-2xl font-black text-slate-900">{projectResult.totalLinesOfCode}</div>
              <div className="text-xs text-slate-500 mt-1">Across all files</div>
            </div>

            <div className="light-card p-4">
              <div className="text-xs font-semibold text-slate-500 mb-1">Problems Found</div>
              <div className="text-2xl font-black text-rose-600">{projectResult.findings.length}</div>
              <div className="text-xs text-slate-500 mt-1">Need your attention</div>
            </div>

          </div>

          {/* Dependencies Card */}
          {projectResult.dependencies.manifestFound && (
            <div className="light-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                <Package className="w-4 h-4 text-blue-600" />
                <span>Packages Used ({projectResult.dependencies.packageManager})</span>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {projectResult.dependencies.runtime.map((dep, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700"
                  >
                    <span className="font-semibold text-blue-700">{dep.name}</span>
                    <span className="text-slate-400 ml-1.5">v{dep.version}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* File Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* File list */}
            <div className="light-card p-4 space-y-2">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-2">
                <Folder className="w-4 h-4 text-blue-600" />
                <span>Files in Project</span>
              </div>

              <div className="space-y-1 max-h-[360px] overflow-y-auto">
                {projectResult.analyzedFiles.map((f) => (
                  <div
                    key={f.path}
                    onClick={() => setSelectedFile(f.path)}
                    className={`p-2 rounded-lg text-xs flex items-center justify-between cursor-pointer transition-all ${
                      (selectedFile === f.path || (!selectedFile && f.path === projectResult.analyzedFiles[0]?.path))
                        ? 'bg-blue-50 text-blue-900 border border-blue-200 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileCode className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{f.path}</span>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        f.findingsCount > 0
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {f.findingsCount > 0 ? `${f.findingsCount} issues` : 'Clean'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* File detail */}
            <div className="lg:col-span-2 light-card p-5 space-y-4">
              {activeAnalyzedFile ? (
                <>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-mono">{activeAnalyzedFile.path}</h4>
                      <div className="text-xs text-slate-500">
                        {activeAnalyzedFile.language.toUpperCase()} • {activeAnalyzedFile.lines} lines
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      Score: {activeAnalyzedFile.healthScore}%
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">Issues in this file:</div>
                    {projectResult.findings.filter(f => f.file === activeAnalyzedFile.path).length === 0 ? (
                      <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-emerald-600" />
                        <span>No problems found in this file!</span>
                      </div>
                    ) : (
                      projectResult.findings
                        .filter(f => f.file === activeAnalyzedFile.path)
                        .map((finding) => (
                          <div key={finding.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                            <div className="font-bold text-rose-800 flex items-center justify-between">
                              <span>{finding.message}</span>
                              {finding.line && <span className="text-[11px] font-mono text-slate-500">Line {finding.line}</span>}
                            </div>
                            <p className="text-slate-600">{finding.explanation}</p>
                            {finding.suggestion && (
                              <p className="text-emerald-700 font-medium pt-1">Fix: {finding.suggestion}</p>
                            )}
                          </div>
                        ))
                    )}
                  </div>
                </>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  Choose a file on the left to inspect its details.
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
