import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { 
  ArrowLeft, 
  Building2, 
  Palette, 
  Settings, 
  Users,
  FileText,
  Globe,
  Save,
  Upload
} from "lucide-react";

export default function TenantConfig() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, navigate] = useLocation();
  
  // Extract tenantId from URL path manually since useParams has issues
  const tenantId = location.split('/tenant-config/')[1];

  const [config, setConfig] = useState({
    branding: {
      logoUrl: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      companyName: ''
    },
    features: {
      aiTranscription: true,
      offlineMode: true,
      customFields: true,
      reportTemplates: true
    },
    customFields: [
      { name: 'Lieblingsessen', type: 'text', required: false },
      { name: 'Besuchszeiten', type: 'text', required: false }
    ],
    language: {
      primaryLanguage: 'de',
      medicalTerminology: 'austrian',
      customTranslations: {}
    }
  });

  // Redirect non-super-admins
  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 text-red-500 mb-4">🚫</div>
              <h2 className="text-lg font-semibold mb-2">Zugriff verweigert</h2>
              <p className="text-gray-600">Sie haben keine Berechtigung für die Mandanten-Konfiguration.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: tenant } = useQuery({
    queryKey: [`/api/admin/tenants/${tenantId}`],
    enabled: !!tenantId
  });

  const tenantName = (tenant as any)?.name || 'Lade...';

  const saveConfigMutation = useMutation({
    mutationFn: async (configData: any) => {
      const response = await fetch(`/api/admin/tenants/${tenantId}/config`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(configData)
      });
      if (!response.ok) throw new Error('Konfiguration konnte nicht gespeichert werden');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Konfiguration gespeichert",
        description: "Die Mandanten-spezifischen Einstellungen wurden erfolgreich aktualisiert",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/tenants/${tenantId}`] });
    },
    onError: () => {
      toast({
        title: "❌ Fehler beim Speichern",
        description: "Die Konfiguration konnte nicht gespeichert werden",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveConfigMutation.mutate(config);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/super-admin')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Mandanten-Konfiguration</h1>
              <p className="text-sm text-gray-600">{tenantName}</p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveConfigMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            <Save className="w-4 h-4 mr-2" />
            {saveConfigMutation.isPending ? "Speichere..." : "Speichern"}
          </Button>
        </div>
      </div>

      <div className="p-4">
        <Tabs defaultValue="branding" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="branding">Branding</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="fields">Felder</TabsTrigger>
            <TabsTrigger value="language">Sprache</TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Branding & Design
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="companyName">Firmenname</Label>
                    <Input
                      id="companyName"
                      value={config.branding.companyName}
                      onChange={(e) => setConfig({
                        ...config,
                        branding: { ...config.branding, companyName: e.target.value }
                      })}
                      placeholder="z.B. Altersheim Sonnenschein"
                    />
                  </div>
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      value={config.branding.logoUrl}
                      onChange={(e) => setConfig({
                        ...config,
                        branding: { ...config.branding, logoUrl: e.target.value }
                      })}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryColor">Primärfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={config.branding.primaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          branding: { ...config.branding, primaryColor: e.target.value }
                        })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.branding.primaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          branding: { ...config.branding, primaryColor: e.target.value }
                        })}
                        placeholder="#3B82F6"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="secondaryColor">Sekundärfarbe</Label>
                    <div className="flex gap-2">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={config.branding.secondaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          branding: { ...config.branding, secondaryColor: e.target.value }
                        })}
                        className="w-16 h-10"
                      />
                      <Input
                        value={config.branding.secondaryColor}
                        onChange={(e) => setConfig({
                          ...config,
                          branding: { ...config.branding, secondaryColor: e.target.value }
                        })}
                        placeholder="#10B981"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium mb-2">Vorschau</h3>
                  <div 
                    className="p-4 rounded-lg text-white"
                    style={{ backgroundColor: config.branding.primaryColor }}
                  >
                    <h4 className="text-lg font-bold">{config.branding.companyName || 'Ihr Pflegeheim'}</h4>
                    <p className="text-sm opacity-90">Nori Pflegeassistenz</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Feature-Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">KI-Transkription</h3>
                      <p className="text-sm text-gray-600">Aktiviert Sprache-zu-Text mit medizinischen Begriffen</p>
                    </div>
                    <Switch
                      checked={config.features.aiTranscription}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        features: { ...config.features, aiTranscription: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Offline-Modus</h3>
                      <p className="text-sm text-gray-600">Ermöglicht Arbeiten ohne Internetverbindung</p>
                    </div>
                    <Switch
                      checked={config.features.offlineMode}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        features: { ...config.features, offlineMode: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Benutzerdefinierte Felder</h3>
                      <p className="text-sm text-gray-600">Zusätzliche Datenfelder für spezielle Anforderungen</p>
                    </div>
                    <Switch
                      checked={config.features.customFields}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        features: { ...config.features, customFields: checked }
                      })}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">Report-Templates</h3>
                      <p className="text-sm text-gray-600">Vordefinierte Berichtsvorlagen</p>
                    </div>
                    <Switch
                      checked={config.features.reportTemplates}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        features: { ...config.features, reportTemplates: checked }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Fields Tab */}
          <TabsContent value="fields">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Benutzerdefinierte Felder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {config.customFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                    <Input
                      value={field.name}
                      onChange={(e) => {
                        const newFields = [...config.customFields];
                        newFields[index] = { ...field, name: e.target.value };
                        setConfig({ ...config, customFields: newFields });
                      }}
                      placeholder="Feldname"
                    />
                    <select
                      value={field.type}
                      onChange={(e) => {
                        const newFields = [...config.customFields];
                        newFields[index] = { ...field, type: e.target.value };
                        setConfig({ ...config, customFields: newFields });
                      }}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="text">Text</option>
                      <option value="number">Zahl</option>
                      <option value="date">Datum</option>
                      <option value="select">Auswahl</option>
                    </select>
                    <Badge variant={field.required ? "default" : "secondary"}>
                      {field.required ? "Pflicht" : "Optional"}
                    </Badge>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setConfig({
                    ...config,
                    customFields: [...config.customFields, { name: '', type: 'text', required: false }]
                  })}
                  className="w-full"
                >
                  Neues Feld hinzufügen
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Language Tab */}
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Sprach-Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="primaryLanguage">Hauptsprache</Label>
                    <select
                      id="primaryLanguage"
                      value={config.language.primaryLanguage}
                      onChange={(e) => setConfig({
                        ...config,
                        language: { ...config.language, primaryLanguage: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="de">Deutsch</option>
                      <option value="en">English</option>
                      <option value="fr">Français</option>
                      <option value="it">Italiano</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="medicalTerminology">Medizinische Terminologie</Label>
                    <select
                      id="medicalTerminology"
                      value={config.language.medicalTerminology}
                      onChange={(e) => setConfig({
                        ...config,
                        language: { ...config.language, medicalTerminology: e.target.value }
                      })}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="austrian">Österreichisch</option>
                      <option value="german">Deutsch</option>
                      <option value="swiss">Schweizer Deutsch</option>
                    </select>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Spezielle Anpassungen</h3>
                  <p className="text-sm text-blue-700">
                    Jeder Mandant kann individuelle Sprach- und Terminologie-Anpassungen erhalten:
                  </p>
                  <ul className="text-sm text-blue-600 mt-2 space-y-1">
                    <li>• Lokale Dialekte und Aussprachen</li>
                    <li>• Haus-spezifische Begriffe und Abkürzungen</li>
                    <li>• Angepasste KI-Modelle für bessere Erkennung</li>
                    <li>• Kundenspezifische Übersetzungen</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}