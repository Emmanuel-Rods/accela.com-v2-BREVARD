const cleanupFolders = require("../utils/deleteFolders.js");
const fs = require("fs").promises;

async function clear() {
  await cleanupFolders(["cleaned_permits", "permits", "DIFF_FOLDER"]);
  await fs.rm("daily_permits_record_id.json", { force: true });
  await fs.rm("daily_permits.json", { force: true });
}

clear();
