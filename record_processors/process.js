const getRecordId = require("./record_name_to_id.js");
const fs = require("fs");

let input;

async function processRecords(INPUT_FILE, OUTPUT_FILE) {
  // 1. SMART RESUME: If the output file already exists, load it so we don't lose progress.
  // Otherwise, load the fresh input file.

  if (fs.existsSync(OUTPUT_FILE)) {
    console.log(`📄 Found existing progress. Loading from ${OUTPUT_FILE}...`);
    input = JSON.parse(fs.readFileSync(OUTPUT_FILE, "utf-8"));
  } else {
    console.log(`📄 Starting fresh. Loading from ${INPUT_FILE}...`);
    input = JSON.parse(fs.readFileSync(INPUT_FILE, "utf-8"));
  }
  console.log(`🚀 Starting to process ${input.length} records...`);

  for (let i = 0; i < input.length; i++) {
    let permit = input[i];
    let recordNum = permit["Application #"]; // changed this

    // 2. SKIP ALREADY FINISHED RECORDS: If it crashed previously, it will skip what it already did.
    if (permit["recordId"]) {
      console.log(
        `⏭️  Skipping (${i + 1}/${input.length}) - Already processed: ${recordNum}`,
      );
      continue;
    }

    try {
      console.log(
        `⏳ Processing (${i + 1}/${input.length}) - Record Number: ${recordNum}`,
      );

      // Attempt to get the record ID
      permit["recordId"] = await getRecordId(recordNum);

      console.log(`✅ [SUCCESS] ID found: ${permit["recordId"]}`);
    } catch (error) {
      // 3. CRASH PROTECTION: Log the error but DO NOT crash the program
      console.error(
        `❌ [FAILURE] Failed to get ID for: ${recordNum}. Error: ${error.message}`,
      );

      // We don't set recordId here, so if you restart the script, it will try this one again later.
    }

    // 4. INSTANT SAVE: This saves the file to your hard drive immediately after every single record.
    // It DOES NOT wait for the loop to finish.
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(input, null, 2));
  }

  console.log("🎉 Finished processing all records!");
}

module.exports = processRecords;
