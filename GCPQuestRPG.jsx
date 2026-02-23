import { useState, useEffect, useCallback, useRef, useMemo } from "react";

// ═══════════════ DATA ═══════════════
const SK = ["data_engineering","data_science","ml_mlops","rag_llm","gcp_cloud","finops_security","leadership"];
const SKI = [{n:"Data Engineering",i:"🔧",c:"#3b82f6"},{n:"Data Science",i:"📊",c:"#a855f7"},{n:"ML/MLOps",i:"🤖",c:"#ec4899"},{n:"RAG/LLM",i:"🧠",c:"#f59e0b"},{n:"GCP Cloud",i:"☁️",c:"#06b6d4"},{n:"FinOps+Sec",i:"🔒",c:"#10b981"},{n:"Liderazgo",i:"🎯",c:"#f97316"}];
const LVL = [[1,0,"Novato"],[2,500,"Aprendiz"],[3,1500,"Practicante"],[4,3500,"Artesano"],[5,7e3,"Junior"],[6,12e3,"Profesional"],[7,2e4,"Especialista"],[8,32e3,"Senior"],[9,5e4,"Experto"],[10,75e3,"Maestro"]];
const MO = [
  {id:1,n:"Fundaciones",d:"Python+SQL+GCP",i:"⚒️",u:0,c:"#3b82f6",b:"#1a3a2e",t:"🌿"},
  {id:2,n:"Streaming+DS",d:"Pub/Sub, Dataflow, EDA",i:"🌊",u:12,c:"#06b6d4",b:"#0a2a3a",t:"🌊"},
  {id:3,n:"DS Profundo",d:"Modelos, evaluación",i:"📊",u:22,c:"#a855f7",b:"#1a0a3a",t:"🔮"},
  {id:4,n:"ML Vertex",d:"Training, Registry",i:"🤖",u:30,c:"#ec4899",b:"#2a0a1a",t:"⚡"},
  {id:5,n:"MLOps",d:"Pipelines, CI/CD",i:"⚙️",u:38,c:"#8b5cf6",b:"#1a1a3a",t:"🔩"},
  {id:6,n:"RAG Básico",d:"Embeddings, Vector DB",i:"🧠",u:45,c:"#f59e0b",b:"#2a1a0a",t:"📜"},
  {id:7,n:"RAG Avanzado",d:"Eval, agentes",i:"🔮",u:52,c:"#d946ef",b:"#2a0a2a",t:"✨"},
  {id:8,n:"SaaS MVP",d:"Auth, API, Frontend",i:"🚀",u:59,c:"#f97316",b:"#2a1a0a",t:"🏗️"},
  {id:9,n:"SaaS Beta",d:"Multi-tenant, users",i:"👥",u:66,c:"#14b8a6",b:"#0a2a2a",t:"🏙️"},
  {id:10,n:"Escala+Sec",d:"Load test, FinOps",i:"🔒",u:73,c:"#10b981",b:"#0a2a1a",t:"🏔️"},
  {id:11,n:"Contenido",d:"Blog, video, portfolio",i:"✍️",u:80,c:"#6366f1",b:"#0a0a2a",t:"📡"},
  {id:12,n:"Lanzamiento",d:"Clientes, maestría",i:"👑",u:87,c:"#eab308",b:"#2a2a0a",t:"🏆"},
];
// Quests: [id,title,xp,skillIdx,type(0=daily,1=boss,2=mini),month,acceptance]
const QD=[
["m01d01","Setup del campo de batalla",75,4,0,1,"Repo en GitHub con hello_world.py"],
["m01d02","GCP Console: reconocimiento",60,4,0,1,"Proyecto GCP con APIs habilitadas"],
["m01d03","Python: funciones que muerden",80,0,0,1,"3 funciones con type hints y docstrings"],
["m01d04","SQL: 7 consultas mortales",90,1,0,1,"7 queries SQL comentadas en BigQuery"],
["m01d05","Tests: tu primer escudo",70,0,0,1,"6+ tests pasando en verde"],
["m01d06","Cloud Storage: primer bucket",65,4,0,1,"Bucket con archivo subido y md5 ok"],
["m01d07","BigQuery desde Python",90,0,0,1,"Script funcional con datos en BigQuery"],
["m01d08","IAM: service account segura",75,5,0,1,"SA con 2 roles, key en .gitignore"],
["m01d09","Docker: containeriza tu ETL",85,4,0,1,"docker build+run produce output correcto"],
["m01d10","Cloud Run: primer servicio",95,4,0,1,"Servicio en Cloud Run respondiendo"],
["m01d11","CI: GitHub Actions",80,4,0,1,"CI verde con badge en README"],
["m01d12","Terraform: infra como código",85,4,0,1,"terraform plan muestra 3 recursos"],
["m01d13","Data quality checks",85,0,0,1,"4 checks con tests pasando"],
["m01d14","OWASP para tu API",70,5,0,1,"3 riesgos con mitigaciones"],
["m01m01","Mini: Leer IAM en GCP",25,5,2,1,"3 bullets escritos"],
["m01m02","Mini: Revisar costos GCP",15,5,2,1,"Gasto verificado"],
["m01b01","BOSS: Pipeline CSV→JSON",300,0,1,1,"Pipeline genera output.json y errors.json"],
["m01b02","BOSS FINAL: Proyecto DE",500,0,1,1,"Proyecto completo, CI verde, README pro"],
["m02d01","Pub/Sub: topic+subscription",80,0,0,2,"10 mensajes enviados y recibidos"],
["m02d02","Pub/Sub→BigQuery streaming",90,0,0,2,"50 mensajes en BigQuery"],
["m02d03","Apache Beam: primer pipeline",95,0,0,2,"Pipeline DirectRunner sin errores"],
["m02d04","Dataflow en la nube",85,0,0,2,"Job completado con doc de costos"],
["m02d05","EDA: primer notebook",75,1,0,2,"Notebook con 3 secciones"],
["m02d06","Visualizaciones con historia",80,1,0,2,"4 gráficos con interpretación"],
["m02d07","Feature Engineering: 5 vars",85,1,0,2,"5 features con explicación"],
["m02d08","Métricas ML explicadas",75,1,0,2,"6 métricas con ejemplos"],
["m02d09","Data leakage demo",90,1,0,2,"2 escenarios con diferencia clara"],
["m02d10","Dataform: SQL transforms",85,0,0,2,"3 models con tests"],
["m02d11","Observabilidad: logs+alertas",80,4,0,2,"Alerta funcional"],
["m02m01","Prompt Dojo: EDA",25,3,2,2,"3 prompts evaluados"],
["m02b01","BOSS: Streaming E2E",450,0,1,2,"Pipeline streaming con diagrama"],
["m02b02","BOSS: Reporte DS",500,1,1,2,"Notebook completo sin leakage"],
["m03d01","XGBoost vs LightGBM vs RF",90,1,0,3,"3 modelos comparados con CV"],
["m03d02","Hyperparameter tuning",85,1,0,3,"Tuning con mejora documentada"],
["m03d03","Confusion Matrix profunda",80,1,0,3,"4 visualizaciones de evaluación"],
["m03d04","Calibración probabilidades",85,1,0,3,"Reliability diagram antes/después"],
["m03d05","Storytelling ejecutivos",75,6,0,3,"Resumen que un gerente entiende"],
["m03d06","Dashboard Looker Studio",80,1,0,3,"Dashboard accesible por URL"],
["m03d07","Feature Store conceptual",70,0,0,3,"ADR con diseño"],
["m03d08","Data versioning DVC",80,0,0,3,"DVC con 2 versiones y rollback"],
["m03m01","Prompt Dojo: arquitectura",25,3,2,3,"3 prompts evaluados"],
["m03b01","BOSS: Modelo production-ready",400,1,1,3,"Reporte con métricas y CM"],
["m03b02","BOSS: Proyecto DS portafolio",500,1,1,3,"Proyecto DS completo"],
["m04d01","Vertex Workbench setup",70,2,0,4,"Notebook en Vertex"],
["m04d02","Vertex Experiments tracking",85,2,0,4,"3 runs en Vertex"],
["m04d03","Vertex Datasets",75,2,0,4,"Dataset con splits"],
["m04d04","Custom Training Job",95,2,0,4,"Training job completado"],
["m04d05","HP Tuning en Vertex",85,2,0,4,"HP tuning completado"],
["m04d06","Model Registry",80,2,0,4,"Modelo registrado"],
["m04d07","Endpoint: online prediction",90,2,0,4,"Endpoint respondiendo"],
["m04d08","Batch Prediction",80,2,0,4,"Resultados batch en BQ"],
["m04m01","Mini: Costos Vertex AI",20,5,2,4,"Cálculo documentado"],
["m04b01","BOSS: ML Endpoint prod",500,2,1,4,"Pipeline ML en producción"],
["m05d01","Vertex Pipelines: Kubeflow",95,2,0,5,"Pipeline 3 componentes"],
["m05d02","Pipeline parametrizable",85,2,0,5,"Pipeline con params"],
["m05d03","Pipeline inferencia",90,2,0,5,"Pipeline con scheduler"],
["m05d04","Model Monitoring: drift",85,2,0,5,"Monitoring detecta drift"],
["m05d05","CI/CD para ML",90,2,0,5,"CI/CD bloquea si bajan métricas"],
["m05d06","A/B Testing modelos",80,2,0,5,"A/B con métricas"],
["m05d07","Rollback automático",85,2,0,5,"Rollback funciona"],
["m05m01","ADR: deployment strategy",25,6,2,5,"ADR con comparación"],
["m05b01","BOSS: MLOps completo",500,2,1,5,"Sistema MLOps v0.3.0"],
["m06d01","Embeddings: similitud coseno",80,3,0,6,"Script calcula similitud"],
["m06d02","Embeddings Vertex AI",85,3,0,6,"Comparación documentada"],
["m06d03","ChromaDB: vector DB",85,3,0,6,"50 docs con queries"],
["m06d04","Chunking: 3 estrategias",90,3,0,6,"3 estrategias con benchmark"],
["m06d05","Ingesta de documentos",85,3,0,6,"10+ docs procesados"],
["m06d06","RAG: retrieve+generate",95,3,0,6,"RAG responde correctamente"],
["m06d07","Vertex Vector Search",80,3,0,6,"Vector Search con benchmark"],
["m06m01","RAG vs fine-tuning",20,3,2,6,"3 criterios documentados"],
["m06b01","BOSS: RAG App funcional",500,3,1,6,"RAG con API y docs"],
["m07d01","Eval: faithfulness",90,3,0,7,"Métrica sobre 20 queries"],
["m07d02","Eval: relevance",85,3,0,7,"2 métricas con scores"],
["m07d03","Re-ranking",85,3,0,7,"Re-ranking mejora precisión"],
["m07d04","Hybrid Search",80,3,0,7,"Hybrid con benchmark"],
["m07d05","Agentes: tool use",95,3,0,7,"Agente usa 3 tools"],
["m07d06","Semantic caching",80,3,0,7,"Cache reduce llamadas"],
["m07d07","Observabilidad RAG",75,3,0,7,"Dashboard métricas RAG"],
["m07b01","BOSS: RAG+eval metrics",500,3,1,7,"RAG production-ready"],
["m08d01","Define tu SaaS",80,6,0,8,"Doc 5 secciones + ADR"],
["m08d02","Diseño de sistema",85,4,0,8,"Diagrama con justificación"],
["m08d03","Auth: OAuth+multi-tenant",90,4,0,8,"Login+orgs+aislamiento"],
["m08d04","Backend MVP: 3 endpoints",90,4,0,8,"3 endpoints con Swagger"],
["m08d05","Database: Firestore/SQL",85,0,0,8,"CRUD funcional documentado"],
["m08d06","Frontend: landing+dashboard",90,6,0,8,"Landing y dashboard en Vercel"],
["m08d07","Integra ML/RAG en SaaS",95,2,0,8,"Feature AI funcional"],
["m08m01","Pricing: 3 competidores",20,6,2,8,"Tabla comparativa"],
["m08b01","BOSS: MVP deployeado",500,4,1,8,"MVP accesible por URL"],
["m09d01","Multi-tenant: aislamiento",85,5,0,9,"Test org A no ve datos B"],
["m09d02","Rate limiting+quotas",80,5,0,9,"429 en exceso"],
["m09d03","Audit log",75,5,0,9,"Audit en BQ"],
["m09d04","Onboarding flow",80,6,0,9,"Onboarding <10 min"],
["m09d05","Modelo de pricing",75,5,0,9,"Planes con breakeven"],
["m09d06","Feedback loop in-app",70,6,0,9,"Feedback funcional"],
["m09d07","3-5 beta users",90,6,0,9,"3+ usuarios con feedback"],
["m09b01","BOSS: Beta con usuarios",500,6,1,9,"Beta funcional"],
["m10d01","Load test k6",85,4,0,10,"Reporte latencia"],
["m10d02","Cloud Run autoscaling",80,4,0,10,"Mejora documentada"],
["m10d03","Caching Memorystore",85,4,0,10,"Cache con métricas"],
["m10d04","FinOps: dashboard costos",80,5,0,10,"Dashboard+alert"],
["m10d05","Secret Manager",75,5,0,10,"App sin .env"],
["m10d06","VPC+Cloud Armor",80,5,0,10,"VPC+Armor config"],
["m10d07","Privacidad Chile",85,5,0,10,"DELETE /me+compliance"],
["m10b01","BOSS: Escala+seguridad",500,5,1,10,"Security checklist 100%"],
["m11d01","Blog: DE en GCP",80,6,0,11,"Post publicado 500+ palabras"],
["m11d02","Blog: ML producción",80,6,0,11,"Post con lecciones"],
["m11d03","Video técnico",85,6,0,11,"Video con demo"],
["m11d04","Talk 10 minutos",75,6,0,11,"Talk grabada"],
["m11d05","GitHub profile pro",70,6,0,11,"5 repos pinneados"],
["m11d06","Open source contribution",90,6,0,11,"PR/issue externo"],
["m11d07","LinkedIn técnico",60,6,0,11,"LinkedIn+post"],
["m11b01","BOSS: Portafolio completo",500,6,1,11,"Todo contenido público"],
["m12d01","Landing page profesional",85,6,0,12,"Landing deployada"],
["m12d02","Pricing page",80,6,0,12,"Pricing funcional"],
["m12d03","Outreach: 10 prospects",75,6,0,12,"10 emails enviados"],
["m12d04","Demo flow",80,6,0,12,"Demo con cuenta"],
["m12d05","Analytics producto",80,1,0,12,"Dashboard métricas"],
["m12d06","Primeros 3 clientes",95,6,0,12,"3 usuarios activos"],
["m12d07","Retrospectiva del año",70,6,0,12,"Retro publicada"],
["m12b01","BOSS FINAL: Maestro",750,6,1,12,"SaaS+portafolio+contenido"],
];
const Q = QD.map(q => ({id:q[0],t:q[1],x:q[2],s:q[3],tp:q[4],m:q[5],a:q[6]}));

