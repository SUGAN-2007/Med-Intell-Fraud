import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ riskScore, score, level }) {
  const s = riskScore !== undefined
    ? riskScore
    : score !== undefined
      ? score
      : level === 'HIGH_RISK' ? 75 : level === 'MEDIUM_RISK' ? 45 : 15;

  const cfg = s < 30
    ? { Icon: ShieldCheck,  bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.28)', color: '#34d399', label: 'Safe' }
    : s <= 60
    ? { Icon: AlertTriangle, bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.28)', color: '#fbbf24', label: 'Caution' }
    : { Icon: ShieldAlert,   bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.28)',  color: '#f87171', label: 'High Risk' };

  return (
    <span
      className="font-mono font-bold"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '4px 10px',
        borderRadius: 7,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        color: cfg.color,
        fontSize: 11,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <cfg.Icon size={11} strokeWidth={2.5} />
      {cfg.label} · {s}
    </span>
  );
}
