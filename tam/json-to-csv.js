#!/usr/bin/env node

/**
 * json-to-csv.js
 * Converts a JSON file to a CSV file of the same name in the same directory.
 *
 * Usage:
 *   node json-to-csv.js <filename.json>
 *   node json-to-csv.js tier1.json
 */

const fs = require('fs');
const path = require('path');

// --- Config ---
const jsonFileName = process.argv[2];

if (!jsonFileName) {
  console.error('Usage: node json-to-csv.js <filename.json>');
  process.exit(1);
}

const jsonFilePath = path.resolve(path.dirname(jsonFileName), path.basename(jsonFileName));
const csvFilePath = jsonFilePath.replace(/\.json$/i, '.csv');

if (!fs.existsSync(jsonFilePath)) {
  console.error(`File not found: ${jsonFilePath}`);
  process.exit(1);
}

// --- Load JSON ---
let data;
try {
  const raw = fs.readFileSync(jsonFilePath, 'utf-8');
  data = JSON.parse(raw);
} catch (err) {
  console.error(`Failed to parse JSON: ${err.message}`);
  process.exit(1);
}

// Normalize to array
if (!Array.isArray(data)) {
  data = [data];
}

if (data.length === 0) {
  console.warn('JSON array is empty. Writing empty CSV.');
  fs.writeFileSync(csvFilePath, '', 'utf-8');
  process.exit(0);
}

// --- Flatten nested objects ---
function flattenObject(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, key) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(acc, flattenObject(val, fullKey));
    } else if (Array.isArray(val)) {
      // Join arrays as pipe-separated strings
      acc[fullKey] = val
        .map((item) => (typeof item === 'object' ? JSON.stringify(item) : item))
        .join(' | ');
    } else {
      acc[fullKey] = val;
    }
    return acc;
  }, {});
}

// --- Expand results: each person in results[] becomes its own row ---
const flatRows = [];
const isFlat = data.length > 0 && data[0].results === undefined;

if (isFlat) {
  for (const person of data) {
    const section = person.section ?? '';
    const flat = flattenObject(person);
    flatRows.push({ section, ...flat });
  }
} else {
  for (const item of data) {
    const section = item.section ?? '';
    const results = Array.isArray(item.results) ? item.results : [];
    for (const person of results) {
      const flat = flattenObject(person);
      flatRows.push({ section, ...flat });
    }
  }
}

if (flatRows.length === 0) {
  console.warn('No results entries found. Writing empty CSV.');
  fs.writeFileSync(csvFilePath, '', 'utf-8');
  process.exit(0);
}

// --- Collect all headers across all rows ---
const rawHeaders = [...new Set(flatRows.flatMap((row) => Object.keys(row)))];

// Define AI qualification headers to enforce placing them at the far right of the CSV
const aiHeaders = [
  'fit',
  'qualification_score',
  'tier',
  'confidence',
  'title_match',
  'seniority_level',
  'geography_fit',
  'industry_partner_type',
  'disqualifier_flags',
  'reasoning',
];

const standardHeaders = rawHeaders.filter((h) => !aiHeaders.includes(h));
const presentAiHeaders = aiHeaders.filter((h) => rawHeaders.includes(h));
const allHeaders = [...standardHeaders, ...presentAiHeaders];

// --- Escape CSV cell ---
function escapeCell(value) {
  if (value === null || value === undefined) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// --- Build CSV ---
const headerLine = allHeaders.map(escapeCell).join(',');
const dataLines = flatRows.map((row) =>
  allHeaders.map((h) => escapeCell(row[h])).join(',')
);

const csv = [headerLine, ...dataLines].join('\n');

fs.writeFileSync(csvFilePath, csv, 'utf-8');
console.log(`✅ CSV written to: ${csvFilePath}`);
console.log(`   Rows: ${flatRows.length} | Columns: ${allHeaders.length}`);
