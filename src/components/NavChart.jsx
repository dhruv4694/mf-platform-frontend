import { useState, useEffect } from "react";
import { T } from "../tokens.js";
import { NavApi } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Spinner } from "./ui/index.jsx";
import { fmt, daysAgo, today } from "../utils/format.js";

/**
 * NavChart renders an SVG line chart of NAV history for a given scheme.
 *
 * Why SVG and not a library?
 * Keeps the frontend dependency-free beyond React itself.
 * The chart is simple enough (one line, hover tooltip) that a custom SVG
 * implementation is more instructive and avoids a heavy chart bundle.
 *
 * The chart uses a natural SVG coordinate system — values mapped to a
 * 0-100 viewBox height, dates mapped to 0-100 width, then scaled
 * to the actual rendered pixel dimensions.
 */
export function NavChart({ schemeId, schemeName }) {
  const { token } = useAuth();
  const [navData, setNavData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState("1Y"); // 1M, 3M, 6M, 1Y, ALL
  const [tooltip, setTooltip] = useState(null); // { x, y, date, value }

  useEffect(() => {
    if (!schemeId) return;
    setLoading(true);

    const from = {
      "1M":  daysAgo(30),
      "3M":  daysAgo(90),
      "6M":  daysAgo(180),
      "1Y":  daysAgo(365),
      "ALL": null,
    }[period];

    NavApi.getHistory(token, schemeId, from, today())
      .then(data => setNavData(data || []))
      .catch(() => setNavData([]))
      .finally(() => setLoading(false));
  }, [schemeId, period]);

  if (loading) return <Spinner size={24} />;
  if (navData.length < 2) return (
    <div style={{ padding: 24, color: T.slate, textAlign: "center", fontSize: 13 }}>
      Not enough NAV data to display chart. Import NAV history first.
    </div>
  );

  // Chart dimensions
  const W = 600, H = 200, PAD = { top: 12, right: 16, bottom: 28, left: 60 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  // Data range
  const values = navData.map(d => d.navValue);
  const minV = Math.min(...values) * 0.99;
  const maxV = Math.max(...values) * 1.01;

  // Map data point to SVG coordinates
  const xOf = i => PAD.left + (i / (navData.length - 1)) * innerW;
  const yOf = v => PAD.top + innerH - ((v - minV) / (maxV - minV)) * innerH;

  // Build SVG path
  const points = navData.map((d, i) => `${xOf(i)},${yOf(d.navValue)}`);
  const linePath = `M ${points.join(" L ")}`;
  const fillPath = `${linePath} L ${xOf(navData.length - 1)},${PAD.top + innerH} L ${xOf(0)},${PAD.top + innerH} Z`;

  // Return direction (positive = green, negative = red)
  const first = navData[0]?.navValue;
  const last  = navData[navData.length - 1]?.navValue;
  const isUp  = last >= first;
  const lineColor = isUp ? T.emerald : T.rose;
  const changePct = first ? (((last - first) / first) * 100).toFixed(2) : 0;

  // Y axis labels (3 evenly spaced)
  const yLabels = [maxV, (maxV + minV) / 2, minV];

  // X axis labels (first, middle, last date)
  const xLabels = [
    { i: 0, label: navData[0]?.navDate },
    { i: Math.floor(navData.length / 2), label: navData[Math.floor(navData.length / 2)]?.navDate },
    { i: navData.length - 1, label: navData[navData.length - 1]?.navDate },
  ];

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const svgX = ((e.clientX - rect.left) / rect.width) * W;
    const index = Math.round(((svgX - PAD.left) / innerW) * (navData.length - 1));
    const clamped = Math.max(0, Math.min(navData.length - 1, index));
    const d = navData[clamped];
    if (d) setTooltip({ x: xOf(clamped), y: yOf(d.navValue), date: d.navDate, value: d.navValue });
  };

  return (
    <div>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: T.slate, marginBottom: 4 }}>NAV History</div>
          <div style={{ fontSize: 22, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
            {fmt(last)}
          </div>
          <div style={{ fontSize: 13, color: isUp ? "#065F46" : "#9F1239", fontWeight: 600, marginTop: 2 }}>
            {isUp ? "▲" : "▼"} {Math.abs(changePct)}% over period
          </div>
        </div>

        {/* Period selector */}
        <div style={{ display: "flex", gap: 4 }}>
          {["1M","3M","6M","1Y","ALL"].map(p => (
            <button key={p} onClick={() => setPeriod(p)} style={{
              padding: "5px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
              border: `1.5px solid ${p === period ? T.navy : T.border}`,
              background: p === period ? T.navy : "transparent",
              color: p === period ? T.white : T.slate,
              cursor: "pointer",
            }}>{p}</button>
          ))}
        </div>
      </div>

      {/* SVG chart */}
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: "100%", height: "auto", overflow: "visible", cursor: "crosshair" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        {/* Y axis labels */}
        {yLabels.map((v, i) => (
          <text key={i} x={PAD.left - 8} y={yOf(v) + 4}
            textAnchor="end" fontSize={10} fill={T.slate}>
            {fmt(v).replace("₹","₹")}
          </text>
        ))}

        {/* Horizontal grid lines */}
        {yLabels.map((v, i) => (
          <line key={i}
            x1={PAD.left} y1={yOf(v)} x2={PAD.left + innerW} y2={yOf(v)}
            stroke={T.border} strokeWidth={1} strokeDasharray="4,4" />
        ))}

        {/* X axis labels */}
        {xLabels.map(({ i, label }) => (
          <text key={i} x={xOf(i)} y={H - 6}
            textAnchor="middle" fontSize={10} fill={T.slate}>
            {label}
          </text>
        ))}

        {/* Fill area under the line */}
        <path d={fillPath} fill={lineColor} opacity={0.08} />

        {/* The NAV line */}
        <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} />

        {/* Tooltip dot + label */}
        {tooltip && (
          <>
            <line
              x1={tooltip.x} y1={PAD.top} x2={tooltip.x} y2={PAD.top + innerH}
              stroke={T.slate} strokeWidth={1} strokeDasharray="3,3" />
            <circle cx={tooltip.x} cy={tooltip.y} r={4} fill={lineColor} stroke={T.white} strokeWidth={2} />
            {/* Tooltip box */}
            <g transform={`translate(${Math.min(tooltip.x + 8, W - 120)}, ${Math.max(tooltip.y - 40, PAD.top)})`}>
              <rect x={0} y={0} width={110} height={38} rx={6}
                fill={T.navy} opacity={0.92} />
              <text x={8} y={14} fontSize={10} fill={T.slateL}>{tooltip.date}</text>
              <text x={8} y={30} fontSize={12} fontWeight={700} fill={T.white}
                style={{ fontVariantNumeric: "tabular-nums" }}>
                {fmt(tooltip.value)}
              </text>
            </g>
          </>
        )}
      </svg>
    </div>
  );
}
