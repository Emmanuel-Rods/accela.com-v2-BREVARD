const cheerio = require("cheerio");

/**
 * Extracts the RecordId from HTML given an exact Permit Number.
 *
 * @param {string} html - The HTML string of the page/table.
 * @param {string} targetPermit - The exact permit number to search for.
 * @returns {string|null} - The RecordId value, or null if not found.
 */
function getRecordIdByExactMatch(html, targetPermit) {
  const $ = cheerio.load(html);
  let foundRecordId = null;

  // Search through all spans and anchor tags
  $("span, a").each((index, element) => {
    // Get the text and clean up whitespace
    const text = $(element).text().trim();

    // Ensure an EXACT MATCH to avoid grabbing -REV-1 or -REV-2
    if (text === targetPermit) {
      // Navigate up to the closest table cell (td) that contains this specific record
      const parentCell = $(element).closest("td");

      // Search only inside this specific cell for the hidden input
      parentCell.find("input").each((i, inputEl) => {
        // Handle potential casing issues in HTML parsing (id vs ID)
        const idAttr = $(inputEl).attr("id") || $(inputEl).attr("ID");

        if (idAttr && idAttr.toLowerCase() === "recordid") {
          // Grab the value
          foundRecordId = $(inputEl).attr("value");
          return false; // Break out of the inner loop
        }
      });

      // If we successfully found the ID, break out of the outer loop
      if (foundRecordId) {
        return false;
      }
    }
  });

  return {
    link: "<feature not implemented , Not required. This text is set for mainitaining the structure>",
    recordId: foundRecordId,
  };
}

module.exports = getRecordIdByExactMatch;
