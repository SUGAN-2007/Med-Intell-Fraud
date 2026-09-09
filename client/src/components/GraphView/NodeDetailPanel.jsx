import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Sparkles, User, Building2, Stethoscope, CreditCard, Award, UserCheck, Activity } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import { fetchRiskScore } from '../../services/api';

const NODE_ICONS = {
  Agent:         <User        size={16} style={{ color: '#38bdf8' }} />,
  Clinic:        <Building2   size={16} style={{ color: '#34d399' }} />,
  Doctor:        <Stethoscope size={16} style={{ color: '#a855f7' }} />,
  Patient:       <UserCheck   size={16} style={{ color: '#94a3b8' }} />,
  BankAccount:   <CreditCard  size={16} style={{ color: '#f43f5e' }} />,
  LicenseRecord: <Award       size={16} style={{ color: '#f59e0b' }} />,
};

const NODE_COLOR = {
  Agent:   '#38bdf8',
  Clinic:  '#34d399',
  Doctor:  '#a855f7',
  Patient: '#94a3b8',
};

export default function NodeDetailPanel({ node, onClose }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nodeId   = node?.id;
  const nodeType = node?.type || node?.label || 'Node';
  const accentColor = NODE_COLOR[nodeType] || '#06b6d4';

  useEffect(() => {
    if (!nodeId) return;
    let alive = true;
    setLoading(true);
    setError(null);
    setRiskData(null);
    fetchRiskScore(nodeId)
      .then(d  => alive && setRiskData(d))
      .catch(() => alive && setError('Failed to load risk score'))
      .finally(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [nodeId]);

  if (!node) return null;

  const score = riskData?.riskScore ?? 0;
  const patterns = riskData?.triggeredPatterns || [];
  const riskLabel = score >= 60 ? 'HIGH RISK' : score >= 20 ? 'CAUTION' : 'VERIFIED SAFE';
  const riskColor = score >= 60 ? '#f87171' : score >= 20 ? '#fbbf24' : '#34d399';

  return (
    <aside
      style={{
        width: 380,
        flexShrink: 0,
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(5,5,5,0.97)',
        backdropFilter: 'blur(28px)',
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 30,
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '18px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          backdropFilter: 'blur(24px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
            {/* Node type icon bubble */}
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: `${accentColor}15`,
                border: `1px solid ${accentColor}35`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: `0 0 16px ${accentColor}20`,
              }}
            >
              {NODE_ICONS[nodeType] || <Activity size={16} style={{ color: accentColor }} />}
            </div>

            <div style={{ minWidth: 0 }}>
              <span
                className="font-mono font-bold uppercase"
                style={{
                  fontSize: 10,
                  letterSpacing: '0.8px',
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: `${accentColor}12`,
                  border: `1px solid ${accentColor}30`,
                  color: accentColor,
                  display: 'inline-block',
                }}
              >
                {nodeType}
              </span>
              <h2
                className="font-heading font-bold text-white"
                style={{ fontSize: 15, marginTop: 5, lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {node.name || node.id}
              </h2>
              <p className="font-mono" style={{ fontSize: 10, color: '#525252', marginTop: 2 }}>{node.id}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 8,
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#525252',
              cursor: 'pointer',
              flexShrink: 0,
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#e5e5e5'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#525252'; }}
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>

        {/* Risk Score Card */}
        <div
          style={{
            borderRadius: 14,
            background: 'rgba(255,255,255,0.025)',
            border: '1px solid rgba(255,255,255,0.08)',
            padding: '18px 20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <span className="font-mono font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.7px', color: '#525252' }}>
              Risk Score
            </span>
            {!loading && <RiskBadge riskScore={score} />}
          </div>

          {loading ? (
            <div className="font-mono" style={{ fontSize: 12, color: '#06b6d4', padding: '8px 0', animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.8 }}>
              Running fraud detection engine…
            </div>
          ) : error ? (
            <div style={{ fontSize: 12, color: '#f87171' }}>{error}</div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                  <span className="font-mono font-extrabold" style={{ fontSize: 38, color: riskColor, lineHeight: 1 }}>
                    {score}
                  </span>
                  <span className="font-mono font-bold" style={{ fontSize: 20, color: riskColor, opacity: 0.7 }}>%</span>
                </div>
                <span className="font-mono font-bold uppercase" style={{ fontSize: 10, color: riskColor, letterSpacing: '0.8px' }}>
                  {riskLabel}
                </span>
              </div>
              {/* Progress track */}
              <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${score}%`,
                    borderRadius: 99,
                    background: riskColor,
                    boxShadow: score > 30 ? `0 0 8px ${riskColor}` : 'none',
                    transition: 'width 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
              </div>
            </>
          )}
        </div>

        {/* Triggered Fraud Patterns */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <ShieldAlert size={13} style={{ color: '#f43f5e' }} />
            <span className="font-mono font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.7px', color: '#737373' }}>
              Triggered Patterns ({patterns.length})
            </span>
          </div>
          {patterns.length === 0 ? (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(16,185,129,0.06)',
                border: '1px solid rgba(16,185,129,0.2)',
                fontSize: 12,
                color: '#34d399',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              ✓ No fraud patterns detected. Clean profile.
            </div>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {patterns.map((p, i) => (
                <span
                  key={i}
                  className="font-mono font-bold"
                  style={{
                    padding: '4px 10px',
                    borderRadius: 7,
                    background: 'rgba(244,63,94,0.1)',
                    border: '1px solid rgba(244,63,94,0.3)',
                    color: '#fca5a5',
                    fontSize: 11,
                  }}
                >
                  {p.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* AI Explanation */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <Sparkles size={13} style={{ color: '#a78bfa' }} />
            <span className="font-mono font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.7px', color: '#737373' }}>
              AI Fraud Explanation
            </span>
          </div>
          <div
            style={{
              padding: '14px 16px',
              borderRadius: 12,
              background: 'rgba(139,92,246,0.06)',
              border: '1px solid rgba(139,92,246,0.2)',
              fontSize: 12.5,
              color: '#d4d4d4',
              lineHeight: 1.65,
            }}
          >
            {loading ? (
              <span className="font-mono" style={{ color: '#a78bfa', fontSize: 11, animation: 'pulse 1.5s ease-in-out infinite' }}>
                Generating AI explanation…
              </span>
            ) : (
              riskData?.explanation || 'No anomalies detected for this entity.'
            )}
          </div>
        </div>

        {/* Registry Metadata */}
        <div>
          <span className="font-mono font-bold uppercase" style={{ fontSize: 10, letterSpacing: '0.7px', color: '#525252', display: 'block', marginBottom: 10 }}>
            Registry Metadata
          </span>
          <div
            style={{
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,0.07)',
              overflow: 'hidden',
            }}
          >
            {Object.entries(node.properties || {}).map(([key, val], i, arr) => (
              <div
                key={key}
                style={{
                  padding: '10px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  background: i % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent',
                }}
              >
                <span className="font-mono font-semibold" style={{ fontSize: 10, color: '#525252', textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                  {key}
                </span>
                <span style={{ fontSize: 12, color: '#d4d4d4', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                  {String(val)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
