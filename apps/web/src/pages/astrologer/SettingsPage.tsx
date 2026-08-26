import React, { useState } from 'react';
import { ChamberSettings } from '../settings/ChamberSettings';
import { ReportSettings } from '../settings/ReportSettings';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'chambers' | 'services' | 'reports'>('chambers');

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-white/50">Manage your chambers, schedule, services, and reports</p>
      </div>

      <div className="flex space-x-1 border-b border-white/10 mb-6">
        <button
          onClick={() => setActiveTab('chambers')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'chambers' 
              ? 'border-yellow-400 text-yellow-400' 
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          Chamber & Schedule
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'services' 
              ? 'border-yellow-400 text-yellow-400' 
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          Services & Pricing
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'reports' 
              ? 'border-yellow-400 text-yellow-400' 
              : 'border-transparent text-white/50 hover:text-white/80'
          }`}
        >
          Report Settings
        </button>
      </div>

      <div className="mt-6">
        {activeTab === 'chambers' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <ChamberSettings />
          </div>
        )}
        
        {activeTab === 'services' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-12 text-center">
            <h3 className="text-xl font-medium text-white mb-2">Services & Pricing</h3>
            <p className="text-white/50">This feature is coming soon.</p>
          </div>
        )}

        {activeTab === 'reports' && (
          <ReportSettings />
        )}
      </div>
    </div>
  );
}
