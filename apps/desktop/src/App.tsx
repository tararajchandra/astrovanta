import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { KundliPage } from './pages/KundliPage';
import { AppointmentsPage } from './pages/AppointmentsPage';
import { ConsultationsPage } from './pages/ConsultationsPage';
import { SyncManager } from './lib/SyncManager';
import './App.css';

function App() {
  useEffect(() => {
    // Initial sync
    SyncManager.syncLocalToCloud();

    // Periodic sync every 30 seconds
    const interval = setInterval(() => {
      SyncManager.syncLocalToCloud();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Router>
      <div className="app-shell">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/kundli" element={<KundliPage />} />
            <Route path="/appointments" element={<AppointmentsPage />} />
            <Route path="/consultations" element={<ConsultationsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
