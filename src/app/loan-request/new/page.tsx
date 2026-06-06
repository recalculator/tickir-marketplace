"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const INDUSTRIES = [
  "Retail", "Restaurant / Food Service", "Healthcare", "Manufacturing",
  "Construction", "Real Estate", "Technology", "Transportation / Logistics",
  "Professional Services", "Wholesale / Distribution", "Other",
];

const REVENUE_BANDS = [
  "<$250K", "$250K–$500K", "$500K–$1M", "$1M–$5M", "$5M+",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

export default function NewLoanRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    businessName: "",
    industry: "",
    locationCity: "",
    locationState: "",
    yearsInBusiness: "",
    revenueBand: "",
    requestedAmountMin: "",
    requestedAmountMax: "",
    loanPurposeShort: "",
    loanPurposeDetails: "",
  });

  function set(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const min = Number(form.requestedAmountMin.replace(/,/g, ""));
    const max = Number(form.requestedAmountMax.replace(/,/g, ""));
    if (min > max) { setError("Minimum amount must be less than maximum."); return; }

    setLoading(true);
    const res = await fetch("/api/v1/loan-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, requestedAmountMin: min, requestedAmountMax: max, yearsInBusiness: Number(form.yearsInBusiness) }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) { setError(data.error ?? "Failed to create request."); return; }
    router.push(`/loan-request/${data.data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">New Loan Request</h1>
      <p className="text-sm text-gray-500 mb-8">Tell lenders about your business and what you need.</p>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-8 flex flex-col gap-6">
        <fieldset className="flex flex-col gap-4">
          <legend className="font-semibold text-gray-900 mb-2">Business Info</legend>
          <Input label="Business name" id="businessName" value={form.businessName} onChange={(e) => set("businessName", e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Industry</label>
              <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.industry} onChange={(e) => set("industry", e.target.value)} required>
                <option value="">Select industry</option>
                {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <Input label="Years in business" id="yearsInBusiness" type="number" min="0" value={form.yearsInBusiness} onChange={(e) => set("yearsInBusiness", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" id="locationCity" value={form.locationCity} onChange={(e) => set("locationCity", e.target.value)} required />
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">State</label>
              <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.locationState} onChange={(e) => set("locationState", e.target.value)} required>
                <option value="">Select state</option>
                {US_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Annual revenue</label>
            <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={form.revenueBand} onChange={(e) => set("revenueBand", e.target.value)} required>
              <option value="">Select range</option>
              {REVENUE_BANDS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="font-semibold text-gray-900 mb-2">Loan Details</legend>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Minimum amount ($)" id="requestedAmountMin" type="number" min="0" placeholder="100000" value={form.requestedAmountMin} onChange={(e) => set("requestedAmountMin", e.target.value)} required />
            <Input label="Maximum amount ($)" id="requestedAmountMax" type="number" min="0" placeholder="500000" value={form.requestedAmountMax} onChange={(e) => set("requestedAmountMax", e.target.value)} required />
          </div>
          <Input label="Loan purpose (short)" id="loanPurposeShort" placeholder="e.g. Equipment purchase" value={form.loanPurposeShort} onChange={(e) => set("loanPurposeShort", e.target.value)} required />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Details</label>
            <textarea
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={5}
              placeholder="Describe how the loan will be used, your business model, and why you're a good candidate..."
              value={form.loanPurposeDetails}
              onChange={(e) => set("loanPurposeDetails", e.target.value)}
              required
            />
          </div>
        </fieldset>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" loading={loading} size="lg">Submit request</Button>
      </form>
    </div>
  );
}
