require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

// ─── Configuration ────────────────────────────────────────────────────────────

// Supports passing command line arguments: node tam/ai.js <inputFile> <startIndex> <endIndex>
// Example: node tam/ai.js tam/tier1/tier1.json 0 25
const INPUT_FILENAME = process.argv[2];

if (!INPUT_FILENAME) {
    console.error("Usage: node tam/ai.js <inputFile.json> [startIndex] [endIndex]");
    process.exit(1);
}

const START_INDEX = parseInt(process.argv[3] ?? 0, 10);
const END_INDEX = parseInt(process.argv[4] ?? 200, 10);

// Anthropic model to use
const ANTHROPIC_MODEL = "claude-haiku-4-5";

// ─── Paths ────────────────────────────────────────────────────────────────────

const INPUT_FILE = path.resolve(process.cwd(), INPUT_FILENAME);
const parsedPath = path.parse(INPUT_FILE);
const OUTPUT_FILE = INPUT_FILE;

const PROMPT_FILE = path.join(__dirname, "ai.md");

// ─── Utilities ────────────────────────────────────────────────────────────────

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Reads the system prompt from tier1.md.
 * Throws if the file is missing or empty.
 */
function loadPrompt() {
    if (!fs.existsSync(PROMPT_FILE)) {
        throw new Error(`Prompt file not found: ${PROMPT_FILE}`);
    }
    const prompt = fs.readFileSync(PROMPT_FILE, "utf-8").trim();
    if (!prompt) {
        throw new Error(
            `Prompt file is empty: ${PROMPT_FILE}\nPlease add your scoring instructions to tier1.md before running.`
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
 * Calls Claude to score a single person profile.
 * Returns the parsed JSON qualification object.
 *
 * @param {Anthropic} client
 * @param {string} systemPrompt
 * @param {object} person
 * @returns {Promise<object>}
 */
async function scorePerson(client, systemPrompt, person) {
    const userMessage = `Here is the LinkedIn profile data to evaluate:\n\n${JSON.stringify(person, null, 2)}`;

    const response = await client.messages.create({
        model: ANTHROPIC_MODEL,
        max_tokens: 1500, // Increased to accommodate full JSON response with reasoning
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
    });

    let raw = response.content[0]?.text?.trim() ?? "";

    // Strip potential markdown code block formatting if the model included it
    if (raw.startsWith("```")) {
        raw = raw.replace(/^```[a-z]*\n/, "").replace(/\n```$/, "");
    }

    try {
        return JSON.parse(raw);
    } catch (err) {
        console.warn(`  ⚠ Failed to parse JSON output for ${person.full_name}. Raw text:\n${raw}`);
        // Return a fallback object preserving the raw text so data isn't lost
        return {
            qualification_score: 0,
            tier: "DNC",
            confidence: "low",
            reasoning: `Parsing error: ${err.message}. Raw output: ${raw}`,
        };
    }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
    if (!ANTHROPIC_API_KEY) {
        console.error("Error: ANTHROPIC_API_KEY environment variable is not set.");
        process.exit(1);
    }

    // Load prompt and data
    const systemPrompt = loadPrompt();
    const { raw, items } = loadItems();

    console.log("=".repeat(60));
    console.log("  Tier 1 AI Fit Scorer");
    console.log(`  Model:         ${ANTHROPIC_MODEL}`);
    console.log(`  Range:         [${START_INDEX}, ${END_INDEX}) (${items.length} items selected)`);
    console.log(`  Prompt file:   ${PROMPT_FILE}`);
    console.log(`  Target file:   ${INPUT_FILE}`);
    console.log("=".repeat(60));

    const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

    // Process each person
    let scoredCount = 0;
    const counts = { "Tier 1": 0, "Tier 2": 0, "Industry Partner": 0, "DNC": 0, "error/other": 0 };
    const scoredUpdates = new Map();

    for (let i = 0; i < items.length; i++) {
        const { person, globalIndex } = items[i];
        const name = person.full_name || `Person ${globalIndex}`;
        process.stdout.write(`  [Item ${globalIndex}] Scoring ${name}... `);

        try {
            const fitData = await scorePerson(client, systemPrompt, person);
            scoredUpdates.set(globalIndex, fitData);

            const tier = fitData?.tier ?? "Unknown";
            const score = fitData?.qualification_score ?? "?";
            if (counts[tier] !== undefined) {
                counts[tier]++;
            } else {
                counts["error/other"]++;
            }
            console.log(`→ ${tier} (Score: ${score})`);
        } catch (err) {
            console.error(`\n  ✗ Failed to score ${name}: ${err.message}`);
            scoredUpdates.set(globalIndex, null);
            counts["error/other"]++;
        }

        scoredCount++;

        // Small delay to stay within rate limits
        if (i < items.length - 1) await sleep(300);
    }

    // Safe Concurrent Merge: Re-read the target file fresh from disk right before writing
    // to ensure updates saved by concurrent terminal processes are preserved perfectly.
    console.log(`\n  Merging results safely onto latest snapshot of ${path.basename(INPUT_FILE)}...`);
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
    console.log(`  Done! ${scoredCount} people scored.`);
    console.log(`  Tier 1: ${counts["Tier 1"]}  Tier 2: ${counts["Tier 2"]}  Industry Partner: ${counts["Industry Partner"]}  DNC: ${counts["DNC"]}  Errors/Other: ${counts["error/other"]}`);
    console.log(`  → ${OUTPUT_FILE} updated`);
    console.log("=".repeat(60) + "\n");
}

main();
