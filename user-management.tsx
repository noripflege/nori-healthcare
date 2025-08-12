import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Search, User, FileText, CheckCircle, Clock, AlertTriangle, Plus, Users, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";

export default function UserManagement() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [activityFilter, setActivityFilter] = useState("all");
  const { user } = useAuth();

  // Only allow admin/lead access
  if (user?.role !== 'lead' && user?.role !== 'admin') {
    return (
      <div className="p-6 text-center">
        <p className="text-red-600">Zugriff verweigert. Nur Pflegeleitung kann Benutzeraktivitäten einsehen.</p>
      </div>
    );
  }

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/users"],
  });

  const { data: auditLogs = [], isLoading: logsLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <User className="text-green-500 w-4 h-4" />;
      case "LOGOUT":
        return <User className="text-gray-500 w-4 h-4" />;
      case "CREATE_ENTRY":
        return <FileText className="text-primary w-4 h-4" />;
      case "SUBMIT_ENTRY":
        return <Clock className="text-orange-500 w-4 h-4" />;
      case "APPROVE_ENTRY":
        return <CheckCircle className="text-green-500 w-4 h-4" />;
      case "REJECT_ENTRY":
        return <AlertTriangle className="text-red-500 w-4 h-4" />;
      case "CREATE_RESIDENT":
        return <Plus className="text-blue-500 w-4 h-4" />;
      case "UPDATE_RESIDENT":
        return <Users className="text-blue-500 w-4 h-4" />;
      default:
        return <FileText className="text-gray-400 w-4 h-4" />;
    }
  };

  const getActionDescription = (action: string, metadata?: any) => {
    const residentName = metadata?.residentName ? ` für ${metadata.residentName}` : '';
    
    switch (action) {
      case "LOGIN":
        return "Angemeldet";
      case "LOGOUT":
        return "Abgemeldet";
      case "CREATE_ENTRY":
        return `Neuer Eintrag erstellt${residentName}`;
      case "SUBMIT_ENTRY":
        return `Eintrag zur Freigabe eingereicht${residentName}`;
      case "APPROVE_ENTRY":
        return `Eintrag freigegeben${residentName}`;
      case "REJECT_ENTRY":
        return `Eintrag abgelehnt${residentName}`;
      case "CREATE_RESIDENT":
        return `Neuer Bewohner angelegt${residentName}`;
      case "UPDATE_RESIDENT":
        return `Bewohner aktualisiert${residentName}`;
      case "UPDATE_PROFILE":
        return "Profil aktualisiert";
      default:
        return action;
    }
  };

  const filteredUsers = users.filter((u: any) =>
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getUserActivities = (userId: string) => {
    let userLogs = auditLogs.filter((log: any) => log.userId === userId);
    
    if (activityFilter !== "all") {
      userLogs = userLogs.filter((log: any) => log.action === activityFilter);
    }
    
    return userLogs.sort((a: any, b: any) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ).slice(0, 20); // Show last 20 activities
  };

  const getUserStats = (userId: string) => {
    const userLogs = auditLogs.filter((log: any) => log.userId === userId);
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = userLogs.filter((log: any) => 
      log.timestamp.startsWith(today)
    );
    
    return {
      totalActivities: userLogs.length,
      todayActivities: todayLogs.length,
      lastActivity: userLogs.length > 0 ? 
        userLogs.sort((a: any, b: any) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0].timestamp : null,
      entriesCreated: userLogs.filter((log: any) => log.action === 'CREATE_ENTRY').length,
      entriesSubmitted: userLogs.filter((log: any) => log.action === 'SUBMIT_ENTRY').length,
    };
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
            <h1 className="text-xl font-semibold text-gray-800">Benutzerverwaltung</h1>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Search and Filter */}
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Benutzer suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Users List */}
        {usersLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Lade Benutzer...</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredUsers.map((u: any) => {
              const stats = getUserStats(u.id);
              return (
                <Card key={u.id} className="shadow-soft">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-primary font-semibold">
                            {u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-800">{u.name}</h3>
                          <p className="text-sm text-gray-500">{u.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={u.role === 'lead' ? 'default' : 'secondary'}>
                              {u.role === 'lead' ? 'Pflegeleitung' : 'Pflegekraft'}
                            </Badge>
                            {stats.lastActivity && (
                              <span className="text-xs text-gray-500">
                                Zuletzt aktiv: {new Date(stats.lastActivity).toLocaleDateString('de-DE')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">
                            <span className="font-medium">{stats.todayActivities}</span> heute
                          </p>
                          <p className="text-gray-500">
                            <span className="font-medium">{stats.entriesCreated}</span> Einträge erstellt
                          </p>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(u)}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              Aktivitäten
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Aktivitäten von {u.name}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {/* Activity Filter */}
                            <div className="mb-4">
                              <Select value={activityFilter} onValueChange={setActivityFilter}>
                                <SelectTrigger className="w-48">
                                  <SelectValue placeholder="Filter wählen" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="all">Alle Aktivitäten</SelectItem>
                                  <SelectItem value="LOGIN">Anmeldungen</SelectItem>
                                  <SelectItem value="CREATE_ENTRY">Einträge erstellt</SelectItem>
                                  <SelectItem value="SUBMIT_ENTRY">Einträge eingereicht</SelectItem>
                                  <SelectItem value="APPROVE_ENTRY">Einträge freigegeben</SelectItem>
                                  <SelectItem value="CREATE_RESIDENT">Bewohner angelegt</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Activity Stats */}
                            <div className="grid grid-cols-4 gap-4 mb-6">
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold text-primary">{stats.totalActivities}</p>
                                  <p className="text-sm text-gray-500">Gesamt</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold text-orange-500">{stats.todayActivities}</p>
                                  <p className="text-sm text-gray-500">Heute</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold text-blue-500">{stats.entriesCreated}</p>
                                  <p className="text-sm text-gray-500">Einträge</p>
                                </CardContent>
                              </Card>
                              <Card>
                                <CardContent className="p-4 text-center">
                                  <p className="text-2xl font-bold text-green-500">{stats.entriesSubmitted}</p>
                                  <p className="text-sm text-gray-500">Eingereicht</p>
                                </CardContent>
                              </Card>
                            </div>

                            {/* Activity Timeline */}
                            <div className="space-y-3">
                              {logsLoading ? (
                                <p className="text-center text-gray-500">Lade Aktivitäten...</p>
                              ) : (
                                getUserActivities(u.id).map((activity: any) => (
                                  <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                      {getActivityIcon(activity.action)}
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-800">
                                        {getActionDescription(activity.action, activity.metadata)}
                                      </p>
                                      <div className="flex items-center gap-4 mt-1">
                                        <span className="text-xs text-gray-500">
                                          {new Date(activity.timestamp).toLocaleString('de-DE', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                        {activity.ipAddress && (
                                          <span className="text-xs text-gray-400">
                                            IP: {activity.ipAddress}
                                          </span>
                                        )}
                                      </div>
                                      {activity.metadata?.details && (
                                        <p className="text-xs text-gray-600 mt-1">
                                          {JSON.stringify(activity.metadata.details)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}