import React from 'react';
import { Network, UserCheck, Shield, Sparkles, Activity } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, nodeCount, fraudRingsCount }) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Branding & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Network className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-heading tracking-tight text-slate-100">
                MED-INTELL <span className="text-cyan-400">FRAUD GRAPH</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-500/30">
                Hackathon 2026
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Graph Intelligence & AI Risk Scoring for International Medical Tourism
            </p>
          </div>
        </div>

        {/* Live Metrics */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Graph Nodes:</span>
            <span className="text-cyan-300 font-semibold">{nodeCount || 23}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <Shield className="w-3.5 h-3.5 text-rose-400" />
            <span className="text-slate-400">Fraud Patterns:</span>
            <span className="text-rose-400 font-semibold">{fraudRingsCount || 4} Rings</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
            <span className="text-slate-400">AI Engine:</span>
            <span className="text-violet-300">OpenRouter LLM</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'admin'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-4 h-4" />
            Admin Intelligence Graph
          </button>

          <button
            onClick={() => setActiveTab('patient')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'patient'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Patient Match Portal
          </button>
        </div>
      </div>
    </header>
  );
}
