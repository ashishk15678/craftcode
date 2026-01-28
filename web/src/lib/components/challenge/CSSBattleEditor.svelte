<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    // Important: You will need to install this: npm install html2canvas
    import html2canvas from "html2canvas";

    // Props
    export let lessonId: string;
    export let challengeSlug: string;
    export let targetImageUrl: string = "";
    export let canvasWidth: number = 400;
    export let canvasHeight: number = 300;
    export let matchThreshold: number = 95;
    export let onTestComplete: (result: any) => void = () => {};

    // State
    let editorMode: "html-css" | "react" = "react";
    let comparisonMode: "side-by-side" | "slider" | "diff" = "side-by-side";
    let htmlCode = `<div class="box"></div>
<style>
  body {
    margin: 0;
    background: #439683;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .box {
    width: 100px;
    height: 100px;
    background: #f3cc77;
  }
</style>`;

    let reactCode = `function App() {
  return (
    <div className="min-h-screen bg-[#439683] flex items-center justify-center">
      <div className="w-24 h-24 bg-[#f3cc77]"></div>
    </div>
  );
}`;

    let editorElement: HTMLElement;
    let editorView: any;
    let iframeSrc = "";
    let matchPercentage = 0;
    let sliderPosition = 50;
    let isRunning = false;
    let testResult: any = null;
    let showOutput = false;

    // Canvas refs
    let outputCanvas: HTMLCanvasElement;
    let diffCanvas: HTMLCanvasElement;
    let previewIframe: HTMLIFrameElement;

    $: currentCode = editorMode === "html-css" ? htmlCode : reactCode;

    let previewTimeout: ReturnType<typeof setTimeout>;
    $: if (browser && currentCode) {
        clearTimeout(previewTimeout);
        previewTimeout = setTimeout(() => updatePreview(), 300);
    }

    onMount(async () => {
        if (!browser) return;
        await initEditor();
    });

    async function initEditor() {
        const { EditorState } = await import("@codemirror/state");
        const {
            EditorView,
            keymap,
            lineNumbers,
            highlightActiveLineGutter,
            highlightSpecialChars,
            drawSelection,
            dropCursor,
            rectangularSelection,
            crosshairCursor,
            highlightActiveLine,
        } = await import("@codemirror/view");
        const { defaultKeymap, history, historyKeymap } =
            await import("@codemirror/commands");
        const { html } = await import("@codemirror/lang-html");
        const { javascript } = await import("@codemirror/lang-javascript");
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

        const getExtensions = () => [
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
            oneDark,
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    const newCode = update.state.doc.toString();
                    if (editorMode === "html-css") htmlCode = newCode;
                    else reactCode = newCode;
                }
            }),
            editorMode === "html-css" ? html() : javascript({ jsx: true }),
        ];

        editorView = new EditorView({
            state: EditorState.create({
                doc: currentCode,
                extensions: getExtensions(),
            }),
            parent: editorElement,
        });
        updatePreview();
    }

    function updatePreview() {
        if (editorMode === "html-css") {
            iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(`
                <!DOCTYPE html><html><head><style>* { margin: 0; padding: 0; box-sizing: border-box; }</style></head>
                <body>${htmlCode}</body></html>`)}`;
        } else {
            iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(`
                <!DOCTYPE html><html><head>
                <script src="https://unpkg.com/react@18/umd/react.development.js"><\/script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"><\/script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"><\/script>
                <script src="https://cdn.tailwindcss.com"><\/script>
                </head><body><div id="root"></div>
                <script type="text/babel">${reactCode}; ReactDOM.createRoot(document.getElementById('root')).render(<App />);<\/script>
                </body></html>`)}`;
        }
        // Wait for render, then calculate
        setTimeout(() => calculateMatch(), 800);
    }

    async function calculateMatch() {
        if (!targetImageUrl || !previewIframe) return;

        try {
            // 1. Load Target Image
            const targetImg = new Image();
            targetImg.crossOrigin = "Anonymous";
            targetImg.src = targetImageUrl;
            await new Promise((res) => (targetImg.onload = res));

            const tCanvas = document.createElement("canvas");
            tCanvas.width = canvasWidth;
            tCanvas.height = canvasHeight;
            const tCtx = tCanvas.getContext("2d")!;
            tCtx.drawImage(targetImg, 0, 0, canvasWidth, canvasHeight);
            const targetData = tCtx.getImageData(
                0,
                0,
                canvasWidth,
                canvasHeight,
            ).data;

            // 2. Capture Iframe Content using html2canvas
            const iframeBody = previewIframe.contentDocument?.body;
            if (!iframeBody) return;

            const userCanvas = await html2canvas(iframeBody, {
                width: canvasWidth,
                height: canvasHeight,
                scale: 1,
                logging: false,
                useCORS: true,
            });

            const userData = userCanvas
                .getContext("2d")!
                .getImageData(0, 0, canvasWidth, canvasHeight).data;

            // 3. Pixel Comparison & Diff Generation
            let diffScore = 0;
            const maxDiff = canvasWidth * canvasHeight * 4 * 255;

            if (diffCanvas) {
                diffCanvas.width = canvasWidth;
                diffCanvas.height = canvasHeight;
                const dCtx = diffCanvas.getContext("2d")!;
                const diffImg = dCtx.createImageData(canvasWidth, canvasHeight);

                for (let i = 0; i < targetData.length; i += 4) {
                    const rD = Math.abs(targetData[i] - userData[i]);
                    const gD = Math.abs(targetData[i + 1] - userData[i + 1]);
                    const bD = Math.abs(targetData[i + 2] - userData[i + 2]);
                    const aD = Math.abs(targetData[i + 3] - userData[i + 3]);

                    diffScore += rD + gD + bD + aD;

                    // Highlight diffs in magenta, matches in black
                    const isDiff = rD + gD + bD > 10;
                    diffImg.data[i] = isDiff ? 255 : 0;
                    diffImg.data[i + 1] = 0;
                    diffImg.data[i + 2] = isDiff ? 255 : 0;
                    diffImg.data[i + 3] = 255;
                }
                dCtx.putImageData(diffImg, 0, 0);
            }

            matchPercentage = Math.max(0, 100 - (diffScore / maxDiff) * 100);
        } catch (err) {
            console.error("Match error:", err);
        }
    }

    async function submitSolution() {
        isRunning = true;
        showOutput = true;
        // Mock API call or actual backend call
        setTimeout(() => {
            isRunning = false;
            testResult = { success: matchPercentage >= matchThreshold };
        }, 1000);
    }

    function handleSliderDrag(e: MouseEvent) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        sliderPosition = Math.max(
            0,
            Math.min(100, ((e.clientX - rect.left) / rect.width) * 100),
        );
    }
