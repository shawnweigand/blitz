require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });
const fs = require("fs");
const path = require("path");

// ─── Configuration ────────────────────────────────────────────────────────────

const API_KEY = process.env.BLITZ_API_KEY;
const API_URL = "https://api.blitz-api.ai/v2/search/people";

const OUTPUT_FILE = path.join(__dirname, "tier1.json");

// Maximum people returned per API request (API max is 50)
const MAX_RESULTS_PER_REQUEST = 50;

// Pagination continues until the API returns no cursor (all results collected).

// Rate limit: 5 req/s — enforce a minimum gap between requests.
// 250 ms gap ≈ 4 req/s, comfortably under the 5 req/s cap.
const MIN_REQUEST_GAP_MS = 250;
let lastRequestTime = 0;

// ─── Industry Exclusions ──────────────────────────────────────────────────────
// Shared across all sections. Uses exact API enum strings (semicolons, not commas).

const INDUSTRY_EXCLUDE = [
  // Manufacturing subcategories
  "Primary Metal Manufacturing",
  "Fabricated Metal Products",
  "Cutlery and Handtool Manufacturing",
  "Spring and Wire Product Manufacturing",
  "Turned Products and Fastener Manufacturing",
  "Architectural and Structural Metal Manufacturing",
  "Metal Valve; Ball; and Roller Manufacturing",
  "Boilers; Tanks; and Shipping Container Manufacturing",
  "Metal Treatments",
  "Magnetic and Optical Media Manufacturing",
  "Glass; Ceramics and Concrete Manufacturing",
  "Glass; Ceramics and Concrete",
  "Glass Product Manufacturing",
  "Lime and Gypsum Products Manufacturing",
  "Clay and Refractory Products Manufacturing",
  "Abrasives and Nonmetallic Minerals Manufacturing",
  "Oil and Coal Product Manufacturing",
  "Plastics and Rubber Product Manufacturing",
  "Plastics",
  "Plastics Manufacturing",
  "Rubber Products Manufacturing",
  "Wood Product Manufacturing",
  "Artificial Rubber and Synthetic Fiber Manufacturing",
  "Chemical Raw Materials Manufacturing",
  "Agricultural Chemical Manufacturing",
  "Agriculture; Construction; Mining Machinery Manufacturing",
  "Commercial and Service Industry Machinery Manufacturing",
  "Engines and Power Transmission Equipment Manufacturing",
  "HVAC and Refrigeration Equipment Manufacturing",
  "Industrial Machinery Manufacturing",
  "Metalworking Machinery Manufacturing",
  "Automation Machinery Manufacturing",
  "Electrical Equipment Manufacturing",
  "Fuel Cell Manufacturing",
  "Electric Lighting Equipment Manufacturing",
  "Transportation Equipment Manufacturing",
  "Railroad Equipment Manufacturing",
  "Shipbuilding",
  "Motor Vehicle Parts Manufacturing",
  "Animal Feed Manufacturing",
  // Construction (parent + all subcategories)
  "Construction",
  "Building Construction",
  "Nonresidential Building Construction",
  "Residential Building Construction",
  "Civil Engineering",
  "Highway; Street; and Bridge Construction",
  "Subdivision of Land",
  "Utility System Construction",
  "Specialty Trade Contractors",
  "Building Equipment Contractors",
  "Building Finishing Contractors",
  "Building Structure and Exterior Contractors",
  // Transportation & Logistics subcategories
  "Freight and Package Transportation",
  "Truck Transportation",
  "Warehousing and Storage",
  "Warehousing",
  "Ground Passenger Transportation",
  "Interurban and Rural Bus Services",
  "School and Employee Bus Services",
  "Shuttles and Special Needs Transportation Services",
  "Urban Transit Services",
  "Maritime Transportation",
  "Pipeline Transportation",
  "Rail Transportation",
  // Oil, Gas & Mining (parent + children)
  "Oil; Gas; and Mining",
  "Mining",
  "Coal Mining",
  "Metal Ore Mining",
  "Nonmetallic Mineral Mining",
  "Oil and Gas",
  "Natural Gas Extraction",
  "Oil Extraction",
  // Utilities (parent + children)
  "Utilities",
  "Electric Power Generation",
  "Fossil Fuel Electric Power Generation",
  "Nuclear Electric Power Generation",
  "Biomass Electric Power Generation",
  "Geothermal Electric Power Generation",
  "Hydroelectric Power Generation",
  "Wind Electric Power Generation",
  "Solar Electric Power Generation",
  "Electric Power Transmission; Control; and Distribution",
  "Natural Gas Distribution",
  "Water; Waste; Steam; and Air Conditioning Services",
  "Steam and Air-Conditioning Supply",
  "Waste Collection",
  "Utilities Administration",
  // Farming, Ranching, Forestry (parent + children)
  "Farming; Ranching; Forestry",
  "Farming",
  "Horticulture",
  "Forestry and Logging",
  "Ranching and Fisheries",
  "Fisheries",
  "Fishery",
  "Ranching",
  // Accommodation & Food Services
  "Hospitality",
  "Hotels and Motels",
  "Bed-and-Breakfasts; Hostels; Homestays",
  "Food and Beverage Services",
  "Bars; Taverns; and Nightclubs",
  "Caterers",
  "Mobile Food Services",
  "Restaurants",
  // Government (parent + children)
  "Government Administration",
  "Administration of Justice",
  "Economic Programs",
  "Transportation Programs",
  "Environmental Quality Programs",
  "Air; Water; and Waste Program Management",
  "Conservation Programs",
  "Health and Human Services",
  "Education Administration Programs",
  "Public Assistance Programs",
  "Public Health",
  "Housing and Community Development",
  "Community Development and Urban Planning",
  "Housing Programs",
  "Military and International Affairs",
  "Public Policy Offices",
  "Executive Offices",
  "Legislative Offices",
  "Space Research and Technology",
  // Hospitals & Health Care subcategories
  "Community Services",
  "Services for the Elderly and Disabled",
  "Individual and Family Services",
  "Emergency and Relief Services",
  "Vocational Rehabilitation Services",
  "Alternative Medicine",
  "Ambulance Services",
  "Chiropractors",
  "Dentists",
  "Family Planning Centers",
  "Home Health Care Services",
  "Medical and Diagnostic Laboratories",
  "Mental Health Care",
  "Optometrists",
  "Outpatient Care Centers",
  "Physical; Occupational and Speech Therapists",
  "Physicians",
  "Nursing Homes and Residential Care Facilities",
  "Medical Practices",
  // Education subcategories
  "Primary and Secondary Education",
  "Child Day Care Services",
  "Higher Education",
  "Technical and Vocational Training",
  "Cosmetology and Barber Schools",
  "Flight Training",
  "Language Schools",
  "Secretarial Schools",
  "Sports and Recreation Instruction",
  // Entertainment subcategories
  "Circuses and Magic Shows",
  "Racetracks",
  "Amusement Parks and Arcades",
  "Golf Courses and Country Clubs",
  "Skiing Facilities",
  // Admin & Support subcategories
  "Collection Agencies",
  "Office Administration",
  "Janitorial Services",
  "Landscaping Services",
  "Security and Investigations",
  "Security Guards and Patrol Services",
  "Security Systems Services",
  "Telephone Call Centers",
  "Writing and Editing",
  "Translation and Localization",
  "Temporary Help Services",
  // Personal & Laundry Services
  "Personal and Laundry Services",
  "Laundry and Drycleaning Services",
  "Personal Care Services",
  // Repair & Maintenance subcategories
  "Repair and Maintenance",
  "Vehicle Repair and Maintenance",
  "Commercial and Industrial Machinery Maintenance",
  "Electronic and Precision Equipment Maintenance",
  "Footwear and Leather Goods Repair",
  "Reupholstery and Furniture Repair",
  // Financial Services subcategories
  "Loan Brokers",
  "Savings Institutions",
  "Claims Adjusting; Actuarial Services",
  "Pension Funds",
  "Insurance and Employee Benefit Funds",
  // Professional Services subcategories
  "Outsourcing and Offshoring Consulting",
  "Surveying and Mapping Services",
  "IT System Data Services",
  "IT System Installation and Disposal",
  "IT System Operations and Maintenance",
  "IT System Testing and Evaluation",
  "IT System Training and Support",
  "Alternative Dispute Resolution",
  "Nanotechnology Research",
  "Veterinary Services",
  // Real Estate subcategories
  "Commercial and Industrial Equipment Rental",
  "Consumer Goods Rental",
  "Leasing Residential Real Estate",
  // Retail subcategories
  "Retail Art Supplies",
  "Retail Building Materials and Garden Equipment",
  "Retail Gasoline",
  "Retail Pharmacies",
  "Retail Musical Instruments",
  "Retail Office Equipment",
  "Retail Office Supplies and Gifts",
  "Retail Recyclable Materials and Used Merchandise",
  // Technology/Media subcategories
  "Sheet Music Publishing",
  "Blogs",
  "Embedded Software Products",
  // Other
  "Facilities Services",
  "Religious Institutions",
  "Gambling Facilities and Casinos",
  "Household Services",
  "Pet Services",
  "Wellness and Fitness Services",
  "Photography",
  "Retail Florists",
  "Equipment Rental Services",
  "Law Enforcement",
  "Armed Forces",
  "Public Safety",
  "Correctional Institutions",
  "Fire Protection",
  "Courts of Law",
  "Libraries",
  "Museums",
  "Museums and Institutions",
  "Historical Sites",
  "Zoos and Botanical Gardens",
  "Postal Services",
];

