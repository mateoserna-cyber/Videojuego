import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const SAVE_DIR = join(process.cwd(), 'save_data');
const PLAYER_FILE = join(SAVE_DIR, 'player_save.json');

interface PlayerData {
  name: string;
  level: number;
  xp: number;
  xp_to_next_level: number;
  skills: {
    gcp: number;
    data_engineering: number;
    machine_learning: number;
    devops: number;
    portfolio: number;
  };
  completed_quests: string[];
  current_quest: string | null;
  streak_days: number;
  last_activity: string;
  total_quests_completed: number;
}

const DEFAULT_PLAYER: PlayerData = {
  name: "Cloud Adventurer",
  level: 1,
  xp: 0,
  xp_to_next_level: 100,
  skills: {
    gcp: 0,
    data_engineering: 0,
    machine_learning: 0,
    devops: 0,
    portfolio: 0
  },
  completed_quests: [],
  current_quest: null,
  streak_days: 0,
  last_activity: new Date().toISOString(),
  total_quests_completed: 0
};

export async function GET() {
  try {
    console.log('[v0] Reading player file from:', PLAYER_FILE);
    const data = await readFile(PLAYER_FILE, 'utf-8');
    const player = JSON.parse(data);
    console.log('[v0] Player data loaded:', player.name);
    return NextResponse.json(player);
  } catch (error) {
    console.log('[v0] Player file not found, using defaults');
    // If file doesn't exist, return default player
    return NextResponse.json(DEFAULT_PLAYER);
  }
}

export async function POST(request: Request) {
  try {
    const playerData = await request.json();
    
    // Ensure save directory exists
    try {
      await mkdir(SAVE_DIR, { recursive: true });
    } catch (e) {
      // Directory might already exist
    }
    
    // Write player data
    await writeFile(PLAYER_FILE, JSON.stringify(playerData, null, 2));
    
    return NextResponse.json({ success: true, player: playerData });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save player data' },
      { status: 500 }
    );
  }
}
