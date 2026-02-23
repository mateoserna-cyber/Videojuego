"""
GCP Quest — Player Profile
Maneja XP, niveles, habilidades y persistencia del jugador.
"""
import json
import os
from datetime import datetime, date
from pathlib import Path

SAVE_DIR = Path(__file__).parent.parent / "save_data"
SAVE_FILE = SAVE_DIR / "player_save.json"

LEVEL_TABLE = [
    (1, 0, "Novato"),
    (2, 500, "Aprendiz"),
    (3, 1_500, "Practicante"),
    (4, 3_500, "Artesano"),
    (5, 7_000, "Junior"),
    (6, 12_000, "Profesional"),
    (7, 20_000, "Especialista"),
    (8, 32_000, "Senior"),
    (9, 50_000, "Experto"),
    (10, 75_000, "Maestro"),
]

SKILLS = {
    "data_engineering": {"name": "Data Engineering", "icon": "🔧", "desc": "Ingesta, ETL, calidad, gobernanza"},
    "data_science": {"name": "Data Science", "icon": "📊", "desc": "EDA, features, métricas, storytelling"},
    "ml_mlops": {"name": "ML / MLOps", "icon": "🤖", "desc": "Vertex AI, pipelines, registry, monitoring"},
    "rag_llm": {"name": "RAG / LLM Apps", "icon": "🧠", "desc": "Embeddings, vector DB, evaluación, agentes"},
    "gcp_cloud": {"name": "GCP / Cloud", "icon": "☁️", "desc": "IAM, networking, IaC, Cloud Run, GKE"},
    "finops_security": {"name": "FinOps + Security", "icon": "🔒", "desc": "Costos, budgets, OWASP, privacidad"},
    "leadership": {"name": "Liderazgo + Contenido", "icon": "🎯", "desc": "Blog, talks, documentación, teaching"},
}

SKILL_LEVEL_XP = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500]  # XP por nivel de skill (1-10)


