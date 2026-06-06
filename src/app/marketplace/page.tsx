"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

interface LoanRequest {
  id: string;
  businessName: string;
  industry: string;
  locationCity: string;
  locationState: string;
  revenueBand: string;
  requestedAmountMin: number;
  requestedAmountMax: number;
  loanPurposeShort: string;
  createdAt: string;
  interests: { id: string; status: string }[];
}

const US_STATES = [
  "","AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const INDUSTRIES = [
  "", "Retail", "Restaurant / Food Service", "Healthcare", "Manufacturing",
  "Construction", "Real Estate", "Technology", "Transportation / Logistics",
  "Professional Services", "Wholesale / Distribution", "Other",
];

export default function MarketplacePage() {
  const [listings, setListings] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ state: "", industry: "", min_amount: "", max_amount: "" });
  const [total, setTotal] = useState(0);

  function buildQuery() {
    const p = new URLSearchParams();
    if (filters.state) p.set("state", filters.state);
    if (filters.industry) p.set("industry", filters.industry);
    if (filters.min_amount) p.set("min_amount", filters.min_amount);
    if (filters.max_amount) p.set("max_amount", filters.max_amount);
    return p.toString();
  }

  async function fetchListings() {
    setLoading(true);
    const res = await fetch(`/api/v1/loan-requests?${buildQuery()}`).then((r) => r.json());
    setListings(res.data ?? []);
    setTotal(res.meta?.total ?? 0);
    setLoading(false);
  }

  useEffect(() => { fetchListings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Marketplace</h1>
        <p className="text-sm text-gray-500 mt-1">Browse open loan requests from borrowers</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 flex flex-wrap gap-4 items-end">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">State</label>
          <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-28" value={filters.state} onChange={(e) => setFilters((p) => ({ ...p, state: e.target.value }))}>
            {US_STATES.map((s) => <option key={s} value={s}>{s || "All"}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Industry</label>
          <select className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48" value={filters.industry} onChange={(e) => setFilters((p) => ({ ...p, industry: e.target.value }))}>
            {INDUSTRIES.map((i) => <option key={i} value={i}>{i || "All"}</option>)}
          </select>
        </div>
        <Input label="Min amount ($)" id="min" type="number" className="w-36" value={filters.min_amount} onChange={(e) => setFilters((p) => ({ ...p, min_amount: e.target.value }))} placeholder="0" />
        <Input label="Max amount ($)" id="max" type="number" className="w-36" value={filters.max_amount} onChange={(e) => setFilters((p) => ({ ...p, max_amount: e.target.value }))} placeholder="Any" />
        <Button onClick={fetchListings} variant="secondary">Apply filters</Button>
        <Button onClick={() => { setFilters({ state: "", industry: "", min_amount: "", max_amount: "" }); setTimeout(fetchListings, 0); }} variant="ghost">Clear</Button>
      </div>

      <p className="text-sm text-gray-500 mb-4">{total} open request{total !== 1 ? "s" : ""}</p>

      {loading ? (
        <div className="text-gray-500 py-12 text-center">Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-gray-200 text-gray-500">
          No loan requests match your filters.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((lr) => {
            const myInterest = lr.interests[0];
            return (
              <Link key={lr.id} href={`/marketplace/${lr.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="font-semibold text-gray-900">{lr.businessName}</h2>
                        {myInterest && (
                          <Badge
                            label={myInterest.status === "ACCEPTED" ? "Matched" : myInterest.status === "INTERESTED" ? "Interested" : myInterest.status}
                            color={myInterest.status === "ACCEPTED" ? "green" : myInterest.status === "INTERESTED" ? "indigo" : "gray"}
                          />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{lr.locationCity}, {lr.locationState} · {lr.industry} · {lr.revenueBand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{fmt(lr.requestedAmountMin)} – {fmt(lr.requestedAmountMax)}</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(lr.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">{lr.loanPurposeShort}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
