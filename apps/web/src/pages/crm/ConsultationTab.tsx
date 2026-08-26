import React, { useState } from 'react';
import { useConsultations, useAddConsultation } from '../../hooks/useSupabase';
import { Lock, FileText, Send, AlertCircle } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportDocument } from '../../components/pdf/ReportDocument';

export function ConsultationTab({ customerId }: { customerId: string }) {
  // In a real app we would fetch appointments for this customer, 
  // and pass the appointmentId. For now we just fetch all consultations.
  const { data: consultations, isLoading } = useConsultations();
  const addConsultation = useAddConsultation();
  
  const [privateNotes, setPrivateNotes] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  
  // Filter for this customer (ideally done via DB query using customer_id relation)
  // Since our schema links consultation -> appointment -> customer, we filter on the frontend for now
  const customerConsultations = consultations?.filter(c => c.appointment?.customer_id === customerId) || [];

  const handleSave = () => {
    addConsultation.mutate({
      // We would pass the actual selected appointment ID here
      // appointment_id: selectedAppointmentId,
      private_notes: privateNotes,
      client_visible_notes: clientNotes,
      status: 'COMPLETED'
    }, {
      onSuccess: () => {
        setPrivateNotes('');
        setClientNotes('');
      }
    });
  };

  if (isLoading) return <div className="text-gray-500">Loading consultations...</div>;

  return (
    <div className="space-y-6">
      {/* Add New Consultation Note */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-indigo-600" /> New Consultation Note
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <Lock className="w-4 h-4 text-red-500" /> Private Notes
            </label>
            <p className="text-xs text-gray-500 mb-2">Only visible to you. Never shared with the client.</p>
            <textarea 
              className="w-full border rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Astrological logic, internal observations..."
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FileText className="w-4 h-4 text-green-500" /> Client Report Notes
            </label>
            <p className="text-xs text-gray-500 mb-2">Will be included in the PDF report for the client.</p>
            <textarea 
              className="w-full border rounded-lg p-3 text-sm h-32 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="Remedies, predictions, advice..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end gap-3">
          <button 
            onClick={handleSave}
            disabled={addConsultation.isPending || (!privateNotes && !clientNotes)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {addConsultation.isPending ? 'Saving...' : 'Save Consultation'}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">History</h3>
        {customerConsultations.length === 0 ? (
          <div className="text-gray-500 text-sm">No past consultations found.</div>
        ) : (
          customerConsultations.map(c => (
            <div key={c.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="text-sm text-gray-500">
                  {new Date(c.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <PDFDownloadLink 
                  document={<ReportDocument clientNotes={c.client_visible_notes} />} 
                  fileName={`Report_${c.id}.pdf`}
                  className="bg-white border border-gray-200 text-indigo-600 px-3 py-1.5 rounded flex items-center gap-1 text-xs font-medium hover:bg-gray-50"
                >
                  {/* @ts-ignore */}
                  {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
                </PDFDownloadLink>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {c.private_notes && (
                  <div className="bg-red-50/50 p-3 rounded border border-red-100 text-sm text-gray-700">
                    <div className="flex items-center gap-1 font-semibold text-red-700 mb-1 text-xs">
                      <Lock className="w-3 h-3" /> Private
                    </div>
                    {c.private_notes}
                  </div>
                )}
                {c.client_visible_notes && (
                  <div className="bg-green-50/50 p-3 rounded border border-green-100 text-sm text-gray-700">
                    <div className="flex items-center gap-1 font-semibold text-green-700 mb-1 text-xs">
                      <FileText className="w-3 h-3" /> Included in Report
                    </div>
                    {c.client_visible_notes}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
