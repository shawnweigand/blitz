const fs = require("fs");
const path = require("path");

// ─── Usage ────────────────────────────────────────────────────────────────────
// node AUTOMATES/json-to-csv.js <folder>
// Example: node AUTOMATES/json-to-csv.js AUTOMATES/coaching
// ─────────────────────────────────────────────────────────────────────────────

const folderArg = process.argv[2];

if (!folderArg) {
  console.error("Usage: node AUTOMATES/json-to-csv.js <folder>");
  console.error("Example: node AUTOMATES/json-to-csv.js AUTOMATES/coaching");
  process.exit(1);
}

const folderPath = path.resolve(folderArg);

if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
  console.error(`Error: "${folderPath}" is not a valid directory.`);
  process.exit(1);
}

// ─── Find all JSON files in the folder ───────────────────────────────────────
const jsonFiles = fs
  .readdirSync(folderPath)
  .filter((f) => f.endsWith(".json"))
  .map((f) => path.join(folderPath, f));

if (jsonFiles.length === 0) {
  console.error(`No JSON files found in "${folderPath}".`);
  process.exit(1);
}

console.log(`Found ${jsonFiles.length} JSON file(s):`);
jsonFiles.forEach((f) => console.log(`  • ${path.basename(f)}`));

// ─── Load and merge all records ───────────────────────────────────────────────
let allRecords = [];

for (const file of jsonFiles) {
  try {
    const raw = fs.readFileSync(file, "utf-8");
    const parsed = JSON.parse(raw);
    const records = Array.isArray(parsed) ? parsed : [parsed];
    console.log(`  Loaded ${records.length} record(s) from ${path.basename(file)}`);
    allRecords = allRecords.concat(records);
  } catch (err) {
    console.warn(`  ⚠ Could not parse ${path.basename(file)}: ${err.message} — skipping.`);
  }
}

if (allRecords.length === 0) {
  console.error("No records found across all JSON files.");
  process.exit(1);
}

// ─── Flatten a record ─────────────────────────────────────────────────────────
// Nested objects (e.g. location: { city, state_code }) become location.city, etc.
function flatten(obj, prefix = "") {
  const out = {};
  for (const [key, value] of Object.entries(obj ?? {})) {
    const col = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(out, flatten(value, col));
    } else if (Array.isArray(value)) {
      out[col] = value.join("; ");
    } else {
      out[col] = value ?? "";
    }
  }
  return out;
}

// ─── CSV cell escaping ────────────────────────────────────────────────────────
function escapeCell(value) {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// ─── Collect columns (insertion-order via Map) ───────────────────────────────
console.log("\nScanning columns...");
const colMap = new Map();
for (const record of allRecords) {
  for (const key of Object.keys(flatten(record))) {
    colMap.set(key, true);
  }
}
const columns = [...colMap.keys()];

console.log(`Columns (${columns.length}): ${columns.join(", ")}`);

// ─── Write CSV line-by-line (streaming) ───────────────────────────────────────
const outputPath = path.join(folderPath, "results.csv");
const stream = fs.createWriteStream(outputPath, { encoding: "utf8" });

// Header
stream.write(columns.map(escapeCell).join(",") + "\n");

// Rows
let rowCount = 0;
for (const record of allRecords) {
  const flat = flatten(record);
  const row = columns.map((col) => escapeCell(flat[col] ?? "")).join(",");
  stream.write(row + "\n");
  rowCount++;
}

stream.end(() => {
  console.log(`\n✅ Done! ${rowCount} rows written to:`);
  console.log(`   ${outputPath}`);
});
