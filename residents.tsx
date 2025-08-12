import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { offlineManager } from "@/lib/offline-manager";
import { insertResidentSchema, type Resident } from "@shared/schema";
import { ArrowLeft, Plus, Search } from "lucide-react";
import ResidentCard from "@/components/resident-card";
import { formatDateInput, validateGermanDate, formatDateGerman } from "@/lib/date-formatter";
import { z } from "zod";

export default function Residents() {
  const [location, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResident, setEditingResident] = useState<Resident | null>(null);
  const [highlightMissing, setHighlightMissing] = useState(false);

  // Check for highlight parameter from dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const highlight = urlParams.get('highlight');
    if (highlight === 'missing-docs') {
      setHighlightMissing(true);
    }
  }, [location]);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: residents = [], isLoading } = useQuery({
    queryKey: ["/api/residents"],
  });

  // Get entries data to check for missing documentation
  const { data: entries = [] } = useQuery({
    queryKey: ["/api/entries"],
    enabled: highlightMissing,
  });

  // Erweiterte Validierung mit deutscher Datumsformatierung
  const residentFormSchema = insertResidentSchema.extend({
    dateOfBirth: z.string()
      .min(1, "Geburtsdatum ist erforderlich")
      .refine(validateGermanDate, "Ungültiges Datum. Format: TT.MM.JJJJ")
  });

  const form = useForm({
    resolver: zodResolver(residentFormSchema),
    defaultValues: {
      name: "",
      room: "",
      dateOfBirth: "",
      status: "active" as const,
      tenantId: user?.tenantId || "tenant-demo", // CRITICAL: tenantId setzen
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log("🚀 Creating resident with data:", data);
      
      const payload = {
        ...data,
        tenantId: user?.tenantId || "tenant-demo", // CRITICAL: tenantId muss gesetzt sein
        userId: user?.id,
      };

      console.log("📦 Final payload:", payload);

      try {
        const response = await apiRequest("POST", "/api/residents", payload);
        const result = await response.json();
        console.log("✅ Resident created successfully:", result);
        return result;
      } catch (error) {
        console.error("❌ Online creation failed, saving offline:", error);
        // If online request fails, save offline
        const residentId = `offline_${Date.now()}`;
        offlineManager.queueAction({
          type: 'CREATE_RESIDENT',
          data: { ...payload, id: residentId }
        });
        
        offlineManager.saveOfflineData(`resident_${residentId}`, payload);
        return { success: true, offline: true, id: residentId };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/residents"] });
      setIsDialogOpen(false);
      setEditingResident(null);
      form.reset();
      
      if (data?.offline) {
        toast({
          title: "Offline erstellt",
          description: "Der Bewohner wurde lokal gespeichert und wird synchronisiert sobald eine Verbindung besteht.",
        });
      } else {
        toast({
          title: "Bewohner erstellt",
          description: "Der Bewohner wurde erfolgreich angelegt.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Erstellen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await apiRequest("PATCH", `/api/residents/${id}`, {
        ...data,
        userId: user?.id,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/residents"] });
      setIsDialogOpen(false);
      setEditingResident(null);
      form.reset();
      toast({
        title: "Bewohner aktualisiert",
        description: "Die Änderungen wurden gespeichert.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler beim Aktualisieren",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: any) => {
    console.log("🚀 Form submission with data:", data);
    console.log("📝 Form errors:", form.formState.errors);
    
    if (editingResident) {
      updateMutation.mutate({ id: editingResident.id, data });
    } else {
      // CRITICAL: Ensure tenantId is properly set for creation
      const payload = {
        ...data,
        tenantId: user?.tenantId || "tenant-demo"
      };
      console.log("📦 Creating with payload:", payload);
      createMutation.mutate(payload);
    }
  };

  const handleEdit = (resident: Resident) => {
    setEditingResident(resident);
    form.reset({
      name: resident.name,
      room: resident.room,
      dateOfBirth: resident.dateOfBirth,
      status: "active" as const,
      tenantId: user?.tenantId || "tenant-demo",
    });
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setEditingResident(null);
    form.reset({
      name: "",
      room: "",
      dateOfBirth: "",
      status: "active",
      tenantId: user?.tenantId || "tenant-demo",
    });
    setIsDialogOpen(true);
  };

  const filteredResidents = (residents as Resident[]).filter((resident: Resident) =>
    resident.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resident.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper function to check if resident has missing documentation
  const hasMissingDocumentation = (residentId: string) => {
    if (!highlightMissing || !Array.isArray(entries)) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const todayEntries = entries.filter((entry: any) => 
      entry.residentId === residentId && 
      entry.createdAt?.startsWith(today)
    );
    
    // Missing if no entries today OR only draft entries
    return todayEntries.length === 0 || 
           todayEntries.every((entry: any) => entry.status === 'draft');
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 py-4">
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
            <h1 className="text-xl font-semibold text-gray-800">Bewohner</h1>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={handleAddNew}
                className="bg-primary hover:bg-primary-dark text-white px-4 py-2 h-10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Neuer Bewohner
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingResident ? "Bewohner bearbeiten" : "Neuen Bewohner hinzufügen"}
                </DialogTitle>
                <DialogDescription>
                  {editingResident 
                    ? "Bearbeiten Sie die Bewohnerdaten. Änderungen sind für alle Benutzer sichtbar." 
                    : "Fügen Sie einen neuen Bewohner hinzu. Alle Benutzer können den Bewohner anschließend bearbeiten."
                  }
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Max Mustermann" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="room"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Zimmer</FormLabel>
                        <FormControl>
                          <Input placeholder="101" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Geburtsdatum (TT.MM.JJJJ)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="15.03.1940" 
                            {...field}
                            onChange={(e) => {
                              const formatted = formatDateInput(e.target.value);
                              field.onChange(formatted);
                            }}
                            maxLength={10}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex space-x-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Abbrechen
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={createMutation.isPending || updateMutation.isPending}
                    >
                      {editingResident ? "Aktualisieren" : "Erstellen"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Bewohner suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-4"
            />
          </div>
        </div>

        {/* Residents List */}
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Lade Bewohner...</p>
          </div>
        ) : filteredResidents.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                {searchTerm ? "Keine Bewohner gefunden" : "Noch keine Bewohner angelegt"}
              </p>
              {!searchTerm && (
                <Button onClick={handleAddNew}>
                  <Plus className="w-4 h-4 mr-2" />
                  Ersten Bewohner hinzufügen
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredResidents.map((resident: Resident) => (
              <ResidentCard
                key={resident.id}
                resident={resident}
                onEdit={handleEdit}
                highlightMissing={hasMissingDocumentation(resident.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
