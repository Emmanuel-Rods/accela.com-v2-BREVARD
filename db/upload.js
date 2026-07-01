const fs = require("fs/promises");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");

// --- 1. CONFIGURATION ---
const SUPABASE_URL = "https://dddsaythhlflyzuxcdha.supabase.co";
const SUPABASE_KEY = "";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const TABLE_NAME = "scraper_test";
// const TABLE_NAME = "fl_hillsborough_permits";

const BATCH_SIZE = 100;

async function pushToSupabase(batchData) {
  try {
    const { error } = await supabase.from(TABLE_NAME).upsert(batchData);

    if (error) {
      throw error;
    }
    console.log(
      `Successfully pushed chunk of ${batchData.length} rows to Supabase.`,
    );
  } catch (error) {
    console.error(
      `Database insertion error occurred: ${error.message || error}`,
    );
  }
}

async function uploadFolder(FOLDER_PATH) {
  let batch = [];
  let totalInserted = 0;

  try {
    // Read files from the target directory
    const files = await fs.readdir(FOLDER_PATH);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    console.log(`Total files detected for processing: ${jsonFiles.length}`);

    for (const filename of jsonFiles) {
      const filePath = path.join(FOLDER_PATH, filename);

      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const rawJson = JSON.parse(fileContent);

        // --- 2. CLEAN PARSING ---
        const permitBlock = rawJson.recordInfo || {};

        const pNum = permitBlock["Record Number"];
        const status = permitBlock.recordStatus;

        // Safety check: Skip files missing the key identifier
        if (!pNum) {
          console.log(
            `Skipping ${filename}: No 'Record Number' found in the recordInfo block.`,
          );
          continue;
        }

        // --- 3. BUILD THE ROW ---
        batch.push({
          permit_id: pNum,
          permit_number: pNum,
          status: status ? status : "UNKNOWN",
          permit_data: rawJson,
        });
      } catch (err) {
        console.error(
          `Error reading or parsing file ${filename}: ${err.message}`,
        );
        continue;
      }

      // --- 4. BATCH PUSH ---
      if (batch.length >= BATCH_SIZE) {
        await pushToSupabase(batch);
        totalInserted += batch.length;
        batch = [];
      }
    }

    // Push any remaining records
    if (batch.length > 0) {
      await pushToSupabase(batch);
      totalInserted += batch.length;
    }

    console.log(`\n Upload complete. Total rows uploaded: ${totalInserted}`);
  } catch (err) {
    console.error(`Error accessing folder path: ${err.message}`);
  }
}

module.exports = uploadFolder;
