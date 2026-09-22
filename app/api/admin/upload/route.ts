import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const BUCKET = "taller-screenshots";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file");
  const slug = formData.get("slug");

  if (!(file instanceof File) || typeof slug !== "string" || !slug) {
    return NextResponse.json({ error: "Falta el archivo o el slug del proyecto." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "png";
  const path = `${slug}-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, arrayBuffer, {
    contentType: file.type || "image/png",
    upsert: true,
  });

  if (uploadError) {
    return NextResponse.json({ error: `Error al subir la imagen: ${uploadError.message}` }, { status: 500 });
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
