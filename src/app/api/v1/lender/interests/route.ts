import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/lender/interests — Lender's own interests
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_USER, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const lenderId = session!.user.lenderId;
  if (!lenderId) return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 403 });

  const interests = await prisma.lenderInterest.findMany({
    where: { lenderId },
    include: {
      loanRequest: {
        select: { id: true, locationCity: true, locationState: true, industry: true, requestedAmountMin: true, requestedAmountMax: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: interests });
}
