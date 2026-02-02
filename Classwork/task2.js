const fs = require('fs');
const readline = require('readline');
const path = require('path');


const logFile = path.join(__dirname, 'server.log'); 
const summaryFile = path.join(__dirname, 'summary.txt'); 

if (!fs.existsSync(logFile)) {
    console.log('Log file not found, creating sample log file...');
    const sampleLogs = [
        'INFO Server started',
        'WARNING Disk usage high',
        'ERROR Database connection failed',
        'INFO User logged in',
        'ERROR Timeout occurred',
    ].join('\n');
    fs.writeFileSync(logFile, sampleLogs, 'utf-8');
    console.log('Sample log file created!');
}

let totalLines = 0;
let errorCount = 0;
let warningCount = 0;
let infoCount = 0;

const readStream = fs.createReadStream(logFile, { encoding: 'utf-8' });

const rl = readline.createInterface({
    input: readStream,
    crlfDelay: Infinity
});

rl.on('line', (line) => {
    totalLines++;

    if (line.includes('ERROR')) errorCount++;
    else if (line.includes('WARNING')) warningCount++;
    else if (line.includes('INFO')) infoCount++;
});

rl.on('close', () => {
    const summary = `
Log File Analysis Report
------------------------
Total Lines   : ${totalLines}
INFO Count    : ${infoCount}
WARNING Count : ${warningCount}
ERROR Count   : ${errorCount}
`;

    fs.writeFileSync(summaryFile, summary);
    console.log('✅ Log analysis completed. Summary generated at', summaryFile);
});
