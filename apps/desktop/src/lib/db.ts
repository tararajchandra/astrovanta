import Database from '@tauri-apps/plugin-sql';

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load('sqlite:astrovanta.db');
  }
  return dbInstance;
}

// ---- CUSTOMERS ----

export async function addLocalCustomer(
  tenantId: string, id: string, firstName: string, lastName: string, 
  email: string, phone: string, dob: string = '', tob: string = '', birthCity: string = ''
) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO local_customers (id, tenant_id, first_name, last_name, email, phone, dob, tob, birth_city) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
    [id, tenantId, firstName, lastName, email, phone, dob, tob, birthCity]
  );
}

export async function updateLocalCustomer(
  id: string, firstName: string, lastName: string, 
  email: string, phone: string, dob: string, tob: string, birthCity: string
) {
  const db = await getDb();
  await db.execute(
    `UPDATE local_customers 
     SET first_name = $1, last_name = $2, email = $3, phone = $4, 
         dob = $5, tob = $6, birth_city = $7, sync_status = 'PENDING_UPDATE', last_modified = CURRENT_TIMESTAMP
     WHERE id = $8`,
    [firstName, lastName, email, phone, dob, tob, birthCity, id]
  );
}

export async function deleteLocalCustomer(id: string) {
  const db = await getDb();
  await db.execute(
    `UPDATE local_customers SET sync_status = 'PENDING_DELETE', last_modified = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  );
}

export async function getCustomers(): Promise<any[]> {
  try {
    const db = await getDb();
    return await db.select(`SELECT * FROM local_customers WHERE sync_status != 'PENDING_DELETE' ORDER BY last_modified DESC`);
  } catch (error) {
    console.error("Failed to load local customers:", error);
    return [];
  }
}

// ---- APPOINTMENTS ----

export async function addLocalAppointment(
  tenantId: string, id: string, customerId: string, startTime: string, endTime: string, status: string = 'PENDING'
) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO local_appointments (id, tenant_id, customer_id, start_time, end_time, status) 
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, tenantId, customerId, startTime, endTime, status]
  );
}

export async function updateLocalAppointment(
  id: string, startTime: string, endTime: string, status: string
) {
  const db = await getDb();
  await db.execute(
    `UPDATE local_appointments 
     SET start_time = $1, end_time = $2, status = $3, sync_status = 'PENDING_UPDATE', last_modified = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [startTime, endTime, status, id]
  );
}

export async function getAppointments(): Promise<any[]> {
  try {
    const db = await getDb();
    return await db.select(`SELECT * FROM local_appointments WHERE sync_status != 'PENDING_DELETE' ORDER BY start_time ASC`);
  } catch (error) {
    console.error("Failed to load local appointments:", error);
    return [];
  }
}

export async function deleteLocalAppointment(id: string) {
  const db = await getDb();
  await db.execute(
    `UPDATE local_appointments SET sync_status = 'PENDING_DELETE', last_modified = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  );
}

// ---- CONSULTATIONS ----

export async function addLocalConsultation(
  tenantId: string, id: string, clientId: string, appointmentId: string, 
  consultationDate: string, topic: string, privateNotes: string, recommendations: string
) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO local_consultations (id, tenant_id, client_id, appointment_id, consultation_date, topic, private_notes, recommendations) 
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [id, tenantId, clientId, appointmentId, consultationDate, topic, privateNotes, recommendations]
  );
}

export async function getConsultations(): Promise<any[]> {
  try {
    const db = await getDb();
    return await db.select(`SELECT * FROM local_consultations WHERE sync_status != 'PENDING_DELETE' ORDER BY consultation_date DESC`);
  } catch (error) {
    console.error("Failed to load local consultations:", error);
    return [];
  }
}

export async function deleteLocalConsultation(id: string) {
  const db = await getDb();
  await db.execute(
    `UPDATE local_consultations SET sync_status = 'PENDING_DELETE', last_modified = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  );
}

// ---- KUNDLI ----

export async function saveKundli(id: string, name: string, dob: string, tob: string, latitude: number, longitude: number, timezone: number, city: string) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO saved_kundlis (id, name, dob, tob, latitude, longitude, timezone, city)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     ON CONFLICT(id) DO UPDATE SET
        name = excluded.name,
        dob = excluded.dob,
        tob = excluded.tob,
        latitude = excluded.latitude,
        longitude = excluded.longitude,
        timezone = excluded.timezone,
        city = excluded.city`,
    [id, name, dob, tob, latitude, longitude, timezone, city]
  );
}

export async function getSavedKundlis(): Promise<any[]> {
  try {
    const db = await getDb();
    return await db.select(`SELECT * FROM saved_kundlis ORDER BY created_at DESC`);
  } catch (error) {
    console.error("Failed to load saved kundlis:", error);
    return [];
  }
}

export async function deleteKundli(id: string) {
  const db = await getDb();
  await db.execute(`DELETE FROM saved_kundlis WHERE id = $1`, [id]);
}

// ---- SYNC ----

export async function getPendingSyncRecords(table: string) {
  const db = await getDb();
  return await db.select(
    `SELECT * FROM ${table} WHERE sync_status IN ('PENDING_INSERT', 'PENDING_UPDATE', 'PENDING_DELETE')`
  );
}

export async function markRecordSynced(table: string, id: string) {
  const db = await getDb();
  await db.execute(
    `UPDATE ${table} SET sync_status = 'SYNCED', last_modified = CURRENT_TIMESTAMP WHERE id = $1`,
    [id]
  );
}
