import React from 'react';
import { UserCheck, Cpu, Sparkles, Radio } from 'lucide-react';

export default function Header({ activeTab, setActiveTab }) {
  return (
    <header
      style={{
        height: '62px',
        background: 'rgba(5,5,5,0.97)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        padding: '0 24px',
        flexShrink: 0,
        zIndex: 40,
        position: 'relative',
      }}
    >
      {/* ── Left — System Badges ── */}
      <div className="hidden lg:flex items-center gap-3" style={{ justifySelf: 'start' }}>
        <div
          className="flex items-center gap-2 font-mono"
          style={{
            fontSize: 11,
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(6,182,212,0.06)',
            border: '1px solid rgba(6,182,212,0.18)',
            color: '#67e8f9',
          }}
        >
          <Radio size={12} style={{ color: '#06b6d4' }} />
          <span style={{ color: '#525252' }}>Engine:</span>
          <span className="font-bold text-white" style={{ fontSize: 11 }}>Neo4j AuraDB</span>
        </div>

        <div
          className="flex items-center gap-2 font-mono"
          style={{
            fontSize: 11,
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(139,92,246,0.06)',
            border: '1px solid rgba(139,92,246,0.18)',
            color: '#c4b5fd',
          }}
        >
          <Sparkles size={12} style={{ color: '#a78bfa' }} />
          <span style={{ color: '#525252' }}>AI:</span>
          <span className="font-bold text-white" style={{ fontSize: 11 }}>OpenRouter LLM</span>
        </div>
      </div>

      {/* ── Center — Brand ── */}
      <div style={{ justifySelf: 'center', textAlign: 'center' }}>
        <div className="flex items-center gap-2.5">
          <h1
            className="font-heading font-extrabold tracking-tight"
            style={{ fontSize: 16, letterSpacing: '-0.4px' }}
          >
            <span style={{ color: '#ffffff' }}>MED</span>
            <span style={{ color: '#ffffff' }}>-INTELL</span>
            <span style={{ color: '#2a2a2a', fontWeight: 300, margin: '0 10px' }}>|</span>
            <span style={{ color: '#fb7185' }}>FRAUD</span>
            <span style={{ color: '#fbbf24' }}> GRAPH</span>
          </h1>
          {/* Live pill */}
        </div>
      </div>

      {/* ── Right — Tab Switcher ── */}
      <div
        className="flex items-center gap-1 flex-shrink-0"
        style={{
          justifySelf: 'end',
          padding: '4px',
          borderRadius: 12,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          onClick={() => setActiveTab('admin')}
          className="flex items-center gap-2 transition-all cursor-pointer font-mono font-bold"
          style={{
            padding: '7px 16px',
            borderRadius: 9,
            fontSize: 12,
            border: 'none',
            background:
              activeTab === 'admin'
                ? 'linear-gradient(135deg, rgba(6,182,212,0.25), rgba(99,102,241,0.25))'
                : 'transparent',
            color: activeTab === 'admin' ? '#e2e8f0' : '#525252',
            boxShadow:
              activeTab === 'admin' ? 'inset 0 0 0 1px rgba(6,182,212,0.35)' : 'none',
          }}
        >
          <Cpu size={13} />
          Admin Graph
        </button>

        <button
          onClick={() => setActiveTab('patient')}
          className="flex items-center gap-2 transition-all cursor-pointer font-mono font-bold"
          style={{
            padding: '7px 16px',
            borderRadius: 9,
            fontSize: 12,
            border: 'none',
            background:
              activeTab === 'patient'
                ? 'linear-gradient(135deg, rgba(16,185,129,0.25), rgba(20,184,166,0.25))'
                : 'transparent',
            color: activeTab === 'patient' ? '#e2e8f0' : '#525252',
            boxShadow:
              activeTab === 'patient' ? 'inset 0 0 0 1px rgba(16,185,129,0.35)' : 'none',
          }}
        >
          <UserCheck size={13} />
          Patient Portal
        </button>
      </div>
    </header>
  );
}
