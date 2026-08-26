import React, { useState, useMemo } from 'react';
import { useAppointments, useAddConsultation, useConsultations } from '../../hooks/useSupabase';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../contexts/LanguageContext';
import { calculateKundli, calculateDivisionalChart, calculateTransitChart } from '../../lib/astroEngine';
import { KundliChart } from '../../components/KundliChart';
import { Calendar, Clock, MapPin, User, ChevronRight, Loader2, Save, Plus, Edit2, X, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useQueryClient } from '@tanstack/react-query';

export function AppointmentsPage() {
  const { user } = useAuth();
  const { t, language } = useTranslation();
  const queryClient = useQueryClient();
  const { data: appointments = [], isLoading } = useAppointments();
  const [selectedAppt, setSelectedAppt] = useState<any>(null);
  
  const [remedies, setRemedies] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit details state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', dob: '', tob: '', birthPlace: '', latitude: '', longitude: '' });

  // Walk-in state
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [walkInForm, setWalkInForm] = useState({ name: '', dob: '', tob: '12:00', birthPlace: 'Kolkata', latitude: '22.5726', longitude: '88.3639' });

  const myAppointments = useMemo(() => {
    return appointments.filter((a: any) => a.tenant_id === user?.id);
  }, [appointments, user]);

  const { data: consultations = [] } = useConsultations(selectedAppt?.id);
  const addConsultation = useAddConsultation();

  const parsedNotes = useMemo(() => {
    if (!selectedAppt?.notes) return null;
    try {
      return JSON.parse(selectedAppt.notes);
    } catch {
      return null;
    }
  }, [selectedAppt]);

  const chartData = useMemo(() => {
    if (!parsedNotes?.birthDetails) return null;
    const bd = parsedNotes.birthDetails;
    if (!bd.dob || !bd.tob || !bd.latitude || !bd.longitude) return null;
    
    const [y, m, d] = bd.dob.split('-').map(Number);
    const [h, min] = bd.tob.split(':').map(Number);
    
    return calculateKundli({
      name: bd.name || 'Client',
      year: y, month: m, day: d,
      hour: h, minute: min, second: 0,
      latitude: parseFloat(bd.latitude),
      longitude: parseFloat(bd.longitude),
      timezone: 5.5,
    });
  }, [parsedNotes]);

  const [activeTab, setActiveTab] = useState<string>('d1');
  const d9Data = useMemo(() => chartData ? calculateDivisionalChart(chartData, 9) : null, [chartData]);
  const d3Data = useMemo(() => chartData ? calculateDivisionalChart(chartData, 3) : null, [chartData]);
  const d10Data = useMemo(() => chartData ? calculateDivisionalChart(chartData, 10) : null, [chartData]);
  
  const [gochorData, setGochorData] = useState<any>(null);
  
  React.useEffect(() => {
    if (chartData && parsedNotes?.birthDetails) {
       setGochorData(calculateTransitChart(chartData, parseFloat(parsedNotes.birthDetails.latitude), parseFloat(parsedNotes.birthDetails.longitude), 5.5));
    }
  }, [chartData, parsedNotes]);

  React.useEffect(() => {
    if (consultations && consultations.length > 0) {
      setRemedies(consultations[0].recommendations || '');
    } else {
      setRemedies('');
    }
  }, [consultations, selectedAppt]);

  async function handleSaveRemedy() {
    if (!selectedAppt) return;
    setSaving(true);
    
    try {
      const existing = consultations?.[0];
      if (existing) {
        await supabase.from('consultations').update({
          recommendations: remedies,
        }).eq('id', existing.id);
        queryClient.invalidateQueries({ queryKey: ['consultations'] });
      } else {
        await addConsultation.mutateAsync({
          tenant_id: user?.id,
          appointment_id: selectedAppt.id,
          astrologer_id: user?.id,
          recommendations: remedies,
          status: 'COMPLETED'
        });
      }
      alert('Remedies saved successfully!');
    } catch (e: any) {
      alert(`Error saving remedies: ${e.message}`);
    }
    
    setSaving(false);
  }

  function startEditing() {
    const bd = parsedNotes?.birthDetails || {};
    setEditForm({
      name: bd.name || '',
      dob: bd.dob || '',
      tob: bd.tob || '',
      birthPlace: bd.birthPlace || '',
      latitude: bd.latitude || '22.5726',
      longitude: bd.longitude || '88.3639'
    });
    setIsEditing(true);
  }

  async function saveEdits() {
    const currentNotes = parsedNotes || {};
    currentNotes.birthDetails = editForm;
    
    await supabase.from('appointments').update({
      notes: JSON.stringify(currentNotes)
    }).eq('id', selectedAppt.id);
    
    setIsEditing(false);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
    
    // update local state instantly for UI
    setSelectedAppt({ ...selectedAppt, notes: JSON.stringify(currentNotes) });
  }

  async function handleCreateWalkIn() {
    if (!walkInForm.name || !walkInForm.dob) {
      alert("Name and DOB are required"); return;
    }
    const d = new Date();
    await supabase.from('appointments').insert([{
      tenant_id: user?.id,
      start_time: d.toISOString(),
      end_time: d.toISOString(),
      status: 'CONFIRMED',
      notes: JSON.stringify({
        birthDetails: walkInForm,
        isWalkIn: true
      })
    }]);
    setShowWalkIn(false);
    queryClient.invalidateQueries({ queryKey: ['appointments'] });
  }

  return (
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 mt-2 overflow-hidden flex h-[750px] shadow-2xl">
      
      {/* Sidebar */}
      <div className="w-[320px] border-r border-white/10 bg-black/20 flex flex-col">
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-black/10">
          <h2 className="font-bold text-white tracking-wide">Appointments</h2>
          <button 
            onClick={() => setShowWalkIn(true)}
            className="flex items-center gap-1 bg-yellow-400/10 text-yellow-400 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-400/20 transition-colors border border-yellow-400/20"
          >
            <Plus className="w-3 h-3" /> Walk-in
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          {isLoading ? (
            <div className="flex items-center justify-center p-8 text-white/40">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
            </div>
          ) : myAppointments.length === 0 ? (
            <div className="text-center p-8 text-white/40 text-sm">No appointments found.</div>
          ) : (
            myAppointments.map((appt: any) => {
              const isActive = selectedAppt?.id === appt.id;
              let name = appt.customer?.first_name || 'Client';
              let bkId = appt.id.substring(0,8);
              let isWalkIn = false;
              try {
                const n = JSON.parse(appt.notes);
                if (n.birthDetails?.name) name = n.birthDetails.name;
                if (n.bookingId) bkId = n.bookingId;
                if (n.isWalkIn) { bkId = 'WALK-IN'; isWalkIn = true; }
              } catch {}

              const d = new Date(appt.start_time);
              return (
                <button
                  key={appt.id}
                  onClick={() => setSelectedAppt(appt)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    isActive 
                      ? 'bg-purple-500/20 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.15)]' 
                      : 'bg-white/5 border-white/5 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white/90 text-sm">{name}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${isWalkIn ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-white/10 text-white/50 border border-white/10'}`}>{bkId}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-white/50 font-medium">
                    <span className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-white/40" /> {d.toLocaleDateString()}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-white/40" /> {d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-transparent flex flex-col relative">
        {/* Walk-in Modal Overlay */}
        {showWalkIn && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-8">
            <div className="bg-black/80 border border-white/20 shadow-2xl rounded-2xl p-6 w-full max-w-md backdrop-blur-3xl">
              <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                <h3 className="text-xl font-bold text-white">New Walk-in Kundli</h3>
                <button onClick={() => setShowWalkIn(false)} className="text-white/40 hover:text-white transition-colors"><X className="w-5 h-5"/></button>
              </div>
              <div className="space-y-4">
                <div><label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Full Name</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors" value={walkInForm.name} onChange={e => setWalkInForm({...walkInForm, name: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Date of Birth</label>
                  <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors [color-scheme:dark]" value={walkInForm.dob} onChange={e => setWalkInForm({...walkInForm, dob: e.target.value})} /></div>
                  <div><label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Time of Birth</label>
                  <input type="time" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors [color-scheme:dark]" value={walkInForm.tob} onChange={e => setWalkInForm({...walkInForm, tob: e.target.value})} /></div>
                </div>
                <div><label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">City</label>
                <input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors" value={walkInForm.birthPlace} onChange={e => setWalkInForm({...walkInForm, birthPlace: e.target.value})} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Latitude</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors" value={walkInForm.latitude} onChange={e => setWalkInForm({...walkInForm, latitude: e.target.value})} /></div>
                  <div><label className="text-xs text-white/50 font-semibold mb-1.5 block uppercase tracking-wider">Longitude</label>
                  <input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white focus:border-purple-500 outline-none transition-colors" value={walkInForm.longitude} onChange={e => setWalkInForm({...walkInForm, longitude: e.target.value})} /></div>
                </div>
                <button onClick={handleCreateWalkIn} className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl mt-6 shadow-lg shadow-purple-500/20 transition-all">Generate Chart</button>
              </div>
            </div>
          </div>
        )}

        {!selectedAppt ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/30">
            <User className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-medium tracking-wide">Select an appointment to view Kundli</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Details Header */}
            <div className="p-8 border-b border-white/10 bg-black/10">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl font-bold text-white tracking-wide">
                  {parsedNotes?.birthDetails?.name || 'Customer Details'}
                </h2>
                {!isEditing && (
                  <button onClick={startEditing} className="text-purple-400 hover:text-purple-300 text-sm font-semibold flex items-center gap-1.5 bg-purple-500/10 px-3 py-1.5 rounded-lg border border-purple-500/20 transition-colors">
                    <Edit2 className="w-4 h-4" /> Edit Details
                  </button>
                )}
              </div>
              
              {isEditing ? (
                <div className="bg-white/5 p-5 rounded-2xl border border-white/20 shadow-xl mt-4 grid grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">Name</label><input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white" value={editForm.name} onChange={e=>setEditForm({...editForm, name: e.target.value})}/></div>
                  <div><label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">Date of Birth</label><input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white [color-scheme:dark]" value={editForm.dob} onChange={e=>setEditForm({...editForm, dob: e.target.value})}/></div>
                  <div><label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">Time of Birth</label><input type="time" className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white [color-scheme:dark]" value={editForm.tob} onChange={e=>setEditForm({...editForm, tob: e.target.value})}/></div>
                  <div className="col-span-2"><label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">City</label><input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white" value={editForm.birthPlace} onChange={e=>setEditForm({...editForm, birthPlace: e.target.value})}/></div>
                  <div><label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">Latitude</label><input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white" value={editForm.latitude} onChange={e=>setEditForm({...editForm, latitude: e.target.value})}/></div>
                  <div><label className="text-xs font-bold text-white/50 uppercase tracking-wider block mb-1.5">Longitude</label><input className="w-full bg-white/5 border border-white/10 rounded-lg p-2.5 text-sm text-white" value={editForm.longitude} onChange={e=>setEditForm({...editForm, longitude: e.target.value})}/></div>
                  <div className="col-span-2 flex justify-end gap-3 mt-4 border-t border-white/10 pt-4">
                    <button onClick={() => setIsEditing(false)} className="px-5 py-2 text-white/70 text-sm font-bold hover:bg-white/10 rounded-xl transition-colors">Cancel</button>
                    <button onClick={saveEdits} className="px-6 py-2 bg-purple-600 text-white text-sm font-bold rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-500/20 transition-all">Save Changes</button>
                  </div>
                </div>
              ) : parsedNotes?.birthDetails ? (
                <div className="flex flex-wrap gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><Calendar className="w-4 h-4 text-purple-400"/> {parsedNotes.birthDetails.dob}</div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><Clock className="w-4 h-4 text-purple-400"/> {parsedNotes.birthDetails.tob}</div>
                  <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><MapPin className="w-4 h-4 text-purple-400"/> {parsedNotes.birthDetails.birthPlace}</div>
                </div>
              ) : (
                <div className="text-sm text-white/40 italic">Old appointment without detailed birth data.</div>
              )}
            </div>

            <div className="p-8 grid lg:grid-cols-[1fr_300px] gap-8">
              {/* Kundli Section */}
              <div className="flex flex-col">
                <div className="flex gap-2 mb-4 bg-black/20 p-1 rounded-lg border border-white/5 overflow-x-auto custom-scrollbar">
                  {([
                    { key: 'd1',     label: 'D1_Rashi' },
                    { key: 'd9',     label: 'D9_Navamsa' },
                    { key: 'd3',     label: 'D3_Drekkana' },
                    { key: 'd10',    label: 'D10_Dasamsa' },
                    { key: 'gochor', label: 'Gochor' },
                    { key: 'planets',label: 'Planets' },
                    { key: 'dasha',  label: 'Dasha' },
                  ] as const).map(tItem => (
                    <button
                      key={tItem.key}
                      onClick={() => setActiveTab(tItem.key)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all ${
                        activeTab === tItem.key 
                          ? 'bg-purple-600 text-white shadow-lg' 
                          : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                      }`}
                    >
                      {t(tItem.label)}
                    </button>
                  ))}
                </div>

                {chartData ? (
                  <div className="flex-1 flex flex-col bg-black/20 rounded-2xl border border-white/5 overflow-hidden">
                    {['d1','d9','d3','d10','gochor'].includes(activeTab) && (() => {
                      const activeChart = 
                        activeTab === 'd1' ? chartData :
                        activeTab === 'd9' ? d9Data :
                        activeTab === 'd3' ? d3Data :
                        activeTab === 'd10' ? d10Data :
                        gochorData;
                      
                      const titleMap: Record<string, string> = {
                        d1: 'Lagna Chart (D1)', d9: 'Navamsa (D9)', d3: 'Drekkana (D3)', d10: 'Dasamsa (D10)', gochor: 'Transit (Gochar)'
                      };

                      return activeChart ? (
                        <div className="p-6 flex justify-center items-center h-full">
                          <KundliChart chartData={activeChart} title={titleMap[activeTab]} />
                        </div>
                      ) : null;
                    })()}

                    {activeTab === 'planets' && (
                      <div className="p-4 overflow-y-auto max-h-[400px] custom-scrollbar">
                        <table className="w-full text-left text-sm text-white/80">
                          <thead className="text-xs uppercase text-white/50 bg-white/5">
                            <tr><th className="p-2 rounded-tl-lg">Planet</th><th className="p-2">Sign</th><th className="p-2">Degree</th><th className="p-2">House</th><th className="p-2 rounded-tr-lg">State</th></tr>
                          </thead>
                          <tbody>
                            {chartData.planets.map((p: any) => (
                              <tr key={p.name} className="border-b border-white/5 hover:bg-white/5">
                                <td className="p-2 font-medium">{p.name}</td>
                                <td className="p-2">{p.sign}</td>
                                <td className="p-2 text-white/60">{p.degree_in_sign.toFixed(1)}°</td>
                                <td className="p-2 text-purple-400 font-bold">{p.house}</td>
                                <td className="p-2 text-xs">{p.retrograde ? <span className="text-red-400 border border-red-400/20 bg-red-400/10 px-1 rounded">Retro</span> : <span className="text-green-400 border border-green-400/20 bg-green-400/10 px-1 rounded">Dir</span>}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {activeTab === 'dasha' && (
                      <div className="p-4 overflow-y-auto max-h-[400px] custom-scrollbar space-y-2">
                        {chartData.dashas.map((d: any, i: number) => {
                          const isCurrent = new Date() >= new Date(d.start_date) && new Date() <= new Date(d.end_date);
                          return (
                            <div key={i} className={`p-3 rounded-lg border ${isCurrent ? 'bg-purple-900/30 border-purple-500/50' : 'bg-white/5 border-white/5'}`}>
                              <div className="flex justify-between items-center mb-1">
                                <span className={`font-bold ${isCurrent ? 'text-purple-400' : 'text-white'}`}>{d.lord}</span>
                                <span className="text-xs text-white/50">{d.years} yrs</span>
                              </div>
                              <div className="text-xs text-white/60">{d.start_date} → {d.end_date}</div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex-1 bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-white/40 text-sm h-[400px]">
                    No valid birth data found
                  </div>
                )}
              </div>

              {/* Side Stats Section (Red Marked Part) */}
              {chartData && (
                <div className="flex flex-col gap-4">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm">
                    <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">{t('Lagna')}</div>
                    <div className="text-xl font-bold text-purple-400">{t(chartData.ascendant_sign)}</div>
                    <div className="text-xs text-white/50 mt-1">{chartData.ascendant_degree?.toFixed(2)}°</div>
                  </div>

                  {activeTab === 'd1' && (
                    <>
                      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 shadow-sm">
                        <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">{t('Current Dasha')}</div>
                        <div className="text-lg font-bold text-yellow-400">{t(chartData.dashas[0]?.lord)}</div>
                        <div className="text-xs text-white/50 mt-1">{t('until')} {chartData.dashas[0]?.end_date}</div>
                      </div>

                      <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 shadow-sm">
                        <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">{t('Moon Sign (Rashi)')}</div>
                        <div className="text-lg font-bold text-blue-400">
                          {t(chartData.planets.find((p: any) => p.name === 'Moon')?.sign || '')}
                        </div>
                      </div>

                      <div className="bg-green-500/5 border border-green-500/20 rounded-2xl p-4 shadow-sm">
                        <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">{t('Moon Nakshatra')}</div>
                        <div className="text-sm font-bold text-white/90 mt-1">{chartData.planets.find((p: any) => p.name === 'Moon')?.nakshatra}</div>
                        <div className="text-xs text-white/50 mt-1">{t('Pada')} {chartData.planets.find((p: any) => p.name === 'Moon')?.nakshatra_pada}</div>
                      </div>
                    </>
                  )}

                  {activeTab === 'd9' && (
                    <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-2xl p-4 shadow-sm">
                      <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-1">{t('Navamsa Lagna')}</div>
                      <div className="text-xs text-white/60 mt-2 leading-relaxed">
                        Navamsa reveals the inner nature, spouse qualities, and spiritual path. D9 Lagna shows the soul's deeper dharma.
                      </div>
                    </div>
                  )}

                  {/* Planets List / Positions */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 shadow-sm flex-1">
                    <div className="text-[11px] font-bold text-white/50 uppercase tracking-wider mb-3">{t('Positions')}</div>
                    <div className="space-y-2.5">
                      {chartData.planets.map((p: any) => {
                        // Very simple mapping for glyphs without importing
                        const glyphs: Record<string,string> = { Sun:'☉', Moon:'☽', Mars:'♂', Mercury:'☿', Jupiter:'♃', Venus:'♀', Saturn:'♄', Rahu:'☊', Ketu:'☋' };
                        const glyph = glyphs[p.name] || p.name[0];
                        return (
                          <div key={p.name} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-purple-300 w-4">{glyph}</span>
                              <span className="text-xs font-medium text-white/80">{t(p.name)}</span>
                            </div>
                            <div className="text-xs text-white/50">
                              {language === 'en' ? t(p.sign).substring(0,3) : t(p.sign)} · H{p.house}
                              {p.retrograde && <span className="text-red-400 ml-1">ᴿ</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Remedies Section */}
            <div className="px-8 pb-8 flex flex-col">
              <h3 className="font-bold text-white/90 mb-4 uppercase tracking-wider text-sm flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-purple-400" /> {t('Remedies & Suggestions')}
              </h3>
              <textarea
                className="w-full h-32 border border-white/10 rounded-2xl p-5 text-sm focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none resize-none bg-white/5 text-white/90 shadow-inner placeholder:text-white/20"
                placeholder="Type astrological remedies, gems, mantras, or suggestions here..."
                value={remedies}
                onChange={e => setRemedies(e.target.value)}
              />
              <button
                onClick={handleSaveRemedy}
                disabled={saving}
                className="mt-4 w-full md:w-auto self-end flex items-center justify-center gap-2 px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-bold hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {t('Save Solutions')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
