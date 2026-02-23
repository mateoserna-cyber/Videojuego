# KPIs — Cómo medir tu progreso

## KPIs de Aprendizaje (revisar mensualmente)

| KPI | Meta Mes 3 | Meta Mes 6 | Meta Mes 12 | Cómo medir |
|-----|-----------|-----------|-------------|------------|
| Nivel del juego | 4 | 6 | 10 | Comando `profile` en el juego |
| Proyectos en portafolio | 2 | 4 | 5 | Repos públicos en GitHub |
| Tests escritos | 30+ | 80+ | 200+ | `grep -r "def test_" --include="*.py" \| wc -l` |
| Commits totales | 100+ | 300+ | 700+ | `git log --oneline \| wc -l` |
| PRs mergeados | 8+ | 25+ | 50+ | GitHub insights |
| ADRs escritos | 3+ | 8+ | 15+ | Contar archivos en docs/adr/ |
| Certificaciones GCP | 0 | 1 (Associate CE) | 2 | Google Cloud credentials |

## KPIs de Disciplina (revisar semanalmente)

| KPI | Objetivo | Medición |
|-----|----------|----------|
| Días jugados por semana | ≥5 de 7 | Comando `streak` en el juego |
| Racha más larga | Superar la anterior | Campo en player profile |
| Misiones completadas/semana | ≥5 diarias + 1 boss | Comando `weekly` |
| Tiempo promedio por sesión | 25-45 min | Autoestimación |
| MVQs usados (días de baja energía) | ≤2 por semana | Log del juego |

## KPIs del SaaS (a partir del Mes 8)

| KPI | Beta (Mes 9) | Launch (Mes 11) | Mes 12 |
|-----|-------------|-----------------|--------|
| Usuarios registrados | 5 | 15 | 30+ |
| Usuarios activos semanales | 3 | 10 | 20+ |
| MRR (Monthly Recurring Revenue) | $0 | $0-100 | $200+ |
| Uptime | 95% | 99% | 99.5% |
| Costo infra mensual | <$20 | <$50 | <$100 |
| NPS (Net Promoter Score) | Pedir feedback | >30 | >50 |
| Tiempo de onboarding | <30 min | <15 min | <10 min |
| Bugs críticos abiertos | <3 | <2 | 0 |

## Cómo hacer la revisión

### Semanal (domingos, 15 min)
1. Correr `weekly` en el juego
2. Anotar: misiones completadas, XP ganada, racha
3. Elegir las misiones de la próxima semana
4. Preguntarse: ¿estoy avanzando o dando vueltas?

### Mensual (último día del mes, 30 min)
1. Correr `profile` y screenshot
2. Comparar nivel actual vs nivel esperado del roadmap
3. Revisar KPIs de aprendizaje
4. Ajustar ritmo si es necesario
5. Escribir 1 párrafo: qué aprendí, qué fue difícil, qué cambio

### Trimestral (cada 3 meses, 1 hora)
1. Revisar portafolio en GitHub: ¿se ve profesional?
2. ¿Puedo explicar cada proyecto en 2 minutos?
3. ¿Estoy construyendo skills que el mercado paga?
4. Ajustar roadmap si los objetivos cambiaron