// ─── Search Sections ──────────────────────────────────────────────────────────
// Each section defines an independent search query.
// The script paginates each section until the API signals no more results.

const SECTIONS = [
  {
    label: "Field Marketing & Events - NYC Metro HQ",
    filters: {
      company: {
        hq: {
          city: {
            include: ["New York"],
          },
        },
        employee_range: ["11-50", "51-200", "201-500", "501-1000", "1001-5000"],
        industry: {
          exclude: INDUSTRY_EXCLUDE,
        },
      },
      people: {
        job_title: {
          include: [
            "Field Marketing",
            "Events",
            "Event",
            "Experiential",
            "Meeting",
            "Meetings",
          ],
          exclude: [
            "Stylist",
            "Florist",
            "Cater",
            "Photographer",
            "Videographer",
            "Security",
            "Rental",
            "Future",
          ],
          include_linkedin_headline: true,
        },
        location: {
          country_code: ["US"],
        },
      },
    },
  },
  {
    label: "Field Marketing & Events - Person in NYC",
    filters: {
      company: {
        employee_range: ["11-50", "51-200", "201-500", "501-1000", "1001-5000"],
        industry: {
          exclude: INDUSTRY_EXCLUDE,
        },
      },
      people: {
        job_title: {
          include: [
            "Field Marketing",
            "Events",
            "Event",
            "Experiential",
            "Meeting",
            "Meetings",
          ],
          exclude: [
            "Stylist",
            "Florist",
            "Cater",
            "Photographer",
            "Videographer",
            "Security",
            "Rental",
            "Future",
          ],
          include_linkedin_headline: true,
        },
        location: {
          city: ["New York"],
        },
      },
    },
  },
];

