import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * API Route publique pour enregistrer les erreurs 404
 * Appelée automatiquement par la page not-found.tsx
 */
export async function POST(request: NextRequest) {
  try {
    const { path, referrer, userAgent } = await request.json();

    // Validation basique
    if (!path || typeof path !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid path parameter" },
        { status: 400 }
      );
    }

    // Utiliser le service role client pour bypasser RLS
    // La fonction log_404() a SECURITY DEFINER et peut être appelée publiquement
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Extraire l'IP du client
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Appeler la fonction SQL log_404
    // Cette fonction fait un UPSERT : crée ou incrémente le compteur
    const { error } = await supabase.rpc("log_404", {
      p_path: path,
      p_referrer: referrer || null,
      p_user_agent: userAgent || null,
      p_ip_address: ip,
    });

    if (error) {
      console.error("Error calling log_404 function:", error);
      throw error;
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error in POST /api/log-404:", error);
    // Ne pas renvoyer d'erreur 500 pour ne pas bloquer l'affichage de la page 404
    return NextResponse.json(
      { error: "Failed to log 404" },
      { status: 200 } // Renvoyer 200 pour que le client ignore l'erreur
    );
  }
}
