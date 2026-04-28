// Shared primitive UI components used across all flows
import { useState, useRef, useEffect } from "react";
import { NAVY, DARK, ACCENT, CONVENTIONS } from "../constants.js";
import Icon from "./Icon.jsx";

// Common label style
export const L = {
  display: "block", fontSize: "11px", fontWeight: 700,
  textTransform: "uppercase", letterSpacing: "0.08em",
  color: "#64748b", marginBottom: "5px",
};

// Common input style
export const I = {
  width: "100%", background: "#f8fafc", border: "1.5px solid #e2e8f0",
  borderRadius: "8px", padding: "10px 14px", fontSize: "13.5px",
  color: "#0f172a", outline: "none", boxSizing: "border-box",
  transition: "border-color 0.15s",
};

// ─── Step progress bar with circles + connectors ──────────────────────────────
export function StepBar({ steps, current }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "28px" }}>
      {steps.map((s, i) => (
        <div key={s} style={{ display: "flex", alignItems: "flex-start", flex: i < steps.length - 1 ? 1 : undefined }}>
          {/* Circle + label */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
            <div style={{
              width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
              background: i < current ? ACCENT : i === current ? DARK : "#e8edf4",
              color: i < current ? DARK : i === current ? "#fff" : "#94a3b8",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "11px",
              boxShadow: i === current ? `0 0 0 4px rgba(0,230,118,0.18)` : "none",
              transition: "all 0.25s",
            }}>
              {i < current
                ? <Icon name="Check" size={13} strokeWidth={2.5} color={DARK} />
                : <span>{i + 1}</span>}
            </div>
            <span style={{
              fontSize: "8px", fontWeight: i === current ? 700 : 500,
              color: i < current ? "#16a34a" : i === current ? DARK : "#94a3b8",
              textTransform: "uppercase", letterSpacing: "0.07em",
              textAlign: "center", lineHeight: 1.2, maxWidth: "52px",
            }}>
              {s}
            </span>
          </div>
          {/* Connector line to next step */}
          {i < steps.length - 1 && (
            <div style={{
              flex: 1, height: "2px",
              background: i < current ? ACCENT : "#e2e8f0",
              marginTop: "13px", minWidth: "6px",
              transition: "background 0.3s",
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Text / date input field ───────────────────────────────────────────────────
export function Field({ label, name, form, onChange, type = "text", placeholder = "", colSpan, note }) {
  return (
    <div style={{ marginBottom: "13px", gridColumn: colSpan ? "1/-1" : undefined }}>
      <label style={L}>
        {label}
        {note && <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none", marginLeft: "6px" }}>{note}</span>}
      </label>
      <input
        type={type} name={name} value={form[name] || ""} onChange={onChange}
        placeholder={placeholder} style={I}
        onFocus={e => e.target.style.borderColor = ACCENT}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      />
    </div>
  );
}

// ─── Select / dropdown field ───────────────────────────────────────────────────
export function Sel({ label, name, form, onChange, options, colSpan }) {
  return (
    <div style={{ marginBottom: "13px", gridColumn: colSpan ? "1/-1" : undefined }}>
      <label style={L}>{label}</label>
      <select
        name={name} value={form[name] || ""} onChange={onChange}
        style={{ ...I, cursor: "pointer" }}
        onFocus={e => e.target.style.borderColor = ACCENT}
        onBlur={e => e.target.style.borderColor = "#e2e8f0"}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─── Yes / No toggle ──────────────────────────────────────────────────────────
export function Toggle({ label, name, form, onToggle }) {
  const val = form[name];
  return (
    <div style={{ marginBottom: "13px", gridColumn: "1/-1" }}>
      <label style={L}>{label}</label>
      <div style={{ display: "flex", gap: "8px" }}>
        {[{ v: true, t: "Oui" }, { v: false, t: "Non" }].map(({ v, t }) => (
          <button key={t} onClick={() => onToggle(name, v)} style={{
            flex: 1, padding: "9px", borderRadius: "8px", cursor: "pointer",
            fontSize: "13px", fontWeight: 600,
            border: `1.5px solid ${val === v ? ACCENT : "#e2e8f0"}`,
            background: val === v ? "rgba(0,230,118,0.08)" : "#fafafa",
            color: val === v ? "#065f46" : "#64748b",
            transition: "all 0.15s",
          }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Section title with numbered badge ────────────────────────────────────────
export function STitle({ num, children, style: extraStyle = {} }) {
  return (
    <h2 style={{ margin: "0 0 18px", fontSize: "15px", color: "#0f172a", fontWeight: 700, display: "flex", alignItems: "center", gap: "10px", ...extraStyle }}>
      <span style={{
        background: DARK, color: ACCENT,
        borderRadius: "6px", padding: "2px 9px",
        fontSize: "11px", fontWeight: 800, flexShrink: 0,
        letterSpacing: "0.04em",
      }}>{num}</span>
      {children}
    </h2>
  );
}

// ─── Clickable clause / benefit toggle card ────────────────────────────────────
export function ToggleCard({ item, selected, onToggle }) {
  const on = selected.includes(item.id);
  return (
    <button onClick={() => onToggle(item.id)} style={{
      textAlign: "left", padding: "11px 14px", borderRadius: "9px",
      cursor: "pointer", width: "100%",
      border: `1.5px solid ${on ? ACCENT : "#e2e8f0"}`,
      background: on ? "rgba(0,230,118,0.07)" : "#fafafa",
      transition: "all 0.15s", display: "flex", alignItems: "center", gap: "10px",
    }}>
      <span style={{ color: on ? "#065f46" : "#94a3b8", flexShrink: 0, display: "flex" }}>
        <Icon name={item.icon} size={15} strokeWidth={1.75} />
      </span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: on ? "#065f46" : "#374151" }}>{item.label}</span>
      {on && (
        <span style={{ marginLeft: "auto", color: ACCENT, display: "flex", flexShrink: 0 }}>
          <Icon name="Check" size={14} strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
}

// ─── Searchable nationality / generic dropdown ────────────────────────────────
export function SearchSelect({ label, name, form, onChange, options, colSpan, placeholder }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase())).slice(0, 50);

  return (
    <div style={{ marginBottom: "13px", gridColumn: colSpan ? "1/-1" : undefined }} ref={ref}>
      <label style={L}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          value={open ? search : (form[name] || "")}
          placeholder={placeholder || "Rechercher…"}
          onFocus={() => { setOpen(true); setSearch(""); }}
          onChange={e => setSearch(e.target.value)}
          style={{ ...I, paddingRight: "36px" }}
          onBlurCapture={() => {}}
        />
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "12px", pointerEvents: "none" }}>▼</span>
        {open && (
          <div style={{ position: "absolute", zIndex: 200, top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", maxHeight: "220px", overflowY: "auto" }}>
            {filtered.map(o => (
              <div key={o} onClick={() => { onChange({ target: { name, value: o } }); setOpen(false); }}
                style={{ padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "#0f172a", borderBottom: "1px solid #f1f5f9" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,230,118,0.07)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {o}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: "12px 14px", color: "#94a3b8", fontSize: "13px" }}>Aucun résultat</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Convention collective searchable field ────────────────────────────────────
export function CCNField({ form, onChange }) {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState(false);
  const ref = useRef();

  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const filtered = CONVENTIONS.filter(c => c.toLowerCase().includes(search.toLowerCase()));

  if (custom) return (
    <div style={{ marginBottom: "13px", gridColumn: "1/-1" }}>
      <label style={L}>Convention collective</label>
      <div style={{ display: "flex", gap: "8px" }}>
        <input value={form.convention || ""} onChange={e => onChange({ target: { name: "convention", value: e.target.value } })} placeholder="Saisir la convention collective" style={{ ...I, flex: 1 }} />
        <button onClick={() => setCustom(false)} style={{ padding: "0 12px", border: "1.5px solid #e2e8f0", borderRadius: "8px", background: "#f8fafc", cursor: "pointer", color: "#64748b", fontSize: "12px", whiteSpace: "nowrap" }}>← Liste</button>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: "13px", gridColumn: "1/-1" }} ref={ref}>
      <label style={L}>Convention collective</label>
      <div style={{ position: "relative" }}>
        <input value={open ? search : (form.convention || "")} placeholder="Rechercher une convention collective…"
          onFocus={() => { setOpen(true); setSearch(""); }} onChange={e => setSearch(e.target.value)}
          style={{ ...I, paddingRight: "36px" }} />
        <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", fontSize: "12px", pointerEvents: "none" }}>▼</span>
        {open && (
          <div style={{ position: "absolute", zIndex: 100, top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: "1.5px solid #e2e8f0", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.1)", maxHeight: "220px", overflowY: "auto" }}>
            {filtered.map(c => (
              <div key={c} onClick={() => {
                if (c === "Autre / Saisir manuellement") { setCustom(true); setOpen(false); }
                else { onChange({ target: { name: "convention", value: c } }); setOpen(false); }
              }}
                style={{ padding: "10px 14px", fontSize: "13px", cursor: "pointer", color: "#0f172a", borderBottom: "1px solid #f1f5f9" }}
                onMouseEnter={e => e.currentTarget.style.background = "rgba(0,230,118,0.07)"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {c}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
