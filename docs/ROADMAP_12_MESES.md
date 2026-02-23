# Ruta Anual — 12 Meses de GCP Quest

## Principio rector: 20/80

Cada mes se enfoca en el 20% del conocimiento que produce el 80% del impacto profesional. No se busca profundidad académica sino competencia demostrable con proyectos reales.

---

## Mes 1 — Fundaciones: Python + SQL + GCP + DevOps básico

**Nivel esperado al final: 2 (Aprendiz)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Python con calidad (type hints, tests, docstrings), SQL en BigQuery, setup repo | pipeline.py local CSV→JSON con validaciones |
| 2 | Cloud Storage, BigQuery desde Python, IAM básico, primer prompt dojo | ETL local→GCP (Storage + BigQuery) |
| 3 | Docker, Cloud Run, GitHub Actions CI/CD | API en Cloud Run con deploy automático |
| 4 | Terraform, data quality, documentación, OWASP | **Proyecto 1 DE entregable (portafolio)** |

**Skills desbloqueadas:** Data Engineering Lv2, GCP Lv2, FinOps Lv1

---

## Mes 2 — Data Engineering streaming + Data Science fundamentos

**Nivel esperado al final: 3 (Practicante)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Pub/Sub, Dataflow (Apache Beam), pipeline streaming | Pipeline Pub/Sub→Dataflow→BigQuery |
| 2 | EDA, visualización, feature engineering, métricas, leakage | **Proyecto 2 DS notebook reproducible** |
| 3 | Dataform (transformaciones SQL en BQ), calidad de datos, schema evolution | Pipeline con Dataform models |
| 4 | Observabilidad: Cloud Logging, Monitoring, alertas, SLOs | Dashboard de monitoreo del pipeline |

**Skills desbloqueadas:** Data Engineering Lv3, Data Science Lv2

---

## Mes 3 — Data Science profundo: modelado + evaluación

**Nivel esperado al final: 4 (Artesano)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Modelos: tree-based (XGBoost, LightGBM), cross-validation, hyperparameter tuning | Notebook con 3 modelos comparados |
| 2 | Evaluación rigurosa: confusion matrix, curvas ROC/PR, calibración, significancia estadística | Reporte de evaluación completo |
| 3 | Storytelling con datos: presentar resultados a no-técnicos, dashboards en Looker Studio | Dashboard ejecutivo |
| 4 | Feature store conceptual, data versioning (DVC o alternativa), reproducibilidad | **Proyecto 2 DS actualizado (portafolio)** |

**Skills desbloqueadas:** Data Science Lv4, Leadership Lv1

---

## Mes 4 — ML en Vertex AI: del notebook a producción

**Nivel esperado al final: 5 (Junior)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Vertex AI Workbench, Experiments (tracking de métricas), Datasets | Experimento trackeado en Vertex |
| 2 | Custom training jobs, containerización de training, hiperparámetro tuning | Training job corriendo en Vertex |
| 3 | Model Registry: versionado, metadata, staging→production | Modelo registrado con metadata |
| 4 | Endpoints: deploy modelo, online prediction, batch prediction | **Proyecto 3 ML endpoint en producción** |

**Skills desbloqueadas:** ML/MLOps Lv3, GCP Lv4

---

## Mes 5 — MLOps: pipelines + monitoring + automatización

**Nivel esperado al final: 5-6 (Junior→Profesional)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Vertex AI Pipelines (Kubeflow): pipeline de training reproducible | Pipeline que entrena y registra modelo |
| 2 | Pipeline de inferencia, triggers automáticos (scheduler, Pub/Sub) | Pipeline end-to-end automated |
| 3 | Model monitoring: data drift, concept drift, alertas | Monitoring configurado con alertas |
| 4 | CI/CD para ML: test del modelo, validación pre-deploy, rollback | **Proyecto 3 MLOps completo (portafolio)** |

**Skills desbloqueadas:** ML/MLOps Lv5, FinOps Lv3

---

## Mes 6 — RAG fundamentos: embeddings + vector DB

**Nivel esperado al final: 6 (Profesional)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Embeddings: qué son, modelos (OpenAI, Vertex AI, sentence-transformers), similitud coseno | Script que genera y compara embeddings |
| 2 | Vector DB: opciones (Pinecone, Weaviate, ChromaDB, Vertex AI Vector Search), setup | Index creado con documentos chunkeados |
| 3 | Chunking strategies: fixed-size, semantic, recursive. Impacto en calidad | Comparación de 3 estrategias de chunking |
| 4 | RAG básico end-to-end: ingesta→chunk→embed→retrieve→generate | **Prototipo RAG funcional** |

**Skills desbloqueadas:** RAG Lv3, GCP Lv5

---

## Mes 7 — RAG avanzado: evaluación + agentes

