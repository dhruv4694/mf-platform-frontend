// ─── SipPage ──────────────────────────────────────────────────────────────────
import { useState } from "react";
import { T } from "../tokens.js";
import {
  Card, Btn, Alert, Spinner, Empty, Modal,
  Input, Select, TableHead, TD, SectionHeader, StatusBadge, Badge, ReturnPill, Stat, AllocationBar
} from "../components/ui/index.jsx";
import { HoldingsTable } from "../components/HoldingsTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi, useMutation } from "../hooks/useApi.js";
import { fmt, fmtDate, today } from "../utils/format.js";

export function SipPage() {
  const { user } = useAuth();
  const { data, loading, refresh } = useApi("/sip-mandates/my?size=30");
  const mandates = data?.content || [];
  const [showForm, setShowForm] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const { mutate: doAction, error: actionError } = useMutation();

  const handleAction = async (id, action) => {
    try {
      await doAction(api => {
        if (action === "cancel") return api(`/sip-mandates/${id}`, { method: "DELETE" });
        return api(`/sip-mandates/${id}/${action}`, { method: "PUT" });
      });
      refresh();
    } catch {}
  };

  const onRegister = (msg) => { setShowForm(false); setSuccessMsg(msg); refresh(); setTimeout(() => setSuccessMsg(""), 5000); };

  return (
    <div>
      <SectionHeader title="SIP Mandates"
        action={user?.role === "INVESTOR" ? () => setShowForm(!showForm) : null}
        actionLabel={showForm ? "Cancel" : "↺ New SIP"}
        actionVariant="gold"
      />
      <Alert msg={successMsg} type="success" />
      <Alert msg={actionError} />
      {(successMsg || actionError) && <div style={{ height: 16 }} />}

      {showForm && <SipRegisterModal onClose={() => setShowForm(false)} onDone={onRegister} />}

      {loading ? <Spinner /> : (
        <Card>
          {mandates.length === 0 ? (
            <Empty
              msg="No SIP mandates. Set up a SIP to invest a fixed amount regularly."
              action={user?.role === "INVESTOR" ? () => setShowForm(true) : null}
              actionLabel="Register your first SIP"
            />
          ) : (
            <table>
              <TableHead columns={["Mandate Ref", "Amount", "Frequency", "Schedule", "Next Due", "Status", "Actions"]} />
              <tbody>
                {mandates.map(m => (
                  <tr key={m.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <TD style={{ fontSize: 12, color: T.slate, fontFamily: "monospace" }}>{m.mandateReference}</TD>
                    <TD style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>{fmt(m.amount)}</TD>
                    <TD><Badge label={m.frequency} color="navy" /></TD>
                    <TD style={{ fontSize: 13, color: T.slate }}>{m.scheduleDescription}</TD>
                    <TD style={{ fontSize: 13 }}>{m.nextDueDate}</TD>
                    <TD><StatusBadge status={m.status} /></TD>
                    <TD>
                      {m.status === "ACTIVE" && user?.role === "INVESTOR" && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn size="sm" variant="ghost" onClick={() => handleAction(m.id, "pause")}>Pause</Btn>
                          <Btn size="sm" variant="danger" onClick={() => {
                            if (confirm("Cancel this SIP? This is permanent.")) handleAction(m.id, "cancel");
                          }}>Cancel</Btn>
                        </div>
                      )}
                      {m.status === "PAUSED" && user?.role === "INVESTOR" && (
                        <Btn size="sm" variant="success" onClick={() => handleAction(m.id, "resume")}>Resume</Btn>
                      )}
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}
    </div>
  );
}

function SipRegisterModal({ onClose, onDone }) {
  const { data: folioData } = useApi("/folios?size=50");
  const { data: schemeData } = useApi("/schemes?size=50");
  const folios  = folioData?.content || [];
  const schemes = schemeData?.content || [];

  const [form, setForm] = useState({
    folioId: "", schemeId: "", amount: "2000",
    frequency: "MONTHLY", startDate: today(), endDate: "", sipDay: "5",
  });
  const { mutate, loading, error } = useMutation();
  const isMonthly = form.frequency === "MONTHLY";

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await mutate(api => api("/sip-mandates", {
        method: "POST",
        body: JSON.stringify({
          folioId: Number(form.folioId), schemeId: Number(form.schemeId),
          amount: Number(form.amount), frequency: form.frequency,
          startDate: form.startDate, endDate: form.endDate || null,
          sipDay: isMonthly ? Number(form.sipDay) : null,
        }),
      }));
      onDone(`SIP registered — Mandate ref: ${res.mandateReference}. ${res.scheduleDescription}.`);
    } catch {}
  };

  return (
    <Modal title="Register SIP" onClose={onClose}>
      <Alert msg={error} />
      {error && <div style={{ height: 16 }} />}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Select label="Folio" value={form.folioId} onChange={v => set("folioId", v)}
          placeholder="Select a folio" required
          options={folios.map(f => ({ value: f.id, label: f.folioNumber }))} />
        <Select label="Scheme" value={form.schemeId} onChange={v => set("schemeId", v)}
          placeholder="Select a scheme" required
          options={schemes.map(s => ({ value: s.id, label: s.schemeName }))} />
        <Input label="Amount per Installment (₹)" type="number" value={form.amount}
          onChange={v => set("amount", v)} min="500" required />
        <Select label="Frequency" value={form.frequency} onChange={v => set("frequency", v)}
          options={["WEEKLY","MONTHLY","QUARTERLY"]} required />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Input label="Start Date" type="date" value={form.startDate}
            onChange={v => set("startDate", v)} required />
          {isMonthly ? (
            <Input label="Day of Month" type="number" value={form.sipDay}
              onChange={v => set("sipDay", v)} min="1" max="31" required />
          ) : (
            <Input label="End Date (optional)" type="date" value={form.endDate}
              onChange={v => set("endDate", v)} />
          )}
        </div>
        {isMonthly && (
          <Input label="End Date (optional)" type="date" value={form.endDate}
            onChange={v => set("endDate", v)} />
        )}
        {!isMonthly && (
          <div style={{ fontSize: 12, color: T.slate }}>
            {form.frequency} SIPs use a fixed schedule (not a day you choose) —
            you'll see the exact deduction days once the mandate is registered.
          </div>
        )}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" variant="gold" disabled={loading}>
            {loading ? "Registering…" : "Register SIP"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─── PortfolioPage ────────────────────────────────────────────────────────────
export function PortfolioPage() {
  const { data: portfolio, loading } = useApi("/portfolio/me");
  if (loading) return <Spinner />;
  if (!portfolio) return <Empty msg="Could not load portfolio." />;

  return (
    <div>
      <SectionHeader title="My Portfolio" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <Card><Stat label="Total Invested" value={fmt(portfolio.totalInvestedAmount)} /></Card>
        <Card>
          <Stat label="Current Value" value={fmt(portfolio.totalCurrentValue)}
            accent={Number(portfolio.totalCurrentValue) >= Number(portfolio.totalInvestedAmount) ? T.emerald : T.rose} />
        </Card>
        <Card><Stat label="Absolute Return" value={<ReturnPill pct={portfolio.totalAbsoluteReturnPct} />} /></Card>
      </div>

      {portfolio.allocationByCategory?.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Asset Allocation</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {portfolio.allocationByCategory.map(c => (
              <AllocationBar key={c.category} category={c.category} pct={c.allocationPct} />
            ))}
          </div>
        </Card>
      )}

      {portfolio.folios?.map(folio => (
        <Card key={folio.folioId} style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <div>
              <h3 style={{ fontWeight: 700, fontFamily: "monospace", fontSize: 16 }}>{folio.folioNumber}</h3>
              <span style={{ fontSize: 13, color: T.slate }}>{fmt(folio.totalCurrentValue)} current value</span>
            </div>
            <ReturnPill pct={folio.totalAbsoluteReturnPct} />
          </div>
          <HoldingsTable holdings={folio.holdings} />
        </Card>
      ))}
    </div>
  );
}

// ─── ClientsPage (distributor) ────────────────────────────────────────────────
export function ClientsPage() {
  const { data: clients, loading } = useApi("/portfolio/distributor/book");
  if (loading) return <Spinner />;

  return (
    <div>
      <SectionHeader title="My Clients" />
      <Card>
        {!clients?.length ? <Empty msg="No clients yet." /> : (
          <table>
            <TableHead columns={["Client","Email","Invested","Current Value","Return","Schemes","Active SIPs"]} />
            <tbody>
              {clients.map(c => (
                <tr key={c.investorId} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <TD style={{ fontWeight: 600 }}>{c.investorName}</TD>
                  <TD style={{ fontSize: 13, color: T.slate }}>{c.email}</TD>
                  <TD style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(c.totalInvestedAmount)}</TD>
                  <TD style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmt(c.totalCurrentValue)}</TD>
                  <TD><ReturnPill pct={c.totalAbsoluteReturnPct} /></TD>
                  <TD style={{ textAlign: "center" }}>{c.activeSchemeCount}</TD>
                  <TD style={{ textAlign: "center" }}>
                    {c.activeSipCount > 0 ? <Badge label={c.activeSipCount} color="gold" /> : <span style={{ color: T.slate }}>—</span>}
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ─── NavPage (admin) ──────────────────────────────────────────────────────────
export function NavPage() {
  const { data: schemeData } = useApi("/schemes?size=50");
  const schemes = schemeData?.content || [];

  const [singleForm, setSingleForm] = useState({ schemeId: "", navDate: today(), navValue: "" });
  const [bulkForm,   setBulkForm]   = useState({ fromDate: "", toDate: today(), baseNav: "50.00" });
  const { mutate: mutateSingle, loading: l1, error: e1, reset: r1 } = useMutation();
  const { mutate: mutateBulk,   loading: l2, error: e2, reset: r2 } = useMutation();
  const [s1, setS1] = useState(""); const [s2, setS2] = useState("");

  const handleSingle = async e => {
    e.preventDefault(); r1(); setS1("");
    try {
      await mutateSingle(api => api("/nav/import", {
        method: "POST",
        body: JSON.stringify({ schemeId: Number(singleForm.schemeId), navDate: singleForm.navDate, navValue: Number(singleForm.navValue) }),
      }));
      setS1(`NAV of ₹${singleForm.navValue} imported for ${singleForm.navDate}`);
    } catch {}
  };

  const handleBulk = async e => {
    e.preventDefault(); r2(); setS2("");
    try {
      const res = await mutateBulk(api => api("/nav/simulate-bulk", {
        method: "POST",
        body: JSON.stringify({ fromDate: bulkForm.fromDate, toDate: bulkForm.toDate, baseNav: Number(bulkForm.baseNav) }),
      }));
      setS2(`Created ${res.recordsCreated} NAV records from ${res.fromDate} to ${res.toDate}`);
    } catch {}
  };

  return (
    <div>
      <SectionHeader title="Import NAV" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Single NAV Import</h3>
          <Alert msg={e1} /><Alert msg={s1} type="success" />
          <form onSubmit={handleSingle} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: (e1||s1) ? 16 : 0 }}>
            <Select label="Scheme" value={singleForm.schemeId} onChange={v => setSingleForm(f => ({ ...f, schemeId: v }))}
              placeholder="Select scheme" required options={schemes.map(s => ({ value: s.id, label: s.schemeName }))} />
            <Input label="NAV Date" type="date" value={singleForm.navDate}
              onChange={v => setSingleForm(f => ({ ...f, navDate: v }))} required />
            <Input label="NAV Value (₹)" type="number" value={singleForm.navValue}
              onChange={v => setSingleForm(f => ({ ...f, navValue: v }))} placeholder="48.2345" min="0.0001" step="0.0001" required />
            <Btn type="submit" disabled={l1}>{l1 ? "Importing…" : "Import NAV"}</Btn>
          </form>
        </Card>

        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Simulate Historical NAVs</h3>
          <p style={{ fontSize: 13, color: T.slate, marginBottom: 16 }}>
            Generates realistic NAV data for all schemes over a date range using a random walk model. Weekends are skipped automatically.
          </p>
          <Alert msg={e2} /><Alert msg={s2} type="success" />
          <form onSubmit={handleBulk} style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: (e2||s2) ? 16 : 0 }}>
            <Input label="From Date" type="date" value={bulkForm.fromDate}
              onChange={v => setBulkForm(f => ({ ...f, fromDate: v }))} required />
            <Input label="To Date" type="date" value={bulkForm.toDate}
              onChange={v => setBulkForm(f => ({ ...f, toDate: v }))} required />
            <Input label="Base NAV (₹)" type="number" value={bulkForm.baseNav}
              onChange={v => setBulkForm(f => ({ ...f, baseNav: v }))} min="1" step="0.01" required />
            <Btn type="submit" variant="gold" disabled={l2}>{l2 ? "Simulating…" : "Simulate NAVs"}</Btn>
          </form>
        </Card>
      </div>
    </div>
  );
}

// ─── InvestorsPage (admin) ────────────────────────────────────────────────────
export function InvestorsPage() {
  const { data, loading } = useApi("/investors?size=50");
  const investors = data?.content || [];
  if (loading) return <Spinner />;

  return (
    <div>
      <SectionHeader title="Investors" />
      <Card>
        {investors.length === 0 ? <Empty msg="No investors yet." /> : (
          <table>
            <TableHead columns={["Name","Email","PAN","KYC","Distributor","Joined"]} />
            <tbody>
              {investors.map(i => (
                <tr key={i.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <TD style={{ fontWeight: 600 }}>{i.name}</TD>
                  <TD style={{ color: T.slate }}>{i.email}</TD>
                  <TD style={{ fontFamily: "monospace", fontSize: 13 }}>{i.panNumber}</TD>
                  <TD>
                    <Badge label={i.kycComplete ? "Done" : "Pending"}
                      color={i.kycComplete ? "green" : "gold"} />
                  </TD>
                  <TD style={{ fontSize: 13, color: T.slate }}>
                    {i.distributorId ? `Dist #${i.distributorId}` : "Direct"}
                  </TD>
                  <TD style={{ fontSize: 13, color: T.slate }}>{fmtDate(i.createdAt)}</TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}

// ─── DistributorsPage (admin) ─────────────────────────────────────────────────
export function DistributorsPage() {
  const { data, loading, refresh } = useApi("/distributors?size=50");
  const distributors = data?.content || [];
  const { mutate, error } = useMutation();

  const handleAction = async (id, action) => {
    try {
      await mutate(api => api(`/distributors/${id}/${action}`, { method: "PUT" }));
      refresh();
    } catch {}
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <SectionHeader title="Distributors" />
      <Alert msg={error} />
      {error && <div style={{ height: 16 }} />}
      <Card>
        {distributors.length === 0 ? <Empty msg="No distributors yet." /> : (
          <table>
            <TableHead columns={["Name","ARN","Email","Status","Verified","Actions"]} />
            <tbody>
              {distributors.map(d => (
                <tr key={d.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                  <TD style={{ fontWeight: 600 }}>{d.name}</TD>
                  <TD style={{ fontFamily: "monospace", fontSize: 13 }}>{d.arnCode}</TD>
                  <TD style={{ color: T.slate }}>{d.email}</TD>
                  <TD><StatusBadge status={d.status} /></TD>
                  <TD style={{ fontSize: 13, color: T.slate }}>
                    {d.verifiedAt ? fmtDate(d.verifiedAt) : "—"}
                  </TD>
                  <TD>
                    <div style={{ display: "flex", gap: 8 }}>
                      {d.status !== "ACTIVE" && (
                        <Btn size="sm" variant="success" onClick={() => handleAction(d.id, "activate")}>Activate</Btn>
                      )}
                      {d.status === "ACTIVE" && (
                        <Btn size="sm" variant="danger" onClick={() => {
                          if (confirm(`Suspend ${d.name}?`)) handleAction(d.id, "suspend");
                        }}>Suspend</Btn>
                      )}
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
