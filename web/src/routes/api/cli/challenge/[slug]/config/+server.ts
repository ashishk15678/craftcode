import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { verifyCliToken } from '$lib/server/cli-auth';
import { db } from '$lib/server/db';

interface EnvironmentConfig {
  type: string;
  version?: string;
  compiler?: string;
  compilerFlags?: string[];
  linkerFlags?: string[];
  sourceFiles?: string[];
  headerFiles?: string[];
  outputBinary?: string;
  buildDir?: string;
  entryPoint?: string;
  packageManager?: string;
  installCommand?: string;
  runCommand?: string;
}

interface CraftCodeConfig {
  $schema: string;
  version: string;
  challenge: {
    id: string;
    slug: string;
    title: string;
    lessonId: string;
    lessonOrder: number;
    lessonTitle: string;
  };
  environment: EnvironmentConfig;
  build: {
    command: string;
    timeout: number;
  };
  testing: {
    serverUrl: string;
    testEndpoint: string;
    resultEndpoint: string;
    timeout: number;
    stopOnFirstFailure: boolean;
  };
  scaffold?: {
    files: Array<{
      path: string;
      content: string;
    }>;
  };
}

// Default environment configs by type
const defaultEnvironments: Record<string, EnvironmentConfig> = {
  C: {
    type: 'c',
    version: 'c17',
    compiler: 'gcc',
    compilerFlags: ['-Wall', '-Wextra', '-O2', '-std=c17'],
    linkerFlags: [],
    sourceFiles: ['*.c'],
    headerFiles: ['*.h'],
    outputBinary: './solution'
  },
  CPP: {
    type: 'cpp',
    version: 'c++20',
    compiler: 'g++',
    compilerFlags: ['-Wall', '-Wextra', '-O2', '-std=c++20'],
    linkerFlags: [],
    sourceFiles: ['*.cpp', '*.cc'],
    headerFiles: ['*.hpp', '*.h'],
    outputBinary: './solution'
  },
  NODE: {
    type: 'node',
    version: '20',
    entryPoint: 'index.js',
    packageManager: 'npm',
    installCommand: 'npm install',
    runCommand: 'node index.js'
  },
  PYTHON: {
    type: 'python',
    version: '3.12',
    entryPoint: 'main.py',
    installCommand: 'pip install -r requirements.txt',
    runCommand: 'python main.py'
  },
  RUST: {
    type: 'rust',
    version: 'stable',
    outputBinary: './target/release/solution',
    runCommand: 'cargo run --release'
  },
  GO: {
    type: 'go',
    version: '1.21',
    entryPoint: 'main.go',
    outputBinary: './solution',
    runCommand: 'go run .'
  },
  BASH: {
    type: 'bash',
    entryPoint: 'solution.sh',
    runCommand: 'bash solution.sh'
  }
};

// Scaffold templates
const scaffoldTemplates: Record<string, Array<{ path: string; content: string }>> = {
  C: [{
    path: 'main.c',
    content: `#include <stdio.h>

int main(int argc, char *argv[]) {
    // Your solution here
    printf("Hello, CraftCode!\\n");
    return 0;
}
`
  }],
  CPP: [{
    path: 'main.cpp',
    content: `#include <iostream>

int main(int argc, char *argv[]) {
    // Your solution here
    std::cout << "Hello, CraftCode!" << std::endl;
    return 0;
}
`
  }],
  NODE: [{
    path: 'index.js',
    content: `// Your solution here
console.log('Hello, CraftCode!');
`
  }, {
    path: 'package.json',
    content: `{
  "name": "craftcode-solution",
  "version": "1.0.0",
  "type": "module",
  "main": "index.js"
}
`
  }],
  PYTHON: [{
    path: 'main.py',
    content: `#!/usr/bin/env python3
# Your solution here

def main():
    print("Hello, CraftCode!")

if __name__ == "__main__":
    main()
`
  }]
};

