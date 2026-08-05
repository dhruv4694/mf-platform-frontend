import { T, statusColor } from "../../tokens.js";

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: T.white,
      borderRadius: T.radiusCard,
      border: `1px solid ${T.border}`,
      padding: 24,
      animation: "fadeIn .2s ease",
      cursor: onClick ? "pointer" : "default",
      transition: onClick ? "box-shadow .15s" : undefined,
      ...style,
    }}
    onMouseEnter={onClick ? e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,.08)" : undefined}
    onMouseLeave={onClick ? e => e.currentTarget.style.boxShadow = "none" : undefined}
    >
      {children}
    </div>
  );
}

// ─── Button ───────────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = "primary", size = "md", disabled, style, type = "button" }) {
  const sizes = {
    sm: { padding: "6px 14px",  fontSize: 13 },
    md: { padding: "10px 20px", fontSize: 14 },
    lg: { padding: "13px 28px", fontSize: 15 },
  };
  const variants = {
    primary: { background: T.navy,    color: T.white },
    success: { background: T.emerald, color: T.white },
    danger:  { background: T.rose,    color: T.white },
    ghost:   { background: "transparent", color: T.navy, border: `1.5px solid ${T.border}` },
    gold:    { background: T.gold,    color: T.white },
    indigo:  { background: T.indigo,  color: T.white },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      fontWeight: 600, borderRadius: T.radiusBtn,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      transition: "opacity .15s, filter .15s",
      border: "none",
      ...sizes[size],
      ...variants[variant],
      ...style,
    }}
    onMouseEnter={!disabled ? e => e.currentTarget.style.filter = "brightness(0.92)" : undefined}
    onMouseLeave={!disabled ? e => e.currentTarget.style.filter = "none" : undefined}
    >
      {children}
    </button>
  );
}

// ─── Badge ────────────────────────────────────────────────────────────────────
const BADGE_COLORS = {
  green:  { bg: T.emeraldL, fg: "#065F46" },
  red:    { bg: T.roseL,    fg: "#9F1239" },
  gold:   { bg: T.goldL,    fg: "#92400E" },
  slate:  { bg: T.border,   fg: T.slate   },
  navy:   { bg: T.indigoL,  fg: "#3730A3" },
  indigo: { bg: T.indigoL,  fg: "#3730A3" },
};

export function Badge({ label, color = "slate" }) {
  const c = BADGE_COLORS[color] || BADGE_COLORS.slate;
  return (
    <span style={{
      background: c.bg, color: c.fg,
      borderRadius: T.radiusBadge,
      padding: "3px 10px", fontSize: 12, fontWeight: 600,
      display: "inline-block",
    }}>{label}</span>
  );
}

export function StatusBadge({ status }) {
  return <Badge label={status} color={statusColor(status)} />;
}

// ─── Return pill ──────────────────────────────────────────────────────────────
export function ReturnPill({ pct }) {
  if (pct == null) return <span style={{ color: T.slate }}>—</span>;
  const pos = Number(pct) >= 0;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      background: pos ? T.emeraldL : T.roseL,
      color: pos ? "#065F46" : "#9F1239",
      borderRadius: T.radiusBadge, padding: "3px 10px",
      fontSize: 13, fontWeight: 600,
      fontVariantNumeric: "tabular-nums",
    }}>
      {pos ? "▲" : "▼"} {Math.abs(Number(pct)).toFixed(2)}%
    </span>
  );
}

// ─── Stat ─────────────────────────────────────────────────────────────────────
export function Stat({ label, value, sub, accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{
        fontSize: 11, color: T.slate, fontWeight: 600,
        textTransform: "uppercase", letterSpacing: ".06em",
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 26, fontWeight: 700,
        color: accent || T.text,
        fontVariantNumeric: "tabular-nums",
        lineHeight: 1.1,
      }}>
        {value}
      </span>
      {sub && <span style={{ fontSize: 13, color: T.slate }}>{sub}</span>}
    </div>
  );
}

// ─── Input ────────────────────────────────────────────────────────────────────
export function Input({ label, type = "text", value, onChange, placeholder, required, min, step, style }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
          {label}{required && <span style={{ color: T.rose }}> *</span>}
        </label>
      )}
      <input
        type={type} value={value} required={required} min={min} step={step}
        onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{
          padding: "10px 14px", borderRadius: T.radiusInput,
          border: `1.5px solid ${T.border}`,
          fontSize: 14, color: T.text, background: T.white,
          outline: "none", transition: "border-color .15s",
          ...style,
        }}
        onFocus={e => e.target.style.borderColor = T.navy}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );
}

