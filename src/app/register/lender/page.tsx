"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/shared/Logo";

export default function RegisterLenderPage() {
  const router = useRouter();
  const [form, setForm] = useState({ institutionName: "", websiteUrl: "", location: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/v1/auth/register-lender", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Registration failed."); setLoading(false); return; }
    await signIn("credentials", { email: form.email, password: form.password, redirect: false });
    setLoading(false);
    router.push("/marketplace");
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8"><Logo size={30} /></div>

        <h1 className="text-2xl font-bold text-[#e8f0ec] mb-1">Register your institution</h1>
        <p className="text-sm text-[#546b5e] mb-8">
          Create a lender account to browse loan requests and connect with borrowers. New institutions are reviewed before going live.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="institutionName" label="Institution name" placeholder="First National Bank" value={form.institutionName} onChange={(e) => set("institutionName", e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <Input id="websiteUrl" label="Website" type="url" placeholder="https://..." value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} />
            <Input id="location" label="Location" placeholder="City, State" value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>

          <div className="border-t border-[#1f2d27] pt-4 mt-1">
            <p className="text-xs font-medium text-[#546b5e] uppercase tracking-wide mb-3">Admin account</p>
            <div className="flex flex-col gap-4">
              <Input id="email" label="Work email" type="email" placeholder="you@institution.com" value={form.email} onChange={(e) => set("email", e.target.value)} required />
              <Input id="password" label="Password" type="password" placeholder="Min 8 characters" value={form.password} onChange={(e) => set("password", e.target.value)} minLength={8} required />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-3 py-2 text-sm text-red-400">{error}</div>
          )}

          <Button type="submit" loading={loading} size="lg" className="mt-2 w-full">Create institution account</Button>
        </form>

        <p className="mt-6 text-center text-sm text-[#546b5e]">
          Already registered?{" "}
          <Link href="/login" className="text-[#22c55e] hover:underline">Sign in</Link>
        </p>
        <p className="mt-3 text-center text-sm text-[#546b5e]">
          Looking to borrow instead?{" "}
          <Link href="/register" className="text-[#22c55e] hover:underline">Create a borrower account</Link>
        </p>
      </div>
    </div>
  );
}
