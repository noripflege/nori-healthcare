import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function PrivacyPolicy() {
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
            <CardTitle className="text-2xl">Datenschutzerklärung</CardTitle>
            <CardDescription>
              Gemäß DSGVO und österreichischem Datenschutzgesetz (DSG)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">1. Verantwortlicher</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nori Pflegeassistenz GmbH</strong></p>
                <p>Musterstraße 123, 1010 Wien, Österreich</p>
                <p>E-Mail: datenschutz@nori.app</p>
                <p>Telefon: +43 1 234 5678</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">2. Datenschutzbeauftragter</h3>
              <div className="space-y-1 text-sm">
                <p>Max Mustermann</p>
                <p>E-Mail: datenschutz@nori.app</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">3. Art der verarbeiteten Daten</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Personenbezogene Daten der Nutzer:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Name, E-Mail-Adresse, Benutzerrollen</li>
                  <li>Anmelde- und Aktivitätsdaten</li>
                  <li>IP-Adressen für Sicherheitsprotokolle</li>
                </ul>
                
                <p><strong>Pflegedaten (besondere Kategorien):</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Bewohnerdaten (Name, Geburtsdatum, Zimmernummer)</li>
                  <li>Gesundheitsdaten, Vitalwerte, Medikation</li>
                  <li>Pflegeberichte und Dokumentationen</li>
                  <li>Sprachaufnahmen für Transkription</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">4. Rechtsgrundlagen der Verarbeitung</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Art. 6 Abs. 1 lit. b DSGVO:</strong> Vertragserfüllung für Pflegedokumentation</li>
                  <li><strong>Art. 9 Abs. 2 lit. h DSGVO:</strong> Gesundheitsvorsorge und Behandlung</li>
                  <li><strong>Art. 6 Abs. 1 lit. f DSGVO:</strong> Berechtigtes Interesse für Systemsicherheit</li>
                  <li><strong>Art. 6 Abs. 1 lit. c DSGVO:</strong> Rechtliche Verpflichtung (Pflegedokumentation)</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">5. Zwecke der Datenverarbeitung</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Bereitstellung der digitalen Pflegedokumentation</li>
                  <li>Erfüllung gesetzlicher Dokumentationspflichten</li>
                  <li>Qualitätssicherung der Pflege</li>
                  <li>Systemsicherheit und Audit-Protokollierung</li>
                  <li>KI-gestützte Transkription für effiziente Dokumentation</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">6. Empfänger der Daten</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Externe Dienstleister (Auftragsverarbeiter):</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Deepgram (Spracherkennung) - USA, angemessenes Datenschutzniveau</li>
                  <li>OpenAI (KI-Verarbeitung) - USA, angemessenes Datenschutzniveau</li>
                  <li>Neon Database (Hosting) - EU, DSGVO-konform</li>
                </ul>
                <p>Alle Auftragsverarbeiter sind durch entsprechende Verträge gebunden.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">7. Speicherdauer</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Pflegedokumentation:</strong> 30 Jahre (gem. österreichischem Pflegegesetz)</li>
                  <li><strong>Benutzerkonten:</strong> Bis zur Kündigung des Vertrags</li>
                  <li><strong>Audit-Logs:</strong> 7 Jahre (Aufbewahrungspflicht)</li>
                  <li><strong>Sprachaufnahmen:</strong> Nach Transkription gelöscht (max. 30 Tage)</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">8. Ihre Rechte</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Auskunftsrecht (Art. 15 DSGVO):</strong> Information über verarbeitete Daten</li>
                  <li><strong>Berichtigungsrecht (Art. 16 DSGVO):</strong> Korrektur unrichtiger Daten</li>
                  <li><strong>Löschungsrecht (Art. 17 DSGVO):</strong> Unter bestimmten Voraussetzungen</li>
                  <li><strong>Einschränkung (Art. 18 DSGVO):</strong> Beschränkung der Verarbeitung</li>
                  <li><strong>Datenübertragbarkeit (Art. 20 DSGVO):</strong> Daten in strukturiertem Format</li>
                  <li><strong>Widerspruchsrecht (Art. 21 DSGVO):</strong> Gegen Verarbeitung aus berechtigtem Interesse</li>
                </ul>
                <p className="mt-2">Kontakt für Rechtsausübung: datenschutz@nori.app</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">9. Beschwerderecht</h3>
              <div className="space-y-2 text-sm">
                <p>Sie haben das Recht, sich bei der österreichischen Datenschutzbehörde zu beschweren:</p>
                <p><strong>Datenschutzbehörde Österreich</strong></p>
                <p>Barichgasse 40-42, 1030 Wien</p>
                <p>E-Mail: dsb@dsb.gv.at</p>
                <p>Telefon: +43 1 52 152-0</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">10. Technische und organisatorische Maßnahmen</h3>
              <div className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Ende-zu-Ende-Verschlüsselung aller Datenübertragungen</li>
                  <li>Sichere Authentifizierung mit Multi-Faktor-Verfahren</li>
                  <li>Regelmäßige Sicherheits-Audits und Penetrationstests</li>
                  <li>Strikte Zugriffskontrollen nach Principle of Least Privilege</li>
                  <li>Automatische Audit-Protokollierung aller Systemzugriffe</li>
                  <li>Regelmäßige Mitarbeiterschulungen zum Datenschutz</li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">11. Automatisierte Entscheidungsfindung</h3>
              <div className="space-y-2 text-sm">
                <p>Unsere KI-Systeme unterstützen bei der Pflegedokumentation, treffen jedoch keine automatisierten Entscheidungen über die Pflege. Alle medizinischen und pflegerischen Entscheidungen werden ausschließlich von qualifiziertem Personal getroffen.</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Stand: August 2025 | Diese Datenschutzerklärung wird regelmäßig überprüft und bei Bedarf aktualisiert.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}