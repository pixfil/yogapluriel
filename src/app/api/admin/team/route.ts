import { NextRequest, NextResponse } from "next/server";
import { createTeamMember, getAllTeamMembers } from "@/app/actions/team";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const showDeleted = searchParams.get("showDeleted") === "true";

    const members = await getAllTeamMembers(showDeleted);
    return NextResponse.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const member = await createTeamMember(body);
    return NextResponse.json(member);
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({ error: "Failed to create team member" }, { status: 500 });
  }
}
