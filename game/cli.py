"""
GCP Quest — CLI Principal
Interfaz de terminal para jugar.
"""
import sys
import os

from game.player import Player, SKILLS
from game.quest_engine import QuestEngine
from game.anti_abandon import get_welcome_message, get_mvq, get_streak_display
from game.progress_log import log_completion, get_github_suggestion, get_weekly_summary

BANNER = """
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║     ██████╗  ██████╗██████╗      ██████╗ ██╗   ██╗███████╗  ║
║    ██╔════╝ ██╔════╝██╔══██╗    ██╔═══██╗██║   ██║██╔════╝  ║
║    ██║  ███╗██║     ██████╔╝    ██║   ██║██║   ██║█████╗    ║
║    ██║   ██║██║     ██╔═══╝     ██║▄▄ ██║██║   ██║██╔══╝    ║
║    ╚██████╔╝╚██████╗██║         ╚██████╔╝╚██████╔╝███████╗  ║
║     ╚═════╝  ╚═════╝╚═╝          ╚══▀▀═╝  ╚═════╝ ╚══════╝  ║
║                                                              ║
║        El camino del Data Engineer — RPG Terminal            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
"""

HELP_TEXT = """
═══════════════════════ COMANDOS ═══════════════════════
  profile / p      — Ver tu perfil y habilidades
  quests / q       — Ver misiones disponibles
  quest <ID>       — Ver detalle de una misión
  complete <ID>    — Marcar misión como completada
  boss             — Ver boss fights disponibles
  mvq              — Misión mínima de 5 min (baja energía)
  weekly           — Resumen semanal
  skills           — Árbol de habilidades detallado
  streak           — Ver estado de la racha
  log              — Últimas misiones completadas
  help / h         — Mostrar esta ayuda
  quit / exit      — Guardar y salir
════════════════════════════════════════════════════════
"""


def clear_screen():
    os.system("cls" if os.name == "nt" else "clear")


def input_prompt():
    try:
        return input("\n⚔️  gcp-quest > ").strip()
    except (EOFError, KeyboardInterrupt):
        return "quit"


def cmd_profile(player):
    print(player.get_profile_card())