// ─── Select ───────────────────────────────────────────────────────────────────
export function Select({ label, value, onChange, options, required, placeholder }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && (
        <label style={{ fontSize: 13, fontWeight: 600, color: T.text }}>
          {label}{required && <span style={{ color: T.rose }}> *</span>}
        </label>
      )}
      <select value={value} onChange={e => onChange(e.target.value)} required={required}
        style={{
          padding: "10px 14px", borderRadius: T.radiusInput,
          border: `1.5px solid ${T.border}`,
          fontSize: 14, color: value ? T.text : T.slate,
          background: T.white, outline: "none",
          appearance: "auto",
        }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => (
          <option key={o.value ?? o} value={o.value ?? o}>
            {o.label ?? o}
          </option>
        ))}
      </select>
    </div>
  );
}

// ─── Alert ────────────────────────────────────────────────────────────────────
export function Alert({ msg, type = "error" }) {
  if (!msg) return null;
  const s = {
    error:   { bg: T.roseL,    color: "#9F1239", icon: "✕" },
    success: { bg: T.emeraldL, color: "#065F46", icon: "✓" },
    warn:    { bg: T.goldL,    color: "#92400E", icon: "!" },
    info:    { bg: T.indigoL,  color: "#3730A3", icon: "i" },
  }[type];
  return (
    <div style={{
      background: s.bg, color: s.color,
      borderRadius: T.radiusInput, padding: "10px 14px",
      fontSize: 13, fontWeight: 500,
      display: "flex", alignItems: "flex-start", gap: 8,
      animation: "fadeIn .2s ease",
    }}>
      <span style={{ fontWeight: 700 }}>{s.icon}</span>
      {msg}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
export function Spinner({ size = 32 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
      <div style={{
        width: size, height: size,
        border: `3px solid ${T.border}`,
        borderTopColor: T.navy,
        borderRadius: "50%",
        animation: "spin .7s linear infinite",
      }} />
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
export function Empty({ msg = "Nothing here yet.", action, actionLabel }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: T.slate }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
      <div style={{ fontWeight: 500, marginBottom: action ? 16 : 0 }}>{msg}</div>
      {action && <Btn onClick={action} size="sm" variant="ghost">{actionLabel}</Btn>}
    </div>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action, actionLabel, actionVariant = "primary" }) {
  return (
    <div style={{
      display: "flex", justifyContent: "space-between",
      alignItems: "center", marginBottom: 24,
    }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.01em" }}>{title}</h1>
      {action && (
        <Btn onClick={action} variant={actionVariant}>{actionLabel}</Btn>
      )}
    </div>
  );
}

// ─── Table primitives ─────────────────────────────────────────────────────────
export function TH({ children, style }) {
  return (
    <th style={{
      padding: "8px 12px", textAlign: "left",
      fontSize: 11, fontWeight: 600, color: T.slate,
      textTransform: "uppercase", letterSpacing: ".06em",
      ...style,
    }}>
      {children}
    </th>
  );
}

export function TD({ children, style }) {
  return (
    <td style={{ padding: "12px 12px", fontSize: 14, ...style }}>
      {children}
    </td>
  );
}

export function TableHead({ columns }) {
  return (
    <thead>
      <tr style={{ borderBottom: `2px solid ${T.border}` }}>
        {columns.map(c => <TH key={c}>{c}</TH>)}
      </tr>
    </thead>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function Modal({ title, children, onClose, width = 480 }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(15,23,42,.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100, animation: "fadeIn .15s ease",
    }}
    onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: T.white, borderRadius: 16,
        padding: 32, width, maxWidth: "90vw",
        maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,.2)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{title}</h2>
          <button onClick={onClose} style={{
            background: "none", border: "none", fontSize: 20,
            cursor: "pointer", color: T.slate, lineHeight: 1,
          }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── Allocation bar ───────────────────────────────────────────────────────────
const CAT_COLORS = { EQUITY: T.emerald, DEBT: T.navy, HYBRID: T.gold };

export function AllocationBar({ category, pct, current }) {
  const color = CAT_COLORS[category] || T.slate;
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 500 }}>{category}</span>
        <span style={{ fontSize: 13, color: T.slate }}>{pct}%</span>
      </div>
      <div style={{ height: 6, background: T.border, borderRadius: 99 }}>
        <div style={{
          height: "100%", borderRadius: 99, background: color,
          width: `${Math.min(Number(pct), 100)}%`,
          transition: "width .6s ease",
        }} />
      </div>
    </div>
  );
}
