"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Registration failed."); setLoading(false); return; }
    await signIn("credentials", { email, password, redirect: false });
    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-sm bg-[#22c55e]" />)}
          </div>
          <span className="text-[#e8f0ec] font-semibold text-sm">Tickir</span>
        </div>

        <h1 className="text-2xl font-bold text-[#e8f0ec] mb-1">Get started</h1>
        <p className="text-sm text-[#546b5e] mb-8">Create your borrower account — free</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="email" label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" placeholder="Min 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-3 py-2 text-sm text-red-400">{error}</div>
          )}
          <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">Create account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#546b5e]">
          Already have an account?{" "}
          <Link href="/login" className="text-[#22c55e] hover:underline">Sign in</Link>
        </p>
        <p className="mt-3 text-center text-xs text-[#2a3830]">Lenders are onboarded by invitation only.</p>
      </div>
    </div>
  );
}
