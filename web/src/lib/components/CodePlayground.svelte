<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        ArrowExpandIcon,
        Loading03Icon,
        CheckmarkCircle01Icon,
        Cancel01Icon,
        Settings01Icon,
        Copy01Icon,
        Delete01Icon,
    } from "@hugeicons/core-free-icons";

    // Props
    export let initialLanguage: string = "javascript";
    export let initialCode: string = "";
    export let showLanguageSelector: boolean = true;
    export let height: string = "600px";
    export let onExecute: (result: any) => void = () => {};

    // Language configurations
    const languages = [
        { id: "javascript", name: "JavaScript", icon: "JS" },
        { id: "typescript", name: "TypeScript", icon: "TS" },
        { id: "python", name: "Python", icon: "PY" },
        { id: "java", name: "Java", icon: "JV" },
        { id: "c", name: "C", icon: "C" },
        { id: "cpp", name: "C++", icon: "C++" },
        { id: "go", name: "Go", icon: "GO" },
        { id: "rust", name: "Rust", icon: "RS" },
        { id: "ruby", name: "Ruby", icon: "RB" },
        { id: "php", name: "PHP", icon: "PHP" },
        { id: "bash", name: "Bash", icon: "SH" },
    ];

    const codeTemplates: Record<string, string> = {
        javascript: `// JavaScript (Node.js)
console.log("Hello, World!");

// Example: Sum of two numbers
function add(a, b) {
    return a + b;
}

console.log("2 + 3 =", add(2, 3));
`,
        typescript: `// TypeScript
const greeting: string = "Hello, World!";
console.log(greeting);

function add(a: number, b: number): number {
    return a + b;
}

console.log(\`2 + 3 = \${add(2, 3)}\`);
`,
        python: `# Python 3
print("Hello, World!")

def add(a, b):
    return a + b

print(f"2 + 3 = {add(2, 3)}")
`,
        java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        System.out.println("2 + 3 = " + add(2, 3));
    }

    public static int add(int a, int b) {
        return a + b;
    }
}
`,
        c: `#include <stdio.h>

int add(int a, int b) {
    return a + b;
}

int main() {
    printf("Hello, World!\\n");
    printf("2 + 3 = %d\\n", add(2, 3));
    return 0;
}
`,
        cpp: `#include <iostream>
using namespace std;

int add(int a, int b) {
    return a + b;
}

int main() {
    cout << "Hello, World!" << endl;
    cout << "2 + 3 = " << add(2, 3) << endl;
    return 0;
}
`,
        go: `package main

import "fmt"

func add(a, b int) int {
    return a + b
}

func main() {
    fmt.Println("Hello, World!")
    fmt.Printf("2 + 3 = %d\\n", add(2, 3))
}
`,
        rust: `fn add(a: i32, b: i32) -> i32 {
    a + b
}

fn main() {
    println!("Hello, World!");
    println!("2 + 3 = {}", add(2, 3));
}
`,
        ruby: `puts "Hello, World!"

def add(a, b)
    a + b
end

puts "2 + 3 = #{add(2, 3)}"
`,
        php: `<?php
echo "Hello, World!\\n";

function add($a, $b) {
    return $a + $b;
}

echo "2 + 3 = " . add(2, 3) . "\\n";
?>
`,
        bash: `#!/bin/bash
echo "Hello, World!"

add() {
    echo $(($1 + $2))
}

