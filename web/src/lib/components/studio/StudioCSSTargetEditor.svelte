<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import { browser } from "$app/environment";
    import SplitPane from "$lib/components/SplitPane.svelte";

    let { code = $bindable(""), onChange } = $props<{
        code: string;
        onChange?: (code: string) => void;
    }>();

    let editorElement: HTMLElement;
    let editorView: any;
    let iframeSrc = "";
    
    // Default code if empty
    const defaultCode = `<div class="box"></div>
<style>
  body {
    margin: 0;
    background: #1a1a1a;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }
  .box {
    width: 100px;
    height: 100px;
    background: #f3cc77;
    border-radius: 10px;
  }
</style>`;

    if (!code) {
        code = defaultCode;
        if (onChange) onChange(code);
    }

    let previewTimeout: ReturnType<typeof setTimeout>;
    
    $effect(() => {
        if (browser && code) {
            clearTimeout(previewTimeout);
            previewTimeout = setTimeout(() => updatePreview(), 300);
        }
    });

    onMount(async () => {
        if (!browser) return;
        await initEditor();
    });

    onDestroy(() => {
        if (editorView) editorView.destroy();
    });

    async function initEditor() {
        const { EditorState } = await import("@codemirror/state");
        const { EditorView, lineNumbers, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, highlightActiveLine } = await import("@codemirror/view");
        const { history } = await import("@codemirror/commands");
        const { html } = await import("@codemirror/lang-html");
        const { oneDark } = await import("@codemirror/theme-one-dark");
        const { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter, indentOnInput } = await import("@codemirror/language");
        const { closeBrackets, autocompletion } = await import("@codemirror/autocomplete");

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
            oneDark,
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    code = update.state.doc.toString();
                    if (onChange) onChange(code);
                }
            }),
            html(),
        ];

        if (editorView) editorView.destroy();

        editorView = new EditorView({
            state: EditorState.create({
                doc: code,
                extensions,
            }),
            parent: editorElement,
        });
        
        updatePreview();
    }

    function updatePreview() {
        iframeSrc = `data:text/html;charset=utf-8,${encodeURIComponent(`
            <!DOCTYPE html><html><head><style>* { margin: 0; padding: 0; box-sizing: border-box; }</style></head>
            <body>${code}</body></html>`)}`;
    }
</script>

<div class="h-[400px] border border-border rounded-lg overflow-hidden flex flex-col">
    <div class="bg-secondary/50 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-border flex justify-between items-center">
        <span>Target Code (HTML/CSS)</span>
        <span class="text-[10px] bg-background px-2 py-0.5 rounded border border-border">Auto-updates Preview</span>
    </div>
    <div class="flex-1 overflow-hidden">
        <SplitPane initialSplit={50}>
            {#snippet left()}
                <div bind:this={editorElement} class="h-full overflow-hidden"></div>
            {/snippet}
            {#snippet right()}
                <div class="h-full bg-checkered relative">
                    <iframe
                        title="preview"
                        src={iframeSrc}
                        class="w-full h-full border-none bg-white"
                        sandbox="allow-scripts"
                    ></iframe>
                </div>
            {/snippet}
        </SplitPane>
    </div>
</div>

<style>
    :global(.cm-editor) {
        height: 100%;
    }
    .bg-checkered {
        background-image:
            linear-gradient(45deg, #ccc 25%, transparent 25%),
            linear-gradient(-45deg, #ccc 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #ccc 75%),
            linear-gradient(-45deg, transparent 75%, #ccc 75%);
        background-size: 20px 20px;
        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        background-color: white;
    }
</style>