// ═══════════════ WORLD MAP LAYOUT ═══════════════
const MAP_W = 1400, MAP_H = 900;
const LOCS = [
  {x:120,y:750},{x:300,y:620},{x:520,y:680},{x:700,y:560},
  {x:880,y:640},{x:1060,y:520},{x:1200,y:400},{x:1040,y:280},
  {x:840,y:200},{x:620,y:160},{x:400,y:240},{x:200,y:160},
];
const PATHS = [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7],[7,8],[8,9],[9,10],[10,11]];

// Terrain decorations
const TREES = Array.from({length:40},(_,i)=>({x:50+Math.sin(i*7.3)*600+700,y:50+Math.cos(i*5.1)*350+450,s:14+Math.sin(i)*6}));
const ROCKS = Array.from({length:20},(_,i)=>({x:80+Math.sin(i*3.7)*550+700,y:80+Math.cos(i*9.2)*300+450}));
const STARS = Array.from({length:60},(_,i)=>({x:Math.random()*MAP_W,y:Math.random()*MAP_H*0.4,d:1+Math.random()*3,o:0.3+Math.random()*0.7}));

// ═══════════════ HELPERS ═══════════════
const getLevel = xp => { for(let i=LVL.length-1;i>=0;i--) if(xp>=LVL[i][1]) return LVL[i]; return LVL[0]; };
const getProg = xp => { const c=getLevel(xp),i=LVL.findIndex(l=>l[0]===c[0]); if(i>=LVL.length-1) return 100; const n=LVL[i+1]; return ((xp-c[1])/(n[1]-c[1]))*100; };
const defState = {xp:0,skills:SK.map(()=>0),done:[],streak:0,best:0,lastD:null,quizOk:[],pos:0};

