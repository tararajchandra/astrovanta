import React, { useEffect, useState } from 'react';
import { getCustomers, addLocalCustomer } from '../lib/db';
import { Users, Search, Plus, CloudOff, CloudSync } from 'lucide-react';
import { SyncManager } from '../lib/SyncManager';

export function CustomersList() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    setLoading(true);
    const data = await getCustomers();
    setCustomers(data);
    setLoading(false);
  }

  async function handleAddDummyCustomer() {
    const id = crypto.randomUUID();
    const tenantId = '11111111-1111-1111-1111-111111111111'; // Mock
    await addLocalCustomer(tenantId, id, 'Rohit', 'Sharma', 'rohit@example.com', '9876543210');
    fetchCustomers();
  }

  async function handleSync() {
    setIsSyncing(true);
    await SyncManager.syncLocalToCloud();
    await fetchCustomers();
    setIsSyncing(false);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" /> Local Clients (Offline)
        </h1>
        <div className="flex gap-4">
          <button onClick={handleSync} disabled={isSyncing} className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-700 transition-colors disabled:opacity-50">
            {isSyncing ? <CloudSync className="w-4 h-4 animate-spin" /> : <CloudOff className="w-4 h-4" />} 
            {isSyncing ? 'Syncing...' : 'Sync to Cloud'}
          </button>
          <button onClick={handleAddDummyCustomer} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Test Client
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search local clients..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4 font-medium">Name</th>
                <th className="p-4 font-medium">Contact</th>
                <th className="p-4 font-medium">Sync Status</th>
                <th className="p-4 font-medium">Last Modified</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">Loading local database...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">No clients stored locally. Click 'Add Test Client'.</td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer">
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{c.first_name} {c.last_name}</div>
                      <div className="text-xs text-gray-400">ID: {c.id.split('-')[0]}...</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{c.phone || '—'}</div>
                      <div className="text-gray-400">{c.email || '—'}</div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs ${c.sync_status === 'SYNCED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {c.sync_status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{new Date(c.last_modified).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
