import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { offlineManager } from "@/lib/offline-manager";
import EntryCard from "@/components/entry-card";
import { RejectionDialog } from "@/components/rejection-dialog";

export default function Review() {
  const [location, navigate] = useLocation();
  const [statusFilter, setStatusFilter] = useState("eingereicht");

  // Check for filter parameter from dashboard
  useEffect(() => {
    const urlParams = new URLSearchParams(location.split('?')[1] || '');
    const filter = urlParams.get('filter');
    if (filter === 'my-entries') {
      setStatusFilter("meine");
    }
  }, [location]);
  const [approvalDialog, setApprovalDialog] = useState<{ entryId: string; isOpen: boolean }>({
    entryId: "",
    isOpen: false,
  });
  const [rejectionDialog, setRejectionDialog] = useState<{ 
    entryId: string; 
    residentName: string; 
    isOpen: boolean 
  }>({
    entryId: "",
    residentName: "",
    isOpen: false,
  });
  const [comments, setComments] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: entries = [], isLoading } = useQuery({
    queryKey: ["/api/entries", { status: statusFilter }],
    queryFn: () => {
      let status = "";
      let url = "/api/entries";
      
      if (statusFilter === "eingereicht") {
        status = "pending";
        url = `/api/entries?status=${status}`;
      } else if (statusFilter === "freigegeben") {
        status = "final"; 
        url = `/api/entries?status=${status}`;
      } else if (statusFilter === "meine") {
        // Show user's own draft and pending entries
        url = `/api/entries?userId=${user?.id}&status=draft,pending`;
      } else if (statusFilter === "alle") {
        url = "/api/entries";
      }
      
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ entryId, comments }: { entryId: string; comments: string }) => {
      try {
        const response = await apiRequest("POST", `/api/entries/${entryId}/approve`, {
          userId: user?.id,
          comments,
        });
        return response.json();
      } catch (error) {
        // If online request fails, save offline
        console.log('📱 Approval saved offline due to connection issue');
        
        offlineManager.queueAction({
          type: 'APPROVE_ENTRY',
          data: { id: entryId, userId: user?.id, comments }
        });
        
        return { success: true, offline: true };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setApprovalDialog({ entryId: "", isOpen: false });
      setComments("");
      
      if (data?.offline) {
        toast({
          title: "Offline freigegeben",
          description: "Die Freigabe wurde lokal gespeichert und wird synchronisiert sobald eine Verbindung besteht.",
        });
      } else {
        toast({
          title: "Eintrag freigegeben",
          description: "Der Pflegebericht wurde erfolgreich freigegeben und das PDF wurde generiert.",
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Fehler bei der Freigabe",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ entryId, rejectionReason }: { entryId: string; rejectionReason: string }) => {
      try {
        const response = await apiRequest("POST", `/api/entries/${entryId}/reject`, {
          userId: user?.id,
          rejectionReason,
        });
        return response.json();
      } catch (error) {
        // If online request fails, save offline
        console.log('📱 Rejection saved offline due to connection issue');
        
        offlineManager.queueAction({
          type: 'REJECT_ENTRY',
          data: { id: entryId, userId: user?.id, rejectionReason }
        });
        
        return { success: true, offline: true };
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
      setRejectionDialog({ entryId: "", residentName: "", isOpen: false });
      
      if (data?.offline) {
        toast({
          title: "Offline abgelehnt",
          description: "Die Ablehnung wurde lokal gespeichert und wird synchronisiert sobald eine Verbindung besteht.",
        });
      } else {
        toast({
          title: "Eintrag abgelehnt",
          description: "Der Pflegebericht wurde abgelehnt und an die Pflegekraft zurückgeschickt.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({
        title: "Fehler",
        description: "Ablehnung konnte nicht verarbeitet werden.",
        variant: "destructive",
      });
    },
  });

  const handleApproveClick = (entryId: string) => {
    setApprovalDialog({ entryId, isOpen: true });
  };

  const handleApproveConfirm = () => {
    if (approvalDialog.entryId) {
      approveMutation.mutate({
        entryId: approvalDialog.entryId,
        comments,
      });
    }
  };

  const handleRejectClick = (entryId: string, residentName: string) => {
    setRejectionDialog({ entryId, residentName, isOpen: true });
  };

  const handleRejectConfirm = (rejectionReason: string) => {
    if (rejectionDialog.entryId) {
      rejectMutation.mutate({
        entryId: rejectionDialog.entryId,
        rejectionReason,
      });
    }
  };

  const handleViewDetails = (entryId: string) => {
    navigate(`/entries/${entryId}?from=review`);
  };

  // Allow access for both lead and caregiver (caregiver can see their own entries)
  if (user?.role !== "lead" && user?.role !== "caregiver") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Zugriff verweigert</h2>
            <p className="text-gray-600 mb-4">
              Nur Pflegeleitung und Pflegekräfte haben Zugriff auf diese Seite.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Zurück zum Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white shadow-soft px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-800">
            {user?.role === 'caregiver' ? 'Meine Einträge' : 'Freigabe'}
          </h1>
          <div className="flex items-center space-x-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eingereicht">Eingereicht zur Freigabe</SelectItem>
                <SelectItem value="freigegeben">Freigegeben</SelectItem>
                {user?.role === 'caregiver' && (
                  <SelectItem value="meine">Meine Einträge</SelectItem>
                )}
                <SelectItem value="alle">Alle Berichte</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="p-6">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Lade Einträge...</p>
          </div>
        ) : entries.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="p-8 text-center">
              <p className="text-gray-500 mb-4">
                Keine Einträge mit Status "{statusFilter === "alle" ? "beliebig" : 
                  statusFilter === "eingereicht" ? "eingereicht zur Freigabe" :
                  statusFilter === "freigegeben" ? "freigegeben" :
                  statusFilter === "meine" ? "in Bearbeitung" : statusFilter}" gefunden.
              </p>
              <Button onClick={() => navigate("/dashboard")}>
                Zurück zum Dashboard
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry: any) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onViewDetails={handleViewDetails}
                onApprove={handleApproveClick}
                onReject={(entryId) => handleRejectClick(entryId, entry.residentName)}
                showApprovalActions={statusFilter === "eingereicht" && user?.role === "lead"}
              />
            ))}
          </div>
        )}
      </main>

      {/* Approval Dialog */}
      <Dialog 
        open={approvalDialog.isOpen} 
        onOpenChange={(open) => setApprovalDialog({ entryId: "", isOpen: open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pflegebericht freigeben</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="comments" className="text-sm font-medium text-gray-700 mb-2">
                Kommentar (optional)
              </Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Kommentar zur Freigabe..."
                className="h-24 resize-none"
              />
            </div>
            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setApprovalDialog({ entryId: "", isOpen: false })}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleApproveConfirm}
                disabled={approveMutation.isPending}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                {approveMutation.isPending ? "Freigeben..." : "Freigeben"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <RejectionDialog
        isOpen={rejectionDialog.isOpen}
        onClose={() => setRejectionDialog({ entryId: "", residentName: "", isOpen: false })}
        onConfirm={handleRejectConfirm}
        entryId={rejectionDialog.entryId}
        residentName={rejectionDialog.residentName}
      />
    </div>
  );
}
