import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

export function HelpButton() {
  const [, navigate] = useLocation();
  const [location] = useLocation();

  // Don't show on login page
  if (location === "/" || location === "/login") {
    return null;
  }

  const handleHelpClick = () => {
    navigate("/user-manual");
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleHelpClick}
            size="sm"
            variant="ghost"
            className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-40 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200 hover:bg-white hover:shadow-xl transition-all duration-200 text-gray-600 hover:text-primary"
          >
            <HelpCircle className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left" className="text-sm">
          <p>Hilfe & Dokumentation</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}