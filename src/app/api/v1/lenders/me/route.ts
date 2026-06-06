import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/lenders/me — Get own lender institution
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_USER, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const lender = await prisma.lender.findFirst({
    where: { members: { some: { userId: session!.user.id } } },
    include: { preferences: true },
  });

  if (!lender) {
    return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: lender });
}

// PUT /api/v1/lenders/me — Update lender profile (LENDER_ADMIN only)
export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const body = await req.json();
  const { name, websiteUrl, logoUrl, location } = body;

  const member = await prisma.lenderMember.findUnique({ where: { userId: session!.user.id } });
  if (!member) {
    return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 404 });
  }

  const lender = await prisma.lender.update({
    where: { id: member.lenderId },
    data: { name, websiteUrl, logoUrl, location },
  });

  return NextResponse.json({ success: true, data: lender });
}
