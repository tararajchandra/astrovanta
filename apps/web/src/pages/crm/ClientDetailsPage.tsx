import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCustomer } from '../../hooks/useSupabase';
import { ArrowLeft, User, Calendar, MapPin, Clock, MessageSquare, History } from 'lucide-react';
import { ConsultationTab } from './ConsultationTab';

export function ClientDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: customer, isLoading, error } = useCustomer(id!);
  const [activeTab, setActiveTab] = useState<'details' | 'consultations'>('details');

  if (isLoading) return <div className="p-6 text-center text-gray-500">Loading client details...</div>;
  if (error || !customer) return <div className="p-6 text-center text-red-500">Error loading client.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link to="/clients" className="inline-flex items-center gap-2 text-indigo-600 hover:underline mb-6 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Clients
      </Link>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex items-start gap-4">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.first_name} {customer.last_name}</h1>
            <p className="text-gray-500 mt-1">{customer.phone} • {customer.email}</p>
          </div>
        </div>
        
        <div className="flex border-b border-gray-100 px-6">
          <button 
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'details' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('details')}
          >
            <User className="w-4 h-4" /> Client Info
          </button>
          <button 
            className={`px-4 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'consultations' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveTab('consultations')}
          >
            <MessageSquare className="w-4 h-4" /> Consultations & Reports
          </button>
        </div>
      </div>

      {activeTab === 'details' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Birth Details</h3>
            <div className="flex items-center gap-3 text-gray-600">
              <Calendar className="w-5 h-5 text-gray-400" />
              <span>Date: {customer.dob || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <Clock className="w-5 h-5 text-gray-400" />
              <span>Time: {customer.tob || 'Not provided'}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-600">
              <MapPin className="w-5 h-5 text-gray-400" />
              <span>Place: {customer.birth_city || 'Not provided'}</span>
            </div>
            {(customer.latitude && customer.longitude) && (
              <div className="pl-8 text-sm text-gray-400">
                Lat: {customer.latitude}, Lon: {customer.longitude}
              </div>
            )}
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Additional Info</h3>
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-gray-700">Gender:</span> {customer.gender || '—'}
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-gray-700">Timezone:</span> {customer.timezone || '—'}
            </p>
            <p className="text-gray-600 text-sm">
              <span className="font-medium text-gray-700">Notes:</span> {customer.notes || 'No notes.'}
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
