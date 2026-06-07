"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const CATEGORY_LABELS: Record<string, string> = {
  TAX_RETURN: "Tax return",
  BANK_STATEMENT: "Bank statement",
  FINANCIAL_STATEMENT: "Financial statement",
  BUSINESS_LICENSE: "Business license",
  ID_VERIFICATION: "ID verification",
  OTHER: "Other",
};

export default function MarketplaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const [req, setReq] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showInterestForm, setShowInterestForm] = useState(false);
  const [introMessage, setIntroMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [myInterest, setMyInterest] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/v1/loan-requests/${id}`)
      .then((r) => r.json())
      .then((d) => {
        setReq(d.data);
        const mine = d.data?.interests?.find((i: any) => i.lenderId === session?.user?.lenderId);
        setMyInterest(mine ?? null);
        setLoading(false);
      });
  }, [id, session]);

  async function handleExpressInterest() {
    setSubmitting(true);
    setError("");
    const res = await fetch(`/api/v1/loan-requests/${id}/interests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ introMessage }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error ?? "Failed."); return; }
    setMyInterest(data.data);
    setShowInterestForm(false);
  }

  async function handleWithdraw() {
    if (!confirm("Withdraw your interest?")) return;
    await fetch(`/api/v1/interests/${myInterest.id}/withdraw`, { method: "PUT" });
    setMyInterest((prev: any) => ({ ...prev, status: "WITHDRAWN" }));
  }

  if (loading) return <div className="text-[#546b5e] py-12 text-center text-sm">Loading...</div>;
  if (!req) return <div className="text-[#546b5e] py-12 text-center text-sm">Not found.</div>;

  const matched = myInterest?.status === "ACCEPTED";

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#546b5e] mb-6">
        <Link href="/marketplace" className="hover:text-[#e8f0ec]">Marketplace</Link>
        <span>/</span>
        <span className="text-[#8fa899]">{req.businessName}</span>
      </div>

      <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#e8f0ec] mb-1">{req.businessName}</h1>
            <p className="text-[#546b5e]">{req.locationCity}, {req.locationState} · {req.industry}</p>
          </div>
          <p className="text-xl font-bold text-[#22c55e]">{fmt(req.requestedAmountMin)} – {fmt(req.requestedAmountMax)}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 py-6 border-y border-[#1f2d27] mb-6">
          <div><p className="text-xs text-[#546b5e] uppercase tracking-wide mb-1">Revenue</p><p className="font-medium text-[#e8f0ec]">{req.revenueBand}</p></div>
          <div><p className="text-xs text-[#546b5e] uppercase tracking-wide mb-1">Years in Business</p><p className="font-medium text-[#e8f0ec]">{req.yearsInBusiness}</p></div>
          <div><p className="text-xs text-[#546b5e] uppercase tracking-wide mb-1">Purpose</p><p className="font-medium text-[#e8f0ec]">{req.loanPurposeShort}</p></div>
        </div>

        <p className="text-[#8fa899] leading-relaxed">{req.loanPurposeDetails}</p>
      </div>

      {/* Borrower documents — visible only once matched */}
      {matched && (
        <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-6 mb-6">
          <h3 className="text-sm font-semibold text-[#e8f0ec] mb-1">Borrower documents</h3>
          <p className="text-xs text-[#546b5e] mb-4">Shared by the borrower now that you&apos;re matched.</p>
          {req.borrowerDocuments?.length ? (
            <ul className="flex flex-col gap-1.5">
              {req.borrowerDocuments.map((d: any) => (
                <li key={d.id} className="flex items-center justify-between rounded-lg bg-[#1c2620] px-3 py-2 text-xs">
                  <span className="text-[#8fa899]">
                    <span className="text-[#e8f0ec] font-medium">{CATEGORY_LABELS[d.category] ?? d.category}</span>
                    {" · "}{d.fileName} <span className="text-[#546b5e]">· {fmtSize(d.sizeBytes)}</span>
                  </span>
                  <a href={`/api/v1/documents/${d.id}/download`} target="_blank" rel="noreferrer" className="text-[#22c55e] hover:underline">View</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-[#546b5e]">The borrower hasn&apos;t uploaded any documents yet.</p>
          )}
        </div>
      )}

      {/* Interest actions */}
      <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-6">
        {!myInterest || myInterest.status === "WITHDRAWN" ? (
          <>
            {showInterestForm ? (
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-[#e8f0ec]">Express interest</h3>
                <textarea
                  className="rounded-lg border border-[#2a3830] bg-[#0f1512] px-3 py-2 text-sm text-[#e8f0ec] placeholder:text-[#546b5e] focus:outline-none focus:ring-2 focus:ring-[#22c55e]/40"
                  rows={4}
                  placeholder="Introduce yourself and your institution. Why are you a good fit for this borrower?"
                  value={introMessage}
                  onChange={(e) => setIntroMessage(e.target.value)}
                />
                {error && <p className="text-sm text-red-400">{error}</p>}
                <div className="flex gap-3">
                  <Button onClick={handleExpressInterest} loading={submitting}>Send interest</Button>
                  <Button variant="ghost" onClick={() => setShowInterestForm(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-[#546b5e]">Interested in this borrower?</p>
                <Button onClick={() => setShowInterestForm(true)}>Express interest</Button>
              </div>
            )}
          </>
        ) : myInterest.status === "INTERESTED" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge label="Interest sent" color="indigo" />
              <p className="text-sm text-[#546b5e]">Waiting for the borrower to respond.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleWithdraw}>Withdraw</Button>
          </div>
        ) : myInterest.status === "ACCEPTED" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge label="Matched!" color="green" />
              <p className="text-sm text-[#8fa899]">You&apos;re matched with this borrower.</p>
            </div>
            {myInterest.conversation && (
              <Link href={`/conversations/${myInterest.conversation.id}`}>
                <Button>Open chat →</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Badge label={myInterest.status} color="gray" />
            <p className="text-sm text-[#546b5e]">This interest is no longer active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
