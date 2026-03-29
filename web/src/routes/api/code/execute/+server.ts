import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { executeCode, executeCodeSync, LANGUAGE_IDS } from '$lib/server/judge0';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const { code, language, stdin, sync } = await request.json();

        if (!code || !language) {
            return json({ error: 'Missing required fields: code and language' }, { status: 400 });
        }

        const languageId = LANGUAGE_IDS[language.toLowerCase()];
        if (!languageId) {
            return json({ 
                error: `Unsupported language: ${language}. Supported languages: ${Object.keys(LANGUAGE_IDS).join(', ')}` 
            }, { status: 400 });
        }

        console.log('[API] Executing code:', { language, languageId, codeLength: code.length });

        // Use sync mode for simpler execution (may timeout on busy server)
        // Use async mode for more reliable execution
        const result = sync 
            ? await executeCodeSync({
                sourceCode: code,
                languageId,
                stdin: stdin || '',
            })
            : await executeCode({
                sourceCode: code,
                languageId,
                stdin: stdin || '',
            });

        console.log('[API] Execution result:', result.status);

        return json({
            success: result.status?.id === 3,
            status: result.status,
            stdout: result.stdout,
            stderr: result.stderr,
            compileOutput: result.compileOutput,
            message: result.message,
            time: result.time,
            memory: result.memory,
            exitCode: result.exitCode,
            token: result.token,
        });
    } catch (error) {
        console.error('[API] Code execution error:', error);
        return json({ 
            error: error instanceof Error ? error.message : 'Execution failed',
            status: { id: 13, description: 'Internal Error' }
        }, { status: 500 });
    }
};
