// Shared primitive UI components used across all flows
import { useState, useRef, useEffect } from "react";
import { NAVY, DARK, ACCENT, CCN_DATA, EXTENDED_CCN } from "../constants.js";
import Icon from "./Icon.jsx";

// ─── Style tokens ─────────────────────────────────────────────────────────────

export const L = {
  display: "block",
  fontSize: "13px",
  fontWeight: 500,
  color: "#374151",
  marginBottom: "6px",
  letterSpacing: "0",
};

export const I = {
  width: "100%",
  background: "#fcfdfe",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  padding: "12px 16px",
  fontSize: "14px",
  color: "#0f172a",
  outline: "none",
  boxSizing: "border-box",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
};

const focusIn = e => {
  e.target.style.background = "#ffffff";
  e.target.style.borderColor = NAVY;
  e.target.style.boxShadow = "0 0 0 4px rgba(30,58,95,0.09)";
};
const focusOut = e => {
  e.target.style.background = "#fcfdfe";
  e.target.style.borderColor = "#e2e8f0";
  e.target.style.boxShadow = "none";
};

// ─── Step progress bar ────────────────────────────────────────────────────────
export function StepBar({ steps, current, onStepClick, stepWarnings = [] }) {
  return (
    <div style={{ marginBottom: "24px" }}>
      {/* Step counter */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: NAVY, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Étape {current + 1} / {steps.length}
        </span>
        <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 500 }}>
          {steps[current]}
        </span>
      </div>

      {/* Progress track */}
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {steps.map((s, i) => {
          const done     = i < current;
          const active   = i === current;
          const warn     = stepWarnings[i] && !active && done;
          const clickable = !!onStepClick;
          return (
            <div key={s} style={{ display: "flex", alignItems: "flex-start", flex: i < steps.length - 1 ? 1 : undefined }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                <div
                  onClick={() => clickable && onStepClick(i)}
                  style={{
                    width: "28px", height: "28px", borderRadius: "50%", flexShrink: 0,
                    background: done
                      ? (warn ? "#fef3c7" : ACCENT)
                      : active ? DARK : "#f1f5f9",
                    color: done
                      ? (warn ? "#92400e" : DARK)
                      : active ? "#fff" : "#94a3b8",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontWeight: 800, fontSize: "11px",
                    border: active
                      ? `2px solid ${DARK}`
                      : done ? `2px solid ${warn ? "#fbbf24" : ACCENT}`
                      : "2px solid #e8edf4",
                    boxShadow: active ? `0 0 0 4px rgba(13,27,46,0.08)` : "none",
                    transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)",
                    cursor: clickable ? "pointer" : "default",
                  }}>
                  {done
                    ? (warn
                        ? <span style={{ fontSize: "11px", fontWeight: 900 }}>!</span>
                        : <Icon name="Check" size={12} strokeWidth={2.5} color={DARK} />)
                    : <span>{i + 1}</span>}
                </div>
                <span style={{
                  fontSize: "9.5px",
                  fontWeight: active ? 700 : done ? 500 : 400,
                  color: active ? DARK : done ? (warn ? "#b45309" : "#16a34a") : "#94a3b8",
                  textAlign: "center", lineHeight: 1.2, maxWidth: "52px",
                }}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div style={{
                  flex: 1, height: "2px", marginTop: "13px", minWidth: "6px",
                  background: i < current ? ACCENT : "#e8edf4",
                  borderRadius: "2px", transition: "background 0.4s",
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Text / date input ────────────────────────────────────────────────────────
export function Field({ label, name, form, onChange, type = "text", placeholder = "", colSpan, note }) {
  return (
    <div style={{ marginBottom: "12px", gridColumn: colSpan ? "1/-1" : undefined }}>
      <label style={L}>
        {label}
        {note && <span style={{ color: "#94a3b8", fontWeight: 400, marginLeft: "6px", fontSize: "12px", letterSpacing: 0 }}>{note}</span>}
      </label>
      <input
        type={type} name={name} value={form[name] || ""} onChange={onChange}
        placeholder={placeholder}
        style={{ ...I, "::placeholder": { color: "#94a3b8" } }}
        onFocus={focusIn} onBlur={focusOut}
      />
    </div>
  );
}

// ─── Select / dropdown ────────────────────────────────────────────────────────
export function Sel({ label, name, form, onChange, options, colSpan }) {
  return (
    <div style={{ marginBottom: "12px", gridColumn: colSpan ? "1/-1" : undefined }}>
      <label style={L}>{label}</label>
      <select
        name={name} value={form[name] || ""} onChange={onChange}
        style={{
          ...I, cursor: "pointer",
          appearance: "none", WebkitAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='11' height='11' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center",
          paddingRight: "38px",
        }}
        onFocus={focusIn} onBlur={focusOut}
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
    <div style={{ marginBottom: "12px", gridColumn: "1/-1" }}>
      <label style={L}>{label}</label>
      <div style={{ display: "flex", gap: "8px" }}>
        {[{ v: true, t: "Oui" }, { v: false, t: "Non" }].map(({ v, t }) => (
          <button key={t} onClick={() => onToggle(name, v)} style={{
            flex: 1, padding: "11px 16px", borderRadius: "10px", cursor: "pointer",
            fontSize: "13.5px", fontWeight: 600,
            border: `1px solid ${val === v ? NAVY : "#e2e8f0"}`,
            background: val === v ? DARK : "#fcfdfe",
            color: val === v ? "#fff" : "#64748b",
            transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
            boxShadow: val === v ? `0 0 0 4px rgba(30,58,95,0.09)` : "none",
          }}>{t}</button>
        ))}
      </div>
    </div>
  );
}

// ─── Section title ────────────────────────────────────────────────────────────
export function STitle({ num, children, style: extraStyle = {} }) {
  return (
    <div style={{ marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", ...extraStyle }}>
      <span style={{
        background: DARK, color: ACCENT,
        borderRadius: "6px", padding: "3px 8px",
        fontSize: "10px", fontWeight: 800, flexShrink: 0,
        letterSpacing: "0.06em",
      }}>{num}</span>
      <h2 style={{ margin: 0, fontSize: "14.5px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.01em" }}>
        {children}
      </h2>
      <div style={{ flex: 1, height: "1px", background: "#e8edf4" }} />
    </div>
  );
}

// ─── Toggle card ──────────────────────────────────────────────────────────────
export function ToggleCard({ item, selected, onToggle }) {
  const on = selected.includes(item.id);
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onToggle(item.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textAlign: "left", padding: "11px 14px", borderRadius: "10px",
        cursor: "pointer", width: "100%",
        border: `1px solid ${on ? NAVY : hovered ? "#cbd5e1" : "#e8edf4"}`,
        background: on ? "rgba(79,70,229,0.05)" : hovered ? "#f8fafc" : "#fcfdfe",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", alignItems: "center", gap: "10px",
        boxShadow: on
          ? "0 1px 4px rgba(79,70,229,0.12)"
          : hovered ? "0 2px 8px rgba(0,0,0,0.06)" : "0 1px 2px rgba(0,0,0,0.03)",
      }}>
      <span style={{
        width: "28px", height: "28px", borderRadius: "7px", flexShrink: 0,
        background: on ? "rgba(79,70,229,0.10)" : "#f1f5f9",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "background 0.2s",
      }}>
        <Icon name={item.icon} size={14} strokeWidth={1.75} color={on ? "#065f46" : "#94a3b8"} />
      </span>
      <span style={{ fontSize: "13px", fontWeight: 600, color: on ? "#065f46" : "#374151", flex: 1 }}>{item.label}</span>
      <span style={{
        width: "18px", height: "18px", borderRadius: "50%", flexShrink: 0,
        background: on ? ACCENT : "#f1f5f9",
        border: on ? "none" : "1.5px solid #e2e8f0",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.2s",
      }}>
        {on && <Icon name="Check" size={10} strokeWidth={3} color={DARK} />}
      </span>
    </button>
  );
}

// ─── Searchable dropdown ──────────────────────────────────────────────────────
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
    <div style={{ marginBottom: "12px", gridColumn: colSpan ? "1/-1" : undefined }} ref={ref}>
      <label style={L}>{label}</label>
      <div style={{ position: "relative" }}>
        <input
          value={open ? search : (form[name] || "")}
          placeholder={placeholder || "Rechercher…"}
          onFocus={e => { setOpen(true); setSearch(""); focusIn(e); }}
          onBlur={focusOut}
          onChange={e => setSearch(e.target.value)}
          style={{ ...I, paddingRight: "38px" }}
        />
        <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", display: "flex" }}>
          <Icon name="ChevronDown" size={13} strokeWidth={2} />
        </span>
        {open && (
          <div style={DROPDOWN_STYLE}>
            {filtered.map(o => (
              <div key={o} onClick={() => { onChange({ target: { name, value: o } }); setOpen(false); }}
                style={DROPDOWN_ITEM}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {o}
              </div>
            ))}
            {filtered.length === 0 && <div style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "13px" }}>Aucun résultat</div>}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Convention collective field ──────────────────────────────────────────────
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

  const emit = val => { if (typeof onChange === "function") onChange(val); };
  const q = search.toLowerCase();
  const localMatches = q ? CCN_DATA.filter(c => c.label.toLowerCase().includes(q) || c.idcc.includes(q)).map(c => c.label) : CCN_DATA.map(c => c.label);
  const extMatches = q ? EXTENDED_CCN.filter(c => (c.label.toLowerCase().includes(q) || c.idcc.includes(q)) && !CCN_DATA.find(l => l.idcc === c.idcc)).map(c => `${c.label} (IDCC ${c.idcc})`) : [];
  const allMatches = [...localMatches, ...extMatches].slice(0, 30);

  if (custom) return (
    <div style={{ marginBottom: "12px", gridColumn: "1/-1" }}>
      <label style={L}>Convention collective</label>
      <div style={{ display: "flex", gap: "8px" }}>
        <input value={form.convention || ""} onChange={e => emit(e.target.value)}
          placeholder="Saisir la convention collective"
          style={{ ...I, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
        <button onClick={() => setCustom(false)} style={{
          padding: "0 14px", border: "1px solid #e2e8f0", borderRadius: "10px",
          background: "#fcfdfe", cursor: "pointer", color: "#475569",
          fontSize: "13px", whiteSpace: "nowrap", fontWeight: 600,
          transition: "all 0.2s",
        }}>← Liste</button>
      </div>
    </div>
  );

  return (
    <div style={{ marginBottom: "12px", gridColumn: "1/-1" }} ref={ref}>
      <label style={L}>Convention collective</label>
      <div style={{ position: "relative" }}>
        <input value={open ? search : (form.convention || "")}
          placeholder="Rechercher une convention collective…"
          onFocus={e => { setOpen(true); setSearch(""); focusIn(e); }}
          onBlur={focusOut}
          onChange={e => setSearch(e.target.value)}
          style={{ ...I, paddingRight: "38px" }} />
        <span style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8", pointerEvents: "none", display: "flex" }}>
          <Icon name="ChevronDown" size={13} strokeWidth={2} />
        </span>
        {open && (
          <div style={{ ...DROPDOWN_STYLE, zIndex: 100, maxHeight: "260px" }}>
            {allMatches.map(c => (
              <div key={c} onClick={() => { emit(c); setOpen(false); }}
                style={DROPDOWN_ITEM}
                onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                {c}
              </div>
            ))}
            {allMatches.length === 0 && <div style={{ padding: "12px 16px", color: "#94a3b8", fontSize: "13px" }}>Aucun résultat</div>}
            <div style={{ padding: "8px 16px", borderTop: "1px solid #f1f5f9" }}>
              <button onClick={() => { setCustom(true); setOpen(false); }} style={{
                background: "transparent", border: "none", color: "#64748b",
                fontSize: "12px", cursor: "pointer", padding: 0, fontWeight: 600,
              }}>+ Saisir manuellement</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Shared dropdown styles ───────────────────────────────────────────────────
const DROPDOWN_STYLE = {
  position: "absolute", zIndex: 200, top: "calc(100% + 5px)", left: 0, right: 0,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 10px 20px -5px rgba(0,0,0,0.05)",
  maxHeight: "220px", overflowY: "auto",
};

const DROPDOWN_ITEM = {
  padding: "10px 16px", fontSize: "13.5px", cursor: "pointer",
  color: "#0f172a", borderBottom: "1px solid #f8fafc",
  transition: "background 0.15s",
};
