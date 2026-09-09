import React, { useState, useEffect } from 'react';
import Loader from '../components/shared/Loader';
import RiskBadge from '../components/shared/RiskBadge';
import { matchAgents } from '../services/api';
import { Lock, HeartHandshake, Search, ShieldCheck, ShieldAlert, AlertTriangle, ChevronDown } from 'lucide-react';

const TREATMENTS = [
  'Coronary Artery Bypass',
  'Knee Replacement',
  'Dental Implants',
  'LASIK Eye Surgery',
  'Spinal Fusion',
  'Cosmetic Surgery',
];

/* ─── Verified Agent Card ─── */
function VerifiedCard({ agent }) {
  return (
    <div
      style={{
        borderRadius: 14,
        background: 'rgba(10,10,10,0.9)',
        border: '1px solid rgba(255,255,255,0.07)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(16,185,129,0.35)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(16,185,129,0.08)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: '#f5f5f5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {agent.name}
          </h4>
          <p className="font-mono" style={{ fontSize: 10, color: '#525252', marginTop: 3 }}>{agent.id}</p>
        </div>
        <RiskBadge riskScore={agent.riskScore} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {agent.address && (
          <p style={{ fontSize: 12, color: '#737373', lineHeight: 1.5 }}>{agent.address}</p>
        )}
        {agent.email && (
          <p className="font-mono" style={{ fontSize: 11, color: '#525252' }}>{agent.email}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="font-mono font-semibold" style={{ fontSize: 11, color: '#34d399', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ShieldCheck size={12} />
          Graph Verified
        </span>
        <button
          style={{
            padding: '6px 14px',
            borderRadius: 8,
            background: 'rgba(6,182,212,0.08)',
            border: '1px solid rgba(6,182,212,0.25)',
            color: '#67e8f9',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            transition: 'all 0.15s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.16)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(6,182,212,0.08)'; }}
        >
          Contact
        </button>
      </div>
    </div>
  );
}

/* ─── Flagged Agent Card ─── */
function FlaggedCard({ agent }) {
  return (
    <div
      style={{
        borderRadius: 14,
        background: 'rgba(10,10,10,0.9)',
        border: '1px solid rgba(244,63,94,0.22)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        opacity: 0.92,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <h4
            style={{
              fontSize: 14, fontWeight: 700, color: '#737373',
              textDecoration: 'line-through',
              textDecorationColor: 'rgba(244,63,94,0.6)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {agent.name}
          </h4>
          <p className="font-mono" style={{ fontSize: 10, color: '#f43f5e', marginTop: 3 }}>{agent.id} — FLAGGED</p>
        </div>
        <RiskBadge riskScore={agent.riskScore} />
      </div>

      {(agent.triggeredPatterns || []).length > 0 && (
        <div>
          <p className="font-mono font-bold uppercase" style={{ fontSize: 9, color: '#f43f5e', letterSpacing: '0.7px', marginBottom: 6 }}>
            Fraud Signals
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {agent.triggeredPatterns.map((p, i) => (
              <span
                key={i}
                className="font-mono font-bold"
                style={{
                  padding: '3px 8px', borderRadius: 6,
                  background: 'rgba(244,63,94,0.1)',
                  border: '1px solid rgba(244,63,94,0.25)',
                  color: '#fca5a5',
                  fontSize: 10,
                }}
              >
                {p.replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-mono font-semibold" style={{ fontSize: 11, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 5 }}>
          <AlertTriangle size={12} />
          Excluded
        </span>
        <span
          className="font-mono font-bold uppercase"
          style={{
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(244,63,94,0.08)',
            border: '1px solid rgba(244,63,94,0.2)',
            color: '#f43f5e',
            fontSize: 10, letterSpacing: '0.5px',
          }}
        >
          Booking Blocked
        </span>
      </div>
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHeader({ icon: Icon, title, count, badge, badgeColor = '#34d399' }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={18} style={{ color: badgeColor }} />
        <h3 className="font-heading font-bold text-white" style={{ fontSize: 16 }}>
          {title} <span style={{ color: '#525252', fontWeight: 400, fontSize: 14 }}>({count})</span>
        </h3>
      </div>
      {badge && (
        <span
          className="font-mono font-bold"
          style={{
            fontSize: 10, padding: '4px 10px', borderRadius: 6,
            background: `${badgeColor}12`,
            border: `1px solid ${badgeColor}30`,
            color: badgeColor,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export default function PatientPortal() {
  const [treatment, setTreatment] = useState('Coronary Artery Bypass');
  const [verifiedAgents, setVerifiedAgents] = useState([]);
  const [flaggedAgents, setFlaggedAgents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { handleSearch(); }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await matchAgents(treatment, 'All Countries');
      if (res.success && res.data) {
        setVerifiedAgents(res.data.verified || []);
        setFlaggedAgents(res.data.flagged || []);
      }
    } catch (err) {
      console.error('Patient match error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        background: '#030303',
        padding: '32px 40px 48px',
        display: 'flex',
        flexDirection: 'column',
        gap: 28,
        maxWidth: 1280,
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Hero Banner ── */}
      <div
        style={{
          borderRadius: 18,
          background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(16,185,129,0.06) 60%, rgba(20,184,166,0.04) 100%)',
          border: '1px solid rgba(16,185,129,0.15)',
          padding: '28px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 680 }}>
          <span
            className="font-mono font-bold"
            style={{
              fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 99, width: 'fit-content',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
              color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.6px',
            }}
          >
            <Lock size={10} />
            Zero-Trust Patient Protection Protocol
          </span>
          <h2 className="font-heading font-extrabold text-white" style={{ fontSize: 26, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            Safe Medical Travel Facilitator Matcher
          </h2>
          <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.65 }}>
            Every facilitator is continuously audited against Neo4j graph fraud rules. High-risk entities are strictly excluded from patient matching results.
          </p>
        </div>

        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px', borderRadius: 14,
            background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.07)',
            minWidth: 240,
          }}
        >
          <HeartHandshake size={34} style={{ color: '#34d399', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>100% Graph Audited</p>
            <p style={{ fontSize: 12, color: '#525252', marginTop: 3, lineHeight: 1.5 }}>
              Only low-risk facilitators are recommended.
            </p>
          </div>
        </div>
      </div>

      {/* ── Filter Form ── */}
      <form
        onSubmit={handleSearch}
        style={{
          display: 'flex', alignItems: 'flex-end', gap: 14, flexWrap: 'wrap',
          padding: '24px 28px', borderRadius: 16,
          background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.07)',
        }}
      >
        <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label className="font-mono font-bold uppercase" style={{ fontSize: 10, color: '#525252', letterSpacing: '0.7px' }}>
            Procedure / Specialization
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={treatment}
              onChange={e => setTreatment(e.target.value)}
              style={{
                width: '100%', padding: '10px 40px 10px 16px',
                borderRadius: 10,
                background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.1)',
                color: '#e5e5e5', fontSize: 13, cursor: 'pointer',
                outline: 'none', fontFamily: 'Inter, sans-serif',
              }}
              onFocus={e => { e.target.style.borderColor = 'rgba(6,182,212,0.45)'; }}
              onBlur={e  => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; }}
            >
              {TREATMENTS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <ChevronDown size={14} style={{ color: '#525252', position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ padding: '10px 22px', borderRadius: 10, fontSize: 12, opacity: loading ? 0.6 : 1 }}
        >
          <Search size={14} />
          {loading ? 'Auditing…' : 'Audit & Match'}
        </button>
      </form>

      {/* ── Results ── */}
      {loading ? (
        <div style={{ padding: '40px 0' }}>
          <Loader text="Running live Cypher graph audit & patient safety check…" />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* Verified */}
          <div>
            <SectionHeader
              icon={ShieldCheck}
              title="Verified & Recommended"
              count={verifiedAgents.length}
              badge="Cleared for Booking"
              badgeColor="#34d399"
            />
            {verifiedAgents.length === 0 ? (
              <div
                style={{
                  padding: '28px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(10,10,10,0.6)', textAlign: 'center',
                  fontSize: 13, color: '#525252', fontFamily: 'JetBrains Mono, monospace',
                }}
              >
                No verified facilitators found for this procedure.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {verifiedAgents.map(agent => <VerifiedCard key={agent.id} agent={agent} />)}
              </div>
            )}
          </div>

          {/* Flagged */}
          {flaggedAgents.length > 0 && (
            <div>
              {/* Warning Banner */}
              <div
                style={{
                  padding: '16px 20px', borderRadius: 12, marginBottom: 20,
                  background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)',
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                }}
              >
                <ShieldAlert size={18} style={{ color: '#f43f5e', flexShrink: 0, marginTop: 1 }} />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>
                    Excluded Facilitators — Restricted from Patient Matching ({flaggedAgents.length})
                  </p>
                  <p style={{ fontSize: 12, color: '#737373', marginTop: 4, lineHeight: 1.6 }}>
                    These facilitators have been flagged by Cypher graph analytics for active risk patterns. They are strictly prohibited from patient bookings.
                  </p>
                </div>
              </div>

              <SectionHeader
                icon={ShieldAlert}
                title="Flagged & Excluded"
                count={flaggedAgents.length}
                badge="Booking Blocked"
                badgeColor="#f43f5e"
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                {flaggedAgents.map(agent => <FlaggedCard key={agent.id} agent={agent} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
