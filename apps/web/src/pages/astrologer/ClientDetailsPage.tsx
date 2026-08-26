import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomer } from '../../hooks/useSupabase';
import { ArrowLeft, User, Calendar, MapPin, Clock, MessageSquare } from 'lucide-react';
import { ConsultationTab } from './ConsultationTab';

export function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading, error } = useCustomer(id!);
  const [activeTab, setActiveTab] = useState<'details' | 'consultations'>('details');

  if (isLoading) return <div className="p-8 text-center text-white/50">Loading client details...</div>;
  if (error || !customer) return <div className="p-8 text-center text-red-400">Error loading client.</div>;

  return (
    <div className="p-8 w-full max-w-5xl mx-auto">
      <Link to="/astrologer/clients" className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 mb-6 font-medium transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>
      
      <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden mb-8">
        <div className="p-6 border-b border-white/10 flex items-start gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 text-white rounded-full flex items-center justify-center flex-shrink-0 shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{customer.first_name} {customer.last_name}</h1>
            <p className="text-white/50 mt-1">{customer.phone} • {customer.email}</p>
          </div>
        </div>
        
        <div className="flex px-6 bg-white/5">
          <button 
            className={`px-4 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'details' ? 'border-yellow-400 text-yellow-400 bg-white/5' : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'}`}
            onClick={() => setActiveTab('details')}
          >
            <User className="w-4 h-4" /> Client Info
          </button>
          <button 
            className={`px-4 py-4 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'consultations' ? 'border-yellow-400 text-yellow-400 bg-white/5' : 'border-transparent text-white/50 hover:text-white/80 hover:bg-white/5'}`}
            onClick={() => setActiveTab('consultations')}
          >
            <MessageSquare className="w-4 h-4" /> Consultations & Reports
          </button>
        </div>
      </div>

      {activeTab === 'details' && (
        <div className="bg-white/5 rounded-2xl border border-white/10 p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Birth Details</h3>
            <div className="flex items-center gap-3 text-white/80">
              <Calendar className="w-5 h-5 text-white/40" />
              <span>Date: {customer.dob || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <Clock className="w-5 h-5 text-white/40" />
              <span>Time: {customer.tob || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-white/80">
              <MapPin className="w-5 h-5 text-white/40" />
              <span>Place: {customer.birth_city || 'Not provided'}</span>
            </div>
            {(customer.latitude && customer.longitude) && (
              <div className="pl-8 text-sm text-white/40">
                Lat: {customer.latitude}, Lon: {customer.longitude}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-white/10 pb-2">Additional Info</h3>
            <p className="text-white/80 text-sm">
              <span className="font-medium text-white/60">Gender:</span> {customer.gender || '—'}
            </p>
            <p className="text-white/80 text-sm">
              <span className="font-medium text-white/60">Timezone:</span> {customer.timezone || '—'}
            </p>
            <p className="text-white/80 text-sm">
              <span className="font-medium text-white/60">Notes:</span> {customer.notes || 'No notes.'}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'consultations' && (
        <ConsultationTab customerId={id!} />
      )}
    </div>
  );
}
