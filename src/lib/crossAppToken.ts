import jwt from "jsonwebtoken";
import type { Session } from "next-auth";

// Reuse the existing Session["user"] shape (declared in src/types/next-auth.d.ts)
// rather than introducing a parallel type for the cross-app handoff payload.
type HandoffUser = Pick<Session["user"], "id" | "email" | "role" | "lenderId">;

const ISSUER = "marketplace";
const EXPIRES_IN = "60s";

/**
 * Mints a short-lived JWT that the Underwriter app (Repo 2) can verify to
 * establish an authenticated session for the same user, without requiring
 * them to log in again (SSO handoff).
 */
export function mintHandoffToken(user: HandoffUser): string {
  const secret = process.env.CROSS_APP_JWT_SECRET;
  if (!secret) {
    throw new Error("CROSS_APP_JWT_SECRET is not set — cannot mint a cross-app handoff token");
  }

  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      lenderId: user.lenderId,
    },
    secret,
    {
      issuer: ISSUER,
      expiresIn: EXPIRES_IN,
    }
  );
}
