// Seed script to populate initial achievements
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const INITIAL_ACHIEVEMENTS = [
  {
    key: "first_course",
    name: "First Steps",
    description: "Complete your first course",
    category: "progress",
    threshold: 1,
  },
  {
    key: "complete_5",
    name: "Learning Enthusiast",
    description: "Complete 5 courses",
    category: "progress",
    threshold: 5,
  },
  {
    key: "complete_10",
    name: "Knowledge Seeker",
    description: "Complete 10 courses",
    category: "progress",
    threshold: 10,
  },
  {
    key: "complete_25",
    name: "Master Learner",
    description: "Complete 25 courses",
    category: "progress",
    threshold: 25,
  },
  {
    key: "streak_3",
    name: "Getting Started",
    description: "Maintain a 3-day learning streak",
    category: "streak",
    threshold: 3,
  },
  {
    key: "streak_7",
    name: "Week Warrior",
    description: "Maintain a 7-day learning streak",
    category: "streak",
    threshold: 7,
  },
  {
    key: "streak_30",
    name: "Monthly Master",
    description: "Maintain a 30-day learning streak",
    category: "streak",
    threshold: 30,
  },
  {
    key: "streak_100",
    name: "Century Club",
    description: "Maintain a 100-day learning streak",
    category: "streak",
    threshold: 100,
  },
  {
    key: "first_publish",
    name: "Creator Debut",
    description: "Publish your first course",
    category: "creator",
    threshold: 1,
  },
  {
    key: "publish_5",
    name: "Prolific Creator",
    description: "Publish 5 courses",
    category: "creator",
    threshold: 5,
  },
  {
    key: "enrollments_100",
    name: "Popular Educator",
    description: "Reach 100 total enrollments",
    category: "creator",
    threshold: 100,
  },
  {
    key: "challenge_master",
    name: "Challenge Master",
    description: "Complete 10 challenge-type courses",
    category: "progress",
    threshold: 10,
  },
  {
    key: "tutorial_expert",
    name: "Tutorial Expert",
    description: "Complete 10 tutorial-type courses",
    category: "progress",
    threshold: 10,
  },
  {
    key: "competitive_champion",
    name: "Competitive Champion",
    description: "Complete 10 competitive programming problems",
    category: "progress",
    threshold: 10,
  },
];

async function main() {
  console.log("Seeding achievements...");

  for (const achievement of INITIAL_ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log(`✓ Seeded ${INITIAL_ACHIEVEMENTS.length} achievements`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
