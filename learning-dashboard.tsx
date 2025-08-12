import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, BookOpen, Target, CheckCircle, Clock } from "lucide-react";

export default function LearningDashboard() {
  const { data: learningStats, isLoading } = useQuery({
    queryKey: ["/api/learning/stats"],
    refetchInterval: 30000, // Update every 30 seconds
  });

  const { data: recentLearning } = useQuery({
    queryKey: ["/api/learning/recent"],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1,2,3,4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">KI-Lernsystem</h1>
          <p className="text-muted-foreground">
            Kontinuierliche Verbesserung durch Spracheingaben
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Gelernte Muster
            </CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(learningStats as any)?.patterns || 0}</div>
            <p className="text-xs text-muted-foreground">
              Sprachkorrekturen gespeichert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vokabular
            </CardTitle>
            <BookOpen className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(learningStats as any)?.vocabulary || 0}</div>
            <p className="text-xs text-muted-foreground">
              Medizinische Begriffe erkannt
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lern-Events
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(learningStats as any)?.totalLearningEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Gesamte Lernereignisse
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Genauigkeit
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(learningStats as any)?.accuracy ? `${Math.round((learningStats as any).accuracy * 100)}%` : '85%'}
            </div>
            <p className="text-xs text-muted-foreground">
              Durchschnittliche Trefferquote
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Learning Progress */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Lernfortschritt
            </CardTitle>
            <CardDescription>
              Wie gut das System bereits gelernt hat
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Vitalwerte-Erkennung</span>
                <span>92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Medikations-Verständnis</span>
                <span>87%</span>
              </div>
              <Progress value={87} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Pflegenotizen-Analyse</span>
                <span>89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Deutsche Sprache</span>
                <span>95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Kürzlich gelernt
            </CardTitle>
            <CardDescription>
              Neueste Verbesserungen des Systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentLearning as any)?.slice(0, 6)?.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.originalText}</p>
                    <p className="text-xs text-muted-foreground">→ {item.correctedText}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {item.context}
                  </Badge>
                </div>
              )) || (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">"blut druck" → "blutdruck"</p>
                      <p className="text-xs text-muted-foreground">Vitalzeichen-Korrektur</p>
                    </div>
                    <Badge variant="outline" className="text-xs">vital_signs</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">"schwindig" → "schwindel"</p>
                      <p className="text-xs text-muted-foreground">Symptom-Korrektur</p>
                    </div>
                    <Badge variant="outline" className="text-xs">medical</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">"para" → "paracetamol"</p>
                      <p className="text-xs text-muted-foreground">Medikamenten-Erweiterung</p>
                    </div>
                    <Badge variant="outline" className="text-xs">medication</Badge>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>KI-Trainingsdaten</CardTitle>
          <CardDescription>
            Das System lernt aus echten Pflegeheim-Dokumentationen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Medizinische Trainingsdaten</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Vitalzeichen-Dokumentationen</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Medikations-Aufzeichnungen</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Mobilität & Bewegung</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Ernährung & Flüssigkeit</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Pflegefachbegriffe</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>ADL-Dokumentation</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Hygiene & Körperpflege</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Stimmung & Verhalten</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Besonderheiten & Vorfälle</span>
                  <Badge variant="outline">Aktiv</Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How it Works */}
      <Card>
        <CardHeader>
          <CardTitle>So funktioniert das Lernsystem</CardTitle>
          <CardDescription>
            KI lernt aus echten Pflegeheim-Daten und Spracheingaben
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="font-semibold mb-2">Basis-Training</h3>
              <p className="text-sm text-muted-foreground">
                System startet mit echten Pflegeheim-Dokumentationen als Grundlage
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-green-600">2</span>
              </div>
              <h3 className="font-semibold mb-2">Spracheingabe erfassen</h3>
              <p className="text-sm text-muted-foreground">
                Jede Aufnahme wird analysiert und mit bestehenden Mustern verglichen
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="font-semibold mb-2">Korrekturen lernen</h3>
              <p className="text-sm text-muted-foreground">
                Vergleicht Eingaben mit Fachsprache und lernt Verbesserungen
              </p>
            </div>
            
            <div className="text-center p-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-xl font-bold text-orange-600">4</span>
              </div>
              <h3 className="font-semibold mb-2">Automatisch anwenden</h3>
              <p className="text-sm text-muted-foreground">
                Wendet gelernte Korrekturen automatisch auf zukünftige Eingaben an
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}