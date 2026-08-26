import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { MapPin, Calendar, ChevronRight, Star, LogOut, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useChambers, useChamberAvailableDates } from '../../hooks/useSupabase';

export function BookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const personalDetails = (location.state as any)?.personalDetails;

  const [selectedChamber, setSelectedChamber] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState('');

  const { data: chambers = [], isLoading: chambersLoading, error: chambersError } = useChambers();
  const { data: availableDates = [], isLoading: datesLoading } = useChamberAvailableDates(selectedChamber?.id ?? '');

  // If no personal details, redirect back
  if (!personalDetails) {
    navigate('/book');
    return null;
  }

  function handleContinue() {
    if (!selectedChamber || !selectedDate) return;
    navigate('/book/slots', { state: { chamber: selectedChamber, date: selectedDate, personalDetails } });
  }

  const CHAMBER_COLORS = [
    { color: 'from-purple-500/20 to-blue-500/20', border: 'border-purple-500/30' },
    { color: 'from-blue-500/20 to-teal-500/20', border: 'border-blue-500/30' },
    { color: 'from-green-500/20 to-teal-500/20', border: 'border-green-500/30' },
    { color: 'from-orange-500/20 to-red-500/20', border: 'border-orange-500/30' },
  ];

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' }}>
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10">
        <Link to="/" className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-xl font-bold text-white">AstroVanta</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-white/50 text-sm">{user?.email}</span>
          <button onClick={signOut} className="flex items-center gap-1 text-white/50 hover:text-white text-sm transition-colors">
            <LogOut className="w-4 h-4" /> লগআউট
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Progress — 5 steps */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          {['ব্যক্তিগত তথ্য', 'চেম্বার ও তারিখ', 'সময়', 'পেমেন্ট', 'নিশ্চিত'].map((s, i) => (
            <React.Fragment key={i}>
              <div className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${i <= 1 ? 'text-yellow-400' : 'text-white/30'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0
                  ${i === 1 ? 'bg-yellow-400 text-gray-900' : i === 0 ? 'bg-yellow-400/30 text-yellow-400' : 'bg-white/10 text-white/30'}`}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                <span className="hidden sm:inline">{s}</span>
              </div>
              {i < 4 && <div className="flex-1 h-px bg-white/10 min-w-[10px]" />}
            </React.Fragment>
          ))}
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">চেম্বার ও তারিখ বেছে নিন</h1>
        <p className="text-white/50 mb-8">আপনার সুবিধামতো চেম্বার ও দিন সিলেক্ট করুন</p>

        {/* Chambers */}
        <div className="mb-8">
          <h2 className="text-white/70 font-medium mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" /> চেম্বার সিলেক্ট করুন
          </h2>

          {chambersLoading ? (
            <div className="flex items-center gap-3 text-white/50 py-8">
              <Loader2 className="w-5 h-5 animate-spin" /> চেম্বার লোড হচ্ছে...
            </div>
          ) : chambersError ? (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">চেম্বার লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।</span>
            </div>
          ) : chambers.length === 0 ? (
            <div className="flex items-center gap-2 text-white/50 bg-white/5 border border-white/10 rounded-xl p-6 text-center justify-center">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">এখনো কোনো চেম্বার যোগ করা হয়নি।</span>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-4">
              {chambers.map((ch: any, idx: number) => {
                const style = CHAMBER_COLORS[idx % CHAMBER_COLORS.length];
                return (
                  <button
                    key={ch.id}
                    onClick={() => { setSelectedChamber(ch); setSelectedDate(''); }}
                    className={`text-left p-5 rounded-2xl border transition-all bg-gradient-to-br ${style.color} ${style.border}
                      ${selectedChamber?.id === ch.id
                        ? 'border-yellow-400 ring-2 ring-yellow-400/50 scale-105'
                        : 'hover:border-white/30 hover:scale-[1.02]'}
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold">{ch.name}</h3>
                      {selectedChamber?.id === ch.id && (
                        <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center">
                          <span className="text-gray-900 text-xs font-bold">✓</span>
                        </div>
                      )}
                    </div>
                    {ch.address && (
                      <p className="text-white/50 text-xs leading-relaxed mb-3">{ch.address}</p>
                    )}
                    <div className="inline-flex items-center bg-yellow-400/10 text-yellow-300 rounded-full px-3 py-1 text-xs font-medium border border-yellow-400/20">
                      অগ্রিম: ₹{ch.advance_amount}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Dates — only show after selecting a chamber */}
        {selectedChamber && (
          <div className="mb-10">
            <h2 className="text-white/70 font-medium mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" /> তারিখ বেছে নিন
              <span className="text-white/30 text-xs font-normal">({selectedChamber.name})</span>
            </h2>

            {datesLoading ? (
              <div className="flex items-center gap-3 text-white/50 py-6">
                <Loader2 className="w-5 h-5 animate-spin" /> তারিখ লোড হচ্ছে...
              </div>
            ) : availableDates.length === 0 ? (
              <div className="flex items-center gap-2 text-white/50 bg-white/5 border border-white/10 rounded-xl p-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">এই চেম্বারে এখনো কোনো তারিখ নির্ধারিত হয়নি। পরে আবার চেক করুন।</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {availableDates.map((row: any) => {
                  const d = new Date(row.available_date);
                  const dayName = d.toLocaleDateString('bn-IN', { weekday: 'short' });
                  const dayNum = d.getDate();
                  const month = d.toLocaleDateString('bn-IN', { month: 'short' });
                  const year = d.getFullYear();
                  const isSelected = selectedDate === row.available_date;

                  return (
                    <button
                      key={row.id}
                      onClick={() => setSelectedDate(row.available_date)}
                      className={`w-20 p-2 rounded-xl text-center transition-all
                        ${isSelected
                          ? 'bg-yellow-400 text-gray-900 scale-110 shadow-lg shadow-yellow-400/30'
                          : 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'}
                      `}
                    >
                      <div className="text-xs mb-0.5">{dayName}</div>
                      <div className="text-xl font-bold leading-tight">{dayNum}</div>
                      <div className="text-xs">{month}</div>
                      <div className="text-xs opacity-60">{year}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Continue */}
        <div className="flex justify-end">
          <button
            onClick={handleContinue}
            disabled={!selectedChamber || !selectedDate}
            className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-gray-900 font-bold px-8 py-4 rounded-xl hover:shadow-lg hover:shadow-yellow-400/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            পরবর্তী: সময় বেছে নিন
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
