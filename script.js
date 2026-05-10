require("dotenv").config();
const fs = require("fs");
const path = require("path");

const API_KEY = process.env.BLITZ_API_KEY;
const API_URL = "https://api.blitz-api.ai/v2/search/people";

const companies = JSON.parse(fs.readFileSync("./companies.json", "utf-8"));

const JOB_TITLES = [
  "Events",
  "Experiential Marketing",
  "Brand Marketing",
  "Executive Assistant to C-suite",
  "Chief of Staff",
];

const EXCLUDE_TITLES = ["intern"];

// Rate limit: 5 req/s — enforce a minimum gap between the START of each request.
// 300ms gap = ~3.3 req/s, giving a comfortable buffer under the 5 req/s cap.
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

async function findPeopleAtCompany(company) {
  const payload = {
    company: {
      linkedin_url: [company.linkedin],
      min_linkedin_followers: 1,
    },
    people: {
      job_title: {
        include: JOB_TITLES,
        include_linkedin_headline: false,
        exclude: EXCLUDE_TITLES,
      },
      location: {
        country_code: ["US"],
      },
    },
    max_results: 5,
    cursor: null,
  };

  // Retry on 429 with exponential backoff
  let attempt = 0;
  while (true) {
    await throttle();
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (response.status === 429) {
      attempt++;
      const backoff = Math.min(1000 * 2 ** attempt, 30000); // up to 30s
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

async function main() {
  if (!API_KEY) {
    console.error("Error: BLITZ_API_KEY environment variable is not set.");
    process.exit(1);
  }

  // Load existing results to avoid re-fetching companies already looked up
  const resultsPath = path.join(__dirname, "results.json");
  let existingResults = [];
  if (fs.existsSync(resultsPath)) {
    try {
      existingResults = JSON.parse(fs.readFileSync(resultsPath, "utf-8"));
      console.log(`Loaded ${existingResults.length} existing result(s) from results.json`);
    } catch {
      console.warn("Could not parse existing results.json — starting fresh.");
    }
  }
  const alreadyFetched = new Set(existingResults.map((r) => r.linkedin));

  const allResults = [...existingResults];


  for (let i = 0; i < companies.length; i++) {
    const company = companies[i];
    // Support both "name" and "company" as the key for the company name
    const companyName = company.name || company.company;

    if (alreadyFetched.has(company.linkedin)) {
      console.log(`[${i + 1}/${companies.length}] Skipping (already fetched): ${companyName}`);
      continue;
    }

    console.log(`[${i + 1}/${companies.length}] Searching: ${companyName} (${company.linkedin})`);

    try {
      const data = await findPeopleAtCompany(company);
      const people = data.results || [];

      console.log(`  → Found ${people.length} person(s)`);

      allResults.push({
        company: companyName,
        linkedin: company.linkedin,
        industry: company.industry,
        people: people.map((p) => ({
          full_name: p.full_name,
          job_title: p.experiences?.[0]?.job_title ?? null,
          linkedin_url: p.linkedin_url,
          location: p.location,
          headline: p.headline,
        })),
      });
    } catch (err) {
      console.error(`  ✗ Error for ${companyName}: ${err.message}`);
      allResults.push({
        company: companyName,
        linkedin: company.linkedin,
        industry: company.industry,
        error: err.message,
        people: [],
      });
    }

    // Throttling is handled inside findPeopleAtCompany via throttle()
  }

  const outputPath = path.join(__dirname, "results.json");
  fs.writeFileSync(outputPath, JSON.stringify(allResults, null, 2));
  console.log(`\nDone! Results saved to ${outputPath}`);

  // Print a summary
  const totalPeople = allResults.reduce((sum, r) => sum + r.people.length, 0);
  const companiesWithResults = allResults.filter((r) => r.people.length > 0).length;
  console.log(`Summary: ${totalPeople} people found across ${companiesWithResults}/${companies.length} companies.`);
}

main();
