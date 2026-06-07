"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

const statusColor: Record<string, "indigo"|"green"|"red"|"gray"> = { INTERESTED:"indigo", ACCEPTED:"green", DECLINED:"red", WITHDRAWN:"gray" };

export default function OpportunitiesPage() {
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/lender/interests").then((r) => r.json()).then((d) => { setInterests(d.data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="text-[#546b5e] py-12 text-center text-sm">Loading...</div>;

  return (
    <div>
      <h1 className="text-xl font-semibold text-[#e8f0ec] mb-1">My Interests</h1>
      <p className="text-sm text-[#546b5e] mb-8">Loan requests you&apos;ve expressed interest in</p>

      {interests.length === 0 ? (
        <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] py-20 text-center">
          <p className="text-[#546b5e] text-sm mb-3">No interests yet.</p>
          <Link href="/marketplace" className="text-[#22c55e] text-sm hover:underline">Browse the marketplace →</Link>
        </div>
      ) : (
        <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2d27]">
                {["Borrower","Amount","Status","Date",""].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#546b5e] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d27]">
              {interests.map((i) => (
                <tr key={i.id} className="hover:bg-[#1c2620] transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-medium text-[#e8f0ec]">{i.loanRequest.locationCity}, {i.loanRequest.locationState}</p>
                    <p className="text-xs text-[#546b5e]">{i.loanRequest.industry}</p>
                  </td>
                  <td className="px-5 py-4 text-[#8fa899]">{fmt(i.loanRequest.requestedAmountMin)}–{fmt(i.loanRequest.requestedAmountMax)}</td>
                  <td className="px-5 py-4"><Badge label={i.status} color={statusColor[i.status] ?? "gray"} /></td>
                  <td className="px-5 py-4 text-[#546b5e]">{new Date(i.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 flex items-center gap-3">
                    {i.status === "ACCEPTED" && i.conversation && (
                      <Link href={`/conversations/${i.conversation.id}`} className="text-xs text-[#22c55e] hover:underline">Open chat →</Link>
                    )}
                    <Link href={`/marketplace/${i.loanRequest.id}`} className="text-xs text-[#546b5e] hover:text-[#8fa899]">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
