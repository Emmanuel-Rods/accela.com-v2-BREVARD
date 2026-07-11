const getDataByStatus = require("./db/getPreviousData.js");
const fetchPermitData = require("./permit_processors/permit.js");
const cleanJSONinFolder = require("./utils/cleaner.js");
const compareData = require("./utils/compare.js");
const uploadFolder = require("./db/upload.js");
const cleanupFolders = require("./utils/deleteFolders.js");

const fs = require("fs");

const status = "*";

async function main() {
  const file = await getDataByStatus(status); //return filename
  await fetchPermitData(file);
  await cleanJSONinFolder("permits", "cleaned_permits");
  await compareData(file, "cleaned_permits", "DIFF_FOLDER");
  await uploadFolder("DIFF_FOLDER");
  // await cleanupFolders(["cleaned_permits", "DIFF_FOLDER", "permits"]);
  // fs.rmSync(file, { force: true }); // remove inspection phase.json
}

main();
