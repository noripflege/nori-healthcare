import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { type Tenant } from "@shared/schema";
import { 
  AlertCircle, 
  Building2, 
  Users, 
  Plus, 
  Globe, 
  Settings, 
  Zap,
  BarChart3,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react";

export default function SuperAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [newTenant, setNewTenant] = useState({ name: "", subdomain: "" });
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "caregiver", tenantId: "" });
  const [showAddUser, setShowAddUser] = useState(false);

  // Scroll to top when dashboard loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Redirect non-super-admins
  if (user?.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-lg font-semibold mb-2">Zugriff verweigert</h2>
              <p className="text-gray-600">Sie haben keine Berechtigung für den Super-Admin Bereich.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { data: tenants, isLoading } = useQuery<Tenant[]>({
    queryKey: ['/api/admin/tenants'],
  });

  const { data: adminStats } = useQuery<any>({
    queryKey: ['/api/admin/stats'],
  });

  const globalUpdateMutation = useMutation({
    mutationFn: async (updateType: string) => {
      const response = await fetch('/api/admin/global-update', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ updateType, configuration: {} })
      });
      if (!response.ok) throw new Error('Update fehlgeschlagen');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Globales Update erfolgreich",
        description: "Alle Pflegeheime haben das Update erhalten",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
    onError: () => {
      toast({
        title: "❌ Update fehlgeschlagen",
        description: "Bitte versuchen Sie es erneut",
        variant: "destructive",
      });
    },
  });

  const createTenantMutation = useMutation({
    mutationFn: async (tenant: { name: string; subdomain: string }) => {
      const response = await fetch('/api/admin/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tenant)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Mandant erstellt",
        description: "Neuer Mandant wurde erfolgreich hinzugefügt",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
      setNewTenant({ name: "", subdomain: "" });
      setShowAddTenant(false);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Fehler beim Erstellen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const toggleTenantMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/tenants/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) throw new Error('Toggle fehlgeschlagen');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/tenants'] });
    },
  });

  const createUserMutation = useMutation({
    mutationFn: async (userData: { name: string; email: string; role: string; tenantId: string }) => {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "✅ Benutzer erstellt",
        description: "Neuer Benutzer wurde erfolgreich hinzugefügt",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setNewUser({ name: "", email: "", role: "caregiver", tenantId: "" });
      setShowAddUser(false);
    },
    onError: (error: Error) => {
      toast({
        title: "❌ Fehler beim Erstellen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateTenant = () => {
    if (!newTenant.name || !newTenant.subdomain) {
      toast({
        title: "Fehlende Daten",
        description: "Bitte Name und Subdomain eingeben",
        variant: "destructive",
      });
      return;
    }
    createTenantMutation.mutate(newTenant);
  };

  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email || !newUser.tenantId) {
      toast({
        title: "Fehlende Daten",
        description: "Bitte alle Felder ausfüllen",
        variant: "destructive",
      });
      return;
    }
    createUserMutation.mutate(newUser);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Laden...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard')}
              className="p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Super Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Zentrale Verwaltung für alle Mandanten</p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Aktive Mandanten</p>
                  <p className="text-2xl font-bold">{tenants?.filter(t => t.isActive).length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Gesamt Benutzer</p>
                  <p className="text-2xl font-bold">{adminStats?.totalUsers || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Gesamt Einträge</p>
                  <p className="text-2xl font-bold">{adminStats?.totalEntries || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ein-Klick Global Updates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Ein-Klick Global Updates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => globalUpdateMutation.mutate('security_patch')}
                disabled={globalUpdateMutation.isPending}
                className="h-16 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                <Zap className="w-5 h-5 mr-2" />
                Sicherheits-Update an alle Mandanten
              </Button>

              <Button
                onClick={() => globalUpdateMutation.mutate('feature_update')}
                disabled={globalUpdateMutation.isPending}
                className="h-16 bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <Settings className="w-5 h-5 mr-2" />
                Feature-Update an alle Mandanten
              </Button>

              <Button
                onClick={() => globalUpdateMutation.mutate('ai_model_update')}
                disabled={globalUpdateMutation.isPending}
                className="h-16 bg-green-600 hover:bg-green-700 text-white font-medium"
              >
                <Zap className="w-5 h-5 mr-2" />
                KI-Modell Update an alle Mandanten
              </Button>

              <Button
                onClick={() => globalUpdateMutation.mutate('database_migration')}
                disabled={globalUpdateMutation.isPending}
                className="h-16 bg-purple-600 hover:bg-purple-700 text-white font-medium"
              >
                <Settings className="w-5 h-5 mr-2" />
                Datenbank-Migration an alle Mandanten
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Mandanten-Verwaltung - Längere Sektion für bessere Klick-Ziele */}
        <Card className="min-h-[600px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Mandanten-Verwaltung
              </CardTitle>
              <Dialog open={showAddTenant} onOpenChange={setShowAddTenant}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 h-12 px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Mandant
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neuen Mandanten erstellen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name des Pflegeheims</Label>
                      <Input
                        id="name"
                        value={newTenant.name}
                        onChange={(e) => setNewTenant({ ...newTenant, name: e.target.value })}
                        placeholder="z.B. Altersheim Sonnenschein"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subdomain">Subdomain</Label>
                      <Input
                        id="subdomain"
                        value={newTenant.subdomain}
                        onChange={(e) => setNewTenant({ ...newTenant, subdomain: e.target.value })}
                        placeholder="z.B. sonnenschein"
                      />
                    </div>
                    <Button 
                      onClick={handleCreateTenant}
                      disabled={createTenantMutation.isPending}
                      className="w-full h-12"
                    >
                      {createTenantMutation.isPending ? "Erstelle..." : "Mandant erstellen"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 h-12 px-6">
                    <Plus className="w-4 h-4 mr-2" />
                    Neuer Benutzer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Neuen Benutzer erstellen</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userName">Name</Label>
                      <Input
                        id="userName"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="z.B. Maria Müller"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userEmail">E-Mail</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="z.B. maria@pflegeheim.de"
                      />
                    </div>
                    <div>
                      <Label htmlFor="userRole">Rolle</Label>
                      <select
                        id="userRole"
                        value={newUser.role}
                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="caregiver">Pflegekraft</option>
                        <option value="lead">Pflegeleitung</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="userTenant">Pflegeheim zuordnen</Label>
                      <select
                        id="userTenant"
                        value={newUser.tenantId}
                        onChange={(e) => setNewUser({ ...newUser, tenantId: e.target.value })}
                        className="w-full h-10 px-3 rounded-md border border-input bg-background"
                      >
                        <option value="">Pflegeheim wählen...</option>
                        {tenants?.filter(t => t.isActive).map(tenant => (
                          <option key={tenant.id} value={tenant.id}>
                            {tenant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button 
                      onClick={handleCreateUser}
                      disabled={createUserMutation.isPending}
                      className="w-full h-12"
                    >
                      {createUserMutation.isPending ? "Erstelle..." : "Benutzer erstellen"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {tenants?.map((tenant) => (
                <div key={tenant.id} className="flex items-center justify-between p-6 border rounded-lg min-h-[80px] bg-gray-50">
                  <div className="flex-1">
                    <h3 className="font-medium text-lg">{tenant.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{tenant.subdomain}.nori-system.de</p>
                    <p className="text-xs text-gray-500 mt-1">ID: {tenant.id}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={tenant.isActive ? "default" : "secondary"} className="px-3 py-1">
                      {tenant.isActive ? "Aktiv" : "Inaktiv"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleTenantMutation.mutate({ 
                        id: tenant.id, 
                        isActive: !tenant.isActive 
                      })}
                      disabled={toggleTenantMutation.isPending}
                      className="h-10 px-4"
                    >
                      {tenant.isActive ? (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Deaktivieren
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aktivieren
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/tenant-config/${tenant.id}`)}
                      className="h-10 px-4 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Konfigurieren
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Platzhalter für mehr Inhalt */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Mandanten-spezifische Anpassungen</h3>
              <p className="text-sm text-blue-700">
                Klicken Sie auf "Konfigurieren" bei einem Mandanten, um individuelle Einstellungen vorzunehmen:
              </p>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• Eigene Logos und Branding</li>
                <li>• Spezielle Formulare und Felder</li>
                <li>• Individuelle Benutzerrollen</li>
                <li>• Angepasste Workflows</li>
                <li>• Lokale Sprach- und Terminologie-Anpassungen</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}