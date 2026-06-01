require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

// ─── Configuration & CLI Arguments ────────────────────────────────────────────

// Supports passing command line arguments:
//   Standard execution: node tam/batch.js <inputFile.json> [startIndex] [endIndex]
//   Retrieve execution: node tam/batch.js --retrieve "batchId1,batchId2,..." <inputFile.json>

const RETRIEVE_MODE = process.argv[2] === "--retrieve";
let BATCH_IDS_STR = null;
let INPUT_FILENAME = null;
let START_INDEX = 0;
let END_INDEX = 200;

if (RETRIEVE_MODE) {
    BATCH_IDS_STR = process.argv[3];
    INPUT_FILENAME = process.argv[4];
    if (!BATCH_IDS_STR || !INPUT_FILENAME) {
        console.error("Usage to retrieve: node tam/batch.js --retrieve \"batchId1,batchId2,...\" <inputFile.json>");
        process.exit(1);
    }
} else {
    INPUT_FILENAME = process.argv[2];
    if (!INPUT_FILENAME) {
        console.error("Usage: node tam/batch.js <inputFile.json> [startIndex] [endIndex]");
        console.error("   or: node tam/batch.js --retrieve \"batchId1,batchId2,...\" <inputFile.json>");
        process.exit(1);
    }
    START_INDEX = parseInt(process.argv[3] ?? 0, 10);
    END_INDEX = parseInt(process.argv[4] ?? 200, 10);
}

// Anthropic model to use
const ANTHROPIC_MODEL = "claude-haiku-4-5";

// Max items per batch submission (to stay well below 256MB request body and Node.js string limits)
const CHUNK_SIZE = 3000; 

// ─── Paths ────────────────────────────────────────────────────────────────────

const INPUT_FILE = path.resolve(process.cwd(), INPUT_FILENAME);
const OUTPUT_FILE = INPUT_FILE;
const PROMPT_FILE = path.join(__dirname, "ai.md");

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reads the system prompt from ai.md.
 * Throws if the file is missing or empty.
 */
function loadPrompt() {
    if (!fs.existsSync(PROMPT_FILE)) {
        throw new Error(`Prompt file not found: ${PROMPT_FILE}`);
    }
    const prompt = fs.readFileSync(PROMPT_FILE, "utf-8").trim();
    if (!prompt) {
        throw new Error(
            `Prompt file is empty: ${PROMPT_FILE}\nPlease add your scoring instructions to ai.md before running.`
        );
    }
    return prompt;
}

/**
 * Loads people across all sections of tier1.json within the [START_INDEX, END_INDEX) range.
 * Returns the parsed raw JSON and the selected items.
 */
function loadItems() {
    if (!fs.existsSync(INPUT_FILE)) {
        throw new Error(`Input file not found: ${INPUT_FILE}`);
    }
    const raw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

    const items = [];
    let globalIndex = 0;
    
    const isFlat = raw.length > 0 && raw[0].results === undefined;
    
    if (isFlat) {
        for (const person of raw) {
            if (globalIndex >= START_INDEX && globalIndex < END_INDEX) {
                if (!person.tier && !person.fit) {
                    items.push({ sectionLabel: "Flat", person, globalIndex });
                }
            }
            globalIndex++;
            if (globalIndex >= END_INDEX) break;
        }
    } else {
        for (const section of raw) {
            for (const person of section.results || []) {
                if (globalIndex >= START_INDEX && globalIndex < END_INDEX) {
                    if (!person.tier && !person.fit) {
                        items.push({ sectionLabel: section.section, person, globalIndex });
                    }
                }
                globalIndex++;
                if (globalIndex >= END_INDEX) break;
            }
            if (globalIndex >= END_INDEX) break;
        }
    }
    return { raw, items };
}

/**
 * Polls active batches until all are completed/ended.
 * 
 * @param {Anthropic} client 
 * @param {string[]} batchIds 
 */
async function pollBatches(client, batchIds) {
    console.log(`\nPolling status for ${batchIds.length} batch(es)...`);
    while (true) {
        let allEnded = true;
        const statusSummaries = [];
        
        for (const batchId of batchIds) {
            try {
                const status = await client.messages.batches.retrieve(batchId);
                const counts = status.request_counts;
                const progress = `${counts.succeeded + counts.errored + counts.canceled}/${counts.total}`;
                statusSummaries.push(
                    `${batchId.substring(0, 15)}... (${status.processing_status}: ${progress})`
                );
                
                if (status.processing_status !== "ended") {
                    allEnded = false;
                }
            } catch (err) {
                statusSummaries.push(`${batchId.substring(0, 15)}... (Error: ${err.message})`);
                allEnded = false;
            }
        }
        
        console.log(`  [${new Date().toLocaleTimeString()}] ` + statusSummaries.join(" | "));
        
        if (allEnded) {
            break;
        }
        
        await sleep(15000); // Poll every 15 seconds
    }
    console.log("\nAll batches have completed! Merging results...");
}

