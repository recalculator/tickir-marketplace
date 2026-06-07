import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4 relative">
        {/* Subtle radial glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-[#22c55e]/5 blur-3xl" />
        </div>

        <p className="text-xs font-semibold tracking-widest text-[#22c55e] uppercase mb-6">
          Commercial Lending Platform
        </p>
        <h1 className="text-6xl font-bold text-[#e8f0ec] tracking-tight mb-4 leading-tight max-w-3xl">
          Commercial lending,{" "}
          <span className="text-[#22c55e] italic">reimagined.</span>
        </h1>
        <p className="text-lg text-[#8fa899] mb-10 max-w-xl leading-relaxed">
          Connect your business with vetted lenders — transparently,
          efficiently, and without the noise.
        </p>

        <div className="flex items-center gap-3">
          <Link href="/register">
            <Button size="lg">Start free</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">Sign in</Button>
          </Link>
        </div>

        {/* Trust strip */}
        <div className="mt-12 flex items-center gap-3 text-xs text-[#546b5e]">
          <span>Trusted by</span>
          {["First National Bank", "Midwest Community Bank", "Heritage Savings"].map((b) => (
            <span key={b} className="px-3 py-1 rounded-full border border-[#2a3830] text-[#8fa899]">{b}</span>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="border-y border-[#1f2d27] bg-[#161d19]">
        <div className="mx-auto max-w-4xl grid grid-cols-3 divide-x divide-[#1f2d27]">
          {[
            { stat: "10–20 days", label: "Average deal cycle reduction" },
            { stat: ">75%", label: "Matches within lender criteria" },
            { stat: "4–8 hrs", label: "Saved per application" },
          ].map(({ stat, label }) => (
            <div key={stat} className="py-10 px-8 text-center">
              <p className="text-3xl font-bold text-[#22c55e] mb-1">{stat}</p>
              <p className="text-sm text-[#8fa899]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="py-24 px-4">
        <p className="text-center text-xs font-semibold tracking-widest text-[#546b5e] uppercase mb-12">
          How it works
        </p>
        <div className="mx-auto max-w-4xl grid grid-cols-3 gap-6">
          {[
            { color: "border-blue-500/40 bg-blue-900/10", icon: "↑", title: "Post your request", body: "Describe your loan need once. Your business stays anonymous until you choose a lender." },
            { color: "border-yellow-500/40 bg-yellow-900/10", icon: "⚡", title: "Review interest", body: "Vetted lenders express interest with an intro message. You stay in control." },
            { color: "border-[#22c55e]/40 bg-[#22c55e]/10", icon: "✓", title: "Get matched", body: "Accept the best fit. A private conversation opens and underwriting begins." },
          ].map(({ color, icon, title, body }, i) => (
            <div key={i} className={`rounded-2xl border ${color} p-8 flex flex-col gap-4`}>
              <div className="text-2xl">{icon}</div>
              <div>
                <p className="text-xs text-[#546b5e] uppercase tracking-wide mb-2">Step {i + 1}</p>
                <h3 className="font-semibold text-[#e8f0ec] mb-2">{title}</h3>
                <p className="text-sm text-[#8fa899] leading-relaxed">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
