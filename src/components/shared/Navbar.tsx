"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-indigo-600 tracking-tight">
              Tickir
            </Link>
            {role === "BORROWER" && (
              <div className="flex gap-6">
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">Dashboard</Link>
                <Link href="/loan-request/new" className="text-sm text-gray-600 hover:text-gray-900">New Request</Link>
              </div>
            )}
            {(role === "LENDER_USER" || role === "LENDER_ADMIN") && (
              <div className="flex gap-6">
                <Link href="/marketplace" className="text-sm text-gray-600 hover:text-gray-900">Marketplace</Link>
                <Link href="/opportunities" className="text-sm text-gray-600 hover:text-gray-900">My Interests</Link>
                {role === "LENDER_ADMIN" && (
                  <Link href="/settings" className="text-sm text-gray-600 hover:text-gray-900">Settings</Link>
                )}
              </div>
            )}
            {role === "PLATFORM_ADMIN" && (
              <Link href="/admin" className="text-sm text-gray-600 hover:text-gray-900">Admin</Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <>
                <span className="text-sm text-gray-500">{session.user.email}</span>
                <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
                  Sign out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Log in</Button>
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
