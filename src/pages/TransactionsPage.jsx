import { useState } from "react";
import { T } from "../tokens.js";
import {
  Card, Btn, Alert, Spinner, Empty, Modal,
  Input, Select, TableHead, TD, SectionHeader, StatusBadge
} from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi, useMutation } from "../hooks/useApi.js";
import { fmt, fmtUnits, fmtDate } from "../utils/format.js";

export function TransactionsPage() {
  const { user } = useAuth();
  const { data, loading, refresh } = useApi("/transactions/my?size=30");
  const transactions = data?.content || [];

  const [modal, setModal] = useState(null); // null | "purchase" | "redemption"
  const [successMsg, setSuccessMsg] = useState("");

  const onDone = (msg) => {
    setModal(null);
    setSuccessMsg(msg);
    refresh();
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" }}>Transactions</h1>
        {user?.role === "INVESTOR" && (
          <div style={{ display: "flex", gap: 10 }}>
            <Btn variant="success" onClick={() => setModal("purchase")}>+ Purchase</Btn>
            <Btn variant="ghost" onClick={() => setModal("redemption")}>− Redeem</Btn>
          </div>
        )}
      </div>

      <Alert msg={successMsg} type="success" />
      {successMsg && <div style={{ height: 16 }} />}

      {loading ? <Spinner /> : (
        <Card>
          {transactions.length === 0 ? (
            <Empty
              msg="No transactions yet."
              action={user?.role === "INVESTOR" ? () => setModal("purchase") : null}
              actionLabel="Make your first purchase"
            />
          ) : (
            <table>
              <TableHead columns={["ID", "Type", "Amount / Units", "Allotted Units", "NAV", "Status", "Date"]} />
              <tbody>
                {transactions.map(t => (
                  <TransactionRow key={t.id} t={t} />
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {modal === "purchase" && (
        <PurchaseModal onClose={() => setModal(null)} onDone={onDone} />
      )}
      {modal === "redemption" && (
        <RedemptionModal onClose={() => setModal(null)} onDone={onDone} />
      )}
    </div>
  );
}

function TransactionRow({ t }) {
  return (
    <tr style={{ borderBottom: `1px solid ${T.border}` }}>
      <TD style={{ color: T.slate, fontSize: 12 }}>#{t.id}</TD>
      <TD>
        <span style={{
          background: t.type === "PURCHASE" ? T.indigoL : T.goldL,
          color: t.type === "PURCHASE" ? "#3730A3" : "#92400E",
          borderRadius: 99, padding: "3px 10px", fontSize: 12, fontWeight: 600,
        }}>
          {t.type}
        </span>
      </TD>
      <TD style={{ fontVariantNumeric: "tabular-nums" }}>
        {t.requestAmount ? fmt(t.requestAmount) : `${fmtUnits(t.requestUnits)} units`}
      </TD>
      <TD style={{ fontVariantNumeric: "tabular-nums", fontSize: 13, color: T.slate }}>
        {t.allottedUnits ? fmtUnits(t.allottedUnits) : "—"}
      </TD>
      <TD style={{ fontSize: 13, color: T.slate }}>
        {t.applicableNavValue ? fmt(t.applicableNavValue) : "—"}
      </TD>
      <TD><StatusBadge status={t.status} /></TD>
      <TD style={{ fontSize: 12, color: T.slate }}>{fmtDate(t.requestedAt)}</TD>
    </tr>
  );
}

// ─── Purchase modal ───────────────────────────────────────────────────────────
function PurchaseModal({ onClose, onDone }) {
  const { data: folioData } = useApi("/folios?size=50");
  const { data: schemeData } = useApi("/schemes?size=50");
  const folios  = folioData?.content || [];
  const schemes = schemeData?.content || [];

  const [folioId,  setFolioId]  = useState("");
  const [schemeId, setSchemeId] = useState("");
  const [amount,   setAmount]   = useState("");
  const { mutate, loading, error } = useMutation();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await mutate(api => api("/transactions/purchase", {
        method: "POST",
        body: JSON.stringify({
          folioId: Number(folioId), schemeId: Number(schemeId),
          amount: Number(amount),
          idempotencyKey: `purchase-${folioId}-${schemeId}-${Date.now()}`,
        }),
      }));
      onDone(
        res.allottedUnits
          ? `Purchase complete — ${fmtUnits(res.allottedUnits)} units allotted at NAV ${fmt(res.applicableNavValue)}`
          : "Purchase initiated — allotment in progress"
      );
    } catch {}
  };

  return (
    <Modal title="New Purchase" onClose={onClose}>
      <Alert msg={error} />
      {error && <div style={{ height: 16 }} />}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Select
          label="Folio" value={folioId} onChange={setFolioId}
          placeholder="Select a folio" required
          options={folios.map(f => ({ value: f.id, label: f.folioNumber }))}
        />
        {folios.length === 0 && (
          <div style={{ fontSize: 12, color: T.rose }}>
            No folios found. Please create a folio first from the "My Folios" page.
          </div>
        )}
        <Select
          label="Scheme" value={schemeId} onChange={setSchemeId}
          placeholder="Select a scheme" required
          options={schemes.map(s => ({ value: s.id, label: s.schemeName }))}
        />
        <Input
          label="Amount (₹)" type="number" value={amount}
          onChange={setAmount} placeholder="5000" min="500" step="0.01" required
        />
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" variant="success" disabled={loading}>
            {loading ? "Processing…" : "Confirm Purchase"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}

// ─── Redemption modal ─────────────────────────────────────────────────────────
function RedemptionModal({ onClose, onDone }) {
  const { data: folioData } = useApi("/folios?size=50");
  const { data: schemeData } = useApi("/schemes?size=50");
  const folios  = folioData?.content || [];
  const schemes = schemeData?.content || [];

  const [folioId,  setFolioId]  = useState("");
  const [schemeId, setSchemeId] = useState("");
  const [mode,     setMode]     = useState("units");  // "units" | "amount"
  const [units,    setUnits]    = useState("");
  const [amount,   setAmount]   = useState("");
  const { mutate, loading, error } = useMutation();

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const body = {
        folioId: Number(folioId), schemeId: Number(schemeId),
        idempotencyKey: `redeem-${folioId}-${schemeId}-${Date.now()}`,
        units:  mode === "units"  ? Number(units)  : null,
        amount: mode === "amount" ? Number(amount) : null,
      };
      const res = await mutate(api => api("/transactions/redemption", {
        method: "POST", body: JSON.stringify(body),
      }));
      onDone(
        res.allottedUnits
          ? `Redemption complete — ${fmtUnits(res.allottedUnits)} units redeemed at NAV ${fmt(res.applicableNavValue)}`
          : "Redemption initiated — processing"
      );
    } catch {}
  };

  return (
    <Modal title="Redeem Units" onClose={onClose}>
      <Alert msg={error} />
      {error && <div style={{ height: 16 }} />}
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Select
          label="Folio" value={folioId} onChange={setFolioId}
          placeholder="Select a folio" required
          options={folios.map(f => ({ value: f.id, label: f.folioNumber }))}
        />
        <Select
          label="Scheme" value={schemeId} onChange={setSchemeId}
          placeholder="Select a scheme" required
          options={schemes.map(s => ({ value: s.id, label: s.schemeName }))}
        />

        {/* Redemption mode toggle */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Redeem by</div>
          <div style={{ display: "flex", gap: 8 }}>
            {[["units","By Units"],["amount","By Amount"]].map(([m, label]) => (
              <button key={m} type="button" onClick={() => setMode(m)} style={{
                padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600,
                border: `1.5px solid ${mode === m ? T.navy : T.border}`,
                background: mode === m ? T.navy : "transparent",
                color: mode === m ? T.white : T.slate,
                cursor: "pointer",
              }}>{label}</button>
            ))}
          </div>
        </div>

        {mode === "units" && (
          <Input
            label="Units to Redeem" type="number" value={units}
            onChange={setUnits} placeholder="50.0000" min="0.0001" step="0.0001" required
          />
        )}
        {mode === "amount" && (
          <Input
            label="Amount to Redeem (₹)" type="number" value={amount}
            onChange={setAmount} placeholder="10000" min="100" step="0.01" required
          />
        )}

        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
          <Btn type="submit" variant="danger" disabled={loading}>
            {loading ? "Processing…" : "Confirm Redemption"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
