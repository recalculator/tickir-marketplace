import { UserRole } from "@prisma/client";
import { NextResponse } from "next/server";
import { Session } from "next-auth";

export function requireRole(session: Session, ...roles: UserRole[]) {
  if (!roles.includes(session.user.role as UserRole)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return null;
}

export function isLenderRole(role: string): boolean {
  return role === UserRole.LENDER_USER || role === UserRole.LENDER_ADMIN;
}