**Nivel esperado al final: 7 (Especialista)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Evaluación de RAG: faithfulness, relevance, answer correctness (RAGAS o similar) | Suite de evaluación con métricas |
| 2 | Mejoras: re-ranking, hybrid search, query transformation, metadata filtering | RAG mejorado con benchmark antes/después |
| 3 | Agentes: tool use, function calling, multi-step reasoning | Agente que usa herramientas |
| 4 | RAG en producción: caching, rate limiting, observabilidad, costos | **Proyecto 4 RAG con eval (portafolio)** |

**Skills desbloqueadas:** RAG Lv5, ML/MLOps Lv6

---

## Mes 8 — SaaS: diseño + MVP North Star

**Nivel esperado al final: 7-8 (Especialista→Senior)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Definir North Star SaaS: problema, usuario, propuesta de valor, arquitectura | ADR + diseño de sistema |
| 2 | Auth: Google OAuth, multi-tenant básico (org_id en DB), roles | Auth funcionando en Cloud Run |
| 3 | Backend MVP: 3 endpoints principales, base de datos (Firestore o CloudSQL), API docs | API funcional con Swagger |
| 4 | Frontend MVP: landing page + dashboard mínimo (Next.js o similar) | **MVP deployeado y accesible** |

**Skills desbloqueadas:** Leadership Lv3, GCP Lv6

---

## Mes 9 — SaaS: beta + integraciones

**Nivel esperado al final: 8 (Senior)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Integrar ML/RAG en el SaaS: feature que use modelo o RAG | Feature AI integrada |
| 2 | Multi-tenant: aislamiento de datos, límites por plan, audit log | Multi-tenant funcional |
| 3 | Billing estimado: costos por tenant, márgenes, pricing model | Modelo de pricing documentado |
| 4 | Beta: 3-5 usuarios reales, feedback loop, iteración | **Beta con usuarios reales** |

**Skills desbloqueadas:** FinOps Lv5, Leadership Lv4

---

## Mes 10 — Escala + FinOps + Seguridad

**Nivel esperado al final: 8-9 (Senior→Experto)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Escalabilidad: Cloud Run autoscaling, load testing (k6 o locust), caching (Memorystore) | Load test report |
| 2 | FinOps profundo: budgets, alerts, committed use discounts, right-sizing | Dashboard de costos |
| 3 | Seguridad: secret management, VPC, WAF, supply chain (dependabot), pentesting básico | Security checklist completo |
| 4 | Privacidad Chile: ley de datos personales, consentimiento, derecho al olvido | **Compliance checklist + implementación** |

**Skills desbloqueadas:** FinOps Lv7, Security Lv6

---

## Mes 11 — Contenido público + portafolio

**Nivel esperado al final: 9 (Experto)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Blog técnico: escribir 2 posts (1 de DE, 1 de ML) en Medium/dev.to/LinkedIn | 2 posts publicados |
| 2 | Hablar en público: grabar 1 video técnico (Loom/YouTube), preparar 1 talk de 10 min | Video publicado |
| 3 | Portafolio GitHub: pulir READMEs, agregar demos, badges, arquitecturas | Perfil GitHub profesional |
| 4 | Open source: contribuir a 1 proyecto (issue o PR pequeño) | **PR aceptado o issue constructivo** |

**Skills desbloqueadas:** Leadership Lv6

---

## Mes 12 — North Star: primeros clientes + maestría

**Nivel esperado al final: 10 (Maestro)**

| Semana | Foco | Entregable |
|--------|------|-----------|
| 1 | Go-to-market: landing page, pricing, onboarding flow | Página de producto lista |
| 2 | Primeros 3-5 clientes pagos (o pilots gratuitos con compromiso de feedback) | Usuarios activos |
| 3 | Métricas de producto: MRR, churn, NPS, usage analytics | Dashboard de métricas |
| 4 | Retrospectiva: qué aprendí, qué haría distinto, plan año 2 | **Retro publicada + plan futuro** |

**Skills desbloqueadas:** Todas Lv7+

---

## Proyectos de Portafolio (Resumen)

| # | Proyecto | Mes | Skills |
|---|----------|-----|--------|
| 1 | Data Engineering E2E: CSV→Pub/Sub→Dataflow→BigQuery | 1-2 | DE, GCP, FinOps |
| 2 | Data Science: EDA→Features→Modelo→Reporte reproducible | 2-3 | DS, Leadership |
| 3 | ML/MLOps en Vertex: Training→Registry→Deploy→Monitor | 4-5 | ML, GCP |
| 4 | RAG App con evaluación | 6-7 | RAG, ML |
| 5 | North Star SaaS: MVP→Beta→Clientes | 8-12 | Todos |

---

## North Star SaaS: Recomendación

Dado tu experiencia con IVR, cobranza, y automatización, el SaaS natural es:

**"Plataforma de inteligencia de campañas de cobranza"**

- Ingesta de carteras (Excel/CSV) → pipeline de calidad
- Análisis predictivo: qué contactos tienen mayor probabilidad de pago
- RAG: chatbot interno que responde preguntas sobre políticas de cobranza
- Dashboard: métricas en tiempo real de campañas
- Multi-tenant: cada cliente (empresa de cobranza) ve solo sus datos

Esto combina TODOS los skills del roadmap en un producto real.
