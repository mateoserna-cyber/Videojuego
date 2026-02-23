import { NextResponse } from 'next/server';

// Mock quests data - in production this would read from YAML files
const MOCK_QUESTS = [
  {
    id: "gcp-intro-001",
    title: "First Steps into the Cloud",
    description: "Begin your journey by understanding the fundamentals of Google Cloud Platform",
    category: "gcp",
    difficulty: "beginner",
    xp_reward: 50,
    skills: { gcp: 10 },
    estimated_time: "2 hours",
    objectives: [
      "Create a GCP account",
      "Explore the GCP Console",
      "Understand basic GCP terminology"
    ],
    resources: [
      "GCP Free Tier documentation",
      "GCP Console walkthrough"
    ],
    completed: false
  },
  {
    id: "data-eng-001",
    title: "Data Pipeline Basics",
    description: "Learn the fundamentals of building data pipelines",
    category: "data_engineering",
    difficulty: "beginner",
    xp_reward: 75,
    skills: { data_engineering: 15 },
    estimated_time: "3 hours",
    objectives: [
      "Understand ETL concepts",
      "Create a simple data pipeline",
      "Process sample data"
    ],
    resources: [
      "ETL fundamentals guide",
      "Sample datasets"
    ],
    completed: false
  },
  {
    id: "ml-intro-001",
    title: "Machine Learning Foundations",
    description: "Introduction to machine learning concepts and algorithms",
    category: "machine_learning",
    difficulty: "intermediate",
    xp_reward: 100,
    skills: { machine_learning: 20 },
    estimated_time: "4 hours",
    objectives: [
      "Learn ML terminology",
      "Understand supervised vs unsupervised learning",
      "Build your first ML model"
    ],
    resources: [
      "ML crash course",
      "Scikit-learn tutorial"
    ],
    completed: false
  },
  {
    id: "devops-001",
    title: "DevOps Essentials",
    description: "Master the basics of DevOps practices and tools",
    category: "devops",
    difficulty: "beginner",
    xp_reward: 60,
    skills: { devops: 12 },
    estimated_time: "2.5 hours",
    objectives: [
      "Understand CI/CD pipelines",
      "Set up version control",
      "Deploy a simple application"
    ],
    resources: [
      "DevOps handbook",
      "GitHub Actions tutorial"
    ],
    completed: false
  },
  {
    id: "portfolio-001",
    title: "Build Your Portfolio",
    description: "Create a professional portfolio to showcase your projects",
    category: "portfolio",
    difficulty: "beginner",
    xp_reward: 80,
    skills: { portfolio: 15 },
    estimated_time: "3 hours",
    objectives: [
      "Design portfolio layout",
      "Document your projects",
      "Deploy portfolio website"
    ],
    resources: [
      "Portfolio best practices",
      "Vercel deployment guide"
    ],
    completed: false
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty');
  
  let filteredQuests = [...MOCK_QUESTS];
  
  if (category) {
    filteredQuests = filteredQuests.filter(q => q.category === category);
  }
  
  if (difficulty) {
    filteredQuests = filteredQuests.filter(q => q.difficulty === difficulty);
  }
  
  return NextResponse.json(filteredQuests);
}
