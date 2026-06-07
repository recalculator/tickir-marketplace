import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// POST /api/v1/auth/register — Borrower self-registration
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password, role } = body;

  if (!email || !password) {
    return NextResponse.json({ success: false, error: "email and password required" }, { status: 400 });
  }

  if (role && role !== "BORROWER") {
    return NextResponse.json({ success: false, error: "Self-registration is only available for borrowers" }, { status: 403 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ success: false, error: "Email already registered" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, role: UserRole.BORROWER },
    select: { id: true, email: true, role: true, createdAt: true },
  });

  return NextResponse.json({ success: true, data: user }, { status: 201 });
}
