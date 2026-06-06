import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { prisma } from "@/lib/db";

// PUT /api/v1/loan-requests/:id/close
export async function PUT(_req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const loanRequest = await prisma.loanRequest.findUnique({ where: { id: params.id } });
  if (!loanRequest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (loanRequest.borrowerId !== session!.user.id) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (loanRequest.status === "CLOSED") {
    return NextResponse.json({ success: false, error: "Already closed" }, { status: 422 });
  }

  const updated = await prisma.loanRequest.update({
    where: { id: params.id },
    data: { status: "CLOSED" },
  });

  return NextResponse.json({ success: true, data: updated });
}
