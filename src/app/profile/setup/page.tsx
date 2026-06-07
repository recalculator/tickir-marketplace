"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface DocumentRow {
  id: string;
  category: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

const CATEGORIES: { key: string; label: string; description: string; required: boolean }[] = [
  { key: "TAX_RETURN", label: "Tax returns", description: "Last 2 years of business tax returns", required: true },
  { key: "BANK_STATEMENT", label: "Bank statements", description: "Last 3-6 months of business bank statements", required: true },
  { key: "ID_VERIFICATION", label: "ID verification", description: "Government-issued photo ID of the business owner", required: true },
  { key: "FINANCIAL_STATEMENT", label: "Financial statements", description: "Profit & loss, balance sheet (if available)", required: false },
  { key: "BUSINESS_LICENSE", label: "Business license", description: "Active state or local business license", required: false },
  { key: "OTHER", label: "Other supporting documents", description: "Anything else that strengthens your application", required: false },
];

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ProfileSetupPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [finishing, setFinishing] = useState(false);

  async function load() {
    const res = await fetch("/api/v1/documents").then((r) => r.json());
    setDocuments(res.data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleUpload(category: string, file: File) {
    setError("");
    setUploadingFor(category);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", category);
    const res = await fetch("/api/v1/documents", { method: "POST", body: formData });
    const data = await res.json();
    setUploadingFor(null);
    if (!res.ok) { setError(data.error ?? "Upload failed."); return; }
    await load();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/v1/documents/${id}`, { method: "DELETE" });
    await load();
  }

  async function handleFinish() {
    setError("");
    setFinishing(true);
    const res = await fetch("/api/v1/users/me/complete-profile", { method: "POST" });
    const data = await res.json();
    setFinishing(false);
    if (!res.ok) { setError(data.error ?? "Could not complete profile."); return; }
    router.push("/dashboard");
  }

  const docsByCategory = documents.reduce<Record<string, DocumentRow[]>>((acc, d) => {
    (acc[d.category] ||= []).push(d);
    return acc;
  }, {});
  const requiredKeys = CATEGORIES.filter((c) => c.required).map((c) => c.key);
  const requiredDone = requiredKeys.filter((k) => (docsByCategory[k]?.length ?? 0) > 0).length;
  const allRequiredDone = requiredDone === requiredKeys.length;

  if (loading) return <div className="text-[#546b5e] py-12 text-center text-sm">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-[#e8f0ec] mb-1">Set up your profile</h1>
      <p className="text-sm text-[#546b5e] mb-2">
        Upload the documents lenders typically require to evaluate a loan application. You can add more later from your profile.
      </p>
      <p className="text-xs text-[#8fa899] mb-8">
        {requiredDone} of {requiredKeys.length} required document types uploaded
      </p>

      {error && (
        <div className="mb-6 rounded-lg bg-red-900/20 border border-red-800/40 px-3 py-2 text-sm text-red-400">{error}</div>
      )}

      <div className="flex flex-col gap-4">
        {CATEGORIES.map((cat) => {
          const docs = docsByCategory[cat.key] ?? [];
          const isUploading = uploadingFor === cat.key;
          return (
            <section key={cat.key} className="rounded-xl border border-[#1f2d27] bg-[#161d19] p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-sm font-semibold text-[#e8f0ec]">{cat.label}</h2>
                    {cat.required ? (
                      <Badge label="Required" color="green" />
                    ) : (
                      <Badge label="Optional" color="gray" />
                    )}
                    {docs.length > 0 && <Badge label="Uploaded" color="indigo" />}
                  </div>
                  <p className="text-xs text-[#546b5e]">{cat.description}</p>
                </div>
                <label className="shrink-0">
                  <input
                    type="file"
                    accept="application/pdf,image/png,image/jpeg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(cat.key, file);
                      e.target.value = "";
                    }}
                  />
                  <span className="inline-flex items-center justify-center gap-2 font-medium transition-all rounded-lg px-3 py-1.5 text-xs bg-[#1c2620] text-[#e8f0ec] border border-[#2a3830] hover:bg-[#212e28] cursor-pointer">
                    {isUploading ? "Uploading..." : "Upload file"}
                  </span>
                </label>
              </div>

              {docs.length > 0 && (
                <ul className="flex flex-col gap-1.5">
                  {docs.map((d) => (
                    <li key={d.id} className="flex items-center justify-between rounded-lg bg-[#1c2620] px-3 py-2 text-xs">
                      <span className="text-[#8fa899] truncate">{d.fileName} <span className="text-[#546b5e]">· {fmtSize(d.sizeBytes)}</span></span>
                      <button onClick={() => handleDelete(d.id)} className="text-[#546b5e] hover:text-red-400 transition-colors">Remove</button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-[#546b5e]">
          {allRequiredDone ? "All required documents are uploaded." : "Upload all required document types to finish setup."}
        </p>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>Skip for now</Button>
          <Button onClick={handleFinish} loading={finishing} disabled={!allRequiredDone}>Finish setup</Button>
        </div>
      </div>
    </div>
  );
}
