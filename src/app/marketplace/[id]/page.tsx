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

  if (loading) return <div className="text-gray-500 py-12 text-center">Loading...</div>;
  if (!req) return <div className="text-gray-500 py-12 text-center">Not found.</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/marketplace" className="hover:text-gray-900">Marketplace</Link>
        <span>/</span>
        <span>{req.businessName}</span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{req.businessName}</h1>
            <p className="text-gray-500">{req.locationCity}, {req.locationState} · {req.industry}</p>
          </div>
          <p className="text-xl font-bold text-gray-900">{fmt(req.requestedAmountMin)} – {fmt(req.requestedAmountMax)}</p>
        </div>

        <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-100 mb-6">
          <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Revenue</p><p className="font-medium text-gray-900">{req.revenueBand}</p></div>
          <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Years in Business</p><p className="font-medium text-gray-900">{req.yearsInBusiness}</p></div>
          <div><p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Purpose</p><p className="font-medium text-gray-900">{req.loanPurposeShort}</p></div>
        </div>

        <p className="text-gray-700 leading-relaxed">{req.loanPurposeDetails}</p>
      </div>

      {/* Interest actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        {!myInterest || myInterest.status === "WITHDRAWN" ? (
          <>
            {showInterestForm ? (
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-gray-900">Express Interest</h3>
                <textarea
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={4}
                  placeholder="Introduce yourself and your institution. Why are you a good fit for this borrower?"
                  value={introMessage}
                  onChange={(e) => setIntroMessage(e.target.value)}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-3">
                  <Button onClick={handleExpressInterest} loading={submitting}>Send interest</Button>
                  <Button variant="ghost" onClick={() => setShowInterestForm(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">Interested in this borrower?</p>
                <Button onClick={() => setShowInterestForm(true)}>Express interest</Button>
              </div>
            )}
          </>
        ) : myInterest.status === "INTERESTED" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge label="Interest sent" color="indigo" />
              <p className="text-sm text-gray-500">Waiting for the borrower to respond.</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleWithdraw}>Withdraw</Button>
          </div>
        ) : myInterest.status === "ACCEPTED" ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge label="Matched!" color="green" />
              <p className="text-sm text-gray-600">You&apos;re matched with this borrower.</p>
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
            <p className="text-sm text-gray-500">This interest is no longer active.</p>
          </div>
        )}
      </div>
    </div>
  );
}
