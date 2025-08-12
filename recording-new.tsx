import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Resident } from "@shared/schema";
import { ArrowLeft, FileText, AlertCircle, CheckCircle } from "lucide-react";
import { nanoid } from "nanoid";
import { AudioRecorder, RecordingState } from "@/components/audio-recorder";
import { useAuth } from "@/lib/auth";

export default function Recording() {
  const [, navigate] = useLocation();
  const [selectedResident, setSelectedResident] = useState<string>("");
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [entryId, setEntryId] = useState<string>("");
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: residents = [] } = useQuery<Resident[]>({
    queryKey: ["/api/residents"],
  });

  // Generate entry ID when component mounts
  useEffect(() => {
    setEntryId(nanoid());
  }, []);

  // New transcription mutation using the robust /api/transcribe endpoint
  const transcribeMutation = useMutation({
    mutationFn: async (data: { audioBlob: Blob; residentId: string; entryId: string }) => {
      setRecordingState('transcribing');
      
      const formData = new FormData();
      formData.append('file', data.audioBlob, 'recording.webm');
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
      }, 1000);
    },
    onError: (error: Error) => {
      console.error('Transcription error:', error);
      setRecordingState('error');
      toast({
        title: "Verarbeitungsfehler",
        description: error.message || "Die Aufnahme konnte nicht verarbeitet werden. Bitte erneut versuchen.",
        variant: "destructive",
      });
    },
  });

  const handleAudioReady = (audioBlob: Blob) => {
    if (!selectedResident) {
      toast({
        title: "Bewohner auswählen",
        description: "Bitte wählen Sie einen Bewohner aus, bevor Sie fortfahren.",
        variant: "destructive",
      });
      setRecordingState('error');
      return;
    }

    if (!user) {
      toast({
        title: "Anmeldung erforderlich",
        description: "Sie müssen angemeldet sein, um Aufnahmen zu verarbeiten.",
        variant: "destructive",
      });
      setRecordingState('error');
      return;
    }

    setRecordedBlob(audioBlob);
    console.log(`Audio ready for processing: ${audioBlob.size} bytes`);
    
    // Start transcription process
    transcribeMutation.mutate({
      audioBlob,
      residentId: selectedResident,
      entryId: entryId,
    });
  };

  const handleStateChange = (state: RecordingState) => {
    setRecordingState(state);
    
    // Update toast messages based on state
    switch (state) {
      case 'transcribing':
        toast({
          title: "Transkription",
          description: "Ihre Aufnahme wird transkribiert...",
        });
        break;
      case 'translating':
        toast({
          title: "Übersetzung ins Deutsche",
          description: "Der Text wird ins Deutsche übersetzt...",
        });
        break;
      case 'summarizing':
        toast({
          title: "Bericht wird erstellt",
          description: "Ihr Pflegebericht wird strukturiert erstellt...",
        });
        break;
    }
  };

  const handleManualEntry = () => {
    if (!selectedResident) {
      toast({
        title: "Bewohner auswählen",
        description: "Bitte wählen Sie einen Bewohner aus, bevor Sie fortfahren.",
        variant: "destructive",
      });
      return;
    }
    navigate(`/entries/new?resident=${selectedResident}`);
  };

  const resetRecording = (e?: React.MouseEvent) => {
    // Verhindere Scroll zum Seitenanfang
    if (e) {
      e.preventDefault();
    }
    setRecordingState('idle');
    setRecordedBlob(null);
    setEntryId(nanoid());
  };

  const selectedResidentData = residents.find(r => r.id === selectedResident);
  const isProcessing = ['uploading', 'transcribing', 'translating', 'summarizing'].includes(recordingState);
  const canRecord = selectedResident && recordingState === 'idle' && !isProcessing;

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/dashboard")}
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
            <Select value={selectedResident} onValueChange={setSelectedResident}>
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

      {/* Audio Recording */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sprachaufnahme</CardTitle>
          <CardDescription>
            Nehmen Sie Ihren Pflegebericht per Sprache auf (max. 60 Sekunden)
          </CardDescription>
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
            <AudioRecorder
              onAudioReady={handleAudioReady}
              onStateChange={handleStateChange}
              disabled={!canRecord}
            />
          )}

          {recordingState === 'error' && (
            <div className="mt-4 flex gap-2">
              <Button onClick={(e) => resetRecording(e)} variant="outline" type="button">
                Erneut versuchen
              </Button>
              <Button onClick={handleManualEntry} variant="secondary">
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
            Alternatively können Sie den Pflegeeintrag auch manuell erstellen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleManualEntry}
            variant="outline"
            className="w-full"
            disabled={!selectedResident || isProcessing}
          >
            <FileText className="h-4 w-4 mr-2" />
            Manuell eingeben
          </Button>
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
                  {recordingState === 'uploading' && 'Datei wird hochgeladen...'}
                  {recordingState === 'transcribing' && 'Transkription...'}
                  {recordingState === 'translating' && 'Übersetzung ins Deutsche...'}
                  {recordingState === 'summarizing' && 'Bericht wird erstellt...'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}