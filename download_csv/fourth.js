const fs = require("fs").promises;

async function exportCSV(cookies, AGENCY) {
  const url = `https://aca-prod.accela.com/${AGENCY}/Export2CSV.ashx?flag=1738`;

  const headers = {
    Cookie: cookies,
  };

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Retrieve the response content as text
    const csvData = await response.text();

    // Save the downloaded CSV data to a file
    await fs.writeFile("daily.csv", csvData, "utf-8");

    console.log("CSV data successfully saved to export.csv");
    return csvData;
  } catch (error) {
    console.error("Error during CSV export:", error);
  }
}

module.exports = { exportCSV };
