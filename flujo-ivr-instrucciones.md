# Flujo IVR Bot de Cobranza — Orsan Multicartera
## Documento de referencia para generación de banco de audio

**Fuente**: Onbotgo | 10-06-2022 (adaptado para Bot IVR in-house 2026)
**Uso**: Este documento describe EXACTAMENTE qué audio se reproduce en cada paso de la llamada.
El banco de audio debe cubrir el 100% de los prompts aquí listados.

---

## Variables dinámicas

Estas variables cambian por cada llamada y se resuelven concatenando archivos WAV pre-generados:

| Variable | Fuente | Ejemplo | Cómo se arma el audio |
|----------|--------|---------|----------------------|
| `<NOMBRE>` | CSV cartera | "Carlos" | WAV: `don_carlos.wav` o `dona_maria.wav` |
| `<APELLIDO>` | CSV cartera | "Pérez" | WAV: `apellidos/perez.wav` |
| `<NOMBRE_CARTERA>` | Config cliente | "Hites" / "Santander" / "WOM" | WAV: `carteras/hites.wav` (set fijo, ~50 clientes) |
| `<MONTO_DEUDA>` | CSV cartera | "$235.000" | Concatenación de bloques numéricos |
| `<FECHA_VENCIMIENTO>` | CSV cartera | "28 de febrero" | Concatenación: `dias/28.wav` + `de.wav` + `meses/febrero.wav` |
| `<DIAS_PROMESA>` | Regla de negocio | "5" / "10" / "15" | WAV: `dias_promesa/5.wav`, etc. (set pequeño) |
| `<FECHA_PROMESA>` | Calculada por sistema | "5 de marzo" | Concatenación igual que fecha_vencimiento |
| `[vencida] / [por vencer]` | Calculada | Si fecha_venc < hoy → "vencida"; si ≥ hoy → "por vencer" | WAV: `estado/vencida.wav` o `estado/por_vencer.wav` |

---

## Flujo completo con prompts de audio

### INICIO DE LLAMADA

```
Asterisk marca número → SIP INVITE
  ├── No conecta (80.5%) → FIN (sin audio)
  ├── Buzón de voz (12.8%) → AMD detecta → corta → FIN (sin audio)
  └── Conecta (6.7%) → AMD detecta humano → inicia flujo de audio
```

### BLOQUE 1: Identificación del titular

**P01** — Saludo + identificación (mañana)
> "Buenos días, ¿hablo con `<NOMBRE>` `<APELLIDO>`?"

**P02** — Saludo + identificación (tarde)
> "Buenas tardes, ¿hablo con `<NOMBRE>` `<APELLIDO>`?"

**Nota**: P01 o P02 se elige según hora del día. Corte: mediodía (12:00).

→ **STT escucha respuesta** (ventana 3-5 segundos)

#### Clasificación de respuesta a P01/P02:

| Respuesta detectada | Acción |
|---|---|
| **Positiva** ("sí", "sí soy", "con él/ella habla", "yo soy") | → Ir a P08 |
| **Negativa** ("no", "no está", "no vive aquí") | → Ir a BLOQUE TERCEROS (P00) |
| **Pregunta quién llama** ("¿quién habla?", "¿de dónde llaman?") | → Ir a P04 |
| **No se entiende / silencio** | → Ir a P03 (reintento) |
| **Indica que ya pagó** ("ya pagué", "eso ya se pagó") | → Ir a P11 |
| **Corta la llamada** | → FIN (registrar gestión G0/G1) |

---

**P03** — Reintento de identificación (máximo 1 reintento)
> "Disculpa, no escuché bien, ¿hablo con `<NOMBRE>` `<APELLIDO>`?"

→ STT escucha respuesta → misma clasificación que P01/P02
→ Si después de P03 sigue sin entender → **P05**

**P05** — Problemas de comunicación → FIN
> "Disculpe, tengo problemas con la comunicación. Le volveremos a llamar. ¡Que tenga un buen día!"

---

**P04** — Respuesta a "¿quién llama?" → re-identifica
> "Llamamos de la agencia Orsan, por encargo de `<NOMBRE_CARTERA>`. ¿Hablo con `<NOMBRE>` `<APELLIDO>`?"

→ STT escucha respuesta → misma clasificación que P01/P02

---

### BLOQUE 2: Notificación de deuda (titular confirmado)

**P08** — Información de deuda
> "Mucho gusto, habla su ejecutivo virtual de `<NOMBRE_CARTERA>`. Le informamos que mantiene una deuda `[vencida / por vencer]`, desde el `<FECHA_VENCIMIENTO>`, por un monto de `<MONTO_DEUDA>`. ¿Puede pagar dentro de los próximos `<DIAS_PROMESA>` días?"

