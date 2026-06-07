"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const INDUSTRIES = [
  "Retail","Restaurant / Food Service","Healthcare","Manufacturing",
  "Construction","Real Estate","Technology","Transportation / Logistics",
  "Professional Services","Wholesale / Distribution","Other",
];

const LOAN_TYPES = ["Term Loan","SBA Loan","Line of Credit","Equipment Financing","Invoice Financing","Bridge Loan","Other"];

export default function SettingsPage() {
  const [lender, setLender] = useState<any>(null);
  const [prefs, setPrefs] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [profileMsg, setProfileMsg] = useState("");
  const [prefsMsg, setPrefsMsg] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/lenders/me").then((r) => r.json()),
      fetch("/api/v1/lenders/me/preferences").then((r) => r.json()),
      fetch("/api/v1/lenders/me/members").then((r) => r.json()),
    ]).then(([l, p, m]) => {
      setLender(l.data ?? {});
      setPrefs(p.data ?? { minLoanAmount: "", maxLoanAmount: "", allowedGeographies: [], allowedIndustries: [], loanTypes: [] });
      setMembers(m.data ?? []);
      setLoading(false);
    });
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    await fetch("/api/v1/lenders/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: lender.name, websiteUrl: lender.websiteUrl, location: lender.location }),
    });
    setSavingProfile(false);
    setProfileMsg("Saved!");
    setTimeout(() => setProfileMsg(""), 2000);
  }

  async function savePrefs(e: React.FormEvent) {
    e.preventDefault();
    setSavingPrefs(true);
    await fetch("/api/v1/lenders/me/preferences", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        minLoanAmount: prefs.minLoanAmount ? Number(prefs.minLoanAmount) : null,
        maxLoanAmount: prefs.maxLoanAmount ? Number(prefs.maxLoanAmount) : null,
        allowedGeographies: prefs.allowedGeographies,
        allowedIndustries: prefs.allowedIndustries,
        loanTypes: prefs.loanTypes,
      }),
    });
    setSavingPrefs(false);
    setPrefsMsg("Saved!");
    setTimeout(() => setPrefsMsg(""), 2000);
  }

  function toggleArr(field: "allowedGeographies" | "allowedIndustries" | "loanTypes", val: string) {
    setPrefs((prev: any) => {
      const arr: string[] = prev[field] ?? [];
      return {
        ...prev,
        [field]: arr.includes(val) ? arr.filter((v: string) => v !== val) : [...arr, val],
      };
    });
  }

  async function removeMember(userId: string) {
    if (!confirm("Remove this member?")) return;
    await fetch(`/api/v1/lenders/me/members/${userId}`, { method: "DELETE" });
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  }

  if (loading) return <div className="text-gray-500 py-12 text-center">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <h1 className="text-2xl font-bold text-gray-900">Lender Settings</h1>

      {/* Profile */}
      <section className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Institution Profile</h2>
        <form onSubmit={saveProfile} className="flex flex-col gap-4">
          <Input label="Institution name" id="name" value={lender.name ?? ""} onChange={(e) => setLender((p: any) => ({ ...p, name: e.target.value }))} required />
          <Input label="Website" id="website" type="url" placeholder="https://..." value={lender.websiteUrl ?? ""} onChange={(e) => setLender((p: any) => ({ ...p, websiteUrl: e.target.value }))} />
          <Input label="Location" id="location" placeholder="City, State" value={lender.location ?? ""} onChange={(e) => setLender((p: any) => ({ ...p, location: e.target.value }))} />
          <div className="flex items-center gap-4">
            <Button type="submit" loading={savingProfile}>Save profile</Button>
            {profileMsg && <span className="text-sm text-green-600">{profileMsg}</span>}
          </div>
        </form>
      </section>

      {/* Lending Preferences */}
      <section className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Lending Preferences</h2>
        <p className="text-sm text-gray-500 mb-6">These filters determine which loan requests appear as "Matching" for your institution.</p>
        <form onSubmit={savePrefs} className="flex flex-col gap-6">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min loan amount ($)" id="min" type="number" min="0" value={prefs.minLoanAmount ?? ""} onChange={(e) => setPrefs((p: any) => ({ ...p, minLoanAmount: e.target.value }))} placeholder="e.g. 100000" />
            <Input label="Max loan amount ($)" id="max" type="number" min="0" value={prefs.maxLoanAmount ?? ""} onChange={(e) => setPrefs((p: any) => ({ ...p, maxLoanAmount: e.target.value }))} placeholder="e.g. 5000000" />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">States you lend in</p>
            <div className="flex flex-wrap gap-2">
              {US_STATES.map((s) => (
                <button key={s} type="button"
                  onClick={() => toggleArr("allowedGeographies", s)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                    (prefs.allowedGeographies ?? []).includes(s)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Industries</p>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map((ind) => (
                <button key={ind} type="button"
                  onClick={() => toggleArr("allowedIndustries", ind)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    (prefs.allowedIndustries ?? []).includes(ind)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                  }`}>
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">Loan types</p>
            <div className="flex flex-wrap gap-2">
              {LOAN_TYPES.map((lt) => (
                <button key={lt} type="button"
                  onClick={() => toggleArr("loanTypes", lt)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    (prefs.loanTypes ?? []).includes(lt)
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-600 border-gray-300 hover:border-indigo-400"
                  }`}>
                  {lt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button type="submit" loading={savingPrefs}>Save preferences</Button>
            {prefsMsg && <span className="text-sm text-green-600">{prefsMsg}</span>}
          </div>
        </form>
      </section>

      {/* Members */}
      <section className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Team Members</h2>
        {members.length === 0 ? (
          <p className="text-sm text-gray-500">No members yet.</p>
        ) : (
          <div className="flex flex-col divide-y divide-gray-100">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.user.email}</p>
                  <Badge label={m.role} color={m.role === "ADMIN" ? "indigo" : "gray"} />
                </div>
                <Button variant="ghost" size="sm" onClick={() => removeMember(m.userId)}>Remove</Button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
