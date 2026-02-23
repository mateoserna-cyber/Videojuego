# Quest Dashboard - Frontend

Web interface for the GCP Learning RPG game.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Features

- **Player Dashboard**: View your level, XP, skills, and streak
- **Quest Browser**: Browse and filter available quests
- **Skill Tree**: Track progress across 5 skill categories
- **Real-time Updates**: Syncs with the same data files used by the Python CLI

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Shadcn UI Components

## API Routes

- `GET /api/player` - Get player data from save_data/player_save.json
- `GET /api/quests` - Get available quests from quests/ directory
- `POST /api/player` - Update player data

## Development

The web app reads from the same JSON files as the Python CLI, so both can be used interchangeably.
