import { NextRequest, NextResponse } from "next/server";
import { createJobOpening, getAllJobOpenings } from "@/app/actions/team";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const showDeleted = searchParams.get("showDeleted") === "true";

    const jobs = await getAllJobOpenings(showDeleted);
    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Error fetching job openings:', error);
    return NextResponse.json({ error: "Failed to fetch job openings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const job = await createJobOpening(body);
    return NextResponse.json(job);
  } catch (error) {
    console.error('Error creating job opening:', error);
    return NextResponse.json({ error: "Failed to create job opening" }, { status: 500 });
  }
}
