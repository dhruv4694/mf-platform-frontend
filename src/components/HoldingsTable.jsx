import { T } from "../tokens.js";
import { Badge, ReturnPill, TableHead, TD, Empty } from "./ui/index.jsx";
import { fmt, fmtUnits } from "../utils/format.js";

/**
 * HoldingsTable renders the scheme position breakdown for a folio or portfolio.
 * Reused on Dashboard (summary), Portfolio (per-folio), and FolioPortfolio pages.
 */
export function HoldingsTable({ holdings }) {
  if (!holdings?.length) {
    return <Empty msg="No holdings yet. Make your first purchase to start building your portfolio." />;
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table>
        <TableHead columns={["Scheme", "Category", "Units", "Invested", "Current Value", "Return", "NAV"]} />
        <tbody>
          {holdings.map(h => (
            <tr key={h.holdingId || h.schemeId} style={{ borderBottom: `1px solid ${T.border}` }}>
              <TD>
                <div style={{ fontWeight: 600 }}>{h.schemeName}</div>
                <div style={{ fontSize: 12, color: T.slate, marginTop: 2 }}>{h.schemeCode}</div>
              </TD>
              <TD><Badge label={h.schemeCategory} color="navy" /></TD>
              <TD style={{ fontVariantNumeric: "tabular-nums", fontFamily: "monospace", fontSize: 13 }}>
                {fmtUnits(h.unitsHeld)}
              </TD>
              <TD style={{ fontVariantNumeric: "tabular-nums" }}>{fmt(h.investedAmount)}</TD>
              <TD style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>{fmt(h.currentValue)}</TD>
              <TD><ReturnPill pct={h.absoluteReturnPct} /></TD>
              <TD style={{ color: T.slate }}>
                <div>{fmt(h.latestNavValue)}</div>
                <div style={{ fontSize: 11, marginTop: 2 }}>{h.latestNavDate}</div>
              </TD>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