echo "2 + 3 = $(add 2 3)"
`,
    };

    // State
    let selectedLanguage = initialLanguage;
    let code = initialCode || codeTemplates[initialLanguage] || "";
    let stdin = "";
    let isExecuting = false;
    let executionResult: any = null;
    let showStdin = false;
    let showSettings = false;
    let isFullScreen = false;
    let containerElement: HTMLElement;
    let editorElement: HTMLElement;
    let editorView: any;
    let executionHistory: any[] = [];

    // Keyboard shortcut handler
    const handleKeyDown = (ev: KeyboardEvent) => {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
            ev.preventDefault();
            executeCodeHandler();
        }
        if ((ev.ctrlKey || ev.metaKey) && (ev.key === "s" || ev.key === "S")) {
            ev.preventDefault();
        }
    };

    onMount(async () => {
        if (!browser) return;
        window.addEventListener("keydown", handleKeyDown);
        await initEditor();
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener("keydown", handleKeyDown);
        }
    });

    async function initEditor() {
        if (!browser || !editorElement) return;

        const { EditorState } = await import("@codemirror/state");
        const {
            EditorView,
            keymap,
            lineNumbers,
            highlightActiveLineGutter,
            highlightSpecialChars,
            drawSelection,
            dropCursor,
            highlightActiveLine,
        } = await import("@codemirror/view");
        const { defaultKeymap, history, historyKeymap } =
            await import("@codemirror/commands");
        const { javascript } = await import("@codemirror/lang-javascript");
        const { python } = await import("@codemirror/lang-python");
        const { cpp } = await import("@codemirror/lang-cpp");
        const { java } = await import("@codemirror/lang-java");
        const { rust } = await import("@codemirror/lang-rust");
        const { php } = await import("@codemirror/lang-php");
        const { oneDark } = await import("@codemirror/theme-one-dark");
        const {
            syntaxHighlighting,
            defaultHighlightStyle,
            bracketMatching,
            foldGutter,
            indentOnInput,
        } = await import("@codemirror/language");
        const { closeBrackets, autocompletion } =
            await import("@codemirror/autocomplete");

        const getLanguageExtension = () => {
            switch (selectedLanguage) {
                case "javascript":
                case "typescript":
                    return javascript({
                        jsx: true,
                        typescript: selectedLanguage === "typescript",
                    });
                case "python":
                    return python();
                case "c":
                case "cpp":
                    return cpp();
                case "java":
                    return java();
                case "rust":
                    return rust();
                case "php":
                    return php();
                default:
                    return javascript();
            }
        };

        const extensions = [
            lineNumbers(),
            highlightActiveLineGutter(),
            highlightSpecialChars(),
            history(),
            foldGutter(),
            drawSelection(),
            dropCursor(),
            indentOnInput(),
            syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
            bracketMatching(),
            closeBrackets(),
            autocompletion(),
            highlightActiveLine(),
            oneDark,
            keymap.of([...defaultKeymap, ...historyKeymap]),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    code = update.state.doc.toString();
                }
            }),
            getLanguageExtension(),
        ];

        if (editorView) {
            editorView.destroy();
        }

        editorView = new EditorView({
            state: EditorState.create({
                doc: code,
                extensions,
            }),
            parent: editorElement,
        });
    }

    function changeLanguage(langId: string) {
        selectedLanguage = langId;
        code = codeTemplates[langId] || "";
        initEditor();
    }

    async function executeCodeHandler() {
        if (isExecuting) return;

        isExecuting = true;
        executionResult = null;
        const API = "https://chaicode.cloud";
        try {
            const response = await fetch(`${API}/submissions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-AUTH-Token": "chaicodecodebox",
                },
                body: JSON.stringify({
                    source_code: code,
                    language_id: 71,
                    stdin,
                }),
            });

            const result = await response.json();
            executionResult = result;

            // Add to history
            executionHistory = [
                {
                    timestamp: new Date(),
                    language: selectedLanguage,
                    result,
                },
                ...executionHistory.slice(0, 9),
            ];

            onExecute(result);
        } catch (error) {
            executionResult = {
                error:
                    error instanceof Error ? error.message : "Execution failed",
                status: { id: 13, description: "Internal Error" },
            };
        } finally {
            isExecuting = false;
        }
    }

    function copyOutput() {
        if (executionResult?.stdout) {
            navigator.clipboard.writeText(executionResult.stdout);
        }
    }

    function clearOutput() {
        executionResult = null;
    }

    function resetCode() {
        code = codeTemplates[selectedLanguage] || "";
        initEditor();
    }

    async function toggleFullScreen() {
        if (!browser) return;

        if (!document.fullscreenElement) {
            await containerElement.requestFullscreen();
            isFullScreen = true;
        } else {
            document.exitFullscreen();
            isFullScreen = false;
        }
    }

    function handleFullscreenChange() {
        isFullScreen = !!document.fullscreenElement;
    }

    function getStatusColor(statusId: number): string {
        if (statusId === 3) return "text-green-400";
        if (statusId === 1 || statusId === 2) return "text-yellow-400";
        return "text-red-400";
    }

    function getStatusBgColor(statusId: number): string {
        if (statusId === 3) return "bg-green-500/20 border-green-500/50";
        if (statusId === 1 || statusId === 2)
            return "bg-yellow-500/20 border-yellow-500/50";
        return "bg-red-500/20 border-red-500/50";
    }
