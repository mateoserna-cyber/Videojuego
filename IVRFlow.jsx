import { useState, useMemo } from "react";

// ─── Costeo Final Optimizado — Deepgram + GCP e2-standard-8 ──────────────────
const TC = 950; // CLP/USD tipo de cambio base

const FIXED_ITEMS = [
  { name: "VM Asterisk e2-standard-8 (32 GB RAM)", usd: 268 },
  { name: "Storage GCS (grabaciones + WAVs)",       usd: 2   },
  { name: "Monitoring (Uptime + Alerts)",           usd: 15  },
  { name: "Vercel Pro x 1 seat",                    usd: 20  },
  { name: "v0 Pro x 1 seat",                        usd: 20  },
  { name: "Supabase Pro",                           usd: 25  },
];
const FIXED_USD   = FIXED_ITEMS.reduce((s, i) => s + i.usd, 0); // $350 USD/mes
const FIXED_CLP   = FIXED_USD * TC;                              // $332,500 CLP/mes
const FIXED_DAILY = FIXED_CLP / 30;                              // por día

// Costos variables por llamada (en CLP)
// Distribución AMD: 80.5% no conecta (~5s), 12.8% buzón (~10s), 6.7% humano (~30s max)
const VAR_CARRIER    = 7.00;                                           // Carrier SIP 0,5 min × $14
const VAR_DEEPGRAM   = Math.round(0.0077 * (10/60) * TC * 100) / 100; // Nova-3 es, ~10s escucha → ~$1.22
const VAR_TTS        = 0.50;                                           // Kokoro TTS banco audio pregenerado
const VAR_BUFFER_TC  = 1.50;                                           // Buffer tipo de cambio ~5%
const VAR_TOTAL      = VAR_CARRIER + VAR_DEEPGRAM + VAR_TTS + VAR_BUFFER_TC;

function useCosts(volume) {
  return useMemo(() => {
    const fixedPerCall = FIXED_CLP / volume;
    const totalPerCall = fixedPerCall + VAR_TOTAL;
    const totalMonth   = FIXED_CLP + volume * VAR_TOTAL;
    return {
      fixedPerCall,
      varPerCall:    VAR_TOTAL,
      totalPerCall,
      totalMonth,
      totalMonthUSD: totalMonth / TC,
    };
  }, [volume]);
}

const nodes = {
  start:    { x: 400, y: 30,  label: "LLAMADA",   sub: "Asterisk marca",                       type: "start"    },
  amd:      { x: 400, y: 110, label: "AMD",        sub: "Detección automática",                 type: "decision" },
  noConnect:{ x: 160, y: 110, label: "No conecta", sub: "80.5%",                                type: "end"      },
  voicemail:{ x: 640, y: 110, label: "Buzón",      sub: "12.8%",                                type: "end"      },

  p01: { x: 400, y: 210, label: "P01/P02", sub: "¿Hablo con don José Contreras?",              type: "speak"  },
  stt1:{ x: 400, y: 300, label: "STT",     sub: "Escucha 1.5-3s",                               type: "listen" },

  p03: { x: 160, y: 370, label: "P03",  sub: "No escuché bien, ¿hablo con...?",                type: "speak" },
  p04: { x: 640, y: 300, label: "P04",  sub: "Llamamos de Orsan por encargo de Coopeuch...",   type: "speak" },
  p05: { x: 50,  y: 460, label: "P05",  sub: "Problemas de comunicación",                       type: "end"   },
  p11a:{ x: 730, y: 210, label: "P11",  sub: "Ya pagué → validar pago",                        type: "end"   },

  p00: { x: 160, y: 210, label: "P00",  sub: "¿Conoce a don José?",                            type: "speak" },
  p07: { x: 50,  y: 300, label: "P07",  sub: "Informarle que llamamos de Coopeuch",            type: "end"   },
  p06t:{ x: 270, y: 300, label: "P06",  sub: "Disculpe la molestia",                           type: "end"   },

  p08: { x: 400, y: 420, label: "P08",  sub: "Deuda vencida $1.464.218 ¿Paga en 5 días?",     type: "speak"  },
  stt2:{ x: 400, y: 510, label: "STT",  sub: "Escucha 2-4s",                                   type: "listen" },

  p15: { x: 160, y: 510, label: "P15",  sub: "¿Confirma pago en 5 días?",                      type: "speak" },
  p20: { x: 640, y: 510, label: "P20",  sub: "Repite: deuda $1.464.218, vence 30 ago",         type: "speak" },
  p11b:{ x: 730, y: 420, label: "P11",  sub: "Ya pagué → validar pago",                        type: "end"   },

  p09: { x: 400, y: 610, label: "P09",  sub: "Compromiso agendado 19 de febrero",              type: "success" },
  p06f:{ x: 400, y: 690, label: "P06",  sub: "Que tenga un buen día",                          type: "end"     },

  p12: { x: 160, y: 610, label: "P12",  sub: "¿Motivo de no pago?",                            type: "speak" },
  p13: { x: 160, y: 690, label: "P13",  sub: "Contacte a Coopeuch. Gracias.",                  type: "end"   },
};