// ═══════════════ PARTICLE SYSTEM ═══════════════
function Particles({ particles }) {
  return particles.map((p,i) => (
    <div key={i} style={{position:"absolute",left:p.x,top:p.y,color:p.c||"#f59e0b",fontSize:p.sz||14,fontWeight:800,pointerEvents:"none",opacity:p.o,transform:`translateY(${p.dy}px)`,transition:"all 0.8s ease-out",zIndex:200,textShadow:"0 0 8px currentColor"}}>
      {p.text}
    </div>
  ));
}

// ═══════════════ AI VERIFY ═══════════════
function AIPanel({quest,phase,onResult,onClose}) {
  const [input,setInput] = useState("");
  const [loading,setLoading] = useState(false);
  const [result,setResult] = useState(null);

  const run = async () => {
    if(!input.trim()) return;
    setLoading(true); setResult(null);
    const prompts = {
      quiz: `Genera 3 preguntas tipo quiz sobre: "${quest.t}". Skill: ${SKI[quest.s].n}. Criterio: ${quest.a}.\nResponde SOLO JSON: {"questions":[{"q":"texto","options":["a","b","c","d"],"correct":0}]}`,
      verify: `MISIÓN: ${quest.t}\nCRITERIO: ${quest.a}\nOUTPUT:\n\`\`\`\n${input}\n\`\`\`\nResponde SOLO JSON: {"passed":true/false,"score":1,"feedback":"texto","tip":"texto"}`,
      reflect: `MISIÓN: ${quest.t}\nREFLEXIÓN:\n${input}\nResponde SOLO JSON: {"quality":"deep","feedback":"texto"}`,
    };
    try {
      const r = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompts[phase]}]})});
      const d = await r.json();
      const t = d.content?.map(c=>c.text||"").join("")||"";
      const p = JSON.parse(t.replace(/```json|```/g,"").trim());
      setResult(p);
      if(phase==="verify" && p.passed) onResult(p);
      else if(phase==="reflect" && p.quality!=="shallow") onResult(p);
      else if(phase==="quiz") onResult(p);
    } catch(e) {
      setResult({error:true,feedback:"Error de conexión. Usa verificación manual."});
    }
    setLoading(false);
  };

  const manualPass = () => onResult(phase==="quiz"?{questions:[]}:phase==="verify"?{passed:true,score:7,feedback:"Manual"}:{quality:"adequate",feedback:"Manual"});

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,backdropFilter:"blur(6px)"}}>
      <div style={{background:"#12121f",border:"1px solid #2a2a40",borderRadius:16,width:"95%",maxWidth:560,maxHeight:"88vh",overflow:"auto",boxShadow:"0 0 60px rgba(61,90,254,0.15)"}}>
        <div style={{padding:"16px 20px",borderBottom:"1px solid #1e1e34",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{color:"#e0e0f0",fontWeight:700,fontSize:15}}>
            {phase==="quiz"?"🧠 Quiz de Predicción":phase==="verify"?"🤖 Verificación IA":"✍️ Reflexión"}
          </span>
          <button onClick={onClose} style={{background:"none",border:"none",color:"#666",fontSize:20,cursor:"pointer"}}>✕</button>
        </div>
        <div style={{padding:20}}>
          <div style={{background:"#0a0a16",borderRadius:8,padding:12,marginBottom:14,border:"1px solid #1a1a30"}}>
            <p style={{color:"#8888a8",fontSize:11,margin:0}}>CRITERIO</p>
            <p style={{color:"#c0c0d8",fontSize:13,margin:"4px 0 0"}}>{quest.a}</p>
          </div>
          <textarea value={input} onChange={e=>setInput(e.target.value)} rows={6} placeholder={phase==="quiz"?"Escribe tus predicciones...":phase==="verify"?"Pega tu código o output...":"Explica qué aprendiste (3-5 líneas)..."}
            style={{width:"100%",background:"#0a0a16",border:"1px solid #2a2a40",borderRadius:8,padding:12,color:"#e0e0f0",fontFamily:"'Menlo',monospace",fontSize:13,resize:"vertical",outline:"none",boxSizing:"border-box"}} />
          <div style={{display:"flex",gap:8,marginTop:12}}>
            <button onClick={run} disabled={!input.trim()||loading}
              style={{flex:1,padding:"11px 0",borderRadius:8,border:"none",background:loading?"#2a2a40":"#3d5afe",color:"#fff",fontWeight:700,fontSize:13,cursor:loading?"wait":"pointer",opacity:!input.trim()?0.4:1}}>
              {loading?"⏳ Evaluando...":"🤖 Verificar"}
            </button>
            <button onClick={manualPass} style={{padding:"11px 14px",borderRadius:8,border:"1px solid #2a2a40",background:"none",color:"#666",fontSize:12,cursor:"pointer"}}>✓ Manual</button>
          </div>
          {result && !result.error && phase==="verify" && (
            <div style={{marginTop:14,padding:14,borderRadius:10,background:result.passed?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${result.passed?"#10b98144":"#ef444444"}`}}>
              <p style={{color:result.passed?"#10b981":"#ef4444",fontWeight:700,fontSize:15,margin:0}}>{result.passed?"✅ APROBADO":"❌ INTENTA DE NUEVO"} — {result.score}/10</p>
              <p style={{color:"#aaa",fontSize:13,margin:"6px 0"}}>{result.feedback}</p>
              {result.tip && <p style={{color:"#f59e0b",fontSize:12,margin:0}}>💡 {result.tip}</p>}
            </div>
          )}
          {result?.error && <p style={{color:"#ef4444",fontSize:13,marginTop:12}}>{result.feedback}</p>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════ QUEST DETAIL ═══════════════
function QuestDetail({quest,state,onComplete,onBack}) {
  const isDone = state.done.includes(quest.id);
  const quizDone = state.quizOk.includes(quest.id);
  const [phase,setPhase] = useState(isDone?"done":quizDone?"verify":"quiz");
  const [showAI,setShowAI] = useState(false);
  const [mounted,setMounted] = useState(false);
  const [bossFlash,setBossFlash] = useState(quest.tp===1);
  const sk = SKI[quest.s];
  const tp = quest.tp===1?"🐉 BOSS":quest.tp===2?"⚡ MINI":"📋 DAILY";
  const isBoss = quest.tp===1;

  useEffect(()=>{
    setTimeout(()=>setMounted(true),30);
    if(isBoss) setTimeout(()=>setBossFlash(false),700);
  },[]);

  const handleResult = (r) => {
    setShowAI(false);
    if(phase==="quiz") setPhase("verify");
    else if(phase==="verify") setPhase("reflect");
    else if(phase==="reflect") { onComplete(quest); setPhase("done"); }
  };

  const phases = [
    {k:"quiz",n:"Quiz",i:"🧠",done:quizDone||phase!=="quiz",color:"#8b5cf6"},
    {k:"verify",n:"Código",i:"💻",done:phase==="reflect"||phase==="done",color:"#3d5afe"},
    {k:"reflect",n:"Reflexión",i:"✍️",done:phase==="done",color:"#10b981"},
  ];
  const curPhase = phases.find(p=>p.k===phase);

  const phaseActions = {
    quiz: {label:"🧠 Iniciar Quiz de Predicción",bg:"#8b5cf6"},
    verify: {label:"🤖 Verificar con IA",bg:"#3d5afe"},
    reflect: {label:"✍️ Escribir Reflexión",bg:"#10b981"},
  };

  return (
    <div style={{position:"fixed",inset:0,background:isBoss?"#06040f":"#0a0a14",zIndex:50,overflow:"auto",
      opacity:mounted?1:0,transform:mounted?"none":"translateY(16px)",transition:"opacity 0.3s,transform 0.3s"}}>
      {/* Boss background flash */}
      {bossFlash && <div style={{position:"fixed",inset:0,background:"rgba(239,68,68,0.08)",zIndex:0,animation:"bossFlash 0.7s ease-out forwards",pointerEvents:"none"}} />}
      {/* Boss ambient particles */}
      {isBoss && Array.from({length:8}).map((_,i)=>(
        <div key={i} style={{position:"fixed",left:`${10+i*12}%`,top:`${15+Math.sin(i)*20}%`,
          fontSize:18+i%3*6,opacity:0.12,animation:`float${i%3} ${4+i%3}s ease-in-out infinite`,pointerEvents:"none"}}>💀</div>
      ))}
      <div style={{position:"relative",zIndex:1,maxWidth:640,margin:"0 auto",padding:"20px 20px 48px"}}>
        <button onClick={onBack} style={{background:"rgba(255,255,255,0.04)",border:"1px solid #ffffff0a",borderRadius:8,color:"#5a5a78",fontSize:13,padding:"6px 14px",cursor:"pointer",marginBottom:20}}>← Volver</button>
        {/* Boss banner */}
        {isBoss && (
          <div style={{background:"linear-gradient(135deg,#2a0a0a,#1a0505)",border:"1px solid #ef444433",borderRadius:12,padding:"12px 18px",marginBottom:16,
            display:"flex",alignItems:"center",gap:12,animation:"bossEntry 0.5s cubic-bezier(.22,1,.36,1)"}}>
            <span style={{fontSize:32,animation:"bossHover 2s ease-in-out infinite"}}>🐉</span>
            <div>
              <p style={{color:"#ef4444",fontWeight:800,fontSize:13,margin:"0 0 2px",textTransform:"uppercase",letterSpacing:"0.1em"}}>Boss Fight</p>
              <p style={{color:"#7a4a4a",fontSize:12,margin:0}}>Derrota este BOSS para desbloquear el siguiente mes</p>
            </div>
            <span style={{marginLeft:"auto",color:"#ef4444",fontWeight:800,fontSize:20}}>+{quest.x} XP</span>
          </div>
        )}
        {/* Quest card */}
        <div style={{background:"#12121f",border:`1px solid ${sk.c}${isBoss?"55":"33"}`,borderRadius:14,padding:24,marginBottom:16,
          boxShadow:isBoss?`0 0 30px ${sk.c}22`:"none"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:14}}>
            <div>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                <span style={{background:`${sk.c}18`,color:sk.c,fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:20}}>{sk.i} {sk.n}</span>
                <span style={{background:isBoss?"#ef444412":"#ffffff08",color:isBoss?"#ef4444":"#5a5a78",fontSize:11,fontWeight:600,padding:"2px 8px",borderRadius:20}}>{tp}</span>
              </div>
              <h2 style={{color:"#e8e8f4",fontSize:20,fontWeight:800,margin:0,lineHeight:1.3}}>{quest.t}</h2>
            </div>
            {!isBoss && (
              <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
                <p style={{color:"#f59e0b",fontSize:22,fontWeight:800,margin:0}}>+{quest.x}</p>
                <p style={{color:"#4a4a68",fontSize:10,margin:0}}>XP</p>
              </div>
            )}
          </div>
          <div style={{background:"#0a0a16",borderRadius:8,padding:"10px 14px",border:`1px solid ${sk.c}18`}}>
            <p style={{color:sk.c,fontSize:10,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 3px"}}>Criterio de Aprobación</p>
            <p style={{color:"#d0d0e0",fontSize:14,margin:0,lineHeight:1.6}}>{quest.a}</p>
          </div>
        </div>
        {/* Phase Stepper */}
        {!isDone && (
          <div style={{display:"flex",gap:6,marginBottom:16}}>
            {phases.map((p,i)=>{
              const isActive = phase===p.k;
              const isDoneP = p.done&&phase!==p.k;
              return (
                <div key={p.k} style={{flex:1,background:isActive?`${p.color}12`:"#0c0c18",
                  border:`1.5px solid ${isActive?p.color+"66":isDoneP?"#10b98144":"#1e1e34"}`,
                  borderRadius:10,padding:"10px 8px",textAlign:"center",
                  transition:"all 0.3s",
                  boxShadow:isActive?`0 0 16px ${p.color}22`:"none",
                  animation:isActive?"phaseActive 2s ease-in-out infinite":"none"}}>
                  <span style={{fontSize:isActive?24:18,transition:"font-size 0.2s"}}>{isDoneP?"✅":p.i}</span>
                  <p style={{color:isActive?p.color:isDoneP?"#10b981":"#3a3a58",fontSize:11,fontWeight:700,margin:"4px 0 0",transition:"color 0.3s"}}>Fase {i+1}: {p.n}</p>
                  {isActive&&<div style={{height:2,background:p.color,borderRadius:2,marginTop:6,animation:"phaseLine 2s ease-in-out infinite"}} />}
                </div>
              );
            })}
          </div>
        )}
        {isDone ? (
          <div style={{background:"rgba(16,185,129,0.07)",border:"1px solid #10b98133",borderRadius:12,padding:32,textAlign:"center",animation:"completeBounce 0.5s cubic-bezier(.22,1,.36,1)"}}>
            <div style={{fontSize:64,animation:"spin 0.5s ease-out"}}>✅</div>
            <p style={{color:"#10b981",fontSize:20,fontWeight:800,margin:"12px 0 4px"}}>¡Misión Completada!</p>
            <p style={{color:"#5a5a78",fontSize:13}}>+{quest.x} XP ganados</p>
          </div>
        ) : (
          <button onClick={()=>setShowAI(true)}
            disabled={!!isDone}
            style={{width:"100%",padding:"15px 0",borderRadius:12,border:"none",
              background:phaseActions[phase]?.bg||"#3d5afe",
              color:"#fff",fontWeight:800,fontSize:15,cursor:"pointer",
              boxShadow:`0 6px 24px ${phaseActions[phase]?.bg||"#3d5afe"}44`,
              transition:"transform 0.15s,box-shadow 0.15s",
              animation:"btnPulse 3s ease-in-out infinite"}}>
            {phaseActions[phase]?.label}
          </button>
        )}
      </div>
      {showAI && <AIPanel quest={quest} phase={phase} onResult={handleResult} onClose={()=>setShowAI(false)} />}
    </div>
  );
}

// ═══════════════ ZONE VIEW (Inside Month) ═══════════════
function ZoneView({month,state,onSelectQuest,onBack}) {
  const mo = MO[month-1];
  const quests = Q.filter(q=>q.m===month);
  const done = quests.filter(q=>state.done.includes(q.id)).length;
  const dailies = quests.filter(q=>q.tp===0);
  const bosses = quests.filter(q=>q.tp===1);
  const minis = quests.filter(q=>q.tp===2);
  const [mounted,setMounted] = useState(false);
  const [hovered,setHovered] = useState(null);
  useEffect(()=>{setTimeout(()=>setMounted(true),30);},[]);
  const pct = quests.length>0?done/quests.length*100:0;

  return (
    <div style={{position:"fixed",inset:0,background:mo.b,zIndex:40,overflow:"auto",
      opacity:mounted?1:0,transform:mounted?"none":"translateX(20px)",transition:"opacity 0.35s,transform 0.35s"}}>
      {/* Ambient particles más visibles */}
      {Array.from({length:16}).map((_,i)=>(
        <div key={i} style={{position:"fixed",
          left:`${5+i*6}%`,top:`${15+Math.sin(i*1.2)*35}%`,
          fontSize:14+i%4*5,opacity:0.1+i%3*0.04,
          animation:`float${i%3} ${3+i%4}s ease-in-out infinite`,
          animationDelay:`${i*0.4}s`,pointerEvents:"none",
          filter:`hue-rotate(${i*20}deg)`}}>{mo.t}</div>
      ))}
      {/* Scanline overlay sutil */}
      <div style={{position:"fixed",inset:0,background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.03) 3px,rgba(0,0,0,0.03) 4px)",pointerEvents:"none",zIndex:0}} />
      <div style={{position:"relative",zIndex:1,maxWidth:700,margin:"0 auto",padding:"20px 20px 48px"}}>
        <button onClick={onBack} style={{background:"rgba(0,0,0,0.35)",border:"1px solid #ffffff12",borderRadius:8,color:"#8888a8",fontSize:13,padding:"8px 16px",cursor:"pointer",marginBottom:20,backdropFilter:"blur(6px)"}}>← Mapa</button>
        {/* Header de zona */}
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,animation:"slideDown 0.4s cubic-bezier(.22,1,.36,1)"}}>
          <div style={{width:70,height:70,borderRadius:16,background:`${mo.c}18`,border:`2px solid ${mo.c}55`,
            display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,
            boxShadow:`0 0 20px ${mo.c}33`,animation:"iconBob 3s ease-in-out infinite"}}>{mo.i}</div>
          <div style={{flex:1}}>
            <h1 style={{color:"#e8e8f4",fontSize:22,fontWeight:800,margin:"0 0 2px"}}>Mes {month}: {mo.n}</h1>
            <p style={{color:"#6a6a88",fontSize:13,margin:"0 0 8px"}}>{mo.d}</p>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <div style={{background:"#0a0a16",borderRadius:4,height:8,flex:1,overflow:"hidden",border:"1px solid #1a1a30"}}>
                <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${mo.c},${mo.c}88)`,
                  borderRadius:4,transition:"width 0.8s cubic-bezier(.22,1,.36,1)",
                  boxShadow:`0 0 8px ${mo.c}66`}} />
              </div>
              <span style={{color:mo.c,fontSize:13,fontWeight:800,minWidth:36}}>{done}/{quests.length}</span>
              {pct===100&&<span style={{fontSize:16,animation:"spin 0.5s ease-out"}}>🏆</span>}
            </div>
          </div>
        </div>
        {/* Grupos de quests con stagger */}
        {[{label:"Misiones Diarias",items:dailies,icon:"📋",offset:0},{label:"Mini Quests",items:minis,icon:"⚡",offset:dailies.length},{label:"Boss Fights",items:bosses,icon:"🐉",offset:dailies.length+minis.length}].map(group=>group.items.length>0&&(
          <div key={group.label} style={{marginBottom:22}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,paddingBottom:6,borderBottom:`1px solid ${mo.c}22`}}>
              <span style={{fontSize:14}}>{group.icon}</span>
              <p style={{color:"#6a6a88",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",margin:0}}>{group.label}</p>
              <span style={{marginLeft:"auto",color:mo.c,fontSize:11,fontWeight:700}}>
                {group.items.filter(q=>state.done.includes(q.id)).length}/{group.items.length}
              </span>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:5}}>
              {group.items.map((q,qi)=>{
                const isDoneQ = state.done.includes(q.id);
                const sk = SKI[q.s];
                const isBoss = q.tp===1;
                const isHov = hovered===q.id;
                return (
                  <div key={q.id} onClick={()=>onSelectQuest(q)}
                    onMouseEnter={()=>setHovered(q.id)}
                    onMouseLeave={()=>setHovered(null)}
                    style={{background:isDoneQ?"rgba(16,185,129,0.06)":isHov?"rgba(255,255,255,0.06)":isBoss?"rgba(239,68,68,0.04)":"rgba(255,255,255,0.02)",
                      border:`1px solid ${isDoneQ?"#10b98133":isHov?mo.c+"66":isBoss?"#ef444433":"#ffffff08"}`,
                      borderRadius:10,padding:"11px 14px",cursor:"pointer",
                      transition:"all 0.18s",
                      transform:isHov&&!isDoneQ?"translateX(4px)":"translateX(0)",
                      boxShadow:isHov&&!isDoneQ?`0 4px 16px ${mo.c}18`:isBoss?`0 0 12px #ef444418`:"none",
                      animation:`questIn 0.35s ${(group.offset+qi)*0.04}s both cubic-bezier(.22,1,.36,1)`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div style={{display:"flex",gap:10,alignItems:"center",flex:1,minWidth:0}}>
                        <span style={{fontSize:isDoneQ?16:isBoss?20:15,
                          filter:isBoss&&!isDoneQ?"drop-shadow(0 0 4px #ef4444)":"none",
                          animation:isBoss&&!isDoneQ?"bossHover 2s ease-in-out infinite":"none"}}>
                          {isDoneQ?"✅":isBoss?"🐉":q.tp===2?"⚡":"📋"}
                        </span>
                        <div style={{minWidth:0}}>
                          <p style={{color:isDoneQ?"#10b981":isBoss?"#ef9090":"#e0e0e8",
                            fontSize:13,fontWeight:isBoss?700:600,margin:0,
                            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.t}</p>
                          <p style={{color:"#3a3a58",fontSize:11,margin:"2px 0 0",
                            overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{q.a}</p>
                        </div>
                      </div>
                      <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0,marginLeft:8}}>
                        <span style={{background:`${sk.c}14`,color:sk.c,fontSize:10,padding:"2px 6px",borderRadius:20,fontWeight:600}}>{sk.i}</span>
                        <span style={{color:isBoss?"#ef4444":"#f59e0b",fontSize:12,fontWeight:800}}>+{q.x}</span>
                        {isHov&&!isDoneQ&&<span style={{color:mo.c,fontSize:11}}>→</span>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════ MAIN GAME ═══════════════
export default function GCPQuestRPG() {
  const [state,setState] = useState(defState);
  const [loaded,setLoaded] = useState(false);
  const [screen,setScreen] = useState("map"); // map, zone, quest, skills
  const [selMonth,setSelMonth] = useState(null);
  const [selQuest,setSelQuest] = useState(null);
  const [particles,setParticles] = useState([]);
  const [notif,setNotif] = useState(null);
  const [charPos,setCharPos] = useState({x:LOCS[0].x,y:LOCS[0].y});
  const [walking,setWalking] = useState(false);
  const [showMenu,setShowMenu] = useState(false);
  const mapRef = useRef(null);
  const animRef = useRef(null);

  useEffect(()=>{
    try{
      const raw = localStorage.getItem("gcpq-rpg-v1");
      if(raw){const d=JSON.parse(raw);setState(d);setCharPos({x:LOCS[d.pos||0].x,y:LOCS[d.pos||0].y});}
    }catch{}
    setLoaded(true);
  },[]);

  const save = useCallback((s)=>{setState(s);try{localStorage.setItem("gcpq-rpg-v1",JSON.stringify(s));}catch{}},[]);

  const moveToLoc = useCallback((idx)=>{
    if(idx<0||idx>=12) return;
    const mo = MO[idx];
    if(state.done.length < mo.u) return;
    setWalking(true);
    const target = LOCS[idx];
    setCharPos({x:target.x,y:target.y});
    setTimeout(()=>{
      setWalking(false);
      save({...state,pos:idx});
    },600);
  },[state,save]);

  const enterZone = useCallback((idx)=>{
    const mo = MO[idx];
    if(state.done.length < mo.u) return;
    setSelMonth(idx+1);
    setScreen("zone");
  },[state]);

  const completeQuest = useCallback((quest)=>{
    if(state.done.includes(quest.id)) return;
    const bonus = Math.min(0.5, state.streak*0.1);
    const gained = Math.round(quest.x*(1+bonus));
    const today = new Date().toISOString().split("T")[0];
    let ns = state.streak;
    if(state.lastD!==today) ns = state.lastD ? (Math.floor((Date.now()-new Date(state.lastD).getTime())/864e5)<=2 ? state.streak+1 : 1) : 1;
    const skills = [...state.skills]; skills[quest.s] += gained;
    const newState = {...state,xp:state.xp+gained,skills,done:[...state.done,quest.id],quizOk:[...state.quizOk,quest.id],streak:ns,best:Math.max(state.best,ns),lastD:today};
    save(newState);
    // Particles
    setParticles(p=>[...p,{x:280,y:200,text:`+${gained} XP`,c:"#f59e0b",o:1,dy:0,sz:18}]);
    setTimeout(()=>setParticles(p=>p.map(pp=>({...pp,dy:-60,o:0}))),50);
    setTimeout(()=>setParticles([]),900);
    // Level up check
    const ol = getLevel(state.xp), nl = getLevel(newState.xp);
    if(nl[0]>ol[0]) setNotif({msg:`🎉 ¡NIVEL ${nl[0]} — ${nl[2]}!`,c:"#f59e0b"});
    else setNotif({msg:`✨ +${gained} XP`,c:"#10b981"});
    setTimeout(()=>setNotif(null),3e3);
  },[state,save]);

  // Keyboard navigation
  useEffect(()=>{
    if(screen!=="map") return;
    const handler = (e)=>{
      const k = e.key;
      const pos = state.pos||0;
      if(k==="ArrowRight"||k==="d") moveToLoc(pos+1);
      else if(k==="ArrowLeft"||k==="a") moveToLoc(pos-1);
      else if(k==="Enter"||k===" ") enterZone(pos);
    };
    window.addEventListener("keydown",handler);
    return ()=>window.removeEventListener("keydown",handler);
  },[screen,state.pos,moveToLoc,enterZone]);

  if(!loaded) return <div style={{minHeight:"100vh",background:"#0a0a14",display:"flex",alignItems:"center",justifyContent:"center",color:"#3d5afe",fontFamily:"monospace",fontSize:16}}>⚔️ Cargando mundo...</div>;

  const lvl = getLevel(state.xp);
  const prog = getProg(state.xp);
  const nextLvl = LVL[Math.min(LVL.findIndex(l=>l[0]===lvl[0])+1,LVL.length-1)];

  return (
    <div style={{minHeight:"100vh",background:"#0a0a14",color:"#e0e0f0",fontFamily:"'Segoe UI',-apple-system,sans-serif",overflow:"hidden",position:"relative"}}>
      {/* HUD */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:30,background:"linear-gradient(180deg,rgba(10,10,20,0.95),rgba(10,10,20,0.8))",backdropFilter:"blur(8px)",borderBottom:"1px solid #1a1a30",padding:"8px 16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",maxWidth:960,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:8,background:"linear-gradient(135deg,#3d5afe,#00e5ff)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,color:"#fff"}}>⚔️</div>
            <div>
              <p style={{fontSize:13,fontWeight:800,margin:0,color:"#e0e0f0"}}>Lv{lvl[0]} {lvl[2]}</p>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <div style={{background:"#1a1a30",borderRadius:3,height:5,width:90,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${prog}%`,background:"linear-gradient(90deg,#3d5afe,#00e5ff)",borderRadius:3,transition:"width 0.6s"}} />
                </div>
                <span style={{color:"#4a4a68",fontSize:10}}>{state.xp}/{nextLvl[1]}</span>
              </div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{textAlign:"center"}}><span style={{color:"#f59e0b",fontWeight:800}}>🔥{state.streak}</span></div>
            <div style={{textAlign:"center"}}><span style={{color:"#10b981",fontWeight:700,fontSize:12}}>✅{state.done.length}</span></div>
            <button onClick={()=>{setScreen("skills");setShowMenu(false);}} style={{background:"#1a1a30",border:"1px solid #2a2a40",borderRadius:8,padding:"6px 12px",color:"#8888a8",fontSize:12,cursor:"pointer",fontWeight:600}}>🌳 Skills</button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notif && (
        <div style={{position:"fixed",top:56,left:"50%",transform:"translateX(-50%)",zIndex:100,background:notif.c,color:"#fff",padding:"10px 28px",borderRadius:10,fontWeight:700,fontSize:15,boxShadow:`0 4px 30px ${notif.c}44`,animation:"sDown .3s ease",whiteSpace:"nowrap"}}>
          {notif.msg}
        </div>
      )}

      <Particles particles={particles} />

      {/* ═══ MAP SCREEN ═══ */}
      {screen==="map" && (
        <div ref={mapRef} style={{paddingTop:52,height:"100vh",overflow:"auto"}}>
          <div style={{position:"relative",width:MAP_W,height:MAP_H,margin:"0 auto",background:"linear-gradient(180deg,#060612 0%,#0a1a14 30%,#0c1a0a 60%,#0a0a14 100%)"}}>
            {/* Stars */}
            {STARS.map((s,i)=><div key={`s${i}`} style={{position:"absolute",left:s.x,top:s.y,width:s.d,height:s.d,borderRadius:"50%",background:"#fff",opacity:s.o*0.4,animation:`twinkle ${2+i%3}s ease-in-out infinite`}} />)}
            {/* Terrain */}
            {TREES.map((t,i)=><span key={`t${i}`} style={{position:"absolute",left:t.x,top:t.y,fontSize:t.s,opacity:0.3,filter:"hue-rotate(20deg)",pointerEvents:"none"}}>🌲</span>)}
            {ROCKS.map((r,i)=><span key={`r${i}`} style={{position:"absolute",left:r.x,top:r.y,fontSize:10,opacity:0.2,pointerEvents:"none"}}>🪨</span>)}
            {/* Paths */}
            <svg style={{position:"absolute",inset:0,width:MAP_W,height:MAP_H,pointerEvents:"none"}}>
              {PATHS.map(([a,b],i)=>{
                const la=LOCS[a],lb=LOCS[b];
                const unlocked = state.done.length>=MO[b].u;
                return <line key={i} x1={la.x} y1={la.y} x2={lb.x} y2={lb.y} stroke={unlocked?"#3d5afe44":"#1a1a30"} strokeWidth={unlocked?3:2} strokeDasharray={unlocked?"":"8 4"} />;
              })}
            </svg>
            {/* Location Nodes */}
            {LOCS.map((loc,i)=>{
              const mo = MO[i];
              const unlocked = state.done.length>=mo.u;
              const mq = Q.filter(q=>q.m===i+1);
              const mc = mq.filter(q=>state.done.includes(q.id)).length;
              const complete = mc===mq.length && mq.length>0;
              const isCurrent = (state.pos||0)===i;
              return (
                <div key={i} onClick={()=>{if(unlocked){moveToLoc(i);setTimeout(()=>enterZone(i),700);}}}
                  style={{position:"absolute",left:loc.x-40,top:loc.y-40,width:80,height:80,cursor:unlocked?"pointer":"not-allowed",transition:"transform 0.2s",transform:isCurrent?"scale(1.1)":"scale(1)"}}>
                  {/* Glow */}
                  {unlocked && <div style={{position:"absolute",inset:-8,borderRadius:"50%",background:`radial-gradient(circle,${mo.c}22,transparent)`,animation:isCurrent?"glow 2s ease-in-out infinite":""}} />}
                  {/* Node */}
                  <div style={{position:"relative",width:80,height:80,borderRadius:16,background:unlocked?`linear-gradient(135deg,${mo.c}22,${mo.c}08)`:"#0c0c1a",border:`2px solid ${complete?"#10b981":unlocked?mo.c+"66":"#1a1a30"}`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",opacity:unlocked?1:0.25,boxShadow:isCurrent?`0 0 20px ${mo.c}44`:"none"}}>
                    <span style={{fontSize:28}}>{unlocked?mo.i:"🔒"}</span>
                    <span style={{fontSize:10,fontWeight:700,color:mo.c,marginTop:2}}>{mo.n}</span>
                    {unlocked && <span style={{fontSize:9,color:"#5a5a78"}}>{mc}/{mq.length}</span>}
                  </div>
                  {/* Month number */}
                  <div style={{position:"absolute",top:-8,right:-4,background:complete?"#10b981":mo.c,color:"#fff",width:20,height:20,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800}}>{i+1}</div>
                </div>
              );
            })}
            {/* Player Character */}
            <div style={{position:"absolute",left:charPos.x-16,top:charPos.y-50,transition:"all 0.5s ease",zIndex:20,pointerEvents:"none"}}>
              <div style={{animation:walking?"walk 0.3s steps(2) infinite":"idle 1.5s ease-in-out infinite",display:"flex",flexDirection:"column",alignItems:"center"}}>
                <span style={{fontSize:28,filter:"drop-shadow(0 2px 8px rgba(61,90,254,0.5))"}}>🧙</span>
                <span style={{fontSize:9,color:"#3d5afe",fontWeight:700,marginTop:2,textShadow:"0 0 8px #3d5afe"}}>Mateo</span>
              </div>
            </div>
            {/* Instructions */}
            <div style={{position:"absolute",bottom:20,left:"50%",transform:"translateX(-50%)",background:"rgba(10,10,20,0.8)",border:"1px solid #2a2a40",borderRadius:8,padding:"8px 20px",backdropFilter:"blur(4px)"}}>
              <p style={{color:"#5a5a78",fontSize:12,margin:0,textAlign:"center"}}>
                <span style={{color:"#3d5afe"}}>← →</span> Mover  &nbsp;|&nbsp;  <span style={{color:"#3d5afe"}}>Enter</span> Entrar  &nbsp;|&nbsp;  <span style={{color:"#3d5afe"}}>Click</span> en zona
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ═══ ZONE SCREEN ═══ */}
      {screen==="zone" && selMonth && (
        <ZoneView month={selMonth} state={state}
          onSelectQuest={(q)=>{setSelQuest(q);setScreen("quest");}}
          onBack={()=>setScreen("map")} />
      )}

      {/* ═══ QUEST SCREEN ═══ */}
      {screen==="quest" && selQuest && (
        <QuestDetail quest={selQuest} state={state}
          onComplete={completeQuest}
          onBack={()=>setScreen("zone")} />
      )}

      {/* ═══ SKILLS SCREEN ═══ */}
      {screen==="skills" && (
        <div style={{paddingTop:60,maxWidth:700,margin:"0 auto",padding:"60px 20px 40px"}}>
          <button onClick={()=>setScreen("map")} style={{background:"none",border:"none",color:"#5a5a78",fontSize:13,cursor:"pointer",marginBottom:16}}>← Mapa</button>
          {/* Character Card */}
          <div style={{background:"linear-gradient(135deg,#12121f,#0c0c1a)",border:"1px solid #2a2a40",borderRadius:16,padding:28,textAlign:"center",marginBottom:20}}>
            <span style={{fontSize:56}}>🧙</span>
            <h2 style={{fontSize:24,fontWeight:800,margin:"8px 0 2px",background:"linear-gradient(135deg,#3d5afe,#00e5ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>Mateo</h2>
            <p style={{color:"#f59e0b",fontWeight:700,margin:"0 0 16px"}}>Nivel {lvl[0]} — {lvl[2]}</p>
            <div style={{display:"flex",justifyContent:"center",gap:20,flexWrap:"wrap"}}>
              {[{v:state.xp,l:"XP",c:"#3d5afe"},{v:state.done.length,l:"Misiones",c:"#10b981"},{v:state.streak,l:"Racha",c:"#f59e0b"},{v:state.best,l:"Mejor",c:"#a855f7"},{v:`${Q.filter(q=>q.tp===1&&state.done.includes(q.id)).length}/${Q.filter(q=>q.tp===1).length}`,l:"Bosses",c:"#ef4444"}].map(s=>(
                <div key={s.l}><p style={{color:s.c,fontSize:22,fontWeight:800,margin:0}}>{s.v}</p><p style={{color:"#4a4a68",fontSize:10,margin:0}}>{s.l}</p></div>
              ))}
            </div>
          </div>
          {/* Skill Bars */}
          <h3 style={{color:"#5a5a78",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:10}}>🌳 Habilidades</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8}}>
            {SKI.map((sk,i)=>{
              const xp = state.skills[i]||0;
              const slvl = Math.min(10,Math.floor(xp/200)+1);
              const pct = xp===0?0:Math.min(100,(xp%200)/200*100);
              return (
                <div key={i} style={{background:"#12121f",border:"1px solid #1e1e34",borderRadius:10,padding:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                    <span style={{fontSize:18}}>{sk.i}</span>
                    <div style={{flex:1}}>
                      <div style={{display:"flex",justifyContent:"space-between"}}><span style={{color:"#e0e0f0",fontSize:12,fontWeight:600}}>{sk.n}</span><span style={{color:sk.c,fontSize:11,fontWeight:700}}>Lv{slvl}</span></div>
                    </div>
                  </div>
                  <div style={{background:"#0a0a16",borderRadius:3,height:5,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:sk.c,borderRadius:3,transition:"width 0.5s"}} />
                  </div>
                  <p style={{color:"#3a3a50",fontSize:10,marginTop:3,textAlign:"right"}}>{xp} XP</p>
                </div>
              );
            })}
          </div>
          {/* Progress per month */}
          <h3 style={{color:"#5a5a78",fontSize:12,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",margin:"20px 0 10px"}}>📊 Progreso por Mes</h3>
          <div style={{background:"#12121f",border:"1px solid #1e1e34",borderRadius:10,padding:14}}>
            {MO.map(m=>{
              const mq=Q.filter(q=>q.m===m.id),mc=mq.filter(q=>state.done.includes(q.id)).length;
              const pct=mq.length>0?mc/mq.length*100:0;
              const ul=state.done.length>=m.u;
              return (
                <div key={m.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5,opacity:ul?1:0.2}}>
                  <span style={{fontSize:13,width:22}}>{m.i}</span>
                  <span style={{color:"#6a6a88",fontSize:10,width:16}}>{m.id}</span>
                  <div style={{flex:1,background:"#0a0a16",borderRadius:3,height:7,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#10b981":m.c,borderRadius:3}} />
                  </div>
                  <span style={{color:"#4a4a68",fontSize:10,width:32,textAlign:"right"}}>{mc}/{mq.length}</span>
                </div>
              );
            })}
          </div>
          <button onClick={()=>{if(window.confirm("¿Borrar todo?"))save(defState)}} style={{marginTop:16,padding:"8px 16px",borderRadius:6,border:"1px solid #2a2a40",background:"none",color:"#4a4a68",fontSize:11,cursor:"pointer"}}>🔄 Reset</button>
        </div>
      )}

      <style>{`
        @keyframes sDown{from{transform:translate(-50%,-16px);opacity:0}to{transform:translate(-50%,0);opacity:1}}
        @keyframes glow{0%,100%{opacity:0.6}50%{opacity:1}}
        @keyframes idle{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
        @keyframes walk{0%{transform:translateX(-2px)}50%{transform:translateX(2px)}100%{transform:translateX(-2px)}}
        @keyframes twinkle{0%,100%{opacity:0.2}50%{opacity:0.8}}
        @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        @keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes float1{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-16px) rotate(6deg)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-9px)}}
        @keyframes resultIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        @keyframes barFill{from{width:0}}
        @keyframes pulse{0%,100%{opacity:0.7}50%{opacity:1}}
        @keyframes bossFlash{0%{opacity:1}100%{opacity:0}}
        @keyframes bossEntry{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}
        @keyframes bossHover{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.08)}}
        @keyframes phaseActive{0%,100%{box-shadow:0 0 12px var(--pc,#3d5afe22)}50%{box-shadow:0 0 24px var(--pc,#3d5afe44)}}
        @keyframes phaseLine{0%,100%{opacity:0.6;width:40%}50%{opacity:1;width:100%}}
        @keyframes questIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideDown{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes iconBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes completeBounce{0%{transform:scale(0.8);opacity:0}70%{transform:scale(1.05)}100%{transform:scale(1);opacity:1}}
        @keyframes btnPulse{0%,100%{box-shadow:0 6px 24px rgba(61,90,254,0.3)}50%{box-shadow:0 8px 32px rgba(61,90,254,0.55)}}
        *{box-sizing:border-box;margin:0}
        body{margin:0;overflow-x:hidden}
        button:active{transform:scale(0.97)!important;transition:transform 0.1s!important}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:#0a0a14}
        ::-webkit-scrollbar-thumb{background:#2a2a40;border-radius:3px}
      `}</style>
    </div>
  );
}
