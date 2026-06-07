import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { isLenderRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/documents/:id/download
// Owners can always download their own documents. Lenders may download a borrower's
// documents only if they have an ACCEPTED interest on one of that borrower's loan requests.
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const user = session!.user;

  const doc = await prisma.document.findUnique({ where: { id } });
  if (!doc) {
    return NextResponse.json({ success: false, error: "Document not found" }, { status: 404 });
  }

  let authorized = doc.userId === user.id || user.role === UserRole.PLATFORM_ADMIN;

  if (!authorized && isLenderRole(user.role) && user.lenderId) {
    const matched = await prisma.lenderInterest.findFirst({
      where: {
        lenderId: user.lenderId,
        status: "ACCEPTED",
        loanRequest: { borrowerId: doc.userId },
      },
      select: { id: true },
    });
    authorized = Boolean(matched);
  }

  if (!authorized) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const buffer = Buffer.from(doc.dataBase64, "base64");
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": doc.mimeType,
      "Content-Disposition": `inline; filename="${doc.fileName.replace(/"/g, "")}"`,
      "Content-Length": String(doc.sizeBytes),
    },
  });
}
