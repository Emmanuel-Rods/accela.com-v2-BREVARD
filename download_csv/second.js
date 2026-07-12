const buildBasicPayload = require("../payload_processors/payload.js");
const fs = require("fs");

function buildPayload(html, startDate = "", endDate = "") {
  const payload = buildBasicPayload(html);

  const rest = {
    ctl00$ScriptManager1:
      "ctl00$PlaceHolderMain$updatePanel|ctl00$PlaceHolderMain$btnNewSearch",
    ACA_CS_FIELD: "",
    __EVENTTARGET: "ctl00$PlaceHolderMain$btnNewSearch",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATEGENERATOR: "",
    __VIEWSTATEENCRYPTED: "",
    ctl00$HeaderNavigation$hdnShoppingCartItemNumber: "",
    ctl00$HeaderNavigation$hdnShowReportLink: "N",
    ctl00$PlaceHolderMain$addForMyPermits$collection: "rdoExistCollection",
    ctl00$PlaceHolderMain$addForMyPermits$ddlMyCollection: "",
    ctl00$PlaceHolderMain$addForMyPermits$txtName: "",
    ctl00$PlaceHolderMain$addForMyPermits$txtDesc: "",
    ctl00$PlaceHolderMain$ddlSearchType: "0",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSPermitNumber: "",
    ctl00$PlaceHolderMain$generalSearchForm$ddlGSPermitType: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSProjectName: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSStartDate: startDate, // startdate
    ctl00$PlaceHolderMain$generalSearchForm$txtGSStartDate_ext_ClientState: "",
    ctl00$PlaceHolderMain$generalSearchForm$txtGSEndDate: endDate, //enddate
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
    ctl00$PlaceHolderMain$hfGridId: "",
    ctl00$HDExpressionParam: "",
    Submit: "Submit",
    __ASYNCPOST: "true",
  };

  return { ...rest, ...payload };
}

async function getDownloadPage(html, cookies, AGENCY) {
  const payload = buildPayload(html);
  const url = `https://aca-prod.accela.com/${AGENCY}/Cap/CapHome.aspx?module=Building&TabName=Building&TabList=CodeEnforcement%7c0%7cBuilding%7c1%7cAEGrading%7c2%7cLandDevelopment%7c3%7cServiceRequest%7c4%7cAdministration%7c5%7cEnvHealth%7c6%7cCurrentTabIndex%7c1`;

  const headers = {
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Origin: "https://aca-prod.accela.com",
    Referer: `https://aca-prod.accela.com/${AGENCY}/Cap/CapHome.aspx?module=Building&TabName=Building&TabList=CodeEnforcement%7C0%7CBuilding%7C1%7CAEGrading%7C2%7CLandDevelopment%7C3%7CServiceRequest%7C4%7CAdministration%7C5%7CEnvHealth%7C6%7CCurrentTabIndex%7C1`,
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "X-MicrosoftAjax": "Delta=true",
    "X-Requested-With": "XMLHttpRequest",
    "sec-ch-ua":
      '"Google Chrome";v="149", "Chromium";v="149", "Not)A;Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
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
    console.log("Response received successfully.");
    // Process responseText as needed
    return responseText; //html
  } catch (error) {
    console.error("Error sending request:", error);
  }
}

module.exports = { getDownloadPage };
