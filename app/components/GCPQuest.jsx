"use client";

// Polyfill window.storage -> localStorage
if (typeof window !== "undefined" && !window.storage) {
  window.storage = {
    get: async (key) => {
      const v = localStorage.getItem(key);
      return v ? { value: v } : null;
    },
    set: async (key, value) => {
      localStorage.setItem(key, value);
    },
  };
}

import { useState, useEffect, useCallback, useRef } from "react";

// ═══════════════════════════════════════════════════════
// DATA: Skills, Levels, Months, Quests
// ═══════════════════════════════════════════════════════
const SKILLS = {
  data_engineering: { name: "Data Engineering", icon: "🔧", color: "#3b82f6", desc: "Ingesta, ETL, calidad" },
  data_science: { name: "Data Science", icon: "📊", color: "#a855f7", desc: "EDA, features, modelos" },
  ml_mlops: { name: "ML / MLOps", icon: "🤖", color: "#ec4899", desc: "Vertex AI, pipelines" },
  rag_llm: { name: "RAG / LLM", icon: "🧠", color: "#f59e0b", desc: "Embeddings, agentes" },
  gcp_cloud: { name: "GCP Cloud", icon: "☁️", color: "#06b6d4", desc: "IAM, infra, Cloud Run" },
  finops_security: { name: "FinOps + Security", icon: "🔒", color: "#10b981", desc: "Costos, OWASP" },
  leadership: { name: "Liderazgo", icon: "🎯", color: "#f97316", desc: "Blog, talks, producto" },
};

const LEVELS = [
  { level: 1, xp: 0, title: "Novato" }, { level: 2, xp: 500, title: "Aprendiz" },
  { level: 3, xp: 1500, title: "Practicante" }, { level: 4, xp: 3500, title: "Artesano" },
  { level: 5, xp: 7000, title: "Junior" }, { level: 6, xp: 12000, title: "Profesional" },
  { level: 7, xp: 20000, title: "Especialista" }, { level: 8, xp: 32000, title: "Senior" },
  { level: 9, xp: 50000, title: "Experto" }, { level: 10, xp: 75000, title: "Maestro" },
];

const MONTHS = [
  { id: 1, name: "Fundaciones", desc: "Python + SQL + GCP + DevOps", icon: "⚒️", unlockReq: 0, color: "#3b82f6" },
  { id: 2, name: "Streaming + DS", desc: "Pub/Sub, Dataflow, EDA", icon: "🌊", unlockReq: 12, color: "#06b6d4" },
  { id: 3, name: "DS Profundo", desc: "Modelos, evaluación, storytelling", icon: "📊", unlockReq: 22, color: "#a855f7" },
  { id: 4, name: "ML en Vertex", desc: "Training, Registry, Endpoints", icon: "🤖", unlockReq: 30, color: "#ec4899" },
  { id: 5, name: "MLOps", desc: "Pipelines, monitoring, CI/CD", icon: "⚙️", unlockReq: 38, color: "#8b5cf6" },
  { id: 6, name: "RAG Básico", desc: "Embeddings, Vector DB, RAG E2E", icon: "🧠", unlockReq: 45, color: "#f59e0b" },
  { id: 7, name: "RAG Avanzado", desc: "Evaluación, agentes, producción", icon: "🔮", unlockReq: 52, color: "#d946ef" },
  { id: 8, name: "SaaS MVP", desc: "Auth, API, DB, Frontend", icon: "🚀", unlockReq: 59, color: "#f97316" },
  { id: 9, name: "SaaS Beta", desc: "Multi-tenant, usuarios reales", icon: "👥", unlockReq: 66, color: "#14b8a6" },
  { id: 10, name: "Escala + Seguridad", desc: "Load test, FinOps, compliance", icon: "🔒", unlockReq: 73, color: "#10b981" },
  { id: 11, name: "Contenido", desc: "Blog, video, portafolio", icon: "✍️", unlockReq: 80, color: "#6366f1" },
  { id: 12, name: "Lanzamiento", desc: "Clientes, métricas, maestría", icon: "👑", unlockReq: 87, color: "#eab308" },
];

