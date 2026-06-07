import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { UserRole } from "@prisma/client";

// POST /api/v1/loan-requests/:id/interests — Lender expresses interest
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.LENDER_USER, UserRole.LENDER_ADMIN);
  if (roleError) return roleError;

  const { id } = await params;
  const loanRequest = await prisma.loanRequest.findUnique({
    where: { id },
    include: { borrower: { select: { email: true } } },
  });
  if (!loanRequest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (loanRequest.status !== "OPEN") {
    return NextResponse.json({ success: false, error: "Loan request is not open" }, { status: 422 });
  }

  const lenderId = session!.user.lenderId;
  if (!lenderId) return NextResponse.json({ success: false, error: "Not associated with a lender" }, { status: 403 });

  const existing = await prisma.lenderInterest.findUnique({
    where: { lenderId_loanRequestId: { lenderId, loanRequestId: id } },
  });
  if (existing) {
    return NextResponse.json({ success: false, error: "Already expressed interest" }, { status: 409 });
  }

  const body = await req.json();
  const { introMessage } = body;

  const interest = await prisma.lenderInterest.create({
    data: { lenderId, loanRequestId: id, introMessage },
    include: { lender: { select: { name: true } } },
  });

  await sendEmail({
    to: loanRequest.borrower.email,
    subject: "A lender has expressed interest in your loan request",
    html: `<p><strong>${interest.lender.name}</strong> has expressed interest in your loan request.</p>
           <p>Message: ${introMessage ?? "(no message)"}</p>
           <p>Log in to review and respond.</p>`,
  }).catch(() => {});

  return NextResponse.json({ success: true, data: interest }, { status: 201 });
}

// GET /api/v1/loan-requests/:id/interests — Borrower views interests on their request
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.BORROWER);
  if (roleError) return roleError;

  const { id } = await params;
  const loanRequest = await prisma.loanRequest.findUnique({ where: { id } });
  if (!loanRequest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (loanRequest.borrowerId !== session!.user.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const interests = await prisma.lenderInterest.findMany({
    where: { loanRequestId: id },
    include: { lender: { select: { name: true, websiteUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: interests });
}
