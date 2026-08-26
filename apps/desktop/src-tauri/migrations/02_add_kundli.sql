CREATE TABLE IF NOT EXISTS saved_kundlis (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    dob TEXT NOT NULL,
    tob TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    timezone REAL NOT NULL,
    city TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
