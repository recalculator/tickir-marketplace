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
      </div>
    </div>
  );
}
