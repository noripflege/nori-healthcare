class SessionManager {
  private inactivityTimer: NodeJS.Timeout | null = null;
  private warningTimer: NodeJS.Timeout | null = null;
  private readonly INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes
  private readonly WARNING_TIME = 2 * 60 * 1000; // 2 minutes before logout
  private readonly AUTOSAVE_INTERVAL = 2 * 60 * 1000; // 2 minutes
  private autosaveTimer: NodeJS.Timeout | null = null;
  private callbacks: {
    onWarning?: (timeLeft: number) => void;
    onLogout?: () => void;
    onAutosave?: () => void;
  } = {};

  constructor() {
    this.setupActivityListeners();
    this.startAutosave();
  }

  private setupActivityListeners() {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const resetTimer = () => {
      this.resetInactivityTimer();
    };

    events.forEach(event => {
      document.addEventListener(event, resetTimer, { passive: true });
    });

    // Start the initial timer
    this.resetInactivityTimer();
  }

  private resetInactivityTimer() {
    // Clear existing timers
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);

    // Set warning timer (18 minutes - 2 minutes before logout)
    this.warningTimer = setTimeout(() => {
      console.log('⚠️ Session warning: 2 minutes until auto-logout');
      this.callbacks.onWarning?.(2 * 60); // 2 minutes left
      this.startCountdown();
    }, this.INACTIVITY_TIMEOUT - this.WARNING_TIME);

    // Set logout timer (20 minutes)
    this.inactivityTimer = setTimeout(() => {
      console.log('🔒 Auto-logout due to inactivity');
      this.callbacks.onLogout?.();
      this.logout();
    }, this.INACTIVITY_TIMEOUT);
  }

  private startCountdown() {
    let timeLeft = this.WARNING_TIME / 1000; // Convert to seconds
    
    const countdownInterval = setInterval(() => {
      timeLeft--;
      this.callbacks.onWarning?.(timeLeft);
      
      if (timeLeft <= 0) {
        clearInterval(countdownInterval);
      }
    }, 1000);

    // Clear countdown if user becomes active
    const clearCountdown = () => {
      clearInterval(countdownInterval);
      document.removeEventListener('mousedown', clearCountdown);
      document.removeEventListener('keypress', clearCountdown);
    };

    document.addEventListener('mousedown', clearCountdown, { once: true });
    document.addEventListener('keypress', clearCountdown, { once: true });
  }

  private startAutosave() {
    this.autosaveTimer = setInterval(() => {
      console.log('💾 Auto-save triggered');
      this.callbacks.onAutosave?.();
    }, this.AUTOSAVE_INTERVAL);
  }

  setCallbacks(callbacks: {
    onWarning?: (timeLeft: number) => void;
    onLogout?: () => void;
    onAutosave?: () => void;
  }) {
    this.callbacks = callbacks;
  }

  private async logout() {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
      
      // Redirect to login
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect anyway for security
      window.location.href = '/login';
    }
  }

  // Manual logout
  async manualLogout() {
    this.cleanup();
    await this.logout();
  }

  // Reset session (called when user performs actions)
  resetSession() {
    this.resetInactivityTimer();
  }

  // Cleanup timers
  cleanup() {
    if (this.inactivityTimer) clearTimeout(this.inactivityTimer);
    if (this.warningTimer) clearTimeout(this.warningTimer);
    if (this.autosaveTimer) clearTimeout(this.autosaveTimer);
  }

  // Get time until logout (for display)
  getTimeUntilLogout(): number {
    // This is approximate - for exact timing, use the warning callback
    return this.INACTIVITY_TIMEOUT;
  }
}

export const sessionManager = new SessionManager();