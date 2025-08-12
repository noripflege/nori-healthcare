import { useLocation } from "wouter";
import { Home, Users, Mic, ClipboardCheck, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth";

const navigationItems = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
    label: "Bewohner",
    path: "/residents",
    icon: Users,
  },
  {
    label: "Aufnahme",
    path: "/recording",
    icon: Mic,
    special: true,
  },
  {
    label: "Freigabe",
    path: "/review",
    icon: ClipboardCheck,
    roles: ["lead"],
  },

  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];

export default function BottomNavigation() {
  const [location, navigate] = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Don't show navigation on login page or if not authenticated
  if (!isAuthenticated || location === "/" || location === "/login") {
    return null;
  }

  // Filter items based on user role
  const visibleItems = navigationItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 z-50">
      <div className="flex justify-around">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;

          if (item.special) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center space-y-1"
              >
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-lg -mt-2">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-medium text-gray-600">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center space-y-1 transition-colors ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
