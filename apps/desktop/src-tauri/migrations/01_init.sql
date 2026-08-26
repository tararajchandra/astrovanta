CREATE TABLE IF NOT EXISTS local_customers (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    dob TEXT,
    tob TEXT,
    birth_city TEXT,
    sync_status TEXT DEFAULT 'PENDING_INSERT', -- 'SYNCED', 'PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE'
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS local_appointments (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    customer_id TEXT,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING',
    sync_status TEXT DEFAULT 'PENDING_INSERT',
    last_modified DATETIME DEFAULT CURRENT_TIMESTAMP
);
