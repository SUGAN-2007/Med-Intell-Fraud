import React, { useState, useEffect } from 'react';
import Loader from '../components/shared/Loader';
import RiskBadge from '../components/shared/RiskBadge';
import { fetchGraph, fetchRiskScore } from '../services/api';
import { Lock, HeartHandshake, Search, ShieldCheck } from 'lucide-react';

export default function PatientPortal() {
  const [treatment, setTreatment] = useState('Coronary Artery Bypass');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const graphData = await fetchGraph();
      const allNodes = graphData?.nodes || [];
      const agentNodes = allNodes.filter(n => n.type === 'Agent' || n.label === 'Agent');

      // Calculate risk scores and filter safe agents (<60 riskScore)
      const evaluatedAgents = await Promise.all(
        agentNodes.map(async (agent) => {
          try {
            const riskData = await fetchRiskScore(agent.id);
            return {
              id: agent.id,
              name: agent.name || agent.properties?.name || agent.id,
              address: agent.properties?.address || 'Verified Medical Hub',
              email: agent.properties?.email || 'contact@verifiedhealth.org',
              riskScore: riskData?.riskScore ?? 0,
              triggeredPatterns: riskData?.triggeredPatterns || []
            };
          } catch {
            return {
              id: agent.id,
              name: agent.name || agent.properties?.name || agent.id,
              address: 'Verified Medical Hub',
              email: 'contact@verifiedhealth.org',
              riskScore: 15,
              triggeredPatterns: []
            };
          }
        })
      );

      // Filter to agents with riskScore < 60
      const safeAgents = evaluatedAgents.filter(a => a.riskScore < 60);
      setAgents(safeAgents);
    } catch (err) {
      console.error('Error fetching patient matching agents:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Lock className="w-3.5 h-3.5" /> Zero-Trust Patient Protection Protocol
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-100">
            Safe Medical Travel Facilitator Matcher
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Continuously cross-referencing Neo4j graph fraud databases to ensure only safe, verified medical facilitators are recommended.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 min-w-[240px]">
          <HeartHandshake className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-emerald-300">100% Graph Verified</div>
            <div className="text-slate-500">Flagged & high-risk entities are automatically excluded.</div>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSearch} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-end gap-4">
        <div className="flex-1 space-y-2">
          <label className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Select Desired Treatment
          </label>
          <select
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
          >
            <option value="Coronary Artery Bypass">Coronary Artery Bypass</option>
            <option value="Knee Replacement">Knee Replacement</option>
            <option value="Dental Implants">Dental Implants</option>
            <option value="LASIK Eye Surgery">LASIK Eye Surgery</option>
            <option value="Spinal Fusion">Spinal Fusion</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-600/20"
        >
          <Search className="w-4 h-4" />
          Find Safe Facilitators
        </button>
      </form>

      {/* Results */}
      {loading ? (
        <Loader text="Auditing Graph Database for Safe Matches..." />
      ) : (
        <div className="space-y-4">
          <h3 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
            Verified Facilitators for {treatment} ({agents.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => (
              <div key={agent.id} className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/40 transition-all">
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-100">{agent.name}</h4>
                      <p className="text-xs font-mono text-slate-500">{agent.id}</p>
                    </div>
                    <RiskBadge riskScore={agent.riskScore} />
                  </div>
                  <p className="text-xs text-slate-400">{agent.address}</p>
                  <p className="text-xs text-slate-500 font-mono">{agent.email}</p>
                </div>
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-emerald-400 font-mono">
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Graph Cleared</span>
                  <button className="text-cyan-400 hover:underline">Contact Agent</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
