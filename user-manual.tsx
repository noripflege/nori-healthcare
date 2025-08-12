import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  FileText, 
  Users, 
  Mic, 
  Settings, 
  Shield, 
  Download,
  CheckCircle,
  AlertCircle,
  InfoIcon,
  PlayCircle,
  Smartphone,
  Monitor,
  Wifi,
  WifiOff,
  Lock,
  UserCheck,
  FileCheck,
  BarChart3,
  ArrowLeft
} from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLocation } from "wouter";

export default function UserManual() {
  const [activeSection, setActiveSection] = useState("overview");
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Back Button - Top Left, Clear and Visible */}
        <div className="mb-4">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="bg-white hover:bg-gray-50 border-gray-300 shadow-sm mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück zum Dashboard
          </Button>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="mb-4">
            <img 
              src="/icons/nori-logo-clean.png" 
              alt="Nori Logo" 
              className="w-16 h-16 mx-auto mb-3"
            />
            <h1 className="text-3xl font-bold text-gray-900">Nori Pflegeassistenz</h1>
          </div>
          <p className="text-lg text-gray-600 mb-2">Benutzerhandbuch & Leitfaden</p>
          <Badge variant="secondary" className="text-xs">
            Version 2.0 - Produktionsreif mit vollständiger Offline-Funktionalität
          </Badge>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1 h-auto p-1 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-lg">
            <TabsTrigger value="overview" className="text-xs px-2 py-3 whitespace-nowrap">
              Überblick
            </TabsTrigger>
            <TabsTrigger value="getting-started" className="text-xs px-2 py-3 whitespace-nowrap">
              Erste Schritte
            </TabsTrigger>
            <TabsTrigger value="features" className="text-xs px-2 py-3 whitespace-nowrap">
              Funktionen
            </TabsTrigger>
            <TabsTrigger value="workflows" className="text-xs px-2 py-3 whitespace-nowrap">
              Arbeitsabläufe
            </TabsTrigger>
            <TabsTrigger value="admin" className="text-xs px-2 py-3 whitespace-nowrap">
              Administration
            </TabsTrigger>
            <TabsTrigger value="support" className="text-xs px-2 py-3 whitespace-nowrap">
              Support
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 min-h-[1000px] pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <InfoIcon className="w-4 h-4 text-blue-500" />
                    Was ist Nori Pflegeassistenz?
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3">
                    Nori ist eine moderne, KI-gestützte Pflegedokumentations-Software, die speziell 
                    für österreichische und deutsche Pflegeheime entwickelt wurde.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Spracherkennung für schnelle Dokumentation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Vollständige Offline-Funktionalität</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Rechtskonforme Dokumentation</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Mobile-first Design</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-green-500" />
                    Sicherheit & Datenschutz
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Ende-zu-Ende Verschlüsselung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">2-Faktor-Authentifizierung</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">DSGVO-konform</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Vollständige Audit-Protokolle</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-purple-500" />
                  Systemanforderungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Smartphone className="w-4 h-4" />
                      Mobile Geräte
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• iOS 14+ (Safari, Chrome)</li>
                      <li>• Android 8+ (Chrome, Firefox)</li>
                      <li>• PWA-Installation möglich</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Desktop Browser
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Chrome 90+</li>
                      <li>• Firefox 88+</li>
                      <li>• Safari 14+</li>
                      <li>• Edge 90+</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Wifi className="w-4 h-4" />
                      Internetverbindung
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Für Live-Synchronisation</li>
                      <li>• Offline-Modus verfügbar</li>
                      <li>• Auto-Sync bei Verbindung</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Getting Started Tab */}
          <TabsContent value="getting-started" className="space-y-4 min-h-[1000px] pb-32">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PlayCircle className="w-5 h-5 text-green-500" />
                  Erste Schritte
                </CardTitle>
                <CardDescription>
                  Folgen Sie dieser Anleitung für Ihren ersten Login und die Grundkonfiguration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <h4 className="font-semibold mb-2">Login & Authentifizierung</h4>
                      <p className="text-gray-600 mb-3">
                        Verwenden Sie Ihre dienstliche E-Mail-Adresse für den ersten Login. 
                        Sie erhalten einen 6-stelligen Einmalcode per E-Mail.
                      </p>
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Wichtig:</strong> Der Code ist 10 Minuten gültig. Bei Problemen kontaktieren Sie Ihre Pflegeleitung.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <h4 className="font-semibold mb-2">PWA Installation (Optional)</h4>
                      <p className="text-gray-600 mb-3">
                        Installieren Sie Nori als App auf Ihrem Gerät für bessere Performance und Offline-Nutzung.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium mb-2">iOS (iPhone/iPad)</h5>
                          <ol className="text-sm text-gray-600 space-y-1">
                            <li>1. Safari öffnen</li>
                            <li>2. Teilen-Button tippen</li>
                            <li>3. "Zum Home-Bildschirm"</li>
                          </ol>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium mb-2">Android</h5>
                          <ol className="text-sm text-gray-600 space-y-1">
                            <li>1. Chrome öffnen</li>
                            <li>2. Menü (⋮) antippen</li>
                            <li>3. "App installieren"</li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <h4 className="font-semibold mb-2">Dashboard erkunden</h4>
                      <p className="text-gray-600 mb-3">
                        Nach dem Login sehen Sie das Dashboard mit allen wichtigen Funktionen.
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <Users className="w-6 h-6 mx-auto mb-1 text-green-600" />
                          <span className="text-xs text-green-800">Bewohner</span>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <Mic className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                          <span className="text-xs text-blue-800">Aufnahme</span>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <FileText className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                          <span className="text-xs text-purple-800">Berichte</span>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <Settings className="w-6 h-6 mx-auto mb-1 text-orange-600" />
                          <span className="text-xs text-orange-800">Einstellungen</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-4 min-h-[1000px] pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mic className="w-5 h-5 text-red-500" />
                    KI-Spracherkennung
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Sprechen Sie natürlich über Pflegetätigkeiten - Nori wandelt Ihre Sprache 
                    automatisch in strukturierte Pflegedokumentation um.
                  </p>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="speech-tips">
                      <AccordionTrigger>Tipps für optimale Spracherkennung</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2 text-sm">
                          <li>• Sprechen Sie klar und deutlich</li>
                          <li>• Verwenden Sie medizinische Fachbegriffe</li>
                          <li>• Nennen Sie Vitalwerte mit Einheiten</li>
                          <li>• Beschreiben Sie Aktivitäten chronologisch</li>
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <WifiOff className="w-5 h-5 text-gray-500" />
                    Offline-Modus
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-4">
                    Arbeiten Sie auch ohne Internetverbindung. Alle Daten werden lokal gespeichert 
                    und automatisch synchronisiert sobald eine Verbindung besteht.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Alle Pflegeeinträge verfügbar</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Bewohnerdaten einsehbar</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Neue Einträge erstellen</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vollständige Funktionsübersicht</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">Dokumentation</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Sprachgesteuerte Eingabe</li>
                      <li>• Strukturierte Pflegeberichte</li>
                      <li>• Medikamentenverwaltung</li>
                      <li>• Vitalwerte-Erfassung</li>
                      <li>• Aktivitäten des täglichen Lebens</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Verwaltung</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Bewohnerverwaltung</li>
                      <li>• Benutzerrechte-Management</li>
                      <li>• Freigabe-Workflows</li>
                      <li>• PDF-Export</li>
                      <li>• Audit-Protokolle</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-purple-600">Technologie</h4>
                    <ul className="space-y-2 text-sm">
                      <li>• Progressive Web App</li>
                      <li>• Multi-Tenant Architektur</li>
                      <li>• Push-Benachrichtigungen</li>
                      <li>• Automatische Synchronisation</li>
                      <li>• Responsive Design</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Workflows Tab */}
          <TabsContent value="workflows" className="space-y-4 min-h-[1000px] pb-32">
            <Card>
              <CardHeader>
                <CardTitle>Typische Arbeitsabläufe</CardTitle>
                <CardDescription>
                  Schritt-für-Schritt Anleitungen für die wichtigsten Tätigkeiten
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="new-entry">
                    <AccordionTrigger>Neuen Pflegeeintrag erstellen</AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                          <span>Bewohner aus der Liste auswählen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                          <span>Aufnahme-Button tippen (rotes Mikrofon)</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                          <span>Pflegetätigkeiten natürlich beschreiben</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                          <span>Aufnahme beenden und Transkription prüfen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">5</span>
                          <span>Eintrag zur Freigabe einreichen</span>
                        </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="approve-entry">
                    <AccordionTrigger>Pflegeeintrag freigeben (Pflegeleitung)</AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                          <span>Freigabe-Bereich öffnen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                          <span>Ausstehende Einträge durchgehen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                          <span>Inhalt auf Vollständigkeit prüfen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                          <span>Freigeben oder Überarbeitung anfordern</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">5</span>
                          <span>PDF-Report generieren</span>
                        </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="resident-management">
                    <AccordionTrigger>Neue Bewohner anlegen</AccordionTrigger>
                    <AccordionContent>
                      <ol className="space-y-3 text-sm">
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                          <span>Bewohner-Bereich öffnen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                          <span>"Neuer Bewohner" Button klicken</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                          <span>Persönliche Daten eingeben</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
                          <span>Medizinische Grunddaten erfassen</span>
                        </li>
                        <li className="flex gap-3">
                          <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">5</span>
                          <span>Speichern und Profil vervollständigen</span>
                        </li>
                      </ol>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-4 min-h-[1000px] pb-32">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-blue-500" />
                    Benutzerrollen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-600 mb-2">Pflegekraft</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Pflegeeinträge erstellen</li>
                        <li>• Bewohnerdaten einsehen</li>
                        <li>• Eigene Einträge bearbeiten</li>
                        <li>• Sprachaufnahmen machen</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-2">Pflegeleitung</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Alle Pflegekraft-Rechte</li>
                        <li>• Einträge freigeben/ablehnen</li>
                        <li>• Bewohner verwalten</li>
                        <li>• Berichte exportieren</li>
                        <li>• Einstellungen verwalten</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-gray-500" />
                    System-Einstellungen
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span>Push-Benachrichtigungen</span>
                      <Badge variant="outline">Einstellbar</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Offline-Synchronisation</span>
                      <Badge variant="outline">Automatisch</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Sprachqualität</span>
                      <Badge variant="outline">Hoch</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Audit-Protokollierung</span>
                      <Badge variant="outline">Aktiv</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Rechtliche Hinweise & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-blue-600">DSGVO-Compliance</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Alle Daten werden in der EU gespeichert</li>
                      <li>• Verschlüsselung nach aktuellen Standards</li>
                      <li>• Automatische Löschfristen konfigurierbar</li>
                      <li>• Vollständige Audit-Trails</li>
                      <li>• Benutzerrechte-Management</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-green-600">Medizinische Standards</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Strukturierte Pflegedokumentation</li>
                      <li>• Österreichische Pflegestandards</li>
                      <li>• Automatische Validierung</li>
                      <li>• Rechtssichere PDF-Exporte</li>
                      <li>• Langzeitarchivierung</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4 min-h-[1000px] pb-32">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500" />
                  Häufige Fragen (FAQ)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="space-y-2">
                  <AccordionItem value="faq-1">
                    <AccordionTrigger>Was passiert bei Internetausfall?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600">
                        Nori funktioniert vollständig offline. Alle Daten werden lokal gespeichert 
                        und automatisch synchronisiert, sobald die Internetverbindung wiederhergestellt ist. 
                        Sie sehen den Offline-Status in der App und können normal weiterarbeiten.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-2">
                    <AccordionTrigger>Wie genau ist die Spracherkennung?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600">
                        Die KI-Spracherkennung ist speziell für medizinische Fachbegriffe trainiert 
                        und erreicht eine Genauigkeit von über 95%. Das System lernt kontinuierlich 
                        aus Korrekturen und wird mit der Zeit noch präziser.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-3">
                    <AccordionTrigger>Kann ich Einträge nachträglich ändern?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600">
                        Pflegekräfte können ihre eigenen Einträge bis zur Freigabe bearbeiten. 
                        Nach der Freigabe sind Änderungen aus rechtlichen Gründen nicht mehr möglich. 
                        Alle Änderungen werden im Audit-Protokoll dokumentiert.
                      </p>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="faq-4">
                    <AccordionTrigger>Wie sicher sind meine Daten?</AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600">
                        Alle Daten werden verschlüsselt übertragen und gespeichert. Der Zugriff 
                        erfolgt nur über 2-Faktor-Authentifizierung. Die Server befinden sich 
                        in deutschen Rechenzentren und erfüllen höchste Sicherheitsstandards.
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="w-5 h-5 text-blue-500" />
                    Support-Kontakt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">E-Mail Support</p>
                        <p className="text-sm text-gray-600">support@nori-pflege.de</p>
                        <p className="text-xs text-gray-500">Antwort binnen 24h</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium">Telefon-Hotline</p>
                        <p className="text-sm text-gray-600">+43 1 234 5678</p>
                        <p className="text-xs text-gray-500">Mo-Fr 8:00-18:00 Uhr</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="w-5 h-5 text-purple-500" />
                    Ressourcen & Downloads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="w-4 h-4 mr-2" />
                      Schnellstart-Guide (PDF)
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Video-Tutorials
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Book className="w-4 h-4 mr-2" />
                      Rechtliche Dokumentation
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Settings className="w-4 h-4 mr-2" />
                      Konfigurationsvorlagen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Versionsinformationen</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">Version</p>
                    <p className="text-gray-600">2.0.0 - Produktionsreif</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Letztes Update</p>
                    <p className="text-gray-600">11. August 2025</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Nächstes Update</p>
                    <p className="text-gray-600">Automatisch verfügbar</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}