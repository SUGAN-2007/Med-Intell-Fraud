import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ level, score }) {
  if (level === 'LOW_RISK' || level === 'VERIFIED_SAFE' || level === 'VERIFIED') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-verified">
        <ShieldCheck className="w-3.5 h-3.5" />
        VERIFIED {score !== undefined && `(${score}/100)`}
      </span>
    );
  }

  if (level === 'MEDIUM_RISK' || level === 'CAUTION') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-caution">
        <AlertTriangle className="w-3.5 h-3.5" />
        CAUTION {score !== undefined && `(${score}/100)`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold badge-danger">
      <ShieldAlert className="w-3.5 h-3.5" />
      HIGH RISK {score !== undefined && `(${score}/100)`}
    </span>
  );
}
