# 🎮 GCP Quest — RPG de Aprendizaje en Data & Cloud

```
╔══════════════════════════════════════════════════════════════╗
║  GCP QUEST v1.0 — El camino del Data Engineer              ║
║  Jugador: Mateo | Objetivo: Expert en 12 meses             ║
║  Motor: Python CLI | Evidencia: GitHub | Cloud: GCP         ║
╚══════════════════════════════════════════════════════════════╝
```

## Qué es esto

Un RPG en terminal que convierte tu aprendizaje de GCP + Data Engineering + ML + RAG en un juego con XP, niveles, misiones diarias y boss fights semanales. Cada misión produce código real que va a tu portafolio en GitHub.

**No es un tutorial genérico.** Cada misión tiene criterios de aprobación concretos, tests automatizados donde aplica, y produce un output verificable.

## Inicio rápido

```bash
# Clonar
git clone https://github.com/tu-usuario/gcp-quest.git
cd gcp-quest

# Instalar (sin dependencias externas para el MVP)
python3 -m pip install pyyaml --break-system-packages

# Jugar
python3 -m game.cli
```

## Cómo funciona

### Sistema de XP y Niveles

| Nivel | Título | XP Total | Equivalente |
|-------|--------|----------|-------------|
| 1 | Novato | 0 | Recién empieza |
| 2 | Aprendiz | 500 | Sabe moverse en GCP |
| 3 | Practicante | 1,500 | Hace pipelines simples |
| 4 | Artesano | 3,500 | Proyectos end-to-end |
| 5 | Junior | 7,000 | Portafolio con 2 proyectos |
| 6 | Profesional | 12,000 | ML en producción |
| 7 | Especialista | 20,000 | RAG + SaaS MVP |
| 8 | Senior | 32,000 | Multi-tenant + FinOps |
| 9 | Experto | 50,000 | Contenido público + clientes |
| 10 | Maestro | 75,000 | Referente en la comunidad |

### Tipos de misión

| Tipo | Duración | XP | Frecuencia |
|------|----------|----|------------|
| Daily Quest | 15-30 min | 50-100 | Diaria |
| Boss Fight | 1-2 hrs | 200-500 | Semanal |
| Mini Quest (MVQ) | 5 min | 25 | Cuando no hay tiempo |
| Project Milestone | Variable | 300-800 | Cada 2-4 semanas |

### Árbol de Habilidades

```
                    ┌─── Data Engineering ───┐
                    │  Ingesta, ETL, calidad  │
                    │  Pub/Sub, Dataflow, BQ  │
                    └────────┬───────────────┘
                             │
┌─── Data Science ──┐        │        ┌─── ML/MLOps ────────┐
│  EDA, features,   │────────┼────────│  Vertex AI, pipelines│
│  métricas, story  │        │        │  registry, monitoring│
└───────────────────┘        │        └──────────────────────┘
                             │
                    ┌────────┴───────────────┐
                    │      GCP / Cloud        │
                    │  IAM, networking, IaC   │
                    └────────┬───────────────┘
                             │
┌─── RAG / LLM ────┐        │        ┌─── FinOps + Security ┐
│  Embeddings, vec  │────────┼────────│  Costos, budgets,    │
│  DB, eval, agents │        │        │  IAM, OWASP, privacy │
└───────────────────┘        │        └──────────────────────┘
                             │
                    ┌────────┴───────────────┐
                    │  Liderazgo + Contenido  │
                    │  Blog, talks, teaching  │
                    └────────────────────────┘
```

### Sistema anti-abandono

- **Minimum Viable Quest (MVQ):** Si no tienes tiempo, hay misiones de 5 minutos. Siempre puedes hacer algo.
- **Streak flexible:** 1 día sin jugar no rompe la racha. 2 días seguidos sí, pero el reinicio es sin penalización de XP.
- **Reinicio sin culpa:** El juego nunca te quita XP. Solo dejas de ganar bonus de racha.
- **Bonus de racha:** +10% XP por cada día consecutivo, hasta +50% (5+ días).

### GitHub como sistema de evidencia

Cada misión completada sugiere:
1. Un **commit** con el output de la misión
2. Un **issue** que se cierra automáticamente con el PR
3. Las boss fights generan **PRs** con review checklist

## Estructura del repositorio

```
gcp-quest/
├── game/                    # Motor del juego CLI
│   ├── __init__.py
│   ├── __main__.py
│   ├── cli.py               # Interfaz principal
│   ├── player.py            # Perfil, XP, niveles
│   ├── quest_engine.py      # Carga y gestión de misiones
│   ├── skill_tree.py        # Árbol de habilidades
│   ├── anti_abandon.py      # Streaks, MVQ, motivación
│   └── progress_log.py      # Log local + GitHub hints
├── quests/                  # Misiones en YAML
│   ├── month_01/            # Mes 1: Fundaciones
│   ├── month_02/            # Mes 2: Data Engineering
│   └── ...
├── projects/                # Proyectos reales (portafolio)
│   ├── 01_data_engineering/
│   ├── 02_data_science/
│   ├── 03_ml_vertex/
│   ├── 04_rag_app/
│   └── 05_saas_north_star/
├── docs/                    # Guías y documentación
│   ├── ROADMAP_12_MESES.md
│   ├── PROMPT_TRAINING.md
│   └── TEMPLATES/
├── .github/
│   ├── workflows/ci.yml
│   └── ISSUE_TEMPLATE/
├── save_data/               # Datos de partida guardada
├── requirements.txt
└── README.md                # Este archivo
```

## Ruta anual (resumen)

| Mes | Foco | Proyecto | Nivel esperado |
|-----|------|----------|----------------|
| 1 | Python + SQL + GCP foundations | Setup completo | 2 |
| 2 | Data Engineering: ingesta + ETL | Pipeline Pub/Sub→BQ | 3 |
| 3 | Data Science: EDA + features | Notebook reproducible | 3-4 |
| 4 | Data Science: modelos + evaluación | Reporte completo | 4 |
| 5 | ML en Vertex AI | Training + registry | 5 |
| 6 | MLOps: pipelines + monitoring | Pipeline reproducible | 5-6 |
| 7 | RAG: embeddings + vector DB | RAG app funcional | 6-7 |
| 8 | RAG: evaluación + agentes | RAG con eval metrics | 7 |
| 9 | SaaS: MVP North Star | Auth + multi-tenant | 7-8 |
| 10 | SaaS: Beta + FinOps | Costos + escalabilidad | 8-9 |
| 11 | Contenido + portafolio | Blog + talks | 9 |
| 12 | Escala + primeros clientes | Go-to-market | 10 |

## Licencia

MIT — Hecho para aprender construyendo.
