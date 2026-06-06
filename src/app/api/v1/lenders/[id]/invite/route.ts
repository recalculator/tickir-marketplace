import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { UserRole, LenderMemberRole } from "@prisma/client";

// POST /api/v1/lenders/:id/invite — Invite a user to join a lender
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.PLATFORM_ADMIN);
  if (roleError) return roleError;

  const body = await req.json();
  const { email, role = "USER" } = body;

  if (!email) {
    return NextResponse.json({ success: false, error: "email is required" }, { status: 400 });
  }

  const lender = await prisma.lender.findUnique({ where: { id: params.id } });
  if (!lender) {
    return NextResponse.json({ success: false, error: "Lender not found" }, { status: 404 });
  }

  const temporaryPassword = Math.random().toString(36).slice(-12);
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const userRole = role === "ADMIN" ? UserRole.LENDER_ADMIN : UserRole.LENDER_USER;
  const memberRole = role === "ADMIN" ? LenderMemberRole.ADMIN : LenderMemberRole.USER;

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash, role: userRole },
  });

  await prisma.lenderMember.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id, lenderId: lender.id, role: memberRole },
  });

  await sendEmail({
    to: email,
    subject: `You've been invited to join ${lender.name} on Tickir`,
    html: `<p>You have been invited to join <strong>${lender.name}</strong> on Tickir Marketplace.</p>
           <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
           <p>Please log in and change your password immediately.</p>`,
  });

  return NextResponse.json({ success: true, data: { userId: user.id, email } }, { status: 201 });
}
