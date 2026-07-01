const buildBasicPayload = require("../payload_processors/payload.js");
const recordIDPayloadBuilder = require("./record_id_payload.js");

const postToServer = require("../utils/post.js");
const parseAccelaRedirect = require("./redirect_parser.js");
const getRecordIdByExactMatch = require("./redirect_multiple_ids_parser.js");

const fs = require("fs");
const path = require("path");

const AGENCY = "BREVARD";

const cookie_string =
  "ACA_USER_PREFERRED_CULTURE=en-US; _ga=GA1.1.608137457.1781327746; _ga_0NXN81WF8V=GS2.1.s1781881296$o6$g0$t1781881296$j60$l0$h0; ApplicationGatewayAffinityCORS=c0c8a87a8807e942c3606a708a9fa4f2; ApplicationGatewayAffinity=c0c8a87a8807e942c3606a708a9fa4f2; ACA_SS_STORE=4qip3xbc3mvjutyjelkwtlrz; ACA_CS_KEY=cae878cbc1a54cc98e456492158a197e; .ASPXANONYMOUS=GDP-B4TuybOJkVskJ-OCgeTqcPVOO_wx57gxkTp8dG9A5zD97SKvi4N3JdCvGxJz_dx8_X4BaO-S7kVo_uzRlfRgjM7N8anfKiBE0QmBvOwrQIKEhnVYcfVqrHbSfWhSc6g2amGNNvE3ouQVbI3V7Lb1moA1; LASTEST_REQUEST_TIME=1782897350407; _dd_s=rum=0&expire=1782894650780";

const TARGET_URL = `https://aca-prod.accela.com/${AGENCY}/Cap/CapHome.aspx?module=Building&TabName=Building&TabList=CodeEnforcement%7c0%7cBuilding%7c1%7cAEGrading%7c2%7cLandDevelopment%7c3%7cServiceRequest%7c4%7cAdministration%7c5%7cEnvHealth%7c6%7cCurrentTabIndex%7c1`;

async function getRecordId(recordNumber) {
  // important data here read bootstrap_data/README.md for more info
  // const cookie_string = fs
  //   .readFileSync(
  //     path.join(__dirname, "../bootstrap_data/cookies.txt"),
  //     "utf-8",
  //   )
  //   .trim(); //!important

  const html = fs.readFileSync(
    path.join(__dirname, "../bootstrap_data/raw_source_bootstrap.html"),
    "utf-8",
  ); //!important
  const BasePayload = buildBasicPayload(html); // builds the skeleton
  const payload = recordIDPayloadBuilder(BasePayload, recordNumber);

  // require("fs").writeFileSync(
  //   "record.payload.json",
  //   JSON.stringify(payload, null, 2),
  // );

  const redirect = await postToServer(TARGET_URL, payload, cookie_string);

  // require("fs").writeFileSync("reirect.html", redirect);

  let parsed = parseAccelaRedirect(redirect);
  // if  there are mulitple results ids then the above function doesnt work
  if (!parsed) {
    // handles multpliple matches
    parsed = getRecordIdByExactMatch(redirect, recordNumber);
  }
  console.log(parsed);
  return parsed?.recordId ?? null;
}
// const id = getRecordId("RES-NEW-26-003081").then((id) => console.log(id));

module.exports = getRecordId;

// console.log(getRecordId("RES-NEW-25-000032"));
