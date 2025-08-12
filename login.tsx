import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Database } from "lucide-react";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("pflege@nori.app");
  const [code, setCode] = useState("");
  const { toast } = useToast();
  const { login, user, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate("/dashboard");
    }
  }, [user, isLoading, navigate]);

  const loginMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Important for session cookies
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Anmeldung fehlgeschlagen");
      }
      
      return response.json();
    },
    onSuccess: async (data) => {
      console.log("Login successful, setting user:", data.user);
      login(data.user);
      
      // Request push notification permission after successful login
      if ('Notification' in window && 'serviceWorker' in navigator) {
        try {
          const permission = await Notification.requestPermission();
          if (permission === 'granted') {
            console.log('Notification permission granted');
          }
        } catch (error) {
          console.log('Error requesting notification permission:', error);
        }
      }
      
      navigate("/dashboard");
      
      // Scroll to top immediately after successful login
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
      
      toast({
        title: "Anmeldung erfolgreich",
        description: `Willkommen zurück, ${data.user.name}!`,
        duration: 1600, // Extended to 1.6 seconds
      });
    },
    onError: (error: Error) => {
      console.error("Login failed:", error);
      toast({
        title: "Anmeldung fehlgeschlagen",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "E-Mail erforderlich",
        description: "Bitte geben Sie Ihre E-Mail-Adresse ein.",
        variant: "destructive",
      });
      return;
    }

    // For demo purposes, we'll accept any code
    if (!code || code.length !== 6) {
      toast({
        title: "Ungültiger Code",
        description: "Bitte geben Sie einen 6-stelligen Code ein.",
        variant: "destructive",
      });
      return;
    }

    loginMutation.mutate({ email });
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col justify-center px-6 py-8">
      <div className="w-full max-w-sm mx-auto">
        {/* App Logo & Title */}
        <div className="text-center mb-8 mt-6">
          <div className="w-20 h-20 bg-white rounded-2xl mx-auto mb-6 flex items-center justify-center overflow-hidden shadow-sm">
            <img 
              src="/icons/nori-logo-clean.png" 
              alt="Nori Logo" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Nori</h1>
          <p className="text-white/90 text-lg">Willkommen bei Nori – Ihrem digitalen Pflegeassistenten</p>
        </div>
        
        {/* Login Form */}
        <Card className="shadow-card">
          <CardContent className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              Anmeldung
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700 mb-2">
                  E-Mail-Adresse eingeben
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-4 text-base"
                  placeholder="ihre.email@beispiel.de"
                />
              </div>
              
              <div>
                <Label htmlFor="code" className="text-sm font-medium text-gray-700 mb-2">
                  Einmal-Code
                </Label>
                <Input
                  id="code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="6-stelliger Code"
                  className="w-full px-4 py-4 text-base text-center text-2xl tracking-widest"
                  maxLength={6}
                />
              </div>
              
              <Button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-4 text-lg font-medium"
              >
                {loginMutation.isPending ? "Code wird gesendet..." : "Login-Code senden"}
              </Button>
            </form>
            
          </CardContent>
        </Card>

        {/* Support Contact Section */}
        <div className="mt-6 p-6 bg-gray-100 rounded-lg border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Support & Kontakt</h3>
          <div className="space-y-3 text-center">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span className="text-sm">support@nori-pflege.de</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
              <span className="text-sm">+43 1 234 5678</span>
            </div>
            
            <div className="text-xs text-gray-500 mt-3">
              Mo-Fr 8:00-18:00 Uhr · Technischer Support
            </div>
          </div>
        </div>

        {/* Security Banner */}
        <div className="mt-6 mb-6 text-center">
          <p className="text-white/80 text-sm">
            🔒 EU-Server · Verschlüsselt · Zugriff nur für Berechtigte (2-Faktor)
          </p>
        </div>

        {/* Legal Links Footer */}
        <div className="text-center mt-8 pt-6 border-t border-white/20">
          <div className="flex flex-wrap justify-center gap-4 text-xs text-white/60">
            <Link href="/impressum" className="hover:text-white/80 transition-colors">
              Impressum
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/privacy-policy" className="hover:text-white/80 transition-colors">
              Datenschutz
            </Link>
            <span className="text-white/30">|</span>
            <Link href="/terms-of-service" className="hover:text-white/80 transition-colors">
              Nutzungsbedingungen
            </Link>
          </div>
          <div className="mt-2 text-xs text-white/40">
            © 2025 Nori Pflegeassistenz GmbH. Alle Rechte vorbehalten.
          </div>
        </div>

      </div>
    </div>
  );
}
