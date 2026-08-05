import { T } from "../tokens.js";
import { Card, Btn, Spinner, Empty, TableHead, TD, SectionHeader, Alert } from "../components/ui/index.jsx";
import { useApi, useMutation } from "../hooks/useApi.js";
import { fmtDate } from "../utils/format.js";

export function FoliosPage() {
  const { data, loading, refresh } = useApi("/folios?size=50");
  const folios = data?.content || [];
  const { mutate, loading: creating, error, reset } = useMutation();

  const handleCreate = async () => {
    try {
      await mutate(api => api("/folios", { method: "POST", body: JSON.stringify({}) }));
      refresh();
    } catch {}
  };

  return (
    <div>
      <SectionHeader
        title="My Folios"
        action={handleCreate}
        actionLabel={creating ? "Creating…" : "+ New Folio"}
      />

      <Alert msg={error} />
      {error && <div style={{ height: 16 }} />}

      {loading ? <Spinner /> : (
        <Card>
          {folios.length === 0 ? (
            <Empty
              msg="No folios yet. A folio is required before you can purchase any scheme."
              action={handleCreate}
              actionLabel="Create your first folio"
            />
          ) : (
            <table>
              <TableHead columns={["Folio Number", "Created"]} />
              <tbody>
                {folios.map(f => (
                  <tr key={f.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                    <TD>
                      <div style={{ fontWeight: 600, fontFamily: "monospace", fontSize: 15 }}>
                        {f.folioNumber}
                      </div>
                    </TD>
                    <TD style={{ color: T.slate }}>{fmtDate(f.createdAt)}</TD>
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
