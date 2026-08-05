import { useState } from "react";
import { T } from "../tokens.js";
import { Card, Btn, Alert, Input, SectionHeader, Stat } from "../components/ui/index.jsx";
import { useApi, useMutation } from "../hooks/useApi.js";
import { today } from "../utils/format.js";

// ─── AdminPage ────────────────────────────────────────────────────────────────
// Business date control + End-of-Day settlement trigger. ADMIN only.
export function AdminPage() {
  const { data, loading, refresh } = useApi("/admin/business-date");
  const businessDate = data?.businessDate;

  const [newDate, setNewDate] = useState("");
  const { mutate: advance, loading: advancing, error: advanceErr, reset: resetAdvance } = useMutation();

  const { mutate: runEod, loading: running, error: runErr, reset: resetRun } = useMutation();
  const [summary, setSummary] = useState(null);

  const handleAdvance = async e => {
    e.preventDefault();
    resetAdvance();
    try {
      const res = await advance(api => api("/admin/business-date", {
        method: "PUT",
        body: JSON.stringify({ date: newDate }),
      }));
      setNewDate("");
      refresh();
    } catch {}
  };

  const handleRunEod = async () => {
    resetRun();
    setSummary(null);
    try {
      const res = await runEod(api => api("/admin/eod/run", {
        method: "POST",
        body: JSON.stringify({}),
      }));
      setSummary(res);
    } catch {}
  };

  return (
    <div>
      <SectionHeader title="Admin" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Business Date</h3>
          {loading ? null : (
            <div style={{ marginBottom: 20 }}>
              <Stat label="Current Business Date" value={businessDate} />
            </div>
          )}
          <Alert msg={advanceErr} />
          <form onSubmit={handleAdvance} style={{
            display: "flex", flexDirection: "column", gap: 14,
            marginTop: advanceErr ? 16 : 0,
          }}>
            <Input label="Advance To" type="date" value={newDate}
              onChange={setNewDate} min={businessDate || today()} required />
            <Btn type="submit" disabled={advancing || !newDate}>
              {advancing ? "Advancing…" : "Advance Business Date"}
            </Btn>
          </form>
        </Card>

        <Card>
          <h3 style={{ fontWeight: 600, marginBottom: 8 }}>Run End-of-Day Settlement</h3>
          <p style={{ fontSize: 13, color: T.slate, marginBottom: 16 }}>
            Settles every PENDING transaction stamped with the current business date —
            payment → NAV → allotment. Anything whose scheme has no NAV published yet
            stays PENDING; rerun after importing it.
          </p>
          <Alert msg={runErr} />
          <Btn variant="gold" onClick={handleRunEod} disabled={running} style={{ marginBottom: summary ? 20 : 0 }}>
            {running ? "Running EOD…" : "Run EOD"}
          </Btn>

          {summary && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Stat label="Processed" value={summary.processed} />
              <Stat label="Allotted" value={summary.allotted} accent={T.emerald} />
              <Stat label="Failed" value={summary.failed} accent={summary.failed > 0 ? T.rose : undefined} />
              <Stat label="Pending (no NAV)" value={summary.pendingNoNav} accent={summary.pendingNoNav > 0 ? T.gold : undefined} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
