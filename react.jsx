import { useState } from "react";

const nodes = {
  start: { x: 400, y: 30, label: "LLAMADA", sub: "Asterisk marca", type: "start" },
  amd: { x: 400, y: 110, label: "AMD", sub: "Detección automática", type: "decision" },
  noConnect: { x: 160, y: 110, label: "No conecta", sub: "80.5%", type: "end" },
  voicemail: { x: 640, y: 110, label: "Buzón", sub: "12.8%", type: "end" },
  
  p01: { x: 400, y: 210, label: "P01/P02", sub: "¿Hablo con don José Contreras?", type: "speak" },
  stt1: { x: 400, y: 300, label: "STT", sub: "Escucha 1.5-3s", type: "listen" },
  
  p03: { x: 160, y: 370, label: "P03", sub: "No escuché bien, ¿hablo con...?", type: "speak" },
  p04: { x: 640, y: 300, label: "P04", sub: "Llamamos de Orsan por encargo de Coopeuch...", type: "speak" },
  p05: { x: 50, y: 460, label: "P05", sub: "Problemas de comunicación", type: "end" },
  
  p11a: { x: 730, y: 210, label: "P11", sub: "Ya pagué → validar pago", type: "end" },
  
  p00: { x: 160, y: 210, label: "P00", sub: "¿Conoce a don José?", type: "speak" },
  p07: { x: 50, y: 300, label: "P07", sub: "Informarle que llamamos de Coopeuch", type: "end" },
  p06t: { x: 270, y: 300, label: "P06", sub: "Disculpe la molestia", type: "end" },
  
  p08: { x: 400, y: 420, label: "P08", sub: "Deuda vencida $1.464.218 ¿Paga en 5 días?", type: "speak" },
  stt2: { x: 400, y: 510, label: "STT", sub: "Escucha 2-4s", type: "listen" },
  
  p15: { x: 160, y: 510, label: "P15", sub: "¿Confirma pago en 5 días?", type: "speak" },
  p20: { x: 640, y: 510, label: "P20", sub: "Repite: deuda $1.464.218, vence 30 ago", type: "speak" },
  p11b: { x: 730, y: 420, label: "P11", sub: "Ya pagué → validar pago", type: "end" },
  
  p09: { x: 400, y: 610, label: "P09", sub: "Compromiso agendado 19 de febrero", type: "success" },
  p06f: { x: 400, y: 690, label: "P06", sub: "Que tenga un buen día", type: "end" },
  
  p12: { x: 160, y: 610, label: "P12", sub: "¿Motivo de no pago?", type: "speak" },
  p13: { x: 160, y: 690, label: "P13", sub: "Contacte a Coopeuch. Gracias.", type: "end" },
};

const edges = [
  { from: "start", to: "amd", label: "" },
  { from: "amd", to: "noConnect", label: "No conecta" },
  { from: "amd", to: "voicemail", label: "Buzón" },
  { from: "amd", to: "p01", label: "Humano 6.7%" },
  
  { from: "p01", to: "stt1", label: "" },
  
  { from: "stt1", to: "p08", label: "✓ Sí soy", color: "#22c55e" },
  { from: "stt1", to: "p00", label: "✗ No está", color: "#ef4444" },
  { from: "stt1", to: "p04", label: "? Quién llama", color: "#f59e0b" },
  { from: "stt1", to: "p03", label: "… Silencio", color: "#6b7280" },
  { from: "stt1", to: "p11a", label: "$ Ya pagué", color: "#8b5cf6" },
  
  { from: "p03", to: "stt1", label: "Reintenta", color: "#6b7280", dashed: true },
  { from: "p03", to: "p05", label: "2do silencio", color: "#6b7280" },
  { from: "p04", to: "stt1", label: "Re-identifica", color: "#f59e0b", dashed: true },
  
  { from: "p00", to: "p07", label: "Sí lo conoce" },
  { from: "p00", to: "p06t", label: "No" },
  
  { from: "p08", to: "stt2", label: "" },
  
  { from: "stt2", to: "p09", label: "✓ Sí puedo", color: "#22c55e" },
  { from: "stt2", to: "p12", label: "✗ No puedo", color: "#ef4444" },
  { from: "stt2", to: "p15", label: "… Silencio", color: "#6b7280" },
  { from: "stt2", to: "p20", label: "↻ Repita", color: "#f59e0b" },
  { from: "stt2", to: "p11b", label: "$ Ya pagué", color: "#8b5cf6" },
  
  { from: "p15", to: "stt2", label: "Reintenta", color: "#6b7280", dashed: true },
  { from: "p15", to: "p13", label: "2do silencio", color: "#6b7280" },
  { from: "p20", to: "stt2", label: "Reintenta", color: "#f59e0b", dashed: true },
  { from: "p20", to: "p13", label: "2da repetición", color: "#f59e0b" },
  
  { from: "p09", to: "p06f", label: "" },
  { from: "p12", to: "p13", label: "" },
];

