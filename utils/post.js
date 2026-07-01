const axios = require("axios");

async function postToServer(url, payload, cookies) {
  const targetUrl = url;

  // Headers exactly as requested in the curl command
  const headers = {
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    Origin: "https://aca-prod.accela.com",
    Pragma: "no-cache",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
    "X-MicrosoftAjax": "Delta=true",
    "X-Requested-With": "XMLHttpRequest",
    Cookie: cookies,
  };

  // Convert the Javascript object into an application/x-www-form-urlencoded string

  const formEncodedData = new URLSearchParams(payload).toString();
  // require("fs").writeFileSync("formencodeddata", formEncodedData); !debuging pupor

  try {
    console.log("Sending POST Request...");
    const response = await axios.post(targetUrl, formEncodedData, { headers });
    console.log("Request successful! HTTP Status:", response.status);

    // The response will be an ASP.NET Delta string (e.g. length|type|id|content)
    return response.data;
  } catch (error) {
    console.error("Error making POST request:", error.message);
    if (error.response) {
      console.error("Response Data:", error.response.data);
    }
    throw error;
  }
}

module.exports = postToServer;
