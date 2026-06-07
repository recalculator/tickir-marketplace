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
          <Link href="/login">
            <Button size="lg" variant="secondary">Sign in</Button>
          </Link>
        </div>
      </div>

      {/* Role chooser */}
      <div className="px-4 pb-24">
        <p className="text-center text-xs font-semibold tracking-widest text-[#546b5e] uppercase mb-8">
          Get started as a...
        </p>
        <div className="mx-auto max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-[#1f2d27] bg-[#161d19] p-8 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#22c55e] uppercase mb-2">Borrower</p>
              <h3 className="text-lg font-semibold text-[#e8f0ec] mb-2">I need a business loan</h3>
              <p className="text-sm text-[#8fa899] leading-relaxed">
                Post your loan request once, get matched with vetted lenders, and manage everything from a single dashboard.
              </p>
            </div>
            <Link href="/register" className="mt-auto">
              <Button className="w-full">Create a borrower account</Button>
            </Link>
          </div>

          <div className="rounded-2xl border border-[#1f2d27] bg-[#161d19] p-8 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold tracking-widest text-[#22c55e] uppercase mb-2">Banker / Lender</p>
              <h3 className="text-lg font-semibold text-[#e8f0ec] mb-2">My institution wants to lend</h3>
              <p className="text-sm text-[#8fa899] leading-relaxed">
                Browse a marketplace of qualified loan requests, express interest, and manage your pipeline from intro to close.
              </p>
            </div>
            <Link href="/register/lender" className="mt-auto">
              <Button className="w-full" variant="secondary">Register your institution</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
