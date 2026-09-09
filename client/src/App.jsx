import React, { useState } from 'react';
import Header from './components/Header';
import AdminDashboard from './pages/AdminDashboard';
import PatientPortal from './pages/PatientPortal';

export default function App() {
  const [activeTab, setActiveTab] = useState('admin');
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div className="h-screen w-screen max-h-screen max-w-screen flex flex-col overflow-hidden bg-black text-white font-sans select-none">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="flex-1 flex flex-col overflow-hidden relative bg-black">
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