// ─── Utilities ────────────────────────────────────────────────────────────────

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

/**
 * Executes a single POST /v2/search/people request.
 * Retries automatically on 429 (rate-limited) with exponential backoff.
 *
 * @param {object} body - Full request body including filters, max_results, cursor
 * @returns {Promise<object>} Parsed JSON response
 */
async function searchPeople(body) {
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
      const backoff = Math.min(1000 * 2 ** attempt, 30000); // up to 30 s
      console.warn(
        `  ⚠ Rate limited. Retrying in ${backoff / 1000}s (attempt ${attempt})...`
      );
      await sleep(backoff);
      continue;
    }

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: response.statusText }));
      throw new Error(
        `HTTP ${response.status}: ${error.message || response.statusText}`
      );
    }

    return response.json();
  }
}

/**
 * Fetches all pages of people for a given section, following cursors until
 * the API signals there are no more results.
 *
 * @param {object} section - Section definition with `label` and `filters`
 * @returns {Promise<object[]>} Flat array of person result objects
 */
async function fetchSection(section) {
  const people = [];
  let cursor = null;
  let requestCount = 0;

  console.log(`\n[Section] ${section.label}`);

  while (true) {
    requestCount++;
    console.log(
      `  → Request ${requestCount}${cursor ? " (paginating)" : ""}...`
    );

    const body = {
      ...section.filters,
      max_results: MAX_RESULTS_PER_REQUEST,
      cursor,
    };

    const data = await searchPeople(body);
    const batch = data.results || [];
    people.push(...batch);

    console.log(
      `     Got ${batch.length} result(s). Total so far: ${people.length} | Total available: ${data.total_results ?? "?"}`
    );

    // Stop when the API signals no more pages
    if (!data.cursor) {
      console.log("  ✓ No more pages — section complete.");
      break;
    }

    cursor = data.cursor;
  }

  return people;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!API_KEY) {
    console.error("Error: BLITZ_API_KEY environment variable is not set.");
    process.exit(1);
  }

  console.log("=".repeat(60));
  console.log("  Blitz TAM People Search");
  console.log(`  Sections:              ${SECTIONS.length}`);
  console.log(`  Max results/request:   ${MAX_RESULTS_PER_REQUEST}`);
  console.log("  Pagination:            unlimited (until no cursor)");
  console.log("=".repeat(60));

  // ── Load existing results and build a dedup index keyed by linkedin_url ──
  let existingOutput = [];
  const seen = new Set();

  if (fs.existsSync(OUTPUT_FILE)) {
    try {
      existingOutput = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
      for (const { results } of existingOutput) {
        for (const person of results) {
          if (person.linkedin_url) seen.add(person.linkedin_url);
        }
      }
      console.log(`\n  Loaded existing results. ${seen.size} known people (will skip duplicates).`);
    } catch {
      console.warn("  ⚠ Could not parse existing tier1.json — starting fresh.");
      existingOutput = [];
    }
  }

  const output = [...existingOutput];
  let newPeople = 0;
  let skipped = 0;

  for (let i = 0; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    console.log(`\n[${i + 1}/${SECTIONS.length}] Processing section: "${section.label}"`);

    try {
      const people = await fetchSection(section);

      const fresh = people.filter((p) => {
        if (!p.linkedin_url || seen.has(p.linkedin_url)) {
          skipped++;
          return false;
        }
        seen.add(p.linkedin_url);
        return true;
      });

      newPeople += fresh.length;

      // Merge into existing section entry or create a new one
      const existing = output.find((o) => o.section === section.label);
      if (existing) {
        existing.results.push(...fresh);
      } else {
        output.push({ section: section.label, results: fresh });
      }

      // Write after every section so progress is preserved if the script is interrupted
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), "utf-8");

      console.log(`  ✓ Section complete. ${fresh.length} new people added (${skipped} duplicate(s) skipped). Results saved.`);
    } catch (err) {
      console.error(`  ✗ Section failed: ${err.message}`);
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log(`  Done! ${newPeople} new people added (${skipped} duplicate(s) skipped).`);
  console.log(`  ${OUTPUT_FILE}`);
  console.log("=".repeat(60) + "\n");
}

main();
