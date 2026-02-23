'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Trophy, 
  Zap, 
  Target, 
  TrendingUp, 
  Flame,
  BookOpen,
  Code,
  Database,
  Brain,
  Rocket,
  CheckCircle2,
  Clock
} from 'lucide-react';

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

interface Quest {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  xp_reward: number;
  skills: Record<string, number>;
  estimated_time: string;
  objectives: string[];
  resources: string[];
  completed: boolean;
}

const skillIcons: Record<string, any> = {
  gcp: Code,
  data_engineering: Database,
  machine_learning: Brain,
  devops: Rocket,
  portfolio: BookOpen
};

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
  intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  advanced: 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function Dashboard() {
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [playerRes, questsRes] = await Promise.all([
          fetch('/api/player'),
          fetch('/api/quests')
        ]);
        
        const playerData = await playerRes.json();
        const questsData = await questsRes.json();
        
        setPlayer(playerData);
        setQuests(questsData);
      } catch (error) {
        console.error('[v0] Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, []);

  if (loading || !player) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-pulse-glow text-primary text-6xl mb-4">⚡</div>
          <p className="text-muted-foreground">Loading your quest data...</p>
        </div>
      </div>
    );
  }

  const xpPercentage = (player.xp / player.xp_to_next_level) * 100;
  const filteredQuests = selectedCategory 
    ? quests.filter(q => q.category === selectedCategory)
    : quests;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-balance">GCP Quest Dashboard</h1>
                <p className="text-sm text-muted-foreground">Level up your cloud skills</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-accent" />
                {player.streak_days} day streak
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Player Stats Section */}
        <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Level Card */}
          <Card className="border-primary/20 bg-gradient-to-br from-card to-card/50">
            <CardHeader className="pb-3">
              <CardDescription>Current Level</CardDescription>
              <CardTitle className="text-4xl font-bold text-primary">
                {player.level}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">XP Progress</span>
                  <span className="font-mono text-foreground">
                    {player.xp}/{player.xp_to_next_level}
                  </span>
                </div>
                <Progress value={xpPercentage} className="h-2" />
              </div>
            </CardContent>
          </Card>

          {/* Total XP Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Total Experience
              </CardDescription>
              <CardTitle className="text-3xl font-bold">{player.xp}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {player.xp_to_next_level - player.xp} XP to next level
              </p>
            </CardContent>
          </Card>

          {/* Quests Completed Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                Quests Completed
              </CardDescription>
              <CardTitle className="text-3xl font-bold">
                {player.total_quests_completed}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Keep pushing forward!
              </p>
            </CardContent>
          </Card>

          {/* Streak Card */}
          <Card className="border-accent/20">
            <CardHeader className="pb-3">
              <CardDescription className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-accent" />
                Current Streak
              </CardDescription>
              <CardTitle className="text-3xl font-bold text-accent">
                {player.streak_days} days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Don't break the chain!
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Skill Tree
            </CardTitle>
            <CardDescription>Track your progress across different domains</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Object.entries(player.skills).map(([skill, value]) => {
                const Icon = skillIcons[skill] || Code;
                const percentage = Math.min((value / 100) * 100, 100);
                
                return (
                  <div key={skill} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium capitalize">
                          {skill.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <span className="text-sm font-mono text-muted-foreground">
                        {value}/100
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quests Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-balance">Available Quests</h2>
              <p className="text-muted-foreground">Choose your next adventure</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedCategory === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(null)}
              >
                All
              </Button>
              {Object.keys(player.skills).map(skill => (
                <Button
                  key={skill}
                  variant={selectedCategory === skill ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(skill)}
                >
                  {skill.replace(/_/g, ' ').split(' ').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredQuests.map((quest) => {
              const Icon = skillIcons[quest.category] || Code;
              
              return (
                <Card 
                  key={quest.id} 
                  className="hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <Badge 
                        variant="outline" 
                        className={difficultyColors[quest.difficulty]}
                      >
                        {quest.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-balance">{quest.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {quest.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {quest.estimated_time}
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-accent">
                          <Zap className="w-4 h-4" />
                          +{quest.xp_reward} XP
                        </span>
                      </div>
                      
                      <div className="pt-2">
                        <p className="text-xs text-muted-foreground mb-2">Objectives:</p>
                        <ul className="space-y-1">
                          {quest.objectives.slice(0, 2).map((obj, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs">
                              <CheckCircle2 className="w-3 h-3 mt-0.5 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground">{obj}</span>
                            </li>
                          ))}
                          {quest.objectives.length > 2 && (
                            <li className="text-xs text-muted-foreground ml-5">
                              +{quest.objectives.length - 2} more...
                            </li>
                          )}
                        </ul>
                      </div>
                      
                      <Button className="w-full mt-4">
                        Start Quest
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
