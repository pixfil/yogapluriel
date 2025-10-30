import { NextRequest, NextResponse } from 'next/server';
import { toggleJobHighlight } from '@/app/actions/team';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { is_highlighted } = await request.json();
    const job = await toggleJobHighlight(id, is_highlighted);
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error toggling job highlight:', error);
    return NextResponse.json(
      { error: 'Failed to toggle highlight' },
      { status: 500 }
    );
  }
}
