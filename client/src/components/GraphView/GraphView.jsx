import React, { useRef, useCallback, useEffect, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { Search, RotateCcw, ZoomIn, ZoomOut, ShieldAlert, CreditCard, Award } from 'lucide-react';
import { fetchGraph, fetchFraudPattern } from '../../services/api';

export default function GraphView({ graphData: initialGraphData, onNodeSelect, selectedNode }) {
  const fgRef = useRef();
  const containerRef = useRef();

  const [graphData, setGraphData] = useState(initialGraphData || { nodes: [], links: [] });

  // Sets for specific fraud patterns
  const [fraudNodeIds, setFraudNodeIds] = useState(new Set());
  const [sharedAccountIds, setSharedAccountIds] = useState(new Set());
  const [duplicateLicenseIds, setDuplicateLicenseIds] = useState(new Set());
  const [circularReferralIds, setCircularReferralIds] = useState(new Set());

  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [searchTerm, setSearchTerm] = useState('');
  const [hoverNode, setHoverNode] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  // Auto-fetch Graph & Fraud Pattern Datasets on Mount
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

      const allFlagged = new Set();
      const sharedSet = new Set();
      const dupSet = new Set();
      const circSet = new Set();

      (sharedRes || []).forEach(row => {
        if (row.clinic1) { sharedSet.add(row.clinic1); allFlagged.add(row.clinic1); }
        if (row.clinic2) { sharedSet.add(row.clinic2); allFlagged.add(row.clinic2); }
      });

      (dupRes || []).forEach(row => {
        if (row.doctor1) { dupSet.add(row.doctor1); allFlagged.add(row.doctor1); }
        if (row.doctor2) { dupSet.add(row.doctor2); allFlagged.add(row.doctor2); }
      });

      (circRes || []).forEach(row => {
        if (Array.isArray(row.cycle)) {
          row.cycle.forEach(id => { circSet.add(id); allFlagged.add(id); });
        }
      });

      (connRes || []).forEach(row => {
        if (row.id) allFlagged.add(row.id);
      });

      setFraudNodeIds(allFlagged);
      setSharedAccountIds(sharedSet);
      setDuplicateLicenseIds(dupSet);
      setCircularReferralIds(circSet);
    }).catch(err => {
      console.error('Error fetching graph view data:', err);
    });

    return () => { isMounted = false; };
  }, []);

  // Update layout dimensions dynamically on container resize
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

  // Auto-center & zoom camera on search match
  useEffect(() => {
    if (!searchTerm || !graphData.nodes || graphData.nodes.length === 0) return;

    const match = graphData.nodes.find(n =>
      (n.name || n.id).toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (match && match.x !== undefined && match.y !== undefined && fgRef.current) {
      fgRef.current.centerAt(match.x, match.y, 500);
      fgRef.current.zoom(2.2, 500);
    }
  }, [searchTerm, graphData]);

  // Configure D3 Force Physics so nodes spread out comfortably
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

  // Helper to check if node matches active filter tab
  const isNodeInActiveFilter = useCallback((node) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'sharedAccounts') return sharedAccountIds.has(node.id);
    if (activeFilter === 'duplicateLicenses') return duplicateLicenseIds.has(node.id);
    if (activeFilter === 'circularReferrals') return circularReferralIds.has(node.id);
    return true;
  }, [activeFilter, sharedAccountIds, duplicateLicenseIds, circularReferralIds]);

  // Node Color Assignment
  const getNodeColor = useCallback((node) => {
    if (selectedNode && selectedNode.id === node.id) {
      return '#06B6D4'; // Highlight Cyan when selected
    }

    if (fraudNodeIds.has(node.id)) {
      return '#EF4444'; // Bright Red for Fraud
    }

    const type = node.type || node.label;
    switch (type) {
      case 'Agent': return '#38BDF8';  // Sky Blue
      case 'Clinic': return '#34D399'; // Emerald Green
      case 'Doctor': return '#A855F7'; // Purple
      case 'Patient': return '#94A3B8';// Slate Gray
      default: return '#64748B';
    }
  }, [selectedNode, fraudNodeIds]);

  // Custom Node Canvas Painting
  const drawCanvasNode = useCallback((node, ctx, globalScale) => {
    const label = node.name || node.id;
    const fontSize = Math.max(11, 13 / globalScale);
    const type = node.type || node.label;
    const radius = type === 'Agent' ? 14 : type === 'Clinic' ? 12 : type === 'Doctor' ? 10 : 8;

    const isFraud = fraudNodeIds.has(node.id);
    const isSelected = selectedNode && selectedNode.id === node.id;
    const isHovered = hoverNode && hoverNode.id === node.id;
    const isSearchMatch = searchTerm && label.toLowerCase().includes(searchTerm.toLowerCase());
    const isFilterActive = isNodeInActiveFilter(node);

    // Dim non-matching nodes when filter or search is active
    ctx.globalAlpha = (activeFilter !== 'all' && !isFilterActive) || (searchTerm && !isSearchMatch) ? 0.15 : 1.0;

    // Outer Glow Ring
    if (isFraud || isSelected || isSearchMatch || isHovered) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 6, 0, 2 * Math.PI, false);
      ctx.fillStyle = isSelected || isHovered
        ? 'rgba(6, 182, 212, 0.5)'
        : isFraud
        ? 'rgba(239, 68, 68, 0.5)'
        : 'rgba(251, 191, 36, 0.5)';
      ctx.fill();
    }

    // Main Circle
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = getNodeColor(node);
    ctx.fill();

    // Node Border
    ctx.lineWidth = 2 / globalScale;
    ctx.strokeStyle = '#000000';
    ctx.stroke();

    // Text Label (Rendered cleanly with background pill on selection, hover, search, or zoom)
    if (globalScale >= 0.75 || isSelected || isHovered || isSearchMatch || (isFraud && activeFilter !== 'all')) {
      ctx.font = `600 ${fontSize}px Inter, sans-serif`;
      const textWidth = ctx.measureText(label).width;
      const bPadding = 6 / globalScale;
      const labelY = node.y + radius + 11 / globalScale;

      // Label background pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
      ctx.fillRect(
        node.x - textWidth / 2 - bPadding,
        labelY - fontSize / 2 - 2 / globalScale,
        textWidth + bPadding * 2,
        fontSize + 4 / globalScale
      );

      // Pill border
      ctx.lineWidth = 1 / globalScale;
      ctx.strokeStyle = isSelected || isHovered
        ? 'rgba(6, 182, 212, 0.7)'
        : isFraud
        ? 'rgba(239, 68, 68, 0.7)'
        : 'rgba(64, 64, 64, 0.7)';
      ctx.strokeRect(
        node.x - textWidth / 2 - bPadding,
        labelY - fontSize / 2 - 2 / globalScale,
        textWidth + bPadding * 2,
        fontSize + 4 / globalScale
      );

      // Label text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isSelected ? '#38BDF8' : isFraud ? '#FCA5A5' : '#FFFFFF';
      ctx.fillText(label, node.x, labelY);
    }

    ctx.globalAlpha = 1.0;
  }, [getNodeColor, selectedNode, hoverNode, searchTerm, fraudNodeIds, activeFilter, isNodeInActiveFilter]);

  return (
    <div ref={containerRef} className="w-full h-full relative overflow-hidden flex-1 select-none" style={{ background: '#030303' }}>

      {/* ── Top: Search + Filter Bar ── */}
      <div style={{ position: 'absolute', top: 18, left: 18, zIndex: 20, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ color: '#525252', position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input
            type="text"
            placeholder="Search nodes…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              paddingLeft: 32,
              paddingRight: 14,
              paddingTop: 8,
              paddingBottom: 8,
              borderRadius: 10,
              background: 'rgba(8,8,8,0.97)',
              border: '1px solid rgba(255,255,255,0.09)',
              fontSize: 12,
              color: '#e5e5e5',
              width: 220,
              outline: 'none',
              boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; }}
            onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.09)'; }}
          />
        </div>

        {/* Filter pills */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 4, padding: 4,
          borderRadius: 10, background: 'rgba(8,8,8,0.97)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          flexWrap: 'wrap',
        }}>
          {[
            { id: 'all', label: 'All', color: '#06b6d4' },
            { id: 'sharedAccounts',    label: `Shared (${sharedAccountIds.size})`,      color: '#f43f5e', Icon: CreditCard },
            { id: 'duplicateLicenses', label: `Duplicates (${duplicateLicenseIds.size})`, color: '#f59e0b', Icon: Award },
            { id: 'circularReferrals', label: `Loops (${circularReferralIds.size})`,    color: '#a855f7', Icon: ShieldAlert },
          ].map(({ id, label, color, Icon }) => {
            const active = activeFilter === id;
            return (
              <button
                key={id}
                onClick={() => setActiveFilter(active && id !== 'all' ? 'all' : id)}
                className="font-mono font-bold"
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 11px', borderRadius: 7,
                  fontSize: 11, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: active ? `${color}18` : 'transparent',
                  border: active ? `1px solid ${color}40` : '1px solid transparent',
                  color: active ? color : '#525252',
                  transition: 'all 0.18s ease',
                }}
              >
                {Icon && <Icon size={11} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Zoom Controls ── */}
      <div style={{
        position: 'absolute', top: 18, right: 18, zIndex: 20,
        display: 'flex', flexDirection: 'column', gap: 2,
        padding: 4, borderRadius: 10,
        background: 'rgba(8,8,8,0.97)', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}>
        {[
          { action: handleZoomIn,    Icon: ZoomIn,    title: 'Zoom In' },
          { action: handleZoomOut,   Icon: ZoomOut,   title: 'Zoom Out' },
          { action: handleResetZoom, Icon: RotateCcw, title: 'Fit View' },
        ].map(({ action, Icon, title }) => (
          <button
            key={title}
            onClick={action}
            title={title}
            style={{
              padding: '8px', borderRadius: 7, background: 'transparent',
              border: 'none', cursor: 'pointer', color: '#525252',
              transition: 'all 0.15s ease', display: 'flex',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.1)'; e.currentTarget.style.color = '#06b6d4'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#525252'; }}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>

      {/* ── Bottom-left: Legend ── */}
      <div style={{
        position: 'absolute', bottom: 18, left: 18, zIndex: 20,
        padding: '12px 16px', borderRadius: 12,
        background: 'rgba(8,8,8,0.97)', border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
      }}>
        <p className="font-mono font-bold uppercase" style={{ fontSize: 9, color: '#404040', letterSpacing: '0.8px', marginBottom: 8 }}>Legend</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          {[
            { color: '#38BDF8', label: 'Agent' },
            { color: '#34D399', label: 'Clinic' },
            { color: '#A855F7', label: 'Doctor' },
            { color: '#94A3B8', label: 'Patient' },
            { color: '#EF4444', label: 'Fraud' },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block', boxShadow: `0 0 6px ${color}80` }} />
              <span className="font-mono" style={{ fontSize: 11, color: '#737373' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Force Graph Canvas ── */}
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
        onNodeHover={(node) => setHoverNode(node)}
        onEngineStop={() => fgRef.current?.zoomToFit(500, 80)}
        linkLabel={(link) => `${link.type}`}
        linkColor={() => {
          if (activeFilter === 'sharedAccounts') return '#f43f5e';
          if (activeFilter === 'circularReferrals') return '#a855f7';
          return '#1c1c1c';
        }}
        linkWidth={1.2}
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.004}
        linkDirectionalParticleWidth={2}
        backgroundColor="#030303"
      />
    </div>
  );
}
