"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/shared/Logo";

export function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <nav className="border-b border-[#1f2d27] bg-[#0f1512]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <Link href="/">
              <Logo size={26} />
            </Link>

            {/* Nav links by role */}
            <div className="flex items-center gap-1">
              {role === "BORROWER" && <>
                <NavLink href="/dashboard">Dashboard</NavLink>
                <NavLink href="/loan-request/new">+ New Request</NavLink>
                <NavLink href="/profile/setup">Profile</NavLink>
              </>}
              {(role === "LENDER_USER" || role === "LENDER_ADMIN") && <>
                <NavLink href="/marketplace">Marketplace</NavLink>
                <NavLink href="/opportunities">My Interests</NavLink>
                {role === "LENDER_ADMIN" && <NavLink href="/settings">Settings</NavLink>}
              </>}
              {role === "PLATFORM_ADMIN" && <NavLink href="/admin">Admin</NavLink>}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-xs text-[#546b5e] hidden sm:block">{session.user.email}</span>
                <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="px-3 py-1.5 text-sm text-[#8fa899] hover:text-[#e8f0ec] hover:bg-[#1c2620] rounded-lg transition-colors"
    >
      {children}
    </Link>
  );
}
