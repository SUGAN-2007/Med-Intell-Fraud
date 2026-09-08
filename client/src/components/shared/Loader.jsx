import React from 'react';
import { Activity } from 'lucide-react';

export default function Loader({ text = 'Analyzing Fraud Graph...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className="relative flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        <Activity className="w-5 h-5 text-cyan-400 absolute animate-pulse" />
      </div>
      <p className="text-sm font-mono text-cyan-300/80 tracking-wide">{text}</p>
    </div>
  );
}
