"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface LoanRequest {
  id: string;
  businessName: string;
  industry: string;
  locationCity: string;
  locationState: string;
  requestedAmountMin: number;
  requestedAmountMax: number;
  loanPurposeShort: string;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  interests: { id: string; status: string; lender: { name: string } }[];
}

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/loan-requests/me")
      .then((r) => r.json())
      .then((d) => { setRequests(d.data ?? []); setLoading(false); });
  }, []);

  if (loading) return <div className="text-gray-500 py-12 text-center">Loading...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Loan Requests</h1>
          <p className="text-sm text-gray-500 mt-1">Track your applications and lender interest</p>
        </div>
        <Link href="/loan-request/new">
          <Button>+ New Request</Button>
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">You haven&apos;t posted any loan requests yet.</p>
          <Link href="/loan-request/new">
            <Button>Post your first request</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {requests.map((req) => {
            const interested = req.interests.filter((i) => i.status === "INTERESTED").length;
            const accepted = req.interests.find((i) => i.status === "ACCEPTED");
            return (
              <Link key={req.id} href={`/loan-request/${req.id}`}>
                <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="font-semibold text-gray-900">{req.businessName}</h2>
                        <Badge
                          label={req.status}
                          color={req.status === "OPEN" ? "green" : "gray"}
                        />
                      </div>
                      <p className="text-sm text-gray-500">
                        {req.locationCity}, {req.locationState} · {req.industry}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatAmount(req.requestedAmountMin)} – {formatAmount(req.requestedAmountMax)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">{req.loanPurposeShort}</p>
                  <div className="mt-4 flex items-center gap-4 text-sm">
                    {accepted ? (
                      <span className="text-green-700 font-medium">
                        ✓ Matched with {accepted.lender.name}
                      </span>
                    ) : (
                      <span className="text-indigo-600 font-medium">
                        {interested} lender{interested !== 1 ? "s" : ""} interested
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
