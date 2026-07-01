function parseAccelaRedirect(inputStr) {
  // 1. Find the URL-encoded link using a Regular Expression
  // It looks for "pageRedirect||" and captures everything until the next "|"
  const match = inputStr.match(/pageRedirect\|\|([^|]+)\|/);

  if (!match) {
    console.error("No redirect link found in the input string.");
    //if no match then it might be multple resuts
    return null;
  }

  // 2. Decode the extracted URL
  const decodedLink = decodeURIComponent(match[1]);

  // 3. Extract the query parameters to get the capIDs
  // We split by '?' to isolate the query string
  const queryString = decodedLink.split("?")[1] || "";
  const urlParams = new URLSearchParams(queryString);

  // 4. Retrieve capID1, capID2, and capID3
  const capID1 = urlParams.get("capID1") || "";
  const capID2 = urlParams.get("capID2") || "";
  const capID3 = urlParams.get("capID3") || "";

  // 5. Format the recordId
  const recordId = `${capID1}-${capID2}-${capID3}`;

  // 6. Return the results
  return {
    link: decodedLink,
    recordId: recordId,
  };
}

module.exports = parseAccelaRedirect;
