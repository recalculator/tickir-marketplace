import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { prisma } from "@/lib/db";

// DELETE /api/v1/documents/:id — remove one of the current user's documents
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;

  const doc = await prisma.document.findUnique({ where: { id }, select: { id: true, userId: true } });
  if (!doc) {
    return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
  }
  if (doc.userId !== session!.user.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  await prisma.document.delete({ where: { id } });

  return NextResponse.json({ success: true, data: { id } });
}
