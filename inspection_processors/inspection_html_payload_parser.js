const { URLSearchParams } = require("url");
const fs = require("fs");
const cheerio = require("cheerio");

/** @param {string} rawData html  */

function parseInspectionPagePayload(rawData) {
  const result = {
    link: null,
    recordId: null,
    capID1: null,
    capID2: null,
    capID3: null,
    viewState: null,
    viewStateGenerator: null,
    acaCsField: null,
    eventTarget: null,
  };

  // 1. Extract the Link (Looks for either 'pageRedirect' or 'formAction')
  const urlMatch = rawData.match(/(?:pageRedirect|formAction)\|\|([^|]+)\|/);

  if (urlMatch) {
    // Decode the URL in case it is URL-encoded
    result.link = decodeURIComponent(urlMatch[1]);

    // Extract the query parameters
    const queryString = result.link.split("?")[1] || "";
    const urlParams = new URLSearchParams(queryString);

    // Retrieve capIDs
    result.capID1 = urlParams.get("capID1") || "";
    result.capID2 = urlParams.get("capID2") || "";
    result.capID3 = urlParams.get("capID3") || "";

    // Generate the recordId
    if (result.capID1 && result.capID2 && result.capID3) {
      result.recordId = `${result.capID1}-${result.capID2}-${result.capID3}`;
    }
  }

  // 2. Extract ASP.NET Hidden Fields using Regex
  const viewStateMatch = rawData.match(/\|__VIEWSTATE\|([^|]*)\|/);
  if (viewStateMatch) {
    result["__VIEWSTATE"] = viewStateMatch[1];
  }

  const vsgMatch = rawData.match(/\|__VIEWSTATEGENERATOR\|([^|]*)\|/);
  if (vsgMatch) {
    result["__VIEWSTATEGENERATOR"] = vsgMatch[1];
  }

  const acaCsMatch = rawData.match(/\|ACA_CS_FIELD\|([^|]*)\|/);
  if (acaCsMatch) {
    result["ACA_CS_FIELD"] = acaCsMatch[1];
  }

  const eventTarget = getNextPageEventTarget(rawData);
  if (eventTarget) {
    result["eventTarget"] = eventTarget;
  }

  return result;
}

function getNextPageEventTarget(html) {
  const $ = cheerio.load(html);

  // 1. Find the <a> tag that contains the word "Next" inside the pagination table
  const nextLink = $(
    'table.aca_pagination td.aca_pagination_PrevNext a:contains("Next")',
  );

  // 2. If the "Next" link doesn't exist, we are on the last page.
  if (nextLink.length === 0) {
    return null;
  }

  // 3. Get the href attribute
  // Example: "javascript:__doPostBack('ctl00$PlaceHolderMain$InspectionList$gvListCompleted$ctl08$ctl04','')"
  const href = nextLink.attr("href");

  if (href) {
    // 4. Use Regex to extract the string exactly between the single quotes
    const match = href.match(/__doPostBack\('([^']+)'/);

    if (match && match[1]) {
      // Returns: "ctl00$PlaceHolderMain$InspectionList$gvListCompleted$ctl08$ctl04"
      return match[1];
    }
  }

  return null;
}

module.exports = parseInspectionPagePayload;
