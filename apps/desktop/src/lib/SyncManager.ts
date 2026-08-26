import { getPendingSyncRecords, markRecordSynced, getDb } from './db';
import { supabase } from './supabaseClient';

export class SyncManager {
  static isSyncing = false;

  static async syncLocalToCloud() {
    if (this.isSyncing) return;
    this.isSyncing = true;
    
    try {
      console.log('Starting sync process...');
      
      // 1. PUSH: Local -> Cloud
      await this.pushChanges('local_customers', 'customers');
      await this.pushChanges('local_appointments', 'appointments');
      
      // 2. PULL: Cloud -> Local (Basic fetch, ignoring conflict resolution for simplicity in Phase 5)
      await this.pullChanges('customers', 'local_customers');
      await this.pullChanges('appointments', 'local_appointments');
      
      console.log('Sync complete.');
    } catch (e) {
      console.error('Sync failed', e);
    } finally {
      this.isSyncing = false;
    }
  }

  private static async pushChanges(localTable: string, cloudTable: string) {
    const pendingRecords = await getPendingSyncRecords(localTable) as any[];
    
    for (const record of pendingRecords) {
      // Remove sync metadata before pushing to Supabase
      const { sync_status, last_modified, ...payload } = record;

      if (sync_status === 'PENDING_INSERT') {
        const { error } = await supabase.from(cloudTable).insert([payload]);
        if (!error) {
          await markRecordSynced(localTable, record.id);
        } else {
          console.error(`Failed to insert ${record.id} to ${cloudTable}:`, error);
        }
      } 
      else if (sync_status === 'PENDING_UPDATE') {
        const { error } = await supabase.from(cloudTable).update(payload).eq('id', record.id);
        if (!error) {
          await markRecordSynced(localTable, record.id);
        } else {
          console.error(`Failed to update ${record.id} in ${cloudTable}:`, error);
        }
      }
      else if (sync_status === 'PENDING_DELETE') {
        const { error } = await supabase.from(cloudTable).delete().eq('id', record.id);
        if (!error) {
          const db = await getDb();
          await db.execute(`DELETE FROM ${localTable} WHERE id = $1`, [record.id]);
        } else {
          console.error(`Failed to delete ${record.id} from ${cloudTable}:`, error);
        }
      }
    }
  }

  private static async pullChanges(cloudTable: string, localTable: string) {
    // In a real implementation, we'd store a `last_sync_timestamp` and only fetch rows updated after it.
    // For Phase 5, we fetch everything and 'upsert' locally to demonstrate the pipeline.
    const { data, error } = await supabase.from(cloudTable).select('*');
    if (error) {
      console.error(`Failed to pull from ${cloudTable}:`, error);
      return;
    }

    if (data && data.length > 0) {
      const db = await getDb();
      for (const row of data) {
        // Simple Upsert logic for SQLite
        // Dynamically build the insert query based on the row keys
        const keys = Object.keys(row);
        const values = Object.values(row);
        
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
        
        // This is a naive UPSERT (REPLACE) which overrides local pending changes if not pushed yet.
        // A robust system uses CRDTs or Timestamp conflict resolution.
        const query = `REPLACE INTO ${localTable} (${keys.join(', ')}, sync_status) VALUES (${placeholders}, 'SYNCED')`;
        await db.execute(query, values);
      }
    }
  }
}
