import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Resident } from "@shared/schema";
import { ArrowLeft, FileText, AlertCircle, CheckCircle, Mic } from "lucide-react";
import { nanoid } from "nanoid";
import { RobustAudioRecorder, RecordingState, AudioRecorderRef } from "@/components/audio-recorder-robust";
import { RecordingGuide } from "@/components/recording-guide";
import { useAuth } from "@/lib/auth";
import { offlineAudioManager } from "@/lib/offline-audio-manager";

export default function Recording() {
  const [, navigate] = useLocation();
  const [selectedResident, setSelectedResident] = useState<string>("");
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [entryId, setEntryId] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();
  const audioRecorderRef = useRef<AudioRecorderRef>(null);
  const scrollPositionRef = useRef<number>(0);
  const recordingSectionRef = useRef<HTMLDivElement>(null);

  const { data: residents = [] } = useQuery<Resident[]>({
    queryKey: ["/api/residents"],
  });

  // Generate entry ID and scroll to top when component mounts
  useEffect(() => {
    setEntryId(nanoid());
    // Always scroll to top when user enters recording page to show important info
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // FIXED: No auto-scrolling - stay where user is
  useEffect(() => {
    if (recordingState === 'recording') {
      // Save current position but DON'T scroll
      scrollPositionRef.current = window.scrollY;
    }
    // CRITICAL FIX: Remove all auto-scrolling to prevent page jumping
    // User stays exactly where they are during recording/processing/completion
  }, [recordingState]);

  const navigateToNewPage = (path: string) => {
    navigate(path);
  };

  // New transcription mutation using the robust /api/transcribe endpoint
  const transcribeMutation = useMutation({
    mutationFn: async (data: { audioBlob: Blob; residentId: string; entryId: string }) => {
      setRecordingState('processing');
      
      // Detect Safari for proper file extension
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
      const fileName = isSafari ? 'recording.m4a' : 'recording.webm';
      
      const formData = new FormData();
      formData.append('file', data.audioBlob, fileName);
      formData.append('residentId', data.residentId);
      formData.append('entryId', data.entryId);
      
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Transcription failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setRecordingState('done');
      toast({
        title: "Aufnahme erfolgreich verarbeitet",
        description: "Ihr Pflegebericht wurde erstellt und kann nun bearbeitet werden.",
      });
      
      // Navigate to entry editor
      setTimeout(() => {
        navigate(`/entries/${data.entryId}`);
      }, 2000);
    },
    onError: (error: Error) => {
      console.error('Transcription error:', error);
      setRecordingState('error');
      toast({
        title: "Verarbeitungsfehler",
        description: error.message || "Die Aufnahme konnte nicht verarbeitet werden. Bei wiederholten Problemen kontaktieren Sie den Support.",
        variant: "destructive",
      });
    },
  });

  // Reset recording state and prepare for new recording (NO SCROLL!)
  const resetRecording = (e?: React.MouseEvent) => {
    // Verhindere Scroll zum Seitenanfang
    if (e) {
      e.preventDefault();
    }
    setRecordingState('idle');
    setRecordedBlob(null);
    setEntryId(nanoid()); // Generate new entry ID
    transcribeMutation.reset();
    
    // WICHTIG: Audio-Recorder zurücksetzen für neue Aufnahme
    audioRecorderRef.current?.reset();
    
    console.log("🔄 Recording fully reset - ready for new recording");
  };

  // Handle manual entry creation
  const handleManualEntry = () => {
    if (!selectedResident) {
      toast({
        title: "Bewohner auswählen",
        description: "Bitte wählen Sie zuerst einen Bewohner aus.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/entries/new?resident=${selectedResident}`);
  };

  const selectedResidentData = residents.find(r => r.id === selectedResident);
  const isProcessing = recordingState === 'processing' || transcribeMutation.isPending;
  const canRecord = selectedResident && recordingState === 'idle' && !isProcessing;

  return (
    <div className="container mx-auto p-4 max-w-2xl pb-32" style={{ scrollBehavior: 'smooth' }}>
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateToNewPage("/dashboard")}
          className="shrink-0"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Neuer Pflegeeintrag</h1>
          <p className="text-sm text-muted-foreground">
            Aufnahme starten oder manuell eingeben
          </p>
        </div>
      </div>

      {/* Resident Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Bewohner auswählen</CardTitle>
          <CardDescription>
            Wählen Sie den Bewohner aus, für den Sie den Pflegeeintrag erstellen möchten
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="resident">Bewohner</Label>
            <Select value={selectedResident} onValueChange={(value) => {
              setSelectedResident(value);
              // Auto-scroll to recording section when resident is selected
              if (value && recordingSectionRef.current) {
                setTimeout(() => {
                  recordingSectionRef.current?.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                  });
                }, 300); // Small delay to allow the UI to update
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Bewohner auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {residents.map((resident) => (
                  <SelectItem key={resident.id} value={resident.id}>
                    {resident.name} - Zimmer {resident.room}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedResidentData && (
            <Alert className="mt-4">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{selectedResidentData.name}</strong> in Zimmer {selectedResidentData.room} ausgewählt
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recording Guide */}
      <div ref={recordingSectionRef}>
        <RecordingGuide 
          isRecording={recordingState === 'recording'} 
        />
      </div>

      {/* Audio Recording */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>KI-Sprachaufnahme</CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedResident ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Bitte wählen Sie zuerst einen Bewohner aus, um mit der Aufnahme zu beginnen.
              </AlertDescription>
            </Alert>
          ) : (
            <RobustAudioRecorder
              ref={audioRecorderRef}
              onStateChange={setRecordingState}
              maxDuration={90}
              maxFileSize={20 * 1024 * 1024}
              onRecordingComplete={async (blob) => {
                setRecordedBlob(blob);
                
                // Always save audio for offline processing first
                const audioId = await offlineAudioManager.saveOfflineAudio(
                  blob, 
                  selectedResident, 
                  entryId
                );
                
                console.log(`💾 Audio saved with ID: ${audioId}`);
                
                // Try immediate processing if online
                if (navigator.onLine) {
                  transcribeMutation.mutate({
                    audioBlob: blob,
                    residentId: selectedResident,
                    entryId: entryId,
                  });
                } else {
                  // Show offline message
                  toast({
                    title: "Offline-Aufnahme gespeichert",
                    description: "Ihre Spracheingabe wurde gespeichert und wird automatisch verarbeitet sobald eine Verbindung besteht.",
                  });
                  
                  // Navigate to manual entry to continue working
                  setTimeout(() => {
                    handleManualEntry();
                  }, 2000);
                }
              }}
            />
          )}

          {(recordingState === 'error' || transcribeMutation.isError) && (
            <div className="mt-4 flex gap-2" style={{ minHeight: '44px' }}>
              <Button 
                onClick={(e) => resetRecording(e)}
                variant="outline"
                type="button"
              >
                Erneut versuchen
              </Button>
              <Button 
                onClick={handleManualEntry}
                variant="secondary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Manuell eingeben
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Manual Entry Option */}
      <Card>
        <CardHeader>
          <CardTitle>Manuelle Eingabe</CardTitle>
          <CardDescription>
            Alternativ können Sie den Pflegeeintrag auch manuell erstellen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div style={{ minHeight: '44px', display: 'flex', alignItems: 'center' }}>
            <Button 
              onClick={handleManualEntry}
              variant="outline"
              className="w-full"
              disabled={!selectedResident || isProcessing}
            >
              <FileText className="h-4 w-4 mr-2" />
              Manuell eingeben
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Processing Status */}
      {isProcessing && (
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
              <div>
                <p className="font-medium">Verarbeitung läuft...</p>
                <p className="text-sm text-muted-foreground">
                  {recordingState === 'processing' && 'Mehrsprachige Spracherkennung und KI-Verarbeitung läuft...'}
                  {transcribeMutation.isPending && 'Datei wird verarbeitet...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Extra spacing for mobile navigation */}
      <div className="h-20 md:h-8"></div>
    </div>
  );
}