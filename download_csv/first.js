const fs = require("fs").promises;

async function getHTMLandCookies(AGENCY) {
  const url = `https://aca-prod.accela.com/${AGENCY}/Cap/CapHome.aspx?module=Building&TabName=Building&TabList=CodeEnforcement%7C0%7CBuilding%7C1%7CAEGrading%7C2%7CLandDevelopment%7C3%7CServiceRequest%7C4%7CAdministration%7C5%7CEnvHealth%7C6%7CCurrentTabIndex%7C1`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const rawcookies = response.headers.getSetCookie();
    const html = await response.text();
    // Save cookies to a JSON file if they exist
    // if (rawcookies.length > 0) {
    //   await fs.writeFile(
    //     "cookies.json",
    //     JSON.stringify(rawcookies, null, 2),
    //     "utf-8",
    //   );
    // }
    // cookie formating
    const cookies = rawcookies
      .map((cookie) => cookie.split(";")[0].trim())
      .join("; ");

    return { html, cookies };
  } catch (error) {
    console.error("Error fetching or saving the file:", error);
  }
}

module.exports = { getHTMLandCookies };
