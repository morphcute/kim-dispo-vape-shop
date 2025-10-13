import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  if (!isAdmin(req)) return new NextResponse("Unauthorized", { status: 401 });

  const form = await req.formData();
  const file = form.get("file") as File | null;
  if (!file) return new NextResponse("No file", { status: 400 });

  const bytes = Buffer.from(await file.arrayBuffer());
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const safeName = `${Date.now()}-${file.name.replace(/[^\w.\-]/g, "_")}`;
  const dest = path.join(uploadsDir, safeName);
  await writeFile(dest, bytes);

  // URL that the app can use directly in <img src="/uploads/..">
  const url = `/uploads/${safeName}`;
  return NextResponse.json({ url });
}
