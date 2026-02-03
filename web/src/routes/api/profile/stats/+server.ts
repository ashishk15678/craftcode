// Profile Statistics API Endpoint
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { db } from "$lib/server/db";

export const GET: RequestHandler = async ({ locals }) => {
  if (!locals.user) {
    return json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = locals.user.id;

  // Get or create user statistics
  let stats = await db.userStatistics.findUnique({
    where: { userId },
  });

  if (!stats) {
    stats = await db.userStatistics.create({
      data: { userId },
    });
  }

  // Get completed courses grouped by type
  const completedLessons = await db.userProgress.findMany({
    where: { userId },
    include: {
      lesson: {
        include: {
          course: true,
        },
      },
    },
  });

  // Group by course and count completions
  const courseProgress = new Map<string, { course: any; completedLessons: number; totalLessons: number }>();
  
  for (const progress of completedLessons) {
    const courseId = progress.lesson.courseId;
    if (!courseProgress.has(courseId)) {
      const totalLessons = await db.lesson.count({
        where: { courseId },
      });
      courseProgress.set(courseId, {
        course: progress.lesson.course,
        completedLessons: 0,
        totalLessons,
      });
    }
    const entry = courseProgress.get(courseId)!;
    entry.completedLessons++;
  }

  // Get completed courses (100% progress)
  const completedCourses = Array.from(courseProgress.values())
    .filter(cp => cp.completedLessons === cp.totalLessons)
    .map(cp => cp.course);

  // Get earned achievements
  const achievements = await db.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true,
    },
    orderBy: {
      unlockedAt: "desc",
    },
  });

  // Get creator stats if applicable
  let creatorStats = null;
  if (locals.user.isCreator) {
    const publishedCourses = await db.course.count({
      where: {
        authorId: userId,
        isPublished: true,
      },
    });

    // Count total enrollments (unique users who started any lesson)
    const enrollments = await db.userProgress.groupBy({
      by: ["userId"],
      where: {
        lesson: {
          course: {
            authorId: userId,
          },
        },
      },
    });

    creatorStats = {
      publishedCourses,
      totalEnrollments: enrollments.length,
    };
  }

  // Calculate activity data (last 90 days)
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const recentActivity = await db.userProgress.groupBy({
    by: ["completedAt"],
    where: {
      userId,
      completedAt: {
        gte: ninetyDaysAgo,
      },
    },
    _count: true,
  });

  // Format activity data for calendar
  const activityMap = new Map<string, number>();
  for (const activity of recentActivity) {
    const date = activity.completedAt.toISOString().split("T")[0];
    activityMap.set(date, (activityMap.get(date) || 0) + activity._count);
  }

  return json({
    statistics: stats,
    completedCourses,
    achievements: achievements.map(a => ({
      ...a.achievement,
      unlockedAt: a.unlockedAt,
    })),
    creatorStats,
    activityData: Object.fromEntries(activityMap),
  });
};
