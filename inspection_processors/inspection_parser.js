const cheerio = require("cheerio");
const fs = require("fs");
const parseInspectionPagePayload = require("./inspection_html_payload_parser.js");
/**
 * Parses the AJAX response to extract completed inspection records.
 * @param {string} ajaxResponse - The raw response string from the POST request
 */

function parseInspectionsData(inspectionHTML) {
  const $ = cheerio.load(inspectionHTML);
  const nextPayload = parseInspectionPagePayload(inspectionHTML);

  // 1. Extract overall summary data
  const completedTitle = $(
    "#ctl00_PlaceHolderMain_InspectionList_lblInspectionCompleted",
  )
    .text()
    .trim();
  const summaryText = $(
    "#ctl00_PlaceHolderMain_InspectionList_lblInspectionStatusRecordCount",
  )
    .text()
    .trim();

  // Extract total count (e.g., from "Completed (8)")
  const totalMatch = completedTitle.match(/\((\d+)\)/);
  const totalCompleted = totalMatch ? parseInt(totalMatch[1], 10) : 0;

  // 2. Loop through each row in the Completed Inspections table
  const inspections = [];

  $("tr.InspectionListRow").each((index, row) => {
    const infoTd = $(row).find(".ACA_Width45em");

    // The text data is stored in three <span> elements
    const statusText = infoTd.find("span").eq(0).text().trim(); // e.g. "Passed" or "Failed"
    const typeAndIdText = infoTd.find("span").eq(1).text().trim(); // e.g. "MS - Mono Slab (105995)"
    const resultText = infoTd.find("span").eq(2).text().trim(); // e.g. "Result by: Paul Phipps on 06/20/2025 at 10:21 AM"

    // Separate the Inspection Type and the ID using Regex
    let type = typeAndIdText;
    let id = "";
    const typeIdMatch = typeAndIdText.match(/(.+)\s+\((.+)\)/);
    if (typeIdMatch) {
      type = typeIdMatch[1].trim(); // "MS - Mono Slab"
      id = typeIdMatch[2].trim(); // "105995"
    }

    // Separate the Inspector Name and Date using Regex
    let inspector = "";
    let date = "";
    const resultMatch = resultText.match(/\w+\s+by:\s+(.+)\s+on\s+(.+)/);
    if (resultMatch) {
      inspector = resultMatch[1].trim(); // "Paul Phipps"
      date = resultMatch[2].trim(); // "06/20/2025 at 10:21 AM"
    }

    // 3. Extract the "View Details" URL from the onclick attribute
    const onclickAttr = $(row).find(".ACA_LinkButton a").attr("onclick") || "";
    let detailsUrl = "";
    // Matches the first parameter passed to showInspectionPopupDialog('URL', ...)
    const urlMatch = onclickAttr.match(/showInspectionPopupDialog\('([^']+)'/);
    if (urlMatch) {
      detailsUrl = urlMatch[1];
    }

    // Push structured object to array
    inspections.push({
      id,
      status: statusText,
      type,
      inspector,
      date,
      detailsUrl,
    });
  });

  // 4. Check if there are more pages
  // Looks for an anchor tag containing "Next" in the pagination row
  const hasNextPage = $('a:contains("Next")').length > 0;

  return {
    summary: {
      totalCompleted,
      statusBreakdown: summaryText, // "Failed - 3; Passed - 5"
    },
    hasNextPage,
    inspections,
    nextPayload,
  };
}

module.exports = parseInspectionsData;
