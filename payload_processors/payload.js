const cheerio = require("cheerio");

/** builds the backbone of the payload which need to be update for inspection api and for other things */
function buildBasicPayload(htmlContent) {
  const $ = cheerio.load(htmlContent);
  const payload = {};

  // First, grab ALL inputs, selects, and textareas inside the form.
  // This dynamically captures __VIEWSTATE, __VIEWSTATEGENERATOR, and other hidden tokens.
  $("form#aspnetForm")
    .find("input, select, textarea")
    .each((_, el) => {
      const name = $(el).attr("name");
      const value = $(el).val() || "";

      // Skip buttons/submit inputs so we don't accidentally click the wrong button
      const type = $(el).attr("type");
      if (name && type !== "submit" && type !== "button") {
        payload[name] = value;
      }
    });

  // Manually fetch the ACA_CS_FIELD in case it falls outside the main form selection
  if ($("#ACA_CS_FIELD").length) {
    payload["ACA_CS_FIELD"] = $("#ACA_CS_FIELD").val();
  }
  payload["Submit"] = "Submit";

  return payload;
}

module.exports = buildBasicPayload;
