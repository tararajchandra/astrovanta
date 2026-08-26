import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, X } from 'lucide-react';
import { getAppointments, addLocalAppointment, getCustomers } from '../lib/db';

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    customerId: '',
    date: '',
    startTime: '',
    endTime: '',
    status: 'PENDING'
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [appts, custs] = await Promise.all([
      getAppointments(),
      getCustomers()
    ]);
    setAppointments(appts);
    setClients(custs);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.customerId || !formData.date || !formData.startTime || !formData.endTime) return;
    
    // Combine date and time
    const startIso = new Date(`${formData.date}T${formData.startTime}`).toISOString();
    const endIso = new Date(`${formData.date}T${formData.endTime}`).toISOString();

    await addLocalAppointment(
      'tenant-1',
      crypto.randomUUID(),
      formData.customerId,
      startIso,
      endIso,
      formData.status
    );
    
    setShowModal(false);
    setFormData({ customerId: '', date: '', startTime: '', endTime: '', status: 'PENDING' });
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
          <div className="topbar-title">Appointments</div>
          <div className="topbar-subtitle">Manage your schedule</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={14} /> Add Appointment
        </button>
      </div>

      <div className="page-content">
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Client</th>
                <th>Status</th>
                <th>Sync Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="empty-state">Loading appointments...</td></tr>
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <CalendarDays size={36} className="icon" />
                      No appointments yet.
                    </div>
                  </td>
                </tr>
              ) : appointments.map(a => {
                const start = new Date(a.start_time);
                const end = new Date(a.end_time);
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="primary-text">{start.toLocaleDateString('en-IN', { dateStyle: 'medium' })}</div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                        {start.toLocaleTimeString('en-IN', { timeStyle: 'short' })} - {end.toLocaleTimeString('en-IN', { timeStyle: 'short' })}
                      </div>
                    </td>
                    <td>{getClientName(a.customer_id)}</td>
                    <td>
                      <span className={`badge ${a.status === 'CONFIRMED' ? 'success' : 'pending'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${a.sync_status === 'SYNCED' ? 'synced' : 'pending'}`}>
                        {a.sync_status === 'SYNCED' ? 'Synced' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>Schedule Appointment</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Select Client *</label>
                  <select required className="form-control" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input type="time" required className="form-control" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>End Time *</label>
                    <input type="time" required className="form-control" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="form-control" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
