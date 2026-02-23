# Prompt Training — Aprender a escribir prompts efectivos

## Por qué importa

Un buen prompt es la diferencia entre perder 30 minutos iterando con la IA y obtener una respuesta útil en 1 intento. Es un skill técnico real que se entrena.

## Rúbrica de evaluación de prompts

| Criterio | 1 (Malo) | 3 (Bueno) | 5 (Excelente) |
|----------|----------|-----------|----------------|
| **Contexto** | No dice quién es ni qué hace | Menciona el rol o proyecto | Contexto completo: rol, proyecto, restricciones, audiencia |
| **Especificidad** | "hazme algo" | Pide algo concreto | Define input, output esperado, formato, y edge cases |
| **Ejemplos** | Ninguno | 1 ejemplo | Input/output example + contraejemplo |
| **Restricciones** | Ninguna | Menciona 1-2 | Stack, lenguaje, estilo, límites, qué NO hacer |
| **Formato de respuesta** | No especifica | Pide formato general | Define estructura exacta (JSON, markdown, secciones, largo) |

**Score total: /25. Apunta a 20+.**

## Los 5 errores más comunes

1. **El prompt vacío:** "hazme un script de Python" → No dice para qué, con qué datos, ni qué output.
2. **El prompt que asume:** "arregla el bug" → La IA no ve tu pantalla, no sabe qué bug.
3. **El prompt sin formato:** Pide análisis pero no dice si quiere bullets, tabla, o párrafos.
4. **El prompt que no da contexto de negocio:** "analiza estos datos" → ¿Para qué? ¿Qué decisión se toma?
5. **El prompt que no pide trade-offs:** "cuál es la mejor base de datos" → No hay "mejor" universal.

## Ejercicios de Prompt Refactoring

### Ejercicio 1: Script CSV

**Prompt malo (score 5/25):**
> hazme un script que lea CSV

**Prompt bueno (score 20/25):**
> Soy data engineer. Necesito un script Python que:
> - Lea un CSV con columnas: telefono, nombre, monto_deuda, dias_mora
> - Normalice teléfonos al formato +56XXXXXXXXX
> - Filtre filas donde monto_deuda <= 0 o telefono está vacío
> - Escriba los válidos a output.json y los inválidos a errors.json
> - Imprima resumen: total/válidos/inválidos
> 
> Restricciones: Python 3.11, solo stdlib (no pandas). Type hints. Logging.
> Incluye un ejemplo de input CSV (3 filas) y el output esperado.

### Ejercicio 2: Arquitectura

**Prompt malo:**
> diseña una arquitectura para mi app

**Prompt bueno:**
> Actúa como solutions architect de GCP. Necesito diseñar la arquitectura para:
> - Sistema de cobranza que procesa 5M llamadas/mes
> - Ingesta: archivos Excel de carteras (1-50K contactos)
> - Procesamiento: limpieza, validación, scoring de prioridad
> - Storage: resultados de llamadas + grabaciones de audio
> - Usuarios: 5 empresas clientes, cada una ve solo sus datos (multi-tenant)
> - Presupuesto: < $500/mes
> 
> Dame 2 opciones de arquitectura. Para cada una:
> 1. Diagrama ASCII de componentes
> 2. Servicios GCP específicos con justificación
> 3. Estimación de costo mensual
> 4. Trade-offs (qué gano/pierdo)
> 5. Cuándo elegiría cada opción

### Ejercicio 3: EDA

**Prompt malo:**
> analiza estos datos

**Prompt bueno:**
> Soy data scientist analizando un dataset de cobranza con estas columnas:
> telefono, nombre, monto_deuda, dias_mora, cartera, resultado_llamada, fecha
> 
> El objetivo de negocio es: predecir qué contactos tienen mayor probabilidad
> de comprometerse a pagar para priorizar las llamadas.
> 
> Genera un plan de EDA en Python (pandas + matplotlib) con:
> 1. Estadísticas descriptivas relevantes (no genéricas, las que importen para el objetivo)
> 2. 5 visualizaciones específicas que respondan preguntas de negocio
> 3. 3 hipótesis sobre qué variables podrían predecir el resultado
> 4. Red flags de calidad de datos a buscar
> 
> Para cada visualización, incluye: pregunta que responde, tipo de gráfico, y código.
> No uses seaborn (solo matplotlib). Formato: markdown con bloques de código.

## Plantillas de Prompts

### Template: Investigar tecnología
```
Necesito evaluar [TECNOLOGÍA] para [CASO DE USO].
Contexto: [proyecto, equipo, restricciones].

Responde con:
1. Qué es y para qué sirve (3 oraciones max)
2. Cuándo usarlo vs cuándo NO (con alternativas)
3. Quick start: pasos mínimos para probarlo
4. Costos: tier gratis, pricing en producción
5. 1 gotcha que no es obvio en la documentación
```

### Template: Escribir tests
```
Tengo esta función en Python:
[CÓDIGO]

Escribe tests con pytest que cubran:
1. Caso feliz (happy path)
2. Edge cases: [lista específica]
3. Error handling: [qué errores debe lanzar]

Formato: archivo test_*.py. Usa fixtures si ayuda.
No uses mocks a menos que sea necesario.
Incluye un parametrize para los edge cases.
```

### Template: Documentar decisión (ADR)
```
Necesito documentar una decisión técnica como ADR (Architecture Decision Record).

Decisión: [QUÉ SE DECIDIÓ]
Contexto: [POR QUÉ SE NECESITABA DECIDIR]
Opciones consideradas: [LISTA]

Genera un ADR con:
- Título descriptivo
- Status: Accepted
- Context: por qué surgió la necesidad
- Decision: qué se eligió
- Alternatives: qué más se consideró y por qué se descartó
- Consequences: qué implica (positivo y negativo)

Formato: markdown. Tono: técnico pero conciso. Max 1 página.
```

### Template: Debug
```
Estoy viendo este error:
[ERROR COMPLETO]

Contexto:
- Lenguaje/framework: [X]
- Qué intentaba hacer: [Y]
- Qué cambié antes de que apareciera: [Z]
- Ya intenté: [lista]

No me des la solución directa. En vez:
1. Explícame qué significa el error
2. Dame 3 posibles causas ordenadas por probabilidad
3. Para cada causa, dime cómo verificar si es esa
4. Recién después, dame el fix para la más probable
```

## Cómo practicar

1. **Cada semana:** Toma 1 prompt que usaste y refactorízalo con la rúbrica
2. **Puntúa:** Antes y después. ¿Subió el score?
3. **Compara respuestas:** Ejecuta ambos prompts y evalúa la diferencia de calidad
4. **Documenta:** Guarda tus mejores prompts en docs/prompt_training/

## Progresión

| Nivel | Indicador |
|-------|-----------|
| 1 | Usa IA como Google (preguntas vagas) |
| 2 | Agrega contexto y formato |
| 3 | Usa ejemplos y restricciones |
| 4 | Diseña prompts multi-step y evaluativos |
| 5 | Crea sistemas de prompts (chains) para flujos complejos |