</script>

<div
    class="css-battle-editor h-full flex flex-col bg-slate-900 text-white font-sans"
>
    <div
        class="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700"
    >
        <div class="flex gap-2">
            <button
                class="px-3 py-1 text-sm rounded {editorMode === 'html-css'
                    ? 'bg-blue-600'
                    : 'bg-slate-700'}"
                on:click={() => {
                    editorMode = "html-css";
                    initEditor();
                }}>HTML/CSS</button
            >
            <button
                class="px-3 py-1 text-sm rounded {editorMode === 'react'
                    ? 'bg-blue-600'
                    : 'bg-slate-700'}"
                on:click={() => {
                    editorMode = "react";
                    initEditor();
                }}>React</button
            >
        </div>

        <div class="flex gap-4 items-center">
            <div class="text-sm font-mono">
                Match: <span
                    class={matchPercentage >= matchThreshold
                        ? "text-green-400"
                        : "text-yellow-400"}>{matchPercentage.toFixed(2)}%</span
                >
            </div>
            <button
                on:click={submitSolution}
                class="bg-green-600 hover:bg-green-500 px-6 py-1 rounded font-bold transition-all"
                >SUBMIT</button
            >
        </div>
    </div>

    <div class="flex-1 flex overflow-hidden">
        <div
            class="w-1/2 border-r border-slate-700"
            bind:this={editorElement}
        ></div>

        <div class="w-1/2 flex flex-col bg-slate-950 p-4 overflow-auto">
            <div class="flex gap-2 mb-4">
                <button
                    class="text-xs px-2 py-1 rounded bg-slate-800"
                    on:click={() => (comparisonMode = "side-by-side")}
                    >Side-by-Side</button
                >
                <button
                    class="text-xs px-2 py-1 rounded bg-slate-800"
                    on:click={() => (comparisonMode = "slider")}>Slider</button
                >
                <button
                    class="text-xs px-2 py-1 rounded bg-slate-800"
                    on:click={() => (comparisonMode = "diff")}>Diff View</button
                >
            </div>

            <div
                class="relative mx-auto border-4 border-slate-800 rounded shadow-2xl"
                style="width: {canvasWidth}px; height: {canvasHeight}px;"
            >
                {#if comparisonMode === "side-by-side"}
                    <div class="flex flex-col gap-4">
                        <iframe
                            bind:this={previewIframe}
                            src={iframeSrc}
                            class="bg-white"
                            style="width: {canvasWidth}px; height: {canvasHeight}px;"
                        ></iframe>
                        <img
                            src={targetImageUrl}
                            alt="target"
                            style="width: {canvasWidth}px; height: {canvasHeight}px;"
                        />
                    </div>
                {:else if comparisonMode === "slider"}
                    <img
                        src={targetImageUrl}
                        alt="target"
                        class="absolute inset-0"
                        style="width: 100%; height: 100%;"
                    />
                    <div
                        class="absolute inset-0 overflow-hidden border-r-2 border-blue-500"
                        style="width: {sliderPosition}%;"
                    >
                        <iframe
                            src={iframeSrc}
                            class="bg-white"
                            style="width: {canvasWidth}px; height: {canvasHeight}px;"
                        ></iframe>
                    </div>
                    <div
                        class="absolute inset-0"
                        on:mousemove={handleSliderDrag}
                        role="presentation"
                    ></div>
                {:else}
                    <canvas bind:this={diffCanvas} class="bg-black"></canvas>
                {/if}
            </div>
        </div>
    </div>

    {#if showOutput && testResult}
        <div
            class="p-4 bg-slate-800 border-t border-slate-700 flex justify-between items-center"
        >
            <span
                class="text-lg font-bold {testResult.success
                    ? 'text-green-400'
                    : 'text-red-400'}"
            >
                {testResult.success
                    ? "SUCCESS! CHALLENGE COMPLETE"
                    : "NOT QUITE MATCHING YET"}
            </span>
            <button on:click={() => (showOutput = false)}>✕</button>
        </div>
    {/if}
</div>

<style>
    :global(.cm-editor) {
        height: 100%;
    }
</style>
