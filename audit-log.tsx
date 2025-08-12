import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, CheckCircle, UserPlus, Edit, FileImage } from "lucide-react";

export default function AuditLog() {
  const [, navigate] = useLocation();

  const { data: auditLogs = [], isLoading } = useQuery({
    queryKey: ["/api/audit-logs"],
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "LOGIN":
        return <UserPlus className="text-blue-500 text-sm" />;
      case "CREATE_ENTRY":
        return <FileText className="text-primary text-sm" />;
      case "UPDATE_ENTRY":
        return <Edit className="text-yellow-500 text-sm" />;
      case "SUBMIT_ENTRY":
        return <FileImage className="text-orange-500 text-sm" />;
      case "APPROVE_ENTRY":
        return <CheckCircle className="text-green-500 text-sm" />;
      case "CREATE_RESIDENT":
        return <UserPlus className="text-blue-500 text-sm" />;
      case "UPDATE_RESIDENT":
        return <Edit className="text-yellow-500 text-sm" />;
      case "DELETE_RESIDENT":
        return <UserPlus className="text-red-500 text-sm" />;
      default:
        return <FileText className="text-primary text-sm" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "LOGIN":
        return "Anmeldung";
      case "CREATE_ENTRY":
        return "Pflegebericht erstellt";
      case "UPDATE_ENTRY":
        return "Pflegebericht bearbeitet";
      case "SUBMIT_ENTRY":
        return "Zur Freigabe eingereicht";
      case "APPROVE_ENTRY":
        return "Bericht freigegeben";
      case "CREATE_RESIDENT":
        return "Bewohner angelegt";
      case "UPDATE_RESIDENT":
        return "Bewohner bearbeitet";
      case "DELETE_RESIDENT":
        return "Bewohner gelöscht";
      default:
        return action;
    }
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 py-4">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/settings")}
            className="text-gray-400 hover:text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-800">Audit-Log</h1>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Lade Audit-Log...</p>
          </div>
        ) : auditLogs.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500">Keine Audit-Einträge vorhanden.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {auditLogs.map((log: any) => (
              <Card key={log.id} className="shadow-soft">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                      {getActionIcon(log.action)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-800">
                        {getActionLabel(log.action)}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {log.description}
                        {log.metadata?.residentName && (
                          <> für {log.metadata.residentName}</>
                        )}
                      </p>
                      <div className="flex flex-wrap items-center mt-2 text-xs text-gray-400 space-x-4">
                        <span>
                          {new Date(log.timestamp).toLocaleString('de-DE')}
                        </span>
                        <span>{log.user?.name}</span>
                        {log.ipAddress && (
                          <span>IP: {log.ipAddress}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
