require("dotenv").config();
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.BLITZ_API_KEY;
const EMAIL_API_URL = "https://api.blitz-api.ai/v2/enrichment/email";
const PHONE_API_URL = "https://api.blitz-api.ai/v2/enrichment/phone";

// Input: flat array of LinkedIn profile URL strings
// e.g. ["https://www.linkedin.com/in/someone", ...]
const INPUT_FILE = "./people/people.json";

// Output: enriched results
const OUTPUT_FILE = "./results/enrich-results.json";

// Rate limit: 5 req/s — email + phone fire in parallel per person, throttled between people
const MIN_REQUEST_GAP_MS = 300;
let lastRequestTime = 0;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function throttle() {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < MIN_REQUEST_GAP_MS) {
    await sleep(MIN_REQUEST_GAP_MS - elapsed);
  }
  lastRequestTime = Date.now();
}

async function postEnrichment(url, linkedinUrl) {
  let attempt = 0;
  while (true) {
    await throttle();
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ person_linkedin_url: linkedinUrl }),
    });

    if (response.status === 429) {
      attempt++;
      const backoff = Math.min(1000 * 2 ** attempt, 30000);
      console.warn(`  ⚠ Rate limited. Retrying in ${backoff / 1000}s (attempt ${attempt})...`);
      await sleep(backoff);
      continue;
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`HTTP ${response.status}: ${error.message || response.statusText}`);
    }

    return response.json();
  }
}

async function enrichProfile(linkedinUrl) {
  const [emailData, phoneData] = await Promise.all([
    postEnrichment(EMAIL_API_URL, linkedinUrl),
    postEnrichment(PHONE_API_URL, linkedinUrl),
  ]);

  return {
    linkedin_url: linkedinUrl,
    email: emailData.found ? emailData.email : null,
    all_emails: emailData.found ? emailData.all_emails : [],
    phone: phoneData.found ? phoneData.phone : null,
  };
}

async function main() {
  if (!API_KEY) {
    console.error("Error: BLITZ_API_KEY environment variable is not set.");
    process.exit(1);
  }

  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`Error: Input file not found: ${INPUT_FILE}`);
    process.exit(1);
  }

  const profiles = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));

  if (!Array.isArray(profiles) || profiles.some((p) => typeof p !== "string")) {
    console.error("Error: Input file must be a JSON array of LinkedIn URL strings.");
    process.exit(1);
  }

  console.log(`Loaded ${profiles.length} LinkedIn profile(s) from ${INPUT_FILE}`);

  // Load existing results to allow resuming
  let existingResults = [];
  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingResults = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
      console.log(`Loaded ${existingResults.length} existing result(s) from ${OUTPUT_FILE}`);
    } catch {
      console.warn(`Could not parse existing ${OUTPUT_FILE} — starting fresh.`);
    }
  }

  const alreadyEnriched = new Map(existingResults.map((r) => [r.linkedin_url, r]));
  const allResults = [...existingResults];

  let emailFound = 0;
  let phoneFound = 0;

  for (let i = 0; i < profiles.length; i++) {
    const linkedinUrl = profiles[i];

    if (alreadyEnriched.has(linkedinUrl)) {
      const cached = alreadyEnriched.get(linkedinUrl);
      console.log(`[${i + 1}/${profiles.length}] Skipping (already enriched): ${linkedinUrl}`);
      if (cached.email) emailFound++;
      if (cached.phone) phoneFound++;
      continue;
    }

    console.log(`[${i + 1}/${profiles.length}] Enriching: ${linkedinUrl}`);

    try {
      const result = await enrichProfile(linkedinUrl);
      allResults.push(result);

      if (result.email) emailFound++;
      if (result.phone) phoneFound++;

      console.log(`  → email: ${result.email ?? "not found"} | phone: ${result.phone ?? "not found"}`);
    } catch (err) {
      console.error(`  ✗ Error: ${err.message}`);
      allResults.push({ linkedin_url: linkedinUrl, email: null, all_emails: [], phone: null, error: err.message });
    }

    // Save progress after each profile in case of interruption
    fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2));
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allResults, null, 2));
  console.log(`\nDone! Results saved to ${OUTPUT_FILE}`);
  console.log(
    `Summary: ${profiles.length} profiles | ${emailFound} emails found | ${phoneFound} phones found`
  );
}

main();
