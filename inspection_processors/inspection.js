const buildBasicPayload = require("../payload_processors/payload.js");
const inspectionPayloadBuilder = require("./inspection_payload.js");
const postToServer = require("../utils/post.js");
const getInspectiondetailHTML = require("../utils/get.js");
const parseInspectionsData = require("./inspection_parser.js");
const nextInspectionPayloadBuilder = require("./next_inspection_payload.js");
const parseInspectionDetails = require("./inspection_details_parser.js");
const fs = require("fs");

const MAX_PAGINATION = 10;

async function getInspection(url, html, cookies) {
  const inspectionDataArray = [];

  const basePayload = buildBasicPayload(html);
  const payload = inspectionPayloadBuilder(basePayload);
  const inspectionHTML = await postToServer(url, payload, cookies);
  fs.writeFileSync("inspecton.html", inspectionHTML); //!debugging purposes
  let inspectionData = parseInspectionsData(inspectionHTML);
  const summary = inspectionData.summary; // summary is correct

  inspectionDataArray.push(...inspectionData.inspections);
  let page = 0;
  if (inspectionData.hasNextPage) {
    while (inspectionData.hasNextPage && page < MAX_PAGINATION) {
      let nextpayload = nextInspectionPayloadBuilder(
        inspectionData.nextPayload,
      );
      const html = await postToServer(url, nextpayload, cookies);
      // fs.writeFileSync("next.html", html); !debugging purposes
      inspectionData = parseInspectionsData(html);
      inspectionDataArray.push(...inspectionData.inspections);
      page++;
      console.log("ON page", page);
    }
  }

  /* for Brevard the inspections are behind another GET request  , to keep the simplicity of the program we are gonna 
  add some additonal post processing of the code*/
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const inspectionsDetailsArray = [];
  for (const inspection of inspectionDataArray) {
    const link = "https://aca-prod.accela.com" + inspection.detailsUrl;
    const inspectionHTML = await getInspectiondetailHTML(link);
    const details = parseInspectionDetails(inspectionHTML);
    inspectionsDetailsArray.push(details);

    // delay to avoid rete limiting
    await delay(750);
  }

  return {
    summary: summary,
    inspections: inspectionsDetailsArray, // changed from inspectionsDataArray , read upper comment
  };
}

module.exports = getInspection;
