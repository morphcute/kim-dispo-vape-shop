import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!, // Changed from NEXT_PUBLIC_SUPABASE_URL
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new NextResponse("No file", { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;

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

  // Use the same SUPABASE_URL here
  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/posters/${fileName}`;
  return NextResponse.json({ url: publicUrl });
}