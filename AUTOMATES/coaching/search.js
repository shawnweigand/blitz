require("dotenv").config({ path: require("path").resolve(__dirname, "../../.env") });
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.BLITZ_API_KEY;
const API_URL = "https://api.blitz-api.ai/v2/search/people";

const OUTPUT_FILE = path.join(__dirname, "results.json");

// ─── Search Parameters ────────────────────────────────────────────────────────
// Mirrors LinkedIn Sales Navigator search:
// https://www.linkedin.com/sales/search/people?query=(
//   filters:List(
//     (type:CURRENT_TITLE,       values:List((text:Ceo),(text:founder)))
//     (type:INDUSTRY,            values:List((id:105, text:Professional Training and Coaching)))
//     (type:COMPANY_HEADCOUNT,   values:List((id:B, text:1-10)))
//     (type:REGION,              values:List((id:103644278, text:United States)))
//     (type:YEARS_AT_CURRENT_COMPANY, values:List((id:1,Less than 1 year),(id:2,1 to 2 years)))
//     (type:YEARS_IN_CURRENT_POSITION,values:List((id:2,1 to 2 years),(id:1,Less than 1 year)))
//   )
// )
// Note: YEARS_AT_CURRENT_COMPANY and YEARS_IN_CURRENT_POSITION are not exposed
// as direct API filters — the Blitz API maps them via experience data post-fetch.
// ─────────────────────────────────────────────────────────────────────────────

const PAYLOAD = {
  company: {
    industry: {
      include: ["Professional Training and Coaching"],
    },
    employee_range: ["1-10"],
  },
  people: {
    job_title: {
      // Use exact-match syntax ([...]) to stay tight to the LinkedIn filter
      include: ["[CEO]", "[Founder]", "[Co-Founder]"],
      include_linkedin_headline: false,
    },
    location: {
      country_code: ["US"],
    },
  },
  max_results: 50,
  cursor: null,
};

// ─── Rate limiting ────────────────────────────────────────────────────────────
const MIN_REQUEST_GAP_MS = 300; // ~3.3 req/s — safely under the 5 req/s cap
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

// ─── API call with retry on 429 ───────────────────────────────────────────────
async function fetchPage(cursor) {
  const body = { ...PAYLOAD, cursor };

  let attempt = 0;
  while (true) {
    await throttle();

    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(body),
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

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  if (!API_KEY) {
    console.error("Error: BLITZ_API_KEY environment variable is not set.");
    process.exit(1);
  }

  console.log("Starting search: CEOs/Founders in Professional Training & Coaching (1–10 employees, US)");
  console.log("─".repeat(70));

  const allPeople = [];
  let cursor = null;
  let page = 1;
  let totalResults = null;

  do {
    console.log(`Fetching page ${page}${cursor ? ` (cursor: ${cursor.slice(0, 20)}…)` : ""}...`);

    const data = await fetchPage(cursor);

    if (totalResults === null) {
      totalResults = data.total_results ?? "unknown";
      console.log(`Total results available: ${totalResults}`);
    }

    const people = data.results ?? [];
    console.log(`  → Page ${page}: ${people.length} person(s) returned`);

    for (const p of people) {
      allPeople.push({
        full_name: p.full_name,
        headline: p.headline ?? null,
        job_title: p.experiences?.[0]?.job_title ?? null,
        company_name: p.experiences?.[0]?.company_name ?? null,
        company_linkedin_url: p.experiences?.[0]?.company_linkedin_url ?? null,
        company_domain: p.experiences?.[0]?.company_domain ?? null,
        linkedin_url: p.linkedin_url,
        location: p.location ?? null,
        connections_count: p.connections_count ?? null,
      });
    }

    cursor = data.cursor ?? null;
    page++;
  } while (cursor !== null);

  console.log("─".repeat(70));
  console.log(`Done! ${allPeople.length} people collected across ${page - 1} page(s).`);

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allPeople, null, 2));
  console.log(`Results saved to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
