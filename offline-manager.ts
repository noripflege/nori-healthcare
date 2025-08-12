import { queryClient } from "./queryClient";

export interface OfflineAction {
  id: string;
  type: 'CREATE_ENTRY' | 'UPDATE_ENTRY' | 'CREATE_RESIDENT' | 'UPDATE_RESIDENT' | 'APPROVE_ENTRY';
  data: any;
  timestamp: number;
  retryCount: number;
}

class OfflineManager {
  private isOnline = navigator.onLine;
  private syncInterval: NodeJS.Timeout | null = null;
  private pendingActions: OfflineAction[] = [];
  private readonly STORAGE_KEY = 'nori_offline_data';
  private readonly ACTIONS_KEY = 'nori_pending_actions';
  private lastNetworkCheck = Date.now();

  constructor() {
    this.loadPendingActions();
    this.setupNetworkListeners();
    this.startSyncInterval();
  }

  private setupNetworkListeners() {
    window.addEventListener('online', () => {
      console.log('📡 Back online - starting sync...');
      this.isOnline = true;
      this.syncPendingActions();
      this.dispatchConnectionEvent(true);
    });

    window.addEventListener('offline', () => {
      console.log('🔌 Gone offline - switching to offline mode');
      this.isOnline = false;
      this.dispatchConnectionEvent(false);
    });
  }

  private dispatchConnectionEvent(isOnline: boolean) {
    window.dispatchEvent(new CustomEvent('connectionStatus', { 
      detail: { isOnline } 
    }));
  }

  private startSyncInterval() {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.pendingActions.length > 0) {
        this.syncPendingActions();
      }
    }, 30000);
  }

  // Save data locally
  saveOfflineData(key: string, data: any) {
    const offlineData = this.getOfflineData();
    offlineData[key] = {
      ...data,
      lastModified: Date.now(),
      synced: false
    };
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(offlineData));
    console.log(`💾 Saved offline: ${key}`);
  }

  // Get offline data
  getOfflineData(): Record<string, any> {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }



  // Queue action for sync when online
  async queueAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) {
    // First check if we're truly online
    const reallyOnline = await this.checkRealNetworkStatus();
    
    if (reallyOnline) {
      // Try direct submission first
      try {
        await this.processAction({
          ...action,
          id: 'direct',
          timestamp: Date.now(),
          retryCount: 0
        });
        console.log(`✅ Direct submission successful: ${action.type}`);
        return;
      } catch (error) {
        console.log(`⚠️ Direct submission failed, queuing: ${action.type}`);
      }
    }

    // Queue for later if direct submission failed or offline
    const fullAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0
    };

    this.pendingActions.push(fullAction);
    this.savePendingActions();
    
    if (!reallyOnline) {
      console.log(`📱 Saving offline due to connection issue`);
    }
    console.log(`⏳ Queued action: ${action.type}`, fullAction);

    // Update online status
    this.isOnline = reallyOnline;
    this.dispatchConnectionEvent(reallyOnline);
  }

  private loadPendingActions() {
    try {
      const data = localStorage.getItem(this.ACTIONS_KEY);
      this.pendingActions = data ? JSON.parse(data) : [];
    } catch {
      this.pendingActions = [];
    }
  }

  private savePendingActions() {
    localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(this.pendingActions));
  }

  private async syncPendingActions() {
    if (!this.isOnline || this.pendingActions.length === 0) return;

    console.log(`🔄 Syncing ${this.pendingActions.length} pending actions...`);

    const actionsToProcess = [...this.pendingActions];
    
    for (const action of actionsToProcess) {
      try {
        await this.processAction(action);
        
        // Remove successful action
        this.pendingActions = this.pendingActions.filter(a => a.id !== action.id);
        console.log(`✅ Synced action: ${action.type}`);
        
      } catch (error) {
        console.error(`❌ Failed to sync action: ${action.type}`, error);
        
        // Increment retry count
        const actionIndex = this.pendingActions.findIndex(a => a.id === action.id);
        if (actionIndex !== -1) {
          this.pendingActions[actionIndex].retryCount++;
          
          // Remove after 5 failed retries
          if (this.pendingActions[actionIndex].retryCount >= 5) {
            console.error(`🚫 Giving up on action after 5 retries: ${action.type}`);
            this.pendingActions.splice(actionIndex, 1);
          }
        }
      }
    }

    this.savePendingActions();
    
    if (this.pendingActions.length === 0) {
      console.log('✅ All actions synced successfully');
    }

    // Invalidate relevant queries after sync
    queryClient.invalidateQueries();
  }

  private async processAction(action: OfflineAction): Promise<void> {
    switch (action.type) {
      case 'CREATE_ENTRY':
        await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
          credentials: 'include'
        });
        break;

      case 'UPDATE_ENTRY':
        await fetch(`/api/entries/${action.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
          credentials: 'include'
        });
        break;

      case 'APPROVE_ENTRY':
        await fetch(`/api/entries/${action.data.id}/approve`, {
          method: 'POST',
          credentials: 'include'
        });
        break;

      case 'CREATE_RESIDENT':
        await fetch('/api/residents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
          credentials: 'include'
        });
        break;

      case 'UPDATE_RESIDENT':
        await fetch(`/api/residents/${action.data.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(action.data),
          credentials: 'include'
        });
        break;

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isOnline: this.isOnline,
      pendingActions: this.pendingActions.length,
      lastSyncAttempt: this.pendingActions.length > 0 
        ? Math.max(...this.pendingActions.map(a => a.timestamp))
        : null
    };
  }

  // Expose the network check method
  async checkRealNetworkStatus(): Promise<boolean> {
    if (!navigator.onLine) {
      this.isOnline = false;
      this.dispatchConnectionEvent(false);
      return false;
    }

    try {
      // Test actual network connectivity with a small request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch('/api/auth/me', {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);
      this.lastNetworkCheck = Date.now();
      
      const isOnline = response.status < 500; // Accept any response except server errors
      this.isOnline = isOnline;
      this.dispatchConnectionEvent(isOnline);
      
      return isOnline;
    } catch (error) {
      console.log('📱 Network test failed, truly offline');
      this.isOnline = false;
      this.dispatchConnectionEvent(false);
      return false;
    }
  }

  // Manual sync trigger
  async forcSync() {
    if (this.isOnline) {
      await this.syncPendingActions();
    }
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    window.removeEventListener('online', this.setupNetworkListeners);
    window.removeEventListener('offline', this.setupNetworkListeners);
  }
}

export const offlineManager = new OfflineManager();