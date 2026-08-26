import React, { useState } from 'react';
import { useConsultations, useAddConsultation } from '../../hooks/useSupabase';
import { Lock, FileText, Send, AlertCircle } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { ReportDocument } from '../../components/pdf/ReportDocument';

export function ConsultationTab({ customerId }: { customerId: string }) {
  const { data: consultations, isLoading } = useConsultations();
  const addConsultation = useAddConsultation();
  
  const [privateNotes, setPrivateNotes] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  
  const customerConsultations = consultations?.filter(c => c.appointment?.customer_id === customerId) || [];

  const handleSave = () => {
    addConsultation.mutate({
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

  if (isLoading) return <div className="text-white/50 text-center py-8">Loading consultations...</div>;

  return (
    <div className="space-y-6">
      {/* Add New Consultation Note */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 text-white">
          <FileText className="w-5 h-5 text-indigo-400" /> New Consultation Note
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1 flex items-center gap-1">
              <Lock className="w-4 h-4 text-red-400" /> Private Notes
            </label>
            <p className="text-xs text-white/40 mb-3">Only visible to you. Never shared with the client.</p>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-32 focus:border-yellow-400 outline-none text-white placeholder-white/30"
              placeholder="Astrological logic, internal observations..."
              value={privateNotes}
              onChange={(e) => setPrivateNotes(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/80 mb-1 flex items-center gap-1">
              <FileText className="w-4 h-4 text-green-400" /> Client Report Notes
            </label>
            <p className="text-xs text-white/40 mb-3">Will be included in the PDF report for the client.</p>
            <textarea 
              className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm h-32 focus:border-yellow-400 outline-none text-white placeholder-white/30"
              placeholder="Remedies, predictions, advice..."
              value={clientNotes}
              onChange={(e) => setClientNotes(e.target.value)}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button 
            onClick={handleSave}
            disabled={addConsultation.isPending || (!privateNotes && !clientNotes)}
            className="bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-600 disabled:opacity-50 transition-colors"
          >
            {addConsultation.isPending ? 'Saving...' : 'Save Consultation'}
          </button>
        </div>
      </div>

      {/* History */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg text-white border-b border-white/10 pb-2">History</h3>
        {customerConsultations.length === 0 ? (
          <div className="text-white/40 text-sm py-4">No past consultations found.</div>
        ) : (
          customerConsultations.map(c => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="flex justify-between items-start mb-4">
                <div className="text-sm text-white/50">
                  {new Date(c.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <PDFDownloadLink 
                  document={<ReportDocument clientNotes={c.client_visible_notes} />} 
                  fileName={`Report_${c.id}.pdf`}
                  className="bg-white/10 border border-white/10 text-indigo-300 px-3 py-1.5 rounded-lg flex items-center gap-1 text-xs font-medium hover:bg-white/20 transition-colors"
                >
                  {/* @ts-ignore */}
                  {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
                </PDFDownloadLink>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {c.private_notes && (
                  <div className="bg-red-900/20 p-4 rounded-lg border border-red-900/30 text-sm text-white/80">
                    <div className="flex items-center gap-1 font-semibold text-red-400 mb-2 text-xs">
                      <Lock className="w-3 h-3" /> Private
                    </div>
                    <div className="whitespace-pre-wrap">{c.private_notes}</div>
                  </div>
                )}
                {c.client_visible_notes && (
                  <div className="bg-green-900/20 p-4 rounded-lg border border-green-900/30 text-sm text-white/80">
                    <div className="flex items-center gap-1 font-semibold text-green-400 mb-2 text-xs">
                      <FileText className="w-3 h-3" /> Included in Report
                    </div>
                    <div className="whitespace-pre-wrap">{c.client_visible_notes}</div>
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
