import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/login">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Zurück zur Anmeldung
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Nutzungsbedingungen</CardTitle>
            <CardDescription>
              Allgemeine Geschäftsbedingungen für Nori Pflegeassistenz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Geltungsbereich</h3>
              <div className="space-y-2 text-sm">
                <p>Diese Nutzungsbedingungen gelten für die Nutzung der Nori Pflegeassistenz Software durch Pflegeeinrichtungen und deren Mitarbeiter in Österreich und Deutschland.</p>
                <p>Mit der Registrierung und Nutzung der Software stimmen Sie diesen Bedingungen zu.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. Leistungsbeschreibung</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Nori Pflegeassistenz bietet:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Digitale Pflegedokumentation gemäß österreichischen Standards</li>
                  <li>KI-gestützte Spracherkennung für effiziente Berichtserstellung</li>
                  <li>Bewohnerverwaltung und Pflegeplanung</li>
                  <li>Automatische Berichterstellung und PDF-Export</li>
                  <li>Offline-Funktionalität für unterbrechungsfreies Arbeiten</li>
                  <li>Audit-Protokollierung für Compliance</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. Registrierung und Zugangsberechtigung</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Die Nutzung ist ausschließlich qualifizierten Pflegekräften und Pflegeleitungen vorbehalten</li>
                  <li>Jeder Nutzer erhält individuelle Zugangsdaten, die vertraulich zu behandeln sind</li>
                  <li>Die Weitergabe von Zugangsdaten an Dritte ist untersagt</li>
                  <li>Pflegeeinrichtungen sind für die ordnungsgemäße Nutzerverwaltung verantwortlich</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">4. Pflichten der Nutzer</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Als Nutzer verpflichten Sie sich:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Die Software nur für rechtmäßige Zwecke zu verwenden</li>
                  <li>Wahrheitsgemäße und vollständige Pflegedokumentation zu erstellen</li>
                  <li>Datenschutz und ärztliche Schweigepflicht zu wahren</li>
                  <li>Keine schädlichen Inhalte oder Malware hochzuladen</li>
                  <li>Systemressourcen nicht zu missbrauchen</li>
                  <li>Bei Verdacht auf Sicherheitsverletzungen uns umgehend zu informieren</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">5. Verfügbarkeit und Support</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Verfügbarkeit:</strong> Wir streben eine Verfügbarkeit von 99,9% an</li>
                  <li><strong>Wartungszeiten:</strong> Werden rechtzeitig angekündigt</li>
                  <li><strong>Support:</strong> Montag bis Freitag, 8:00 - 18:00 Uhr</li>
                  <li><strong>Notfall-Support:</strong> 24/7 für kritische Systemausfälle</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">6. Preise und Zahlungsbedingungen</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Preise gelten entsprechend der aktuellen Preisliste</li>
                  <li>Monatliche Abrechnung per Rechnung</li>
                  <li>Zahlungsziel: 14 Tage nach Rechnungsstellung</li>
                  <li>Bei Zahlungsverzug können Mahngebühren anfallen</li>
                  <li>Preisänderungen werden 3 Monate im Voraus angekündigt</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">7. Kündigung</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Ordentliche Kündigung:</strong> Mit einer Frist von 3 Monaten zum Monatsende</li>
                  <li><strong>Außerordentliche Kündigung:</strong> Bei schwerwiegenden Vertragsverletzungen</li>
                  <li><strong>Datenexport:</strong> Möglichkeit des Datenexports bis 30 Tage nach Kündigung</li>
                  <li><strong>Datenlöschung:</strong> Erfolgt nach Ablauf gesetzlicher Aufbewahrungsfristen</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">8. Datenschutz und Datensicherheit</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Vollständige DSGVO-Konformität und österreichisches Datenschutzrecht</li>
                  <li>Ende-zu-Ende-Verschlüsselung aller Datenübertragungen</li>
                  <li>Sichere Datenspeicherung in EU-Rechenzentren</li>
                  <li>Regelmäßige Sicherheitsaudits und Penetrationstests</li>
                  <li>Detaillierte Datenschutzerklärung verfügbar</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">9. Haftung und Gewährleistung</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Wir haften nicht für Schäden durch unsachgemäße Nutzung</li>
                  <li>Die Haftung für leichte Fahrlässigkeit ist ausgeschlossen</li>
                  <li>Bei Vorsatz und grober Fahrlässigkeit haften wir uneingeschränkt</li>
                  <li>Die Haftung für Personenschäden bleibt unberührt</li>
                  <li>Nutzer sind für die medizinische Korrektheit ihrer Dokumentation verantwortlich</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">10. Geistiges Eigentum</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Alle Rechte an der Software verbleiben bei Nori Pflegeassistenz GmbH</li>
                  <li>Nutzer erhalten ein nicht-exklusives Nutzungsrecht</li>
                  <li>Reverse Engineering, Dekompilierung ist untersagt</li>
                  <li>Pflegedaten bleiben Eigentum der Pflegeeinrichtung</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">11. Änderungen der Nutzungsbedingungen</h3>
              <div className="space-y-2 text-sm">
                <p>Änderungen dieser Nutzungsbedingungen werden mindestens 4 Wochen im Voraus per E-Mail angekündigt. Widersprechen Sie nicht innerhalb von 4 Wochen, gelten die neuen Bedingungen als angenommen.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">12. Anwendbares Recht und Gerichtsstand</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Es gilt österreichisches Recht unter Ausschluss des UN-Kaufrechts</li>
                  <li>Gerichtsstand ist Wien für alle Streitigkeiten</li>
                  <li>Verbraucher können auch an ihrem Wohnsitz klagen</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">13. Salvatorische Klausel</h3>
              <div className="space-y-2 text-sm">
                <p>Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Stand: August 2025 | Nori Pflegeassistenz GmbH | Kontakt: kontakt@nori.app
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}