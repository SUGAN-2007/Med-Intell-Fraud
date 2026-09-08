import React, { useState } from 'react';
import Header from './components/Header';
import AdminDashboard from './pages/AdminDashboard';
import PatientPortal from './pages/PatientPortal';

export default function App() {
  const [activeTab, setActiveTab] = useState('admin');
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        nodeCount={23}
        fraudRingsCount={4}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'admin' ? (
          <AdminDashboard
            selectedNode={selectedNode}
            onNodeSelect={(node) => setSelectedNode(node)}
          />
        ) : (
          <PatientPortal />
        )}
      </main>
    </div>
  );
}
