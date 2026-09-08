import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ riskScore, score, level }) {
  const effectiveScore = riskScore !== undefined ? riskScore : (score !== undefined ? score : (level === 'HIGH_RISK' ? 75 : level === 'MEDIUM_RISK' ? 45 : 15));

  if (effectiveScore < 30) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-verified bg-emerald-950/40 text-emerald-400 border border-emerald-500/30">
        <ShieldCheck className="w-3.5 h-3.5" />
        Verified ✅ ({effectiveScore}/100)
      </span>
    );
  }

  if (effectiveScore <= 60) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-caution bg-amber-950/40 text-amber-400 border border-amber-500/30">
        <AlertTriangle className="w-3.5 h-3.5" />
        Caution ⚠️ ({effectiveScore}/100)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-danger bg-rose-950/40 text-rose-400 border border-rose-500/30">
      <ShieldAlert className="w-3.5 h-3.5" />
      High Risk 🚫 ({effectiveScore}/100)
    </span>
  );
}
