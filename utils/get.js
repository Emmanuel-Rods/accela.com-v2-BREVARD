const axios = require("axios");

/**
 * Fetches the HTML content from a given URL.
 *
 * @param {string} url - The URL to fetch.
 * @returns {Promise<string|null>} - Returns the HTML string, or null if an error occurs.
 */

async function get(url) {
  try {
    // Make the GET request
    const response = await axios.get(url);

    return response.data;
  } catch (error) {
    // Handle any errors (like 404, network issues, etc.)
    console.error(`Error fetching HTML from ${url}:`, error.message);
    return null;
  }
}

module.exports = get;
