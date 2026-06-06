import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// DELETE /api/v1/lenders/me/members/:userId
export async function DELETE(_req: NextRequest, { params }: { params: { userId: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const adminMember = await prisma.lenderMember.findUnique({ where: { userId: session!.user.id } });
  if (!adminMember) return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 404 });

  const targetMember = await prisma.lenderMember.findUnique({ where: { userId: params.userId } });
  if (!targetMember || targetMember.lenderId !== adminMember.lenderId) {
    return NextResponse.json({ success: false, error: "Member not found" }, { status: 404 });
  }

  await prisma.lenderMember.delete({ where: { userId: params.userId } });

  return NextResponse.json({ success: true, data: null });
}
