import React, { useState } from 'react';
import { Search, Stethoscope, Globe, DollarSign, ShieldCheck } from 'lucide-react';

export default function RequestForm({ onSubmit, loading }) {
  const [treatment, setTreatment] = useState('Dental Surgery');
  const [country, setCountry] = useState('Thailand');
  const [budget, setBudget] = useState('10000');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ treatment, country, maxBudget: budget });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-2xl glass-panel border border-slate-800 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
        <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-100 font-heading">
            AI-Verified Patient Facilitator Matcher
          </h2>
          <p className="text-xs text-slate-400">
            Submit your medical tourism request. Our Graph AI filters out high-risk agents and ranks verified safe partners.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Treatment Needed */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
            Treatment Required
          </label>
          <select
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="Dental Surgery">Dental Surgery</option>
            <option value="Cardiology">Cardiology & Heart Care</option>
            <option value="Cosmetic Surgery">Cosmetic & Plastic Surgery</option>
            <option value="Hair Transplant">Hair Restoration</option>
            <option value="Oncology">Oncology Treatments</option>
            <option value="Orthopedics">Orthopedic Surgery</option>
          </select>
        </div>

        {/* Preferred Destination */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            Destination Country
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50"
          >
            <option value="Thailand">Thailand</option>
            <option value="Turkey">Turkey</option>
            <option value="Mexico">Mexico</option>
            <option value="India">India</option>
          </select>
        </div>

        {/* Budget Limit */}
        <div className="space-y-1.5">
          <label className="text-xs font-mono uppercase text-slate-400 flex items-center gap-1.5">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            Max Budget (USD)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 10000"
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-600 font-bold text-white text-sm shadow-lg shadow-emerald-500/20 hover:opacity-95 transition-all flex items-center justify-center gap-2"
      >
        <Search className="w-4 h-4" />
        {loading ? 'Running Graph Safety Scan...' : 'Find AI-Verified Facilitators'}
      </button>
    </form>
  );
}
