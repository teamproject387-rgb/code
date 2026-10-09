import React from 'react';
import { 
  Code2, 
  FolderArchive, 
  Globe, 
  Terminal, 
  History, 
  Settings, 
  ShieldCheck, 
  Cpu
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'editor' | 'project' | 'url' | 'sandbox' | 'history' | 'settings';
  setActiveTab: (tab: 'editor' | 'project' | 'url' | 'sandbox' | 'history' | 'settings') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      
      {/* Top Brand */}
      <div>
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black tracking-wider text-slate-900">AETHER</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200 font-bold">
                  AUDIT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Code Intelligence Suite</p>
            </div>
          </div>
        </div>

        {/* Feature Navigation List */}
        <div className="p-3 space-y-6">
          
          {/* Section 1: Features on a separate side */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Workspace Features
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('editor')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Code2 className="w-4 h-4 text-blue-600" />
                <span>Code Auditor</span>
              </button>

              <button
                onClick={() => setActiveTab('project')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'project'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FolderArchive className="w-4 h-4 text-indigo-600" />
                <span>Project ZIP Scanner</span>
              </button>

              <button
                onClick={() => setActiveTab('url')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'url'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Globe className="w-4 h-4 text-cyan-600" />
                <span>Web URL Inspector</span>
              </button>

              <button
                onClick={() => setActiveTab('sandbox')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'sandbox'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Terminal className="w-4 h-4 text-emerald-600" />
                <span>Sandbox Test Runner</span>
              </button>
            </nav>
          </div>

          {/* Section 2: Management & Public Systems */}
          <div>
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              System & History
            </div>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('history')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <History className="w-4 h-4 text-slate-500" />
                <span>Audit Ledger</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Settings className="w-4 h-4 text-slate-500" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

        </div>
      </div>

      {/* Footer / System Status Box */}
      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-blue-600" />
              <span>Sandbox Engine</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Online
            </span>
          </div>

          <div className="text-[11px] text-slate-500 leading-snug">
            Isolated child runner bounded by resource caps.
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center mt-3 font-mono">
          Enterprise Audit Engine • v2.4
        </div>
      </div>

    </aside>
  );
};
