import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// GET /api/v1/loan-requests/me — Borrower's own requests
export async function GET() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.BORROWER);
  if (roleError) return roleError;

  const loanRequests = await prisma.loanRequest.findMany({
    where: { borrowerId: session!.user.id },
    include: { interests: { select: { id: true, status: true, lender: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: loanRequests });
}
