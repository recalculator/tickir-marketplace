import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /api/v1/interests/:id/mark-imported — Called by Repo 2 after creating a Deal
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const serviceToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!serviceToken || serviceToken !== process.env.UNDERWRITER_SERVICE_TOKEN) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { underwriterDealId } = body;

  if (!underwriterDealId) {
    return NextResponse.json({ success: false, error: "underwriterDealId is required" }, { status: 400 });
  }

  const interest = await prisma.lenderInterest.findUnique({ where: { id: id } });
  if (!interest) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  const updated = await prisma.lenderInterest.update({
    where: { id: id },
    data: { underwriterDealId, importedAt: new Date() },
  });

  return NextResponse.json({ success: true, data: updated });
}
