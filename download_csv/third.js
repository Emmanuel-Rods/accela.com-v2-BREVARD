const fs = require("fs");

/**
 * Parses ASP.NET AJAX UpdatePanel response to extract specific hidden fields
 * @param {string} responseText - The raw response text
 * @returns {object} An object containing the extracted fields
 */
function extractHiddenFields(responseText) {
  const extractedData = {
    __VIEWSTATE: null,
    __VIEWSTATEGENERATOR: null,
    ACA_CS_FIELD: null,
  };

  // Regex explanation:
  // hiddenField\|        -> Matches the literal text "hiddenField|"
  // FIELD_NAME\|         -> Matches the specific field name followed by "|"
  // ([^|]*)              -> Captures everything up to the next "|" (the actual value)
  // \|                   -> Matches the closing "|"

  const viewStateRegex = /hiddenField\|__VIEWSTATE\|([^|]*)\|/;
  const viewStateGenRegex = /hiddenField\|__VIEWSTATEGENERATOR\|([^|]*)\|/;
  const acaCsFieldRegex = /hiddenField\|ACA_CS_FIELD\|([^|]*)\|/;

  const viewStateMatch = responseText.match(viewStateRegex);
  if (viewStateMatch && viewStateMatch.length > 1) {
    extractedData.__VIEWSTATE = viewStateMatch[1];
  }

  const viewStateGenMatch = responseText.match(viewStateGenRegex);
  if (viewStateGenMatch && viewStateGenMatch.length > 1) {
    extractedData.__VIEWSTATEGENERATOR = viewStateGenMatch[1];
  }

  const acaCsFieldMatch = responseText.match(acaCsFieldRegex);
  if (acaCsFieldMatch && acaCsFieldMatch.length > 1) {
    extractedData.ACA_CS_FIELD = acaCsFieldMatch[1];
  }

  return extractedData;
}

function buildPayload(html, start, end) {
  const prev = {
    __VIEWSTATEGENERATOR: "",
    ACA_CS_FIELD: "",
    ctl00$ScriptManager1:
      "ctl00$PlaceHolderMain$dgvPermitList$updatePanel|ctl00$PlaceHolderMain$dgvPermitList$gdvPermitList$gdvPermitListtop4btnExport",
    ctl00$HeaderNavigation$hdnShoppingCartItemNumber: "",
    ctl00$HeaderNavigation$hdnShowReportLink: "N",
    ctl00$PlaceHolderMain$addForMyPermits$collection: "rdoExistCollection",
    ctl00$PlaceHolderMain$addForMyPermits$ddlMyCollection: "",
    ctl00$PlaceHolderMain$addForMyPermits$txtName: "",
    ctl00$PlaceHolderMain$addForMyPermits$txtDesc: "",
    ctl00$PlaceHolderMain$ddlSearchType: "0",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSPermitNumber: "",
    ctl00$PlaceHolderMain$generalSearchForm$ddlGSPermitType:
      "Building/Residential/New/NA",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSProjectName: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSStartDate: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSStartDate_ext_ClientState: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSEndDate: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSEndDate_ext_ClientState: "",
    ctl00$PlaceHolderMain$generalSearchForm$ddlGSLicenseType: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSLicenseNumber: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSFirstName: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSLastName: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSBusiName: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSBusiLicense: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSNumber$ChildControl0: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSNumber$ctl00_PlaceHolderMain_generalSearchForm_txtGSNumber_ChildControl0_watermark_exd_ClientState:
      "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSNumber$ChildControl1: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSNumber$ctl00_PlaceHolderMain_generalSearchForm_txtGSNumber_ChildControl1_watermark_exd_ClientState:
      "",
    ctl00$PlaceHolderMain$generalSearchForm$ddlGSDirection: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSStreetName: "",
    ctl00$PlaceHolderMain$generalSearchForm$ddlGSStreetSuffix: "",
    ctl00$PlaceHolderMain$generalSearchForm$ddlGSUnitType: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSUnitNo: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSParcelNo: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSCity: "",
    ctl00$PlaceHolderMain$generalSearchForm$ddlGSState$State1: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSAppZipSearchPermit: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSAppZipSearchPermit_ZipFromAA:
      "0",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSAppZipSearchPermit_zipMask: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSAppZipSearchPermit_ext_ClientState:
      "",
    ctl00$PlaceHolderMain$generalSearchForm$ddlGSCountry: "",
    ctl00$PlaceHolderMain$hfASIExpanded: "",
    ctl00$PlaceHolderMain$txtHiddenDate: "",
    ctl00$PlaceHolderMain$txtHiddenDate_ext_ClientState: "",
    ctl00$PlaceHolderMain$dgvPermitList$lblNeedReBind: "",
    ctl00$PlaceHolderMain$dgvPermitList$gdvPermitList$hfSaveSelectedItems: "",
    ctl00$PlaceHolderMain$dgvPermitList$inpHideResumeConf: "",
    ctl00$PlaceHolderMain$hfGridId: "",
    ctl00$HDExpressionParam: "",
    Submit: "Submit",
    __EVENTTARGET:
      "ctl00$PlaceHolderMain$dgvPermitList$gdvPermitList$gdvPermitListtop4btnExport",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __AjaxControlToolkitCalendarCssLoaded: "",
    __VIEWSTATEENCRYPTED: "",
    __ASYNCPOST: "true",
  };
  const next = extractHiddenFields(html);
  next["ctl00$PlaceHolderMain$generalSearchForm$ddlGSPermitType"] = ""; // setting it to empty string
  next["ctl00$PlaceHolderMain$generalSearchForm$txtGSStartDate"] = start;
  next["ctl00$PlaceHolderMain$generalSearchForm$txtGSEndDate"] = end;

  next["ctl00$PlaceHolderMain$addForMyPermits$collection"] =
    "rdoExistCollection";

  return { ...prev, ...next };
}

async function sendDownloadRequest(html, cookies, start, end, AGENCY) {
  const url = `https://aca-prod.accela.com/${AGENCY}/Cap/CapHome.aspx?module=Building&TabName=Building&TabList=CodeEnforcement%7c0%7cBuilding%7c1%7cAEGrading%7c2%7cLandDevelopment%7c3%7cServiceRequest%7c4%7cAdministration%7c5%7cEnvHealth%7c6%7cCurrentTabIndex%7c1`;

  const payload = buildPayload(html, start, end);

  const headers = {
    "sec-ch-ua-platform": '"Windows"',
    "Cache-Control": "no-cache",
    Referer: `https://aca-prod.accela.com/${AGENCY}/Cap/CapHome.aspx?module=Building&TabName=Building&TabList=CodeEnforcement%7C0%7CBuilding%7C1%7CAEGrading%7C2%7CLandDevelopment%7C3%7CServiceRequest%7C4%7CAdministration%7C5%7CEnvHealth%7C6%7CCurrentTabIndex%7C1`,
    "sec-ch-ua":
      '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "X-Requested-With": "XMLHttpRequest",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "X-MicrosoftAjax": "Delta=true",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    // --- BLANK COOKIE SECTION ---
    Cookie: cookies,
  };

  const body = new URLSearchParams(payload).toString();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: body,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const responseText = await response.text();
    const target = "ctl00_PlaceHolderMain_dgvPermitList_updatePanel";
    console.log("Response received successfully.");

    if (responseText.includes(target)) {
      console.log("The Server has Accepted our download request.");
      return true;
    } else {
      console.log(
        "Something went wrong , The Sever Returned something Unexpected ",
      );
      return false;
    }
  } catch (error) {
    console.error("Error sending request:", error);
  }
}

module.exports = { sendDownloadRequest };
