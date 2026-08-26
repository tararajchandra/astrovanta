import React, { useEffect, useState } from 'react';
import { Users, Plus, Search, X } from 'lucide-react';
import { getCustomers, addLocalCustomer } from '../lib/db';

export function ClientsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    dob: '', tob: '', birthCity: ''
  });

  useEffect(() => { loadClients(); }, []);

  async function loadClients() {
    setLoading(true);
    setCustomers(await getCustomers());
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await addLocalCustomer(
      'tenant-1', 
      crypto.randomUUID(), 
      formData.firstName, 
      formData.lastName, 
      formData.email, 
      formData.phone,
      formData.dob,
      formData.tob,
      formData.birthCity
    );
    setShowModal(false);
    setFormData({ firstName: '', lastName: '', email: '', phone: '', dob: '', tob: '', birthCity: '' });
    await loadClients();
  }

  const filtered = customers.filter(c =>
    `${c.first_name} ${c.last_name} ${c.email} ${c.phone}`
      .toLowerCase().includes(query.toLowerCase())
  );

  function initials(c: any) {
    return `${c.first_name?.[0] || ''}${c.last_name?.[0] || ''}`.toUpperCase();
  }

  return (
    <>
      <div className="topbar">
        <div>
          <div className="topbar-title">Clients</div>
          <div className="topbar-subtitle">{customers.length} clients stored locally</div>
        </div>
        <div className="flex-center gap-3">
          <div className="search-wrap">
            <Search className="search-icon" />
            <input
              className="search-input"
              placeholder="Search clients..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Add Client
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Contact</th>
                <th>Birth Details</th>
                <th>Sync Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} className="empty-state">Loading local database...</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="empty-state">
                      <Users size={36} className="icon" />
                      No clients yet. Click "Add Client" to get started.
                    </div>
                  </td>
                </tr>
              ) : filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="flex-center gap-3">
                      <div className="avatar">{initials(c)}</div>
                      <div>
                        <div className="primary-text">{c.first_name} {c.last_name}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '1px' }}>
                          #{c.id.split('-')[0]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{c.phone || '—'}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.email || '—'}</div>
                  </td>
                  <td>
                    <div>{c.dob || '—'} {c.tob ? `at ${c.tob}` : ''}</div>
                    <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px' }}>{c.birth_city || '—'}</div>
                  </td>
                  <td>
                    <span className={`badge ${c.sync_status === 'SYNCED' ? 'synced' : 'pending'}`}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                      {c.sync_status === 'SYNCED' ? 'Synced' : 'Pending'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Client Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span>Add New Client</span>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>First Name *</label>
                    <input required className="form-control" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Last Name</label>
                    <input className="form-control" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input className="form-control" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                </div>

                <div className="section-title" style={{ marginTop: '10px' }}>Birth Details</div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div className="form-group">
                    <label>Date of Birth</label>
                    <input type="date" className="form-control" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Time of Birth</label>
                    <input type="time" className="form-control" value={formData.tob} onChange={e => setFormData({...formData, tob: e.target.value})} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Place of Birth</label>
                  <input className="form-control" placeholder="City, State, Country" value={formData.birthCity} onChange={e => setFormData({...formData, birthCity: e.target.value})} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Client</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
