import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  InfoIcon,
  Lock,
  UserCheck,
  FileCheck,
  Monitor,
  Server,
  Key,
  Zap,
  Bell,
  Archive
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminManual() {
  const [activeSection, setActiveSection] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-red-600 text-white rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Nori Admin Center</h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Administratoren-Handbuch & Systemverwaltung</p>
          <Badge variant="destructive" className="text-sm">
            VERTRAULICH - Nur für autorisierte Administratoren
          </Badge>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 gap-1">
            <TabsTrigger value="overview" className="text-xs lg:text-sm">Überblick</TabsTrigger>
            <TabsTrigger value="security" className="text-xs lg:text-sm">Sicherheit</TabsTrigger>
            <TabsTrigger value="tenant-management" className="text-xs lg:text-sm">Mandanten</TabsTrigger>
            <TabsTrigger value="monitoring" className="text-xs lg:text-sm">Monitoring</TabsTrigger>
            <TabsTrigger value="maintenance" className="text-xs lg:text-sm">Wartung</TabsTrigger>
            <TabsTrigger value="emergency" className="text-xs lg:text-sm">Notfall</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-red-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Shield className="w-5 h-5" />
                    Super-Admin Rolle
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Als Super-Administrator haben Sie vollständigen Zugriff auf alle Systembereiche 
                    und Mandanten der Nori Pflegeassistenz Plattform.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Vollständige Mandantenverwaltung</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Systemweite Konfiguration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Sicherheits- und Audit-Überwachung</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Notfall-Eingriffsmöglichkeiten</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <Monitor className="w-5 h-5" />
                    System-Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Plattform-Status</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Aktive Mandanten</span>
                      <Badge variant="outline">Live-Daten</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">KI-Services</span>
                      <Badge variant="default" className="bg-green-500">Verfügbar</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Backup-Status</span>
                      <Badge variant="default" className="bg-green-500">Aktuell</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-orange-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-600">
                    <AlertTriangle className="w-5 h-5" />
                    Wichtige Hinweise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="font-medium text-red-800 mb-1">Sicherheitsrichtlinie</p>
                      <p className="text-red-600">
                        Alle administrativen Aktionen werden protokolliert und sind rechtlich bindend.
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="font-medium text-blue-800 mb-1">DSGVO-Compliance</p>
                      <p className="text-blue-600">
                        Beachten Sie bei allen Eingriffen die Datenschutzbestimmungen.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <InfoIcon className="w-5 h-5 text-blue-500" />
                  Admin-Dashboard Funktionen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <h4 className="font-semibold text-blue-800">Mandantenverwaltung</h4>
                    <p className="text-xs text-blue-600 mt-1">Pflegeheime verwalten</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Database className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <h4 className="font-semibold text-green-800">Systemkonfiguration</h4>
                    <p className="text-xs text-green-600 mt-1">Globale Einstellungen</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <h4 className="font-semibold text-purple-800">Systemüberwachung</h4>
                    <p className="text-xs text-purple-600 mt-1">Performance & Logs</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <h4 className="font-semibold text-red-800">Sicherheitszentrale</h4>
                    <p className="text-xs text-red-600 mt-1">Audit & Compliance</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-red-500" />
                    Sicherheitsrichtlinien
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="access-control">
                      <AccordionTrigger>Zugriffskontrolle</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-sm">
                          <li>• 2-Faktor-Authentifizierung für alle Admin-Accounts</li>
                          <li>• IP-Whitelist für kritische Administrationsaufgaben</li>
                          <li>• Automatische Session-Timeouts (30 Min. Inaktivität)</li>
                          <li>• Protokollierung aller privilegierten Aktionen</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="data-protection">
                      <AccordionTrigger>Datenschutz</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-sm">
                          <li>• Ende-zu-Ende Verschlüsselung aller Patientendaten</li>
                          <li>• Mandanten-isolierte Datenbanken</li>
                          <li>• Automatische Anonymisierung nach Löschfristen</li>
                          <li>• DSGVO-konforme Audit-Trails</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                    Benutzerrechte-Management
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-red-600 mb-2">Super Admin</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Vollständige Plattformkontrolle</li>
                        <li>• Mandanten erstellen/löschen</li>
                        <li>• Systemweite Konfiguration</li>
                        <li>• Notfall-Eingriffsmöglichkeiten</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-2">Pflegeleitung</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Mandanten-spezifische Verwaltung</li>
                        <li>• Benutzer verwalten (eigener Mandant)</li>
                        <li>• Pflegedokumentation freigeben</li>
                        <li>• Lokale Einstellungen verwalten</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Pflegekraft</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Pflegedokumentation erstellen</li>
                        <li>• Bewohnerdaten einsehen</li>
                        <li>• Sprachaufnahmen erstellen</li>
                        <li>• Eigene Einträge bearbeiten</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Audit & Compliance Überwachung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Audit-Protokolle</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Alle Benutzeraktivitäten werden protokolliert</li>
                      <li>• IP-Adressen und Zeitstempel erfasst</li>
                      <li>• Manipulationssichere Speicherung</li>
                      <li>• Automatische Anomalie-Erkennung</li>
                      <li>• Export für externe Compliance-Tools</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">DSGVO-Compliance</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Automatische Löschfristen-Überwachung</li>
                      <li>• Einwilligungsmanagement</li>
                      <li>• Recht auf Vergessenwerden</li>
                      <li>• Datenportabilität</li>
                      <li>• Meldepflicht-Automatisierung</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">Sicherheitsmonitoring</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Real-time Intrusion Detection</li>
                      <li>• Verdächtige Login-Versuche</li>
                      <li>• Automatische Benachrichtigungen</li>
                      <li>• Security Score Dashboard</li>
                      <li>• Pen-Test Berichte</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tenant Management Tab */}
          <TabsContent value="tenant-management" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Mandantenverwaltung
                </CardTitle>
                <CardDescription>
                  Pflegeheime (Mandanten) erstellen, konfigurieren und verwalten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="create-tenant">
                    <AccordionTrigger>Neuen Mandanten erstellen</AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                          <span>Super-Admin Dashboard öffnen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                          <span>Mandantenverwaltung → "Neuer Mandant"</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                          <span>Pflegeheim-Details eingeben (Name, Subdomain, Kontakt)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                          <span>Initiale Pflegeleitung-Zugangsdaten erstellen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">5</span>
                          <span>Mandanten-spezifische Konfiguration vornehmen</span>
                        </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="configure-tenant">
                    <AccordionTrigger>Mandanten-Konfiguration</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Grundeinstellungen</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Pflegeheim-Name und Adresse</li>
                            <li>• Subdomain-Konfiguration</li>
                            <li>• Zeitzone und Sprache</li>
                            <li>• Branding (Logo, Farben)</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Funktions-Module</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• KI-Spracherkennung aktivieren</li>
                            <li>• Offline-Modus konfigurieren</li>
                            <li>• Push-Benachrichtigungen</li>
                            <li>• PDF-Export Vorlagen</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="manage-users">
                    <AccordionTrigger>Benutzer-Management pro Mandant</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-2">Pflegeleitung einrichten</h5>
                          <p className="text-sm text-blue-600">
                            Erste Pflegeleitung erhält Admin-Rechte für den Mandanten und kann 
                            weitere Pflegekräfte einladen.
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">Pflegekräfte verwalten</h5>
                          <p className="text-sm text-green-600">
                            Pflegeleitung kann eigenständig Pflegekräfte einladen, 
                            Rechte zuweisen und deaktivieren.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    Mandanten-Einstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Multi-Tenant Isolation</span>
                      <Badge variant="default" className="bg-green-500">Aktiv</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Daten-Verschlüsselung</span>
                      <Badge variant="default" className="bg-green-500">AES-256</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Backup-Strategie</span>
                      <Badge variant="outline">Täglich</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Compliance-Level</span>
                      <Badge variant="default" className="bg-blue-500">DSGVO</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-500" />
                    Datenmanagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Datenbank-Isolation</span>
                      <Badge variant="default" className="bg-green-500">Garantiert</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Automatische Archivierung</span>
                      <Badge variant="outline">Nach 7 Jahren</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Datenexport</span>
                      <Badge variant="outline">DSGVO-konform</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Notfall-Recovery</span>
                      <Badge variant="default" className="bg-orange-500">&lt; 4h RTO</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    System-Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CPU-Auslastung</span>
                      <Badge variant="default" className="bg-green-500">12%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Speicher</span>
                      <Badge variant="default" className="bg-green-500">34%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Netzwerk I/O</span>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Antwortzeit</span>
                      <Badge variant="default" className="bg-green-500">&lt; 200ms</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5 text-green-500" />
                    KI-Services
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Deepgram API</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">OpenAI GPT</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">DeepL Translate</span>
                      <Badge variant="default" className="bg-green-500">Online</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Transkription Queue</span>
                      <Badge variant="outline">0 wartend</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5 text-orange-500" />
                    Aktive Warnungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Keine kritischen Warnungen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <InfoIcon className="w-4 h-4 text-blue-500" />
                      <span>Alle Services verfügbar</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Backup erfolgreich</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Systemüberwachung Dashboard</CardTitle>
                <CardDescription>
                  Kritische Metriken und Systemzustand in Echtzeit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">99.97%</div>
                    <div className="text-sm text-green-800">Verfügbarkeit</div>
                    <div className="text-xs text-green-600 mt-1">30 Tage</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">156ms</div>
                    <div className="text-sm text-blue-800">Ø Antwortzeit</div>
                    <div className="text-xs text-blue-600 mt-1">Letzte 24h</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">1,247</div>
                    <div className="text-sm text-purple-800">Aktive Nutzer</div>
                    <div className="text-xs text-purple-600 mt-1">Heute</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">23</div>
                    <div className="text-sm text-orange-800">Aktive Mandanten</div>
                    <div className="text-xs text-orange-600 mt-1">Online</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-gray-500" />
                  Systemwartung
                </CardTitle>
                <CardDescription>
                  Routinemäßige Wartungsaufgaben und System-Updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="scheduled-maintenance">
                    <AccordionTrigger>Geplante Wartung</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <h5 className="font-medium text-blue-800 mb-2">Wöchentliche Wartung</h5>
                          <ul className="text-sm text-blue-600 space-y-1">
                            <li>• Sonntags 02:00-04:00 UTC</li>
                            <li>• Automatische Datenbank-Optimierung</li>
                            <li>• Log-Rotation und Archivierung</li>
                            <li>• Security-Updates Installation</li>
                          </ul>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-2">Monatliche Wartung</h5>
                          <ul className="text-sm text-green-600 space-y-1">
                            <li>• Erster Sonntag im Monat, 01:00-06:00 UTC</li>
                            <li>• Vollständiges System-Backup</li>
                            <li>• Performance-Optimierung</li>
                            <li>• Feature-Updates Deployment</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="backup-strategy">
                    <AccordionTrigger>Backup & Recovery</AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Backup-Strategie</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• Tägliche inkrementelle Backups</li>
                            <li>• Wöchentliche vollständige Backups</li>
                            <li>• 3-2-1 Regel (3 Kopien, 2 Medien, 1 offsite)</li>
                            <li>• Automatische Backup-Verifizierung</li>
                          </ul>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Recovery-Ziele</h5>
                          <ul className="text-sm text-gray-600 space-y-1">
                            <li>• RTO (Recovery Time): &lt; 4 Stunden</li>
                            <li>• RPO (Recovery Point): &lt; 1 Stunde</li>
                            <li>• Disaster Recovery Site verfügbar</li>
                            <li>• Regelmäßige Recovery-Tests</li>
                          </ul>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="update-management">
                    <AccordionTrigger>Update-Management</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4">
                        <div>
                          <h5 className="font-medium mb-2">Update-Kategorien</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                              <h6 className="font-medium text-red-800">Sicherheits-Updates</h6>
                              <p className="text-xs text-red-600 mt-1">Sofortige Installation außerhalb der Wartungsfenster</p>
                            </div>
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <h6 className="font-medium text-blue-800">Feature-Updates</h6>
                              <p className="text-xs text-blue-600 mt-1">Geplante Installation während Wartungsfenstern</p>
                            </div>
                            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h6 className="font-medium text-yellow-800">Patch-Updates</h6>
                              <p className="text-xs text-yellow-600 mt-1">Automatische Installation mit Rollback-Möglichkeit</p>
                            </div>
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                              <h6 className="font-medium text-green-800">KI-Model Updates</h6>
                              <p className="text-xs text-green-600 mt-1">A/B Testing vor Vollauswertung</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Archive className="w-5 h-5 text-purple-500" />
                    Datenarchivierung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Aktive Daten</span>
                      <Badge variant="default" className="bg-green-500">&lt; 2 Jahre</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Archivierte Daten</span>
                      <Badge variant="outline">2-7 Jahre</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>DSGVO-Löschung</span>
                      <Badge variant="destructive">Nach 7 Jahren</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Backup-Retention</span>
                      <Badge variant="outline">10 Jahre</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5 text-orange-500" />
                    Sicherheitsschlüssel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Verschlüsselungskeys</span>
                      <Badge variant="default" className="bg-green-500">Rotiert</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>API-Keys</span>
                      <Badge variant="outline">Überwacht</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>SSL-Zertifikate</span>
                      <Badge variant="default" className="bg-green-500">Auto-Renewal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Nächste Key-Rotation</span>
                      <Badge variant="outline">In 45 Tagen</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Emergency Tab */}
          <TabsContent value="emergency" className="space-y-6">
            <Card className="border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Notfall-Prozeduren
                </CardTitle>
                <CardDescription className="text-red-600">
                  Kritische Eingriffe und Notfall-Wiederherstellung
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-red-600">Systemausfall</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                        <span>Status-Page aktivieren</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                        <span>Mandanten benachrichtigen</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                        <span>Disaster Recovery initialisieren</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                        <span>Backup-Systeme aktivieren</span>
                      </li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-orange-600">Sicherheitsvorfall</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                        <span>Betroffene Systeme isolieren</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                        <span>Forensik-Team kontaktieren</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                        <span>Behörden informieren (falls nötig)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="w-5 h-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                        <span>Betroffene Mandanten informieren</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <Zap className="w-5 h-5" />
                    Notfall-Kontakte
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="font-medium">CTO Notfall-Hotline</p>
                      <p className="text-red-600">+43 664 XXX XXXX</p>
                    </div>
                    <div>
                      <p className="font-medium">Sicherheitsteam</p>
                      <p className="text-red-600">security@nori-pflege.de</p>
                    </div>
                    <div>
                      <p className="font-medium">Cloud-Provider</p>
                      <p className="text-blue-600">24/7 Enterprise Support</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-600">
                    <FileCheck className="w-5 h-5" />
                    Checklisten
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Datenschutz-Vorfall
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Systemausfall
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Cyber-Angriff
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Datenwiederherstellung
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <Monitor className="w-5 h-5" />
                    Status-Links
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      System Status Page
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Monitoring Dashboard
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Recovery Console
                    </Button>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      Backup Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Disaster Recovery Plan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Kritische Informationen</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Disaster Recovery Site: Frankfurt am Main (Backup-Rechenzentrum)</li>
                    <li>• RTO-Ziel: Maximale Wiederherstellungszeit 4 Stunden</li>
                    <li>• RPO-Ziel: Maximaler Datenverlust 1 Stunde</li>
                    <li>• Eskalationspfad: Level 1 → Level 2 → CTO → Geschäftsleitung</li>
                    <li>• Kommunikationskanäle: Status-Page, E-Mail, SMS, Telefon</li>
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