</script>

<svelte:window on:fullscreenchange={handleFullscreenChange} />

<div
    bind:this={containerElement}
    class="flex flex-col bg-background text-foreground rounded-xl overflow-hidden border border-border shadow-2xl"
    style="height: {height};"
>
    <!-- Header Bar -->
    <div
        class="flex items-center justify-between px-4 py-3 bg-secondary/50 border-b border-border"
    >
        <div class="flex items-center gap-4">
            <!-- Language Selector -->
            {#if showLanguageSelector}
                <div class="flex items-center gap-2">
                    <select
                        bind:value={selectedLanguage}
                        on:change={() => changeLanguage(selectedLanguage)}
                        class="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                    >
                        {#each languages as lang}
                            <option value={lang.id}>{lang.name}</option>
                        {/each}
                    </select>
                </div>
            {/if}

            <!-- Quick Actions -->
            <div class="flex items-center gap-1">
                <button
                    on:click={resetCode}
                    class="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                    title="Reset Code"
                >
                    <HugeiconsIcon icon={Delete01Icon} size={18} />
                </button>
                <button
                    on:click={() => (showStdin = !showStdin)}
                    class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors {showStdin
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:text-primary'}"
                >
                    STDIN
                </button>
            </div>
        </div>

        <div class="flex items-center gap-3">
            <!-- Execution Time -->
            {#if executionResult?.time}
                <span class="text-xs text-muted-foreground font-mono">
                    {executionResult.time}s
                </span>
            {/if}

            <!-- Memory Usage -->
            {#if executionResult?.memory}
                <span class="text-xs text-muted-foreground font-mono">
                    {(executionResult.memory / 1024).toFixed(1)} MB
                </span>
            {/if}

            <!-- Fullscreen -->
            <button
                on:click={toggleFullScreen}
                class="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-primary"
                title={isFullScreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                <HugeiconsIcon icon={ArrowExpandIcon} size={18} />
            </button>

            <!-- Run Button -->
            <button
                on:click={executeCodeHandler}
                disabled={isExecuting}
                class="flex items-center gap-2 px-5 py-2 rounded-lg font-semibold transition-all
                       {isExecuting
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'}"
            >
                {#if isExecuting}
                    <HugeiconsIcon
                        icon={Loading03Icon}
                        size={18}
                        class="animate-spin"
                    />
                    <span>Running...</span>
                {:else}
                    <!-- <HugeiconsIcon icon={Play01Icon} size={18} /> -->
                    <span>Run Code</span>
                {/if}
            </button>
        </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 flex overflow-hidden">
        <!-- Editor Panel -->
        <div class="flex-1 flex flex-col border-r border-border">
            <!-- Editor -->
            <div bind:this={editorElement} class="flex-1 overflow-auto"></div>

            <!-- STDIN Panel -->
            {#if showStdin}
                <div class="border-t border-border bg-secondary/30 p-3">
                    <label
                        class="block text-xs font-medium text-muted-foreground mb-2"
                        >Standard Input (stdin)</label
                    >
                    <textarea
                        bind:value={stdin}
                        placeholder="Enter input for your program..."
                        class="w-full h-20 bg-background border border-border rounded-lg p-3 text-sm font-mono text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    ></textarea>
                </div>
            {/if}
        </div>

        <!-- Output Panel -->
        <div class="w-[45%] flex flex-col bg-secondary/20">
            <!-- Output Header -->
            <div
                class="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/50"
            >
                <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-primary">Output</span>
                    {#if executionResult?.status}
                        <span
                            class="px-2 py-0.5 text-xs font-medium rounded-full border {getStatusBgColor(
                                executionResult.status.id,
                            )}"
                        >
                            <span
                                class={getStatusColor(
                                    executionResult.status.id,
                                )}
                            >
                                {executionResult.status.description}
                            </span>
                        </span>
                    {/if}
                </div>
                <div class="flex items-center gap-1">
                    {#if executionResult?.stdout}
                        <button
                            on:click={copyOutput}
                            class="p-1.5 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-primary"
                            title="Copy Output"
                        >
                            <HugeiconsIcon icon={Copy01Icon} size={16} />
                        </button>
                    {/if}
                    {#if executionResult}
                        <button
                            on:click={clearOutput}
                            class="p-1.5 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-primary"
                            title="Clear Output"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={16} />
                        </button>
                    {/if}
                </div>
            </div>

            <!-- Output Content -->
            <div class="flex-1 overflow-auto p-4">
                {#if isExecuting}
                    <div
                        class="flex flex-col items-center justify-center h-full text-muted-foreground"
                    >
                        <div
                            class="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"
                        ></div>
                        <p class="text-sm">Executing your code...</p>
                    </div>
                {:else if executionResult}
                    <div class="space-y-4">
                        <!-- Error -->
                        {#if executionResult.error}
                            <div
                                class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
                            >
                                <p
                                    class="text-red-400 font-mono text-sm whitespace-pre-wrap"
                                >
                                    {executionResult.error}
                                </p>
                            </div>
                        {/if}

                        <!-- Compile Error -->
                        {#if executionResult.compileOutput}
                            <div>
                                <p
                                    class="text-xs font-medium text-red-400 mb-2"
                                >
                                    Compilation Error
                                </p>
                                <pre
                                    class="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">{executionResult.compileOutput}</pre>
                            </div>
                        {/if}

                        <!-- Standard Output -->
                        {#if executionResult.stdout}
                            <div>
                                <p
                                    class="text-xs font-medium text-muted-foreground mb-2"
                                >
                                    Standard Output
                                </p>
                                <pre
                                    class="p-4 bg-background border border-border rounded-lg text-primary font-mono text-sm overflow-x-auto whitespace-pre-wrap">{executionResult.stdout}</pre>
                            </div>
                        {/if}

                        <!-- Standard Error -->
                        {#if executionResult.stderr}
                            <div>
                                <p
                                    class="text-xs font-medium text-yellow-400 mb-2"
                                >
                                    Standard Error
                                </p>
                                <pre
                                    class="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 font-mono text-sm overflow-x-auto whitespace-pre-wrap">{executionResult.stderr}</pre>
                            </div>
                        {/if}

                        <!-- No Output -->
                        {#if !executionResult.stdout && !executionResult.stderr && !executionResult.compileOutput && !executionResult.error && executionResult.status?.id === 3}
                            <div
                                class="flex flex-col items-center justify-center py-8 text-muted-foreground"
                            >
                                <HugeiconsIcon
                                    icon={CheckmarkCircle01Icon}
                                    size={48}
                                    class="text-green-400 mb-3"
                                />
                                <p class="text-sm">
                                    Program executed successfully with no output
                                </p>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div
                        class="flex flex-col items-center justify-center h-full text-muted-foreground"
                    >
                        <div
                            class="w-16 h-16 rounded-2xl bg-secondary/50 flex items-center justify-center mb-4"
                        >
                            <!-- <HugeiconsIcon
                                icon={Play01Icon}
                                size={32}
                                class="text-primary/50"
                            /> -->
                        </div>
                        <p class="text-sm mb-1">Ready to execute</p>
                        <p class="text-xs text-muted-foreground/70">
                            Press <kbd
                                class="px-1.5 py-0.5 bg-secondary rounded text-xs"
                                >Ctrl</kbd
                            >
                            +
                            <kbd
                                class="px-1.5 py-0.5 bg-secondary rounded text-xs"
                                >Enter</kbd
                            > to run
                        </p>
                    </div>
                {/if}
            </div>
        </div>
    </div>
</div>

<style>
    :global(.cm-editor) {
        height: 100%;
        font-size: 14px;
    }
    :global(.cm-scroller) {
        overflow: auto;
    }
    :global(.cm-content) {
        padding: 16px 0;
    }
</style>
