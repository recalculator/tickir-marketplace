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

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export default function DashboardPage() {
  const [requests, setRequests] = useState<LoanRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(true);

  useEffect(() => {
    fetch("/api/v1/loan-requests/me").then((r) => r.json()).then((d) => { setRequests(d.data ?? []); setLoading(false); });
    fetch("/api/v1/auth/me").then((r) => r.json()).then((d) => { setProfileComplete(Boolean(d.data?.profileComplete)); });
  }, []);

  const open = requests.filter((r) => r.status === "OPEN").length;
  const totalInterest = requests.reduce((a, r) => a + r.interests.filter(i => i.status === "INTERESTED").length, 0);
  const matched = requests.filter((r) => r.interests.some(i => i.status === "ACCEPTED")).length;

  if (loading) return <div className="text-[#546b5e] py-12 text-center text-sm">Loading...</div>;

  return (
    <div>
      {/* Profile setup prompt */}
      {!profileComplete && (
        <div className="mb-6 rounded-xl border border-[#22c55e]/30 bg-[#22c55e]/5 px-5 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-[#e8f0ec]">Finish setting up your profile</p>
            <p className="text-xs text-[#8fa899] mt-0.5">Upload your tax returns, bank statements, and ID so lenders can move faster on your requests.</p>
          </div>
          <Link href="/profile/setup" className="shrink-0">
            <Button size="sm">Complete profile</Button>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-semibold text-[#e8f0ec]">My Loan Requests</h1>
          <p className="text-sm text-[#546b5e] mt-0.5">Track your applications and lender interest</p>
        </div>
        <Link href="/loan-request/new">
          <Button>+ New Request</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Open requests", value: open },
          { label: "Lenders interested", value: totalInterest },
          { label: "Matched", value: matched },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-5">
            <p className="text-2xl font-bold text-[#e8f0ec]">{value}</p>
            <p className="text-xs text-[#546b5e] mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {requests.length === 0 ? (
        <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] py-24 text-center">
          <p className="text-[#546b5e] text-sm mb-4">No loan requests yet.</p>
          <Link href="/loan-request/new"><Button>Post your first request</Button></Link>
        </div>
      ) : (
        <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#1f2d27]">
                {["Business", "Type", "Amount", "Stage", "Interest", "Idle"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-medium text-[#546b5e] uppercase tracking-wide">{h}</th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2d27]">
              {requests.map((req) => {
                const interested = req.interests.filter((i) => i.status === "INTERESTED").length;
                const accepted = req.interests.find((i) => i.status === "ACCEPTED");
                const idle = Math.floor((Date.now() - new Date(req.createdAt).getTime()) / 86400000);
                return (
                  <tr key={req.id} className="hover:bg-[#1c2620] transition-colors cursor-pointer" onClick={() => window.location.href = `/loan-request/${req.id}`}>
                    <td className="px-5 py-4">
                      <p className="font-medium text-[#e8f0ec]">{req.businessName}</p>
                      <p className="text-xs text-[#546b5e]">{req.locationCity}, {req.locationState}</p>
                    </td>
                    <td className="px-5 py-4 text-[#8fa899]">{req.industry}</td>
                    <td className="px-5 py-4 font-medium text-[#e8f0ec]">
                      {fmt(req.requestedAmountMin)}–{fmt(req.requestedAmountMax)}
                    </td>
                    <td className="px-5 py-4">
                      <Badge label={req.status} color={req.status === "OPEN" ? "green" : "gray"} />
                    </td>
                    <td className="px-5 py-4 text-[#8fa899]">
                      {accepted ? (
                        <span className="text-[#22c55e] text-xs font-medium">Matched — {accepted.lender.name}</span>
                      ) : (
                        <span>{interested}</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-[#8fa899]">{idle}d</td>
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
