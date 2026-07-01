function inspectionPayloadBuilder(payload) {
  if (!payload) {
    throw new Error("Payload missing in inspectionPayloadBuilder");
  }
  payload["ctl00$ScriptManager1"] =
    "ctl00$PlaceHolderMain$InspectionList$inspectionUpdatePanel|ctl00$PlaceHolderMain$InspectionList$btnRefreshGridView";
  payload["__EVENTTARGET"] =
    "ctl00$PlaceHolderMain$InspectionList$btnRefreshGridView";
  payload["__EVENTARGUMENT"] = "";
  payload["__ASYNCPOST"] = "true";
  payload["Submit"] = "Submit";

  return payload;
}

module.exports = inspectionPayloadBuilder;
