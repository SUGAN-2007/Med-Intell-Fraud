import React from 'react';
import { Star, Mail, MapPin, Award, CheckCircle, AlertTriangle, ShieldX } from 'lucide-react';
import RiskBadge from '../shared/RiskBadge';

export default function AgentMatchList({ recommendations, query }) {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="p-8 rounded-2xl glass-panel border border-slate-800 text-center text-slate-400 space-y-2">
        <p className="text-sm font-mono">No matching facilitators found for your selected criteria.</p>
        <p className="text-xs text-slate-500">Try broadening your treatment or country selection.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-sm font-bold font-heading text-slate-200">
          Ranked Facilitators ({recommendations.length} Matches Found)
        </h3>
        <span className="text-xs font-mono text-cyan-400">
          Sorted by Lowest Risk & Highest Trust Rating
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((agent, index) => {
          const isTopMatch = index === 0 && agent.riskLevel === 'LOW_RISK';

          return (
            <div
              key={agent.agentId}
              className={`p-5 rounded-2xl glass-card border transition-all relative ${
                isTopMatch
                  ? 'border-emerald-500/50 bg-emerald-950/10 shadow-xl shadow-emerald-500/10'
                  : 'border-slate-800'
              }`}
            >
              {isTopMatch && (
                <span className="absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase font-mono tracking-wider shadow-md">
                  TOP RECOMMENDED SAFE MATCH
                </span>
              )}

              <div className="flex items-start justify-between gap-3 mt-1">
                <div>
                  <h4 className="text-base font-bold text-slate-100">{agent.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                      {agent.country}
                    </span>
                    <span className="flex items-center gap-1 text-amber-400 font-semibold font-mono">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {agent.trustRating} / 5.0
                    </span>
                  </div>
                </div>

                <RiskBadge level={agent.riskLevel} score={agent.riskScore} />
              </div>

              {/* Specialization Tags */}
              <div className="my-3 flex flex-wrap gap-1.5">
                {agent.specialization.split(',').map((spec, i) => (
                  <span
                    key={i}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 font-mono"
                  >
                    {spec.trim()}
                  </span>
                ))}
              </div>

              {/* Graph Safety Note */}
              <div className={`p-3 rounded-xl text-xs space-y-1 ${
                agent.riskLevel === 'LOW_RISK'
                  ? 'bg-emerald-950/30 text-emerald-300 border border-emerald-500/20'
                  : agent.riskLevel === 'MEDIUM_RISK'
                  ? 'bg-amber-950/30 text-amber-300 border border-amber-500/20'
                  : 'bg-rose-950/30 text-rose-300 border border-rose-500/20'
              }`}>
                <div className="flex items-center gap-1.5 font-semibold">
                  {agent.riskLevel === 'LOW_RISK' ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : agent.riskLevel === 'MEDIUM_RISK' ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ShieldX className="w-3.5 h-3.5 text-rose-400" />
                  )}
                  Graph Audit Status
                </div>
                <p className="text-[11px] leading-relaxed opacity-90">
                  {agent.safetyNote}
                </p>
              </div>

              {/* Contact Email */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" />
                  {agent.contactEmail}
                </span>

                <button
                  disabled={agent.riskLevel === 'HIGH_RISK'}
                  className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition-all ${
                    agent.riskLevel === 'HIGH_RISK'
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30'
                  }`}
                >
                  {agent.riskLevel === 'HIGH_RISK' ? 'Blocked' : 'Request Consult'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