/**
 * Retrieves the batch results and merges them back into the original input JSON file.
 * 
 * @param {Anthropic} client 
 * @param {string[]} batchIds 
 */
async function processAndMergeResults(client, batchIds) {
    console.log(`\n  Downloading results for ${batchIds.length} batch(es)...`);
    
    const scoredUpdates = new Map();
    const counts = { "Tier 1": 0, "Tier 2": 0, "Industry Partner": 0, "DNC": 0, "error/other": 0 };
    let scoredCount = 0;

    for (const batchId of batchIds) {
        console.log(`    Downloading results for batch: ${batchId}...`);
        try {
            const results = await client.messages.batches.results(batchId);
            
            for await (const entry of results) {
                const match = entry.custom_id.match(/^item_(\d+)$/);
                if (!match) continue;
                const globalIndex = parseInt(match[1], 10);
                scoredCount++;

                if (entry.result.type === "succeeded") {
                    let rawText = entry.result.message.content[0]?.text?.trim() ?? "";
                    
                    // Strip potential markdown code block formatting if the model included it
                    if (rawText.startsWith("```")) {
                        rawText = rawText.replace(/^```[a-z]*\n/, "").replace(/\n```$/, "");
                    }

                    try {
                        const fitData = JSON.parse(rawText);
                        scoredUpdates.set(globalIndex, fitData);

                        const tier = fitData?.tier ?? "Unknown";
                        if (counts[tier] !== undefined) {
                            counts[tier]++;
                        } else {
                            counts["error/other"]++;
                        }
                    } catch (err) {
                        console.warn(`  ⚠ Failed to parse JSON output for custom_id ${entry.custom_id}. Raw text:\n${rawText}`);
                        const fallback = {
                            qualification_score: 0,
                            tier: "DNC",
                            confidence: "low",
                            reasoning: `Parsing error: ${err.message}. Raw output: ${rawText}`,
                        };
                        scoredUpdates.set(globalIndex, fallback);
                        counts["DNC"]++;
                    }
                } else {
                    console.error(`  ✗ Request failed for custom_id ${entry.custom_id}:`, entry.result.error);
                    const fallback = {
                        qualification_score: 0,
                        tier: "DNC",
                        confidence: "low",
                        reasoning: `Anthropic API error: ${JSON.stringify(entry.result.error)}`,
                    };
                    scoredUpdates.set(globalIndex, fallback);
                    counts["error/other"]++;
                }
            }
        } catch (err) {
            console.error(`  ✗ Failed to retrieve batch results for ${batchId}: ${err.message}`);
            process.exit(1);
        }
    }

    if (scoredUpdates.size === 0) {
        console.log(`\n  ⚠ No successful results retrieved. Nothing to merge.`);
        return;
    }

    // Safe Concurrent Merge: Re-read the target file fresh from disk right before writing
    // to ensure updates saved by concurrent terminal processes are preserved perfectly.
    console.log(`\n  Merging results safely onto latest snapshot of ${path.basename(INPUT_FILE)}...`);
    
    if (!fs.existsSync(INPUT_FILE)) {
        throw new Error(`Input file not found for merge: ${INPUT_FILE}`);
    }
    const latestRaw = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
    let curGlobalIndex = 0;
    const isFlat = latestRaw.length > 0 && latestRaw[0].results === undefined;
    
    if (isFlat) {
        for (const person of latestRaw) {
            if (scoredUpdates.has(curGlobalIndex)) {
                const fitData = scoredUpdates.get(curGlobalIndex);
                if (fitData && typeof fitData === "object") {
                    const aiKeys = ["fit", ...Object.keys(fitData)];
                    for (const k of aiKeys) delete person[k];

                    Object.assign(person, fitData);
                    person.fit = fitData.tier ?? null;
                } else {
                    delete person.fit;
                    person.fit = null;
                }
            }
            curGlobalIndex++;
        }
    } else {
        for (const section of latestRaw) {
            for (const person of section.results || []) {
                if (scoredUpdates.has(curGlobalIndex)) {
                    const fitData = scoredUpdates.get(curGlobalIndex);
                    if (fitData && typeof fitData === "object") {
                        const aiKeys = ["fit", ...Object.keys(fitData)];
                        for (const k of aiKeys) delete person[k];

                        Object.assign(person, fitData);
                        person.fit = fitData.tier ?? null;
                    } else {
                        delete person.fit;
                        person.fit = null;
                    }
                }
                curGlobalIndex++;
            }
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(latestRaw, null, 2), "utf-8");

    console.log("\n" + "=".repeat(60));
    console.log(`  Done! ${scoredCount} people scored across all batches.`);
    console.log(`  Tier 1: ${counts["Tier 1"]}  Tier 2: ${counts["Tier 2"]}  Industry Partner: ${counts["Industry Partner"]}  DNC: ${counts["DNC"]}  Errors/Other: ${counts["error/other"]}`);
    console.log(`  → ${OUTPUT_FILE} updated`);
    console.log("=".repeat(60) + "\n");
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
        console.error("Error: ANTHROPIC_API_KEY environment variable is not set.");
        process.exit(1);
    }

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    if (RETRIEVE_MODE) {
        const batchIds = BATCH_IDS_STR.split(",").map(id => id.trim()).filter(Boolean);
        console.log("=".repeat(60));
        console.log(`  Retrieving Anthropic Message Batches`);
        console.log(`  Batch IDs:   ${batchIds.join(", ")}`);
        console.log(`  Target file: ${INPUT_FILE}`);
        console.log("=".repeat(60));

        await pollBatches(client, batchIds);
        await processAndMergeResults(client, batchIds);
        return;
    }

    // Load prompt and data
    const systemPrompt = loadPrompt();
    const { raw, items } = loadItems();

    if (items.length === 0) {
        console.log("No new profiles to evaluate (all profiles have 'tier' or 'fit' set).");
        process.exit(0);
    }

    console.log("=".repeat(60));
    console.log("  Tier 1 AI Fit Scorer (Batch Mode)");
    console.log(`  Model:         ${ANTHROPIC_MODEL}`);
    console.log(`  Range:         [${START_INDEX}, ${END_INDEX}) (${items.length} items selected)`);
    console.log(`  Prompt file:   ${PROMPT_FILE}`);
    console.log(`  Target file:   ${INPUT_FILE}`);
    console.log("=".repeat(60));

    // Chunking the items
    const chunks = [];
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
        chunks.push(items.slice(i, i + CHUNK_SIZE));
    }

    console.log(`\nSplitting ${items.length} items into ${chunks.length} batch(es) (Max ${CHUNK_SIZE} per batch)...`);

    const activeBatches = [];

    // Create each batch
    for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`Preparing batch ${i + 1}/${chunks.length} (${chunk.length} requests)...`);
        
        const requests = chunk.map(({ person, globalIndex }) => {
            const userMessage = `Here is the LinkedIn profile data to evaluate:\n\n${JSON.stringify(person, null, 2)}`;
            return {
                custom_id: `item_${globalIndex}`,
                params: {
                    model: ANTHROPIC_MODEL,
                    max_tokens: 1500,
                    system: [
                        {
                            type: "text",
                            text: systemPrompt,
                            cache_control: { type: "ephemeral" }
                        }
                    ],
                    messages: [{ role: "user", content: userMessage }],
                }
            };
        });

        console.log(`Submitting batch ${i + 1}/${chunks.length} to Anthropic...`);
        try {
            const batch = await client.messages.batches.create({ requests });
            console.log(`  → Batch ${i + 1} created: ${batch.id}`);
            activeBatches.push(batch.id);
            if (i < chunks.length - 1) await sleep(2000);
        } catch (err) {
            console.error(`✗ Failed to create batch ${i + 1}: ${err.message}`);
            // If any batch creation fails, we exit to prevent half-created flows
            process.exit(1);
        }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`  All batches submitted successfully!`);
    console.log(`  Batch IDs:     ${activeBatches.join(",")}`);
    console.log(`\n  To retrieve status later or if this script is interrupted, run:`);
    console.log(`  node --max-old-space-size=4096 tam/batch.js --retrieve "${activeBatches.join(",")}" ${INPUT_FILENAME}`);
    console.log("=".repeat(60) + "\n");

    // Start polling and processing
    await pollBatches(client, activeBatches);
    await processAndMergeResults(client, activeBatches);
}

main();
