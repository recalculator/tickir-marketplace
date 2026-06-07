import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/admin/lenders — list all lenders (PLATFORM_ADMIN)
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;
  const roleError = requireRole(session!, UserRole.PLATFORM_ADMIN);
  if (roleError) return roleError;

  const lenders = await prisma.lender.findMany({
    include: { members: { include: { user: { select: { email: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: lenders });
}