**Lógica de [vencida / por vencer]:**
- Si `<FECHA_VENCIMIENTO>` < fecha de hoy → usar "vencida"
- Si `<FECHA_VENCIMIENTO>` >= fecha de hoy → usar "por vencer"

→ **STT escucha respuesta** (ventana 4-6 segundos, esta es la más larga)

#### Clasificación de respuesta a P08:

| Respuesta detectada | Acción |
|---|---|
| **Positiva** ("sí", "puedo pagar", "dale", "ya") | → Ir a P09 |
| **Negativa** ("no puedo", "no tengo plata", "no voy a pagar") | → Ir a P12 |
| **Ya pagó** ("ya pagué", "eso está pagado") | → Ir a P11 |
| **Pide repetir** ("¿puede repetir?", "no escuché el monto") | → Ir a P20 |
| **No se entiende / silencio** | → Ir a P15 (reintento) |
| **Corta la llamada** | → FIN |

---

### BLOQUE 3: Resolución

**P09** — Compromiso de pago aceptado
> "Perfecto, dejamos su compromiso agendado para el `<FECHA_PROMESA>`."

→ Registrar gestión positiva → **P06** (despedida)

---

**P11** — Cliente indica que ya pagó
> "Disculpa la molestia, procederemos a validar el pago. ¡Tenga un feliz día!"

→ Registrar gestión "ya pagó" → FIN

---

**P12** — Motivo de no pago
> "¿Nos podría comentar el motivo de no pago?"

→ STT escucha respuesta (clasificar motivo para registro, no cambia el flujo)
→ Ir a **P13**

---

**P13** — Sugerencia de contacto (respuesta negativa al pago)
> "Entiendo. Le sugerimos contactarse a la brevedad con `<NOMBRE_CARTERA>`. Muchas gracias."

→ FIN

---

**P15** — Reintento de P08 (máximo 1 reintento)
> "Disculpa, no entendí. ¿Me confirma si realiza el pago en los próximos `<DIAS_PROMESA>` días?"

→ STT escucha respuesta → misma clasificación que P08
→ Si después de P15 sigue sin entender → **P13**

---

**P20** — Repetir información de deuda (máximo 1 repetición)
> "Entiendo que desea repetir la información. Su deuda es de `<MONTO_DEUDA>`, con fecha de vencimiento el `<FECHA_VENCIMIENTO>`. ¿Puede realizar el pago dentro de los próximos `<DIAS_PROMESA>` días?"

→ STT escucha respuesta → misma clasificación que P08
→ Si pide repetir de nuevo → **P13**

---

### BLOQUE 4: Terceros (no es el titular)

**P00** — Consulta a tercero
> "¿Usted conoce a `<NOMBRE>` `<APELLIDO>`?"

→ STT escucha respuesta

| Respuesta detectada | Acción |
|---|---|
| **Positiva** ("sí", "es mi hijo/esposo/etc.") | → Ir a P07 |
| **Negativa** ("no", "no lo conozco") | → Ir a P06 |
| **No se entiende** | → Ir a P06 |

---

**P07** — Mensaje para tercero que conoce al titular
> "Por favor, informarle que estamos tratando de comunicarnos de `<NOMBRE_CARTERA>`. Volveremos a llamar. Gracias por su tiempo. ¡Que tenga un buen día!"

→ FIN

---

### DESPEDIDAS

**P06** — Despedida genérica
> "Disculpe por la molestia. ¡Que tenga un buen día!"

→ FIN

---

## Inventario completo de archivos de audio a generar

### Frases fijas (generar UNA vez con la voz elegida)

