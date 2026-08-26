import React, { useEffect, useState } from 'react';
import { FileText, Plus, X } from 'lucide-react';
import { getConsultations, addLocalConsultation, getCustomers } from '../lib/db';

export function ConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    date: new Date().toISOString().split('T')[0],
    topic: '',
    privateNotes: '',
    recommendations: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [cons, custs] = await Promise.all([
      getConsultations(),
      getCustomers()
    ]);
    setConsultations(cons);
    setClients(custs);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.clientId || !formData.date) return;

    await addLocalConsultation(
      'tenant-1',
      crypto.randomUUID(),
      formData.clientId,
      '', // No appointment ID linked for now
      formData.date,
      formData.topic,
      formData.privateNotes,
      formData.recommendations
    );
    
    setShowModal(false);
    setFormData({ clientId: '', date: new Date().toISOString().split('T')[0], topic: '', privateNotes: '', recommendations: '' });
    await loadData();
  }

  function getClientName(id: string) {
    const c = clients.find(x => x.id === id);
    return c ? `${c.first_name} ${c.last_name}` : 'Unknown Client';
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Consultations</div>
          <div className="topbar-subtitle">Client session notes and reports</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add Consultation Note
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Client</th>
                <th>Topic</th>
                <th>Sync Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="empty-state">Loading consultations...</td></tr>
              ) : consultations.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <FileText size={36} className="icon" />
                      No consultation notes yet.
                    </div>
                  </td>
                </tr>
              ) : consultations.map(c => (
                <tr key={c.id}>
                  <td>{new Date(c.consultation_date).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</td>
                  <td>{getClientName(c.client_id)}</td>
                  <td>{c.topic || 'General'}</td>
                  <td>
                    <span className={`badge ${c.sync_status === 'SYNCED' ? 'synced' : 'pending'}`}>
                      {c.sync_status === 'SYNCED' ? 'Synced' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ width: '600px' }}>
            <div className="modal-header">
              <span>New Consultation Note</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Select Client *</label>
                    <select required className="form-control" value={formData.clientId} onChange={e => setFormData({...formData, clientId: e.target.value})}>
                      <option value="">-- Choose Client --</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.first_name} {c.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input type="date" required className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Topic</label>
                  <input className="form-control" placeholder="e.g. Career Consultation" value={formData.topic} onChange={e => setFormData({...formData, topic: e.target.value})} />
                </div>

                <div className="form-group">
                  <label>Private Notes (Astrologer Only)</label>
                  <textarea 
                    className="form-control" 
                    rows={4} 
                    placeholder="These notes will never be visible to the customer..."
                    value={formData.privateNotes} 
                    onChange={e => setFormData({...formData, privateNotes: e.target.value})} 
                  />
                </div>

                <div className="form-group">
                  <label>Recommendations (Client Visible)</label>
                  <textarea 
                    className="form-control" 
                    rows={3} 
                    placeholder="Remedies, mantras, or suggestions for the client..."
                    value={formData.recommendations} 
                    onChange={e => setFormData({...formData, recommendations: e.target.value})} 
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Notes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
