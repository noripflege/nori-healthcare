import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Mic, Square, Upload } from "lucide-react";

interface AudioRecorderProps {
  onAudioReady: (audioBlob: Blob) => void;
  onStateChange?: (state: RecordingState) => void;
  disabled?: boolean;
}

export type RecordingState = 
  | 'idle' 
  | 'recording' 
  | 'uploading' 
  | 'transcribing' 
  | 'translating' 
  | 'summarizing' 
  | 'done' 
  | 'error';

const MAX_RECORDING_TIME = 60; // 60 seconds
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export function AudioRecorder({ onAudioReady, onStateChange, disabled }: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>('idle');
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const { toast } = useToast();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Update parent component with state changes
  useEffect(() => {
    onStateChange?.(state);
  }, [state, onStateChange]);

  const startRecording = async () => {
    try {
      // Request microphone permission
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      setStream(mediaStream);
      chunksRef.current = [];

      // Try to use WebM with Opus codec, fallback to WebM
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          throw new Error('Audioformat wurde nicht unterstützt. Bitte erneut aufnehmen.');
        }
      }

      const mediaRecorder = new MediaRecorder(mediaStream, { 
        mimeType,
        audioBitsPerSecond: 128000 // 128kbps for good quality
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        
        // Check file size before processing
        if (audioBlob.size > MAX_FILE_SIZE) {
          toast({
            title: "Aufnahme zu groß",
            description: "Aufnahme zu groß (>20 MB). Bitte kürzer sprechen (max. 60 Sek.).",
            variant: "destructive",
          });
          setState('error');
          return;
        }

        console.log(`Audio recorded: ${audioBlob.size} bytes, type: ${audioBlob.type}`);
        setState('uploading');
        onAudioReady(audioBlob);
      };

      // Start recording with 1-second chunks
      mediaRecorder.start(1000);
      setState('recording');
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= MAX_RECORDING_TIME) {
            stopRecording(); // Auto-stop at max time
          }
          return newTime;
        });
      }, 1000);

      toast({
        title: "Aufnahme gestartet",
        description: "Aufnahme läuft ...",
      });

    } catch (error: any) {
      console.error('Error starting recording:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        toast({
          title: "Mikrofonzugriff verweigert",
          description: "Mikrofonzugriff verweigert. Bitte im Browser erlauben und erneut versuchen.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Fehler beim Starten",
          description: error.message || "Die Aufnahme konnte nicht verarbeitet werden. Bitte erneut versuchen.",
          variant: "destructive",
        });
      }
      setState('error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const cancelRecording = () => {
    stopRecording();
    setState('idle');
    setRecordingTime(0);
    chunksRef.current = [];

    toast({
      title: "Aufnahme abgebrochen",
      description: "Aufnahme wurde abgebrochen.",
    });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateMessage = (): string => {
    switch (state) {
      case 'recording':
        return `Aufnahme läuft ... ${formatTime(recordingTime)}`;
      case 'uploading':
        return 'Datei wird hochgeladen ...';
      case 'transcribing':
        return 'Transkription ...';
      case 'translating':
        return 'Übersetzung ins Deutsche ...';
      case 'summarizing':
        return 'Bericht wird erstellt ...';
      case 'done':
        return 'Fertig.';
      case 'error':
        return 'Fehler bei der Aufnahme';
      default:
        return 'Bereit für Aufnahme';
    }
  };

  const isProcessing = ['uploading', 'transcribing', 'translating', 'summarizing'].includes(state);

  return (
    <div className="space-y-4">
      {/* Recording status */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          {getStateMessage()}
        </p>
        {state === 'recording' && (
          <div className="mt-2">
            <div className="text-xs text-muted-foreground">
              Maximale Aufnahmedauer: {MAX_RECORDING_TIME} Sekunden
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1 mt-2">
              <div 
                className="bg-red-500 h-1 rounded-full transition-all duration-1000" 
                style={{ width: `${(recordingTime / MAX_RECORDING_TIME) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Recording controls */}
      <div className="flex gap-2 justify-center">
        {state === 'idle' && (
          <Button 
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-2"
            size="lg"
          >
            <Mic className="h-5 w-5" />
            Aufnahme starten
          </Button>
        )}

        {state === 'recording' && (
          <>
            <Button 
              onClick={stopRecording}
              className="flex items-center gap-2"
              size="lg"
              variant="destructive"
            >
              <Square className="h-4 w-4" />
              Stopp
            </Button>
            <Button 
              onClick={cancelRecording}
              variant="outline"
              size="lg"
            >
              Abbrechen
            </Button>
          </>
        )}

        {isProcessing && (
          <Button 
            disabled
            className="flex items-center gap-2"
            size="lg"
          >
            <Upload className="h-4 w-4 animate-spin" />
            Verarbeitung läuft...
          </Button>
        )}
      </div>
    </div>
  );
}