"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (result?.error) { setError("Invalid email or password."); return; }
    const me = await fetch("/api/v1/auth/me").then((r) => r.json());
    const role = me.data?.role;
    if (role === "BORROWER") router.push("/dashboard");
    else if (role === "PLATFORM_ADMIN") router.push("/admin");
    else router.push("/marketplace");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <div className="w-full max-w-sm">
        {/* Logo mark */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-6 h-6 grid grid-cols-2 gap-0.5">
            {[...Array(4)].map((_, i) => <div key={i} className="rounded-sm bg-[#22c55e]" />)}
          </div>
          <span className="text-[#e8f0ec] font-semibold text-sm">Tickir</span>
        </div>

        <h1 className="text-2xl font-bold text-[#e8f0ec] mb-1">Welcome back</h1>
        <p className="text-sm text-[#546b5e] mb-8">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="email" label="Email" type="email" placeholder="you@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input id="password" label="Password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-3 py-2 text-sm text-red-400">{error}</div>
          )}
          <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">Sign in</Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#546b5e]">
          New borrower?{" "}
          <Link href="/register" className="text-[#22c55e] hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
