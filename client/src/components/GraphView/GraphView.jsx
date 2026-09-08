import React, { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, RotateCcw, ZoomIn, ZoomOut, ShieldAlert, CreditCard, Award, RefreshCw } from 'lucide-react';

export default function GraphView({ graphData, onNodeSelect, selectedNode, activeFilter, setActiveFilter }) {
  const fgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [searchTerm, setSearchTerm] = useState('');

  // Handle window & container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Zoom controls
  const handleZoomIn = () => fgRef.current?.zoom(fgRef.current.zoom() * 1.3, 400);
  const handleZoomOut = () => fgRef.current?.zoom(fgRef.current.zoom() / 1.3, 400);
  const handleResetZoom = () => {
    fgRef.current?.zoomToFit(400, 50);
  };

  // Node Color mapping by Label & Fraud Flag
  const getNodeColor = useCallback((node) => {
    if (selectedNode && selectedNode.id === node.id) {
      return '#06B6D4'; // Highlight Cyan
    }

    if (activeFilter === 'sharedAccounts' && (node.id === 'agent_001' || node.id === 'clinic_003' || node.id === 'agent_004' || node.id === 'bank_001')) {
      return '#F43F5E'; // Red alert
    }

    if (activeFilter === 'duplicateLicenses' && (node.id === 'doc_004' || node.id === 'doc_007' || node.id === 'license_001')) {
      return '#F59E0B'; // Amber alert
    }

    if (activeFilter === 'circularReferrals' && (node.id === 'agent_002' || node.id === 'clinic_002' || node.id === 'doc_003')) {
      return '#A855F7'; // Purple alert
    }

    switch (node.label) {
      case 'Agent': return '#38BDF8'; // Cyan/Sky
      case 'Clinic': return '#6366F1'; // Indigo
      case 'Doctor': return '#34D399'; // Emerald
      case 'BankAccount': return '#F43F5E'; // Rose
      case 'LicenseRecord': return '#F59E0B'; // Amber
      case 'Patient': return '#14B8A6'; // Teal
      default: return '#94A3B8';
    }
  }, [selectedNode, activeFilter]);

  // Custom Canvas Node Rendering
  const drawCanvasNode = useCallback((node, ctx, globalScale) => {
    const label = node.name || node.id;
    const fontSize = 12 / globalScale;
    const radius = node.label === 'Agent' ? 10 : node.label === 'Clinic' ? 8 : 6;

    const isMatch = searchTerm && label.toLowerCase().includes(searchTerm.toLowerCase());
    const isSelected = selectedNode && selectedNode.id === node.id;

    // Draw Outer Glow for selected or search matched node
    if (isSelected || isMatch) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 4, 0, 2 * Math.PI, false);
      ctx.fillStyle = isSelected ? 'rgba(6, 182, 212, 0.4)' : 'rgba(251, 191, 36, 0.4)';
      ctx.fill();
    }

    // Draw Main Node Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();

    // Node Border
    ctx.lineWidth = 1.5 / globalScale;
    ctx.strokeStyle = '#0F172A';
    ctx.stroke();

    // Node Text Label
    if (globalScale >= 0.8 || isSelected || isMatch) {
      ctx.font = `${fontSize}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSelected ? '#38BDF8' : '#E2E8F0';
      ctx.fillText(label, node.x, node.y + radius + 10);
    }
  }, [getNodeColor, selectedNode, searchTerm]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-slate-950 overflow-hidden select-none">
      {/* Top Controls Overlay */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search nodes by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 w-64 backdrop-blur-md shadow-lg"
          />
        </div>

        {/* Fraud Pattern Filter Toggles */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
          <button
            onClick={() => setActiveFilter(activeFilter === 'all' ? 'all' : 'all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all ${
              activeFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Nodes
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'sharedAccounts' ? 'all' : 'sharedAccounts')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'sharedAccounts' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Shared Accounts
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'duplicateLicenses' ? 'all' : 'duplicateLicenses')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'duplicateLicenses' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            Duplicate Licenses
          </button>
          <button
            onClick={() => setActiveFilter(activeFilter === 'circularReferrals' ? 'all' : 'circularReferrals')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeFilter === 'circularReferrals' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            Circular Kickbacks
          </button>
        </div>
      </div>

      {/* Right Zoom Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2 p-1 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
        <button onClick={handleZoomIn} className="p-2 text-slate-300 hover:text-cyan-400 transition-colors" title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </button>
        <button onClick={handleZoomOut} className="p-2 text-slate-300 hover:text-cyan-400 transition-colors" title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </button>
        <button onClick={handleResetZoom} className="p-2 text-slate-300 hover:text-cyan-400 transition-colors" title="Reset View">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Graph Legend */}
      <div className="absolute bottom-4 left-4 z-20 p-3 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg text-[11px] font-mono space-y-1.5 text-slate-300">
        <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Graph Node Types</div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" /> Agent</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#6366F1]" /> Clinic</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#34D399]" /> Doctor</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F43F5E]" /> Bank Account</div>
          <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" /> License</div>
        </div>
      </div>

      {/* Force Graph Renderer */}
      <ForceGraph2D
        ref={fgRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeCanvasObject={drawCanvasNode}
        nodePointerAreaPaint={(node, color, ctx) => {
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.arc(node.x, node.y, 12, 0, 2 * Math.PI, false);
          ctx.fill();
        }}
        onNodeClick={(node) => onNodeSelect(node)}
        linkLabel={(link) => `${link.type}`}
        linkColor={() => '#334155'}
        linkWidth={1.5}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkDirectionalParticleWidth={2}
        backgroundColor="#070A12"
      />
    </div>
  );
}
