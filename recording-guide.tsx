import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp, Mic, Heart, Pill, Utensils, Bath, Brain, AlertTriangle, FileText } from "lucide-react";
import { useState } from "react";

interface RecordingGuideProps {
  isRecording?: boolean;
  currentSection?: string;
}

export function RecordingGuide({ isRecording = false, currentSection }: RecordingGuideProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const pflegeKategorien = [
    {
      id: "vitalwerte",
      icon: <Heart className="h-4 w-4" />,
      title: "Vitalwerte",
      color: "bg-red-100 text-red-800",
      beispiele: [
        "Blutdruck 120/80 gemessen",
        "Puls 75 Schläge pro Minute",
        "Temperatur 36,8 Grad",
        "Gewicht 72 Kilogramm",
        "Patient klagt über Schwindel"
      ]
    },
    {
      id: "medikation",
      icon: <Pill className="h-4 w-4" />,
      title: "Medikation",
      color: "bg-blue-100 text-blue-800",
      beispiele: [
        "Pantoprazol 20mg verabreicht",
        "Blutdruckmedikament um 8 Uhr gegeben",
        "Insulin gespritzt",
        "Schmerzmittel verweigert",
        "Medikamente vollständig eingenommen"
      ]
    },
    {
      id: "mobilität",
      icon: <Utensils className="h-4 w-4" />,
      title: "Mobilität",
      color: "bg-green-100 text-green-800",
      beispiele: [
        "Mit Rollator 50 Meter gelaufen",
        "Vom Bett in den Sessel transferiert",
        "Physiotherapie durchgeführt",
        "Sturzgefahr beachtet",
        "Bettlägerig, regelmäßig umgelagert"
      ]
    },
    {
      id: "ernährung",
      icon: <Utensils className="h-4 w-4" />,
      title: "Ernährung & Flüssigkeit",
      color: "bg-yellow-100 text-yellow-800",
      beispiele: [
        "Frühstück vollständig gegessen",
        "800 Milliliter Flüssigkeit getrunken",
        "Appetit vermindert",
        "Arzt konsultieren",
        "Diabetische Kost verabreicht"
      ]
    },
    {
      id: "hygiene",
      icon: <Bath className="h-4 w-4" />,
      title: "Hygiene & Körperpflege",
      color: "bg-purple-100 text-purple-800",
      beispiele: [
        "Vollbad durchgeführt",
        "Geduscht mit Unterstützung",
        "Zähne geputzt",
        "Haare gewaschen",
        "Wundversorgung am linken Bein"
      ]
    },
    {
      id: "stimmung",
      icon: <Brain className="h-4 w-4" />,
      title: "Stimmung & Kognition",
      color: "bg-indigo-100 text-indigo-800",
      beispiele: [
        "Gute Laune",
        "Verwirrt und desorientiert",
        "Traurig wegen Besuchsverbot",
        "Aggressiv bei der Pflege",
        "Erinnerungslücken festgestellt"
      ]
    },
    {
      id: "besonderheiten",
      icon: <AlertTriangle className="h-4 w-4" />,
      title: "Besonderheiten",
      color: "bg-orange-100 text-orange-800",
      beispiele: [
        "Schwindel, Sturz",
        "Arztbesuch vereinbart",
        "Angehörige zu Besuch",
        "Neues Hilfsmittel erhalten",
        "Keine besonderen Vorkommnisse"
      ]
    },
    {
      id: "empfehlungen",
      icon: <FileText className="h-4 w-4" />,
      title: "Empfehlungen",
      color: "bg-gray-100 text-gray-800",
      beispiele: [
        "Arzt konsultieren",
        "Ärztliche Kontrolle empfohlen",
        "Physiotherapie fortsetzen",
        "Medikation überprüfen lassen",
        "Angehörige informieren"
      ]
    }
  ];

  return (
    <div className="w-full space-y-2">
      {/* Ultra-kompakter Header */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Mic className="h-3 w-3 text-green-600" />
              <h3 className="text-xs font-bold text-green-800">🌍 Sprach-Guide</h3>
            </div>
            {isRecording && (
              <Badge variant="destructive" className="animate-pulse text-xs px-2 py-1">
                🔴 LIVE
              </Badge>
            )}
          </div>
          
          {/* Ultra-kompaktes Guide: 4 Links + 4 Rechts */}
          <div className="grid grid-cols-2 gap-2">
            {/* Linke Spalte - Kategorien 1-4 */}
            <div className="space-y-0.5">
              {pflegeKategorien.slice(0, 4).map((kategorie) => (
                <div 
                  key={kategorie.id}
                  className={`p-1 rounded text-xs border transition-all ${
                    isRecording && currentSection === kategorie.id 
                      ? 'border-blue-500 bg-blue-100 font-bold' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-xs">{kategorie.icon}</span>
                    <span className="font-bold text-gray-900 leading-none text-xs">{kategorie.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 leading-none">
                    {kategorie.beispiele[0].split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Rechte Spalte - Kategorien 5-8 */}
            <div className="space-y-0.5">
              {pflegeKategorien.slice(4, 8).map((kategorie) => (
                <div 
                  key={kategorie.id}
                  className={`p-1 rounded text-xs border transition-all ${
                    isRecording && currentSection === kategorie.id 
                      ? 'border-blue-500 bg-blue-100 font-bold' 
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="text-xs">{kategorie.icon}</span>
                    <span className="font-bold text-gray-900 leading-none text-xs">{kategorie.title}</span>
                  </div>
                  <div className="text-xs text-gray-500 leading-none">
                    {kategorie.beispiele[0].split(' ').slice(0, 2).join(' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Kompakte Tipps */}
          <div className="bg-green-50 border border-green-200 rounded p-1">
            <div className="text-xs text-green-900 font-bold mb-0.5">🎯 Tipps:</div>
            <div className="grid grid-cols-2 gap-x-2 text-xs text-green-800 leading-tight">
              <div>• Deutlich sprechen</div>
              <div>• Name zuerst</div>
              <div>• Zahlen klar</div>
              <div>• Medikamente exakt</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Kompakte Live-Kategorie während Aufnahme */}
      {isRecording && currentSection && (
        <div className="bg-gradient-to-r from-blue-100 to-green-100 border border-blue-400 rounded p-1.5 shadow-sm">
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-blue-900">JETZT:</span>
            {pflegeKategorien.find(k => k.id === currentSection) && (
              <>
                <span className="text-sm">{pflegeKategorien.find(k => k.id === currentSection)?.icon}</span>
                <span className="font-bold text-blue-900 text-xs">
                  {pflegeKategorien.find(k => k.id === currentSection)?.title}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}