class Player:
    def __init__(self):
        self.name = "Mateo"
        self.xp = 0
        self.skills = {k: 0 for k in SKILLS}  # XP por skill
        self.completed_quests = []  # IDs de misiones completadas
        self.streak_days = 0
        self.last_play_date = None
        self.total_days_played = 0
        self.longest_streak = 0
        self.journal = []  # Entradas de diario
        self.created_at = datetime.now().isoformat()
        self._load()

    def _load(self):
        """Carga partida guardada si existe."""
        if SAVE_FILE.exists():
            try:
                data = json.loads(SAVE_FILE.read_text())
                self.name = data.get("name", self.name)
                self.xp = data.get("xp", 0)
                self.skills = data.get("skills", self.skills)
                self.completed_quests = data.get("completed_quests", [])
                self.streak_days = data.get("streak_days", 0)
                self.last_play_date = data.get("last_play_date")
                self.total_days_played = data.get("total_days_played", 0)
                self.longest_streak = data.get("longest_streak", 0)
                self.journal = data.get("journal", [])
                self.created_at = data.get("created_at", self.created_at)
            except (json.JSONDecodeError, KeyError):
                pass  # Empezar de cero si el archivo está corrupto

    def save(self):
        """Persiste el estado actual."""
        SAVE_DIR.mkdir(parents=True, exist_ok=True)
        data = {
            "name": self.name,
            "xp": self.xp,
            "skills": self.skills,
            "completed_quests": self.completed_quests,
            "streak_days": self.streak_days,
            "last_play_date": self.last_play_date,
            "total_days_played": self.total_days_played,
            "longest_streak": self.longest_streak,
            "journal": self.journal[-100:],  # Últimas 100 entradas
            "created_at": self.created_at,
        }
        SAVE_FILE.write_text(json.dumps(data, indent=2, ensure_ascii=False))

    @property
    def level(self) -> int:
        for lvl, xp_req, _ in reversed(LEVEL_TABLE):
            if self.xp >= xp_req:
                return lvl
        return 1

    @property
    def title(self) -> str:
        for lvl, xp_req, title in reversed(LEVEL_TABLE):
            if self.xp >= xp_req:
                return title
        return "Novato"

    @property
    def xp_to_next_level(self) -> int:
        current = self.level
        if current >= 10:
            return 0
        next_xp = LEVEL_TABLE[current][1]  # index = current level (0-indexed +1)
        return next_xp - self.xp

    @property
    def xp_progress_pct(self) -> float:
        current = self.level
        if current >= 10:
            return 100.0
        current_threshold = LEVEL_TABLE[current - 1][1]
        next_threshold = LEVEL_TABLE[current][1]
        span = next_threshold - current_threshold
        if span == 0:
            return 100.0
        progress = self.xp - current_threshold
        return min(100.0, (progress / span) * 100)

    @property
    def streak_bonus(self) -> float:
        """Bonus de racha: +10% por día, máximo +50%."""
        return min(0.5, self.streak_days * 0.1)

    def update_streak(self):
        """Actualiza la racha basándose en la fecha actual."""
        today = date.today().isoformat()
        if self.last_play_date is None:
            self.streak_days = 1
            self.total_days_played = 1
        elif self.last_play_date == today:
            pass  # Ya jugó hoy
        else:
            last = date.fromisoformat(self.last_play_date)
            diff = (date.today() - last).days
            if diff == 1:
                self.streak_days += 1
            elif diff == 2:
                pass  # 1 día de gracia, mantiene racha
            else:
                self.streak_days = 1  # Reset sin penalización
            self.total_days_played += 1

        self.last_play_date = today
        self.longest_streak = max(self.longest_streak, self.streak_days)

    def gain_xp(self, amount: int, skill_key: str = None, reason: str = ""):
        """Gana XP con bonus de racha. Opcionalmente asigna a un skill."""
        bonus = self.streak_bonus
        total = int(amount * (1 + bonus))

        old_level = self.level
        self.xp += total

        if skill_key and skill_key in self.skills:
            self.skills[skill_key] += total

        # Log
        entry = {
            "date": datetime.now().isoformat(),
            "xp_base": amount,
            "xp_bonus": total - amount,
            "xp_total": total,
            "skill": skill_key,
            "reason": reason,
        }
        self.journal.append(entry)

        new_level = self.level
        leveled_up = new_level > old_level

        self.save()
        return total, leveled_up

    def complete_quest(self, quest_id: str):
        """Marca una misión como completada."""
        if quest_id not in self.completed_quests:
            self.completed_quests.append(quest_id)
            self.save()

    def has_completed(self, quest_id: str) -> bool:
        return quest_id in self.completed_quests

    def get_skill_level(self, skill_key: str) -> int:
        """Nivel de un skill específico (1-10)."""
        xp = self.skills.get(skill_key, 0)
        for i in range(len(SKILL_LEVEL_XP) - 1, -1, -1):
            if xp >= SKILL_LEVEL_XP[i]:
                return i + 1
        return 1

    def get_profile_card(self) -> str:
        """Genera la tarjeta de perfil visual."""
        bar_width = 30
        filled = int(self.xp_progress_pct / 100 * bar_width)
        bar = "█" * filled + "░" * (bar_width - filled)

        lines = [
            "╔══════════════════════════════════════════════════╗",
            f"║  👤 {self.name:<20} Nivel {self.level} — {self.title:<14}║",
            "╠══════════════════════════════════════════════════╣",
            f"║  XP: {self.xp:>6} / {LEVEL_TABLE[min(self.level, 9)][1]:<6}  [{bar}]  ║",
            f"║  🔥 Racha: {self.streak_days} días (bonus +{int(self.streak_bonus*100)}%)  "
            f"Mejor: {self.longest_streak}       ║",
            f"║  📅 Días jugados: {self.total_days_played:<5}  "
            f"Misiones: {len(self.completed_quests):<5}       ║",
            "╠══════════════════════════════════════════════════╣",
            "║  HABILIDADES                                     ║",
        ]

        for key, info in SKILLS.items():
            slvl = self.get_skill_level(key)
            sbar = "■" * slvl + "□" * (10 - slvl)
            lines.append(
                f"║  {info['icon']} {info['name']:<22} Lv{slvl:>2} [{sbar}] ║"
            )

        lines.append("╚══════════════════════════════════════════════════╝")
        return "\n".join(lines)
