const fs = require("fs").promises;
const fsSync = require("fs");
const parsePermits = require("./permit_parser.js");
const processCookies = require("../utils/cookie_parser.js");
const getInspection = require("../inspection_processors/inspection.js");
const { hash } = require("../utils/hashes/create.hash.js");

const AGENCY = "BREVARD";

// Ensure the permits directory exists
if (!fsSync.existsSync("permits")) {
  fsSync.mkdirSync("permits");
  console.log("Permits directory created.");
}

// Helper: Split array into smaller batches
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Helper: Write errors to a log file
async function logErrorToFile(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  try {
    await fs.appendFile("error_log.txt", logMessage, "utf8");
  } catch (err) {
    console.error("Failed to write to error log:", err);
  }
}

async function fetchPermitData(inputfile) {
  try {
    // Ensure the permits directory exists
    if (!fsSync.existsSync("permits")) {
      fsSync.mkdirSync("permits");
      console.log("Permits directory created.");
    }

    // 1. Read the data from the input JSON
    console.log(`Reading ${inputfile}...`);
    const fileContent = await fs.readFile(inputfile, "utf8");
    const records = JSON.parse(fileContent);

    // 2. Split records into batches of 3
    const BATCH_SIZE = 2;
    const batches = chunkArray(records, BATCH_SIZE);

    console.log(
      `Found ${records.length} records. Processing in batches of ${BATCH_SIZE}...`,
    );

    // 3. Loop over each batch sequentially
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      console.log(`\n--- Starting Batch ${i + 1} of ${batches.length} ---`);

      // 4. Create an array of Promises for the current batch
      const batchPromises = batch.map(async (record) => {
        // Define IDs at the top so they are available in the catch block if needed
        const recordId = record.recordId || record.permit_id;
        const recordNumber = record["Application #"] || record.permit_number;

        try {
          // --- Validation ---
          if (!recordId) {
            throw new Error(
              `Skipping entry: No recordId found for Record Number: ${recordNumber}`,
            );
          }

          const parts = recordId.split("-");
          if (parts.length !== 3) {
            throw new Error(`Skipping invalid recordId format: ${recordId}`);
          }

          const [capID1, capID2, capID3] = parts;

          // --- Create URL & Fetch ---
          const url = `https://aca-prod.accela.com/${AGENCY}/Cap/CapDetail.aspx?Module=Building&TabName=Building&capID1=${capID1}&capID2=${capID2}&capID3=${capID3}`;
          console.log(`Fetching data for Record ID: ${recordId}`);

          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(
              `Failed to fetch ${recordId}. Status: ${response.status} ${response.statusText}`,
            );
          }

          const htmlContent = await response.text();
          const cookies = processCookies(response);

          console.log(`Success! Retrieved HTML for ${recordId}.`);

          // --- Process Data ---
          const permit = parsePermits(htmlContent, recordId);
          const inspection = await getInspection(url, htmlContent, cookies);
          const data = { ...permit, inspection };
          // hashing
          const permit_hash = hash(data);
          const final = { permit_data: data, permit_hash: permit_hash };
          // --- Save to File ---
          await fs.writeFile(
            `permits/${recordNumber}.json`,
            JSON.stringify(final, null, 2),
            "utf8",
          );
        } catch (error) {
          // --- Error Handling ---
          // Log to console AND write to error_log.txt
          const errorMessage = `Error processing recordId [${recordId || "UNKNOWN"}]: ${error.message}`;
          console.error(errorMessage);
          await logErrorToFile(errorMessage);
        }
      });

      // 5. Wait for all 3 records in the current batch to finish before moving on
      await Promise.all(batchPromises);
      await new Promise((r) => setTimeout(r, 2000)); // 2 second delay
    }

    console.log("\nFinished processing all records.");
  } catch (error) {
    // This catches critical errors (like the input file missing or malformed JSON)
    console.error("A critical error occurred during execution:", error.message);
    await logErrorToFile(`CRITICAL ERROR: ${error.message}`);
  }
}

module.exports = fetchPermitData;
