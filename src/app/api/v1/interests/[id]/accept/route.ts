import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { UserRole } from "@prisma/client";

// PUT /api/v1/interests/:id/accept — Borrower accepts a lender's interest
export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.BORROWER);
  if (roleError) return roleError;

  const interest = await prisma.lenderInterest.findUnique({
    where: { id: params.id },
    include: {
      loanRequest: { include: { borrower: { select: { email: true } } } },
      lender: { include: { members: { include: { user: { select: { email: true } } } } } },
    },
  });

  if (!interest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (interest.loanRequest.borrowerId !== session!.user.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (interest.status !== "INTERESTED") {
    return NextResponse.json({ success: false, error: "Interest is not in INTERESTED status" }, { status: 422 });
  }

  // Accept this interest, decline all others, create conversation
  const [accepted] = await prisma.$transaction([
    prisma.lenderInterest.update({
      where: { id: params.id },
      data: { status: "ACCEPTED" },
    }),
    prisma.lenderInterest.updateMany({
      where: {
        loanRequestId: interest.loanRequestId,
        id: { not: params.id },
        status: "INTERESTED",
      },
      data: { status: "DECLINED" },
    }),
    prisma.conversation.create({
      data: { lenderInterestId: params.id },
    }),
  ]);

  // Notify lender members
  const lenderEmails = interest.lender.members.map((m) => m.user.email);
  await Promise.all(
    lenderEmails.map((email) =>
      sendEmail({
        to: email,
        subject: "Your interest has been accepted!",
        html: `<p>Your interest in a loan request has been accepted by the borrower.</p><p>You can now message them directly through the platform.</p>`,
      }).catch(() => {})
    )
  );

  return NextResponse.json({ success: true, data: accepted });
}
