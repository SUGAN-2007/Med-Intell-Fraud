import React, { useState, useEffect } from 'react';
import GraphView from '../components/GraphView/GraphView';
import NodeDetailPanel from '../components/GraphView/NodeDetailPanel';
import Loader from '../components/shared/Loader';
import { api } from '../services/api';
import { ShieldAlert, CreditCard, Award, RefreshCw, Activity } from 'lucide-react';

export default function AdminDashboard({ onNodeSelect, selectedNode }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  const [fraudStats, setFraudStats] = useState({
    sharedCount: 0,
    duplicateCount: 0,
    circularCount: 0,
    highDegreeCount: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const graphRes = await api.getGraphData();
      if (graphRes.success) {
        setGraphData(graphRes.data);
      }

      // Fetch fraud query counts
      const [sharedRes, dupRes, circRes, degRes] = await Promise.all([
        api.getSharedAccounts(),
        api.getDuplicateLicenses(),
        api.getCircularReferrals(),
        api.getHighDegreeNodes(4)
      ]);

      setFraudStats({
        sharedCount: sharedRes.count || 0,
        duplicateCount: dupRes.count || 0,
        circularCount: circRes.count || 0,
        highDegreeCount: degRes.count || 0
      });
    } catch (err) {
      console.error('Error fetching admin dashboard graph data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] overflow-hidden">
      {/* Active Fraud Alerts Summary Ticker */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Shared Accounts:</span>
            <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
              {fraudStats.sharedCount} Flagged
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <Award className="w-3.5 h-3.5" />
            <span>Duplicate Licenses:</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
              {fraudStats.duplicateCount} Flagged
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-purple-400 font-semibold">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Circular Kickbacks:</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
              {fraudStats.circularCount} Rings
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
            <Activity className="w-3.5 h-3.5" />
            <span>High Degree Anomaly:</span>
            <span className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              {fraudStats.highDegreeCount} Nodes
            </span>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={loading}
          className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Graph
        </button>
      </div>

      {/* Main Graph & Inspector Container */}
      <div className="flex-1 flex overflow-hidden relative">
        {loading ? (
          <div className="flex-1 flex items-center justify-center bg-slate-950">
            <Loader text="Constructing Multi-Entity Fraud Intelligence Graph..." />
          </div>
        ) : (
          <div className="flex-1 relative">
            <GraphView
              graphData={graphData}
              onNodeSelect={onNodeSelect}
              selectedNode={selectedNode}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
            />
          </div>
        )}

        {/* Sliding Node Detail Panel */}
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
