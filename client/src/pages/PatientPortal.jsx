import React, { useState, useEffect } from 'react';
import RequestForm from '../components/PatientView/RequestForm';
import AgentMatchList from '../components/PatientView/AgentMatchList';
import Loader from '../components/shared/Loader';
import { api } from '../services/api';
import { ShieldCheck, Lock, HeartHandshake } from 'lucide-react';

export default function PatientPortal() {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastQuery, setLastQuery] = useState(null);

  useEffect(() => {
    // Initial default safety search
    handleSearch({ treatment: 'Dental Surgery', country: 'Thailand', maxBudget: '10000' });
  }, []);

  const handleSearch = async (formData) => {
    setLoading(true);
    setLastQuery(formData);
    try {
      const res = await api.matchAgents(formData.treatment, formData.country, formData.maxBudget);
      if (res.success && res.data) {
        setRecommendations(res.data.recommendations || []);
      }
    } catch (err) {
      console.error('Error executing patient agent matching:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
      {/* Patient Hero Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <Lock className="w-3.5 h-3.5" /> Zero-Trust Patient Protection Protocol
          </div>
          <h2 className="text-2xl font-bold font-heading text-slate-100">
            Safe International Medical Facilitator Matching
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            Every medical travel facilitator on our network is continuously audited against graph database fraud patterns including shared offshore bank accounts, stolen licenses, and kickback rings.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 text-xs font-mono text-slate-300 min-w-[240px]">
          <HeartHandshake className="w-8 h-8 text-emerald-400 flex-shrink-0" />
          <div>
            <div className="font-bold text-emerald-300">100% Graph Verified</div>
            <div className="text-slate-500">Only low-risk facilitators are recommended for booking.</div>
          </div>
        </div>
      </div>

      {/* Patient Intake Request Form */}
      <RequestForm onSubmit={handleSearch} loading={loading} />

      {/* Matching Results */}
      {loading ? (
        <Loader text="Analyzing Multi-Entity Graph Database for Safe Matches..." />
      ) : (
        <AgentMatchList recommendations={recommendations} query={lastQuery} />
      )}
    </div>
  );
}