const edges = [
  { from: "start",  to: "amd",       label: "" },
  { from: "amd",    to: "noConnect", label: "No conecta" },
  { from: "amd",    to: "voicemail", label: "Buzón" },
  { from: "amd",    to: "p01",       label: "Humano 6.7%" },

  { from: "p01",  to: "stt1", label: "" },

  { from: "stt1", to: "p08",  label: "✓ Sí soy",     color: "#22c55e" },
  { from: "stt1", to: "p00",  label: "✗ No está",    color: "#ef4444" },
  { from: "stt1", to: "p04",  label: "? Quién llama", color: "#f59e0b" },
  { from: "stt1", to: "p03",  label: "… Silencio",   color: "#6b7280" },
  { from: "stt1", to: "p11a", label: "$ Ya pagué",   color: "#8b5cf6" },

  { from: "p03", to: "stt1", label: "Reintenta",    color: "#6b7280", dashed: true },
  { from: "p03", to: "p05",  label: "2do silencio", color: "#6b7280" },
  { from: "p04", to: "stt1", label: "Re-identifica",color: "#f59e0b", dashed: true },

  { from: "p00", to: "p07",  label: "Sí lo conoce" },
  { from: "p00", to: "p06t", label: "No" },

  { from: "p08", to: "stt2", label: "" },

  { from: "stt2", to: "p09",  label: "✓ Sí puedo", color: "#22c55e" },
  { from: "stt2", to: "p12",  label: "✗ No puedo", color: "#ef4444" },
  { from: "stt2", to: "p15",  label: "… Silencio", color: "#6b7280" },
  { from: "stt2", to: "p20",  label: "↻ Repita",   color: "#f59e0b" },
  { from: "stt2", to: "p11b", label: "$ Ya pagué", color: "#8b5cf6" },

  { from: "p15", to: "stt2", label: "Reintenta",      color: "#6b7280", dashed: true },
  { from: "p15", to: "p13",  label: "2do silencio",   color: "#6b7280" },
  { from: "p20", to: "stt2", label: "Reintenta",      color: "#f59e0b", dashed: true },
  { from: "p20", to: "p13",  label: "2da repetición", color: "#f59e0b" },

  { from: "p09", to: "p06f", label: "" },
  { from: "p12", to: "p13",  label: "" },
];

const typeStyles = {
  start:    { gradId: "gradStart",    border: "#6366f1", text: "#e0e7ff", subText: "#a5b4fc" },
  decision: { gradId: "gradDecision", border: "#818cf8", text: "#e0e7ff", subText: "#c7d2fe" },
  speak:    { gradId: "gradSpeak",    border: "#3b82f6", text: "#dbeafe", subText: "#93c5fd" },
  listen:   { gradId: "gradListen",   border: "#06b6d4", text: "#cffafe", subText: "#67e8f9" },
  success:  { gradId: "gradSuccess",  border: "#22c55e", text: "#dcfce7", subText: "#86efac" },
  end:      { gradId: "gradEnd",      border: "#475569", text: "#cbd5e1", subText: "#94a3b8" },
};

const phases = [
  { label: "FASE 0 · Conexión",             y: 70,  h: 80,  color: "#6366f1" },
  { label: "FASE 1 · Identificación",        y: 170, h: 210, color: "#3b82f6" },
  { label: "FASE 2 · Notificación de deuda", y: 390, h: 160, color: "#06b6d4" },
  { label: "FASE 3 · Compromiso",            y: 570, h: 160, color: "#22c55e" },
];

