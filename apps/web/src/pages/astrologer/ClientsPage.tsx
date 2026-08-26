import React, { useState } from 'react';
import { Users, Search, Plus, Loader2 } from 'lucide-react';
import { useCustomers } from '../../hooks/useSupabase';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function ClientsPage() {
  const { user } = useAuth();
  const { data: customers = [], isLoading } = useCustomers();
  const [query, setQuery] = useState('');
  
  const filtered = customers.filter((c: any) =>
    `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`
      .toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Clients</h1>
          <p className="text-white/50">{customers.length} clients in database</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search clients..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-yellow-400 outline-none transition-colors"
            />
          </div>
          <button className="bg-yellow-400 text-gray-900 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-yellow-300 transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Client
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Birth Details</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading clients...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                  <Users className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  No clients found. Click "Add Client" to get started.
                </td>
              </tr>
            ) : filtered.map((c: any) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                      {c.first_name?.[0]}{c.last_name?.[0]}
                    </div>
                    <div>
                      <div className="font-medium text-white">{c.first_name} {c.last_name}</div>
                      <div className="text-xs text-white/40 mt-0.5">#{c.id.split('-')[0]}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white/80">{c.phone || '—'}</div>
                  <div className="text-xs text-white/40 mt-0.5">{c.email || '—'}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-white/80">{c.dob || '—'} {c.tob ? `at ${c.tob}` : ''}</div>
                  <div className="text-xs text-white/40 mt-0.5">{c.birth_city || '—'}</div>
                </td>
                <td className="px-6 py-4">
                  <Link to={`/astrologer/clients/${c.id}`} className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
