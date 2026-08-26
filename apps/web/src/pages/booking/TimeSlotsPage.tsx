import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Clock, ChevronRight, ChevronLeft, Star, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChamberTimeSlots } from '../../hooks/useSupabase';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';

export function TimeSlotsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { chamber, date, personalDetails } = (location.state as any) || {};
  const [selectedSlot, setSelectedSlot] = useState('');

  // Fetch available time slots for this chamber
  const { data: timeSlots = [], isLoading: slotsLoading } = useChamberTimeSlots(chamber?.id ?? '');

  // Fetch already-booked slots for this chamber+date
  const { data: bookedSlots = [] } = useQuery({
    queryKey: ['booked_slots', chamber?.id, date],
    queryFn: async () => {
      if (!chamber?.id || !date) return [];
      const { data } = await supabase
        .from('appointments')
        .select('start_time')
        .eq('status', 'CONFIRMED')
        .gte('start_time', `${date}T00:00:00`)
        .lte('start_time', `${date}T23:59:59`);
      return (data ?? []).map((row: any) => row.start_time?.substring(11, 16));
    },
    enabled: !!chamber?.id && !!date,
  });

  if (!chamber || !date || !personalDetails) {
    navigate('/book');
    return null;
  }

  const displayDate = new Date(date).toLocaleDateString('bn-IN', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  function handleContinue() {
    if (!selectedSlot) return;
    navigate('/book/payment', { state: { chamber, date, slot: selectedSlot, personalDetails } });
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-xl font-bold text-white">AstroVanta</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm">{user?.email}</span>
          <button onClick={signOut} className="flex items-center gap-1 text-white/50 hover:text-white text-sm">
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {['চেম্বার ও তারিখ', 'সময় বেছে নিন', 'পেমেন্ট', 'নিশ্চিত'].map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-2 text-sm font-medium ${i <= 1 ? 'text-yellow-400' : 'text-white/30'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                  ${i === 1 ? 'bg-yellow-400 text-gray-900' : i === 0 ? 'bg-yellow-400/30 text-yellow-400' : 'bg-white/10 text-white/30'}`}>
                  {i < 1 ? '✓' : i + 1}
                </div>
                <span className="hidden md:inline">{s}</span>
              </div>
              {i < 3 && <div className="flex-1 h-px bg-white/10" />}
            </React.Fragment>
          ))}
        </div>

        {/* Summary card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-white font-semibold">{chamber.name}</div>
              <div className="text-white/50 text-sm">{displayDate}</div>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">সময় বেছে নিন</h1>
        <p className="text-white/50 mb-8">
          উপলব্ধ স্লট সবুজে, <span className="line-through text-white/30">ধূসর মানে বুকড</span>
        </p>

        {/* Slot grid */}
        {slotsLoading ? (
          <div className="flex items-center gap-3 text-white/50 py-8">
            <Loader2 className="w-5 h-5 animate-spin" /> সময়সূচি লোড হচ্ছে...
          </div>
        ) : timeSlots.length === 0 ? (
          <div className="flex items-center gap-2 text-white/50 bg-white/5 border border-white/10 rounded-xl p-5">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">এই চেম্বারে কোনো সময়সূচি নির্ধারিত হয়নি।</span>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3 mb-10">
            {timeSlots.map((row: any) => {
              const slot = row.slot_time;
              const isBooked = (bookedSlots as string[]).includes(slot);
              const isSelected = selectedSlot === slot;
              return (
                <button
                  key={row.id}
                  disabled={isBooked}
                  onClick={() => setSelectedSlot(slot)}
                  className={`py-3 rounded-xl text-sm font-medium transition-all
                    ${isBooked
                      ? 'bg-white/5 text-white/20 cursor-not-allowed line-through'
                      : isSelected
                        ? 'bg-yellow-400 text-gray-900 scale-105 shadow-lg shadow-yellow-400/30'
                        : 'bg-white/10 text-white border border-white/10 hover:border-yellow-400/50 hover:bg-white/15'}
                  `}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/book')}
            className="flex items-center gap-2 text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> আগে যান
          </button>
          <button
            onClick={handleContinue}
            disabled={!selectedSlot}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            পেমেন্টে যান
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
