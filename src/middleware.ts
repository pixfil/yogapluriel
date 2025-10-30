import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // =============================================
  // 1. EXCLUSIONS: Assets, API, fichiers statiques
  // =============================================

  const excludedPaths = ["/_next", "/api", "/public", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

  if (excludedPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  if (pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico|css|js|woff|woff2|ttf|eot)$/i)) {
    return NextResponse.next();
  }

  // =============================================
  // 2. AUTHENTIFICATION ADMIN (routes /admin)
  // =============================================

  if (pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }

    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
            supabaseResponse = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            );
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Check if user is authenticated
    const { data: { user }, error } = await supabase.auth.getUser();

    // If not authenticated, redirect to login
    if (!user || error) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // Check if user has admin access by verifying roles from user_profiles
    // Use service role client to bypass RLS
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const { data: profile } = await serviceClient
      .from('user_profiles')
      .select('roles, status')
      .eq('id', user.id)
      .is('deleted_at', null)
      .single();

    // Verify user has required role (super_admin, admin, or auteur) and is active
    const hasAdminAccess = profile?.status === 'active' &&
      profile?.roles?.some((role: string) =>
        ['super_admin', 'admin', 'auteur'].includes(role)
      );

    if (!hasAdminAccess) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // =============================================
  // 3. MODE MAINTENANCE (routes publiques uniquement)
  // =============================================

  // Skip maintenance check for /maintenance page itself
  if (pathname !== '/maintenance') {
    try {
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll();
            },
            setAll() {
              // No need to set cookies for maintenance check
            },
          },
          auth: {
            autoRefreshToken: false,
            persistSession: false,
            detectSessionInUrl: false,
          },
        }
      );

      const { data: settings } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "maintenance")
        .single();

      if (settings?.value?.enabled === true) {
        const url = request.nextUrl.clone();
        url.pathname = '/maintenance';
        return NextResponse.redirect(url);
      }
    } catch (error) {
      console.error("Middleware maintenance check error:", error);
      // Continue if error checking maintenance mode
    }
  }

  // =============================================
  // 4. REDIRECTIONS 301 (routes publiques)
  // =============================================

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll() {
            // No need to set cookies for redirect lookups
          },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      }
    );

    // Normaliser le path (avec et sans slash final)
    const pathWithSlash = pathname.endsWith("/") ? pathname : `${pathname}/`;
    const pathWithoutSlash = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

    // =============================================
    // ÉTAPE 1: Chercher une redirection EXACTE (priorité haute)
    // =============================================

    const { data: exactRedirect, error: exactError } = await supabase
      .from("redirects")
      .select("*")
      .or(`from_path.eq.${pathWithSlash},from_path.eq.${pathWithoutSlash}`)
      .eq("is_active", true)
      .eq("is_wildcard", false)
      .is("deleted_at", null)
      .maybeSingle();

    if (!exactError && exactRedirect) {
      // Incrémenter le compteur de hits (non-bloquant)
      supabase
        .from("redirects")
        .update({
          hit_count: exactRedirect.hit_count + 1,
          last_hit_at: new Date().toISOString(),
        })
        .eq("id", exactRedirect.id)
        .then(() => {
          console.log(`✓ Exact Redirect: ${exactRedirect.from_path} → ${exactRedirect.to_path}`);
        });

      // Construire l'URL de destination
      const destination = new URL(exactRedirect.to_path, request.url);
      if (search) {
        destination.search = search;
      }

      // Effectuer la redirection
      return NextResponse.redirect(destination, {
        status: exactRedirect.status_code || 301,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      });
    }

    // =============================================
    // ÉTAPE 2: Chercher une redirection WILDCARD (priorité basse)
    // =============================================

    const { data: wildcardRedirects, error: wildcardError } = await supabase
      .from("redirects")
      .select("*")
      .eq("is_active", true)
      .eq("is_wildcard", true)
      .is("deleted_at", null);

    if (!wildcardError && wildcardRedirects && wildcardRedirects.length > 0) {
      // Parcourir les redirections wildcard et trouver la première qui matche
      for (const redirect of wildcardRedirects) {
        const fromPath = redirect.from_path;

        // Vérifier si from_path contient un wildcard
        if (!fromPath.includes('*')) continue;

        // Créer un pattern regex depuis le from_path
        // Ex: /portfolio/* → /^\/portfolio\/.+$/
        const regexPattern = fromPath
          .replace(/\*/g, '(.+)')
          .replace(/\//g, '\\/');

        const regex = new RegExp(`^${regexPattern}$`);

        // Tester avec et sans slash final
        const matchWithSlash = pathWithSlash.match(regex);
        const matchWithoutSlash = pathWithoutSlash.match(regex);
        const match = matchWithSlash || matchWithoutSlash;

        if (match) {
          // Extraire la partie qui correspond au wildcard
          const wildcardValue = match[1] || '';

          // Construire l'URL de destination
          let toPath = redirect.to_path;

          // Si to_path contient aussi un *, remplacer par la valeur capturée
          if (toPath.includes('*')) {
            toPath = toPath.replace('*', wildcardValue);
          }

          // Incrémenter le compteur de hits (non-bloquant)
          supabase
            .from("redirects")
            .update({
              hit_count: redirect.hit_count + 1,
              last_hit_at: new Date().toISOString(),
            })
            .eq("id", redirect.id)
            .then(() => {
              console.log(`✓ Wildcard Redirect: ${fromPath} → ${toPath} (matched: ${pathname})`);
            });

          const destination = new URL(toPath, request.url);
          if (search) {
            destination.search = search;
          }

          // Effectuer la redirection
          return NextResponse.redirect(destination, {
            status: redirect.status_code || 301,
            headers: {
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    }

    // Pas de redirection trouvée, laisser Next.js traiter normalement
    return NextResponse.next();
  } catch (error) {
    console.error("Middleware redirect error:", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};