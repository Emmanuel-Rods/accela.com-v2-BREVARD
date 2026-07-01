function recordIDPayloadBuilder(payload, recordNumber) {
  if (!recordNumber) {
    throw new Error("Record Number Param Missing in recordIDPayloadBuilder");
  }

  payload["ctl00$PlaceHolderMain$txtPermitNumber"] = recordNumber;

  payload["ctl00$ScriptManager1"] =
    "ctl00$PlaceHolderMain$updatePanel|ctl00$PlaceHolderMain$btnNewSearch";
  payload["__EVENTTARGET"] = "ctl00$PlaceHolderMain$btnNewSearch";
  payload["__EVENTARGUMENT"] = "";
  payload["ctl00$PlaceHolderMain$ddlSearchType"] = "3";
  payload["__ASYNCPOST"] = "true";
  payload["Submit"] = "Submit";

  return payload;
}

module.exports = recordIDPayloadBuilder;
