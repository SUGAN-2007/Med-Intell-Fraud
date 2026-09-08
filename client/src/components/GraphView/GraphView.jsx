import React, { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, RotateCcw, ZoomIn, ZoomOut, ShieldAlert, CreditCard, Award } from 'lucide-react';
import { fetchGraph, fetchFraudPattern } from '../../services/api';

export default function GraphView({ graphData: initialGraphData, onNodeSelect, selectedNode }) {
  const fgRef = useRef();
  const containerRef = useRef();

  const [graphData, setGraphData] = useState(initialGraphData || { nodes: [], links: [] });
  const [fraudNodeIds, setFraudNodeIds] = useState(new Set());
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Auto-fetch Graph & Fraud Nodes on Mount
  useEffect(() => {
    let isMounted = true;

    Promise.all([
      fetchGraph(),
      fetchFraudPattern('shared-accounts'),
      fetchFraudPattern('duplicate-licenses'),
      fetchFraudPattern('circular-referrals'),
      fetchFraudPattern('high-connectivity')
    ]).then(([graphRes, sharedRes, dupRes, circRes, connRes]) => {
      if (!isMounted) return;

      if (graphRes?.nodes) {
        setGraphData(graphRes);
      }

      // Collect all node IDs involved in any fraud pattern
      const flaggedIds = new Set();

      (sharedRes || []).forEach(row => {
        if (row.clinic1) flaggedIds.add(row.clinic1);
        if (row.clinic2) flaggedIds.add(row.clinic2);
      });

      (dupRes || []).forEach(row => {
        if (row.doctor1) flaggedIds.add(row.doctor1);
        if (row.doctor2) flaggedIds.add(row.doctor2);
      });

      (circRes || []).forEach(row => {
        if (Array.isArray(row.cycle)) {
          row.cycle.forEach(id => flaggedIds.add(id));
        }
      });

      (connRes || []).forEach(row => {
        if (row.id) flaggedIds.add(row.id);
      });

      setFraudNodeIds(flaggedIds);
    }).catch(err => {
      console.error('Error fetching graph view data:', err);
    });

    return () => { isMounted = false; };
  }, []);

  // Update layout dimensions dynamically on resize
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Configure D3 Force Physics so nodes spread out comfortably across full canvas
  useEffect(() => {
    if (fgRef.current) {
      fgRef.current.d3Force('charge').strength(-700);
      fgRef.current.d3Force('link').distance(110);
      fgRef.current.d3ReheatSimulation();
    }
  }, [graphData]);

  // Zoom controls
  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 400);
  const handleResetZoom = () => fgRef.current?.zoomToFit(500, 70);

  // Determine node color by type & fraud status
  const getNodeColor = useCallback((node) => {
    if (selectedNode && selectedNode.id === node.id) {
      return '#06B6D4'; // Highlight Cyan when selected
    }

    // Filter Highlight Modes
    if (activeFilter === 'sharedAccounts' && (node.id === 'C7' || node.id === 'C8' || node.id === 'C9' || node.id === 'SHARED-BANK-999')) {
      return '#EF4444';
    }
    if (activeFilter === 'duplicateLicenses' && (node.id === 'D7' || node.id === 'D8')) {
      return '#F59E0B';
    }
    if (activeFilter === 'circularReferrals' && (node.id === 'A7' || node.id === 'A8' || node.id === 'A9')) {
      return '#A855F7';
    }

    // Color RED if node appears in any fraud pattern
    if (fraudNodeIds.has(node.id)) {
      return '#EF4444'; // Red Alert
    }

    const type = node.type || node.label;
    switch (type) {
      case 'Agent': return '#38BDF8';  // Sky Blue
      case 'Clinic': return '#34D399'; // Emerald Green
      case 'Doctor': return '#A855F7'; // Purple
      case 'Patient': return '#94A3B8';// Slate Gray
      default: return '#64748B';
    }
  }, [selectedNode, fraudNodeIds, activeFilter]);

  // Custom Node Rendering with Text Background Pills
  const drawCanvasNode = useCallback((node, ctx, globalScale) => {
    const label = node.name || node.id;
    const fontSize = Math.max(11, 13 / globalScale);
    const type = node.type || node.label;
    const radius = type === 'Agent' ? 14 : type === 'Clinic' ? 12 : type === 'Doctor' ? 10 : 8;

    const isFraud = fraudNodeIds.has(node.id);
    const isSelected = selectedNode && selectedNode.id === node.id;
    const isMatch = searchTerm && label.toLowerCase().includes(searchTerm.toLowerCase());

    // Outer Glow Ring for Fraud, Selected, or Search Matched Nodes
    if (isFraud || isSelected || isMatch) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI, false);
      ctx.fillStyle = isSelected
        ? 'rgba(6, 182, 212, 0.45)'
        : isFraud
        ? 'rgba(239, 68, 68, 0.45)'
        : 'rgba(251, 191, 36, 0.45)';
      ctx.fill();
    }

    // Main Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();

    // Node Border
    ctx.lineWidth = 2 / globalScale;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Text Label with Background Pill
    if (globalScale >= 0.5 || isSelected || isMatch || isFraud) {
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bPadding = 5 / globalScale;
      const labelY = node.y + radius + 11 / globalScale;

      // Label background pill
      ctx.fillStyle = 'rgba(7, 10, 18, 0.92)';
      ctx.fillRect(
        node.x - textWidth / 2 - bPadding,
        labelY - fontSize / 2 - 2 / globalScale,
        textWidth + bPadding * 2,
        fontSize + 4 / globalScale
      );

      // Pill border
      ctx.lineWidth = 1 / globalScale;
      ctx.strokeStyle = isSelected
        ? 'rgba(6, 182, 212, 0.6)'
        : isFraud
        ? 'rgba(239, 68, 68, 0.6)'
        : 'rgba(51, 65, 85, 0.6)';
      ctx.strokeRect(
        node.x - textWidth / 2 - bPadding,
        labelY - fontSize / 2 - 2 / globalScale,
        textWidth + bPadding * 2,
        fontSize + 4 / globalScale
      );

      // Label text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSelected ? '#38BDF8' : isFraud ? '#FCA5A5' : '#F8FAFC';
      ctx.fillText(label, node.x, labelY);
    }
  }, [getNodeColor, selectedNode, searchTerm, fraudNodeIds]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden bg-[#070A12] flex-1 select-none">
      {/* Top Search & Filter Bar */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search graph nodes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-slate-900/95 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 w-56 backdrop-blur-xl shadow-2xl"
          />
        </div>

        {/* Filter Button Strip */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl flex-wrap">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            All Nodes
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'sharedAccounts' ? 'all' : 'sharedAccounts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'sharedAccounts'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Shared Accounts
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'duplicateLicenses' ? 'all' : 'duplicateLicenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'duplicateLicenses'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Duplicate Licenses
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'circularReferrals' ? 'all' : 'circularReferrals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === 'circularReferrals'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Circular Kickbacks
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 p-1.5 rounded-xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <button onClick={handleZoomIn} className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="p-2 text-slate-300 hover:text-cyan-400 transition-colors cursor-pointer" title="Reset View">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Graph Legend */}
      <div className="absolute bottom-4 left-4 z-20 p-3.5 rounded-xl bg-slate-900/95 border border-slate-800 backdrop-blur-xl shadow-2xl text-xs font-mono space-y-2 text-slate-300">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Graph Node Legend</div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#38BDF8]" /> Agent (Blue)</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#34D399]" /> Clinic (Green)</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#A855F7]" /> Doctor (Purple)</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#94A3B8]" /> Patient (Gray)</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#EF4444]" /> Fraud Flagged (Red)</div>
        </div>
      </div>

      {/* Force Graph Canvas */}
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={drawCanvasNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 18, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onNodeClick={(node) => onNodeSelect(node)}
        onEngineStop={() => fgRef.current?.zoomToFit(500, 80)}
        linkLabel={(link) => `${link.type}`}
        linkColor={() => '#334155'}
        linkWidth={2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        backgroundColor="#070A12"
      />
    </div>
  );
}
