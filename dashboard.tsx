import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Users, Clock, Mic, Settings, FileText, CheckCircle, Plus, AlertTriangle } from "lucide-react";

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  // Scroll to top when dashboard loads
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const { data: stats } = useQuery({
    queryKey: ["/api/stats"],
  });

  const { data: activities } = useQuery({
    queryKey: ["/api/audit-logs"],
    select: (data: any) => {
      if (!Array.isArray(data)) return [];
      
      // Filter for relevant activities and user-specific ones
      const relevantActivities = data.filter((activity: any) => {
        // Show all activities for lead/admin, only user's own for caregiver
        if (user?.role === 'lead' || user?.role === 'admin') {
          return ['CREATE_ENTRY', 'APPROVE_ENTRY', 'REJECT_ENTRY', 'CREATE_RESIDENT', 'UPDATE_RESIDENT', 'SUBMIT_ENTRY'].includes(activity.action);
        } else {
          return activity.userId === user?.id && 
                 ['CREATE_ENTRY', 'SUBMIT_ENTRY', 'CREATE_RESIDENT', 'UPDATE_RESIDENT'].includes(activity.action);
        }
      });
      
      return relevantActivities.slice(0, 5); // Show only recent 5 relevant activities
    },
  });

  const getActivityIcon = (action: string) => {
    switch (action) {
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

  const getActivityDescription = (activity: any) => {
    const residentName = activity.metadata?.residentName ? ` für ${activity.metadata.residentName}` : '';
    const userName = (user?.role === 'lead' || user?.role === 'admin') && activity.user?.name && activity.userId !== user?.id 
      ? ` (${activity.user.name})` : '';
    
    switch (activity.action) {
      case "CREATE_ENTRY":
        return `Neuer Eintrag erstellt${residentName}${userName}`;
      case "SUBMIT_ENTRY":
        return `Eintrag zur Freigabe eingereicht${residentName}${userName}`;
      case "APPROVE_ENTRY":
        return `Eintrag freigegeben${residentName}${userName}`;
      case "REJECT_ENTRY":
        return `Eintrag abgelehnt${residentName}${userName}`;
      case "CREATE_RESIDENT":
        return `Neuer Bewohner angelegt${residentName}${userName}`;
      case "UPDATE_RESIDENT":
        return `Bewohner aktualisiert${residentName}${userName}`;
      default:
        return activity.description || 'Aktivität';
    }
  };

  // Component for missing documentation alert
  function MissingDocumentationAlert() {
    const { data: residents = [] } = useQuery({
      queryKey: ["/api/residents"],
    });

    const { data: entries = [] } = useQuery({
      queryKey: ["/api/entries"],
    });

    const today = new Date().toISOString().split('T')[0];
    const residentsData = Array.isArray(residents) ? residents : [];
    const entriesData = Array.isArray(entries) ? entries : [];
    
    // Find residents without approved (final) documentation today
    // AND residents with only draft entries (saved but not submitted)
    const residentsWithoutTodayEntry = residentsData.filter((resident: any) => {
      const todayEntries = entriesData.filter((entry: any) => 
        entry.residentId === resident.id && 
        entry.createdAt?.startsWith(today)
      );
      
      // No entries today OR only draft entries (not submitted for approval)
      return todayEntries.length === 0 || 
             todayEntries.every((entry: any) => entry.status === 'draft');
    });

    if (residentsWithoutTodayEntry.length === 0) return null;

    // Count different types of missing documentation
    const draftOnlyCount = residentsData.filter((resident: any) => {
      const todayEntries = entriesData.filter((entry: any) => 
        entry.residentId === resident.id && 
        entry.createdAt?.startsWith(today)
      );
      return todayEntries.length > 0 && todayEntries.every((entry: any) => entry.status === 'draft');
    }).length;

    const noDocs = residentsWithoutTodayEntry.length - draftOnlyCount;

    return (
      <Card className="shadow-soft border-amber-200 bg-amber-50/50">
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="text-amber-600 w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-xs font-medium text-amber-800 mb-1 truncate">
                Fehlende Dokumentation
              </h3>
              <p className="text-[10px] text-amber-700 leading-tight">
                {residentsWithoutTodayEntry.length} Bewohner heute ohne Dokumentation!
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs px-2 py-1 h-auto"
              onClick={() => navigate("/residents?highlight=missing-docs")}
            >
              Zeigen
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Übersicht</h1>
            <p className="text-sm text-gray-500">{user?.name}, {
              user?.role === 'lead' ? 'Pflegeleitung' : 
              user?.role === 'super_admin' ? 'Super Admin' : 
              'Pflegekraft'
            }</p>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'super_admin' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/super-admin")}
                className="text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300"
              >
                Admin Panel
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/settings")}
              className="text-gray-400 hover:text-primary"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6 space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="shadow-soft cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate("/residents")}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="text-primary w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-gray-800">
                    {(stats as any)?.residents || 0}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight whitespace-nowrap">
                    Bewohner
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-soft cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
            if (user?.role === 'caregiver') {
              // Navigate to entries with filter for draft/pending entries
              navigate("/review?filter=my-entries");
            } else {
              navigate("/review"); // Navigate to review for admin/lead
            }
          }}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="text-orange-500 w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xl font-bold text-gray-800">
                    {(stats as any)?.pendingEntries || 0}
                  </p>
                  <p className="text-[10px] text-gray-500 leading-tight whitespace-nowrap overflow-hidden">
                    {user?.role === 'caregiver' ? 'In Bearbeitung' : 'Zur Freigabe'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => navigate("/recording")}
            className="h-auto p-4 flex-col space-y-2 bg-primary hover:bg-primary-dark"
          >
            <Mic className="w-6 h-6" />
            <span className="text-sm font-medium">Neuer Eintrag</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/residents")}
            className="h-auto p-4 flex-col space-y-2 border-2 border-primary text-primary hover:bg-primary/10"
          >
            <Users className="w-6 h-6" />
            <span className="text-sm font-medium">Bewohner</span>
          </Button>
        </div>

        {/* Missing Documentation Alert */}
        <MissingDocumentationAlert />

        {/* Recent Activities - Below Quick Actions */}
        <Card className="shadow-soft">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">Letzte Aktivitäten</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {activities?.length ? (
              activities.map((activity: any) => (
                <div key={activity.id} className="p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {getActivityIcon(activity.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('de-DE', {
                          day: '2-digit',
                          month: '2-digit', 
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                Keine Aktivitäten vorhanden
              </div>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}
