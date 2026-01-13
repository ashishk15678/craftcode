import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyCliToken } from '$lib/server/auth';
import { db } from '$lib/server/db';

export const POST: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return json({ error: 'Token required' }, { status: 401 });
  }

  const user = await verifyCliToken(token);
  if (!user) {
    return json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const stageId = body.stageId;

  if (!stageId) {
    return json({ error: 'stageId is required' }, { status: 400 });
  }

  // Verify stage exists
  const stage = await db.stage.findUnique({
    where: { id: stageId },
    include: {
      challenge: {
        select: { id: true, title: true, slug: true }
      }
    }
  });

  if (!stage) {
    return json({ error: 'Stage not found' }, { status: 404 });
  }

  // Check if already completed
  const existing = await db.userProgress.findUnique({
    where: {
      userId_stageId: {
        userId: user.id,
        stageId
      }
    }
  });

  if (existing) {
    return json({
      message: 'Stage already completed',
      alreadyCompleted: true
    });
  }

  // Create progress record
  await db.userProgress.create({
    data: {
      userId: user.id,
      stageId
    }
  });

  // Check if this was the last stage
  const nextStage = await db.stage.findFirst({
    where: {
      challengeId: stage.challenge.id,
      order: stage.order + 1
    }
  });

  const totalStages = await db.stage.count({
    where: { challengeId: stage.challenge.id }
  });

  const completedStages = await db.userProgress.count({
    where: {
      userId: user.id,
      stage: { challengeId: stage.challenge.id }
    }
  });

  return json({
    success: true,
    message: `Stage ${stage.order} completed!`,
    progress: {
      completed: completedStages,
      total: totalStages
    },
    challengeComplete: !nextStage,
    nextStage: nextStage ? {
      id: nextStage.id,
      order: nextStage.order,
      title: nextStage.title
    } : null
  });
};