def cmd_quests(player, engine):
    current_month = max(1, min(12, (player.level + 1) // 2 + 1))
    available = engine.get_dailies(player, current_month)

    if not available:
        print("  🎉 ¡No hay misiones diarias pendientes! Prueba un boss fight o MVQ.")
        return

    print(f"\n  📋 MISIONES DISPONIBLES (Mes {current_month})\n")
    for i, q in enumerate(available[:10], 1):
        completed = player.has_completed(q.id)
        print(f"  {q.display(completed)}\n")

    remaining = len(available) - 10
    if remaining > 0:
        print(f"  ... y {remaining} misiones más. Completa las primeras para desbloquear.")


def cmd_quest_detail(player, engine, quest_id):
    quest = engine.get_by_id(quest_id)
    if not quest:
        print(f"  ❌ Misión '{quest_id}' no encontrada.")
        return
    print(quest.display_full())


def cmd_complete(player, engine, quest_id):
    quest = engine.get_by_id(quest_id)
    if not quest:
        print(f"  ❌ Misión '{quest_id}' no encontrada.")
        return

    if player.has_completed(quest_id):
        print(f"  ✅ Ya completaste '{quest.title}'.")
        return

    # Confirmar
    print(f"\n  📋 Completar: {quest.title}")
    print(f"  ✅ Criterio: {quest.acceptance}")
    confirm = input("  ¿Cumples el criterio? (s/n): ").strip().lower()

    if confirm not in ("s", "si", "sí", "y", "yes"):
        print("  ↩ Cancelado. Completa los criterios primero.")
        return

    # Notas opcionales
    notes = input("  📝 Notas breves (Enter para skip): ").strip()

    # Otorgar XP
    xp_gained, leveled_up = player.gain_xp(quest.xp, quest.skill, quest.title)
    player.complete_quest(quest_id)

    # Log
    log_completion(quest, xp_gained, notes)

    # Feedback
    print(f"\n  ✨ ¡Misión completada!")
    print(f"  +{xp_gained} XP ({quest.skill})")

    if leveled_up:
        print(f"\n  🎉🎉🎉 ¡SUBISTE A NIVEL {player.level} — {player.title}! 🎉🎉🎉")

    # GitHub suggestion
    print(f"\n  🐙 Para reflejar en GitHub:")
    print(f"  {get_github_suggestion(quest)}")


def cmd_boss(player, engine):
    current_month = max(1, min(12, (player.level + 1) // 2 + 1))
    bosses = engine.get_boss_fights(player, current_month)

    if not bosses:
        print("  🐉 No hay boss fights disponibles. Completa más misiones diarias.")
        return

    print(f"\n  🐉 BOSS FIGHTS DISPONIBLES\n")
    for q in bosses:
        completed = player.has_completed(q.id)
        print(f"  {q.display(completed)}\n")


def cmd_mvq(player):
    mvq = get_mvq()
    print(f"\n  ⚡ MINIMUM VIABLE QUEST (5 min)")
    print(f"  ─────────────────────────────")
    print(f"  {mvq['title']}")
    print(f"  ⏱ {mvq['duration']} min | XP: {mvq['xp']} | Skill: {mvq['skill']}")

    confirm = input("\n  ¿La hiciste? (s/n): ").strip().lower()
    if confirm in ("s", "si", "sí", "y", "yes"):
        xp_gained, leveled_up = player.gain_xp(mvq["xp"], mvq["skill"], f"MVQ: {mvq['title']}")
        print(f"  ✨ +{xp_gained} XP. Cada paso cuenta.")
        if leveled_up:
            print(f"  🎉 ¡SUBISTE A NIVEL {player.level}!")


def cmd_skills(player):
    print("\n  🌳 ÁRBOL DE HABILIDADES\n")
    for key, info in SKILLS.items():
        lvl = player.get_skill_level(key)
        xp = player.skills.get(key, 0)
        bar = "■" * lvl + "□" * (10 - lvl)
        print(f"  {info['icon']} {info['name']:<24} Lv{lvl:>2} [{bar}]  ({xp} XP)")
        print(f"     {info['desc']}")
        print()


def cmd_streak(player):
    print(f"\n  {get_streak_display(player)}")
    print(f"  Días totales jugados: {player.total_days_played}")
    print(f"  Mejor racha histórica: {player.longest_streak} días")


def cmd_log():
    from game.progress_log import get_recent_log
    entries = get_recent_log(10)
    if not entries:
        print("  📜 Sin actividad registrada todavía.")
        return
    print("\n  📜 ÚLTIMAS MISIONES\n")
    for e in reversed(entries):
        ts = e["timestamp"][:16].replace("T", " ")
        print(f"  [{ts}] {e['quest_title']} (+{e['xp_gained']} XP, {e['skill']})")


def cmd_weekly(player):
    print(get_weekly_summary(player))


def main():
    clear_screen()
    print(BANNER)

    player = Player()
    engine = QuestEngine()

    # Update streak
    player.update_streak()
    player.save()

    # Welcome
    print(get_welcome_message(player))
    print(f"\n  {get_streak_display(player)}")

    stats = engine.get_stats()
    print(f"  📦 {stats['total']} misiones cargadas "
          f"({stats['dailies']} daily, {stats['bosses']} boss, {stats['minis']} mini)")
    print(f"\n  Escribe 'help' para ver los comandos.\n")

    # Game loop
    while True:
        raw = input_prompt()
        if not raw:
            continue

        parts = raw.split(maxsplit=1)
        cmd = parts[0].lower()
        arg = parts[1] if len(parts) > 1 else ""

        if cmd in ("quit", "exit", "q!" ):
            player.save()
            print("\n  💾 Partida guardada. ¡Vuelve mañana!")
            print(f"  {get_streak_display(player)}\n")
            break
        elif cmd in ("help", "h"):
            print(HELP_TEXT)
        elif cmd in ("profile", "p"):
            cmd_profile(player)
        elif cmd in ("quests", "q"):
            cmd_quests(player, engine)
        elif cmd == "quest" and arg:
            cmd_quest_detail(player, engine, arg)
        elif cmd == "complete" and arg:
            cmd_complete(player, engine, arg)
        elif cmd == "boss":
            cmd_boss(player, engine)
        elif cmd == "mvq":
            cmd_mvq(player)
        elif cmd == "skills":
            cmd_skills(player)
        elif cmd == "streak":
            cmd_streak(player)
        elif cmd == "log":
            cmd_log()
        elif cmd == "weekly":
            cmd_weekly(player)
        else:
            print(f"  ❓ Comando no reconocido: '{cmd}'. Escribe 'help'.")


if __name__ == "__main__":
    main()
