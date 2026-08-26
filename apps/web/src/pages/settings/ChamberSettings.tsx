import React, { useState } from 'react';
import { Plus, Trash2, Calendar, Clock, MapPin, Save, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useChambers, useChamberAvailableDates, useChamberTimeSlots } from '../../hooks/useSupabase';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';

export function ChamberSettings() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { data: chambers = [], isLoading } = useChambers();

  const [activeChamber, setActiveChamber] = useState<any>(null);
  const [showAddChamber, setShowAddChamber] = useState(false);
  const [newChamber, setNewChamber] = useState({ name: '', address: '', advance_amount: 200 });
  const [savingChamber, setSavingChamber] = useState(false);

  const [newDate, setNewDate] = useState('');
  const [addingDate, setAddingDate] = useState(false);

  const [newSlot, setNewSlot] = useState('');
  const [addingSlot, setAddingSlot] = useState(false);

  const { data: availableDates = [] } = useChamberAvailableDates(activeChamber?.id ?? '');
  const { data: timeSlots = [] } = useChamberTimeSlots(activeChamber?.id ?? '');

  async function handleAddChamber() {
    if (!newChamber.name) return;
    setSavingChamber(true);
    const { error } = await supabase.from('chambers').insert([{
      ...newChamber,
      tenant_id: user?.id,
    }]);
    
    if (error) {
      alert(`Error saving chamber: ${error.message}`);
      console.error(error);
    } else {
      queryClient.invalidateQueries({ queryKey: ['chambers'] });
      setNewChamber({ name: '', address: '', advance_amount: 200 });
      setShowAddChamber(false);
    }
    setSavingChamber(false);
  }

  async function handleDeleteChamber(id: string) {
    if (!confirm('এই চেম্বার ডিলিট করবেন?')) return;
    await supabase.from('chambers').delete().eq('id', id);
    if (activeChamber?.id === id) setActiveChamber(null);
    queryClient.invalidateQueries({ queryKey: ['chambers'] });
  }

  async function handleAddDate() {
    if (!newDate || !activeChamber) return;
    setAddingDate(true);
    await supabase.from('chamber_available_dates').upsert([{
      chamber_id: activeChamber.id,
      available_date: newDate,
    }]);
    queryClient.invalidateQueries({ queryKey: ['chamber_dates', activeChamber.id] });
    setNewDate('');
    setAddingDate(false);
  }

  async function handleDeleteDate(id: string) {
    await supabase.from('chamber_available_dates').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['chamber_dates', activeChamber.id] });
  }

  async function handleAddSlot() {
    if (!newSlot || !activeChamber) return;
    setAddingSlot(true);
    await supabase.from('chamber_time_slots').upsert([{
      chamber_id: activeChamber.id,
      slot_time: newSlot,
    }]);
    queryClient.invalidateQueries({ queryKey: ['chamber_slots', activeChamber.id] });
    setNewSlot('');
    setAddingSlot(false);
  }

  async function handleDeleteSlot(id: string) {
    await supabase.from('chamber_time_slots').delete().eq('id', id);
    queryClient.invalidateQueries({ queryKey: ['chamber_slots', activeChamber.id] });
  }

  return (
    <div className="bg-[#151729]/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 p-8 mt-2 text-white">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-8 tracking-wide">
        <MapPin className="w-6 h-6 text-yellow-400" /> চেম্বার ম্যানেজমেন্ট
      </h2>

      {/* Chamber list */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white/80 uppercase tracking-wider text-sm">আমার চেম্বার</h3>
          <button
            onClick={() => setShowAddChamber(!showAddChamber)}
            className="flex items-center gap-1.5 text-sm bg-purple-600/20 text-purple-400 border border-purple-500/30 px-4 py-2 rounded-xl hover:bg-purple-600/30 transition-all font-bold"
          >
            <Plus className="w-4 h-4" /> নতুন চেম্বার
          </button>
        </div>

        {showAddChamber && (
          <div className="bg-black/20 border border-white/10 rounded-2xl p-5 mb-6 space-y-4 shadow-inner">
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 transition-colors placeholder:text-white/30"
              placeholder="চেম্বারের নাম (যেমন: কলকাতা চেম্বার)"
              value={newChamber.name}
              onChange={e => setNewChamber(f => ({ ...f, name: e.target.value }))}
            />
            <input
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 transition-colors placeholder:text-white/30"
              placeholder="ঠিকানা"
              value={newChamber.address}
              onChange={e => setNewChamber(f => ({ ...f, address: e.target.value }))}
            />
            <div className="flex items-center gap-3">
              <label className="text-sm text-white/50 font-semibold whitespace-nowrap">অগ্রিম পরিমাণ (₹)</label>
              <input
                type="number"
                className="w-32 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 transition-colors"
                value={newChamber.advance_amount}
                onChange={e => setNewChamber(f => ({ ...f, advance_amount: Number(e.target.value) }))}
              />
              <button
                onClick={handleAddChamber}
                disabled={savingChamber || !newChamber.name}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/20 disabled:opacity-50 ml-auto transition-all"
              >
                {savingChamber ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                সেভ করুন
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center gap-2 text-white/40 py-8 justify-center font-medium"><Loader2 className="w-5 h-5 animate-spin" /> লোড হচ্ছে...</div>
        ) : chambers.length === 0 ? (
          <p className="text-white/40 text-sm text-center py-8 bg-black/10 rounded-xl border border-dashed border-white/10">কোনো চেম্বার নেই। নতুন চেম্বার যোগ করুন।</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {chambers.map((ch: any) => (
              <div
                key={ch.id}
                onClick={() => setActiveChamber(ch.id === activeChamber?.id ? null : ch)}
                className={`flex items-center justify-between p-5 rounded-2xl border cursor-pointer transition-all
                  ${activeChamber?.id === ch.id ? 'border-purple-500 bg-purple-500/10 shadow-[0_0_15px_rgba(168,85,247,0.15)]' : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10'}`}
              >
                <div>
                  <div className="font-bold text-white tracking-wide text-lg">{ch.name}</div>
                  <div className="text-sm text-white/50 mt-1">{ch.address || 'ঠিকানা নেই'}</div>
                  <div className="text-xs font-bold text-yellow-400 mt-2 bg-yellow-400/10 inline-block px-2 py-1 rounded">অগ্রিম: ₹{ch.advance_amount}</div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteChamber(ch.id); }}
                  className="text-red-400/50 hover:text-red-400 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dates & Slots management for selected chamber */}
      {activeChamber && (
        <div className="border-t border-white/10 pt-8 mt-2">
          <h3 className="font-bold text-white/90 mb-6 text-xl tracking-wide flex items-center gap-2">
            <span className="text-purple-400">{activeChamber.name}</span> — তারিখ ও সময় সেট করুন
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Available Dates */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
              <h4 className="font-bold text-white/70 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                <Calendar className="w-4 h-4 text-purple-400" /> উপলব্ধ তারিখ
              </h4>
              <div className="flex gap-3 mb-4">
                <input
                  type="date"
                  value={newDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setNewDate(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                />
                <button
                  onClick={handleAddDate}
                  disabled={!newDate || addingDate}
                  className="bg-purple-600 text-white px-4 py-3 rounded-xl text-sm hover:bg-purple-500 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-purple-500/20"
                >
                  {addingDate ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {availableDates.length === 0 ? (
                  <p className="text-white/30 text-xs w-full text-center py-4 italic">কোনো তারিখ নেই</p>
                ) : availableDates.map((row: any) => (
                  <div key={row.id} className="flex items-center gap-1.5 bg-white/10 text-white/90 text-xs font-semibold rounded-lg px-3 py-1.5 border border-white/10">
                    {new Date(row.available_date).toLocaleDateString('bn-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    <button onClick={() => handleDeleteDate(row.id)} className="hover:text-red-400 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Time Slots */}
            <div className="bg-black/20 p-5 rounded-2xl border border-white/5">
              <h4 className="font-bold text-white/70 mb-4 flex items-center gap-2 uppercase tracking-wider text-sm">
                <Clock className="w-4 h-4 text-purple-400" /> সময়সূচি (Time Slots)
              </h4>
              <div className="flex gap-3 mb-4">
                <input
                  type="time"
                  value={newSlot}
                  onChange={e => setNewSlot(e.target.value)}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white outline-none focus:border-purple-500 [color-scheme:dark]"
                />
                <button
                  onClick={handleAddSlot}
                  disabled={!newSlot || addingSlot}
                  className="bg-purple-600 text-white px-4 py-3 rounded-xl text-sm hover:bg-purple-500 disabled:opacity-50 transition-colors font-bold shadow-lg shadow-purple-500/20"
                >
                  {addingSlot ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                </button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {timeSlots.length === 0 ? (
                  <p className="text-white/30 text-xs w-full text-center py-4 italic">কোনো স্লট নেই</p>
                ) : timeSlots.map((row: any) => (
                  <div key={row.id} className="flex items-center gap-1.5 bg-yellow-400/10 text-yellow-400 text-xs font-bold rounded-lg px-3 py-1.5 border border-yellow-400/20">
                    {row.slot_time}
                    <button onClick={() => handleDeleteSlot(row.id)} className="hover:text-red-400 transition-colors ml-1">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
