import React, { useState } from 'react';
import { FileText, Search, Plus, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

export function ConsultationsPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const { data: consultations = [], isLoading } = useQuery({
    queryKey: ['consultations', 'astrologer', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('consultations')
        .select('*, customers(first_name, last_name)')
        .eq('tenant_id', user?.id)
        .order('consultation_date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const filtered = consultations.filter((c: any) =>
    (c.topic?.toLowerCase() || '').includes(query.toLowerCase()) ||
    (c.customers?.first_name || '').toLowerCase().includes(query.toLowerCase()) ||
    (c.customers?.last_name || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Consultations</h1>
          <p className="text-white/50">Client session notes and reports</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input 
              type="text" 
              placeholder="Search by topic or client..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-yellow-400 outline-none transition-colors"
            />
          </div>
          <button className="bg-yellow-400 text-gray-900 px-4 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-yellow-300 transition-colors whitespace-nowrap">
            <Plus className="w-4 h-4" /> Add Note
          </button>
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Client</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Topic</th>
              <th className="px-6 py-4 text-xs font-medium text-white/50 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                  Loading consultations...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-white/50">
                  <FileText className="w-8 h-8 mx-auto mb-3 opacity-50" />
                  No consultation notes found.
                </td>
              </tr>
            ) : filtered.map((c: any) => (
              <tr key={c.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-white font-medium">
                    {new Date(c.consultation_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white">
                    {c.customers?.first_name} {c.customers?.last_name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-white/80">{c.topic || 'General Consultation'}</div>
                </td>
                <td className="px-6 py-4">
                  <button className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors">
                    View Notes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
