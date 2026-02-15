<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import { HugeiconsIcon } from "@hugeicons/svelte";
    import {
        Loading03Icon,
        CheckmarkCircle01Icon,
        Cancel01Icon,
        Copy01Icon,
    } from "@hugeicons/core-free-icons";

    // Props using Svelte 5 runes
    let {
        stageId,
        initialCode = "",
        initialLanguage = "python",
        expectedOutput = "",
        onSave = (code: string, language: string) => {},
        onCodeChange = (code: string) => {},
    }: {
        stageId: string;
        initialCode?: string;
        initialLanguage?: string;
        expectedOutput?: string;
        onSave?: (code: string, language: string) => void;
        onCodeChange?: (code: string) => void;
    } = $props();

    // Language configurations with Judge0 language IDs
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
`,
        typescript: `// TypeScript
const greeting: string = "Hello, World!";
console.log(greeting);
`,
        python: `# Python 3
print("Hello, World!")
`,
        java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
`,
        c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}
`,
        cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}
`,
        go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
}
`,
        rust: `fn main() {
    println!("Hello, World!");
}
`,
        ruby: `puts "Hello, World!"
`,
        php: `<?php
echo "Hello, World!\\n";
?>
`,
        bash: `#!/bin/bash
echo "Hello, World!"
`,
    };

    // State
    let selectedLanguage = $state(initialLanguage);
    let code = $state(initialCode || codeTemplates[initialLanguage] || "");
    let stdin = $state("");
    let isExecuting = $state(false);
    let executionResult = $state<any>(null);
    let showStdin = $state(false);
    let editorElement = $state<HTMLElement | null>(null);
    let editorView: any = null;
    let saveTimeout: ReturnType<typeof setTimeout> | null = null;
    let isSaving = $state(false);
    let lastSavedCode = $state(initialCode || "");

    // Debounced save function
    function debouncedSave(newCode: string) {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        saveTimeout = setTimeout(() => {
            if (newCode !== lastSavedCode) {
                isSaving = true;
                onSave(newCode, selectedLanguage);
                lastSavedCode = newCode;
                setTimeout(() => {
                    isSaving = false;
                }, 500);
            }
        }, 800);
    }

    // Keyboard shortcut handler
    function handleKeyDown(ev: KeyboardEvent) {
        if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
            ev.preventDefault();
            executeCodeHandler();
        }
    }

    onMount(async () => {
        if (!browser) return;
        window.addEventListener("keydown", handleKeyDown);
        await initEditor();
    });

    onDestroy(() => {
        if (browser) {
            window.removeEventListener("keydown", handleKeyDown);
        }
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        if (editorView) {
            editorView.destroy();
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
                    onCodeChange(code);
                    debouncedSave(code);
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
        // Only reset to template if code is empty or is a template
        const currentIsTemplate = Object.values(codeTemplates).some(
            (t) => t.trim() === code.trim()
        );
        if (!code || currentIsTemplate) {
            code = codeTemplates[langId] || "";
        }
        initEditor();
        debouncedSave(code);
    }

    async function executeCodeHandler() {
        if (isExecuting) return;

        isExecuting = true;
        executionResult = null;

        try {
            const response = await fetch("/api/code/execute", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    code,
                    language: selectedLanguage,
                    stdin,
                }),
            });

            const result = await response.json();
            executionResult = result;
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

    // Check if output matches expected
    const outputMatches = $derived(() => {
        if (!expectedOutput || !executionResult?.stdout) return null;
        const actual = (executionResult.stdout || "").trim();
        const expected = expectedOutput.trim();
        return actual === expected;
    });
</script>

<div
    class="flex flex-col bg-background text-foreground rounded-xl overflow-hidden border border-border"
    style="height: 500px;"
>
    <!-- Header Bar -->
    <div
        class="flex items-center justify-between px-4 py-2 bg-secondary/50 border-b border-border"
    >
        <div class="flex items-center gap-4">
            <!-- Language Selector -->
            <div class="flex items-center gap-2">
                <select
                    bind:value={selectedLanguage}
                    onchange={() => changeLanguage(selectedLanguage)}
                    class="bg-background border border-border rounded-lg px-3 py-1.5 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-primary/50 cursor-pointer"
                >
                    {#each languages as lang}
                        <option value={lang.id}>{lang.name}</option>
                    {/each}
                </select>
            </div>

            <!-- STDIN Toggle -->
            <button
                onclick={() => (showStdin = !showStdin)}
                class="px-3 py-1.5 text-xs font-medium rounded-lg transition-colors {showStdin
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-muted-foreground hover:text-primary'}"
            >
                STDIN
            </button>

            <!-- Save Status -->
            {#if isSaving}
                <span class="text-xs text-muted-foreground flex items-center gap-1">
                    <HugeiconsIcon icon={Loading03Icon} size={12} class="animate-spin" />
                    Saving...
                </span>
            {:else if lastSavedCode === code && code !== ""}
                <span class="text-xs text-green-400 flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
                    Saved
                </span>
            {/if}
        </div>

        <div class="flex items-center gap-3">
            <!-- Execution Stats -->
            {#if executionResult?.time}
                <span class="text-xs text-muted-foreground font-mono">
                    {executionResult.time}s
                </span>
            {/if}

            {#if executionResult?.memory}
                <span class="text-xs text-muted-foreground font-mono">
                    {(executionResult.memory / 1024).toFixed(1)} MB
                </span>
            {/if}

            <!-- Run Button -->
            <button
                onclick={executeCodeHandler}
                disabled={isExecuting}
                class="flex items-center gap-2 px-4 py-1.5 rounded-lg font-semibold text-sm transition-all
                       {isExecuting
                    ? 'bg-muted text-muted-foreground cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25'}"
            >
                {#if isExecuting}
                    <HugeiconsIcon
                        icon={Loading03Icon}
                        size={16}
                        class="animate-spin"
                    />
                    <span>Running...</span>
                {:else}
                    <span>▶ Run Code</span>
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
                        class="w-full h-16 bg-background border border-border rounded-lg p-2 text-sm font-mono text-primary resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
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
                    <!-- Output Match Indicator -->
                    {#if outputMatches() !== null}
                        <span
                            class="px-2 py-0.5 text-xs font-medium rounded-full border {outputMatches()
                                ? 'bg-green-500/20 border-green-500/50 text-green-400'
                                : 'bg-red-500/20 border-red-500/50 text-red-400'}"
                        >
                            {outputMatches() ? "✓ Match" : "✗ Mismatch"}
                        </span>
                    {/if}
                </div>
                <div class="flex items-center gap-1">
                    {#if executionResult?.stdout}
                        <button
                            onclick={copyOutput}
                            class="p-1.5 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-primary"
                            title="Copy Output"
                        >
                            <HugeiconsIcon icon={Copy01Icon} size={14} />
                        </button>
                    {/if}
                    {#if executionResult}
                        <button
                            onclick={clearOutput}
                            class="p-1.5 hover:bg-secondary rounded transition-colors text-muted-foreground hover:text-primary"
                            title="Clear Output"
                        >
                            <HugeiconsIcon icon={Cancel01Icon} size={14} />
                        </button>
                    {/if}
                </div>
            </div>

            <!-- Output Content -->
            <div class="flex-1 overflow-auto p-3">
                {#if isExecuting}
                    <div
                        class="flex flex-col items-center justify-center h-full text-muted-foreground"
                    >
                        <div
                            class="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-3"
                        ></div>
                        <p class="text-sm">Executing...</p>
                    </div>
                {:else if executionResult}
                    <div class="space-y-3">
                        <!-- Error -->
                        {#if executionResult.error}
                            <div
                                class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                            >
                                <p
                                    class="text-red-400 font-mono text-xs whitespace-pre-wrap"
                                >
                                    {executionResult.error}
                                </p>
                            </div>
                        {/if}

                        <!-- Compile Error -->
                        {#if executionResult.compileOutput}
                            <div>
                                <p class="text-xs font-medium text-red-400 mb-1">
                                    Compilation Error
                                </p>
                                <pre
                                    class="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">{executionResult.compileOutput}</pre>
                            </div>
                        {/if}

                        <!-- Standard Output -->
                        {#if executionResult.stdout}
                            <div>
                                <p class="text-xs font-medium text-muted-foreground mb-1">
                                    Output
                                </p>
                                <pre
                                    class="p-3 bg-background border border-border rounded-lg text-primary font-mono text-xs overflow-x-auto whitespace-pre-wrap">{executionResult.stdout}</pre>
                            </div>
                        {/if}

                        <!-- Expected Output Comparison -->
                        {#if expectedOutput && executionResult.stdout}
                            <div>
                                <p class="text-xs font-medium text-muted-foreground mb-1">
                                    Expected Output
                                </p>
                                <pre
                                    class="p-3 bg-background border border-border rounded-lg text-muted-foreground font-mono text-xs overflow-x-auto whitespace-pre-wrap">{expectedOutput}</pre>
                            </div>
                        {/if}

                        <!-- Standard Error -->
                        {#if executionResult.stderr}
                            <div>
                                <p class="text-xs font-medium text-yellow-400 mb-1">
                                    Stderr
                                </p>
                                <pre
                                    class="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-yellow-300 font-mono text-xs overflow-x-auto whitespace-pre-wrap">{executionResult.stderr}</pre>
                            </div>
                        {/if}

                        <!-- No Output -->
                        {#if !executionResult.stdout && !executionResult.stderr && !executionResult.compileOutput && !executionResult.error && executionResult.status?.id === 3}
                            <div
                                class="flex flex-col items-center justify-center py-6 text-muted-foreground"
                            >
                                <HugeiconsIcon
                                    icon={CheckmarkCircle01Icon}
                                    size={36}
                                    class="text-green-400 mb-2"
                                />
                                <p class="text-sm">Success (no output)</p>
                            </div>
                        {/if}
                    </div>
                {:else}
                    <div
                        class="flex flex-col items-center justify-center h-full text-muted-foreground"
                    >
                        <p class="text-sm mb-1">Ready to run</p>
                        <p class="text-xs text-muted-foreground/70">
                            Press <kbd class="px-1.5 py-0.5 bg-secondary rounded text-xs">Ctrl</kbd>
                            + <kbd class="px-1.5 py-0.5 bg-secondary rounded text-xs">Enter</kbd>
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
        font-size: 13px;
    }
    :global(.cm-scroller) {
        overflow: auto;
    }
    :global(.cm-content) {
        padding: 12px 0;
    }
</style>
