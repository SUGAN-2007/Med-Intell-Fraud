import React from 'react';
import { Network, UserCheck, Shield, Sparkles, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header className="h-16 flex-shrink-0 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-xl px-6 flex items-center justify-between z-40">
      {/* Branding & Logo */}
      <div className="flex items-center gap-3.5 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 flex-shrink-0">
          <Network className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold font-heading tracking-tight text-slate-100 whitespace-nowrap">
              MED-INTELL <span className="text-cyan-400">FRAUD GRAPH</span>
            </h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 whitespace-nowrap font-bold">
              Neo4j Live
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block whitespace-nowrap">
            Multi-Entity Graph Intelligence & AI Risk Engine
          </p>
        </div>
      </div>

      {/* Center Live Status Badges */}
      <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400">Engine:</span>
          <span className="text-cyan-300 font-bold">Neo4j Database</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300">
          <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
          <span className="text-slate-400">AI Explanations:</span>
          <span className="text-violet-300 font-bold">OpenRouter LLM</span>
        </div>
      </div>

      {/* Navigation View Switcher */}
      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex-shrink-0">
        <button
          onClick={() => setActiveTab('admin')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'admin'
              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Network className="w-4 h-4" />
          Admin Intelligence Graph
        </button>

        <button
          onClick={() => setActiveTab('patient')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'patient'
              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Patient Match Portal
        </button>
      </div>
    </header>
  );
}
