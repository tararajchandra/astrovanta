import React from 'react';
import { useServices } from '../../hooks/useSupabase';
import { Briefcase, Plus } from 'lucide-react';

export function ServicesSettings() {
  const { data: services, isLoading } = useServices();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Briefcase className="w-5 h-5" /> Consultation Services
        </h2>
        <button className="bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm font-medium hover:bg-indigo-100 transition-colors">
          <Plus className="w-4 h-4" /> Add Service
        </button>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-gray-500">Loading services...</div>
        ) : services?.length === 0 ? (
          <div className="text-gray-500 text-sm">No services configured yet.</div>
        ) : (
          services?.map(service => (
            <div key={service.id} className="border border-gray-100 rounded-lg p-4 flex justify-between items-center">
              <div>
                <h3 className="font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-500">{service.duration_minutes} mins</p>
              </div>
              <div className="font-medium text-gray-900">
                {service.currency} {service.price}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