const Q = [
  // MONTH 1
  {id:"m01d01",t:"Setup del campo de batalla",d:"Crea repo GitHub, Python 3.11+, virtualenv, primer commit hello_world.py",x:75,s:"gcp_cloud",tp:"daily",dur:25,m:1,w:1,a:"Repo en GitHub con hello_world.py"},
  {id:"m01d02",t:"GCP Console: reconocimiento",d:"Crea proyecto gcp-quest-lab, activa BigQuery y Storage APIs, free tier",x:60,s:"gcp_cloud",tp:"daily",dur:20,m:1,w:1,a:"Proyecto GCP con APIs habilitadas"},
  {id:"m01d03",t:"Python: funciones que muerden",d:"utils.py: normalize_phone(), parse_csv_row(), validate_email(). Type hints + docstrings",x:80,s:"data_engineering",tp:"daily",dur:30,m:1,w:1,a:"3 funciones con type hints y edge cases"},
  {id:"m01d04",t:"SQL: 7 consultas mortales",d:"7 queries progresivas en BigQuery: SELECT→WHERE→GROUP BY→JOIN→subquery→window→CTE",x:90,s:"data_science",tp:"daily",dur:30,m:1,w:1,a:"7 queries SQL comentadas sin errores"},
  {id:"m01d05",t:"Tests: tu primer escudo",d:"pytest para utils.py. 2 tests/función mínimo: happy path + edge case",x:70,s:"data_engineering",tp:"daily",dur:25,m:1,w:2,a:"6+ tests pasando en verde"},
  {id:"m01d06",t:"Cloud Storage: primer bucket",d:"Crea bucket gsutil, sube CSV, descarga, verifica md5",x:65,s:"gcp_cloud",tp:"daily",dur:20,m:1,w:2,a:"Bucket con archivo, md5 ok"},
  {id:"m01d07",t:"BigQuery desde Python",d:"bq_loader.py: crea tabla, carga CSV, query, muestra resultados. google-cloud-bigquery",x:90,s:"data_engineering",tp:"daily",dur:30,m:1,w:2,a:"Script funcional con datos en BigQuery"},
  {id:"m01d08",t:"IAM: service account segura",d:"SA con bigquery.dataEditor + jobUser. Key JSON en .gitignore. Úsala en bq_loader",x:75,s:"finops_security",tp:"daily",dur:25,m:1,w:2,a:"SA con 2 roles, key en .gitignore"},
  {id:"m01d09",t:"Docker: containeriza tu ETL",d:"Dockerfile multi-stage. docker build + run produce mismo output que sin Docker",x:85,s:"gcp_cloud",tp:"daily",dur:30,m:1,w:3,a:"Docker build+run produce output correcto"},
  {id:"m01d10",t:"Cloud Run: primer servicio",d:"FastAPI POST /process → recibe contactos, devuelve limpios. Deploy Cloud Run",x:95,s:"gcp_cloud",tp:"daily",dur:30,m:1,w:3,a:"Servicio en Cloud Run, curl funciona"},
  {id:"m01d11",t:"CI: GitHub Actions",d:"ci.yml: push→pytest→ruff check. Badge en README",x:80,s:"gcp_cloud",tp:"daily",dur:25,m:1,w:3,a:"CI verde con badge en README"},
  {id:"m01d12",t:"Terraform: infra como código",d:"main.tf: 1 bucket + 1 dataset BQ + 1 SA. terraform plan ok",x:85,s:"gcp_cloud",tp:"daily",dur:30,m:1,w:4,a:"terraform plan muestra 3 recursos"},
  {id:"m01d13",t:"Data quality checks",d:"data_quality.py: duplicados, nulos, montos absurdos. Reporte JSON + tests",x:85,s:"data_engineering",tp:"daily",dur:30,m:1,w:4,a:"4 checks con tests pasando"},
  {id:"m01d14",t:"OWASP para tu API",d:"Identifica 3 riesgos OWASP en tu API Cloud Run + 1 mitigación cada uno",x:70,s:"finops_security",tp:"daily",dur:25,m:1,w:4,a:"3 riesgos con mitigaciones concretas"},
  {id:"m01m01",t:"Leer: IAM en GCP",d:"Lee overview IAM. 3 bullets: role, SA, least privilege",x:25,s:"finops_security",tp:"mini",dur:5,m:1,w:1,a:"3 bullets escritos"},
  {id:"m01m02",t:"Revisar costos GCP",d:"Billing > Reports. Verifica gasto = $0",x:15,s:"finops_security",tp:"mini",dur:3,m:1,w:3,a:"Gasto verificado"},
  {id:"m01b01",t:"BOSS: Pipeline CSV→JSON",d:"Lee CSV 100 filas, limpia con utils, valida, escribe output.json + errors.json + resumen",x:300,s:"data_engineering",tp:"boss",dur:90,m:1,w:2,a:"Pipeline genera output.json, errors.json, resumen"},
  {id:"m01b02",t:"BOSS FINAL: Proyecto DE",d:"ETL: CSV→validación→Storage→BQ→reporte. Docker, CI, Terraform, 10+ tests, README pro",x:500,s:"data_engineering",tp:"boss",dur:120,m:1,w:4,a:"Proyecto completo, CI verde, README permite clonar y correr"},

  // MONTH 2
  {id:"m02d01",t:"Pub/Sub: topic + subscription",d:"Topic raw-contacts, sub contacts-processor. Publisher 10 msgs, subscriber consume",x:80,s:"data_engineering",tp:"daily",dur:30,m:2,w:1,a:"10 mensajes enviados y recibidos"},
  {id:"m02d02",t:"Pub/Sub → BigQuery streaming",d:"Subscriber inserta en BQ con streaming inserts + error handling",x:90,s:"data_engineering",tp:"daily",dur:30,m:2,w:1,a:"50 mensajes aparecen en BigQuery"},
  {id:"m02d03",t:"Apache Beam: primer pipeline",d:"CSV Storage→filtrar monto>10k→normalizar teléfonos→BigQuery. DirectRunner",x:95,s:"data_engineering",tp:"daily",dur:30,m:2,w:1,a:"Pipeline DirectRunner sin errores"},
  {id:"m02d04",t:"Dataflow en la nube",d:"Corre Beam con DataflowRunner. Monitorea en Console. Documenta costos",x:85,s:"data_engineering",tp:"daily",dur:25,m:2,w:1,a:"Job completado con doc de costos"},
  {id:"m02d05",t:"EDA: primer notebook",d:"Jupyter: hipótesis (3 preguntas), carga, df.info(), describe(), isnull()",x:75,s:"data_science",tp:"daily",dur:30,m:2,w:2,a:"Notebook con 3 secciones ejecutable"},
  {id:"m02d06",t:"Visualizaciones con historia",d:"4 gráficos: histograma, heatmap, serie temporal, bar chart. Con interpretación",x:80,s:"data_science",tp:"daily",dur:30,m:2,w:2,a:"4 visualizaciones con labels e interpretación"},
  {id:"m02d07",t:"Feature Engineering: 5 vars",d:"Binning, one-hot, temporal, ratio, flag binario. Documenta razonamiento",x:85,s:"data_science",tp:"daily",dur:30,m:2,w:3,a:"5 features con explicación"},
  {id:"m02d08",t:"Métricas ML explicadas",d:"Accuracy, precision, recall, F1, AUC-ROC, MAE/RMSE con ejemplos numéricos",x:75,s:"data_science",tp:"daily",dur:25,m:2,w:3,a:"6 métricas con ejemplos"},
  {id:"m02d09",t:"Data leakage demo",d:"Notebook: con leak (accuracy falsa) vs sin leak (accuracy real). Explica",x:90,s:"data_science",tp:"daily",dur:30,m:2,w:3,a:"2 escenarios con diferencia clara"},
  {id:"m02d10",t:"Dataform: SQL transforms",d:"3 Dataform models: staging→intermediate→mart. Con tests de calidad",x:85,s:"data_engineering",tp:"daily",dur:30,m:2,w:4,a:"3 models con tests corriendo"},
  {id:"m02d11",t:"Observabilidad: logs + alertas",d:"Cloud Logging + Monitoring. 1 métrica custom + 1 alerta para pipeline",x:80,s:"gcp_cloud",tp:"daily",dur:25,m:2,w:4,a:"Alerta funcional"},
  {id:"m02m01",t:"Prompt Dojo: EDA",d:"3 versiones de prompt para EDA: genérico→contexto→formato. Evalúa",x:25,s:"rag_llm",tp:"mini",dur:10,m:2,w:2,a:"3 prompts con evaluación"},
  {id:"m02b01",t:"BOSS: Streaming E2E",d:"Pub/Sub→Dataflow→BQ. 100 msgs en <5min. Diagrama arquitectura",x:450,s:"data_engineering",tp:"boss",dur:120,m:2,w:2,a:"Pipeline streaming E2E con diagrama"},
  {id:"m02b02",t:"BOSS: Reporte DS",d:"Notebook: hipótesis→EDA→features→baseline→evaluación→conclusiones. Reproducible",x:500,s:"data_science",tp:"boss",dur:120,m:2,w:4,a:"Notebook completo, 6 secciones, sin leakage"},

  // MONTH 3
  {id:"m03d01",t:"XGBoost vs LightGBM vs RF",d:"3 modelos tree-based, cross-validation, tabla comparativa de métricas",x:90,s:"data_science",tp:"daily",dur:30,m:3,w:1,a:"3 modelos comparados con CV"},
  {id:"m03d02",t:"Hyperparameter tuning",d:"GridSearchCV + Optuna. Compara. Grafica importancia de HPs",x:85,s:"data_science",tp:"daily",dur:30,m:3,w:1,a:"Tuning con mejora documentada"},
  {id:"m03d03",t:"Confusion Matrix profunda",d:"CM, classification report, curva ROC, curva PR. ¿Qué errores cuestan más?",x:80,s:"data_science",tp:"daily",dur:25,m:3,w:1,a:"4 visualizaciones con análisis de costos"},
  {id:"m03d04",t:"Calibración de probabilidades",d:"Reliability diagram + CalibratedClassifierCV. Antes vs después",x:85,s:"data_science",tp:"daily",dur:30,m:3,w:2,a:"Calibración con comparación antes/después"},
  {id:"m03d05",t:"Storytelling para ejecutivos",d:"Resumen ejecutivo: 1 contexto, 3 hallazgos simples, 2 recomendaciones",x:75,s:"leadership",tp:"daily",dur:25,m:3,w:2,a:"Resumen que un gerente entiende"},
  {id:"m03d06",t:"Dashboard Looker Studio",d:"BigQuery→Looker. 4 gráficos: KPI, tendencia, distribución, top 10",x:80,s:"data_science",tp:"daily",dur:30,m:3,w:3,a:"Dashboard accesible por URL"},
  {id:"m03d07",t:"Feature Store conceptual",d:"Diseña feature store: catálogo, versionado, serving. ADR",x:70,s:"data_engineering",tp:"daily",dur:25,m:3,w:3,a:"ADR con diseño y decisiones"},
  {id:"m03d08",t:"Data versioning con DVC",d:"DVC setup, 2 versiones de datos, rollback funcional",x:80,s:"data_engineering",tp:"daily",dur:30,m:3,w:4,a:"DVC con 2 versiones y rollback"},
  {id:"m03m01",t:"Prompt Dojo: arquitectura",d:"3 prompts para diseñar sistema con IA. Evalúa",x:25,s:"rag_llm",tp:"mini",dur:10,m:3,w:2,a:"3 prompts evaluados"},
  {id:"m03b01",t:"BOSS: Modelo production-ready",d:"Modelo tuneado + evaluación rigurosa + calibración. Reporte 3 páginas",x:400,s:"data_science",tp:"boss",dur:120,m:3,w:2,a:"Reporte con métricas, CM, feature importance"},
  {id:"m03b02",t:"BOSS: Proyecto DS portafolio",d:"Notebook + dashboard + DVC + README. Release v0.2.0",x:500,s:"data_science",tp:"boss",dur:120,m:3,w:4,a:"Proyecto DS completo para portafolio"},

  // MONTH 4
  {id:"m04d01",t:"Vertex Workbench setup",d:"Notebook en Vertex AI Workbench con dataset conectado",x:70,s:"ml_mlops",tp:"daily",dur:25,m:4,w:1,a:"Notebook corriendo en Vertex"},
  {id:"m04d02",t:"Vertex Experiments: tracking",d:"3 runs con diferentes HPs. Compara en UI",x:85,s:"ml_mlops",tp:"daily",dur:30,m:4,w:1,a:"3 runs visibles en Vertex"},
  {id:"m04d03",t:"Vertex Datasets",d:"Managed Dataset tabular. Train/val/test split configurado",x:75,s:"ml_mlops",tp:"daily",dur:25,m:4,w:1,a:"Dataset con splits en Vertex"},
  {id:"m04d04",t:"Custom Training Job",d:"Containeriza training, lanza en Vertex, loguea métricas",x:95,s:"ml_mlops",tp:"daily",dur:30,m:4,w:2,a:"Training job completado"},
  {id:"m04d05",t:"HP Tuning en Vertex",d:"Job de HP tuning con 3 parámetros. Analiza vs tuning local",x:85,s:"ml_mlops",tp:"daily",dur:30,m:4,w:2,a:"HP tuning completado"},
  {id:"m04d06",t:"Model Registry",d:"Registra modelo con metadata, métricas, labels staging/prod",x:80,s:"ml_mlops",tp:"daily",dur:25,m:4,w:3,a:"Modelo registrado y versionado"},
  {id:"m04d07",t:"Endpoint: online prediction",d:"Deploy a endpoint. curl prediction. Traffic split",x:90,s:"ml_mlops",tp:"daily",dur:30,m:4,w:3,a:"Endpoint respondiendo predicciones"},
  {id:"m04d08",t:"Batch Prediction",d:"Batch job: 1000 registros → resultados en BigQuery",x:80,s:"ml_mlops",tp:"daily",dur:25,m:4,w:4,a:"Resultados batch en BigQuery"},
  {id:"m04m01",t:"Costos Vertex AI",d:"Calcula costo training job + endpoint mensual",x:20,s:"finops_security",tp:"mini",dur:5,m:4,w:3,a:"Cálculo documentado"},
  {id:"m04b01",t:"BOSS: ML Endpoint prod",d:"Data→training→registry→deploy→predict. Tests + CI + docs",x:500,s:"ml_mlops",tp:"boss",dur:120,m:4,w:4,a:"Pipeline ML en producción documentado"},

  // MONTH 5
  {id:"m05d01",t:"Vertex Pipelines: Kubeflow",d:"Pipeline 3 componentes: preprocess→train→evaluate en Vertex",x:95,s:"ml_mlops",tp:"daily",dur:30,m:5,w:1,a:"Pipeline ejecutado con 3 componentes"},
  {id:"m05d02",t:"Pipeline parametrizable",d:"Parámetros: dataset_uri, model_name, hp_config. 2 runs diferentes",x:85,s:"ml_mlops",tp:"daily",dur:30,m:5,w:1,a:"Pipeline corre con diferentes params"},
  {id:"m05d03",t:"Pipeline inferencia",d:"load→batch_predict→save→notify. Trigger scheduler",x:90,s:"ml_mlops",tp:"daily",dur:30,m:5,w:2,a:"Pipeline inferencia con scheduler"},
  {id:"m05d04",t:"Model Monitoring: drift",d:"Monitoring en Vertex. Thresholds drift. Simula drift",x:85,s:"ml_mlops",tp:"daily",dur:30,m:5,w:2,a:"Monitoring detecta drift simulado"},
  {id:"m05d05",t:"CI/CD para ML",d:"GH Action: tests→valida→compara métricas→deploy si mejora",x:90,s:"ml_mlops",tp:"daily",dur:30,m:5,w:3,a:"CI/CD bloquea deploy si métricas bajan"},
  {id:"m05d06",t:"A/B Testing modelos",d:"2 versiones 50/50 traffic split. Compara métricas prod",x:80,s:"ml_mlops",tp:"daily",dur:25,m:5,w:3,a:"A/B test con métricas comparadas"},
  {id:"m05d07",t:"Rollback automático",d:"Si métricas bajan >10%, revertir. Simula degradación",x:85,s:"ml_mlops",tp:"daily",dur:30,m:5,w:4,a:"Rollback funciona en simulación"},
  {id:"m05m01",t:"ADR: deployment strategy",d:"Compara blue/green vs canary vs shadow",x:25,s:"leadership",tp:"mini",dur:10,m:5,w:2,a:"ADR con comparación"},
  {id:"m05b01",t:"BOSS: MLOps completo",d:"Pipeline training + inferencia + monitoring + CI/CD + rollback. v0.3.0",x:500,s:"ml_mlops",tp:"boss",dur:120,m:5,w:4,a:"Sistema MLOps completo y documentado"},

  // MONTH 6
  {id:"m06d01",t:"Embeddings: similitud coseno",d:"sentence-transformers: genera embeddings, compara 10 pares de textos",x:80,s:"rag_llm",tp:"daily",dur:30,m:6,w:1,a:"Script calcula similitud correctamente"},
  {id:"m06d02",t:"Embeddings Vertex AI",d:"textembedding-gecko. Compara calidad vs sentence-transformers",x:85,s:"rag_llm",tp:"daily",dur:30,m:6,w:1,a:"Comparación documentada"},
  {id:"m06d03",t:"ChromaDB: vector DB",d:"Collection con 50 docs. Queries de similitud",x:85,s:"rag_llm",tp:"daily",dur:30,m:6,w:2,a:"50 docs, queries relevantes"},
  {id:"m06d04",t:"Chunking: 3 estrategias",d:"Fixed-size, recursive, semantic. Benchmark retrieval",x:90,s:"rag_llm",tp:"daily",dur:30,m:6,w:2,a:"3 estrategias con benchmark"},
  {id:"m06d05",t:"Ingesta de documentos",d:"Pipeline: PDF/MD→texto→chunk→embed→vector DB",x:85,s:"rag_llm",tp:"daily",dur:30,m:6,w:3,a:"10+ docs procesados"},
  {id:"m06d06",t:"RAG: retrieve + generate",d:"Pregunta→vector DB→context→LLM→respuesta. Con Vertex AI",x:95,s:"rag_llm",tp:"daily",dur:30,m:6,w:3,a:"RAG responde preguntas correctamente"},
  {id:"m06d07",t:"Vertex Vector Search",d:"Migra a Vertex Vector Search. Benchmark vs ChromaDB",x:80,s:"rag_llm",tp:"daily",dur:30,m:6,w:4,a:"Vector Search con benchmark"},
  {id:"m06m01",t:"RAG vs fine-tuning",d:"3 criterios de cuándo usar cada uno",x:20,s:"rag_llm",tp:"mini",dur:10,m:6,w:1,a:"3 criterios documentados"},
  {id:"m06b01",t:"BOSS: RAG App funcional",d:"Ingesta→chunk→embed→retrieve→generate. API + UI mínima",x:500,s:"rag_llm",tp:"boss",dur:120,m:6,w:4,a:"RAG funcional con API y docs"},

  // MONTH 7
  {id:"m07d01",t:"Eval: faithfulness",d:"¿Respuesta basada en contexto? Evalúa 20 queries",x:90,s:"rag_llm",tp:"daily",dur:30,m:7,w:1,a:"Métrica sobre 20 queries"},
  {id:"m07d02",t:"Eval: relevance",d:"Answer relevance + context relevance. Ground truth 20 preguntas",x:85,s:"rag_llm",tp:"daily",dur:30,m:7,w:1,a:"2 métricas con scores"},
  {id:"m07d03",t:"Re-ranking",d:"Cross-encoder re-ranking. Benchmark antes/después",x:85,s:"rag_llm",tp:"daily",dur:30,m:7,w:2,a:"Re-ranking mejora precisión"},
  {id:"m07d04",t:"Hybrid Search",d:"Semántica + BM25. Compara vs solo semántica",x:80,s:"rag_llm",tp:"daily",dur:30,m:7,w:2,a:"Hybrid search con benchmark"},
  {id:"m07d05",t:"Agentes: tool use",d:"Agente con 3 herramientas: RAG + BQ + cálculos",x:95,s:"rag_llm",tp:"daily",dur:30,m:7,w:3,a:"Agente usa 3 tools"},
  {id:"m07d06",t:"Semantic caching",d:"Cache queries similares. Reduce costos LLM",x:80,s:"rag_llm",tp:"daily",dur:25,m:7,w:3,a:"Cache reduce llamadas"},
  {id:"m07d07",t:"Observabilidad RAG",d:"Tracing: latencia/paso, tokens, cache hit rate",x:75,s:"rag_llm",tp:"daily",dur:25,m:7,w:4,a:"Dashboard de métricas RAG"},
  {id:"m07b01",t:"BOSS: RAG + eval metrics",d:"RAG con evaluación, re-ranking, caching, observabilidad. v0.4.0",x:500,s:"rag_llm",tp:"boss",dur:120,m:7,w:4,a:"RAG production-ready con eval"},

  // MONTH 8
  {id:"m08d01",t:"Define tu SaaS",d:"Problema, usuario, propuesta valor, competidores. ADR arquitectura",x:80,s:"leadership",tp:"daily",dur:30,m:8,w:1,a:"Doc 5 secciones + ADR"},
  {id:"m08d02",t:"Diseño de sistema",d:"Diagrama: front, back, DB, ML/RAG. Servicios GCP justificados",x:85,s:"gcp_cloud",tp:"daily",dur:30,m:8,w:1,a:"Diagrama con justificación"},
  {id:"m08d03",t:"Auth: OAuth + multi-tenant",d:"NextAuth Google OAuth. org_id por usuario. Datos aislados",x:90,s:"gcp_cloud",tp:"daily",dur:30,m:8,w:2,a:"Login + orgs + aislamiento"},
  {id:"m08d04",t:"Backend MVP: 3 endpoints",d:"API con 3 endpoints core. Pydantic, error handling, logging",x:90,s:"gcp_cloud",tp:"daily",dur:30,m:8,w:2,a:"3 endpoints con Swagger"},
  {id:"m08d05",t:"Database: Firestore/CloudSQL",d:"Schema, CRUD básico, modelo de datos documentado",x:85,s:"data_engineering",tp:"daily",dur:30,m:8,w:3,a:"CRUD funcional documentado"},
  {id:"m08d06",t:"Frontend: landing + dashboard",d:"Next.js landing + dashboard mínimo. Auth integrado",x:90,s:"leadership",tp:"daily",dur:30,m:8,w:3,a:"Landing y dashboard en Vercel"},
  {id:"m08d07",t:"Integra ML/RAG en SaaS",d:"Feature AI visible para el usuario en el producto",x:95,s:"ml_mlops",tp:"daily",dur:30,m:8,w:4,a:"Feature AI funcional"},
  {id:"m08m01",t:"Pricing: 3 competidores",d:"Analiza estructura de precios de 3 similares",x:20,s:"leadership",tp:"mini",dur:10,m:8,w:1,a:"Tabla comparativa"},
  {id:"m08b01",t:"BOSS: MVP deployeado",d:"Auth + API + DB + frontend + feature AI. URL accesible",x:500,s:"gcp_cloud",tp:"boss",dur:120,m:8,w:4,a:"MVP funcional accesible"},

  // MONTH 9
  {id:"m09d01",t:"Multi-tenant: aislamiento",d:"Row-level security / filtros org_id. Test aislamiento",x:85,s:"finops_security",tp:"daily",dur:30,m:9,w:1,a:"Test org A no ve datos org B"},
  {id:"m09d02",t:"Rate limiting + quotas",d:"Rate limit por tenant. Quotas por plan. 429 en exceso",x:80,s:"finops_security",tp:"daily",dur:25,m:9,w:1,a:"Rate limiter + quota funcional"},
  {id:"m09d03",t:"Audit log",d:"Loguea acciones: quién, qué, cuándo → BigQuery",x:75,s:"finops_security",tp:"daily",dur:25,m:9,w:2,a:"Audit log consultable en BQ"},
  {id:"m09d04",t:"Onboarding flow",d:"Registro→setup org→tutorial→primera acción. <10 min",x:80,s:"leadership",tp:"daily",dur:30,m:9,w:2,a:"Onboarding completable en <10 min"},
  {id:"m09d05",t:"Modelo de pricing",d:"2-3 planes. Unit economics: costo/tenant, margen, breakeven",x:75,s:"finops_security",tp:"daily",dur:25,m:9,w:3,a:"Planes con punto de equilibrio"},
  {id:"m09d06",t:"Feedback loop in-app",d:"Formulario + storage + dashboard feedback",x:70,s:"leadership",tp:"daily",dur:25,m:9,w:3,a:"Feedback funcional"},
  {id:"m09d07",t:"3-5 beta users",d:"Invita usuarios reales. Observa. Documenta feedback",x:90,s:"leadership",tp:"daily",dur:30,m:9,w:4,a:"3+ usuarios con feedback"},
  {id:"m09b01",t:"BOSS: Beta con usuarios",d:"Multi-tenant, rate limits, audit, onboarding, 3+ users",x:500,s:"leadership",tp:"boss",dur:120,m:9,w:4,a:"Beta con usuarios reales"},

  // MONTH 10
  {id:"m10d01",t:"Load test con k6",d:"100 usuarios concurrentes, 5min. Identifica cuellos de botella",x:85,s:"gcp_cloud",tp:"daily",dur:30,m:10,w:1,a:"Load test con reporte de latencia"},
  {id:"m10d02",t:"Cloud Run autoscaling",d:"Tuning concurrency, min/max instances. Before/after",x:80,s:"gcp_cloud",tp:"daily",dur:25,m:10,w:1,a:"Mejora documentada"},
  {id:"m10d03",t:"Caching: Memorystore Redis",d:"Redis para queries frecuentes. Hit rate + latencia",x:85,s:"gcp_cloud",tp:"daily",dur:30,m:10,w:2,a:"Cache con métricas"},
  {id:"m10d04",t:"FinOps: dashboard costos",d:"Looker: costos/servicio, /tenant, tendencia. Budget alert",x:80,s:"finops_security",tp:"daily",dur:30,m:10,w:2,a:"Dashboard + alert"},
  {id:"m10d05",t:"Secret Manager",d:"Migra secretos de .env. Rota 1 secret",x:75,s:"finops_security",tp:"daily",dur:25,m:10,w:3,a:"App sin .env, secretos en SM"},
  {id:"m10d06",t:"VPC + Cloud Armor",d:"VPC backend. Cloud Armor: rate limit, geo-block",x:80,s:"finops_security",tp:"daily",dur:30,m:10,w:3,a:"VPC + Armor configurados"},
  {id:"m10d07",t:"Privacidad Chile",d:"PII, bases legales, consentimiento. DELETE /me funcional",x:85,s:"finops_security",tp:"daily",dur:30,m:10,w:4,a:"DELETE /me + doc compliance"},
  {id:"m10b01",t:"BOSS: Escala y seguridad",d:"Load test ok, cache, Secret Manager, VPC, Armor, privacidad",x:500,s:"finops_security",tp:"boss",dur:120,m:10,w:4,a:"Security checklist 100% completo"},

  // MONTH 11
  {id:"m11d01",t:"Blog: Data Engineering GCP",d:"Post técnico con diagrama, código, lecciones. Publica",x:80,s:"leadership",tp:"daily",dur:30,m:11,w:1,a:"Post publicado 500+ palabras"},
  {id:"m11d02",t:"Blog: ML en producción",d:"Post sobre ML prod con Vertex. Errores y soluciones",x:80,s:"leadership",tp:"daily",dur:30,m:11,w:1,a:"Post con lecciones reales"},
  {id:"m11d03",t:"Video técnico",d:"5-10 min explicando proyecto RAG con demo. YouTube/Loom",x:85,s:"leadership",tp:"daily",dur:30,m:11,w:2,a:"Video publicado con demo"},
  {id:"m11d04",t:"Talk 10 minutos",d:"Presentación técnica. Practica 2x. Graba final",x:75,s:"leadership",tp:"daily",dur:30,m:11,w:2,a:"Talk grabada de 10 min"},
  {id:"m11d05",t:"GitHub profile profesional",d:"README perfil, badges, 5 proyectos pinneados con README",x:70,s:"leadership",tp:"daily",dur:25,m:11,w:3,a:"Perfil con 5 repos pinneados"},
  {id:"m11d06",t:"Open source contribution",d:"PR o issue en proyecto externo relacionado",x:90,s:"leadership",tp:"daily",dur:30,m:11,w:3,a:"PR/issue en proyecto externo"},
  {id:"m11d07",t:"LinkedIn técnico",d:"Actualiza LinkedIn + 1 post técnico publicado",x:60,s:"leadership",tp:"daily",dur:20,m:11,w:4,a:"LinkedIn + post publicado"},
  {id:"m11b01",t:"BOSS: Portafolio completo",d:"5 proyectos, 2 blogs, 1 video, GitHub + LinkedIn pro",x:500,s:"leadership",tp:"boss",dur:120,m:11,w:4,a:"Todo contenido público"},

  // MONTH 12
  {id:"m12d01",t:"Landing page profesional",d:"Hero, features, pricing, testimonials, CTA. Con dominio",x:85,s:"leadership",tp:"daily",dur:30,m:12,w:1,a:"Landing deployada con secciones"},
  {id:"m12d02",t:"Pricing page",d:"2-3 planes, feature comparison, FAQ",x:80,s:"leadership",tp:"daily",dur:30,m:12,w:1,a:"Pricing page funcional"},
  {id:"m12d03",t:"Outreach: 10 prospects",d:"10 empresas target, email personalizado, enviar",x:75,s:"leadership",tp:"daily",dur:30,m:12,w:2,a:"10 emails enviados"},
  {id:"m12d04",t:"Demo flow",d:"Demo 15 min + cuenta demo. Practica 3x",x:80,s:"leadership",tp:"daily",dur:30,m:12,w:2,a:"Demo con cuenta funcional"},
  {id:"m12d05",t:"Analytics de producto",d:"Tracking: views, usage, funnel registro→retención",x:80,s:"data_science",tp:"daily",dur:30,m:12,w:3,a:"Dashboard métricas producto"},
  {id:"m12d06",t:"Primeros 3 clientes",d:"3 usuarios/empresas pagos o pilots comprometidos",x:95,s:"leadership",tp:"daily",dur:30,m:12,w:3,a:"3 usuarios activos"},
  {id:"m12d07",t:"Retrospectiva del año",d:"Qué aprendí, qué cambiaría, métricas, plan año 2. Publica",x:70,s:"leadership",tp:"daily",dur:30,m:12,w:4,a:"Retro publicada"},
  {id:"m12b01",t:"BOSS FINAL: Maestro",d:"SaaS con clientes + portafolio 5 proyectos + contenido público + nivel 10",x:750,s:"leadership",tp:"boss",dur:180,m:12,w:4,a:"SaaS producción, portafolio, contenido, métricas"},
];

