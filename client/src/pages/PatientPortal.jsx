import React, { useState, useEffect } from 'react';
import Loader from '../components/shared/Loader';
import RiskBadge from '../components/shared/RiskBadge';
import { matchAgents, fetchClinics } from '../services/api';
import {
  Lock, HeartHandshake, ShieldCheck, ShieldAlert,
  AlertTriangle, Building2, User, ChevronDown, ChevronUp, Phone
} from 'lucide-react';

/* ─────────────────────────────────────────
   Sub-components
───────────────────────────────────────── */

function VerifiedAgentCard({ agent }) {
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
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {agent.address && <p style={{ fontSize: 12, color: '#737373', lineHeight: 1.5 }}>{agent.address}</p>}
        {agent.email   && <p className="font-mono" style={{ fontSize: 11, color: '#525252' }}>{agent.email}</p>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="font-mono font-semibold" style={{ fontSize: 11, color: '#34d399', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ShieldCheck size={12} /> Graph Verified
        </span>
        <button
          style={{
            padding: '6px 14px', borderRadius: 8,
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.25)',
            color: '#67e8f9', fontSize: 11, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace', transition: 'background 0.15s ease',
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

function FlaggedAgentCard({ agent }) {
  return (
    <div style={{
      borderRadius: 14,
      background: 'rgba(10,10,10,0.9)',
      border: '1px solid rgba(244,63,94,0.22)',
      padding: '20px',
      display: 'flex', flexDirection: 'column', gap: 14, opacity: 0.92,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          <h4 style={{
            fontSize: 14, fontWeight: 700, color: '#737373',
            textDecoration: 'line-through', textDecorationColor: 'rgba(244,63,94,0.6)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{agent.name}</h4>
          <p className="font-mono" style={{ fontSize: 10, color: '#f43f5e', marginTop: 3 }}>{agent.id} — FLAGGED</p>
        </div>
        <RiskBadge riskScore={agent.riskScore} />
      </div>
      {(agent.triggeredPatterns || []).length > 0 && (
        <div>
          <p className="font-mono font-bold uppercase" style={{ fontSize: 9, color: '#f43f5e', letterSpacing: '0.7px', marginBottom: 6 }}>Fraud Signals</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {agent.triggeredPatterns.map((p, i) => (
              <span key={i} className="font-mono font-bold" style={{
                padding: '3px 8px', borderRadius: 6,
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
                color: '#fca5a5', fontSize: 10,
              }}>{p.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <span className="font-mono font-semibold" style={{ fontSize: 11, color: '#f43f5e', display: 'flex', alignItems: 'center', gap: 5 }}>
          <AlertTriangle size={12} /> Excluded
        </span>
        <span className="font-mono font-bold uppercase" style={{
          padding: '4px 10px', borderRadius: 6,
          background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
          color: '#f43f5e', fontSize: 10, letterSpacing: '0.5px',
        }}>Booking Blocked</span>
      </div>
    </div>
  );
}

function HospitalCard({ clinic }) {
  const [expanded, setExpanded] = useState(false);
  const isFlagged = clinic.riskScore > 0 || (clinic.triggeredPatterns || []).length > 0;
  const borderColor = isFlagged ? 'rgba(244,63,94,0.22)' : 'rgba(255,255,255,0.07)';
  const hoverBorder = isFlagged ? 'rgba(244,63,94,0.4)' : 'rgba(16,185,129,0.35)';

  return (
    <div
      style={{
        borderRadius: 14,
        background: 'rgba(10,10,10,0.9)',
        border: `1px solid ${borderColor}`,
        padding: '20px',
        display: 'flex', flexDirection: 'column', gap: 14,
        transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        opacity: isFlagged ? 0.92 : 1,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = hoverBorder; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = borderColor; }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
            background: isFlagged ? 'rgba(244,63,94,0.1)' : 'rgba(16,185,129,0.1)',
            border: `1px solid ${isFlagged ? 'rgba(244,63,94,0.25)' : 'rgba(16,185,129,0.25)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Building2 size={15} style={{ color: isFlagged ? '#f43f5e' : '#34d399' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h4 style={{
              fontSize: 14, fontWeight: 700,
              color: isFlagged ? '#737373' : '#f5f5f5',
              textDecoration: isFlagged ? 'line-through' : 'none',
              textDecorationColor: 'rgba(244,63,94,0.6)',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{clinic.name}</h4>
            <p className="font-mono" style={{ fontSize: 10, color: isFlagged ? '#f43f5e' : '#525252', marginTop: 2 }}>
              {clinic.id}{isFlagged ? ' — FLAGGED' : ''}
            </p>
          </div>
        </div>
        <RiskBadge riskScore={clinic.riskScore} />
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {clinic.address && (
          <p style={{ fontSize: 12, color: '#737373', lineHeight: 1.5 }}>{clinic.address}</p>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {clinic.phone && clinic.phone !== 'N/A' && (
            <span className="font-mono" style={{ fontSize: 11, color: '#525252', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Phone size={10} />{clinic.phone}
            </span>
          )}
          {clinic.accreditationNumber && clinic.accreditationNumber !== 'N/A' && (
            <span className="font-mono" style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 6,
              background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc',
            }}>
              Accred: {clinic.accreditationNumber}
            </span>
          )}
        </div>
      </div>

      {/* Fraud signals (flagged only) */}
      {isFlagged && (clinic.triggeredPatterns || []).length > 0 && (
        <div>
          <p className="font-mono font-bold uppercase" style={{ fontSize: 9, color: '#f43f5e', letterSpacing: '0.7px', marginBottom: 6 }}>Fraud Signals</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {clinic.triggeredPatterns.map((p, i) => (
              <span key={i} className="font-mono font-bold" style={{
                padding: '3px 8px', borderRadius: 6,
                background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)',
                color: '#fca5a5', fontSize: 10,
              }}>{p.replace(/_/g, ' ')}</span>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span className="font-mono font-semibold" style={{ fontSize: 11, color: isFlagged ? '#f43f5e' : '#34d399', display: 'flex', alignItems: 'center', gap: 5 }}>
          {isFlagged ? <><AlertTriangle size={12} /> Excluded</> : <><ShieldCheck size={12} /> Graph Verified</>}
        </span>

        {/* Partner Agents toggle */}
        {(clinic.partnerAgents || []).length > 0 && (
          <button
            onClick={() => setExpanded(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '6px 12px', borderRadius: 8,
              background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)',
              color: '#a5b4fc', fontSize: 11, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'JetBrains Mono, monospace', transition: 'background 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.16)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
          >
            <User size={11} />
            Partner Agents ({clinic.partnerAgents.length})
            {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>
        )}

        {isFlagged && (
          <span className="font-mono font-bold uppercase" style={{
            padding: '4px 10px', borderRadius: 6,
            background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)',
            color: '#f43f5e', fontSize: 10, letterSpacing: '0.5px',
          }}>Booking Blocked</span>
        )}
      </div>

      {/* Expanded Partner Agents list */}
      {expanded && (clinic.partnerAgents || []).length > 0 && (
        <div style={{
          marginTop: 4, padding: '12px 14px', borderRadius: 10,
          background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.18)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <p className="font-mono font-bold uppercase" style={{ fontSize: 9, color: '#818cf8', letterSpacing: '0.7px', marginBottom: 2 }}>
            Partner Agents
          </p>
          {clinic.partnerAgents.map((agent, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <User size={11} style={{ color: '#38bdf8' }} />
              </div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d4' }}>{agent.name}</p>
                <p className="font-mono" style={{ fontSize: 10, color: '#525252' }}>{agent.id}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
        <span className="font-mono font-bold" style={{
          fontSize: 10, padding: '4px 10px', borderRadius: 6,
          background: `${badgeColor}12`, border: `1px solid ${badgeColor}30`,
          color: badgeColor, textTransform: 'uppercase', letterSpacing: '0.5px',
        }}>{badge}</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Page
───────────────────────────────────────── */
export default function PatientPortal() {
  const [activeTab, setActiveTab] = useState('agents'); // 'agents' | 'hospitals'

  // Agents state
  const [verifiedAgents, setVerifiedAgents] = useState([]);
  const [flaggedAgents,  setFlaggedAgents]  = useState([]);
  const [loadingAgents, setLoadingAgents]   = useState(false);

  // Hospitals state
  const [verifiedClinics, setVerifiedClinics] = useState([]);
  const [flaggedClinics,  setFlaggedClinics]  = useState([]);
  const [loadingClinics, setLoadingClinics]   = useState(false);

  // Load agents on mount
  useEffect(() => { loadAgents(); }, []);

  // Load clinics when Hospitals tab first selected
  useEffect(() => {
    if (activeTab === 'hospitals' && verifiedClinics.length === 0 && flaggedClinics.length === 0 && !loadingClinics) {
      loadClinics();
    }
  }, [activeTab]);

  const loadAgents = async () => {
    setLoadingAgents(true);
    try {
      const res = await matchAgents('', 'All Countries');
      if (res.success && res.data) {
        setVerifiedAgents(res.data.verified || []);
        setFlaggedAgents(res.data.flagged || []);
      }
    } catch (err) {
      console.error('Agent match error:', err);
    } finally {
      setLoadingAgents(false);
    }
  };

  const loadClinics = async () => {
    setLoadingClinics(true);
    try {
      const res = await fetchClinics();
      if (res.success && res.data) {
        setVerifiedClinics(res.data.verified || []);
        setFlaggedClinics(res.data.flagged || []);
      }
    } catch (err) {
      console.error('Clinic fetch error:', err);
    } finally {
      setLoadingClinics(false);
    }
  };

  const isLoading = activeTab === 'agents' ? loadingAgents : loadingClinics;

  return (
    <div style={{
      flex: 1, overflowY: 'auto', background: '#030303',
      padding: '32px 40px 48px',
      display: 'flex', flexDirection: 'column', gap: 28,
      maxWidth: 1280, margin: '0 auto', width: '100%', boxSizing: 'border-box',
    }}>

      {/* ── Hero Banner ── */}
      <div style={{
        borderRadius: 18,
        background: 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(16,185,129,0.06) 60%, rgba(20,184,166,0.04) 100%)',
        border: '1px solid rgba(16,185,129,0.15)',
        padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 24, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 680 }}>
          <span className="font-mono font-bold" style={{
            fontSize: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 99, width: 'fit-content',
            background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)',
            color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.6px',
          }}>
            <Lock size={10} /> Zero-Trust Patient Protection Protocol
          </span>
          <h2 className="font-heading font-extrabold text-white" style={{ fontSize: 26, letterSpacing: '-0.5px', lineHeight: 1.2 }}>
            Safe Medical Travel Matcher
          </h2>
          <p style={{ fontSize: 13, color: '#737373', lineHeight: 1.65 }}>
            Every agent and clinic is continuously audited against Neo4j graph fraud rules. High-risk entities are strictly excluded from matching results.
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px', borderRadius: 14,
          background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.07)',
          minWidth: 240,
        }}>
          <HeartHandshake size={34} style={{ color: '#34d399', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: '#34d399' }}>100% Graph Audited</p>
            <p style={{ fontSize: 12, color: '#525252', marginTop: 3, lineHeight: 1.5 }}>
              Only low-risk entities are recommended.
            </p>
          </div>
        </div>
      </div>

      {/* ── Agent / Hospital Tab Toggle ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: 4, borderRadius: 12, width: 'fit-content',
        background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        {[
          { id: 'agents',    label: 'Agents',    Icon: User,      activeColor: '#06b6d4', activeBg: 'rgba(6,182,212,0.15)',  activeBorder: 'rgba(6,182,212,0.35)' },
          { id: 'hospitals', label: 'Hospitals', Icon: Building2, activeColor: '#a78bfa', activeBg: 'rgba(167,139,250,0.15)', activeBorder: 'rgba(167,139,250,0.35)' },
        ].map(({ id, label, Icon, activeColor, activeBg, activeBorder }) => {
          const active = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="font-mono font-bold"
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 20px', borderRadius: 9, cursor: 'pointer',
                fontSize: 13, border: 'none', transition: 'all 0.18s ease',
                background: active ? activeBg : 'transparent',
                color:      active ? activeColor : '#525252',
                boxShadow:  active ? `inset 0 0 0 1px ${activeBorder}` : 'none',
              }}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>

      {/* ── Results ── */}
      {isLoading ? (
        <div style={{ padding: '40px 0' }}>
          <Loader text={activeTab === 'agents' ? 'Running live Cypher agent audit…' : 'Running live Cypher hospital audit…'} />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>

          {/* AGENTS TAB */}
          {activeTab === 'agents' && (
            <>
              {/* Verified Agents */}
              <div>
                <SectionHeader icon={ShieldCheck} title="Verified Agents" count={verifiedAgents.length} badge="Cleared for Booking" badgeColor="#34d399" />
                {verifiedAgents.length === 0 ? (
                  <EmptyState text="No verified facilitators found." />
                ) : (
                  <CardGrid>
                    {verifiedAgents.map(a => <VerifiedAgentCard key={a.id} agent={a} />)}
                  </CardGrid>
                )}
              </div>

              {/* Flagged Agents */}
              {flaggedAgents.length > 0 && (
                <div>
                  <FlaggedBanner count={flaggedAgents.length} type="agents" />
                  <SectionHeader icon={ShieldAlert} title="Flagged Agents" count={flaggedAgents.length} badge="Booking Blocked" badgeColor="#f43f5e" />
                  <CardGrid>
                    {flaggedAgents.map(a => <FlaggedAgentCard key={a.id} agent={a} />)}
                  </CardGrid>
                </div>
              )}
            </>
          )}

          {/* HOSPITALS TAB */}
          {activeTab === 'hospitals' && (
            <>
              {/* Verified Clinics */}
              <div>
                <SectionHeader icon={ShieldCheck} title="Verified Hospitals" count={verifiedClinics.length} badge="Cleared for Booking" badgeColor="#34d399" />
                {verifiedClinics.length === 0 ? (
                  <EmptyState text="No verified hospitals found." />
                ) : (
                  <CardGrid>
                    {verifiedClinics.map(c => <HospitalCard key={c.id} clinic={c} />)}
                  </CardGrid>
                )}
              </div>

              {/* Flagged Clinics */}
              {flaggedClinics.length > 0 && (
                <div>
                  <FlaggedBanner count={flaggedClinics.length} type="hospitals" />
                  <SectionHeader icon={ShieldAlert} title="Flagged Hospitals" count={flaggedClinics.length} badge="Booking Blocked" badgeColor="#f43f5e" />
                  <CardGrid>
                    {flaggedClinics.map(c => <HospitalCard key={c.id} clinic={c} />)}
                  </CardGrid>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Tiny layout helpers ── */
function CardGrid({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
      {children}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{
      padding: '28px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.07)',
      background: 'rgba(10,10,10,0.6)', textAlign: 'center',
      fontSize: 13, color: '#525252', fontFamily: 'JetBrains Mono, monospace',
    }}>{text}</div>
  );
}

function FlaggedBanner({ count, type }) {
  return (
    <div style={{
      padding: '16px 20px', borderRadius: 12, marginBottom: 20,
      background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.2)',
      display: 'flex', alignItems: 'flex-start', gap: 14,
    }}>
      <ShieldAlert size={18} style={{ color: '#f43f5e', flexShrink: 0, marginTop: 1 }} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5' }}>
          Excluded {type === 'agents' ? 'Facilitators' : 'Hospitals'} — Restricted from Patient Matching ({count})
        </p>
        <p style={{ fontSize: 12, color: '#737373', marginTop: 4, lineHeight: 1.6 }}>
          These {type} have been flagged by Cypher graph analytics for active risk patterns and are strictly prohibited from patient bookings.
        </p>
      </div>
    </div>
  );
}