const typeStyles = {
  start: { bg: "#1e293b", border: "#475569", text: "#f8fafc", subText: "#94a3b8" },
  decision: { bg: "#1e293b", border: "#6366f1", text: "#f8fafc", subText: "#a5b4fc" },
  speak: { bg: "#0f172a", border: "#3b82f6", text: "#f8fafc", subText: "#93c5fd" },
  listen: { bg: "#0f172a", border: "#06b6d4", text: "#f8fafc", subText: "#67e8f9" },
  success: { bg: "#052e16", border: "#22c55e", text: "#f0fdf4", subText: "#86efac" },
  end: { bg: "#1c1917", border: "#78716c", text: "#d6d3d1", subText: "#a8a29e" },
};

const phases = [
  { label: "FASE 0 · Conexión", y: 70, h: 80, color: "#475569" },
  { label: "FASE 1 · Identificación", y: 170, h: 210, color: "#3b82f6" },
  { label: "FASE 2 · Notificación de deuda", y: 390, h: 160, color: "#06b6d4" },
  { label: "FASE 3 · Resolución", y: 570, h: 160, color: "#22c55e" },
];

export default function IVRFlow() {
  const [hovered, setHovered] = useState(null);
  const [selectedPath, setSelectedPath] = useState(null);
  
  const paths = {
    exitoso: { name: "Camino Exitoso", color: "#22c55e", time: "~26s", nodes: ["start","amd","p01","stt1","p08","stt2","p09","p06f"], desc: "Titular confirma → acepta pagar → compromiso" },
    tercero: { name: "Tercero", color: "#ef4444", time: "~15s", nodes: ["start","amd","p01","stt1","p00","p07"], desc: "No es el titular → tercero conoce → mensaje" },
    noPuede: { name: "No Puede Pagar", color: "#f59e0b", time: "~28s", nodes: ["start","amd","p01","stt1","p08","stt2","p12","p13"], desc: "Titular confirma → no puede pagar → motivo → cierre" },
    yaPago: { name: "Ya Pagó", color: "#8b5cf6", time: "~12s", nodes: ["start","amd","p01","stt1","p11a"], desc: "Titular dice que ya pagó → validar" },
    silencio: { name: "Sin Respuesta", color: "#6b7280", time: "~20s", nodes: ["start","amd","p01","stt1","p03","p05"], desc: "Silencio → reintento → problemas comunicación" },
  };
  
  const isHighlighted = (nodeId) => {
    if (!selectedPath) return true;
    return paths[selectedPath].nodes.includes(nodeId);
  };

  const W = 800, H = 740;

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh", padding: "20px", fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1 style={{ color: "#f8fafc", fontSize: 22, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>
          Bot IVR de Cobranza — Flujo Completo
        </h1>
        <p style={{ color: "#64748b", fontSize: 13, textAlign: "center", marginBottom: 16 }}>
          5.3M llamadas/mes · 190K audios pre-generados · Zero latencia TTS
        </p>
        
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <button
            onClick={() => setSelectedPath(null)}
            style={{
              padding: "6px 14px", borderRadius: 6, border: "1px solid",
              borderColor: !selectedPath ? "#f8fafc" : "#334155",
              background: !selectedPath ? "#1e293b" : "transparent",
              color: !selectedPath ? "#f8fafc" : "#94a3b8",
              cursor: "pointer", fontSize: 12, fontWeight: 500
            }}
          >Todos</button>
          {Object.entries(paths).map(([k, v]) => (
            <button key={k}
              onClick={() => setSelectedPath(selectedPath === k ? null : k)}
              style={{
                padding: "6px 14px", borderRadius: 6, border: "1px solid",
                borderColor: selectedPath === k ? v.color : "#334155",
                background: selectedPath === k ? v.color + "20" : "transparent",
                color: selectedPath === k ? v.color : "#94a3b8",
                cursor: "pointer", fontSize: 12, fontWeight: 500
              }}
            >
              {v.name} <span style={{ opacity: 0.7 }}>{v.time}</span>
            </button>
          ))}
        </div>

        {selectedPath && (
          <div style={{ textAlign: "center", marginBottom: 12, padding: "8px 16px", background: paths[selectedPath].color + "15", borderRadius: 8, border: `1px solid ${paths[selectedPath].color}30` }}>
            <span style={{ color: paths[selectedPath].color, fontSize: 13, fontWeight: 500 }}>
              {paths[selectedPath].desc}
            </span>
          </div>
        )}
        
        <div style={{ position: "relative", overflow: "auto" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto" }}>
            <defs>
              <marker id="arrow" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                <polygon points="0 0, 10 3.5, 0 7" fill="#475569" />
              </marker>
              {Object.entries(paths).map(([k, v]) => (
                <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto-start-reverse">
                  <polygon points="0 0, 10 3.5, 0 7" fill={v.color} />
                </marker>
              ))}
            </defs>
            
            {phases.map((p, i) => (
              <g key={i}>
                <rect x={10} y={p.y} width={W - 20} height={p.h} rx={8}
                  fill="none" stroke={p.color} strokeWidth={1} strokeDasharray="4 4" opacity={0.3} />
                <text x={22} y={p.y + 16} fill={p.color} fontSize={10} fontWeight={600} opacity={0.6}>
                  {p.label}
                </text>
              </g>
            ))}
            
            {edges.map((e, i) => {
              const f = nodes[e.from], t = nodes[e.to];
              if (!f || !t) return null;
              const op = isHighlighted(e.from) && isHighlighted(e.to) ? 1 : 0.15;
              const c = e.color || "#475569";
              const dx = t.x - f.x, dy = t.y - f.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              const nx = dx/dist, ny = dy/dist;
              const sx = f.x + nx * 28, sy = f.y + ny * 20;
              const ex = t.x - nx * 28, ey = t.y - ny * 20;
              const isCurved = Math.abs(dx) > 200 || e.dashed;
              
              let path;
              if (isCurved) {
                const mx = (sx + ex) / 2, my = (sy + ey) / 2;
                const off = e.dashed ? (dx > 0 ? -30 : 30) : (dx > 0 ? 20 : -20);
                path = `M${sx},${sy} Q${mx + off},${my - 20} ${ex},${ey}`;
              } else {
                path = `M${sx},${sy} L${ex},${ey}`;
              }
              
              return (
                <g key={i} opacity={op}>
                  <path d={path} fill="none" stroke={c} strokeWidth={1.5}
                    strokeDasharray={e.dashed ? "5 3" : "none"}
                    markerEnd="url(#arrow)" />
                  {e.label && (
                    <text x={(sx+ex)/2 + (dx > 200 ? 10 : dx < -200 ? -10 : (dx > 0 ? 12 : -12))}
                      y={(sy+ey)/2 - 4}
                      fill={c} fontSize={9} fontWeight={500} textAnchor="middle">
                      {e.label}
                    </text>
                  )}
                </g>
              );
            })}
            
            {Object.entries(nodes).map(([id, n]) => {
              const s = typeStyles[n.type];
              const op = isHighlighted(id) ? 1 : 0.15;
              const isH = hovered === id;
              const w = n.type === "end" || n.type === "success" ? 110 : n.type === "listen" ? 90 : 130;
              const h = 36;
              
              return (
                <g key={id} opacity={op}
                  onMouseEnter={() => setHovered(id)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ cursor: "pointer" }}>
                  <rect x={n.x - w/2} y={n.y - h/2} width={w} height={h} rx={8}
                    fill={s.bg} stroke={isH ? "#f8fafc" : s.border} strokeWidth={isH ? 2 : 1.5}
                    filter={isH ? "drop-shadow(0 0 8px rgba(255,255,255,0.15))" : "none"} />
                  <text x={n.x} y={n.y - 2} textAnchor="middle" fill={s.text}
                    fontSize={11} fontWeight={700}>{n.label}</text>
                  {isH && (
                    <g>
                      <rect x={n.x - 120} y={n.y + h/2 + 6} width={240} height={24} rx={6}
                        fill="#1e293b" stroke="#334155" strokeWidth={1} />
                      <text x={n.x} y={n.y + h/2 + 22} textAnchor="middle"
                        fill="#e2e8f0" fontSize={10}>{n.sub}</text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginTop: 16 }}>
          {[
            { color: "#3b82f6", border: "#3b82f6", label: "Bot habla", icon: "🔊" },
            { color: "#06b6d4", border: "#06b6d4", label: "STT escucha", icon: "🎤" },
            { color: "#22c55e", border: "#22c55e", label: "Éxito", icon: "✓" },
            { color: "#78716c", border: "#78716c", label: "Fin llamada", icon: "✕" },
          ].map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#111", borderRadius: 6, border: `1px solid ${l.border}30` }}>
              <div style={{ width: 20, height: 20, borderRadius: 4, border: `1.5px solid ${l.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>{l.icon}</div>
              <span style={{ color: "#94a3b8", fontSize: 11 }}>{l.label}</span>
            </div>
          ))}
        </div>
        
        <div style={{ marginTop: 16, padding: "12px 16px", background: "#111", borderRadius: 8, border: "1px solid #1e293b" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, textAlign: "center" }}>
            <div>
              <div style={{ color: "#22c55e", fontSize: 20, fontWeight: 700 }}>~26s</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>Llamada exitosa</div>
            </div>
            <div>
              <div style={{ color: "#f59e0b", fontSize: 20, fontWeight: 700 }}>6.7%</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>Tasa de contacto</div>
            </div>
            <div>
              <div style={{ color: "#8b5cf6", fontSize: 20, fontWeight: 700 }}>190K</div>
              <div style={{ color: "#64748b", fontSize: 11 }}>Audios pre-generados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}