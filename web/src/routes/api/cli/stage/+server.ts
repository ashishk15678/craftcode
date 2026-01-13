import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyCliToken } from '$lib/server/auth';
import { db } from '$lib/server/db';

export const GET: RequestHandler = async ({ request }) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return json({ error: 'Token required' }, { status: 401 });
  }

  const user = await verifyCliToken(token);
  if (!user) {
    return json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  // Get user's current challenge progress to determine current stage
  // For now, get the first incomplete stage from any challenge they're working on
  const progress = await db.userProgress.findMany({
    where: { userId: user.id },
    include: {
      stage: {
        include: {
          challenge: true
        }
      }
    },
    orderBy: { completedAt: 'desc' },
    take: 1
  });

  // Find the next stage for this challenge, or first stage if new
  let currentStage;
  
  if (progress.length > 0) {
    const lastChallenge = progress[0].stage.challenge;
    const lastStageOrder = progress[0].stage.order;

    currentStage = await db.stage.findFirst({
      where: {
        challengeId: lastChallenge.id,
        order: lastStageOrder + 1
      },
      include: {
        challenge: {
          select: { title: true, slug: true }
        }
      }
    });

    // If no next stage, challenge is complete
    if (!currentStage) {
      return json({
        message: 'Challenge complete!',
        challengeComplete: true,
        challenge: {
          title: lastChallenge.title,
          slug: lastChallenge.slug
        }
      });
    }
  } else {
    // No progress, get first stage of a challenge
    // You'd typically want to specify which challenge via query param
    const url = new URL(request.url);
    const challengeSlug = url.searchParams.get('challenge');

    if (challengeSlug) {
      const challenge = await db.challenge.findUnique({
        where: { slug: challengeSlug },
        include: {
          stages: {
            where: { order: 1 },
            take: 1
          }
        }
      });

      if (challenge && challenge.stages.length > 0) {
        currentStage = {
          ...challenge.stages[0],
          challenge: { title: challenge.title, slug: challenge.slug }
        };
      }
    }

    if (!currentStage) {
      return json({
        error: 'No active challenge. Start a challenge on the website first.',
        noChallenge: true
      }, { status: 404 });
    }
  }

  return json({
    stage: {
      id: currentStage.id,
      order: currentStage.order,
      title: currentStage.title,
      challengeTitle: currentStage.challenge.title,
      challengeSlug: currentStage.challenge.slug,
      testScript: currentStage.testScript || null,
      testScriptUrl: currentStage.testScriptUrl || null
    }
  });
};
