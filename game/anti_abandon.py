"""
GCP Quest — Sistema Anti-Abandono
Streaks flexibles, Minimum Viable Quests, y mensajes motivacionales.
"""
import random
from datetime import date

COMEBACK_MESSAGES = [
    "🔄 Volviste. Eso ya es ganar. Empecemos con algo chico.",
    "💪 No importa cuánto tiempo pasó. El código no juzga.",
    "🎯 5 minutos bastan. Momentum > perfección.",
    "🌱 Cada experto fue primero un principiante que no se rindió.",
    "🔥 La racha se reinicia, pero tus skills no. Sigues donde quedaste.",
]

STREAK_MESSAGES = {
    3: "🔥 3 días seguidos. Se está formando el hábito.",
    5: "⚡ 5 días. Bonus de racha al máximo (+50% XP). Estás en modo beast.",
    7: "🏆 1 semana completa. Eres más disciplinado que el 90%.",
    14: "💎 2 semanas. Esto ya no es motivación, es identidad.",
    21: "🌟 21 días. El hábito está formado. Ahora es automático.",
    30: "👑 1 mes. Estás construyendo algo real.",
}

DAILY_TIPS = [
    "💡 Tip: Empieza por lo más difícil. La mañana tiene más willpower.",
    "💡 Tip: Si estás trabado, escribe qué no entiendes. Eso ya es progreso.",
    "💡 Tip: No necesitas entender todo. Necesitas hacer y luego entender.",
    "💡 Tip: Un commit de 3 líneas vale más que 0 commits perfectos.",
    "💡 Tip: Usa Claude/Gemini para desbloquear, no para copiar. Pregunta 'por qué'.",
    "💡 Tip: Si algo te aburre, es señal de que necesitas un proyecto real, no un tutorial.",
    "💡 Tip: Documenta lo que aprendes. Tu yo de mañana te lo agradecerá.",
    "💡 Tip: Antes de googlear, intenta 5 minutos solo. Eso construye intuición.",
    "💡 Tip: El mejor código no es el más elegante, es el que está en producción.",
    "💡 Tip: Haz tu aprendizaje público. La vergüenza es un acelerador.",
]

LOW_ENERGY_QUESTS = [
    {
        "title": "Leer 1 página de documentación de GCP",
        "duration": 5,
        "xp": 15,
        "skill": "gcp_cloud",
    },
    {
        "title": "Escribir 3 líneas en tu diario de aprendizaje",
        "duration": 5,
        "xp": 15,
        "skill": "leadership",
    },
    {
        "title": "Revisar 1 query SQL que escribiste antes y mejorarla",
        "duration": 5,
        "xp": 20,
        "skill": "data_engineering",
    },
    {
        "title": "Leer 1 artículo técnico y anotar 1 cosa nueva",
        "duration": 10,
        "xp": 20,
        "skill": "leadership",
    },
    {
        "title": "Refactorear 1 prompt que usaste esta semana",
        "duration": 5,
        "xp": 15,
        "skill": "rag_llm",
    },
    {
        "title": "Revisar el dashboard de costos de GCP (1 min)",
        "duration": 3,
        "xp": 10,
        "skill": "finops_security",
    },
]


def get_welcome_message(player) -> str:
    """Genera mensaje de bienvenida basado en el estado del jugador."""
    today = date.today().isoformat()

    # Primera vez
    if player.last_play_date is None:
        return (
            "🎮 ¡Bienvenido a GCP Quest, Mateo!\n"
            "   Tu aventura empieza hoy. Nivel 1, 0 XP.\n"
            "   Cada misión te acerca al objetivo.\n"
            "   Escribe 'help' para ver los comandos."
        )

    # Ya jugó hoy
    if player.last_play_date == today:
        return f"👋 De vuelta, {player.name}. {random.choice(DAILY_TIPS)}"

    # Volvió después de ausencia
    last = date.fromisoformat(player.last_play_date)
    days_away = (date.today() - last).days

    if days_away > 2:
        msg = random.choice(COMEBACK_MESSAGES)
        return f"{msg}\n   (Fueron {days_away} días. Tu XP sigue intacta: {player.xp})"

    # Día consecutivo normal
    streak_msg = STREAK_MESSAGES.get(player.streak_days + 1, "")
    if streak_msg:
        return streak_msg

    return f"☀️ Día {player.streak_days + 1} de racha. {random.choice(DAILY_TIPS)}"


def get_mvq() -> dict:
    """Devuelve una Minimum Viable Quest aleatoria de 5 minutos."""
    return random.choice(LOW_ENERGY_QUESTS)


def get_streak_display(player) -> str:
    """Muestra visual de la racha semanal."""
    streak = player.streak_days
    max_display = 7
    filled = min(streak, max_display)
    dots = "🟢" * filled + "⚫" * (max_display - filled)
    bonus = int(player.streak_bonus * 100)
    return f"Racha: {dots} {streak}d (+{bonus}% XP)"
