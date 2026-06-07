import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { prisma } from "@/lib/db";
import { DocCategory } from "@prisma/client";

const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
const VALID_CATEGORIES = Object.values(DocCategory);

// GET /api/v1/documents — list current user's uploaded documents
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const documents = await prisma.document.findMany({
    where: { userId: session!.user.id },
    select: { id: true, category: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: documents });
}

// POST /api/v1/documents — upload a document (multipart/form-data: file, category)
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ success: false, error: "Expected multipart/form-data" }, { status: 400 });
  }

  const file = formData.get("file");
  const category = formData.get("category");

  if (!(file instanceof File)) {
    return NextResponse.json({ success: false, error: "A file is required" }, { status: 400 });
  }
  if (typeof category !== "string" || !VALID_CATEGORIES.includes(category as DocCategory)) {
    return NextResponse.json({ success: false, error: `category must be one of: ${VALID_CATEGORIES.join(", ")}` }, { status: 400 });
  }
  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ success: false, error: "Only PDF, PNG, and JPEG files are accepted" }, { status: 400 });
  }
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ success: false, error: "File exceeds the 10MB limit" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataBase64 = buffer.toString("base64");

  const document = await prisma.document.create({
    data: {
      userId: session!.user.id,
      category: category as DocCategory,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      dataBase64,
    },
    select: { id: true, category: true, fileName: true, mimeType: true, sizeBytes: true, createdAt: true },
  });

  return NextResponse.json({ success: true, data: document }, { status: 201 });
}
