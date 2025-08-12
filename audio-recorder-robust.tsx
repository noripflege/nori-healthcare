import { useState, useRef, useCallback, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mic, Square, RefreshCw, FileText, CheckCircle, AlertCircle } from "lucide-react";

export type RecordingState = 'idle' | 'recording' | 'processing' | 'done' | 'error';

interface RobustAudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob) => void;
  onStateChange?: (state: RecordingState) => void;
  maxDuration?: number; // seconds
  maxFileSize?: number; // bytes
}

export interface AudioRecorderRef {
  reset: () => void;
}

export const RobustAudioRecorder = forwardRef<AudioRecorderRef, RobustAudioRecorderProps>(({
  onRecordingComplete,
  onStateChange,
  maxDuration = 90,
  maxFileSize = 20 * 1024 * 1024, // 20MB
}, ref) => {
  const [state, setState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string>("");
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>("");
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Enhanced cross-browser format detection
  const getOptimalFormat = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    // Safari (iOS/macOS) - use MP4/AAC for best compatibility
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return {
        mimeType: 'audio/mp4;codecs=mp4a.40.2',
        extension: '.m4a'
      };
    }
    
    // Android Chrome - test WebM first, fallback to MP4
    if (userAgent.includes('android') && userAgent.includes('chrome')) {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        return { mimeType: 'audio/webm;codecs=opus', extension: '.webm' };
      }
      return { mimeType: 'audio/mp4;codecs=mp4a.40.2', extension: '.m4a' };
    }
    
    // Desktop Chrome/Firefox/Edge - WebM preferred
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      return { mimeType: 'audio/webm;codecs=opus', extension: '.webm' };
    }
    
    // Fallback for any browser
    return { mimeType: 'audio/mp4;codecs=mp4a.40.2', extension: '.m4a' };
  };
  
  const { mimeType, extension: fileExtension } = getOptimalFormat();

  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopTimer();
      cleanupStream();
    };
  }, []);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const cleanupStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateFileSize = (blob: Blob): boolean => {
    if (blob.size > maxFileSize) {
      const sizeMB = (blob.size / (1024 * 1024)).toFixed(1);
      const maxMB = (maxFileSize / (1024 * 1024)).toFixed(0);
      setError(`Aufnahme zu groß (${sizeMB} MB). Maximum: ${maxMB} MB. Bitte kürzer sprechen.`);
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    try {
      setError("");
      setState('recording');
      
      // Request microphone with optimized settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 44100,
        }
      });
      
      streamRef.current = stream;
      chunksRef.current = [];
      
      // Configure MediaRecorder with cross-browser settings
      const options: MediaRecorderOptions = {
        mimeType,
        audioBitsPerSecond: 64000,
      };
      
      // Fallback for unsupported MIME types
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn(`${mimeType} not supported, using default`);
        delete options.mimeType;
      }
      
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const finalMimeType = mediaRecorder.mimeType || mimeType;
        const audioBlob = new Blob(chunksRef.current, { type: finalMimeType });
        
        console.log(`Audio recorded: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        
        // Validate file size before processing
        if (!validateFileSize(audioBlob)) {
          setState('error');
          cleanupStream();
          return;
        }
        
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        setState('processing');
        console.log('Audio ready for processing:', audioBlob.size, 'bytes');
        onRecordingComplete(audioBlob);
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError("Aufnahmefehler. Bitte Mikrofon prüfen und erneut versuchen.");
        setState('error');
        cleanupStream();
      };
      
      // Start recording with time slicing
      mediaRecorder.start(1000); // 1s chunks
      startTimeRef.current = Date.now();
      
      // Audio feedback für Start
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (err) {
        // Audio Context Fehler ignorieren
      }
      
      // Start duration timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        
        // Auto-stop at max duration
        if (elapsed >= maxDuration) {
          stopRecording();
        }
      }, 100);
      
    } catch (error: any) {
      console.error('Error starting recording:', error);
      setState('error');
      
      if (error.name === 'NotAllowedError') {
        setError("Mikrofon-Zugriff verweigert. Bitte in den Browser-Einstellungen Mikrofonzugriff für diese Seite erlauben.");
      } else if (error.name === 'NotFoundError') {
        setError("Kein Mikrofon gefunden. Bitte Mikrofon anschließen und erneut versuchen.");
      } else if (error.name === 'NotReadableError') {
        setError("Mikrofon wird bereits verwendet. Bitte andere Anwendungen schließen und erneut versuchen.");
      } else {
        setError("Mikrofon kann nicht gestartet werden. Bitte prüfen Sie Ihre Geräteeinstellungen.");
      }
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state === 'recording') {
      mediaRecorderRef.current.stop();
      stopTimer();
      cleanupStream();
      
      // Audio feedback für Stop
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.3);
      } catch (err) {
        // Audio Context Fehler ignorieren
      }
    }
  }, [state]);

  const resetRecording = () => {
    // CRITICAL FIX: Proper cleanup and reset for re-recording
    setState('idle');
    setError("");
    setDuration(0);
    
    // Clean up existing audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl("");
    
    // Reset media recorder and stream
    stopTimer();
    cleanupStream();
    
    // Clear recorded chunks
    chunksRef.current = [];
    
    // Reset media recorder reference
    mediaRecorderRef.current = null;
    
    console.log("🔄 Recording reset - ready for new recording");
  };

  // Expose reset function to parent via ref
  useImperativeHandle(ref, () => ({
    reset: resetRecording
  }));

  const getStatusText = () => {
    switch (state) {
      case 'idle': return 'Bereit für Aufnahme';
      case 'recording': return `Aufnahme läuft... ${formatTime(duration)}`;
      case 'processing': return 'Spracherkennung läuft...';
      case 'done': return 'Aufnahme erfolgreich';
      case 'error': return 'Fehler bei Aufnahme';
      default: return '';
    }
  };

  const getStatusColor = () => {
    switch (state) {
      case 'idle': return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'recording': return 'bg-red-50 text-red-700 border border-red-200';
      case 'processing': return 'bg-indigo-50 text-indigo-700 border border-indigo-200';
      case 'done': return 'bg-green-50 text-green-700 border border-green-200';
      case 'error': return 'bg-red-50 text-red-700 border border-red-200';
      default: return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (state) {
      case 'recording': return <Mic className="h-4 w-4 animate-pulse" />;
      case 'processing': return <FileText className="h-4 w-4 animate-spin" />;
      case 'done': return <CheckCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Mic className="h-4 w-4" />;
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-center">
            <Badge className={`${getStatusColor()} px-4 py-2`}>
              <div className="flex items-center gap-2">
                {getStatusIcon()}
                {getStatusText()}
              </div>
            </Badge>
          </div>

          {/* Recording Timer - Large Display */}
          {state === 'recording' && (
            <div className="text-center">
              <div className="text-4xl font-mono font-bold text-red-600">
                {formatTime(duration)}
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Maximum: {formatTime(maxDuration)}
              </div>
            </div>
          )}

          {/* Audio Format Info - Hidden to save space */}
          <div className="hidden">
            <Badge variant="outline" className="text-xs">
              {mimeType.includes('mp4') ? 'Safari: MP4/M4A' : 'Chrome: WebM/Opus'}
            </Badge>
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-3">
            {state === 'idle' && (
              <Button
                onClick={startRecording}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Mic className="h-5 w-5" />
                  <span>Aufnahme starten</span>
                </div>
              </Button>
            )}
            
            {state === 'recording' && (
              <Button
                onClick={stopRecording}
                size="lg"
                variant="destructive"
                className="px-8"
              >
                <Square className="h-5 w-5 mr-2" />
                Aufnahme stoppen
              </Button>
            )}
            
            {(state === 'done' || state === 'error') && (
              <Button
                onClick={resetRecording}
                size="lg"
                variant="outline"
                className="px-8"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Erneut aufnehmen
              </Button>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Audio Preview */}
          {audioUrl && state !== 'error' && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Aufnahme-Vorschau:</label>
              <audio 
                src={audioUrl} 
                controls 
                className="w-full"
                preload="metadata"
              />
            </div>
          )}

          {/* Recording Instructions */}
          {state === 'idle' && (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Sprechen Sie deutlich und ruhig über die Pflegesituation.
              </p>
              <p className="text-xs text-muted-foreground">
                • Maximum {maxDuration}s • Dateigröße max. {Math.round(maxFileSize/(1024*1024))}MB
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});