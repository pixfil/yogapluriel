"use client";

import { useState } from 'react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase-browser';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { checkAdminAccess } from '@/app/actions/auth';
import Image from 'next/image';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // Check if user has admin access using server action (bypasses RLS)
      const accessCheck = await checkAdminAccess(data.user!.id);

      if (!accessCheck.hasAccess) {
        await supabase.auth.signOut();
        setError(accessCheck.error || 'Accès non autorisé');
        return;
      }

      // Redirect to admin dashboard
      router.push('/admin');

    } catch (error) {
      setError('Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>

      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow/10 rounded-full blur-3xl"></div>
      </div>

      {/* Login card with glassmorphism */}
      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo and title */}
        <div className="text-center">
          <div className="mx-auto w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg mb-6">
            <Image
              src="/formdetoit_logo_noir.webp"
              alt="FormDeToit"
              width={80}
              height={80}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2">
            Connexion
          </h2>
          <p className="text-gray-300">
            Accès sécurisé à l'administration
          </p>
        </div>

        {/* Glassmorphism form */}
        <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-500/50 p-4">
                <div className="text-sm text-red-200">{error}</div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Adresse email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow focus:border-transparent transition-all sm:text-sm"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-4 py-3 pr-12 bg-white/10 backdrop-blur-sm border border-white/20 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow focus:border-transparent transition-all sm:text-sm"
                    placeholder="Votre mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center hover:opacity-80 transition-opacity"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-300" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-300" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-yellow hover:text-yellow-400 transition-colors font-medium"
                onClick={() => {
                  // TODO: Implement forgot password functionality
                  alert('Fonctionnalité de récupération de mot de passe à venir. Contactez l\'administrateur système.');
                }}
              >
                Mot de passe oublié ?
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-black bg-yellow hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-yellow/50"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Se connecter
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-gray-400">
              © 2025 FormDeToit - Accès réservé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
