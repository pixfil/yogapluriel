import { NextRequest, NextResponse } from "next/server";
import { uploadTeamPhoto } from "@/app/actions/team";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
    }

    const photoUrl = await uploadTeamPhoto(file);
    return NextResponse.json({ photoUrl });
  } catch (error) {
    console.error('Error uploading team photo:', error);
    return NextResponse.json({ error: "Failed to upload photo" }, { status: 500 });
  }
}
