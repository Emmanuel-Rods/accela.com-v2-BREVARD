const cheerio = require("cheerio");
const parseApplicationInformation = require("./permit_parser_utliities/application_infomation_parser.js");

// Helper function to clean up messy HTML text (removes extra spaces, newlines, etc.)
const cleanText = (text) => {
  if (!text) return "";
  return text
    .replace(/[\r\n\t]+/g, " ") // Replace newlines and tabs with spaces
    .replace(/\s{2,}/g, " ") // Replace multiple spaces with a single space
    .replace(/\*$/g, "") // Remove trailing asterisks
    .trim();
};

// Helper function to parse blocks containing <br> tags into clean multiline arrays/strings
const parseBrBlock = ($, element) => {
  let html = $(element).html();
  if (!html) return "";
  return cleanText(
    $("<div>")
      .html(html.replace(/<br\s*\/?>/gi, " | "))
      .text(),
  );
};

function parsePermits(htmlString, recordId) {
  const $ = cheerio.load(htmlString);
  const result = {};

  // Helper to extract phones specifically formatted with .ACA_PhoneNumberLTR
  // Finds the number and looks at the adjacent cell for the type (e.g. "Work Phone")
  const extractPhones = (context) => {
    const phones = {};
    $(context)
      .find(".ACA_PhoneNumberLTR")
      .each((i, el) => {
        let type = cleanText(
          $(el).closest("tr").find("td").first().text(),
        ).replace(":", "");
        let num = cleanText($(el).text());
        if (type && num) {
          phones[type] = num;
        }
      });
    return phones;
  };

  // 1. Top Level Record Info
  result.recordInfo = {
    "Record Number": cleanText(
      $("#ctl00_PlaceHolderMain_lblPermitNumber").text(),
    ),
    recordId: recordId,
    recordType: cleanText($("#ctl00_PlaceHolderMain_lblPermitType").text()),
    recordStatus: cleanText($("#ctl00_PlaceHolderMain_lblRecordStatus").text()),
    expirationDate: cleanText(
      $("#ctl00_PlaceHolderMain_lblExpirtionDate").text(),
    ),
  };

  // 2. Work Location
  result.workLocation = parseBrBlock($, "#tbl_worklocation .NotBreakWord");

  // 3. Record Details (Main blocks)
  const applicantTd = $('span[id*="label_applicant"]').closest("td");
  result.applicant = {
    name: cleanText(
      applicantTd.find(".contactinfo_firstname").first().text() +
        " " +
        applicantTd.find(".contactinfo_lastname").first().text(),
    ),
    businessName: cleanText(
      //   applicantTd.find(".contactinfo_businessname").first().text(),
      $(".contactinfo_businessname").first().text(),
    ),
    address: cleanText(
      applicantTd.find(".contactinfo_addressline1").first().text(),
    ),
    // Using Set to prevent duplication if elements overlap
    region: [
      ...new Set(
        applicantTd
          .find(".contactinfo_region")
          .map((i, el) => cleanText($(el).text()))
          .get(),
      ),
    ].join(" "),
    country: cleanText(applicantTd.find(".contactinfo_country").first().text()),
    email: cleanText(
      applicantTd
        .find(".contactinfo_email")
        .first()
        .text()
        .replace("E-mail:", ""),
    ),
    // Attach dynamically parsed phones
    phones: extractPhones(applicantTd),
  };

  // Licensed Professionals
  result.licensedProfessionals = [];
  $("#tbl_licensedps")
    .find("tr")
    .each((i, el) => {
      // Prevent grabbing nested TRs (which caused the standalone phone number strings in your old array)
      if ($(el).closest("table").attr("id") !== "tbl_licensedps") return;

      let text = parseBrBlock($, $(el).find("> td").eq(1));
      if (text && !text.includes("View Additional")) {
        // Changed to objects to keep plaintext while exposing phones cleanly
        result.licensedProfessionals.push({
          rawText: text,
          phones: extractPhones(el),
        });
      }
    });

  // Project Description & Owner
  result.projectDescription = parseBrBlock(
    $,
    $('span[id*="label_project"]').closest("td").find(".table_child td").eq(1),
  );
  result.owner = parseBrBlock(
    $,
    $('span[id*="label_owner"]').closest("td").find(".table_child td"),
  );

  // 4. More Details -> Related Contacts
  result.relatedContacts = [];
  $("#trRCList .MoreDetail_ItemCol").each((i, el) => {
    let text = parseBrBlock($, el);
    if (text) {
      // Changed to objects to keep plaintext while exposing phones cleanly
      result.relatedContacts.push({
        type: cleanText($(el).find("h2").text()), // Grabs "Property Owner information", etc.
        rawText: text,
        phones: extractPhones(el),
      });
    }
  });

  // . Additional Information / More Details (e.g., Job Value)
  result.additionalInfo = {};

  $(
    "#ctl00_PlaceHolderMain_PermitDetailList1_tdADIContent .MoreDetail_ItemCol",
  ).each((i, el) => {
    // Extract the label from the <h2> tag and remove the trailing colon
    // e.g., "Job Value($):" becomes "Job Value($)"
    const label = cleanText($(el).find("h2").text()).replace(/:$/, "");

    // Extract the value from the adjacent span
    // e.g., "$2,200.00"
    const value = cleanText($(el).find(".ACA_SmLabel").text());

    if (label) {
      result.additionalInfo[label] = value;
    }
  });

  // 5. Application Information (ASI - Key/Value pairs grouped by category)
  result.applicationInformation = {};
  result.applicationInformation = parseApplicationInformation(htmlString);

  // 6. Application Information Tables (ASIT - Grids/Tables)
  result.applicationInformationTables = {};
  $("#trASITList table").each((i, tbl) => {
    let title = cleanText($(tbl).find(".ACA_Title_Text").text());
    if (!title) return; // Skip layout tables

    result.applicationInformationTables[title] = [];

    $(tbl)
      .find(".MoreDetail_Item")
      .each((j, item) => {
        let rowObj = {};
        let keys = $(item).find(".MoreDetail_ItemCol1");
        let vals = $(item).find(".MoreDetail_ItemCol2");

        keys.each((k, keyEl) => {
          let key = cleanText($(keyEl).text()).replace(/:$/, "");
          let val = cleanText($(vals[k]).text());
          if (key) rowObj[key] = val;
        });
        if (Object.keys(rowObj).length > 0)
          result.applicationInformationTables[title].push(rowObj);
      });
  });

  // 7. Parcel Information ( new version )
  result.parcelInformation = {};

  // Grab all contents inside the Parcel block, filtering down to just the raw text nodes
  $("#trParcelList td.MoreDetail_BlockContent *")
    .contents()
    .each((i, el) => {
      // We only care about text nodes (nodeType 3 in standard DOM, but cheerio uses el.type === 'text')
      if (el.type === "text") {
        let text = cleanText($(el).text());

        // Skip empty strings and that random blue asterisk Accela throws in
        if (!text || text === "*") return;

        // Scenario A: It's formatted normally with a colon (e.g., "Block:84", "Lot:13.06")
        if (text.includes(":")) {
          let parts = text.split(":");
          let key = cleanText(parts[0]);
          let val = cleanText(parts.slice(1).join(":")); // Re-join the rest in case value has a colon

          if (key) {
            result.parcelInformation[key] = val;
          }
        }
        // Scenario B: Accela forgot the colon (e.g., "Tax Account Number2435088")
        else {
          // Regex to separate the letters from the numbers
          let match = text.match(/^([A-Za-z\s]+)([\d\-]+.*)$/);

          if (match) {
            let key = cleanText(match[1]);
            let val = cleanText(match[2]);
            result.parcelInformation[key] = val;
          } else {
            // Fallback just in case there's weird loose text
            result.parcelInformation["Parcel Note " + i] = text;
          }
        }
      }
    });

  return result;
}

module.exports = parsePermits;
