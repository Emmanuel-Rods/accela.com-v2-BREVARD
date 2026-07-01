function nextInspectionPayloadBuilder(payload) {
  if (!payload) {
    throw new Error("Payload missing in nextInspectionPayloadBuilder");
  }

  const newPayload = {
    ACA_CS_FIELD: payload.ACA_CS_FIELD,
    __VIEWSTATEGENERATOR: payload.__VIEWSTATEGENERATOR,
    __VIEWSTATE: payload.__VIEWSTATE,
  };

  // Your existing fields (Action targets)
  newPayload["ctl00$ScriptManager1"] =
    `ctl00$PlaceHolderMain$InspectionList$completedPanel|${payload.eventTarget}`;
  newPayload["__EVENTTARGET"] = payload.eventTarget;
  newPayload["__EVENTARGUMENT"] = "";
  newPayload["__ASYNCPOST"] = "true";
  newPayload["Submit"] = "Submit";

  // Header Navigation Data
  newPayload["ctl00$HeaderNavigation$hdnShoppingCartItemNumber"] = "";
  newPayload["ctl00$HeaderNavigation$hdnShowReportLink"] = "N";

  // Add For Detail Page Data
  newPayload["ctl00$PlaceHolderMain$addForDetailPage$collection"] =
    "rdoExistCollection";
  newPayload["ctl00$PlaceHolderMain$addForDetailPage$ddlMyCollection"] = "";
  newPayload["ctl00$PlaceHolderMain$addForDetailPage$txtName"] = "";
  newPayload["ctl00$PlaceHolderMain$addForDetailPage$txtDesc"] = "";

  // Attachment Edit Data
  newPayload["ctl00$PlaceHolderMain$attachmentEdit$txtValidateSaveAction"] = "";
  newPayload["ctl00$PlaceHolderMain$attachmentEdit$hdfEditingFileIds"] = "";
  newPayload[
    "ctl00$PlaceHolderMain$attachmentEdit$fileSelect$hdFinishedFileArray"
  ] = "";
  newPayload["ctl00$PlaceHolderMain$attachmentEdit$hdAllFinishedFileArray"] =
    "";

  // Other ASP.NET Hidden Fields
  newPayload["ctl00$HDExpressionParam"] = "";
  newPayload["__VIEWSTATEENCRYPTED"] = "";

  // console.log("new payloaddd", newPayload);
  return newPayload;
}
module.exports = nextInspectionPayloadBuilder;
