"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  // Site
  FolderOpen,
  Users,
  Briefcase,
  FileText,
  Megaphone,
  // Savoir
  BookOpen,
  Shield,
  HelpCircle,
  // Système
  Send,
  User as UserIcon,
  ArrowRightLeft,
  AlertTriangle,
  Settings,
  Mail,
} from 'lucide-react';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface NavSection {
  name: string;
  items: NavItem[];
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
}

export default function AdminSidebarNew() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    site: true,
    savoir: true,
    systeme: false,
  });

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const sections: Record<string, NavSection> = {
    site: {
      name: 'Site',
      items: [
        { name: 'Projets', href: '/admin/projects', icon: FolderOpen },
        { name: 'Équipe', href: '/admin/team', icon: Users },
        { name: 'Recrutement', href: '/admin/jobs', icon: Briefcase },
        { name: 'Inbox', href: '/admin/inbox', icon: Mail },
        { name: 'Pages', href: '/admin/pages', icon: FileText },
        { name: 'Popups', href: '/admin/popups', icon: Megaphone },
      ]
    },
    savoir: {
      name: 'Ressources',
      items: [
        { name: 'Lexique', href: '/admin/lexique', icon: BookOpen },
        { name: 'Certifications', href: '/admin/certifications', icon: Shield },
        { name: 'FAQ', href: '/admin/faq', icon: HelpCircle },
      ]
    },
    systeme: {
      name: 'Système',
      items: [
        { name: 'Email Logs', href: '/admin/email-logs', icon: Send },
        { name: 'Utilisateurs', href: '/admin/accounts', icon: UserIcon },
        { name: 'Redirections', href: '/admin/redirections', icon: ArrowRightLeft },
        { name: 'Suivi 404', href: '/admin/404-tracking', icon: AlertTriangle },
        { name: 'Paramètres', href: '/admin/settings', icon: Settings },
      ]
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-md bg-white shadow-md border border-gray-200"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>
      </div>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 px-4 bg-yellow">
            <Link href="/admin" className="flex items-center">
              <div className="relative w-10 h-10 flex-shrink-0 bg-white rounded-full p-1.5 shadow-sm">
                <Image
                  src="/formdetoit_logo_noir.webp"
                  alt="FormDeToit"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <span className="ml-2 text-xl font-bold text-black">FORMDETOIT</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {/* Dashboard (always visible) */}
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${pathname === '/admin'
                  ? 'bg-yellow text-black'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }
              `}
            >
              <Home className="w-5 h-5 mr-3" />
              Dashboard
            </Link>

            {/* Site Section */}
            <div className="pt-2">
              <button
                onClick={() => toggleSection('site')}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span>{sections.site.name}</span>
                {expandedSections.site ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {expandedSections.site && (
                <div className="mt-1 space-y-1">
                  {sections.site.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                          ${isActive
                            ? 'bg-yellow text-black'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Savoir Section */}
            <div className="pt-2">
              <button
                onClick={() => toggleSection('savoir')}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span>{sections.savoir.name}</span>
                {expandedSections.savoir ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {expandedSections.savoir && (
                <div className="mt-1 space-y-1">
                  {sections.savoir.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                          ${isActive
                            ? 'bg-yellow text-black'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Système Section */}
            <div className="pt-2">
              <button
                onClick={() => toggleSection('systeme')}
                className="flex items-center justify-between w-full px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span>{sections.systeme.name}</span>
                {expandedSections.systeme ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              {expandedSections.systeme && (
                <div className="mt-1 space-y-1">
                  {sections.systeme.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`
                          flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors
                          ${isActive
                            ? 'bg-yellow text-black'
                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        {item.name}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* Sign out button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Se déconnecter
            </button>
          </div>

          {/* Footer */}
          <div className="p-4 text-center border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Administration Formdetoit
            </p>
            <p className="text-xs text-gray-400">
              Version 1.0.0
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
