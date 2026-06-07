import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { prisma } from "@/lib/db";

const REQUIRED_CATEGORIES = ["TAX_RETURN", "BANK_STATEMENT", "ID_VERIFICATION"] as const;

// POST /api/v1/users/me/complete-profile
// Marks the current user's profile as complete once required document categories are present.
export async function POST() {
  const { error, session } = await requireAuth();
  if (error) return error;

  const documents = await prisma.document.findMany({
    where: { userId: session!.user.id },
    select: { category: true },
  });
  const uploadedCategories = new Set(documents.map((d) => d.category));
  const missing = REQUIRED_CATEGORIES.filter((c) => !uploadedCategories.has(c));

  if (missing.length > 0) {
    return NextResponse.json(
      { success: false, error: `Missing required documents: ${missing.join(", ")}` },
      { status: 400 }
    );
  }

  const user = await prisma.user.update({
    where: { id: session!.user.id },
    data: { profileComplete: true },
    select: { id: true, profileComplete: true },
  });

  return NextResponse.json({ success: true, data: user });
}
