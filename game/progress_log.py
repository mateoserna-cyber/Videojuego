"""
GCP Quest — Progress Log
Registra progreso localmente y sugiere cómo reflejarlo en GitHub.
"""
import json
from datetime import datetime
from pathlib import Path

LOG_DIR = Path(__file__).parent.parent / "save_data"
LOG_FILE = LOG_DIR / "progress_log.jsonl"


def log_completion(quest, xp_gained: int, notes: str = ""):
    """Registra una misión completada en el log local."""
    LOG_DIR.mkdir(parents=True, exist_ok=True)
    entry = {
        "timestamp": datetime.now().isoformat(),
        "quest_id": quest.id,
        "quest_title": quest.title,
        "type": quest.type,
        "skill": quest.skill,
        "xp_gained": xp_gained,
        "duration_min": quest.duration_min,
        "notes": notes,
    }
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")


def get_recent_log(n: int = 10) -> list:
    """Últimas N entradas del log."""
    if not LOG_FILE.exists():
        return []
    entries = []
    with open(LOG_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line:
                try:
                    entries.append(json.loads(line))
                except json.JSONDecodeError:
                    continue
    return entries[-n:]


def get_github_suggestion(quest) -> str:
    """Genera sugerencia de cómo reflejar la misión en GitHub."""
    suggestions = []

    if quest.type == "daily":
        suggestions.append(
            f"📝 Commit sugerido:\n"
            f"   git add . && git commit -m \"quest({quest.id}): {quest.title}\""
        )
    elif quest.type == "boss":
        suggestions.append(
            f"🐉 Boss Fight — crea un PR:\n"
            f"   Branch: git checkout -b boss/{quest.id}\n"
            f"   Trabaja en la rama, luego:\n"
            f"   git push origin boss/{quest.id}\n"
            f"   Abre PR con título: \"Boss Fight: {quest.title}\""
        )
    elif quest.type == "project":
        suggestions.append(
            f"🏗️ Proyecto — crea un Issue primero:\n"
            f"   Título: \"[Project] {quest.title}\"\n"
            f"   Body: Describe el output esperado y criterios.\n"
            f"   Trabaja en rama: project/{quest.id}\n"
            f"   Cierra el issue con el PR."
        )

    if quest.github_hint:
        suggestions.append(f"💡 Nota: {quest.github_hint}")

    if quest.output:
        suggestions.append(f"📦 Output que debe existir en el repo:\n   {quest.output}")

    return "\n".join(suggestions) if suggestions else "Haz commit de lo que hayas producido."


def get_weekly_summary(player) -> str:
    """Resumen semanal del progreso."""
    entries = get_recent_log(50)
    # Filtrar últimos 7 días
    week_ago = datetime.now().timestamp() - 7 * 86400
    weekly = [
        e for e in entries
        if datetime.fromisoformat(e["timestamp"]).timestamp() > week_ago
    ]

    if not weekly:
        return "📊 No hay actividad esta semana. ¡Empieza con una mini quest!"

    total_xp = sum(e.get("xp_gained", 0) for e in weekly)
    total_time = sum(e.get("duration_min", 0) for e in weekly)
    quests_done = len(weekly)

    # Skills touched
    skills = {}
    for e in weekly:
        s = e.get("skill", "")
        if s:
            skills[s] = skills.get(s, 0) + 1

    top_skill = max(skills, key=skills.get) if skills else "ninguno"

    lines = [
        "╔═══════════════════════════════════════╗",
        "║       📊 RESUMEN SEMANAL              ║",
        "╠═══════════════════════════════════════╣",
        f"║  Misiones completadas: {quests_done:<14} ║",
        f"║  XP ganada: {total_xp:<25} ║",
        f"║  Tiempo invertido: {total_time} min{' ' * (13 - len(str(total_time)))}║",
        f"║  Skill más activo: {top_skill:<18} ║",
        f"║  Racha actual: {player.streak_days} días{' ' * (16 - len(str(player.streak_days)))}║",
        "╚═══════════════════════════════════════╝",
    ]
    return "\n".join(lines)
