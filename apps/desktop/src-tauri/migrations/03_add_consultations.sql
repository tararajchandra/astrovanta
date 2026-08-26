CREATE TABLE IF NOT EXISTS local_consultations (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    client_id TEXT NOT NULL,
    appointment_id TEXT,
    consultation_date TEXT NOT NULL,
    topic TEXT,
    private_notes TEXT,
    recommendations TEXT,
    sync_status TEXT DEFAULT 'PENDING_INSERT',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
);
