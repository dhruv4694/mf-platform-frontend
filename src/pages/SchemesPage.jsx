import { useState } from "react";
import { T } from "../tokens.js";
import {
  Card, Btn, Badge, Input, Select, Alert, Spinner, Empty,
  TableHead, TD, Modal, SectionHeader
} from "../components/ui/index.jsx";
import { NavChart } from "../components/NavChart.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi, useMutation } from "../hooks/useApi.js";

export function SchemesPage() {
  const { user } = useAuth();
  const { data, loading, refresh } = useApi("/schemes?size=50");
  const schemes = data?.content || [];

  const [showForm, setShowForm] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null); // for NAV chart modal
  const [form, setForm] = useState({
    schemeName: "", schemeCode: "", category: "EQUITY",
  });
  const { mutate, loading: saving, error: saveErr, reset } = useMutation();

  const handleCreate = async e => {
    e.preventDefault();
    try {
      await mutate(api => api("/schemes", { method: "POST", body: JSON.stringify(form) }));
      setShowForm(false);
      setForm({ schemeName: "", schemeCode: "", category: "EQUITY" });
      refresh();
    } catch {}
  };

  return (
    <div>
      <SectionHeader
        title="Schemes"
        action={user?.role === "ADMIN" ? () => { setShowForm(!showForm); reset(); } : null}
        actionLabel={showForm ? "Cancel" : "+ New Scheme"}
      />

      {showForm && (
        <Card style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Create Scheme</h3>
          <Alert msg={saveErr} />
          <form onSubmit={handleCreate} style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: 16, marginTop: saveErr ? 16 : 0
          }}>
            <Input label="Scheme Name" value={form.schemeName}
              onChange={v => setForm(f => ({ ...f, schemeName: v }))} required />
            <Input label="Scheme Code" value={form.schemeCode}
              onChange={v => setForm(f => ({ ...f, schemeCode: v }))} required />
            <Select label="Category" value={form.category}
              onChange={v => setForm(f => ({ ...f, category: v }))}
              options={["EQUITY","DEBT","HYBRID"]} required />
            <div style={{ gridColumn: "span 2" }}>
              <Btn type="submit" disabled={saving}>{saving ? "Creating…" : "Create Scheme"}</Btn>
            </div>
          </form>
        </Card>
      )}

      {loading ? <Spinner /> : (
        <Card>
          {schemes.length === 0 ? (
            <Empty
              msg="No schemes yet."
              action={user?.role === "ADMIN" ? () => setShowForm(true) : null}
              actionLabel="Create first scheme"
            />
          ) : (
            <table>
              <TableHead columns={["Name", "Code", "Category", "Status", ""]} />
              <tbody>
                {schemes.map(s => (
                  <tr key={s.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <TD>
                      <div style={{ fontWeight: 600 }}>{s.schemeName}</div>
                    </TD>
                    <TD style={{ color: T.slate, fontSize: 13, fontFamily: "monospace" }}>
                      {s.schemeCode}
                    </TD>
                    <TD><Badge label={s.category} color="navy" /></TD>
                    <TD>
                      <Badge
                        label={s.openForPurchase ? "Open" : "Closed"}
                        color={s.openForPurchase ? "green" : "slate"}
                      />
                    </TD>
                    <TD>
                      <Btn size="sm" variant="ghost" onClick={() => setSelectedScheme(s)}>
                        View NAV Chart
                      </Btn>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>
      )}

      {/* NAV chart modal */}
      {selectedScheme && (
        <Modal title={selectedScheme.schemeName} onClose={() => setSelectedScheme(null)} width={680}>
          <NavChart schemeId={selectedScheme.id} schemeName={selectedScheme.schemeName} />
        </Modal>
      )}
    </div>
  );
}
