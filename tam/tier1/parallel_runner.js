const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

const BATCH_FILE = path.join(__dirname, "batch1.json");
const NUM_WORKERS = 15;

function loadBatchData() {
    if (!fs.existsSync(BATCH_FILE)) {
        throw new Error(`Batch file not found: ${BATCH_FILE}`);
    }
    return JSON.parse(fs.readFileSync(BATCH_FILE, "utf-8"));
}

async function run() {
    console.log("=".repeat(60));
    console.log("  ⚡ Parallel AI Scorer Runner (Target: 15 Mins)");
    console.log(`  Workers:              ${NUM_WORKERS}`);
    console.log(`  Batch File:           ${BATCH_FILE}`);
    console.log("=".repeat(60));

    const data = loadBatchData();
    
    // 1. Gather all unscored people across all sections
    const unscoredItems = [];
    let globalIdx = 0;
    
    for (const section of data) {
        for (const person of section.results || []) {
            if (!person.tier && !person.fit) {
                unscoredItems.push({
                    sectionLabel: section.section,
                    person,
                    originalIndex: globalIdx
                });
            }
            globalIdx++;
        }
    }

    const totalUnscored = unscoredItems.length;
    console.log(`\n  Found ${totalUnscored} unscored people out of ${globalIdx} total.`);
    
    if (totalUnscored === 0) {
        console.log("  ✓ All people already scored. Nothing to do.");
        return;
    }

    // 2. Partition the unscored people into N chunks
    const chunks = Array.from({ length: NUM_WORKERS }, () => []);
    for (let i = 0; i < totalUnscored; i++) {
        chunks[i % NUM_WORKERS].push(unscoredItems[i]);
    }

    // 3. Write temporary chunk files
    const chunkFiles = [];
    for (let i = 0; i < NUM_WORKERS; i++) {
        const chunkPeople = chunks[i].map(item => item.person);
        const chunkFilePath = path.join(__dirname, `batch1_chunk_${i}.json`);
        fs.writeFileSync(chunkFilePath, JSON.stringify(chunkPeople, null, 2), "utf-8");
        chunkFiles.push(chunkFilePath);
        console.log(`  → Created chunk file ${i}: ${chunkPeople.length} people`);
    }

    console.log("\n  🚀 Spawning workers in parallel...");

    // 4. Spawn child processes running ai.js
    const workerPromises = chunkFiles.map((chunkFile, index) => {
        return new Promise((resolve) => {
            console.log(`  [Worker ${index}] Starting for ${chunks[index].length} people...`);
            // node tam/ai.js <inputFile> <startIndex> <endIndex>
            // We pass large endIndex to score all of them
            const child = spawn("node", [
                path.join(__dirname, "../ai.js"),
                chunkFile,
                "0",
                "2000"
            ]);

            child.stdout.on("data", (data) => {
                // Stagger log outputs to show active workers
                const text = data.toString().trim();
                if (text.includes("Scoring") || text.includes("→")) {
                    console.log(`  [Worker ${index}] ${text.split("\n")[0]}`);
                }
            });

            child.stderr.on("data", (data) => {
                console.error(`  ✗ [Worker ${index} Error] ${data.toString().trim()}`);
            });

            child.on("close", (code) => {
                console.log(`  ✓ [Worker ${index}] Exited with code ${code}`);
                resolve({ index, chunkFile, code });
            });
        });
    });

    // Wait for all workers to finish
    await Promise.all(workerPromises);

    console.log("\n  💾 Merging results back safely...");

    // 5. Read chunk files and map them back to original array references
    let mergedCount = 0;
    const finalData = loadBatchData(); // Reload fresh from disk just in case

    for (let i = 0; i < NUM_WORKERS; i++) {
        const chunkFilePath = chunkFiles[i];
        if (!fs.existsSync(chunkFilePath)) {
            console.warn(`  ⚠ Warning: Chunk file not found: ${chunkFilePath}`);
            continue;
        }

        try {
            const updatedPeople = JSON.parse(fs.readFileSync(chunkFilePath, "utf-8"));
            const originalChunk = chunks[i];

            for (let j = 0; j < updatedPeople.length; j++) {
                const updatedPerson = updatedPeople[j];
                const originalMeta = originalChunk[j];

                if (!originalMeta) continue;

                // Find original section and person to update in place
                const section = finalData.find(s => s.section === originalMeta.sectionLabel);
                if (section) {
                    const person = section.results.find(p => p.linkedin_url === originalMeta.person.linkedin_url || (p.full_name === originalMeta.person.full_name && p.headline === originalMeta.person.headline));
                    if (person) {
                        Object.assign(person, updatedPerson);
                        mergedCount++;
                    }
                }
            }
        } catch (err) {
            console.error(`  ✗ Failed to merge chunk ${i}: ${err.message}`);
        }

        // Clean up temporary chunk files
        try {
            fs.unlinkSync(chunkFilePath);
        } catch (err) {
            console.warn(`  ⚠ Failed to delete temporary chunk file ${chunkFilePath}: ${err.message}`);
        }
    }

    // 6. Write final merged file
    fs.writeFileSync(BATCH_FILE, JSON.stringify(finalData, null, 2), "utf-8");

    console.log("\n" + "=".repeat(60));
    console.log(`  🎉 Done! Successfully merged ${mergedCount} scored profiles.`);
    console.log(`  Saved back to: ${BATCH_FILE}`);
    console.log("=".repeat(60) + "\n");
}

run().catch(console.error);
