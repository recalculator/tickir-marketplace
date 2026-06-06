import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/lenders/me/members
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const member = await prisma.lenderMember.findUnique({ where: { userId: session!.user.id } });
  if (!member) return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 404 });

  const members = await prisma.lenderMember.findMany({
    where: { lenderId: member.lenderId },
    include: { user: { select: { id: true, email: true, role: true, createdAt: true } } },
  });

  return NextResponse.json({ success: true, data: members });
}
