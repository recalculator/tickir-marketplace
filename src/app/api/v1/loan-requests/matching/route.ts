import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/loan-requests/matching — Filtered to lender's saved preferences
export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_USER, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const member = await prisma.lenderMember.findUnique({
    where: { userId: session!.user.id },
    include: { lender: { include: { preferences: true } } },
  });

  if (!member) return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 404 });

  const prefs = member.lender.preferences;
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const skip = (page - 1) * limit;

  const where = {
    status: "OPEN" as const,
    ...(prefs?.minLoanAmount && { requestedAmountMax: { gte: prefs.minLoanAmount } }),
    ...(prefs?.maxLoanAmount && { requestedAmountMin: { lte: prefs.maxLoanAmount } }),
    ...(Array.isArray(prefs?.allowedGeographies) && (prefs.allowedGeographies as string[]).length > 0
      ? { locationState: { in: prefs.allowedGeographies as string[] } }
      : {}),
    ...(Array.isArray(prefs?.allowedIndustries) && (prefs.allowedIndustries as string[]).length > 0
      ? { industry: { in: prefs.allowedIndustries as string[] } }
      : {}),
  };

  const [total, loanRequests] = await Promise.all([
    prisma.loanRequest.count({ where }),
    prisma.loanRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        interests: { where: { lenderId: member.lenderId }, select: { id: true, status: true } },
      },
    }),
  ]);

  const anonymized = loanRequests.map((lr) => {
    const accepted = lr.interests.some((i) => i.status === "ACCEPTED");
    return {
      ...lr,
      businessName: accepted ? lr.businessName : `Business in ${lr.locationCity}, ${lr.locationState}`,
    };
  });

  return NextResponse.json({ success: true, data: anonymized, meta: { total, page, limit } });
}
