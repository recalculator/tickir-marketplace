"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const US_STATES = ["","AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
const INDUSTRIES = ["","Retail","Restaurant / Food Service","Healthcare","Manufacturing","Construction","Real Estate","Technology","Transportation / Logistics","Professional Services","Wholesale / Distribution","Other"];

const selectCls = "rounded-lg border border-[#2a3830] bg-[#161d19] px-3 py-2 text-sm text-[#e8f0ec] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40";

export default function MarketplacePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ state: "", industry: "", min_amount: "", max_amount: "" });

  function buildQuery() {
    const p = new URLSearchParams();
    if (filters.state) p.set("state", filters.state);
    if (filters.industry) p.set("industry", filters.industry);
    if (filters.min_amount) p.set("min_amount", filters.min_amount);
    if (filters.max_amount) p.set("max_amount", filters.max_amount);
    return p.toString();
  }

  async function load() {
    setLoading(true);
    const res = await fetch(`/api/v1/loan-requests?${buildQuery()}`).then((r) => r.json());
    setListings(res.data ?? []);
    setTotal(res.meta?.total ?? 0);
    setLoading(false);
  }

  useEffect(() => { load(); }, []); // eslint-disable-line

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[#e8f0ec]">Marketplace</h1>
          <p className="text-sm text-[#546b5e] mt-0.5">{total} open request{total !== 1 ? "s" : ""}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">State</label>
          <select className={`${selectCls} w-24`} value={filters.state} onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}>
            {US_STATES.map((s) => <option key={s} value={s}>{s || "All"}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">Industry</label>
          <select className={`${selectCls} w-48`} value={filters.industry} onChange={(e) => setFilters((p) => ({ ...p, industry: e.target.value }))}>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i || "All industries"}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">Min ($)</label>
          <input type="number" className={`${selectCls} w-32`} placeholder="0" value={filters.min_amount} onChange={(e) => setFilters((p) => ({ ...p, min_amount: e.target.value }))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#8fa899] uppercase tracking-wide">Max ($)</label>
          <input type="number" className={`${selectCls} w-32`} placeholder="Any" value={filters.max_amount} onChange={(e) => setFilters((p) => ({ ...p, max_amount: e.target.value }))} />
        </div>
        <Button onClick={load} variant="secondary">Apply</Button>
        <Button onClick={() => { setFilters({ state: "", industry: "", min_amount: "", max_amount: "" }); setTimeout(load, 0); }} variant="ghost">Clear</Button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-[#546b5e] py-12 text-center text-sm">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] py-20 text-center text-sm text-[#546b5e]">
          No loan requests match your filters.
        </div>
      ) : (
        <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2d27]">
                {["Borrower","Type","Amount","Revenue","Location","Status",""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#546b5e] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d27]">
              {listings.map((lr) => {
                const myInterest = lr.interests?.[0];
                return (
                  <tr key={lr.id} className="hover:bg-[#1c2620] transition-colors cursor-pointer" onClick={() => window.location.href = `/marketplace/${lr.id}`}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#e8f0ec]">{lr.businessName}</p>
                      <p className="text-xs text-[#546b5e]">{new Date(lr.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-4 text-[#8fa899]">{lr.industry}</td>
                    <td className="px-5 py-4 font-medium text-[#e8f0ec]">{fmt(lr.requestedAmountMin)}–{fmt(lr.requestedAmountMax)}</td>
                    <td className="px-5 py-4 text-[#8fa899]">{lr.revenueBand}</td>
                    <td className="px-5 py-4 text-[#8fa899]">{lr.locationCity}, {lr.locationState}</td>
                    <td className="px-5 py-4">
                      {myInterest ? (
                        <Badge label={myInterest.status === "ACCEPTED" ? "Matched" : myInterest.status} color={myInterest.status === "ACCEPTED" ? "green" : "indigo"} />
                      ) : (
                        <Badge label="Open" color="green" />
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#546b5e]">›</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
