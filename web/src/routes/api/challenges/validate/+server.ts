import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import { 
  validateLesson, 
  validateChallenge,
  type LessonData,
  type ChallengeData 
} from "$lib/server/lesson-validator";

export const POST: RequestHandler = async ({ request, locals }) => {
  // Require authentication
  if (!locals.user) {
    return json({ error: "Authentication required" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (type === "lesson") {
      // Validate a single lesson
      const lessonData = data as LessonData & { testRunnerType: string };
      const result = validateLesson(lessonData, lessonData.testRunnerType as any);
      
      return json({
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
      });
    } 
    
    if (type === "challenge") {
      // Validate an entire challenge
      const challengeData = data as ChallengeData;
      const result = validateChallenge(challengeData);
      
      return json({
        valid: result.valid,
        errors: result.errors,
        warnings: result.warnings,
      });
    }

    return json({ error: "Invalid validation type. Use 'lesson' or 'challenge'" }, { status: 400 });
  } catch (err) {
    console.error("Validation API error:", err);
    return json({ error: "Invalid request body" }, { status: 400 });
  }
};
