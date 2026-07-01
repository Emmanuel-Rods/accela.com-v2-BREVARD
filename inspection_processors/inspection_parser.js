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
    const statusText = infoTd.find("span").eq(0).text().trim(); // e.g. "Pass"
    const typeAndIdText = infoTd.find("span").eq(1).text().trim(); // e.g. "Building Final"
    const resultText = infoTd.find("span").eq(2).text().trim(); // e.g. "Result Date: 02/16/2024 at 03:29 PM"

    // 1. Separate the Inspection Type and the ID using Regex
    let type = typeAndIdText;
    let id = "";
    const typeIdMatch = typeAndIdText.match(/(.+)\s+\((.+)\)/);
    if (typeIdMatch) {
      type = typeIdMatch[1].trim();
      id = typeIdMatch[2].trim();
    }

    // 2. Extract Date and Inspector (Bulletproof Method)
    let inspector = "";
    let date = "";

    // Grab the date by looking for the MM/DD/YYYY pattern and capturing everything after it (the time)
    // This works for "Result Date:", "Cancelled on:", and "Result by: Name on"
    const dateMatch = resultText.match(/\d{2}\/\d{2}\/\d{4}.*/);
    if (dateMatch) {
      date = dateMatch[0].trim(); // Result: "02/16/2024 at 03:29 PM"
    }

    // Grab the inspector by looking for text exactly between "by:" and "on" (if it exists)
    const inspectorMatch = resultText.match(/by:\s+(.+?)\s+on/i);
    if (inspectorMatch) {
      inspector = inspectorMatch[1].trim(); // Result: "Paul Phipps"
    }

    // 3. Extract the "View Details" URL from the onclick attribute
    const onclickAttr = $(row).find(".ACA_LinkButton a").attr("onclick") || "";
    let detailsUrl = "";

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
