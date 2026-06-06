import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/lenders/me/preferences
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_USER, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const member = await prisma.lenderMember.findUnique({ where: { userId: session!.user.id } });
  if (!member) return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 404 });

  const preferences = await prisma.lenderPreferences.findUnique({ where: { lenderId: member.lenderId } });
  return NextResponse.json({ success: true, data: preferences });
}

// PUT /api/v1/lenders/me/preferences
export async function PUT(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const member = await prisma.lenderMember.findUnique({ where: { userId: session!.user.id } });
  if (!member) return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 404 });

  const body = await req.json();
  const { minLoanAmount, maxLoanAmount, allowedGeographies, allowedIndustries, loanTypes } = body;

  const preferences = await prisma.lenderPreferences.upsert({
    where: { lenderId: member.lenderId },
    update: { minLoanAmount, maxLoanAmount, allowedGeographies, allowedIndustries, loanTypes },
    create: { lenderId: member.lenderId, minLoanAmount, maxLoanAmount, allowedGeographies: allowedGeographies ?? [], allowedIndustries: allowedIndustries ?? [], loanTypes: loanTypes ?? [] },
  });

  return NextResponse.json({ success: true, data: preferences });
}
