import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { isLenderRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/loan-requests/:id
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const user = session!.user;
  const loanRequest = await prisma.loanRequest.findUnique({
    where: { id: params.id },
    include: {
      borrower: { select: { id: true, email: true } },
      interests: true,
    },
  });

  if (!loanRequest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  // Borrowers can only see their own requests in full
  if (user.role === UserRole.BORROWER) {
    if (loanRequest.borrowerId !== user.id) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: loanRequest });
  }

  if (isLenderRole(user.role)) {
    // Check if this lender has an accepted interest
    const accepted = loanRequest.interests.some(
      (i) => i.lenderId === user.lenderId && i.status === "ACCEPTED"
    );
    const data = {
      ...loanRequest,
      businessName: accepted ? loanRequest.businessName : `Business in ${loanRequest.locationCity}, ${loanRequest.locationState}`,
      borrower: accepted ? loanRequest.borrower : undefined,
    };
    return NextResponse.json({ success: true, data });
  }

  // PLATFORM_ADMIN sees everything
  if (user.role === UserRole.PLATFORM_ADMIN) {
    return NextResponse.json({ success: true, data: loanRequest });
  }

  return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
}

// PUT /api/v1/loan-requests/:id — Borrower updates their request
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const loanRequest = await prisma.loanRequest.findUnique({ where: { id: params.id } });
  if (!loanRequest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (loanRequest.borrowerId !== session!.user.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (loanRequest.status !== "OPEN") {
    return NextResponse.json({ success: false, error: "Cannot update a closed loan request" }, { status: 422 });
  }

  const body = await req.json();
  const {
    businessName, industry, locationCity, locationState,
    yearsInBusiness, revenueBand, requestedAmountMin, requestedAmountMax,
    loanPurposeShort, loanPurposeDetails, visibility,
  } = body;

  const updated = await prisma.loanRequest.update({
    where: { id: params.id },
    data: {
      ...(businessName && { businessName }),
      ...(industry && { industry }),
      ...(locationCity && { locationCity }),
      ...(locationState && { locationState }),
      ...(yearsInBusiness && { yearsInBusiness: Number(yearsInBusiness) }),
      ...(revenueBand && { revenueBand }),
      ...(requestedAmountMin && { requestedAmountMin: Number(requestedAmountMin) }),
      ...(requestedAmountMax && { requestedAmountMax: Number(requestedAmountMax) }),
      ...(loanPurposeShort && { loanPurposeShort }),
      ...(loanPurposeDetails && { loanPurposeDetails }),
      ...(visibility && { visibility }),
    },
  });

  return NextResponse.json({ success: true, data: updated });
}
