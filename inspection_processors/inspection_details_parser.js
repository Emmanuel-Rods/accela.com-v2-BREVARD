const cheerio = require("cheerio");

/**
 * Parses the Inspection Details HTML and extracts important information.
 *
 * @param {string} html - The raw HTML string.
 * @returns {object} - An object containing the extracted details.
 */
function parseInspectionDetails(html) {
  const $ = cheerio.load(html);

  // Helper function to extract text by ID safely
  const getText = (id) => $(id).text().trim();

  // Address needs special handling to format the <br/> nicely into a comma string
  const addressParts = $("#ctl00_phPopup_Inspection_AddressText_lblAddress")
    .contents()
    .map(function () {
      return $(this).text().trim();
    })
    .get()
    .filter(Boolean); // Removes empty strings (like the <br/> element itself)

  const address = addressParts.join(", ");

  const inspectionDetails = {
    inspectionName: getText("#ctl00_phPopup_Inspection_lblInspectionName"),
    address: address,

    // Status Information
    status: getText("#ctl00_phPopup_Inspection_lblStatus"),
    statusDate: getText("#ctl00_phPopup_Inspection_lblStatusDate"),
    desiredDate: getText("#ctl00_phPopup_Inspection_lblDesiredDateValue"),

    // Update Information
    lastUpdatedBy: getText("#ctl00_phPopup_Inspection_lblLastUpdatedBy"),
    lastUpdatedTime: getText("#ctl00_phPopup_Inspection_lblLastUpdated"),

    // Record Information
    recordId: getText("#ctl00_phPopup_Inspection_lblRecordAltID"),
    recordType: getText("#ctl00_phPopup_Inspection_lblRecordType"),
  };

  return inspectionDetails;
}

module.exports = parseInspectionDetails;
