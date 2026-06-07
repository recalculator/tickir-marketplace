import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// PUT /api/v1/admin/lenders/:id/suspend
export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;
  const roleError = requireRole(session!, UserRole.PLATFORM_ADMIN);
  if (roleError) return roleError;

  const { id } = await params;
  const lender = await prisma.lender.update({
    where: { id },
    data: { status: "SUSPENDED" },
  });

  return NextResponse.json({ success: true, data: lender });
}
