"""
GCP Quest — Quest Engine
Carga misiones desde YAML, filtra por disponibilidad, y gestiona completado.
"""
import os
from pathlib import Path
from typing import List, Optional

try:
    import yaml
except ImportError:
    yaml = None

QUESTS_DIR = Path(__file__).parent.parent / "quests"


def _parse_yaml(filepath: Path) -> list:
    """Parsea un archivo YAML de misiones."""
    if yaml:
        with open(filepath, "r", encoding="utf-8") as f:
            data = yaml.safe_load(f)
        return data if isinstance(data, list) else [data]
    else:
        # Fallback básico sin PyYAML
        return _parse_yaml_basic(filepath)


def _parse_yaml_basic(filepath: Path) -> list:
    """Parser YAML ultra-básico para no depender de PyYAML."""
    quests = []
    current = {}
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.rstrip()
            if line.startswith("- id:"):
                if current:
                    quests.append(current)
                current = {"id": line.split(":", 1)[1].strip().strip('"')}
            elif line.startswith("  ") and ":" in line and current:
                key, val = line.strip().split(":", 1)
                val = val.strip().strip('"').strip("'")
                # Intentar convertir números
                if val.isdigit():
                    val = int(val)
                elif val in ("true", "True"):
                    val = True
                elif val in ("false", "False"):
                    val = False
                current[key.strip()] = val
    if current:
        quests.append(current)
    return quests


class Quest:
    """Representa una misión individual."""

    def __init__(self, data: dict):
        self.id = data.get("id", "unknown")
        self.title = data.get("title", "Sin título")
        self.description = data.get("description", "")
        self.type = data.get("type", "daily")  # daily, boss, mini, project
        self.xp = data.get("xp", 50)
        self.skill = data.get("skill", "gcp_cloud")
        self.duration_min = data.get("duration_min", 20)
        self.month = data.get("month", 1)
        self.week = data.get("week", 1)
        self.day = data.get("day", 0)  # 0 = cualquier día de la semana
        self.requires = data.get("requires", "")  # ID de quest prerequisito
        self.acceptance = data.get("acceptance", "Completar la tarea")
        self.output = data.get("output", "")  # Qué se debe producir
        self.github_hint = data.get("github_hint", "")
        self.is_mvq = data.get("is_mvq", False)  # Minimum Viable Quest
        self.tags = data.get("tags", "").split(",") if data.get("tags") else []

    @property
    def type_icon(self) -> str:
        icons = {
            "daily": "📋",
            "boss": "🐉",
            "mini": "⚡",
            "project": "🏗️",
        }
        return icons.get(self.type, "📋")

    @property
    def difficulty_bar(self) -> str:
        if self.xp <= 30:
            return "●○○○○"
        elif self.xp <= 75:
            return "●●○○○"
        elif self.xp <= 150:
            return "●●●○○"
        elif self.xp <= 350:
            return "●●●●○"
        else:
            return "●●●●●"

    def display(self, completed: bool = False) -> str:
        status = "✅" if completed else "⬜"
        return (
            f"{status} {self.type_icon} [{self.id}] {self.title}\n"
            f"   Skill: {self.skill} | XP: {self.xp} | "
            f"⏱ {self.duration_min}min | Dificultad: {self.difficulty_bar}\n"
            f"   {self.description}\n"
            f"   📎 Criterio: {self.acceptance}"
        )

    def display_full(self) -> str:
        lines = [
            f"{'═' * 56}",
            f"  {self.type_icon}  {self.title}",
            f"{'═' * 56}",
            f"  ID: {self.id}",
            f"  Tipo: {self.type} | Skill: {self.skill}",
            f"  XP: {self.xp} | Duración: {self.duration_min} min",
            f"  Dificultad: {self.difficulty_bar}",
            f"{'─' * 56}",
            f"  📝 Descripción:",
            f"  {self.description}",
            "",
            f"  ✅ Criterio de aprobación:",
            f"  {self.acceptance}",
        ]
        if self.output:
            lines.extend(["", f"  📦 Output esperado:", f"  {self.output}"])
        if self.github_hint:
            lines.extend(["", f"  🐙 GitHub:", f"  {self.github_hint}"])
        if self.requires:
            lines.extend(["", f"  🔗 Requisito: completar {self.requires} primero"])
        lines.append(f"{'═' * 56}")
        return "\n".join(lines)


class QuestEngine:
    """Motor de misiones: carga, filtra y gestiona."""

    def __init__(self):
        self.all_quests: List[Quest] = []
        self._load_all()

    def _load_all(self):
        """Carga todas las misiones de todos los meses."""
        if not QUESTS_DIR.exists():
            return
        for month_dir in sorted(QUESTS_DIR.iterdir()):
            if month_dir.is_dir() and month_dir.name.startswith("month_"):
                for quest_file in sorted(month_dir.glob("*.yml")):
                    try:
                        quests_data = _parse_yaml(quest_file)
                        for qd in quests_data:
                            self.all_quests.append(Quest(qd))
                    except Exception as e:
                        print(f"  ⚠ Error cargando {quest_file}: {e}")

    def get_available(self, player, month: int = None) -> List[Quest]:
        """Misiones disponibles (no completadas, requisitos cumplidos)."""
        available = []
        for q in self.all_quests:
            if player.has_completed(q.id):
                continue
            if month and q.month > month:
                continue
            if q.requires and not player.has_completed(q.requires):
                continue
            available.append(q)
        return available

    def get_by_id(self, quest_id: str) -> Optional[Quest]:
        for q in self.all_quests:
            if q.id == quest_id:
                return q
        return None

    def get_dailies(self, player, month: int = None) -> List[Quest]:
        """Solo misiones diarias disponibles."""
        return [q for q in self.get_available(player, month) if q.type == "daily"]

    def get_boss_fights(self, player, month: int = None) -> List[Quest]:
        """Solo boss fights disponibles."""
        return [q for q in self.get_available(player, month) if q.type == "boss"]

    def get_minis(self, player, month: int = None) -> List[Quest]:
        """Solo mini quests (MVQ)."""
        return [q for q in self.get_available(player, month) if q.type == "mini" or q.is_mvq]

    def get_month_progress(self, player, month: int) -> dict:
        """Progreso del mes: completadas / total."""
        month_quests = [q for q in self.all_quests if q.month == month]
        completed = [q for q in month_quests if player.has_completed(q.id)]
        return {
            "total": len(month_quests),
            "completed": len(completed),
            "pct": (len(completed) / len(month_quests) * 100) if month_quests else 0,
        }

    def get_stats(self) -> dict:
        """Estadísticas generales del quest pool."""
        return {
            "total": len(self.all_quests),
            "dailies": len([q for q in self.all_quests if q.type == "daily"]),
            "bosses": len([q for q in self.all_quests if q.type == "boss"]),
            "minis": len([q for q in self.all_quests if q.type == "mini"]),
            "projects": len([q for q in self.all_quests if q.type == "project"]),
        }