const paths = {
  exitoso:       { name: "Exitoso",                color: "#22c55e", time: "~26s", nodes: ["start","amd","p01","stt1","p08","stt2","p09","p06f"],              desc: "Titular confirma → acepta pagar → compromiso agendado" },
  reintentoOk:   { name: "Reintento · Entiende",   color: "#06b6d4", time: "~32s", nodes: ["start","amd","p01","stt1","p03","stt1","p08","stt2","p09","p06f"], desc: "Silencio → P03 reintenta → STT entiende → acepta pagar → compromiso" },
  reintentoFail: { name: "Reintento · No entiende",color: "#94a3b8", time: "~20s", nodes: ["start","amd","p01","stt1","p03","p05"],                            desc: "Silencio → P03 reintenta → STT sigue sin entender → fin llamada" },
  terceroSi:     { name: "Tercero · Lo conoce",    color: "#ef4444", time: "~18s", nodes: ["start","amd","p01","stt1","p00","p07"],                            desc: "No es el titular → tercero sí lo conoce → le pedimos que le informe que debe regularizar su deuda" },
  terceroNo:     { name: "Tercero · No lo conoce", color: "#f43f5e", time: "~12s", nodes: ["start","amd","p01","stt1","p00","p06t"],                           desc: "No es el titular → tercero no lo conoce → despedida y fin de llamada" },
  noPuede:       { name: "No puede pagar",         color: "#f59e0b", time: "~28s", nodes: ["start","amd","p01","stt1","p08","stt2","p12","p13"],               desc: "Titular confirma → no puede pagar → motivo → cierre" },
  yaPago:        { name: "Ya pagó",                color: "#8b5cf6", time: "~12s", nodes: ["start","amd","p01","stt1","p11a"],                                 desc: "Titular dice que ya pagó → derivar a validación" },
};

