import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new NextResponse("No file", { status: 400 });

  // Convert file to buffer
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;

  // Upload to Supabase Storage (replace "posters" with your bucket name)
  const { error } = await supabase.storage
    .from("posters")
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error("Upload failed:", error.message);
    return new NextResponse("Upload failed", { status: 500 });
  }

  // Return the public URL for the uploaded file
  const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/posters/${fileName}`;
  return NextResponse.json({ url: publicUrl });
}
