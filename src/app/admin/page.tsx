"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function AdminPage() {
  const [lenders, setLenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newLender, setNewLender] = useState({ name: "", websiteUrl: "", location: "" });
  const [inviteState, setInviteState] = useState<Record<string, { email: string; loading: boolean; done: boolean }>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createMsg, setCreateMsg] = useState("");

  async function loadLenders() {
    const res = await fetch("/api/v1/admin/lenders").then((r) => r.json());
    setLenders(res.data ?? []);
    setLoading(false);
  }

  useEffect(() => { loadLenders(); }, []);

  async function handleCreateLender(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/v1/lenders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newLender),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) {
      setLenders((prev) => [data.data, ...prev]);
      setNewLender({ name: "", websiteUrl: "", location: "" });
      setShowCreateForm(false);
      setCreateMsg("Lender created.");
      setTimeout(() => setCreateMsg(""), 3000);
    }
  }

  async function handleApprove(lenderId: string) {
    await fetch(`/api/v1/admin/lenders/${lenderId}/approve`, { method: "PUT" });
    setLenders((prev) => prev.map((l) => l.id === lenderId ? { ...l, status: "ACTIVE" } : l));
  }

  async function handleSuspend(lenderId: string) {
    if (!confirm("Suspend this lender?")) return;
    await fetch(`/api/v1/admin/lenders/${lenderId}/suspend`, { method: "PUT" });
    setLenders((prev) => prev.map((l) => l.id === lenderId ? { ...l, status: "SUSPENDED" } : l));
  }

  async function handleInvite(lenderId: string) {
    const state = inviteState[lenderId];
    if (!state?.email) return;
    setInviteState((prev) => ({ ...prev, [lenderId]: { ...prev[lenderId], loading: true } }));
    await fetch(`/api/v1/lenders/${lenderId}/invite`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: state.email }),
    });
    setInviteState((prev) => ({ ...prev, [lenderId]: { email: "", loading: false, done: true } }));
    setTimeout(() => setInviteState((prev) => ({ ...prev, [lenderId]: { ...prev[lenderId], done: false } })), 3000);
  }

  const statusColor: Record<string, "yellow" | "green" | "red"> = {
    PENDING_APPROVAL: "yellow",
    ACTIVE: "green",
    SUSPENDED: "red",
  };

  if (loading) return <div className="text-gray-500 py-12 text-center">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-sm text-gray-500 mt-1">Manage lender institutions</p>
        </div>
        <div className="flex items-center gap-3">
          {createMsg && <span className="text-sm text-green-600">{createMsg}</span>}
          <Button onClick={() => setShowCreateForm((v) => !v)}>
            {showCreateForm ? "Cancel" : "+ New Lender"}
          </Button>
        </div>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateLender} className="bg-white rounded-xl border border-gray-200 p-6 mb-6 flex flex-col gap-4">
          <h2 className="font-semibold text-gray-900">Create Lender Institution</h2>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Name" id="lname" value={newLender.name} onChange={(e) => setNewLender((p) => ({ ...p, name: e.target.value }))} required />
            <Input label="Website" id="lwebsite" type="url" placeholder="https://..." value={newLender.websiteUrl} onChange={(e) => setNewLender((p) => ({ ...p, websiteUrl: e.target.value }))} />
            <Input label="Location" id="llocation" placeholder="City, State" value={newLender.location} onChange={(e) => setNewLender((p) => ({ ...p, location: e.target.value }))} />
          </div>
          <Button type="submit" loading={creating} className="self-start">Create lender</Button>
        </form>
      )}

      <div className="flex flex-col gap-4">
        {lenders.length === 0 && (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-200 text-gray-500">
            No lenders yet. Create one above.
          </div>
        )}
        {lenders.map((lender) => (
          <div key={lender.id} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-semibold text-gray-900">{lender.name}</h2>
                  <Badge label={lender.status} color={statusColor[lender.status] ?? "gray"} />
                </div>
                <p className="text-sm text-gray-500">
                  {lender.location ?? "—"} {lender.websiteUrl && <> · <a href={lender.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{lender.websiteUrl}</a></>}
                </p>
                <p className="text-xs text-gray-400 mt-1">{lender.members?.length ?? 0} member{lender.members?.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="flex gap-2">
                {lender.status === "PENDING_APPROVAL" && (
                  <Button size="sm" onClick={() => handleApprove(lender.id)}>Approve</Button>
                )}
                {lender.status === "ACTIVE" && (
                  <Button size="sm" variant="danger" onClick={() => handleSuspend(lender.id)}>Suspend</Button>
                )}
                {lender.status === "SUSPENDED" && (
                  <Button size="sm" variant="secondary" onClick={() => handleApprove(lender.id)}>Reinstate</Button>
                )}
              </div>
            </div>

            {/* Invite user */}
            <div className="border-t border-gray-100 pt-4 flex items-center gap-3">
              <Input
                id={`invite-${lender.id}`}
                placeholder="Invite user by email"
                type="email"
                className="flex-1 max-w-xs"
                value={inviteState[lender.id]?.email ?? ""}
                onChange={(e) => setInviteState((prev) => ({ ...prev, [lender.id]: { ...prev[lender.id], email: e.target.value, loading: false, done: false } }))}
              />
              <Button
                size="sm"
                variant="secondary"
                loading={inviteState[lender.id]?.loading}
                onClick={() => handleInvite(lender.id)}
                disabled={!inviteState[lender.id]?.email}
              >
                Send invite
              </Button>
              {inviteState[lender.id]?.done && <span className="text-sm text-green-600">Invited!</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
