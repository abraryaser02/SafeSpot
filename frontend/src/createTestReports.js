const axios = require('axios');
const fs = require('fs');

// Define the zip codes and their corresponding range of positive test numbers
const zipCodes = [
  // Downtown LA
  "90017", "90012", "90015", "90014", "90021", "90013",
  "90007", "90006", "90005", "90004", "90010", "90020",
  // Hollywood
  "90028", "90038", "90068",
  // West LA
  "90024", "90025", "90049",
  // Santa Monica
  "90401", "90402", "90403", "90404", "90405",
  // Long Beach
  "90802", "90803", "90804", "90805", "90806", "90807",
  // Pasadena
  "91101", "91103", "91104", "91105", "91106", "91107",
  // Burbank
  "91501", "91502", "91505",
  // Culver City
  "90230", "90232",
  // Beverly Hills
  "90210", "90211", "90212",
  // Torrance
  "90501", "90502", "90503", "90504", "90505"
];

// Function to generate a random integer within a range
const getRandomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Function to generate reports for a given zip code
const generateReports = (zipCode) => {
  let positiveTestsRange;
  
  if (zipCode.startsWith("900")) { // Downtown LA zip codes
    positiveTestsRange = [5, 10];
  } else if (zipCode.startsWith("904")) { // Santa Monica zip codes
    positiveTestsRange = [3, 5];
  } else if (zipCode.startsWith("908")) { // Long Beach zip codes
    positiveTestsRange = [2, 5];
  } else { // Other zip codes
    positiveTestsRange = [1, 3];
  }

  const reports = [];
  for (let i = 0; i < getRandomInt(positiveTestsRange[0], positiveTestsRange[1]); i++) {
    const drugTypes = ['heroin', 'cocaine', 'meth', 'other'];
    const drugType = drugTypes[Math.floor(Math.random() * drugTypes.length)];
    reports.push({ drugType, zipCode });
  }
  return reports;
};

// Function to post reports to the backend API
const postReports = async (reports) => {
  for (const report of reports) {
    try {
      await axios.post('http://localhost:8800/api/reports', report);
      console.log(`Report posted for zip code ${report.zipCode}`);
    } catch (error) {
      console.error(`Error posting report for zip code ${report.zipCode}:`, error.response.data);
    }
  }
};

// Generate reports for all zip codes
const allReports = [];
for (const zipCode of zipCodes) {
  const reports = generateReports(zipCode);
  allReports.push(...reports);
}

// Write the generated reports to a JSON file for reference
fs.writeFileSync('generated_reports.json', JSON.stringify(allReports, null, 2), 'utf8');

// Post the generated reports to the backend API
postReports(allReports);