function generateBuildCommand(envType: string, config: EnvironmentConfig): string {
  switch (envType) {
    case 'C':
    case 'CPP': {
      const compiler = config.compiler || (envType === 'C' ? 'gcc' : 'g++');
      const flags = config.compilerFlags?.join(' ') || '';
      const linkerFlags = config.linkerFlags?.join(' ') || '';
      const sources = (config.sourceFiles || ['*.c']).join(' ');
      const output = config.outputBinary || './solution';
      return `${compiler} ${flags} ${sources} ${linkerFlags} -o ${output}`.trim();
    }
    case 'NODE':
      return config.installCommand || 'npm install';
    case 'PYTHON':
      return config.installCommand || 'pip install -r requirements.txt';
    case 'RUST':
      return 'cargo build --release';
    case 'GO':
      return 'go build -o solution .';
    default:
      return 'echo "No build step required"';
  }
}

// GET /api/cli/challenge/[slug]/config - Get challenge configuration
export const GET: RequestHandler = async ({ params, request, url }) => {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return json({ error: 'Token required' }, { status: 401 });
  }

  const user = await verifyCliToken(token);
  if (!user) {
    return json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const { slug } = params;
  if (!slug) {
    return json({ error: 'Challenge slug required' }, { status: 400 });
  }

  // Get the challenge
  const course = await db.course.findUnique({
    where: { slug },
    include: {
      lessons: {
        orderBy: { order: 'asc' }
      }
    }
  });

  if (!course) {
    return json({ error: 'Challenge not found' }, { status: 404 });
  }

  if (!course.isPublished) {
    // Allow authors to test their own challenges
    if (course.authorId !== user.id) {
      return json({ error: 'Challenge not available' }, { status: 403 });
    }
  }

  // Find the user's current lesson (next incomplete one)
  const completedLessons = await db.userProgress.findMany({
    where: {
      userId: user.id,
      lesson: { courseId: course.id }
    },
    select: { lessonId: true }
  });

  const completedIds = new Set(completedLessons.map(p => p.lessonId));
  let currentLesson = course.lessons.find(l => !completedIds.has(l.id));
  
  // If all lessons completed, use the last one
  if (!currentLesson && course.lessons.length > 0) {
    currentLesson = course.lessons[course.lessons.length - 1];
  }

  if (!currentLesson) {
    return json({ error: 'No lessons found in this challenge' }, { status: 404 });
  }

  // Determine environment type
  const envType = currentLesson.environmentType || 'C';
  const envTypeStr = String(envType);
  
  // Merge default config with lesson-specific overrides
  const defaultEnv = defaultEnvironments[envTypeStr] || defaultEnvironments['C'];
  const lessonEnvConfig = currentLesson.environmentConfig as EnvironmentConfig | null;
  const envConfig: EnvironmentConfig = {
    ...defaultEnv,
    ...(lessonEnvConfig || {})
  };

  // Generate build command
  const buildCommand = generateBuildCommand(envTypeStr, envConfig);

  // Get server URL from request or use default
  const serverUrl = url.origin || 'https://craftcode.dev';

  // Build the config
  const config: CraftCodeConfig = {
    $schema: 'https://craftcode.dev/schemas/v1/config.json',
    version: '1.0',
    challenge: {
      id: course.id,
      slug: course.slug,
      title: course.title,
      lessonId: currentLesson.id,
      lessonOrder: currentLesson.order,
      lessonTitle: currentLesson.title
    },
    environment: envConfig,
    build: {
      command: buildCommand,
      timeout: 30000
    },
    testing: {
      serverUrl,
      testEndpoint: `/api/cli/tests/${currentLesson.id}`,
      resultEndpoint: '/api/cli/result',
      timeout: 10000,
      stopOnFirstFailure: true
    }
  };

  // Add scaffold files if requested
  const includeScaffold = url.searchParams.get('scaffold') !== 'false';
  if (includeScaffold && scaffoldTemplates[envTypeStr]) {
    config.scaffold = {
      files: scaffoldTemplates[envTypeStr]
    };
  }

  return json(config);
};
