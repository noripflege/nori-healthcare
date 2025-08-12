import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ArrowLeft, 
  History, 
  Bell, 
  LogOut, 
  User, 
  Save,
  Book,
  FileText,
  PlayCircle,
  MessageCircle,
  Users
} from "lucide-react";
import { NotificationSettings } from "@/components/notification-settings";

export default function Settings() {
  const [, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newName, setNewName] = useState(user?.name || "");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Update name mutation
  const updateNameMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("PUT", "/api/auth/profile", {
        name: name.trim(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Gespeichert",
        description: "Ihr Name wurde erfolgreich aktualisiert.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setIsEditDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Name konnte nicht aktualisiert werden.",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
    toast({
      title: "Abgemeldet",
      description: "Sie wurden erfolgreich abgemeldet.",
    });
  };

  const handleSaveName = () => {
    if (newName.trim().length === 0) {
      toast({
        title: "Fehler",
        description: "Name darf nicht leer sein.",
        variant: "destructive",
      });
      return;
    }
    updateNameMutation.mutate(newName);
  };

  const initials = user?.name
    ?.split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase() || '??';

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 py-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-gray-400 hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-800">Einstellungen</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* Profile */}
        <Card className="shadow-soft">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-xl">{initials}</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{user?.name}</h3>
                <p className="text-gray-500">{user?.role === 'lead' ? 'Pflegeleitung' : 'Pflegekraft'}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full" onClick={() => setNewName(user?.name || "")}>
                  <User className="w-4 h-4 mr-2" />
                  Namen bearbeiten
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Namen bearbeiten</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Vollständiger Name</Label>
                    <Input
                      id="name"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Ihr vollständiger Name"
                      className="mt-2"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsEditDialogOpen(false)}
                      className="flex-1"
                    >
                      Abbrechen
                    </Button>
                    <Button 
                      onClick={handleSaveName}
                      disabled={updateNameMutation.isPending}
                      className="flex-1"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateNameMutation.isPending ? "Speichern..." : "Speichern"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Help & Documentation Card */}
        <Card data-help-section>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Book className="w-4 h-4" />
              Hilfe & Dokumentation
            </CardTitle>
            <CardDescription className="text-sm">
              Benutzerhandbuch und Support-Ressourcen
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              data-handbook-button
              variant="outline" 
              className="w-full justify-start text-sm h-10 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary transition-all duration-200"
              onClick={() => window.open('/user-manual', '_blank')}
            >
              <FileText className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
              <span className="truncate font-medium text-primary">Benutzerhandbuch</span>
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="ghost" size="sm" className="justify-start text-xs h-8">
                <PlayCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">Videos</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="justify-start text-xs h-8"
                onClick={() => window.open('/user-manual#faq', '_blank')}
              >
                <MessageCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                <span className="truncate">FAQ</span>
              </Button>
            </div>
            {(user?.role === 'lead' || user?.email === 'super@nori.app') && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm h-10"
                onClick={() => navigate('/user-management')}
              >
                <Users className="w-4 h-4 mr-2 flex-shrink-0 text-orange-600" />
                <span className="truncate font-medium text-orange-600">Benutzerverwaltung</span>
              </Button>
            )}
            {user?.email === 'super@nori.app' && (
              <Button 
                variant="outline" 
                className="w-full justify-start text-sm h-10"
                onClick={() => window.open('/admin-manual', '_blank')}
              >
                <User className="w-4 h-4 mr-2 flex-shrink-0" />
                <span className="truncate">Admin-Handbuch</span>
              </Button>
            )}
            <div className="text-xs text-gray-500 pt-2 border-t">
              <div className="truncate">Support: support@nori-pflege.de</div>
              <div className="truncate">Tel: +43 1 234 5678</div>
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        {user && <NotificationSettings userId={user.id} />}

        {/* Settings Options */}
        <Card className="shadow-soft">
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100">
              <Button
                variant="ghost"
                onClick={() => navigate("/audit-log")}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 rounded-none h-auto"
              >
                <div className="flex items-center space-x-3">
                  <History className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-800 font-medium">Audit-Log</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </Button>
              
              <Button
                variant="ghost"
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 rounded-none h-auto"
                onClick={() => {
                  toast({
                    title: "Bald verfügbar",
                    description: "Diese Funktion wird in einer zukünftigen Version verfügbar sein.",
                  });
                }}
              >
                <div className="flex items-center space-x-3">
                  <Bell className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-800 font-medium">Benachrichtigungen</span>
                </div>
                <ArrowLeft className="w-4 h-4 text-gray-400 rotate-180" />
              </Button>
              
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full p-6 flex items-center justify-between hover:bg-gray-50 rounded-none h-auto text-red-600 hover:text-red-700"
              >
                <div className="flex items-center space-x-3">
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Abmelden</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
