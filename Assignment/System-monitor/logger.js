const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'system-log.txt');

function logData(data) {
  const log = `
Time: ${new Date().toLocaleString()}
CPU Count: ${data.cpuCount}
Free Memory: ${data.freeMemory}
Total Memory: ${data.totalMemory}
Platform: ${data.platform}
---------------------------
`;

  fs.appendFile(logFilePath, log, (err) => {
    if (err) {
      console.log('Error writing log');
    }
  });
}

module.exports = logData;
