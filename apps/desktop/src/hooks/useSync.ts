import { useState, useEffect, useCallback, useRef } from 'react';
import { SyncManager } from '../lib/SyncManager';
import { getPendingSyncRecords } from '../lib/db';

export interface SyncState {
  isSyncing: boolean;
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingCount: number;
  sync: () => Promise<void>;
}

export function useSync(): SyncState {
  const [isSyncing, setIsSyncing] = useState(SyncManager.isSyncing);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  
  const pollingRef = useRef<any>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Poll for pending count
  const checkPending = useCallback(async () => {
    try {
      const customers = await getPendingSyncRecords('local_customers') as any[];
      const appointments = await getPendingSyncRecords('local_appointments') as any[];
      const consultations = await getPendingSyncRecords('local_consultations') as any[];
      setPendingCount(customers.length + appointments.length + consultations.length);
    } catch (e) {
      console.error('Failed to get pending sync records', e);
    }
  }, []);

  useEffect(() => {
    checkPending();
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, [checkPending]);

  // Sync action
  const sync = useCallback(async () => {
    if (!isOnline || SyncManager.isSyncing) return;
    
    setIsSyncing(true);
    
    // Poll SyncManager's status every 300ms while it's syncing
    pollingRef.current = setInterval(() => {
      setIsSyncing(SyncManager.isSyncing);
      if (!SyncManager.isSyncing) {
        if (pollingRef.current) clearInterval(pollingRef.current);
      }
    }, 300);

    try {
      await SyncManager.syncLocalToCloud();
      setLastSyncTime(new Date());
      await checkPending();
    } finally {
      setIsSyncing(false);
      if (pollingRef.current) clearInterval(pollingRef.current);
    }
  }, [isOnline, checkPending]);

  return {
    isSyncing,
    isOnline,
    lastSyncTime,
    pendingCount,
    sync
  };
}
