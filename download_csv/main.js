const { getHTMLandCookies } = require("./first.js");
const { getDownloadPage } = require("./second.js");
const { sendDownloadRequest } = require("./third.js");
const { exportCSV } = require("./fourth.js");
const fs = require("fs/promises");

const AGENCY = "BREVARD";

async function downloadCSV(dateOffset) {
  // dates
  const date = getDateDaysAgo(dateOffset);
  const startDate = date;
  const endDate = date;

  const { html, cookies } = await getHTMLandCookies(AGENCY);
  const downloadpageHTML = await getDownloadPage(html, cookies, AGENCY);
  const isDownloadRequestAccepted = await sendDownloadRequest(
    downloadpageHTML,
    cookies,
    startDate,
    endDate,
    AGENCY,
  );

  if (isDownloadRequestAccepted) {
    await exportCSV(cookies, AGENCY);
    return true;
  }
  return false;
}

// different date format than TYLER
function getDateDaysAgo(offset = 1) {
  const date = new Date();
  date.setDate(date.getDate() - offset); // default is 1, yesterday
  date.setUTCHours(0, 0, 0, 0); // Set time to midnight UTC

  // Extract month, day, and year in UTC to match the time set above
  const month = String(date.getUTCMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();

  // Combine into MM/DD/YYYY format
  const formattedDate = `${month}/${day}/${year}`;

  console.log("Start/End Date for CSV: ", formattedDate);
  return formattedDate;
}

module.exports = { downloadCSV };
