import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <div className="max-w-2xl">
        <h1 className="text-5xl font-bold text-gray-900 tracking-tight mb-6">
          Commercial lending,{" "}
          <span className="text-indigo-600">simplified.</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 leading-relaxed">
          Tickir connects businesses seeking commercial loans with vetted lenders —
          transparently, efficiently, and without the noise.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg">Apply for a loan</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="secondary">Lender login</Button>
          </Link>
        </div>
        <div className="mt-20 grid grid-cols-3 gap-8 text-left border-t border-gray-200 pt-12">
          {[
            { title: "Post your request", body: "Describe your loan need once. Lenders come to you." },
            { title: "Review interest", body: "See which lenders want to work with you. Accept the best fit." },
            { title: "Get funded", body: "Start the full underwriting process with your chosen lender." },
          ].map((step, i) => (
            <div key={i}>
              <div className="text-indigo-600 font-bold text-sm mb-2">Step {i + 1}</div>
              <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
              <p className="text-sm text-gray-500">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
