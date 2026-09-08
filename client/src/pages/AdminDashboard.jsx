import React, { useState, useEffect } from 'react';
import GraphView from '../components/GraphView/GraphView';
import NodeDetailPanel from '../components/GraphView/NodeDetailPanel';
import Loader from '../components/shared/Loader';
import { fetchFraudPattern, fetchGraph } from '../services/api';
import { ShieldAlert, CreditCard, Award, RefreshCw, Activity } from 'lucide-react';

export default function AdminDashboard({ onNodeSelect, selectedNode }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  const [fraudStats, setFraudStats] = useState({
    sharedCount: 0,
    duplicateCount: 0,
    circularCount: 0,
    highConnectivityCount: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [graphRes, sharedRes, dupRes, circRes, connRes] = await Promise.all([
        fetchGraph(),
        fetchFraudPattern('shared-accounts'),
        fetchFraudPattern('duplicate-licenses'),
        fetchFraudPattern('circular-referrals'),
        fetchFraudPattern('high-connectivity')
      ]);

      if (graphRes && graphRes.nodes) {
        setGraphData(graphRes);
      }

      setFraudStats({
        sharedCount: Array.isArray(sharedRes) ? sharedRes.length : (sharedRes?.count || 0),
        duplicateCount: Array.isArray(dupRes) ? dupRes.length : (dupRes?.count || 0),
        circularCount: Array.isArray(circRes) ? circRes.length : (circRes?.count || 0),
        highConnectivityCount: Array.isArray(connRes) ? connRes.length : (connRes?.count || 0)
      });
    } catch (err) {
      console.error('Error loading Admin Dashboard live data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden relative bg-slate-950">
      {/* Live Fraud Summary Strip */}
      <div className="h-12 flex-shrink-0 bg-slate-900/90 border-b border-slate-800/90 px-6 backdrop-blur-xl flex items-center justify-between text-xs font-mono z-30">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-bold whitespace-nowrap">
            <CreditCard className="w-4 h-4 text-rose-400" />
            <span>{fraudStats.sharedCount} Shared Accounts Detected</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold whitespace-nowrap">
            <Award className="w-4 h-4 text-amber-400" />
            <span>{fraudStats.duplicateCount} Duplicate Licenses</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-bold whitespace-nowrap">
            <ShieldAlert className="w-4 h-4 text-purple-400" />
            <span>{fraudStats.circularCount} Referral Loops</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-bold whitespace-nowrap">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>{fraudStats.highConnectivityCount} Connectivity Anomalies</span>
          </div>
        </div>

        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-cyan-400 text-xs font-mono font-semibold transition-all border border-slate-700 cursor-pointer whitespace-nowrap flex-shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Live Data
        </button>
      </div>

      {/* Main Screen Layout (Graph & Inspector Panel) */}
      <div className="flex-1 flex w-full h-full overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-slate-950">
            <Loader text="Loading Neo4j Fraud Graph..." />
          </div>
        ) : (
          <div className="flex-1 relative w-full h-full overflow-hidden">
            <GraphView
              graphData={graphData}
              onNodeSelect={onNodeSelect}
              selectedNode={selectedNode}
            />
          </div>
        )}

        {/* Node Inspector Panel */}
        {selectedNode && (
          <NodeDetailPanel
            node={selectedNode}
            onClose={() => onNodeSelect(null)}
          />
        )}
      </div>
    </div>
  );
}
