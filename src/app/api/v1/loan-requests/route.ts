import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole, Visibility } from "@prisma/client";

// POST /api/v1/loan-requests — Create a loan request (BORROWER only)
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.BORROWER);
  if (roleError) return roleError;

  const body = await req.json();
  const {
    businessName, industry, locationCity, locationState,
    yearsInBusiness, revenueBand, requestedAmountMin, requestedAmountMax,
    loanPurposeShort, loanPurposeDetails, visibility,
  } = body;

  if (!businessName || !industry || !locationCity || !locationState || !yearsInBusiness || !revenueBand || !requestedAmountMin || !requestedAmountMax || !loanPurposeShort || !loanPurposeDetails) {
    return NextResponse.json({ success: false, error: "All required fields must be provided" }, { status: 400 });
  }

  if (requestedAmountMin > requestedAmountMax) {
    return NextResponse.json({ success: false, error: "requestedAmountMin must be <= requestedAmountMax" }, { status: 400 });
  }

  const loanRequest = await prisma.loanRequest.create({
    data: {
      borrowerId: session!.user.id,
      businessName, industry, locationCity, locationState,
      yearsInBusiness: Number(yearsInBusiness), revenueBand,
      requestedAmountMin: Number(requestedAmountMin),
      requestedAmountMax: Number(requestedAmountMax),
      loanPurposeShort, loanPurposeDetails,
      visibility: visibility === "PUBLIC" ? Visibility.PUBLIC : Visibility.ANONYMIZED,
    },
  });

  return NextResponse.json({ success: true, data: loanRequest }, { status: 201 });
}

// GET /api/v1/loan-requests — Browse marketplace (LENDER_* only)
export async function GET(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_USER, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const { searchParams } = new URL(req.url);
  const minAmount = searchParams.get("min_amount");
  const maxAmount = searchParams.get("max_amount");
  const state = searchParams.get("state");
  const industry = searchParams.get("industry");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, Number(searchParams.get("limit") ?? "20")));
  const skip = (page - 1) * limit;

  const where = {
    status: "OPEN" as const,
    ...(state && { locationState: state }),
    ...(industry && { industry }),
    ...(minAmount && { requestedAmountMax: { gte: Number(minAmount) } }),
    ...(maxAmount && { requestedAmountMin: { lte: Number(maxAmount) } }),
  };

  const [total, loanRequests] = await Promise.all([
    prisma.loanRequest.count({ where }),
    prisma.loanRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        interests: {
          where: { lenderId: session!.user.lenderId! },
          select: { id: true, status: true },
        },
      },
    }),
  ]);

  // Anonymize: replace business name unless this lender has an accepted interest
  const anonymized = loanRequests.map((lr) => {
    const accepted = lr.interests.some((i) => i.status === "ACCEPTED");
    return {
      ...lr,
      businessName: accepted ? lr.businessName : `Business in ${lr.locationCity}, ${lr.locationState}`,
    };
  });

  return NextResponse.json({
    success: true,
    data: anonymized,
    meta: { total, page, limit },
  });
}
