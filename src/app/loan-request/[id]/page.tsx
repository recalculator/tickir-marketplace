"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

function fmt(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

interface Interest {
  id: string;
  status: string;
  introMessage: string | null;
  createdAt: string;
  lender: { name: string; websiteUrl?: string };
  conversation?: { id: string } | null;
}

interface LoanRequest {
  id: string;
  businessName: string;
  industry: string;
  locationCity: string;
  locationState: string;
  yearsInBusiness: number;
  revenueBand: string;
  requestedAmountMin: number;
  requestedAmountMax: number;
  loanPurposeShort: string;
  loanPurposeDetails: string;
  status: "OPEN" | "CLOSED";
  interests: Interest[];
}

export default function LoanRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session } = useSession();
  const router = useRouter();
  const [req, setReq] = useState<LoanRequest | null>(null);
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/v1/loan-requests/${id}`).then((r) => r.json()),
      fetch(`/api/v1/loan-requests/${id}/interests`).then((r) => r.json()),
    ]).then(([reqData, intData]) => {
      setReq(reqData.data);
      setInterests(intData.data ?? []);
      setLoading(false);
    });
  }, [id]);

  async function handleClose() {
    if (!confirm("Close this loan request? This cannot be undone.")) return;
    await fetch(`/api/v1/loan-requests/${id}/close`, { method: "PUT" });
    router.push("/dashboard");
  }

  async function handleInterest(interestId: string, action: "accept" | "decline") {
    setActioning(interestId);
    await fetch(`/api/v1/interests/${interestId}/${action}`, { method: "PUT" });
    // Refresh interests
    const data = await fetch(`/api/v1/loan-requests/${id}/interests`).then((r) => r.json());
    setInterests(data.data ?? []);
    setActioning(null);
  }

  if (loading) return <div className="text-[#546b5e] py-12 text-center text-sm">Loading...</div>;
  if (!req) return <div className="text-[#546b5e] py-12 text-center text-sm">Not found.</div>;

  const isBorrower = session?.user?.role === "BORROWER";
  const accepted = interests.find((i) => i.status === "ACCEPTED");

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 text-sm text-[#546b5e] mb-6">
        <Link href="/dashboard" className="hover:text-[#e8f0ec]">Dashboard</Link>
        <span>/</span>
        <span>{req.businessName}</span>
      </div>

      <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-8 mb-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-[#e8f0ec]">{req.businessName}</h1>
              <Badge label={req.status} color={req.status === "OPEN" ? "green" : "gray"} />
            </div>
            <p className="text-[#546b5e]">{req.locationCity}, {req.locationState} · {req.industry}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[#22c55e]">{fmt(req.requestedAmountMin)} – {fmt(req.requestedAmountMax)}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 py-6 border-y border-[#1f2d27] mb-6">
          <div><p className="text-xs text-[#546b5e] uppercase tracking-wide mb-1">Revenue</p><p className="font-medium text-[#e8f0ec]">{req.revenueBand}</p></div>
          <div><p className="text-xs text-[#546b5e] uppercase tracking-wide mb-1">Years in Business</p><p className="font-medium text-[#e8f0ec]">{req.yearsInBusiness}</p></div>
          <div><p className="text-xs text-[#546b5e] uppercase tracking-wide mb-1">Purpose</p><p className="font-medium text-[#e8f0ec]">{req.loanPurposeShort}</p></div>
        </div>

        <p className="text-[#8fa899] leading-relaxed">{req.loanPurposeDetails}</p>

        {isBorrower && req.status === "OPEN" && (
          <div className="mt-6 flex justify-end">
            <Button variant="danger" size="sm" onClick={handleClose}>Close request</Button>
          </div>
        )}
      </div>

      {isBorrower && (
        <div>
          <h2 className="text-sm font-semibold text-[#e8f0ec] uppercase tracking-wide mb-4">
            Lender Interest ({interests.length})
          </h2>
          {interests.length === 0 ? (
            <div className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-8 text-center text-[#546b5e] text-sm">
              No lenders have expressed interest yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {interests.map((interest) => (
                <div key={interest.id} className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-[#e8f0ec]">{interest.lender.name}</p>
                      {interest.lender.websiteUrl && (
                        <a href={interest.lender.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[#22c55e] hover:underline">{interest.lender.websiteUrl}</a>
                      )}
                    </div>
                    <Badge
                      label={interest.status}
                      color={interest.status === "ACCEPTED" ? "green" : interest.status === "DECLINED" ? "red" : interest.status === "WITHDRAWN" ? "gray" : "indigo"}
                    />
                  </div>
                  {interest.introMessage && (
                    <p className="text-sm text-[#8fa899] mt-3 bg-[#1c2620] rounded-lg p-3">{interest.introMessage}</p>
                  )}
                  <div className="mt-4 flex items-center gap-3">
                    {interest.status === "INTERESTED" && (
                      <>
                        <Button size="sm" loading={actioning === interest.id} onClick={() => handleInterest(interest.id, "accept")}>Accept</Button>
                        <Button size="sm" variant="secondary" loading={actioning === interest.id} onClick={() => handleInterest(interest.id, "decline")}>Decline</Button>
                      </>
                    )}
                    {interest.status === "ACCEPTED" && interest.conversation && (
                      <Link href={`/conversations/${interest.conversation.id}`}>
                        <Button size="sm" variant="secondary">Open chat →</Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
