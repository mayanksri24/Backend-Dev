const getSystemInfo = require('./systeminfo');
const logData = require('./logger');

setInterval(() => {
  const systemInfo = getSystemInfo();
  logData(systemInfo);
  console.log('System info logged...');
}, 5000);
