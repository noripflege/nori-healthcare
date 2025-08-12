import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function Impressum() {
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
            <CardTitle className="text-2xl">Impressum</CardTitle>
            <CardDescription>
              Angaben gemäß § 5 TMG und § 55 RfStV
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Anbieter</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Nori Pflegeassistenz GmbH</strong></p>
                <p>Musterstraße 123</p>
                <p>1010 Wien, Österreich</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Kontakt</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Telefon:</strong> +43 1 234 5678</p>
                <p><strong>E-Mail:</strong> kontakt@nori.app</p>
                <p><strong>Website:</strong> www.nori.app</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Geschäftsführung</h3>
              <div className="space-y-1 text-sm">
                <p>Max Mustermann</p>
                <p>Maria Musterfrau</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Handelsregister</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Registergericht:</strong> Handelsgericht Wien</p>
                <p><strong>Registernummer:</strong> FN 123456x</p>
                <p><strong>UID-Nummer:</strong> ATU12345678</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Aufsichtsbehörde</h3>
              <div className="space-y-1 text-sm">
                <p>Bundesministerium für Soziales, Gesundheit, Pflege und Konsumentenschutz</p>
                <p>Stubenring 1, 1010 Wien</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Berufsbezeichnung</h3>
              <div className="space-y-1 text-sm">
                <p>Softwareentwicklung und digitale Pflegedokumentation</p>
                <p>Verliehen in: Österreich</p>
                <p>Berufsrechtliche Regelungen: Gewerbeordnung (GewO)</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Haftungsausschluss</h3>
              <div className="space-y-2 text-sm">
                <p><strong>Haftung für Inhalte:</strong></p>
                <p>Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.</p>
                
                <p><strong>Haftung für Links:</strong></p>
                <p>Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.</p>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Urheberrecht</h3>
              <div className="space-y-2 text-sm">
                <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem österreichischen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-xs text-gray-500">
                Stand: August 2025 | Nori Pflegeassistenz - Digitale Pflegedokumentation für Österreich
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}