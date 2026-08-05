import { T } from "../tokens.js";
import { Card, Stat, Spinner, Empty, AllocationBar, SectionHeader } from "../components/ui/index.jsx";
import { HoldingsTable } from "../components/HoldingsTable.jsx";
import { ReturnPill } from "../components/ui/index.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../hooks/useApi.js";
import { fmt } from "../utils/format.js";

export function DashboardPage() {
  const { user } = useAuth();
  const { data: portfolio, loading } = useApi(
    user?.role === "INVESTOR" ? "/portfolio/me" : null
  );

  if (user?.role === "INVESTOR") {
    if (loading) return <Spinner />;
    return <InvestorDashboard portfolio={portfolio} />;
  }
  if (user?.role === "DISTRIBUTOR") return <DistributorDashboard />;
  return <AdminDashboard />;
}

function InvestorDashboard({ portfolio }) {
  const allHoldings = portfolio?.folios?.flatMap(f => f.holdings) || [];

  return (
    <div style={{ animation: "fadeIn .25s ease" }}>
      <SectionHeader title={`Welcome back`} />

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
        <Card>
          <Stat label="Total Invested" value={fmt(portfolio?.totalInvestedAmount)} />
        </Card>
        <Card>
          <Stat
            label="Current Value"
            value={fmt(portfolio?.totalCurrentValue)}
            accent={
              Number(portfolio?.totalCurrentValue) >= Number(portfolio?.totalInvestedAmount)
                ? T.emerald : T.rose
            }
          />
        </Card>
        <Card>
          <Stat label="Total Returns" value={<ReturnPill pct={portfolio?.totalAbsoluteReturnPct} />} />
        </Card>
      </div>

      {/* Asset allocation */}
      {portfolio?.allocationByCategory?.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Asset Allocation</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {portfolio.allocationByCategory.map(c => (
              <AllocationBar key={c.category} category={c.category} pct={c.allocationPct} current={c.currentValue} />
            ))}
          </div>
        </Card>
      )}

      {/* Holdings */}
      <Card>
        <h2 style={{ fontSize: 15, fontWeight: 600, marginBottom: 20 }}>Holdings</h2>
        {allHoldings.length === 0
          ? <Empty msg="No holdings yet. Make your first purchase to start building your portfolio." />
          : <HoldingsTable holdings={allHoldings} />
        }
      </Card>
    </div>
  );
}

function DistributorDashboard() {
  const { data: me } = useApi("/distributors/me");
  return (
    <div>
      <SectionHeader title="Dashboard" />
      <Card>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>Your distributor profile</div>
          {me && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div><div style={{ fontSize: 12, color: T.slate }}>ARN Code</div><div style={{ fontWeight: 600 }}>{me.arnCode}</div></div>
              <div><div style={{ fontSize: 12, color: T.slate }}>Status</div><div style={{ fontWeight: 600 }}>{me.status}</div></div>
              <div><div style={{ fontSize: 12, color: T.slate }}>Email</div><div>{me.email}</div></div>
              <div><div style={{ fontSize: 12, color: T.slate }}>Verified</div><div>{me.verifiedAt ? new Date(me.verifiedAt).toLocaleDateString("en-IN") : "Pending"}</div></div>
            </div>
          )}
          {me?.status === "PENDING_VERIFICATION" && (
            <div style={{ background: T.goldL, color: "#92400E", borderRadius: 8, padding: "10px 14px", fontSize: 13, marginTop: 8 }}>
              ⏳ Your ARN is being verified. This typically completes within 60 seconds. Refresh to check your status.
            </div>
          )}
          {me?.status === "ACTIVE" && (
            <div style={{ fontSize: 13, color: T.slate }}>
              Use <strong>My Clients</strong> to view your book summary, or <strong>Transactions</strong> to see all activity.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

function AdminDashboard() {
  return (
    <div>
      <SectionHeader title="Admin Dashboard" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { label: "Manage Schemes", desc: "Create and edit mutual fund schemes", page: "schemes" },
          { label: "Import NAV", desc: "Import daily NAVs or simulate history", page: "nav" },
          { label: "View Investors", desc: "Browse all registered investors", page: "investors" },
          { label: "View Distributors", desc: "Manage distributor onboarding", page: "distributors" },
          { label: "All Transactions", desc: "View the full transaction ledger", page: "transactions" },
        ].map(item => (
          <Card key={item.page}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 13, color: T.slate }}>{item.desc}</div>
          </Card>
        ))}
      </div>
    </div>
  );
}
