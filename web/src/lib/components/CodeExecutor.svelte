<script lang="ts">
    export let data;
    let languages: {
        id: number;
        name: string;
    }[] = data.languages;
    console.log({ languages });
</script>

<div>
    <div class="bg-secondary p-8 rounded-2xl">
        <div class="w-full flex items-center justify-between">
            <div class="font-bold">
                {data.challenge.title}
            </div>
            <div>
                <input
                    list="langs"
                    class="border border-border rounded-xl p-2 max-w-40 text-xs bg-card"
                />
                <datalist id="langs">
                    {#each languages as item}
                        <option value={item.name}>{item.name}</option>
                    {/each}
                </datalist>
            </div>
        </div>
    </div>
</div>
