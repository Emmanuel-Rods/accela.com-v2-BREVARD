// const base = ""; // No trailing slash

const dateOffset = 1; // 1 = yesterday

// statuses that need to pulled using daily.js
const requiredStatuses = ["Issued", "Final", "Review In-Progress"];

// permit types
const requiredSecondaryData = [
  "COM New Construction",
  "RES SFR Addition",
  "RES SFR-Duplex New",
];

//status that need be updated
const updateStatuses = ["Issued", "Review In-Progress"];

// exports
module.exports = {
  dateOffset,
  requiredStatuses,
  requiredSecondaryData,
  updateStatuses,
};
