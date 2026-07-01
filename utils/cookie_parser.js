function processCookies(response) {
  const rawCookies = response.headers.getSetCookie();

  // 2. Format them into a single string for your next request
  let cookieString = "";
  if (rawCookies && rawCookies.length > 0) {
    cookieString = rawCookies.map((cookie) => cookie.split(";")[0]).join("; ");
  }

  return cookieString;
}

module.exports = processCookies;
