"use client";

import Link from "next/link";
import { ExternalLink, User, Wrench } from "lucide-react";
import { usePathname } from "next/navigation";

interface AdminHeaderProps {
  user?: {
    email?: string;
    name?: string;
  };
  maintenanceMode?: boolean;
}

export default function AdminHeader({ user, maintenanceMode = false }: AdminHeaderProps) {
  const pathname = usePathname();

  // Extract page title from pathname
  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    const segments = pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1];

    const titles: Record<string, string> = {
      "projects": "Projets",
      "categories": "Catégories",
      "team": "Équipe",
      "jobs": "Recrutement",
      "inbox": "Messages",
      "email-logs": "Logs d'emails",
      "accounts": "Utilisateurs",
      "redirections": "Redirections",
      "404-tracking": "Suivi 404",
      "lexique": "Lexique",
      "certifications": "Certifications",
      "faq": "FAQ",
      "pages": "Pages & SEO",
      "settings": "Paramètres",
    };

    return titles[lastSegment] || lastSegment;
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (user?.name) {
      return user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Page title - hidden on mobile when sidebar is visible */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-gray-900 truncate lg:text-2xl">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4 ml-4">
            {/* Maintenance mode badge */}
            {maintenanceMode && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-100 border border-orange-300 rounded-lg">
                <Wrench className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-700 hidden sm:inline">
                  Mode Maintenance
                </span>
              </div>
            )}

            {/* View Site link */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="hidden sm:inline">Voir le site</span>
            </Link>

            {/* User profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.name || user?.email?.split("@")[0] || "Administrateur"}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-yellow flex items-center justify-center text-black font-semibold">
                {getUserInitials()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
