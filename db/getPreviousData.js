const { createClient } = require("@supabase/supabase-js");
const fs = require("fs").promises;

// Replace these with your actual Supabase project URL and API key
const supabaseUrl = "https://dddsaythhlflyzuxcdha.supabase.co";
const supabaseKey = "";
const supabase = createClient(supabaseUrl, supabaseKey);

async function getDataByStatus(status) {
  let allPermits = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  try {
    console.log("Fetching data from Supabase...");

    while (hasMore) {
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from("scraper_02_permits")
        .select("*")
        .eq("status", status) //status here
        .range(from, to);

      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        allPermits.push(...data);

        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      } else {
        hasMore = false;
      }
    }

    console.log(
      `Retrieved ${allPermits.length} records. Writing to JSON file...`,
    );

    // Convert array to JSON string with 2-space indentation for readability
    const jsonData = JSON.stringify(allPermits, null, 2);

    // Write to a local file
    await fs.writeFile(`${status}.json`, jsonData, "utf-8");
    console.log(`Data successfully written to ${status}.json`);
    return `${status}.json`; //returns filename
  } catch (error) {
    console.error("An error occurred:", error.message);
  }
}

module.exports = getDataByStatus;
