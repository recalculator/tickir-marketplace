import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { UserRole } from "@prisma/client";

// PUT /api/v1/interests/:id/decline — Borrower declines a lender's interest
export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.BORROWER);
  if (roleError) return roleError;

  const interest = await prisma.lenderInterest.findUnique({
    where: { id: id },
    include: {
      loanRequest: true,
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

  const updated = await prisma.lenderInterest.update({
    where: { id: id },
    data: { status: "DECLINED" },
  });

  const lenderEmails = interest.lender.members.map((m) => m.user.email);
  await Promise.all(
    lenderEmails.map((email) =>
      sendEmail({
        to: email,
        subject: "Your interest has been declined",
        html: `<p>Unfortunately, the borrower has declined your interest in their loan request.</p>`,
      }).catch(() => {})
    )
  );

  return NextResponse.json({ success: true, data: updated });
}
