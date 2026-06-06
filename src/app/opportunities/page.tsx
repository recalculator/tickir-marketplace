"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function OpportunitiesPage() {
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/lender/interests")
      .then((r) => r.json())
      .then((d) => { setInterests(d.data ?? []); setLoading(false); });
  }, []);

  const statusColor: Record<string, "indigo" | "green" | "red" | "gray"> = {
    INTERESTED: "indigo",
    ACCEPTED: "green",
    DECLINED: "red",
    WITHDRAWN: "gray",
  };

  if (loading) return <div className="text-gray-500 py-12 text-center">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">My Interests</h1>
      <p className="text-sm text-gray-500 mb-8">Loan requests you&apos;ve expressed interest in</p>

      {interests.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-gray-200 text-gray-500">
          You haven&apos;t expressed interest in any loan requests yet.{" "}
          <Link href="/marketplace" className="text-indigo-600 hover:underline">Browse the marketplace</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {interests.map((i) => (
            <div key={i.id} className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-semibold text-gray-900">
                      {i.loanRequest.locationCity}, {i.loanRequest.locationState} · {i.loanRequest.industry}
                    </p>
                    <Badge label={i.status} color={statusColor[i.status] ?? "gray"} />
                  </div>
                  <p className="text-sm text-gray-500">
                    {fmt(i.loanRequest.requestedAmountMin)} – {fmt(i.loanRequest.requestedAmountMax)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {i.status === "ACCEPTED" && i.conversation && (
                    <Link href={`/conversations/${i.conversation.id}`} className="text-sm text-indigo-600 hover:underline">
                      Open chat →
                    </Link>
                  )}
                  <Link href={`/marketplace/${i.loanRequest.id}`} className="text-sm text-gray-500 hover:text-gray-900">
                    View request
                  </Link>
                </div>
              </div>
              {i.introMessage && (
                <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg p-3">{i.introMessage}</p>
              )}
              <p className="text-xs text-gray-400 mt-3">{new Date(i.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
