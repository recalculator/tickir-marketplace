import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { requireRole } from "@/lib/middleware/requireRole";
import { prisma } from "@/lib/db";
import { UserRole } from "@prisma/client";

// POST /api/v1/lenders — Create a lender institution (PLATFORM_ADMIN only)
export async function POST(req: NextRequest) {
  const { error, session } = await requireAuth();
  if (error) return error;

  const roleError = requireRole(session!, UserRole.PLATFORM_ADMIN);
  if (roleError) return roleError;

  const body = await req.json();
  const { name, websiteUrl, location } = body;

  if (!name) {
    return NextResponse.json({ success: false, error: "name is required" }, { status: 400 });
  }

  const lender = await prisma.lender.create({
    data: { name, websiteUrl, location },
  });

  return NextResponse.json({ success: true, data: lender }, { status: 201 });
}
