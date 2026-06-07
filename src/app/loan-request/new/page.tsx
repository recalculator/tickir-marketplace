"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const INDUSTRIES = ["Retail","Restaurant / Food Service","Healthcare","Manufacturing","Construction","Real Estate","Technology","Transportation / Logistics","Professional Services","Wholesale / Distribution","Other"];
const REVENUE_BANDS = ["<$250K","$250K–$500K","$500K–$1M","$1M–$5M","$5M+"];
const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];

const selectCls = "rounded-lg border border-[#2a3830] bg-[#161d19] px-3 py-2 text-sm text-[#e8f0ec] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40 w-full";

export default function NewLoanRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ businessName:"", industry:"", locationCity:"", locationState:"", yearsInBusiness:"", revenueBand:"", requestedAmountMin:"", requestedAmountMax:"", loanPurposeShort:"", loanPurposeDetails:"" });

  function set(field: string, value: string) { setForm((p) => ({ ...p, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const min = Number(form.requestedAmountMin);
    const max = Number(form.requestedAmountMax);
    if (min > max) { setError("Min amount must be less than max."); return; }
    setLoading(true);
    const res = await fetch("/api/v1/loan-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, requestedAmountMin: min, requestedAmountMax: max, yearsInBusiness: Number(form.yearsInBusiness) }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error ?? "Failed."); return; }
    router.push(`/loan-request/${data.data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[#e8f0ec] mb-1">New Loan Request</h1>
      <p className="text-sm text-[#546b5e] mb-8">Tell lenders about your business and what you need.</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Business Info */}
        <section className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[#e8f0ec] uppercase tracking-wide">Business Info</h2>
          <Input label="Business name" id="businessName" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">Industry</label>
              <select className={selectCls} value={form.industry} onChange={(e) => set("industry", e.target.value)} required>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <Input label="Years in business" id="years" type="number" min="0" value={form.yearsInBusiness} onChange={(e) => set("yearsInBusiness", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" id="city" value={form.locationCity} onChange={(e) => set("locationCity", e.target.value)} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">State</label>
              <select className={selectCls} value={form.locationState} onChange={(e) => set("locationState", e.target.value)} required>
                <option value="">Select state</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">Annual revenue</label>
            <select className={selectCls} value={form.revenueBand} onChange={(e) => set("revenueBand", e.target.value)} required>
              <option value="">Select range</option>
              {REVENUE_BANDS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </section>

        {/* Loan Details */}
        <section className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-6 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[#e8f0ec] uppercase tracking-wide">Loan Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min amount ($)" id="min" type="number" min="0" placeholder="100000" value={form.requestedAmountMin} onChange={(e) => set("requestedAmountMin", e.target.value)} required />
            <Input label="Max amount ($)" id="max" type="number" min="0" placeholder="500000" value={form.requestedAmountMax} onChange={(e) => set("requestedAmountMax", e.target.value)} required />
          </div>
          <Input label="Loan purpose (short)" id="short" placeholder="e.g. Equipment purchase" value={form.loanPurposeShort} onChange={(e) => set("loanPurposeShort", e.target.value)} required />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">Details</label>
            <textarea className="rounded-lg border border-[#2a3830] bg-[#161d19] px-3 py-2 text-sm text-[#e8f0ec] placeholder-[#546b5e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40" rows={5} placeholder="Describe how the loan will be used and why you're a strong candidate..." value={form.loanPurposeDetails} onChange={(e) => set("loanPurposeDetails", e.target.value)} required />
          </div>
        </section>

        {error && <div className="rounded-lg bg-red-900/20 border border-red-800/40 px-3 py-2 text-sm text-red-400">{error}</div>}
        <Button type="submit" loading={loading} size="lg">Submit request</Button>
      </form>
    </div>
  );
}