| ID | Texto exacto | Archivo |
|---|---|---|
| P01_saludo | "Buenos días, ¿hablo con" | `frases/p01_saludo.wav` |
| P02_saludo | "Buenas tardes, ¿hablo con" | `frases/p02_saludo.wav` |
| P01P02_sufijo | "?" (entonación interrogativa, o silencio breve) | `frases/sufijo_pregunta.wav` |
| P03 | "Disculpa, no escuché bien, ¿hablo con" | `frases/p03_reintento.wav` |
| P04_intro | "Llamamos de la agencia Orsan, por encargo de" | `frases/p04_intro.wav` |
| P04_sufijo | "¿Hablo con" | `frases/p04_sufijo.wav` |
| P05 | "Disculpe, tengo problemas con la comunicación. Le volveremos a llamar. ¡Que tenga un buen día!" | `frases/p05_problemas.wav` |
| P06 | "Disculpe por la molestia. ¡Que tenga un buen día!" | `frases/p06_despedida.wav` |
| P07_intro | "Por favor, informarle que estamos tratando de comunicarnos de" | `frases/p07_intro.wav` |
| P07_sufijo | "Volveremos a llamar. Gracias por su tiempo. ¡Que tenga un buen día!" | `frases/p07_sufijo.wav` |
| P08_intro | "Mucho gusto, habla su ejecutivo virtual de" | `frases/p08_intro.wav` |
| P08_deuda | "Le informamos que mantiene una deuda" | `frases/p08_deuda.wav` |
| P08_desde | "desde el" | `frases/p08_desde.wav` |
| P08_monto | "por un monto de" | `frases/p08_monto.wav` |
| P08_promesa | "¿Puede pagar dentro de los próximos" | `frases/p08_promesa.wav` |
| P08_dias_sufijo | "días?" | `frases/p08_dias_sufijo.wav` |
| P09_intro | "Perfecto, dejamos su compromiso agendado para el" | `frases/p09_intro.wav` |
| P11 | "Disculpa la molestia, procederemos a validar el pago. ¡Tenga un feliz día!" | `frases/p11_ya_pago.wav` |
| P12 | "¿Nos podría comentar el motivo de no pago?" | `frases/p12_motivo.wav` |
| P13_intro | "Entiendo. Le sugerimos contactarse a la brevedad con" | `frases/p13_intro.wav` |
| P13_sufijo | "Muchas gracias." | `frases/p13_sufijo.wav` |
| P15_intro | "Disculpa, no entendí. ¿Me confirma si realiza el pago en los próximos" | `frases/p15_intro.wav` |
| P15_sufijo | "días?" | `frases/p15_sufijo.wav` |
| P20_intro | "Entiendo que desea repetir la información. Su deuda es de" | `frases/p20_intro.wav` |
| P20_fecha | "con fecha de vencimiento el" | `frases/p20_fecha.wav` |
| P20_promesa | "¿Puede realizar el pago dentro de los próximos" | `frases/p20_promesa.wav` |
| P20_sufijo | "días?" | `frases/p20_sufijo.wav` |
| P00 | "¿Usted conoce a" | `frases/p00_tercero.wav` |
| ESTADO_vencida | "vencida" | `estado/vencida.wav` |
| ESTADO_por_vencer | "por vencer" | `estado/por_vencer.wav` |

### Archivos dinámicos (del CSV de cartera)

| Tipo | Cantidad estimada | Carpeta | Formato nombre archivo |
|---|---|---|---|
| Nombres con "don" | ~500-2.000 únicos | `/audio/nombres/` | `don_carlos.wav` |
| Nombres con "doña" | ~500-2.000 únicos | `/audio/nombres/` | `dona_maria.wav` |
| Apellidos | ~3.000-8.000 únicos | `/audio/apellidos/` | `perez.wav`, `gonzalez.wav` |
| Nombres de cartera | ~50 clientes | `/audio/carteras/` | `hites.wav`, `santander.wav` |

### Bloques numéricos (generar UNA vez)

| Tipo | Archivos | Carpeta |
|---|---|---|
| Unidades (1-9) | `un.wav` a `nueve.wav` | `/audio/numeros/` |
| 10-19 | `diez.wav` a `diecinueve.wav` | `/audio/numeros/` |
| 20-29 | `veinte.wav` a `veintinueve.wav` | `/audio/numeros/` |
| Decenas (30-90) | `treinta.wav` a `noventa.wav` | `/audio/numeros/` |
| Conector | `y.wav` | `/audio/numeros/` |
| Centenas | `cien.wav`, `ciento.wav`, `doscientos.wav`... `novecientos.wav` | `/audio/numeros/` |
| Miles | `mil.wav` | `/audio/numeros/` |
| Millón/millones | `millon.wav`, `millones.wav` | `/audio/numeros/` |
| Unidad monetaria | `pesos.wav` | `/audio/numeros/` |

### Fragmentos de fecha (generar UNA vez)

| Tipo | Archivos | Carpeta |
|---|---|---|
| Días (1-31) | `primero.wav`, `dos.wav`... `treinta_y_uno.wav` | `/audio/fechas/dias/` |
| Meses | `enero.wav` a `diciembre.wav` | `/audio/fechas/meses/` |
| Conectores | `de.wav`, `del.wav` | `/audio/fechas/` |

### Días de promesa (set pequeño)

