const parseCSVToJSON = require("./utils/CSVJSON.js");
const processRecords = require("./record_processors/process.js");
const fetchPermitData = require("./permit_processors/permit.js");
const uploadFolder = require("./db/upload.js");
const cleanupFolders = require("./utils/deleteFolders.js");

const fs = require("fs").promises;

const {
  dateOffset,
  requiredStatuses,
  requiredSecondaryData,
} = require("./config.js");

const INPUT_FILE = "brevard.csv"; // <- here

async function main() {
  const input_data = await fs.readFile(INPUT_FILE, "utf-8");
  const dailyData = parseCSVToJSON(input_data);

  // filtering by statuss
  const filteredStatuses = dailyData.filter((app) =>
    requiredStatuses.includes(app["Status"]),
  );

  // filtering by applications
  const filteredApplications = filteredStatuses.filter((app) =>
    requiredSecondaryData.includes(app["Application Type"]),
  );

  await fs.writeFile(
    "daily_permits.json",
    JSON.stringify(filteredApplications, null, 2),
  );

  //need to get the ids
  await processRecords("daily_permits.json", "daily_permits_record_id.json");
  //once ids
  await fetchPermitData("daily_permits_record_id.json");

  await uploadFolder("permits");
  await cleanupFolders(["cleaned_permits", "permits"]);

  await fs.rm("daily_permits_record_id.json", { force: true });
  await fs.rm("daily_permits.json", { force: true });
}

main();
