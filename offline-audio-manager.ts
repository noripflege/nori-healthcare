import { offlineManager } from "./offline-manager";

export interface OfflineAudioEntry {
  id: string;
  audioBlob: Blob;
  residentId: string;
  entryId: string;
  timestamp: number;
  processed: boolean;
  retryCount: number;
}

class OfflineAudioManager {
  private pendingAudio: OfflineAudioEntry[] = [];
  private readonly AUDIO_STORAGE_KEY = 'nori_offline_audio';
  private readonly MAX_AUDIO_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor() {
    this.loadPendingAudio();
    this.setupProcessingInterval();
  }

  // Save audio for offline processing
  async saveOfflineAudio(audioBlob: Blob, residentId: string, entryId: string): Promise<string> {
    const audioId = `audio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Convert blob to base64 for localStorage
    const base64Audio = await this.blobToBase64(audioBlob);
    
    const audioEntry: OfflineAudioEntry = {
      id: audioId,
      audioBlob: audioBlob, // Keep blob in memory for immediate use
      residentId,
      entryId,
      timestamp: Date.now(),
      processed: false,
      retryCount: 0
    };

    this.pendingAudio.push(audioEntry);
    
    // Save to localStorage (without blob, using base64)
    this.savePendingAudio({
      ...audioEntry,
      audioData: base64Audio,
      audioBlob: undefined as any
    });

    console.log(`💾 Audio saved offline: ${audioId}`);
    return audioId;
  }

  // Check if there are pending audio files to process
  hasPendingAudio(): boolean {
    return this.pendingAudio.filter(a => !a.processed).length > 0;
  }

  // Get count of pending audio files
  getPendingAudioCount(): number {
    return this.pendingAudio.filter(a => !a.processed).length;
  }

  // Process all pending audio when online
  async processAllPendingAudio(): Promise<void> {
    if (!navigator.onLine) return;

    const unprocessed = this.pendingAudio.filter(a => !a.processed);
    console.log(`🎤 Processing ${unprocessed.length} offline audio recordings...`);

    for (const audioEntry of unprocessed) {
      try {
        await this.processSingleAudio(audioEntry);
        audioEntry.processed = true;
        console.log(`✅ Processed audio: ${audioEntry.id}`);
        
        // Dispatch event for UI updates
        this.dispatchAudioProcessedEvent(audioEntry);
        
      } catch (error) {
        console.error(`❌ Failed to process audio: ${audioEntry.id}`, error);
        audioEntry.retryCount++;
        
        // Remove after 3 failed attempts
        if (audioEntry.retryCount >= 3) {
          console.error(`🚫 Giving up on audio after 3 retries: ${audioEntry.id}`);
          audioEntry.processed = true; // Mark as processed to stop retrying
        }
      }
    }

    // Clean up processed audio
    this.cleanupProcessedAudio();
    this.savePendingAudioToStorage();
  }

  private async processSingleAudio(audioEntry: OfflineAudioEntry): Promise<void> {
    // Recreate blob from localStorage if needed
    let audioBlob = audioEntry.audioBlob;
    if (!audioBlob) {
      const savedData = this.loadPendingAudioFromStorage().find(a => a.id === audioEntry.id);
      if (savedData?.audioData) {
        audioBlob = this.base64ToBlob(savedData.audioData);
      }
    }

    if (!audioBlob) {
      throw new Error('Audio blob not found');
    }

    // Create FormData for transcription
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');
    formData.append('entryId', audioEntry.entryId);
    formData.append('residentId', audioEntry.residentId);

    // Send to transcription service
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      body: formData,
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const result = await response.json();
    console.log(`🎯 Audio transcription completed for: ${audioEntry.id}`);
  }

  private setupProcessingInterval() {
    // Check for pending audio every 30 seconds when online
    setInterval(() => {
      if (navigator.onLine && this.hasPendingAudio()) {
        this.processAllPendingAudio();
      }
    }, 30000);

    // Listen for connection changes
    window.addEventListener('online', () => {
      setTimeout(() => {
        this.processAllPendingAudio();
      }, 2000); // Wait 2 seconds after coming online
    });
  }

  private dispatchAudioProcessedEvent(audioEntry: OfflineAudioEntry) {
    window.dispatchEvent(new CustomEvent('audioProcessed', {
      detail: {
        audioId: audioEntry.id,
        entryId: audioEntry.entryId,
        residentId: audioEntry.residentId
      }
    }));
  }

  private cleanupProcessedAudio() {
    const cutoff = Date.now() - this.MAX_AUDIO_AGE;
    this.pendingAudio = this.pendingAudio.filter(a => 
      !a.processed || a.timestamp > cutoff
    );
  }

  private async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private base64ToBlob(base64: string): Blob {
    const [header, data] = base64.split(',');
    const mimeType = header.split(':')[1].split(';')[0];
    const bytes = atob(data);
    const array = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) {
      array[i] = bytes.charCodeAt(i);
    }
    return new Blob([array], { type: mimeType });
  }

  private loadPendingAudio() {
    const data = this.loadPendingAudioFromStorage();
    // Convert stored data back to memory format (without blobs initially)
    this.pendingAudio = data.map(item => ({
      ...item,
      audioBlob: undefined as any // Will be loaded when needed
    }));
  }

  private loadPendingAudioFromStorage(): any[] {
    try {
      const data = localStorage.getItem(this.AUDIO_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private savePendingAudio(audioEntry: any) {
    const stored = this.loadPendingAudioFromStorage();
    stored.push(audioEntry);
    localStorage.setItem(this.AUDIO_STORAGE_KEY, JSON.stringify(stored));
  }

  private savePendingAudioToStorage() {
    const dataToStore = this.pendingAudio.map(item => ({
      ...item,
      audioBlob: undefined // Don't store blobs in localStorage
    }));
    localStorage.setItem(this.AUDIO_STORAGE_KEY, JSON.stringify(dataToStore));
  }

  // Get status for UI
  getAudioStatus() {
    return {
      pending: this.getPendingAudioCount(),
      total: this.pendingAudio.length,
      isProcessing: navigator.onLine && this.hasPendingAudio()
    };
  }
}

export const offlineAudioManager = new OfflineAudioManager();