| Archivo | Texto |
|---|---|
| `dias_promesa/3.wav` | "tres" |
| `dias_promesa/5.wav` | "cinco" |
| `dias_promesa/7.wav` | "siete" |
| `dias_promesa/10.wav` | "diez" |
| `dias_promesa/15.wav` | "quince" |
| `dias_promesa/30.wav` | "treinta" |

---

## Ejemplo de llamada completa armada

**Deudor**: Carlos Pérez, cartera Hites, deuda $235.000 vencida el 15 de enero, promesa 5 días.

Secuencia de Playback de Asterisk:
```
1. frases/p01_saludo.wav          → "Buenos días, ¿hablo con"
2. nombres/don_carlos.wav         → "don Carlos"
3. apellidos/perez.wav            → "Pérez"
4. frases/sufijo_pregunta.wav     → "?" (pausa)
   [STT → "sí soy" → titular confirmado]
5. frases/p08_intro.wav           → "Mucho gusto, habla su ejecutivo virtual de"
6. carteras/hites.wav             → "Hites"
7. frases/p08_deuda.wav           → "Le informamos que mantiene una deuda"
8. estado/vencida.wav             → "vencida"
9. frases/p08_desde.wav           → "desde el"
10. fechas/dias/quince.wav        → "quince"
11. fechas/de.wav                 → "de"
12. fechas/meses/enero.wav        → "enero"
13. frases/p08_monto.wav          → "por un monto de"
14. numeros/doscientos.wav        → "doscientos"
15. numeros/treinta_y_cinco.wav   → "treinta y cinco"
16. numeros/mil.wav               → "mil"
17. numeros/pesos.wav             → "pesos"
18. frases/p08_promesa.wav        → "¿Puede pagar dentro de los próximos"
19. dias_promesa/5.wav            → "cinco"
20. frases/p08_dias_sufijo.wav    → "días?"
    [STT → "sí" → compromiso aceptado]
21. frases/p09_intro.wav          → "Perfecto, dejamos su compromiso agendado para el"
22. fechas/dias/veinte.wav        → "veinte"
23. fechas/de.wav                 → "de"
24. fechas/meses/febrero.wav      → "febrero"
25. frases/p06_despedida.wav      → "Disculpe por la molestia. ¡Que tenga un buen día!"
```

---

## Notas técnicas

### Sobre la concatenación de audio
- Cada WAV debe tener **100ms de silencio al inicio** y **200ms al final** para que la concatenación suene natural
- Normalizar todos los archivos al mismo volumen (-3dB target)
- Sample rate: **8kHz mono** (formato telefonía estándar) O **24kHz** si Asterisk downsamplea automáticamente
- Formato: WAV PCM 16-bit (sin compresión)

### Sobre la generación de montos
- Los montos siempre son en pesos chilenos, sin decimales
- Rango típico: $5.000 a $50.000.000
- Función `monto_a_texto(235000)` → "doscientos treinta y cinco mil"
- Concatenación: `doscientos.wav` + `treinta_y_cinco.wav` + `mil.wav` + `pesos.wav`
- Edge cases: "un millón" (no "uno millón"), "cien mil" (no "ciento mil")

### Sobre las fechas
- Formato: "día de mes" → "quince de enero"
- El día 1 se dice "primero" (no "uno")
- No incluir año (no es relevante para la llamada)

### Sobre el género del nombre
- Usar "don" para nombres masculinos, "doña" para femeninos
- Heurística: la mayoría de nombres femeninos chilenos terminan en 'a'
- Excepciones comunes: "Carmen" (F), "Jesús" (M), "Mercedes" (F), "Cruz" (ambiguo)
- En caso de duda, se puede mantener una tabla de género manual o inferir del RUT (dígito verificador no indica género, necesita tabla)
- El CSV de cartera puede ya traer el género como campo

### Sobre Kokoro y textos cortos
- Kokoro rinde mejor con textos de 100-200 tokens
- Para frases cortas como "vencida" (1 palabra), conviene generar en contexto:
  - Generar "mantiene una deuda vencida" completo y recortar
  - O generar "La deuda se encuentra vencida." y recortar la palabra
- Probar ambas estrategias y comparar calidad

### Sobre la prosodia del texto
- Kokoro responde a puntuación para controlar entonación:
  - "?" al final → entonación interrogativa
  - "." → pausa natural
  - "," → pausa breve
  - "..." → pausa larga
  - "!" → énfasis
- Para cobranza: usar puntos y comas, evitar exclamaciones excesivas
- El tono debe ser firme y claro, NO urgente ni amenazante