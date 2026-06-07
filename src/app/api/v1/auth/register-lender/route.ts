import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { LenderMemberRole, LenderStatus, UserRole } from "@prisma/client";

// POST /api/v1/auth/register-lender — Banker/lender self-registration.
// Creates a new Lender institution (pending platform approval) along with a
// LENDER_ADMIN user and membership record.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, institutionName, websiteUrl, location } = body;

  if (!email || !password || !institutionName) {
    return NextResponse.json(
      { success: false, error: "email, password, and institutionName are required" },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const result = await prisma.$transaction(async (tx) => {
    const lender = await tx.lender.create({
      data: {
        name: institutionName,
        websiteUrl: websiteUrl || null,
        location: location || null,
        status: LenderStatus.PENDING_APPROVAL,
      },
    });

    const user = await tx.user.create({
      data: { email, passwordHash, role: UserRole.LENDER_ADMIN },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    await tx.lenderMember.create({
      data: { lenderId: lender.id, userId: user.id, role: LenderMemberRole.ADMIN },
    });

    return { user, lender };
  });

  return NextResponse.json({ success: true, data: result }, { status: 201 });
}
