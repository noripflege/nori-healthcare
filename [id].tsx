import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Edit, 
  Plus, 
  FileText, 
  Calendar,
  User,
  Heart,
  AlertTriangle,
  Phone
} from "lucide-react";
import { Resident, CareEntry } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { format } from "date-fns";
import { de } from "date-fns/locale";

export default function ResidentProfile() {
  const [, params] = useRoute("/residents/:id");
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const residentId = params?.id;

  const { data: resident, isLoading: loadingResident } = useQuery<Resident>({
    queryKey: ["/api/residents", residentId],
    enabled: !!residentId,
  });

  const { data: entries = [], isLoading: loadingEntries } = useQuery<CareEntry[]>({
    queryKey: ["/api/entries", residentId],
    enabled: !!residentId,
  });

  if (loadingResident) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Bewohner nicht gefunden</h1>
          <Button onClick={() => navigate("/residents")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Zurück zur Übersicht
          </Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'final': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Entwurf';
      case 'pending': return 'Zur Freigabe';
      case 'final': return 'Freigegeben';
      default: return status;
    }
  };

  // Calculate age from birth year
  const currentYear = new Date().getFullYear();
  const age = resident.birthYear ? currentYear - resident.birthYear : null;

  return (
    <div className="container mx-auto p-4 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/residents")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Bewohner-Profil</h1>
            <p className="text-sm text-muted-foreground">
              Detailinformationen und Pflegeverlauf
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(`/residents/${residentId}/edit`)}>
            <Edit className="h-4 w-4 mr-2" />
            Bearbeiten
          </Button>
          <Button onClick={() => navigate(`/recording?resident=${residentId}`)}>
            <Plus className="h-4 w-4 mr-2" />
            Neuer Eintrag
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24">
              <AvatarImage 
                src={resident.photoUrl || undefined} 
                alt={resident.name}
              />
              <AvatarFallback className="text-2xl">
                {resident.name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            {/* Basic Info */}
            <div className="flex-1 space-y-3">
              <div>
                <CardTitle className="text-2xl">{resident.name}</CardTitle>
                <div className="flex items-center gap-4 mt-2 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Zimmer {resident.room}</span>
                  </div>
                  {age && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{age} Jahre (geb. {resident.birthYear})</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge variant={resident.status === 'active' ? 'default' : 'secondary'}>
                  {resident.status === 'active' ? 'Aktiv' : 'Inaktiv'}
                </Badge>
                {resident.careLevel && (
                  <Badge variant="outline">Pflegegrad {resident.careLevel}</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Medical Information */}
          {(resident.diagnoses?.length || resident.allergies?.length) && (
            <div className="grid md:grid-cols-2 gap-6">
              {resident.diagnoses?.length && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    <h3 className="font-semibold">Diagnosen</h3>
                  </div>
                  <div className="space-y-1">
                    {resident.diagnoses.map((diagnosis, index) => (
                      <Badge key={index} variant="outline" className="mr-1 mb-1">
                        {diagnosis}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {resident.allergies?.length && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    <h3 className="font-semibold">Allergien</h3>
                  </div>
                  <div className="space-y-1">
                    {resident.allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="mr-1 mb-1">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Emergency Contacts */}
          {resident.emergencyContact && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <h3 className="font-semibold">Notfallkontakt</h3>
              </div>
              <div className="text-sm text-muted-foreground">
                {resident.emergencyContact}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Care Entries History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Pflegeverlauf
            {entries.length > 0 && (
              <Badge variant="outline">{entries.length} Einträge</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingEntries ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Noch keine Einträge</h3>
              <p className="mb-4">Für diesen Bewohner wurden noch keine Pflegeeinträge erstellt.</p>
              <Button onClick={() => navigate(`/recording?resident=${residentId}`)}>
                <Plus className="h-4 w-4 mr-2" />
                Ersten Eintrag erstellen
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getStatusColor(entry.status)}>
                          {getStatusText(entry.status)}
                        </Badge>
                        {entry.isDraft && (
                          <Badge variant="outline" className="text-xs">
                            KI-Entwurf
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {format(new Date(entry.createdAt), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </div>
                    </div>
                    
                    {/* Entry Preview */}
                    {entry.content && typeof entry.content === 'object' && (
                      <div className="text-sm text-muted-foreground">
                        {entry.content.vitalwerte && (
                          <div>Vitalwerte: {entry.content.vitalwerte.substring(0, 100)}...</div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Erstellt von {entry.authorId}
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/entries/${entry.id}`)}
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        Öffnen
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}