// ═══════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════
const getLevel = (xp) => { for (let i = LEVELS.length - 1; i >= 0; i--) if (xp >= LEVELS[i].xp) return LEVELS[i]; return LEVELS[0]; };
const getProgress = (xp) => { const c = getLevel(xp); const i = LEVELS.findIndex(l => l.level === c.level); if (i >= LEVELS.length - 1) return 100; const n = LEVELS[i + 1]; return ((xp - c.xp) / (n.xp - c.xp)) * 100; };
const getNextLevel = (xp) => { const c = getLevel(xp); const i = LEVELS.findIndex(l => l.level === c.level); return LEVELS[Math.min(i + 1, LEVELS.length - 1)]; };
const getStreakBonus = (s) => Math.min(50, s * 10);
const questsForMonth = (m) => Q.filter(q => q.m === m);
const defaultState = { xp: 0, skills: Object.fromEntries(Object.keys(SKILLS).map(k => [k, 0])), completed: [], streak: 0, longestStreak: 0, lastDate: null };

// ═══════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════

function AIVerifier({ quest, onVerified, onClose }) {
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);

  const verify = async () => {
    if (!code.trim()) return;
    setVerifying(true); setResult(null);
    
    // Skip AI verification - use manual verification instead
    setResult({ 
      passed: false, 
      score: 0, 
      feedback: "Verificación IA deshabilitada. Por favor usa verificación manual.", 
      tip: "Haz clic en '✓ Manual' para completar esta misión." 
    });
    setVerifying(false);
  };

  const markManual = () => { setResult({ passed: true, score: 7, feedback: "Marcada manualmente como completada.", tip: "Usa la verificación IA la próxima vez para feedback más detallado." }); };

  return (
    <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:50,padding:16,backdropFilter:"blur(4px)" }}>
      <div style={{ background:"#13131f",border:"1px solid #2a2a3e",borderRadius:16,maxWidth:620,width:"100%",maxHeight:"90vh",overflow:"auto" }}>
        <div style={{ padding:"20px 24px",borderBottom:"1px solid #2a2a3e",display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontSize:20 }}>{quest.tp === "boss" ? "🐉" : "📋"}</span>
            <h3 style={{ color:"#e8e8f0",fontSize:16,fontWeight:700,margin:0 }}>{quest.t}</h3>
          </div>
          <button onClick={onClose} style={{ background:"none",border:"none",color:"#666",fontSize:22,cursor:"pointer",padding:4 }}>✕</button>
        </div>
        <div style={{ padding:24 }}>
          <div style={{ background:"#0c0c16",borderRadius:8,padding:12,marginBottom:16,border:"1px solid #1e1e30" }}>
            <p style={{ color:"#8888a8",fontSize:12,margin:0 }}>CRITERIO DE APROBACIÓN</p>
            <p style={{ color:"#c0c0d0",fontSize:14,margin:"4px 0 0",lineHeight:1.5 }}>{quest.a}</p>
          </div>
          <p style={{ color:"#8888a8",fontSize:13,marginBottom:8 }}>Pega tu código, output, o screenshot URL:</p>
          <textarea ref={ref} value={code} onChange={e => setCode(e.target.value)} placeholder={"# Pega tu código o describe lo que hiciste...\n# También puedes pegar el output de terminal"} rows={8}
            style={{ width:"100%",background:"#0c0c16",border:"1px solid #2a2a3e",borderRadius:8,padding:12,color:"#e0e0e8",fontFamily:"'Menlo','Courier New',monospace",fontSize:13,resize:"vertical",outline:"none",boxSizing:"border-box",lineHeight:1.5 }} />
          <div style={{ display:"flex",gap:8,marginTop:12 }}>
            <button onClick={markManual}
              style={{ flex:1,padding:"12px 0",borderRadius:8,border:"none",background:"#10b981",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",transition:"all 0.2s" }}>
              ✓ Marcar como Completada
            </button>
            <button onClick={verify} disabled={true}
              style={{ padding:"12px 16px",borderRadius:8,border:"1px solid #2a2a3e",background:"#1a1a24",color:"#4a4a5a",fontSize:13,cursor:"not-allowed",opacity:0.5 }}>
              🤖 IA (Sin créditos)
            </button>
          </div>
          {result && (
            <div style={{ marginTop:16,padding:16,borderRadius:10,background:result.passed?"rgba(16,185,129,0.08)":"rgba(239,68,68,0.08)",border:`1px solid ${result.passed?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}` }}>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                <span style={{ fontSize:28 }}>{result.passed ? "✅" : "❌"}</span>
                <div>
                  <p style={{ color:result.passed?"#10b981":"#ef4444",fontWeight:700,fontSize:16,margin:0 }}>
                    {result.passed ? "¡APROBADO!" : "AÚN NO CUMPLE"}
                  </p>
                  <p style={{ color:"#8888a8",fontSize:12,margin:0 }}>Score: {result.score}/10</p>
                </div>
              </div>
              <p style={{ color:"#c0c0d0",fontSize:13,margin:"8px 0",lineHeight:1.6 }}>{result.feedback}</p>
              {result.tip && <p style={{ color:"#f59e0b",fontSize:12,margin:0 }}>💡 {result.tip}</p>}
              {result.passed && (
                <button onClick={() => onVerified()} style={{ marginTop:12,width:"100%",padding:"10px 0",borderRadius:8,border:"none",background:"#10b981",color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer" }}>
                  ✨ Reclamar {quest.x} XP
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuestCard({ quest, done, locked, onSelect }) {
  const sk = SKILLS[quest.s];
  const isBoss = quest.tp === "boss";
  const isMini = quest.tp === "mini";
  return (
    <div onClick={() => !locked && onSelect(quest)}
      style={{ background:done?"rgba(16,185,129,0.06)":locked?"rgba(255,255,255,0.01)":"#16162a",border:`1px solid ${done?"#10b98122":locked?"#1a1a2e":isBoss?"#f59e0b33":"#2a2a3e"}`,borderRadius:10,padding:"12px 16px",cursor:locked?"not-allowed":"pointer",opacity:locked?0.35:1,transition:"all 0.15s",position:"relative" }}>
      {isBoss && <div style={{ position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#f59e0b,#ef4444)",borderRadius:"10px 10px 0 0" }} />}
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
        <div style={{ display:"flex",gap:10,alignItems:"flex-start",flex:1,minWidth:0 }}>
          <span style={{ fontSize:18,marginTop:1,flexShrink:0 }}>{done?"✅":locked?"🔒":isBoss?"🐉":isMini?"⚡":"📋"}</span>
          <div style={{ minWidth:0 }}>
            <p style={{ color:done?"#10b981":"#e0e0e8",fontSize:13,fontWeight:600,margin:0,lineHeight:1.3 }}>{quest.t}</p>
            <p style={{ color:"#5a5a78",fontSize:12,margin:"3px 0 0",lineHeight:1.4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{quest.d}</p>
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0 }}>
          <span style={{ background:`${sk?.color}18`,color:sk?.color,fontSize:10,fontWeight:600,padding:"2px 6px",borderRadius:3 }}>{sk?.icon}</span>
          <span style={{ color:"#f59e0b",fontSize:11,fontWeight:700 }}>+{quest.x}</span>
        </div>
      </div>
    </div>
  );
}

function MonthCard({ month, totalQuests, completedQuests, unlocked, selected, onSelect }) {
  const pct = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;
  return (
    <div onClick={() => unlocked && onSelect(month.id)}
      style={{ background:selected?"#1e1e38":unlocked?"#13131f":"#0c0c14",border:`1px solid ${selected?month.color+"66":unlocked?"#2a2a3e":"#1a1a22"}`,borderRadius:12,padding:16,cursor:unlocked?"pointer":"not-allowed",opacity:unlocked?1:0.3,transition:"all 0.2s",position:"relative",overflow:"hidden" }}>
      {selected && <div style={{ position:"absolute",left:0,top:0,bottom:0,width:3,background:month.color }} />}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <span style={{ fontSize:24 }}>{unlocked ? month.icon : "🔒"}</span>
          <div>
            <p style={{ color:"#e0e0e8",fontSize:14,fontWeight:700,margin:0 }}>Mes {month.id}</p>
            <p style={{ color:month.color,fontSize:12,fontWeight:600,margin:0 }}>{month.name}</p>
          </div>
        </div>
        {unlocked && <span style={{ color:"#5a5a78",fontSize:12,fontWeight:600 }}>{completedQuests}/{totalQuests}</span>}
      </div>
      <p style={{ color:"#5a5a78",fontSize:11,margin:"0 0 8px" }}>{month.desc}</p>
      {unlocked && (
        <div style={{ background:"#0c0c16",borderRadius:3,height:4,overflow:"hidden" }}>
          <div style={{ height:"100%",width:`${pct}%`,background:pct===100?"#10b981":month.color,borderRadius:3,transition:"width 0.5s" }} />
        </div>
      )}
      {!unlocked && <p style={{ color:"#3a3a50",fontSize:10,margin:0 }}>Necesitas {month.unlockReq} misiones totales</p>}
    </div>
  );
}

function SkillBar({ skillKey, xp }) {
  const info = SKILLS[skillKey];
  const lvl = Math.min(10, Math.floor(xp / 200) + 1);
  const pct = xp === 0 ? 0 : Math.min(100, ((xp % 200) / 200) * 100);
  return (
    <div style={{ background:"#13131f",border:"1px solid #2a2a3e",borderRadius:10,padding:14 }}>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:8 }}>
        <span style={{ fontSize:20 }}>{info.icon}</span>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",justifyContent:"space-between" }}>
            <p style={{ color:"#e0e0e8",fontSize:13,fontWeight:600,margin:0 }}>{info.name}</p>
            <p style={{ color:info.color,fontSize:12,fontWeight:700,margin:0 }}>Lv {lvl}</p>
          </div>
          <p style={{ color:"#5a5a78",fontSize:11,margin:0 }}>{info.desc}</p>
        </div>
      </div>
      <div style={{ background:"#0c0c16",borderRadius:3,height:5,overflow:"hidden" }}>
        <div style={{ height:"100%",width:`${pct}%`,background:info.color,borderRadius:3,transition:"width 0.5s" }} />
      </div>
      <p style={{ color:"#3a3a50",fontSize:10,marginTop:4,textAlign:"right" }}>{xp} XP</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════
export default function GCPQuest() {
  const [state, setState] = useState(defaultState);
  const [loaded, setLoaded] = useState(false);
  const [view, setView] = useState("map");
  const [selectedMonth, setSelectedMonth] = useState(1);
  const [verifyQuest, setVerifyQuest] = useState(null);
  const [notif, setNotif] = useState(null);
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    (async () => {
      try { const r = await window.storage.get("gcpq-v2"); if (r?.value) { setState(JSON.parse(r.value)); } else { setShowWelcome(true); } } catch { setShowWelcome(true); }
      setLoaded(true);
    })();
  }, []);

  const save = useCallback(async (s) => { setState(s); try { await window.storage.set("gcpq-v2", JSON.stringify(s)); } catch {} }, []);

  const completeQuest = (quest) => {
    if (state.completed.includes(quest.id)) return;
    const bonus = getStreakBonus(state.streak);
    const gained = Math.round(quest.x * (1 + bonus / 100));
    const ns = {
      ...state, xp: state.xp + gained,
      skills: { ...state.skills, [quest.s]: (state.skills[quest.s] || 0) + gained },
      completed: [...state.completed, quest.id],
      streak: state.streak + 1,
      longestStreak: Math.max(state.longestStreak, state.streak + 1),
      lastDate: new Date().toISOString().split("T")[0],
    };
    save(ns);
    setVerifyQuest(null);
    const ol = getLevel(state.xp), nl = getLevel(ns.xp);
    if (nl.level > ol.level) {
      setNotif({ msg: `🎉 ¡NIVEL ${nl.level} — ${nl.title}!`, sub: `+${gained} XP`, color: "#f59e0b" });
    } else {
      setNotif({ msg: `✨ +${gained} XP`, sub: quest.t, color: "#10b981" });
    }
    setTimeout(() => setNotif(null), 3000);
  };

  if (!loaded) return <div style={{ minHeight:"100vh",background:"#0a0a12",display:"flex",alignItems:"center",justifyContent:"center",color:"#3d5afe",fontSize:18,fontFamily:"monospace" }}>Cargando GCP Quest...</div>;

  const lvl = getLevel(state.xp);
  const progress = getProgress(state.xp);
  const nextLvl = getNextLevel(state.xp);
  const totalCompleted = state.completed.length;

  const isMonthUnlocked = (m) => totalCompleted >= m.unlockReq;
  const monthQuests = questsForMonth(selectedMonth);
  const monthDone = monthQuests.filter(q => state.completed.includes(q.id)).length;

  const weeks = [...new Set(monthQuests.map(q => q.w))].sort();

  return (
    <div style={{ minHeight:"100vh",background:"#0a0a12",color:"#e0e0e8",fontFamily:"'Segoe UI','SF Pro',-apple-system,sans-serif" }}>
      {/* Notification */}
      {notif && (
        <div style={{ position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:100,background:notif.color,color:"#fff",padding:"10px 24px",borderRadius:10,fontWeight:700,fontSize:15,boxShadow:`0 4px 24px ${notif.color}44`,animation:"sDown .3s ease",textAlign:"center",maxWidth:"90vw" }}>
          {notif.msg}<br/><span style={{ fontSize:12,fontWeight:400,opacity:0.9 }}>{notif.sub}</span>
        </div>
      )}

      {/* Welcome Modal */}
      {showWelcome && (
        <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.9)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:60,padding:16 }}>
          <div style={{ background:"#13131f",border:"1px solid #2a2a3e",borderRadius:20,maxWidth:480,width:"100%",padding:40,textAlign:"center" }}>
            <div style={{ fontSize:64,marginBottom:16 }}>⚔️</div>
            <h1 style={{ fontSize:28,fontWeight:800,margin:"0 0 8px",background:"linear-gradient(135deg,#3d5afe,#00e5ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>GCP QUEST</h1>
            <p style={{ color:"#f59e0b",fontSize:14,fontWeight:600,margin:"0 0 16px" }}>El camino del Data Engineer</p>
            <p style={{ color:"#8888a8",fontSize:14,lineHeight:1.7,margin:"0 0 24px" }}>
              12 meses de misiones reales. Cada quest produce código para tu portafolio.
              La IA verifica tu trabajo. Subís de nivel construyendo.
            </p>
            <div style={{ display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginBottom:24 }}>
              {Object.values(SKILLS).map(s => (
                <span key={s.name} style={{ background:"#1a1a2e",padding:"4px 10px",borderRadius:6,fontSize:12,color:"#8888a8" }}>{s.icon} {s.name}</span>
              ))}
            </div>
            <button onClick={() => setShowWelcome(false)} style={{ padding:"14px 48px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#3d5afe,#2979ff)",color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer" }}>
              Comenzar aventura
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background:"#0e0e1a",borderBottom:"1px solid #1a1a2e",padding:"12px 20px" }}>
        <div style={{ maxWidth:960,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8 }}>
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <span style={{ fontSize:22 }}>⚔️</span>
            <div>
              <p style={{ fontSize:15,fontWeight:800,margin:0,background:"linear-gradient(135deg,#3d5afe,#00e5ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>GCP QUEST</p>
              <p style={{ color:"#3a3a50",fontSize:10,margin:0,letterSpacing:"0.08em" }}>DATA ENGINEER RPG</p>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:16 }}>
            <div style={{ textAlign:"right" }}>
              <p style={{ color:"#e0e0e8",fontSize:13,fontWeight:700,margin:0 }}>Lv{lvl.level} {lvl.title}</p>
              <div style={{ display:"flex",alignItems:"center",gap:6,marginTop:3 }}>
                <div style={{ background:"#1a1a2e",borderRadius:3,height:6,width:120,overflow:"hidden" }}>
                  <div style={{ height:"100%",width:`${progress}%`,background:"linear-gradient(90deg,#3d5afe,#00e5ff)",borderRadius:3,transition:"width 0.8s" }} />
                </div>
                <span style={{ color:"#5a5a78",fontSize:10 }}>{state.xp}/{nextLvl.xp}</span>
              </div>
            </div>
            <div style={{ background:"#16162a",borderRadius:8,padding:"4px 10px",textAlign:"center",border:"1px solid #2a2a3e" }}>
              <p style={{ color:"#f59e0b",fontSize:16,fontWeight:800,margin:0 }}>🔥{state.streak}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ background:"#0e0e1a",borderBottom:"1px solid #1a1a2e" }}>
        <div style={{ maxWidth:960,margin:"0 auto",display:"flex" }}>
          {[{id:"map",l:"🗺️ Mapa",},{id:"quests",l:"⚔️ Misiones"},{id:"skills",l:"🌳 Skills"},{id:"profile",l:"👤 Perfil"}].map(t => (
            <button key={t.id} onClick={() => setView(t.id)}
              style={{ flex:1,padding:"10px 0",background:"none",border:"none",borderBottom:view===t.id?"2px solid #3d5afe":"2px solid transparent",color:view===t.id?"#3d5afe":"#5a5a78",fontSize:12,fontWeight:600,cursor:"pointer",transition:"all 0.15s" }}>
              {t.l}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:960,margin:"0 auto",padding:20 }}>

        {/* MAP VIEW */}
        {view === "map" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <h2 style={{ fontSize:16,fontWeight:700,margin:0 }}>Mundo — 12 Meses</h2>
              <span style={{ color:"#5a5a78",fontSize:12 }}>{totalCompleted} misiones completadas</span>
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:10 }}>
              {MONTHS.map(m => {
                const mq = questsForMonth(m.id);
                const mc = mq.filter(q => state.completed.includes(q.id)).length;
                return (
                  <MonthCard key={m.id} month={m} totalQuests={mq.length} completedQuests={mc}
                    unlocked={isMonthUnlocked(m)} selected={selectedMonth === m.id}
                    onSelect={(id) => { setSelectedMonth(id); setView("quests"); }} />
                );
              })}
            </div>
            {/* Stats Summary */}
            <div style={{ marginTop:24,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:10 }}>
              {[
                { label:"XP Total", value:state.xp, color:"#3d5afe", icon:"⚡" },
                { label:"Nivel", value:`${lvl.level} / 10`, color:"#f59e0b", icon:"🏆" },
                { label:"Completadas", value:totalCompleted, color:"#10b981", icon:"✅" },
                { label:"Racha", value:`${state.streak}d`, color:"#ef4444", icon:"🔥" },
                { label:"Bonus", value:`+${getStreakBonus(state.streak)}%`, color:"#a855f7", icon:"💎" },
              ].map(s => (
                <div key={s.label} style={{ background:"#13131f",border:"1px solid #2a2a3e",borderRadius:10,padding:14,textAlign:"center" }}>
                  <span style={{ fontSize:20 }}>{s.icon}</span>
                  <p style={{ color:s.color,fontSize:20,fontWeight:800,margin:"4px 0 0" }}>{s.value}</p>
                  <p style={{ color:"#5a5a78",fontSize:10,margin:0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* QUESTS VIEW */}
        {view === "quests" && (
          <div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4 }}>
              <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                <button onClick={() => setView("map")} style={{ background:"none",border:"none",color:"#5a5a78",fontSize:14,cursor:"pointer",padding:0 }}>← Mapa</button>
              </div>
            </div>
            <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:16,padding:"12px 16px",background:"#13131f",borderRadius:10,border:`1px solid ${MONTHS[selectedMonth-1]?.color}33` }}>
              <span style={{ fontSize:28 }}>{MONTHS[selectedMonth-1]?.icon}</span>
              <div style={{ flex:1 }}>
                <p style={{ color:"#e0e0e8",fontSize:16,fontWeight:700,margin:0 }}>Mes {selectedMonth}: {MONTHS[selectedMonth-1]?.name}</p>
                <p style={{ color:"#5a5a78",fontSize:12,margin:0 }}>{MONTHS[selectedMonth-1]?.desc}</p>
              </div>
              <div style={{ textAlign:"right" }}>
                <p style={{ color:MONTHS[selectedMonth-1]?.color,fontSize:18,fontWeight:800,margin:0 }}>{monthDone}/{monthQuests.length}</p>
                <p style={{ color:"#3a3a50",fontSize:10,margin:0 }}>completadas</p>
              </div>
            </div>
            {/* Month selector */}
            <div style={{ display:"flex",gap:4,marginBottom:16,overflowX:"auto",paddingBottom:4 }}>
              {MONTHS.map(m => {
                const unlocked = isMonthUnlocked(m);
                return (
                  <button key={m.id} onClick={() => unlocked && setSelectedMonth(m.id)}
                    style={{ padding:"6px 12px",borderRadius:6,border:"none",background:selectedMonth===m.id?m.color+"22":"#13131f",color:selectedMonth===m.id?m.color:unlocked?"#5a5a78":"#2a2a3e",fontSize:11,fontWeight:600,cursor:unlocked?"pointer":"not-allowed",whiteSpace:"nowrap",flexShrink:0,opacity:unlocked?1:0.3 }}>
                    {unlocked ? m.icon : "🔒"} {m.id}
                  </button>
                );
              })}
            </div>
            {!isMonthUnlocked(MONTHS[selectedMonth-1]) ? (
              <div style={{ textAlign:"center",padding:40,color:"#5a5a78" }}>
                <span style={{ fontSize:48 }}>🔒</span>
                <p style={{ fontSize:14,marginTop:12 }}>Necesitas {MONTHS[selectedMonth-1]?.unlockReq} misiones para desbloquear</p>
                <p style={{ fontSize:12,color:"#3a3a50" }}>Llevas {totalCompleted} completadas</p>
              </div>
            ) : (
              weeks.map(w => {
                const wq = monthQuests.filter(q => q.w === w);
                const bosses = wq.filter(q => q.tp === "boss");
                const dailies = wq.filter(q => q.tp === "daily");
                const minis = wq.filter(q => q.tp === "mini");
                return (
                  <div key={w} style={{ marginBottom:20 }}>
                    <p style={{ color:"#3a3a50",fontSize:11,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 8px",paddingLeft:4 }}>
                      Semana {w}
                    </p>
                    <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                      {dailies.map(q => <QuestCard key={q.id} quest={q} done={state.completed.includes(q.id)} locked={false} onSelect={setVerifyQuest} />)}
                      {minis.map(q => <QuestCard key={q.id} quest={q} done={state.completed.includes(q.id)} locked={false} onSelect={setVerifyQuest} />)}
                      {bosses.map(q => <QuestCard key={q.id} quest={q} done={state.completed.includes(q.id)} locked={false} onSelect={setVerifyQuest} />)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SKILLS VIEW */}
        {view === "skills" && (
          <div>
            <h2 style={{ fontSize:16,fontWeight:700,margin:"0 0 16px" }}>🌳 Árbol de Habilidades</h2>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10 }}>
              {Object.keys(SKILLS).map(k => <SkillBar key={k} skillKey={k} xp={state.skills[k] || 0} />)}
            </div>
            <div style={{ marginTop:24,background:"#13131f",border:"1px solid #2a2a3e",borderRadius:10,padding:16 }}>
              <h3 style={{ fontSize:13,fontWeight:600,color:"#5a5a78",margin:"0 0 12px" }}>Progreso por mes</h3>
              {MONTHS.map(m => {
                const mq = questsForMonth(m.id);
                const mc = mq.filter(q => state.completed.includes(q.id)).length;
                const pct = mq.length > 0 ? (mc / mq.length) * 100 : 0;
                const unlocked = isMonthUnlocked(m);
                return (
                  <div key={m.id} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:6,opacity:unlocked?1:0.25 }}>
                    <span style={{ fontSize:14,width:24,textAlign:"center" }}>{m.icon}</span>
                    <span style={{ color:"#8888a8",fontSize:11,width:20 }}>{m.id}</span>
                    <div style={{ flex:1,background:"#0c0c16",borderRadius:3,height:8,overflow:"hidden" }}>
                      <div style={{ height:"100%",width:`${pct}%`,background:pct===100?"#10b981":m.color,borderRadius:3,transition:"width 0.5s" }} />
                    </div>
                    <span style={{ color:"#5a5a78",fontSize:10,width:36,textAlign:"right" }}>{mc}/{mq.length}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PROFILE VIEW */}
        {view === "profile" && (
          <div>
            <div style={{ background:"linear-gradient(135deg,#16162a,#0e0e20)",border:"1px solid #2a2a3e",borderRadius:16,padding:32,textAlign:"center",marginBottom:20 }}>
              <div style={{ fontSize:56,marginBottom:4 }}>⚔️</div>
              <h2 style={{ fontSize:26,fontWeight:800,margin:"0 0 4px",background:"linear-gradient(135deg,#3d5afe,#00e5ff)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent" }}>Mateo</h2>
              <p style={{ color:"#f59e0b",fontSize:15,fontWeight:700,margin:"0 0 20px" }}>Nivel {lvl.level} — {lvl.title}</p>
              <div style={{ display:"flex",justifyContent:"center",gap:24,flexWrap:"wrap" }}>
                {[
                  { v: state.xp, l: "XP Total", c: "#3d5afe" },
                  { v: totalCompleted, l: "Misiones", c: "#10b981" },
                  { v: state.streak, l: "Racha", c: "#f59e0b" },
                  { v: state.longestStreak, l: "Mejor Racha", c: "#a855f7" },
                  { v: `${Q.filter(q=>q.tp==="boss"&&state.completed.includes(q.id)).length}/${Q.filter(q=>q.tp==="boss").length}`, l: "Bosses", c: "#ef4444" },
                ].map(s => (
                  <div key={s.l}>
                    <p style={{ color:s.c,fontSize:24,fontWeight:800,margin:0 }}>{s.v}</p>
                    <p style={{ color:"#5a5a78",fontSize:11,margin:0 }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <h3 style={{ fontSize:13,fontWeight:600,color:"#5a5a78",marginBottom:10 }}>Últimas completadas</h3>
            {state.completed.length === 0 ? (
              <p style={{ color:"#3a3a50",fontSize:13 }}>Aún sin misiones. ¡Empezá desde el mapa!</p>
            ) : (
              <div style={{ display:"flex",flexDirection:"column",gap:4 }}>
                {[...state.completed].reverse().slice(0, 15).map(id => {
                  const q = Q.find(qq => qq.id === id);
                  return q ? (
                    <div key={id} style={{ background:"#13131f",border:"1px solid #1a1a2e",borderRadius:6,padding:"8px 12px",display:"flex",alignItems:"center",gap:8 }}>
                      <span style={{ fontSize:14 }}>{q.tp==="boss"?"🐉":q.tp==="mini"?"⚡":"✅"}</span>
                      <span style={{ color:"#aaa",fontSize:12,flex:1 }}>{q.t}</span>
                      <span style={{ color:"#f59e0b",fontSize:11 }}>+{q.x}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
            <div style={{ marginTop:24,display:"flex",gap:8 }}>
              <button onClick={() => { if(confirm("¿Seguro? Se borra todo el progreso.")) save(defaultState); }}
                style={{ padding:"8px 16px",borderRadius:6,border:"1px solid #2a2a3e",background:"none",color:"#5a5a78",fontSize:11,cursor:"pointer" }}>
                🔄 Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Verifier */}
      {verifyQuest && !state.completed.includes(verifyQuest.id) && (
        <AIVerifier quest={verifyQuest} onVerified={() => completeQuest(verifyQuest)} onClose={() => setVerifyQuest(null)} />
      )}

      <style>{`
        @keyframes sDown { from { transform:translate(-50%,-20px);opacity:0 } to { transform:translate(-50%,0);opacity:1 } }
        * { box-sizing:border-box; }
        ::-webkit-scrollbar { width:5px;height:5px }
        ::-webkit-scrollbar-track { background:#0a0a12 }
        ::-webkit-scrollbar-thumb { background:#2a2a3e;border-radius:3px }
        body { margin:0 }
      `}</style>
    </div>
  );
}
