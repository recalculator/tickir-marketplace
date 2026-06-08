import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { mintHandoffToken } from "@/lib/crossAppToken";
import { UserRole } from "@prisma/client";

// GET /api/v1/auth/underwriter-redirect
//
// Cross-app SSO handoff: mints a short-lived signed token for the current
// session and redirects the lender to the Underwriter app (Repo 2), where
// they arrive already authenticated.
//
// Only LENDER_USER and LENDER_ADMIN may cross over — borrowers and platform
// admins have no business in the Underwriter app.
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== UserRole.LENDER_USER && session.user.role !== UserRole.LENDER_ADMIN) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }

  const underwriterUrl = process.env.UNDERWRITER_URL;
  if (!underwriterUrl) {
    return NextResponse.json({ success: false, error: "UNDERWRITER_URL is not configured" }, { status: 500 });
  }

  const token = mintHandoffToken({
    id: session.user.id,
    email: session.user.email,
    role: session.user.role,
    lenderId: session.user.lenderId,
  });

  const redirectUrl = new URL("/api/auth/cross-app", underwriterUrl);
  redirectUrl.searchParams.set("token", token);

  return NextResponse.redirect(redirectUrl);
}
