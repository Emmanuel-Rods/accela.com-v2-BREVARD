const fs = require("fs").promises; // Use the promises version of fs
const path = require("path");

async function cleanJSONinFolder(inputFolder, outputFolder) {
  // Ensure output directory exists (equivalent to exist_ok=True, parents=True)
  await fs.mkdir(outputFolder, { recursive: true });

  // Read directory and filter for .json files
  let files;
  try {
    files = await fs.readdir(inputFolder);
  } catch (err) {
    console.error(`Failed to read input directory: ${err.message}`);
    return;
  }

  const jsonFiles = files.filter(
    (file) => path.extname(file).toLowerCase() === ".json",
  );
  console.log(
    `Starting Hillsborough extraction for ${jsonFiles.length} files...\n`,
  );

  let processedCount = 0;
  const errorLog = [];

  // --- 1. THE "DIRECT COPY" TARGETS ---
  const DIRECT_COPY_KEYS = [
    "recordInfo",
    "workLocation",
    "applicant",
    "licensedProfessionals",
    "projectDescription",
    "owner",
    "relatedContacts",
    "parcelInformation",
    "inspection",
  ];

  for (const filename of jsonFiles) {
    const filepath = path.join(inputFolder, filename);
    try {
      // Read and parse the JSON file
      const rawData = await fs.readFile(filepath, "utf-8");
      const data = JSON.parse(rawData);

      const cleanedData = {};

      // --- STEP 1: Execute Direct Copy ---
      for (const key of DIRECT_COPY_KEYS) {
        if (data.hasOwnProperty(key)) {
          cleanedData[key] = data[key];
        }
      }

      // --- STEP 2: Execute Surgical Snipe on 'applicationInformation' ---
      const appInfoSource = data.applicationInformation || {};
      const newAppInfo = {};

      // Snipe A: Keep General Project Info as-is
      if (appInfoSource["GENERAL PROJECT INFORMATION"]) {
        newAppInfo["GENERAL PROJECT INFORMATION"] =
          appInfoSource["GENERAL PROJECT INFORMATION"];
      }

      // Snipe B: Dig into 'PROJECT DETAILS' and grab the money
      // Using ?? null ensures that if the key doesn't exist, it defaults to null (just like Python's .get())
      const projectDetails = appInfoSource["PROJECT DETAILS"] || {};
      newAppInfo["Total Project Value"] =
        projectDetails["Total Project Value"] ?? null;

      // Snipe C: Dig into 'GIS ATTRIBUTES' and grab the PIN
      const gisAttributes = appInfoSource["GIS ATTRIBUTES"] || {};
      newAppInfo["PIN"] = gisAttributes["PIN"] ?? null;

      // Assign the clean, 3-item app info block to our final payload
      cleanedData["applicationInformation"] = newAppInfo;

      // --- STEP 3: Save the freshly cleaned file ---
      const outputFilepath = path.join(outputFolder, filename);
      // JSON.stringify(data, null, 2) is equivalent to json.dump(..., indent=2)
      await fs.writeFile(
        outputFilepath,
        JSON.stringify(cleanedData, null, 2),
        "utf-8",
      );

      processedCount++;
    } catch (e) {
      errorLog.push(`[${filename}] Failed to process: ${e.message}`);
    }
  }

  // --- Terminal Summary ---
  console.log("-".repeat(40));
  console.log(
    `CLEANUP COMPLETE: Processed ${processedCount} out of ${jsonFiles.length} files.`,
  );

  if (errorLog.length > 0) {
    console.log("\n[WARNING] The following files encountered errors:");
    for (const error of errorLog) {
      console.log(`  -> ${error}`);
    }
  }

  console.log(`\nCleaned JSONs saved in: ${outputFolder}`);
}

module.exports = cleanJSONinFolder;
