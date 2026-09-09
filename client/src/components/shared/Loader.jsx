import React from 'react';

export default function Loader({ text = 'Analyzing Fraud Graph…' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: '48px 24px',
      }}
    >
      {/* Spinner ring */}
      <div style={{ position: 'relative', width: 48, height: 48 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(6,182,212,0.12)',
            borderTopColor: '#06b6d4',
            animation: 'spin 0.9s linear infinite',
          }}
        />
        {/* Inner pulse dot */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 10,
            height: 10,
            borderRadius: '50%',
            background: '#06b6d4',
            opacity: 0.7,
            animation: 'pulse 1.4s ease-in-out infinite',
          }}
        />
      </div>

      <p
        className="font-mono"
        style={{ fontSize: 12, color: 'rgba(6,182,212,0.75)', letterSpacing: '0.3px', textAlign: 'center', maxWidth: 360 }}
      >
        {text}
      </p>
    </div>
  );
}
