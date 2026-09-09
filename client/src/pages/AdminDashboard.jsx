import React, { useState, useEffect } from 'react';
import GraphView from '../components/GraphView/GraphView';
import NodeDetailPanel from '../components/GraphView/NodeDetailPanel';
import Loader from '../components/shared/Loader';
import { fetchFraudPattern, fetchGraph } from '../services/api';
import { CreditCard, Award, GitCommit, Zap, Download, RefreshCw } from 'lucide-react';

const STATS_META = [
  {
    key: 'sharedCount',
    label: 'Shared Accounts',
    Icon: CreditCard,
    color: '#f43f5e',
    bg: 'rgba(244,63,94,0.08)',
    border: 'rgba(244,63,94,0.22)',
  },
  {
    key: 'duplicateCount',
    label: 'Duplicate Licenses',
    Icon: Award,
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.22)',
  },
  {
    key: 'circularCount',
    label: 'Referral Loops',
    Icon: GitCommit,
    color: '#a78bfa',
    bg: 'rgba(167,139,250,0.08)',
    border: 'rgba(167,139,250,0.22)',
  },
  {
    key: 'highConnectivityCount',
    label: 'Anomalies',
    Icon: Zap,
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
    border: 'rgba(6,182,212,0.22)',
  },
];

export default function AdminDashboard({ onNodeSelect, selectedNode }) {
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);
  const [fraudStats, setFraudStats] = useState({
    sharedCount: 0,
    duplicateCount: 0,
    circularCount: 0,
    highConnectivityCount: 0,
  });

  useEffect(() => { loadDashboardData(); }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [graphRes, sharedRes, dupRes, circRes, connRes] = await Promise.all([
        fetchGraph(),
        fetchFraudPattern('shared-accounts'),
        fetchFraudPattern('duplicate-licenses'),
        fetchFraudPattern('circular-referrals'),
        fetchFraudPattern('high-connectivity'),
      ]);
      if (graphRes?.nodes) setGraphData(graphRes);
      setFraudStats({
        sharedCount:           Array.isArray(sharedRes) ? sharedRes.length : (sharedRes?.count || 0),
        duplicateCount:        Array.isArray(dupRes)    ? dupRes.length    : (dupRes?.count    || 0),
        circularCount:         Array.isArray(circRes)   ? circRes.length   : (circRes?.count   || 0),
        highConnectivityCount: Array.isArray(connRes)   ? connRes.length   : (connRes?.count   || 0),
      });
    } catch (err) {
      console.error('Error loading dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    try {
      const report = {
        title: 'Medical Fraud Intelligence Graph Audit Report',
        timestamp: new Date().toISOString(),
        summaryStats: { totalNodes: graphData.nodes?.length || 0, totalEdges: graphData.links?.length || 0, ...fraudStats },
        nodes: graphData.nodes,
      };
      const a = document.createElement('a');
      a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
      a.download = `med_fraud_report_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full h-full overflow-hidden" style={{ background: '#030303' }}>

      {/* ── Fraud Stats Strip ── */}
      <div
        style={{
          height: 52,
          flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(5,5,5,0.95)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          gap: 12,
        }}
      >
        {/* Stat pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {STATS_META.map(({ key, label, Icon, color, bg, border }) => (
            <div
              key={key}
              className="stat-card"
              style={{ background: bg, border: `1px solid ${border}`, padding: '7px 14px', gap: 8, borderRadius: 9 }}
            >
              <Icon size={13} style={{ color, flexShrink: 0 }} />
              <span
                className="font-mono font-bold"
                style={{ color, fontSize: 13 }}
              >
                {fraudStats[key]}
              </span>
              <span
                className="font-mono hidden sm:inline"
                style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11 }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={handleExport} className="btn btn-ghost" style={{ borderRadius: 9 }}>
            <Download size={13} />
            Export
          </button>
          <button
            onClick={loadDashboardData}
            disabled={loading}
            className="btn btn-ghost"
            style={{ borderRadius: 9, opacity: loading ? 0.5 : 1 }}
          >
            <RefreshCw size={13} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {loading ? (
          <div
            className="flex-1 flex items-center justify-center"
            style={{ background: '#030303' }}
          >
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

        {/* Node Inspector */}
        {selectedNode && (
          <NodeDetailPanel node={selectedNode} onClose={() => onNodeSelect(null)} />
        )}
      </div>
    </div>
  );
}
