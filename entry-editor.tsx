import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { offlineManager } from "@/lib/offline-manager";
import { offlineAudioManager } from "@/lib/offline-audio-manager";
import { insertCareEntrySchema, type CareEntryContent } from "@shared/schema";
import { ArrowLeft, Heart, Pill, Users, Utensils, Droplets, Smile, AlertCircle, FileText, Brain, MessageSquare, Plus, Trash2 } from "lucide-react";

export default function EntryEditor() {
  const [, navigate] = useLocation();
  const { id } = useParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [content, setContent] = useState<CareEntryContent>({
    summary: "",
    vitalSigns: {},
    medication: [],
    medicationNotes: "",
    mobility: "",
    nutrition: "",
    hygiene: "",
    mood: "",
    specialNotes: "",
    recommendations: "",
  });

  const { data: residents = [] } = useQuery({
    queryKey: ["/api/residents"],
  });

  const { data: entry, isLoading } = useQuery({
    queryKey: ["/api/entries", id],
    enabled: id !== "new",
  });

  // Get resident from URL params or entry data
  const urlParams = new URLSearchParams(window.location.search);
  const residentId = (entry as any)?.residentId || urlParams.get('resident') || "";
  const selectedResident = (residents as any[]).find((r: any) => r.id === residentId);

  // Auto-save every 2 minutes and listen for audio processing completion
  useEffect(() => {
    const handleAutosave = () => {
      if (content && residentId) {
        console.log('💾 Auto-saving entry...');
        offlineManager.saveOfflineData(`entry_${id || 'new'}_${residentId}`, {
          content,
          residentId,
          lastModified: Date.now()
        });
      }
    };

    const handleAudioProcessed = (event: CustomEvent) => {
      const { entryId: processedEntryId } = event.detail;
      if (processedEntryId === id || processedEntryId.startsWith('offline_')) {
        console.log('🎯 Audio processed for this entry, refreshing data...');
        // Refetch the entry data to get updated content from AI processing
        queryClient.invalidateQueries({ queryKey: ["/api/entries", id] });
        
        toast({
          title: "KI-Verarbeitung abgeschlossen",
          description: "Ihre Spracheingabe wurde automatisch in die Formularfelder übernommen.",
        });
      }
    };

    window.addEventListener('autosave', handleAutosave);
    window.addEventListener('audioProcessed', handleAudioProcessed as EventListener);
    
    return () => {
      window.removeEventListener('autosave', handleAutosave);
      window.removeEventListener('audioProcessed', handleAudioProcessed as EventListener);
    };
  }, [content, residentId, id, queryClient, toast]);

  useEffect(() => {
    if ((entry as any)?.content) {
      console.log("Entry content:", (entry as any).content);
      
      // Check if this entry has Austrian format (direct from speech recognition)
      if (typeof (entry as any).content.vitalwerte === 'string') {
        // This is Austrian format from speech transcription
        const austrianData = (entry as any).content;
        console.log("Converting Austrian format:", austrianData);
        
        setContent({
          summary: austrianData.zusammenfassung || "", // Add summary field
          vitalSigns: {
            bloodPressure: extractVitalSign(austrianData.vitalwerte, "Blutdruck"),
            pulse: extractVitalSign(austrianData.vitalwerte, "Puls"),
            temperature: extractVitalSign(austrianData.vitalwerte, "Temperatur"),
            weight: extractVitalSign(austrianData.vitalwerte, "Gewicht"),
          },
          medication: typeof austrianData.medikation === 'string' ? 
            [{ name: austrianData.medikation, dosage: "", time: "", administered: true }] : 
            (austrianData.medikation || []),
          medicationNotes: typeof austrianData.medikation === 'string' ? austrianData.medikation : "",
          mobility: austrianData.mobilität || "",
          nutrition: austrianData.ernährung_flüssigkeit || "",
          hygiene: austrianData.hygiene || "",
          mood: austrianData.stimmung_kognition || "",
          specialNotes: austrianData.besonderheiten || "",
          recommendations: austrianData.empfehlungen || "",
        });
      } else {
        // Use existing structured content
        setContent((entry as any).content);
      }
    } else if (id === "new") {
      // Initialize with empty data for new entries
      setContent({
        summary: "",
        vitalSigns: {},
        medication: [],
        medicationNotes: "",
        mobility: "",
        nutrition: "",
        hygiene: "",
        mood: "",
        specialNotes: "",
        recommendations: "",
      });
    }
  }, [entry, id]);

  // Helper function to extract vital signs from Austrian format text
  const extractVitalSign = (vitalText: string, type: string): string => {
    if (!vitalText) return "";
    const regex = new RegExp(`${type}[^,]*?([0-9/°C\\s]+[^,]*?)(?:,|$)`, 'i');
    const match = vitalText.match(regex);
    return match ? match[1].trim() : "";
  };

  const saveMutation = useMutation({
    mutationFn: async (data: { status: string }) => {
      const payload = {
        residentId,
        authorId: user?.id,
        status: data.status,
        content,
        userId: user?.id,
      };

      try {
        if (id === "new") {
          const response = await apiRequest("POST", "/api/entries", payload);
          return response.json();
        } else {
          const response = await apiRequest("PATCH", `/api/entries/${id}`, {
            ...payload,
            status: data.status,
          });
          return response.json();
        }
      } catch (error) {
        // If online request fails, save offline
        console.log('📱 Saving offline due to connection issue');
        
        const actionType = id === "new" ? 'CREATE_ENTRY' : 'UPDATE_ENTRY';
        const entryId = id !== "new" ? id : `offline_${Date.now()}`;
        
        offlineManager.queueAction({
          type: actionType,
          data: { ...payload, id: entryId }
        });
        
        // Save locally
        offlineManager.saveOfflineData(`entry_${entryId}_${residentId}`, payload);
        
        return { success: true, offline: true, id: entryId };
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      
      if (data?.offline) {
        toast({
          title: "Offline gespeichert",
          description: "Der Eintrag wurde lokal gespeichert und wird synchronisiert sobald eine Verbindung besteht.",
        });
      } else {
        const message = variables.status === "pending" 
          ? "Eintrag zur Freigabe eingereicht" 
          : "Eintrag gespeichert";
        
        toast({
          title: "Erfolgreich",
          description: message,
        });
      }
      
      // Smart navigation: stay in review if user is lead and came from review
      const urlParams = new URLSearchParams(window.location.search);
      const fromReview = urlParams.get('from') === 'review';
      
      if (user?.role === "lead" && fromReview) {
        navigate("/review");
      } else {
        navigate("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Speichern",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateVitalSigns = (field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      vitalSigns: {
        ...prev.vitalSigns,
        [field]: value,
      },
    }));
  };

  const toggleMedication = (index: number) => {
    setContent(prev => ({
      ...prev,
      medication: prev.medication?.map((med, i) => 
        i === index ? { ...med, administered: !med.administered } : med
      ) || [],
    }));
  };

  const addMedication = () => {
    setContent(prev => ({
      ...prev,
      medication: [
        { name: "", dosage: "", time: "", administered: false },
        ...(prev.medication || [])
      ],
    }));
    
    // Scroll to the medication section after adding
    setTimeout(() => {
      const medicationSection = document.querySelector('[data-section="medication"]');
      if (medicationSection) {
        medicationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const removeMedication = (index: number) => {
    setContent(prev => ({
      ...prev,
      medication: prev.medication?.filter((_, i) => i !== index),
    }));
  };

  const updateMedication = (index: number, field: string, value: string | boolean) => {
    setContent(prev => ({
      ...prev,
      medication: prev.medication?.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      ),
    }));
  };

  const clearField = (field: keyof CareEntryContent) => {
    setContent(prev => ({
      ...prev,
      [field]: field === "vitalSigns" ? {} : field === "medication" ? [] : "",
    }));
  };

  const updateField = (field: keyof CareEntryContent, value: string) => {
    setContent(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Lade Eintrag...</p>
      </div>
    );
  }

  if (!selectedResident && id === "new") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-orange-500 mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Bewohner nicht ausgewählt</h2>
            <p className="text-gray-600 mb-4">
              Bitte wählen Sie zunächst einen Bewohner aus.
            </p>
            <Button onClick={() => navigate("/recording")}>
              Zurück zur Aufnahme
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const status = (entry as any)?.status || "draft";

  return (
    <div className="pb-32 md:pb-8">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/dashboard")}
              className="text-gray-400 hover:text-primary"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Entwurf bearbeiten</h1>
              <p className="text-sm text-gray-500">
                {selectedResident?.name} • {new Date().toLocaleDateString('de-DE')}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-1">
            <Badge 
              className={
                status === "draft" ? "bg-gray-100 text-gray-800" :
                status === "pending" ? "bg-orange-100 text-orange-800" :
                "bg-green-100 text-green-800"
              }
            >
              {status === "draft" ? "Entwurf" : 
               status === "pending" ? "Zur Freigabe" : "Final"}
            </Badge>
            {(entry as any)?.draftJson && status === "draft" && (
              <Badge 
                variant="outline" 
                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
              >
                KI-Entwurf – von Pflegekraft geprüft
              </Badge>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* AI Processing Information */}
        {((entry as any)?.transcriptRaw || (entry as any)?.transcriptDe) && (
          <Card className="shadow-soft border-blue-200 bg-blue-50">
            <div className="p-4 border-b border-blue-200">
              <h2 className="text-base font-semibold text-blue-800 flex items-center">
                <Brain className="text-blue-600 mr-2 w-4 h-4" />
                KI-Verarbeitung
              </h2>
            </div>
            <div className="p-4 space-y-3">
              {(entry as any)?.transcriptRaw && (
                <div>
                  <Label className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Original-Transkription
                  </Label>
                  <div className="bg-white p-4 rounded-lg border text-sm text-gray-700 max-h-32 overflow-y-auto">
                    {(entry as any).transcriptRaw}
                  </div>
                </div>
              )}
              {(entry as any)?.transcriptDe && (entry as any)?.transcriptDe !== (entry as any)?.transcriptRaw && (
                <div>
                  <Label className="text-sm font-medium text-blue-700 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    Überarbeiteter Text
                  </Label>
                  <div className="bg-white p-4 rounded-lg border text-sm text-gray-700 max-h-32 overflow-y-auto">
                    {(entry as any).transcriptDe}
                  </div>
                </div>
              )}
              <div className="text-xs text-blue-600 bg-blue-100 p-3 rounded-lg">
                ✓ Automatisch mit KI verarbeitet und strukturiert
              </div>
            </div>
          </Card>
        )}
        
        {/* Gesamtzusammenfassung */}
        {content.summary && (
          <Card className="shadow-soft border-green-200 bg-green-50">
            <div className="p-6 border-b border-green-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-green-800 flex items-center">
                  <FileText className="text-green-600 mr-3 w-5 h-5" />
                  Gesamtzusammenfassung der Spracheingabe
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearField("summary")}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div className="p-6">
              <Textarea
                value={content.summary || ""}
                onChange={(e) => setContent(prev => ({ ...prev, summary: e.target.value }))}
                placeholder="Gesamtzusammenfassung der Spracheingabe..."
                className="min-h-[120px] text-sm"
              />
              <div className="text-xs text-green-600 bg-green-100 p-3 rounded-lg mt-3">
                ✓ Vollständiger Text Ihrer Spracheingabe (KI-verbessert, bearbeitbar)
              </div>
            </div>
          </Card>
        )}

        {/* Medikation */}
        <Card className="shadow-soft" data-section="medication">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Pill className="text-blue-500 mr-3 w-5 h-5" />
                Medikation
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={addMedication}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50 flex-shrink-0"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Hinzufügen
                </Button>
                {(content.medication?.length || 0) > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => clearField("medication")}
                    className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Alle löschen
                  </Button>
                )}
              </div>
            </div>
          </div>
          <div className="p-6">
            {/* Show medication text from speech recognition */}
            {typeof (entry as any)?.content?.medikation === 'string' && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Label className="text-sm font-medium text-blue-700 mb-2 block">
                  Aus Spracheingabe erkannt:
                </Label>
                <div className="text-sm text-blue-800 font-medium">
                  {(entry as any).content.medikation}
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  Sie können dies unten bearbeiten oder ergänzen
                </div>
              </div>
            )}
            
            <div className="space-y-3">
              {content.medication?.map((med, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      value={med.name}
                      onChange={(e) => updateMedication(index, "name", e.target.value)}
                      placeholder="Medikament..."
                      className="font-medium"
                    />
                    <Input
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      placeholder="Dosierung..."
                    />
                    <Input
                      value={med.time}
                      onChange={(e) => updateMedication(index, "time", e.target.value)}
                      placeholder="Uhrzeit..."
                    />
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Checkbox
                      checked={med.administered}
                      onCheckedChange={(checked) => updateMedication(index, "administered", checked)}
                    />
                    <span className="text-sm text-gray-600 min-w-max">
                      {med.administered ? "verabreicht" : "ausstehend"}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => removeMedication(index)}
                      className="text-red-600 border-red-200 hover:bg-red-50 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )) || []}
              
              {content.medication?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Pill className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Keine Medikamente hinzugefügt</p>
                  <p className="text-sm">Klicken Sie auf "Hinzufügen" um ein Medikament zu ergänzen</p>
                </div>
              )}
              

            </div>
          </div>
        </Card>

        {/* Mobilität */}
        <Card className="shadow-soft">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Users className="text-green-500 mr-3 w-5 h-5" />
                Mobilität
              </h2>
              {content.mobility && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearField("mobility")}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            <Textarea
              value={content.mobility || ""}
              onChange={(e) => updateField("mobility", e.target.value)}
              placeholder="Beschreibung der Mobilität..."
              className="h-24 resize-none"
            />
          </div>
        </Card>

        {/* Ernährung/Flüssigkeit */}
        <Card className="shadow-soft">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Utensils className="text-orange-500 mr-3 w-5 h-5" />
                Ernährung/Flüssigkeit
              </h2>
              {content.nutrition && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearField("nutrition")}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            <Textarea
              value={content.nutrition || ""}
              onChange={(e) => updateField("nutrition", e.target.value)}
              placeholder="Beschreibung der Ernährung..."
              className="h-24 resize-none"
            />
          </div>
        </Card>

        {/* Hygiene */}
        <Card className="shadow-soft">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Droplets className="text-cyan-500 mr-3 w-5 h-5" />
                Hygiene
              </h2>
              {content.hygiene && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearField("hygiene")}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            <Textarea
              value={content.hygiene || ""}
              onChange={(e) => updateField("hygiene", e.target.value)}
              placeholder="Beschreibung der Hygiene..."
              className="h-24 resize-none"
            />
          </div>
        </Card>

        {/* Stimmung/Kognition */}
        <Card className="shadow-soft">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Smile className="text-purple-500 mr-3 w-5 h-5" />
                Stimmung/Kognition
              </h2>
              {content.mood && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearField("mood")}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            <Textarea
              value={content.mood || ""}
              onChange={(e) => updateField("mood", e.target.value)}
              placeholder="Beschreibung der Stimmung..."
              className="h-24 resize-none"
            />
          </div>
        </Card>

        {/* Besonderheiten */}
        <Card className="shadow-soft">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <AlertCircle className="text-yellow-500 mr-3 w-5 h-5" />
                Besonderheiten
              </h2>
              {content.specialNotes && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearField("specialNotes")}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            <Textarea
              value={content.specialNotes || ""}
              onChange={(e) => updateField("specialNotes", e.target.value)}
              placeholder="Besondere Vorkommnisse..."
              className="h-24 resize-none"
            />
          </div>
        </Card>

        {/* Vitalwerte - moved after Besonderheiten */}
        <Card className="shadow-soft">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <Heart className="text-red-500 mr-3 w-5 h-5" />
                Vitalwerte
              </h2>
              {(content.vitalSigns?.bloodPressure || content.vitalSigns?.pulse || content.vitalSigns?.temperature || content.vitalSigns?.weight) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearField("vitalSigns")}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Blutdruck</Label>
                <Input
                  value={content.vitalSigns?.bloodPressure || ""}
                  onChange={(e) => updateVitalSigns("bloodPressure", e.target.value)}
                  placeholder=""
                  className="py-3"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Puls</Label>
                <Input
                  value={content.vitalSigns?.pulse || ""}
                  onChange={(e) => updateVitalSigns("pulse", e.target.value)}
                  placeholder=""
                  className="py-3"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Temperatur</Label>
                <Input
                  value={content.vitalSigns?.temperature || ""}
                  onChange={(e) => updateVitalSigns("temperature", e.target.value)}
                  placeholder=""
                  className="py-3"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2">Gewicht</Label>
                <Input
                  value={content.vitalSigns?.weight || ""}
                  onChange={(e) => updateVitalSigns("weight", e.target.value)}
                  placeholder=""
                  className="py-3"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* Empfehlungen */}
        <Card className="shadow-soft">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                <FileText className="text-indigo-500 mr-3 w-5 h-5" />
                Empfehlungen
              </h2>
              {content.recommendations && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => clearField("recommendations")}
                  className="text-red-600 border-red-200 hover:bg-red-50 flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="p-6">
            <Textarea
              value={content.recommendations || ""}
              onChange={(e) => updateField("recommendations", e.target.value)}
              placeholder="Empfehlungen für die weitere Pflege..."
              className="h-24 resize-none"
            />
          </div>
        </Card>
      </main>

      {/* Save Actions */}
      <div className="fixed bottom-20 md:bottom-6 left-6 right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-200 z-10">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate({ status: "draft" })}
            disabled={saveMutation.isPending}
            className="flex-1 py-3 font-medium"
          >
            Speichern
          </Button>
          <Button
            onClick={() => saveMutation.mutate({ status: "pending" })}
            disabled={saveMutation.isPending}
            className="flex-1 py-3 font-medium"
          >
            Zur Freigabe
          </Button>
        </div>
      </div>
    </div>
  );
}
