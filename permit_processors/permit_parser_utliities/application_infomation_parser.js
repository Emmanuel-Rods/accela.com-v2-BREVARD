const cheerio = require("cheerio");

function parseApplicationInformation(htmlString) {
  const $ = cheerio.load(htmlString);
  const result = {};

  // Default section in case items appear before a title
  let currentSection = "Uncategorized";
  let pendingKey = null;

  // Target the specific Application Information container
  const container = $(
    "#ctl00_PlaceHolderMain_PermitDetailList1_phPlumbingGroup",
  );

  container.children("div").each((i, el) => {
    const $el = $(el);

    // 1. Detect Category Title (e.g., "GENERAL PROJECT INFORMATION")
    if ($el.hasClass("MoreDetail_ItemTitle")) {
      currentSection = $el.text().trim();
      result[currentSection] = {};
      pendingKey = null; // Reset pending key tracker
      return; // Continue to next element
    }

    // 2. Detect Grouped Items (Row with inline column wrappers)
    if ($el.hasClass("ACA_TabRow")) {
      const columns = $el.children(".ASIReview2Columns");

      // Only process if it has data columns (ignores empty grey spacer rows)
      if (columns.length > 0) {
        if (!result[currentSection]) result[currentSection] = {};

        columns.each((_, col) => {
          const $col = $(col);
          let key = $col.find(".ACA_SmLabelBolder").text().trim();
          let val = $col.find(".ACA_SmLabel").text().trim();

          // Clean up strings (remove trailing colons, line breaks, and extra spaces)
          key = key
            .replace(/[\s:]+$/, "")
            .replace(/[\r\n]+/g, " ")
            .replace(/\s{2,}/g, " ");
          val = val.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");

          if (key) {
            result[currentSection][key] = val;
          }
        });
      }
      pendingKey = null;
      return;
    }

    // 3. Detect Standalone Items (Stacked Divs for Key and Value)
    if ($el.hasClass("MoreDetail_ItemColASI")) {
      if (!result[currentSection]) result[currentSection] = {};

      if ($el.hasClass("MoreDetail_ItemCol1")) {
        // Extract Key
        pendingKey = $el.find(".ACA_SmLabelBolder").text().trim();
        pendingKey = pendingKey
          .replace(/[\s:]+$/, "")
          .replace(/[\r\n]+/g, " ")
          .replace(/\s{2,}/g, " ");
      } else if ($el.hasClass("MoreDetail_ItemCol2") && pendingKey) {
        // Extract Value
        let val = $el.find(".ACA_SmLabel").text().trim();
        val = val.replace(/[\r\n]+/g, " ").replace(/\s{2,}/g, " ");

        // Map the value to the previously found pending key
        result[currentSection][pendingKey] = val;
        pendingKey = null; // reset for the next pair
      }
    }
  });

  return result;
}

module.exports = parseApplicationInformation;
