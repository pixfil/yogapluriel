import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { term, definition, published } = body;

    // Validate required fields
    if (!term || !definition) {
      return NextResponse.json(
        { error: 'Le terme et la définition sont requis' },
        { status: 400 }
      );
    }

    // Calculate letter from term
    const letter = term.charAt(0).toUpperCase();

    // Insert the new term
    const { data, error } = await supabase
      .from('lexique_terms')
      .insert({
        term,
        definition,
        published,
        letter,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lexique term:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création du terme' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/admin/lexique:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
