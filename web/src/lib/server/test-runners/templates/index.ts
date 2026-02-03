// Template manager for test runners
import { readFile } from "fs/promises";
import { join } from "path";
import type { TestRunnerType } from "@prisma/client";

export interface TestTemplate {
  name: string;
  type: TestRunnerType;
  description: string;
  filename: string;
  content: string;
}

const TEMPLATES_DIR = join(process.cwd(), "src/lib/server/test-runners/templates");

export const AVAILABLE_TEMPLATES: Record<TestRunnerType, TestTemplate[]> = {
  BASH: [
    {
      name: "Basic Bash Script",
      type: "BASH",
      description: "Simple bash test script template",
      filename: "bash.template.sh",
      content: "",
    },
  ],
  NODE: [
    {
      name: "Jest Tests",
      type: "NODE",
      description: "Jest-based unit tests for Node.js",
      filename: "node-jest.template.js",
      content: "",
    },
  ],
  PYTHON: [
    {
      name: "Pytest Tests",
      type: "PYTHON",
      description: "Pytest-based tests for Python",
      filename: "python-pytest.template.py",
      content: "",
    },
  ],
  IO_MATCHING: [
    {
      name: "I/O Matching",
      type: "IO_MATCHING",
      description: "Input/output matching for competitive programming",
      filename: "io-matching.template.sh",
      content: "",
    },
  ],
  CSS: [
    {
      name: "CSS Battle",
      type: "CSS",
      description: "Visual CSS challenge with image comparison",
      filename: "css-battle.template.html",
      content: "",
    },
  ],
  CUSTOM: [],
};

// Load template content
export async function loadTemplate(type: TestRunnerType, templateName: string): Promise<string> {
  const templates = AVAILABLE_TEMPLATES[type];
  const template = templates.find(t => t.name === templateName);
  
  if (!template) {
    throw new Error(`Template "${templateName}" not found for type ${type}`);
  }

  const filePath = join(TEMPLATES_DIR, template.filename);
  return await readFile(filePath, "utf-8");
}

// Get all templates for a specific test runner type
export function getTemplatesForType(type: TestRunnerType): TestTemplate[] {
  return AVAILABLE_TEMPLATES[type] || [];
}
