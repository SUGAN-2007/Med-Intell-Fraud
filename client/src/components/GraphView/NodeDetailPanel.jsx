import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, Sparkles, User, Building, Stethoscope, CreditCard, Award, UserCheck, RefreshCw } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';
import { api } from '../../services/api';

export default function NodeDetailPanel({ node, onClose }) {
  const [riskData, setRiskData] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (!node) return;

    if (node.label === 'Agent') {
      fetchRiskAndExplanation(node.id);
    } else {
      setRiskData(null);
      setAiExplanation(null);
    }
  }, [node]);

  const fetchRiskAndExplanation = async (agentId) => {
    setLoading(true);
    setLoadingAi(true);
    try {
      const riskRes = await api.getRiskScore(agentId);
      if (riskRes.success) {
        setRiskData(riskRes.data);
      }

      const aiRes = await api.getAiExplanation(agentId);
      if (aiRes.success) {
        setAiExplanation(aiRes.data);
      }
    } catch (err) {
      console.error('Error fetching node risk details:', err);
    } finally {
      setLoading(false);
      setLoadingAi(false);
    }
  };

  if (!node) return null;

  const getNodeIcon = (label) => {
    switch (label) {
      case 'Agent': return <User className="w-5 h-5 text-cyan-400" />;
      case 'Clinic': return <Building className="w-5 h-5 text-indigo-400" />;
      case 'Doctor': return <Stethoscope className="w-5 h-5 text-emerald-400" />;
      case 'BankAccount': return <CreditCard className="w-5 h-5 text-rose-400" />;
      case 'LicenseRecord': return <Award className="w-5 h-5 text-amber-400" />;
      case 'Patient': return <UserCheck className="w-5 h-5 text-teal-400" />;
      default: return <User className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <aside className="w-96 border-l border-slate-800 bg-slate-950/95 backdrop-blur-xl h-full flex flex-col z-30 shadow-2xl overflow-y-auto">
      {/* Panel Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-start justify-between bg-slate-900/60 sticky top-0 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700">
            {getNodeIcon(node.label)}
          </div>
          <div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {node.label}
            </span>
            <h2 className="text-base font-bold text-slate-100 mt-1 leading-snug">
              {node.name}
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
        {/* Risk Score Dial Card (Agents Only) */}
        {node.label === 'Agent' && (
          <div className="p-4 rounded-xl glass-card border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-slate-400 tracking-wider">
                Risk Intelligence Gauge
              </span>
              {riskData && <RiskBadge level={riskData.riskLevel} score={riskData.riskScore} />}
            </div>

            {loading ? (
              <div className="text-center py-4 text-xs font-mono text-cyan-400 animate-pulse">
                Evaluating Cypher Fraud Graph...
              </div>
            ) : riskData ? (
              <div>
                <div className="flex items-end justify-between my-2">
                  <div>
                    <span className="text-3xl font-extrabold text-slate-100 font-mono">
                      {riskData.riskScore}
                    </span>
                    <span className="text-xs text-slate-500 font-mono"> / 100</span>
                  </div>
                  <span className={`text-xs font-bold font-mono uppercase ${
                    riskData.riskLevel === 'HIGH_RISK' ? 'text-rose-400' :
                    riskData.riskLevel === 'MEDIUM_RISK' ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {riskData.riskLevel.replace('_', ' ')}
                  </span>
                </div>

                {/* Score Progress Bar */}
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      riskData.riskScore >= 60 ? 'bg-rose-500 shadow-lg shadow-rose-500/50' :
                      riskData.riskScore >= 30 ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${riskData.riskScore}%` }}
                  />
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Node Properties Key-Value Table */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
            Node Registry Properties
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

        {/* Triggered Fraud Rules List */}
        {riskData && riskData.triggeredRules && riskData.triggeredRules.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-mono uppercase tracking-wider text-rose-400">
                Triggered Fraud Rings ({riskData.triggeredRules.length})
              </h3>
            </div>
            <div className="space-y-2">
              {riskData.triggeredRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-rose-500/20 bg-rose-950/20 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-bold text-rose-300">{rule.rule}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-900/60 text-rose-200">
                      +{rule.points} pts
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-[11px]">
                    {rule.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OpenRouter AI Plain-English Explanation */}
        {node.label === 'Agent' && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-violet-300">
                  OpenRouter AI Analysis
                </h3>
              </div>
              <button
                onClick={() => fetchRiskAndExplanation(node.id)}
                disabled={loadingAi}
                className="p-1 text-slate-400 hover:text-violet-300 transition-colors"
                title="Regenerate AI explanation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-950/20 text-xs text-slate-200 leading-relaxed space-y-3 font-sans">
              {loadingAi ? (
                <div className="py-4 text-center text-violet-300 font-mono animate-pulse">
                  Querying OpenRouter LLM...
                </div>
              ) : aiExplanation ? (
                <>
                  <div className="flex items-center justify-between border-b border-violet-500/20 pb-2 text-[10px] font-mono text-violet-400">
                    <span>Source: {aiExplanation.source}</span>
                  </div>
                  <div className="whitespace-pre-line text-slate-300 text-[12px] leading-relaxed">
                    {aiExplanation.explanation}
                  </div>
                </>
              ) : (
                <p className="text-slate-400">Click to fetch AI risk explanation.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
