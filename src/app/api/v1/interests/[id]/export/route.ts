import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/v1/interests/:id/export — Called by Repo 2 (Underwriter) via service token
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const serviceToken = _req.headers.get("authorization")?.replace("Bearer ", "");
  if (!serviceToken || serviceToken !== process.env.UNDERWRITER_SERVICE_TOKEN) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const interest = await prisma.lenderInterest.findUnique({
    where: { id: params.id },
    include: {
      lender: { select: { id: true, name: true, websiteUrl: true, location: true } },
      loanRequest: { include: { borrower: { select: { id: true, email: true } } } },
    },
  });

  if (!interest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (interest.status !== "ACCEPTED") {
    return NextResponse.json({ success: false, error: "Interest must be ACCEPTED to export" }, { status: 422 });
  }

  return NextResponse.json({ success: true, data: interest });
}
