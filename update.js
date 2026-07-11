const getDataByStatus = require("./db/getPreviousData.js");
const fetchPermitData = require("./permit_processors/permit.js");
const cleanJSONinFolder = require("./utils/cleaner.js");
const uploadFolder = require("./db/upload.js");
const cleanupFolders = require("./utils/deleteFolders.js");
const { comparePermitHashes } = require("./utils/hashes/hash.compare.js");

const fs = require("fs");

const { updateStatuses } = require("./config.js");

async function processStatus(status) {
  const file = await getDataByStatus(status); //return filename
  await fetchPermitData(file);
  comparePermitHashes(file, "permits", "DIFF_FOLDER");
  await uploadFolder("DIFF_FOLDER");
  await cleanupFolders(["DIFF_FOLDER", "permits"]);
  fs.rmSync(file, { force: true });
}

async function main() {
  // Loop through each status sequentially
  for (const status of updateStatuses) {
    try {
      console.log(`Starting process for status: ${status}...`);
      await processStatus(status);
      console.log(`Successfully finished processing: ${status}\n`);
    } catch (error) {
      console.error(`Error processing status '${status}':`, error);
    }
  }
  console.log("All statuses processed.");
}

main();
