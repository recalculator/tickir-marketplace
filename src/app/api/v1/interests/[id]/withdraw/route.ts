import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// PUT /api/v1/interests/:id/withdraw — Lender withdraws their interest
export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_USER, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const interest = await prisma.lenderInterest.findUnique({ where: { id: id } });
  if (!interest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (interest.lenderId !== session!.user.lenderId) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (interest.status !== "INTERESTED") {
    return NextResponse.json({ success: false, error: "Can only withdraw INTERESTED status" }, { status: 422 });
  }

  const updated = await prisma.lenderInterest.update({
    where: { id: id },
    data: { status: "WITHDRAWN" },
  });

  return NextResponse.json({ success: true, data: updated });
}
