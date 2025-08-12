import { Resident } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, AlertTriangle } from "lucide-react";
import { formatDateGerman, getAgeFromBirthDate } from "@/lib/date-formatter";

interface ResidentCardProps {
  resident: Resident;
  onEdit: (resident: Resident) => void;
  highlightMissing?: boolean;
}

export default function ResidentCard({ resident, onEdit, highlightMissing = false }: ResidentCardProps) {
  const initials = resident.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  const age = getAgeFromBirthDate(resident.dateOfBirth);
  const formattedDate = formatDateGerman(resident.dateOfBirth) || resident.dateOfBirth;

  return (
    <Card className={`shadow-soft ${highlightMissing ? 'border-amber-300 bg-amber-50/30' : ''}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              highlightMissing ? 'bg-amber-100' : 'bg-primary/20'
            }`}>
              {highlightMissing ? (
                <AlertTriangle className="text-amber-600 w-6 h-6" />
              ) : (
                <span className="text-primary font-semibold">{initials}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-800">{resident.name}</h3>
                {highlightMissing && (
                  <Badge variant="outline" className="text-xs border-amber-400 text-amber-700">
                    Dokumentation fehlt
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-500">
                Zimmer {resident.room} • *{formattedDate}
                {age !== null && ` (${age} Jahre)`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant={resident.status === "active" ? "default" : "secondary"}
              className={resident.status === "active" ? "bg-green-100 text-green-800" : ""}
            >
              {resident.status === "active" ? "Aktiv" : "Inaktiv"}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(resident)}
              className="text-gray-400 hover:text-primary"
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