export default function IVRFlow() {
  const [hovered, setHovered]           = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  const [volume, setVolume]             = useState(50_000);

  const costs = useCosts(volume);

  const cl  = (n) => Math.round(n).toLocaleString("es-CL");
  const clD = (n) => n.toLocaleString("es-CL", { maximumFractionDigits: 2, minimumFractionDigits: 2 });
  const fmtCLP = (n) => `$${cl(n)}`;
  const fmtD   = (n) => `$${clD(n)}`;
  const fmtUSD = (n) => `USD $${Math.round(n).toLocaleString("en-US")}`;
  const fmtKCLP = (n) => n >= 1_000_000 ? `$${(n/1_000_000).toFixed(2)}M` : n >= 1_000 ? `$${(n/1_000).toFixed(0)}K` : `$${Math.round(n)}`;

  const isHighlighted = (nodeId) =>
    !selectedPath || paths[selectedPath].nodes.includes(nodeId);

  const W = 800, H = 740;

  return (
    <div style={{
      background: "linear-gradient(160deg,#050810 0%,#0a0f1e 60%,#060c18 100%)",
      minHeight: "100vh",
      padding: "28px 16px 48px",
      fontFamily: "'Inter', system-ui, sans-serif",
    }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>

        {/* ── Header ─────────────────────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              background: "linear-gradient(135deg,#6366f1,#3b82f6)",
              color: "#fff", fontSize: 11, fontWeight: 700,
              padding: "3px 12px", borderRadius: 20, letterSpacing: "0.08em",
            }}>ORSAN 2026</span>
            <span style={{
              background: "#0f172a", color: "#475569", fontSize: 11,
              padding: "3px 12px", borderRadius: 20, border: "1px solid #1e293b",
            }}>v1.0 · IVR Cobranza</span>
          </div>
          <h1 style={{
            background: "linear-gradient(135deg,#e2e8f0 0%,#94a3b8 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em",
            lineHeight: 1.25, margin: "0 0 8px",
          }}>
            Bot IVR de Cobranza — Flujo Completo
          </h1>
          <p style={{ color: "#334155", fontSize: 13, margin: 0 }}>
            5.3M llamadas/mes &nbsp;·&nbsp; 190K audios pre-generados &nbsp;·&nbsp; Zero latencia TTS
          </p>
        </div>

        {/* ── Path selector ──────────────────────────────────── */}
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 14, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedPath(null)}
            style={{
              padding: "7px 18px", borderRadius: 999, border: "1px solid",
              borderColor: !selectedPath ? "#6366f1" : "#1e293b",
              background:  !selectedPath ? "linear-gradient(135deg,#312e81,#1e1b4b)" : "transparent",
              color:        !selectedPath ? "#c7d2fe" : "#334155",
              cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s",
            }}
          >Todos los caminos</button>

          {Object.entries(paths).map(([k, v]) => (
            <button key={k}
              onClick={() => setSelectedPath(selectedPath === k ? null : k)}
              style={{
                padding: "7px 18px", borderRadius: 999, border: "1px solid",
                borderColor: selectedPath === k ? v.color : "#1e293b",
                background:  selectedPath === k ? `${v.color}18` : "transparent",
                color:       selectedPath === k ? v.color : "#334155",
                cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s",
              }}
            >
              {v.name}&nbsp;
              <span style={{ opacity: 0.55, fontWeight: 400 }}>{v.time}</span>
            </button>
          ))}
        </div>

        {/* ── Path description banner ────────────────────────── */}
        {selectedPath && (
          <div style={{
            textAlign: "center", marginBottom: 14, padding: "10px 20px",
            background: `${paths[selectedPath].color}10`,
            borderRadius: 10, border: `1px solid ${paths[selectedPath].color}28`,
          }}>
            <span style={{ color: paths[selectedPath].color, fontSize: 13, fontWeight: 500 }}>
              {paths[selectedPath].desc}
            </span>
          </div>
        )}

        {/* ── SVG Diagram ────────────────────────────────────── */}
        <div style={{
          background: "#060810",
          borderRadius: 16,
          border: "1px solid #0d1425",
          boxShadow: "0 0 80px rgba(99,102,241,0.07), 0 4px 24px rgba(0,0,0,0.7)",
          overflow: "auto",
          padding: 4,
        }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", display: "block" }}>
            <defs>
              {/* Node background gradients */}
              <linearGradient id="gradStart"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0d0c22"/></linearGradient>
              <linearGradient id="gradDecision" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e1b4b"/><stop offset="100%" stopColor="#0a0920"/></linearGradient>
              <linearGradient id="gradSpeak"    x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1e3a5f"/><stop offset="100%" stopColor="#0c1a2c"/></linearGradient>
              <linearGradient id="gradListen"   x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#0c3a45"/><stop offset="100%" stopColor="#051820"/></linearGradient>
              <linearGradient id="gradSuccess"  x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#14532d"/><stop offset="100%" stopColor="#052e16"/></linearGradient>
              <linearGradient id="gradEnd"      x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1c1917"/><stop offset="100%" stopColor="#0a0908"/></linearGradient>
              {/* Arrow markers per colour */}
              {[
                ["arr-def",    "#475569"],
                ["arr-green",  "#22c55e"],
                ["arr-red",    "#ef4444"],
                ["arr-amber",  "#f59e0b"],
                ["arr-gray",   "#6b7280"],
                ["arr-violet", "#8b5cf6"],
              ].map(([id, fill]) => (
                <marker key={id} id={id} viewBox="0 0 10 7" refX="9" refY="3.5"
                  markerWidth="7" markerHeight="6" orient="auto-start-reverse">
                  <polygon points="0 0,10 3.5,0 7" fill={fill} />
                </marker>
              ))}
            </defs>

            {/* Dot-grid background */}
            <pattern id="dots" width="32" height="32" patternUnits="userSpaceOnUse">
              <circle cx="1" cy="1" r="0.8" fill="#1a2438" />
            </pattern>
            <rect width={W} height={H} fill="url(#dots)" opacity="0.6" />

            {/* Phase bands */}
            {phases.map((p, i) => (
              <g key={i}>
                <rect x={8} y={p.y} width={W-16} height={p.h} rx={10}
                  fill={p.color} fillOpacity={0.04}
                  stroke={p.color} strokeWidth={0.8} strokeOpacity={0.2} strokeDasharray="6 4" />
                <rect x={8} y={p.y} width={92} height={17} rx={4}
                  fill={p.color} fillOpacity={0.16} />
                <text x={16} y={p.y+13} fill={p.color} fontSize={9} fontWeight={700}
                  opacity={0.85} letterSpacing="0.07em">{p.label}</text>
              </g>
            ))}

            {/* Edges */}
            {edges.map((e, i) => {
              const f = nodes[e.from], t = nodes[e.to];
              if (!f || !t) return null;
              const op = isHighlighted(e.from) && isHighlighted(e.to) ? 1 : 0.08;
              const c  = e.color || "#475569";
              const markerId =
                c === "#22c55e" ? "arr-green"  :
                c === "#ef4444" ? "arr-red"    :
                c === "#f59e0b" ? "arr-amber"  :
                c === "#8b5cf6" ? "arr-violet" :
                c === "#6b7280" ? "arr-gray"   : "arr-def";

              const dx = t.x - f.x, dy = t.y - f.y;
              const dist = Math.sqrt(dx*dx + dy*dy) || 1;
              const nx = dx/dist, ny = dy/dist;
              const sx = f.x + nx*30, sy = f.y + ny*20;
              const ex = t.x - nx*30, ey = t.y - ny*20;
              const isCurved = Math.abs(dx) > 200 || e.dashed;
              let path;
              if (isCurved) {
                const mx = (sx+ex)/2, my = (sy+ey)/2;
                const off = e.dashed ? (dx>0 ? -30 : 30) : (dx>0 ? 20 : -20);
                path = `M${sx},${sy} Q${mx+off},${my-20} ${ex},${ey}`;
              } else {
                path = `M${sx},${sy} L${ex},${ey}`;
              }
              const lx = (sx+ex)/2 + (Math.abs(dx)>200 ? (dx>0?12:-12) : (dx>0?10:-10));
              const ly = (sy+ey)/2 - 5;

              return (
                <g key={i} opacity={op}>
                  <path d={path} fill="none" stroke={c}
                    strokeWidth={op===1 ? 1.8 : 1}
                    strokeDasharray={e.dashed ? "6 3" : "none"}
                    markerEnd={`url(#${markerId})`} />
                  {e.label && (
                    <text x={lx} y={ly} fill={c} fontSize={9} fontWeight={600} textAnchor="middle">
                      {e.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {Object.entries(nodes).map(([id, n]) => {
              const s  = typeStyles[n.type];
              const op = isHighlighted(id) ? 1 : 0.1;
              const isH = hovered === id;
              const w  = n.type === "end" || n.type === "success" ? 112 :
                         n.type === "listen" ? 92 : 134;
              const h  = 36;
              return (
                <g key={id} opacity={op}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}>
                  {/* outer glow ring on hover */}
                  {isH && (
                    <rect x={n.x-w/2-4} y={n.y-h/2-4} width={w+8} height={h+8} rx={12}
                      fill="none" stroke={s.border} strokeWidth={1.5} opacity={0.3} />
                  )}
                  {/* body */}
                  <rect x={n.x-w/2} y={n.y-h/2} width={w} height={h} rx={8}
                    fill={`url(#${s.gradId})`}
                    stroke={s.border} strokeWidth={isH ? 2 : 1.2} strokeOpacity={isH ? 1 : 0.65} />
                  {/* accent top stripe */}
                  <rect x={n.x-w/2+6} y={n.y-h/2} width={w-12} height={2} rx={1}
                    fill={s.border} opacity={isH ? 0.9 : 0.4} />
                  {/* label */}
                  <text x={n.x} y={n.y+2} textAnchor="middle"
                    fill={s.text} fontSize={11} fontWeight={700} letterSpacing="0.03em">
                    {n.label}
                  </text>
                  {/* hover tooltip */}
                  {isH && (
                    <g>
                      <rect x={n.x-132} y={n.y+h/2+5} width={264} height={22} rx={6}
                        fill="#0b1120" stroke={s.border} strokeWidth={1} strokeOpacity={0.45} />
                      <text x={n.x} y={n.y+h/2+20} textAnchor="middle"
                        fill={s.subText} fontSize={10} fontWeight={500}>
                        {n.sub}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* ── Legend ─────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginTop: 14 }}>
          {[
            { color: "#6366f1", label: "Inicio / AMD",  icon: "◆" },
            { color: "#3b82f6", label: "Bot habla",     icon: "🔊" },
            { color: "#06b6d4", label: "STT escucha",   icon: "🎤" },
            { color: "#22c55e", label: "Éxito",         icon: "✓"  },
          ].map((l, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 12px", background: "#060810", borderRadius: 8,
              border: `1px solid ${l.color}20`,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 5,
                border: `1.5px solid ${l.color}`,
                background: `${l.color}12`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: l.color,
              }}>{l.icon}</div>
              <span style={{ color: "#475569", fontSize: 11, fontWeight: 500 }}>{l.label}</span>
            </div>
          ))}
        </div>

        {/* ── Stats ──────────────────────────────────────────── */}
        <div style={{
          marginTop: 14, padding: "20px 28px",
          background: "linear-gradient(135deg,#060810,#0a0f1e)",
          borderRadius: 14, border: "1px solid #0d1425",
          boxShadow: "0 2px 24px rgba(0,0,0,0.5)",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, textAlign: "center" }}>
            {[
              { value: "~26s",  label: "Llamada exitosa",      color: "#22c55e" },
              { value: "6.7%",  label: "Tasa de contacto",     color: "#f59e0b" },
              { value: "190K",  label: "Audios pre-generados", color: "#8b5cf6" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "12px 0",
                borderRight: i < 2 ? "1px solid #0f172a" : "none",
              }}>
                <div style={{
                  fontSize: 30, fontWeight: 800, letterSpacing: "-0.03em",
                  background: `linear-gradient(135deg,${s.color},${s.color}88)`,
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                }}>{s.value}</div>
                <div style={{ color: "#1e293b", fontSize: 11, marginTop: 4, fontWeight: 500 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ textAlign: "center", color: "#1a2438", fontSize: 11, marginTop: 20, margin: "20px 0 0" }}>
          Pase el cursor sobre un nodo para ver el detalle · Orsan 2026 IVR Cobranza
        </p>

        {/* ── Cost Calculator ─────────────────────────────────── */}
        <div style={{ marginTop: 28 }}>

          {/* section title */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,transparent,#1e293b)" }} />
            <span style={{ color: "#f59e0b", fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase" }}>
              Costos por llamada · Deepgram + GCP
            </span>
            <div style={{ flex: 1, height: 1, background: "linear-gradient(90deg,#1e293b,transparent)" }} />
          </div>

          {/* Volume slider */}
          <div style={{
            padding: "14px 18px", background: "#07090f",
            borderRadius: 10, border: "1px solid #0d1425", marginBottom: 14,
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600 }}>Volumen mensual de llamadas</span>
                <span style={{ color: "#475569", fontSize: 11, marginLeft: 8 }}>12 hrs/día · 30 días · max 30-40s/llamada</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span style={{ color: "#f59e0b", fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>
                  {volume.toLocaleString("es-CL")}
                </span>
                <span style={{ color: "#475569", fontSize: 11, marginLeft: 4 }}>llamadas/mes</span>
              </div>
            </div>
            <input type="range" min={5000} max={300000} step={1000} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              style={{ width: "100%", accentColor: "#f59e0b", cursor: "pointer", height: 4 }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span style={{ color: "#1e293b", fontSize: 10 }}>5K</span>
              <span style={{ color: "#f59e0b", fontSize: 10, fontWeight: 600 }}>~50K recomendado</span>
              <span style={{ color: "#1e293b", fontSize: 10 }}>300K</span>
            </div>
          </div>

          {/* KPI cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Fijos/día",          value: fmtCLP(FIXED_DAILY),          sub: `${fmtCLP(FIXED_CLP)}/mes · USD $${FIXED_USD}`,        color: "#6366f1" },
              { label: "Variable/llamada",   value: fmtD(VAR_TOTAL),              sub: "con buffer TC 5%",                                       color: "#3b82f6" },
              { label: `CLP/llamada`,        value: fmtD(costs.totalPerCall),     sub: `@ ${(volume/1000).toFixed(0)}K llamadas`,               color: "#22c55e" },
              { label: "Total mensual",      value: fmtKCLP(costs.totalMonth),    sub: fmtUSD(costs.totalMonthUSD),                             color: "#f59e0b" },
            ].map((k, i) => (
              <div key={i} style={{
                padding: "14px 12px", background: "#07090f",
                borderRadius: 10, border: `1px solid ${k.color}22`,
                borderTop: `3px solid ${k.color}`,
              }}>
                <div style={{ color: "#334155", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>{k.label}</div>
                <div style={{ color: k.color, fontSize: 18, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{k.value}</div>
                <div style={{ color: "#1e293b", fontSize: 10, marginTop: 3 }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Two-column breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

            {/* Fixed costs */}
            <div style={{ padding: "16px 18px", background: "#07090f", borderRadius: 10, border: "1px solid #0d1425" }}>
              <div style={{ color: "#6366f1", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Costos Fijos Diarios
              </div>
              {FIXED_ITEMS.map((item, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: 7, marginBottom: 7,
                  borderBottom: i < FIXED_ITEMS.length - 1 ? "1px solid #0a0f1e" : "none",
                }}>
                  <span style={{ color: "#475569", fontSize: 11 }}>{item.name}</span>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#94a3b8", fontSize: 11, fontVariantNumeric: "tabular-nums" }}>
                      {fmtCLP(Math.round(item.usd * TC / 30))}/día
                    </div>
                    <div style={{ color: "#334155", fontSize: 9 }}>USD ${item.usd}/mes</div>
                  </div>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #1e293b", paddingTop: 10, marginTop: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: 12 }}>Total diario</span>
                  <span style={{ color: "#6366f1", fontWeight: 700, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                    {fmtCLP(FIXED_DAILY)}/día
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#94a3b8", fontWeight: 700, fontSize: 13 }}>Total mensual</span>
                  <span style={{ color: "#6366f1", fontWeight: 800, fontSize: 16, fontVariantNumeric: "tabular-nums" }}>
                    {fmtCLP(FIXED_CLP)}
                  </span>
                </div>
                <div style={{ color: "#1e293b", fontSize: 10, textAlign: "right", marginTop: 2 }}>USD ${FIXED_USD}/mes</div>
              </div>
            </div>

            {/* Variable costs + equation */}
            <div style={{ padding: "16px 18px", background: "#07090f", borderRadius: 10, border: "1px solid #0d1425" }}>
              <div style={{ color: "#3b82f6", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Costos Variables / Llamada
              </div>
              {[
                { label: "Carrier SIP",                         hint: "0,5 min × $14",                                    value: VAR_CARRIER,   color: "#3b82f6" },
                { label: "Deepgram STT Nova-3 es",             hint: "pay-as-you-go · ~10s escucha · $0,0077 USD/min",    value: VAR_DEEPGRAM,  color: "#06b6d4" },
                { label: "Kokoro TTS",                          hint: "banco audio pregenerado",                           value: VAR_TTS,       color: "#22c55e" },
                { label: "Buffer tipo de cambio",               hint: "~5% sobre costos USD",                             value: VAR_BUFFER_TC, color: "#f59e0b" },
              ].map((row, i) => (
                <div key={i} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  paddingBottom: 8, marginBottom: 8,
                  borderBottom: i < 3 ? "1px solid #0a0f1e" : "none",
                }}>
                  <div>
                    <div style={{ color: row.color, fontSize: 11, fontWeight: 600 }}>{row.label}</div>
                    <div style={{ color: "#1e293b", fontSize: 9, marginTop: 1 }}>{row.hint}</div>
                  </div>
                  <span style={{ color: "#94a3b8", fontSize: 13, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {fmtD(row.value)}
                  </span>
                </div>
              ))}
              <div style={{ borderTop: "1px solid #1e293b", paddingTop: 8, marginTop: 2 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#f8fafc", fontWeight: 800, fontSize: 13 }}>TOTAL VARIABLE</span>
                  <span style={{ color: "#f59e0b", fontWeight: 800, fontSize: 18, fontVariantNumeric: "tabular-nums" }}>
                    {fmtD(VAR_TOTAL)}<span style={{ fontSize: 11, opacity: 0.6 }}>/llamada</span>
                  </span>
                </div>
              </div>

              {/* Equation box */}
              <div style={{
                marginTop: 12, padding: "10px 12px",
                background: "#0a0f1e", borderRadius: 8, border: "1px solid #1e293b",
              }}>
                <div style={{ color: "#475569", fontSize: 9, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>
                  Ecuación de costo total
                </div>
                <div style={{ color: "#93c5fd", fontSize: 11, fontFamily: "monospace", fontWeight: 700 }}>
                  CLP/llamada = {fmtCLP(FIXED_CLP)} / N + {clD(VAR_TOTAL)}
                </div>
                <div style={{ marginTop: 8, color: "#94a3b8", fontSize: 11, fontFamily: "monospace" }}>
                  = {fmtCLP(FIXED_CLP)} + ({volume.toLocaleString("es-CL")} × {fmtD(VAR_TOTAL)})
                </div>
                <div style={{ marginTop: 4, color: "#f59e0b", fontSize: 14, fontWeight: 800 }}>
                  = {fmtCLP(costs.totalMonth)} <span style={{ fontSize: 10, opacity: 0.6 }}>CLP/mes</span>
                </div>
                <div style={{ color: "#334155", fontSize: 10, marginTop: 2 }}>{fmtUSD(costs.totalMonthUSD)}/mes</div>
              </div>
            </div>
          </div>

          {/* Desglose CLP/llamada — full width */}
          <div style={{ padding: "16px 18px", background: "#07090f", borderRadius: 10, border: "1px solid #0d1425", marginBottom: 12 }}>
            <div style={{ color: "#94a3b8", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
              Desglose CLP/llamada @ {(volume/1000).toFixed(0)}K llamadas/mes
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {[
                { label: "Fijo prorrateado",  hint: `${fmtCLP(FIXED_CLP)} fijos ÷ ${volume.toLocaleString("es-CL")} llamadas`, value: costs.fixedPerCall, color: "#6366f1", pct: costs.fixedPerCall / costs.totalPerCall },
                { label: "Variable total",    hint: "Carrier + Deepgram + TTS + Buffer TC",                                     value: costs.varPerCall,   color: "#3b82f6", pct: costs.varPerCall   / costs.totalPerCall },
              ].map((r, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div>
                      <div style={{ color: r.color, fontSize: 12, fontWeight: 700 }}>{r.label}</div>
                      <div style={{ color: "#1e293b", fontSize: 10, marginTop: 1 }}>{r.hint}</div>
                    </div>
                    <span style={{ color: r.color, fontSize: 16, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{fmtD(r.value)}</span>
                  </div>
                  <div style={{ height: 6, background: "#0a0f1e", borderRadius: 99 }}>
                    <div style={{ height: 6, borderRadius: 99, background: r.color, width: `${r.pct * 100}%`, transition: "width .3s" }} />
                  </div>
                  <div style={{ color: "#334155", fontSize: 10, marginTop: 3, textAlign: "right" }}>
                    {(r.pct * 100).toFixed(1)}% del costo total
                  </div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #1e293b", marginTop: 14, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ color: "#f8fafc", fontWeight: 800, fontSize: 14 }}>CLP/llamada</div>
                <div style={{ color: "#334155", fontSize: 10, marginTop: 1 }}>fijo prorrateado + variable</div>
              </div>
              <span style={{ color: "#22c55e", fontWeight: 800, fontSize: 26, fontVariantNumeric: "tabular-nums" }}>
                {fmtD(costs.totalPerCall)}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div style={{
            padding: "12px 16px", background: "#07090f",
            borderRadius: 8, border: "1px solid #0d1425",
          }}>
            <p style={{ color: "#1e293b", fontSize: 10, margin: 0, lineHeight: 1.7 }}>
              <strong style={{ color: "#334155" }}>Supuestos:</strong>&nbsp;
              VM GCP e2-standard-8 32 GB RAM · 200 GB disco · 24/7 = $268 USD/mes.
              Operación activa 12 hrs/día. Duración máx. 30-40s/llamada; 80.5% no contesta (~5s), 12.8% buzón (~10s), 6.7% humano (~30s).
              Deepgram Nova-3 español pay-as-you-go (sin plan mensual): $0,0077 USD/min · ~10s audio = {fmtD(VAR_DEEPGRAM)} CLP/llamada.
              Carrier SIP: $7 CLP/llamada (0,5 min × $14). Kokoro TTS banco pregenerado. Buffer TC 5% cubre fluctuación USD→CLP.
              TC base: $950 CLP/USD.
              <strong style={{ color: "#334155" }}> Costos no incluidos:</strong> GCP network egress (~$5-15 USD/mes), DIDs dedicados (~$5-20 USD/mes), backups, rate limits Deepgram a alto volumen concurrente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
