import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Update the term
    const { data, error } = await supabase
      .from('lexique_terms')
      .update({
        term,
        definition,
        published,
        letter,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating lexique term:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du terme' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in PUT /api/admin/lexique/[id]:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
