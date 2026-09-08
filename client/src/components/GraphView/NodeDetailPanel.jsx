import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Sparkles, User, Building, Stethoscope, CreditCard, Award, UserCheck, Activity } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import { fetchRiskScore } from '../../services/api';

export default function NodeDetailPanel({ node, onClose }) {
  const [riskData, setRiskData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const nodeId = node?.id;
  const nodeType = node?.type || node?.label || 'Node';

  useEffect(() => {
    if (!nodeId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetchRiskScore(nodeId)
      .then(data => {
        if (isMounted) {
          setRiskData(data);
        }
      })
      .catch(err => {
        if (isMounted) {
          console.error('Error fetching risk score for node:', err);
          setError('Failed to fetch risk score');
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [nodeId]);

  if (!node) return null;

  const getNodeIcon = (type) => {
    switch (type) {
      case 'Agent': return <User className="w-5 h-5 text-sky-400" />;
      case 'Clinic': return <Building className="w-5 h-5 text-emerald-400" />;
      case 'Doctor': return <Stethoscope className="w-5 h-5 text-purple-400" />;
      case 'Patient': return <UserCheck className="w-5 h-5 text-slate-400" />;
      case 'BankAccount': return <CreditCard className="w-5 h-5 text-rose-400" />;
      case 'LicenseRecord': return <Award className="w-5 h-5 text-amber-400" />;
      default: return <Activity className="w-5 h-5 text-cyan-400" />;
    }
  };

  const score = riskData?.riskScore ?? 0;
  const triggeredPatterns = riskData?.triggeredPatterns || [];

  return (
    <aside className="w-96 border-l border-slate-800 bg-slate-950/95 backdrop-blur-xl h-full flex flex-col z-30 shadow-2xl overflow-y-auto">
      {/* Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/80 sticky top-0 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            {getNodeIcon(nodeType)}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {nodeType}
            </span>
            <h2 className="text-base font-bold text-slate-100 mt-1 leading-snug">
              {node.name || node.id}
            </h2>
            <p className="text-xs font-mono text-slate-500">{node.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {/* Risk Score Card */}
        <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider font-mono">
              Risk Score Intelligence
            </span>
            {!loading && <RiskBadge riskScore={score} />}
          </div>

          {loading ? (
            <div className="text-center py-4 text-xs font-mono text-cyan-400 animate-pulse">
              Running Fraud Detection Engine...
            </div>
          ) : error ? (
            <div className="text-xs text-rose-400 py-2">{error}</div>
          ) : (
            <div>
              <div className="flex items-end justify-between my-2">
                <div>
                  <span className={`text-4xl font-extrabold font-mono ${
                    score > 60 ? 'text-rose-400' : score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {score}
                  </span>
                  <span className="text-xs text-slate-500 font-mono"> / 100</span>
                </div>
                <span className={`text-xs font-bold font-mono uppercase ${
                  score > 60 ? 'text-rose-400' : score >= 30 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {score > 60 ? 'HIGH RISK' : score >= 30 ? 'CAUTION' : 'VERIFIED SAFE'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    score > 60 ? 'bg-rose-500 shadow-lg shadow-rose-500/50' :
                    score >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Triggered Fraud Patterns */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-300">
              Triggered Fraud Patterns ({triggeredPatterns.length})
            </h3>
          </div>
          {triggeredPatterns.length === 0 ? (
            <div className="p-3 rounded-lg border border-slate-800 bg-slate-900/40 text-xs text-emerald-400 font-mono">
              ✓ No fraud patterns triggered. Clean graph profile.
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {triggeredPatterns.map((pattern, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-rose-950/60 text-rose-300 border border-rose-800 text-xs font-mono font-semibold"
                >
                  {pattern.replace(/_/g, ' ')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Plain-English Explanation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-violet-300">
              AI Fraud Explanation
            </h3>
          </div>
          <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/20 text-xs text-slate-200 leading-relaxed font-sans">
            {loading ? (
              <span className="text-violet-400 font-mono animate-pulse">Generating AI Explanation...</span>
            ) : (
              riskData?.explanation || 'No anomalies detected for this entity.'
            )}
          </div>
        </div>

        {/* Node Properties */}
        <div className="space-y-2 pt-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Registry Metadata
          </h3>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 divide-y divide-slate-800/60 overflow-hidden text-xs">
            {Object.entries(node.properties || {}).map(([key, val]) => (
              <div key={key} className="p-3 flex items-center justify-between">
                <span className="font-mono text-slate-400 uppercase text-[11px]">{key}</span>
                <span className="font-medium text-slate-200 text-right truncate max-w-[180px]">
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
