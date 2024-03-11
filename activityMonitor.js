const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');

const getCommand = () => {
  const osType = os.type();
  let command = '';

  switch (osType) {
    case 'Windows_NT':
      command = 'powershell "Get-Process | Sort-Object CPU -Descending | Select-Object -Property Name, CPU, WorkingSet -First 1 | ForEach-Object { $_.Name + \' \' + $_.CPU + \' \' + $_.WorkingSet }"';
      break;
    default:
      command = 'ps -A -o %cpu,%mem,comm | sort -nr | head -n 1';
  };
  return command;
}

const logToFile = (processInfo) => {
  const currentTime = Math.floor(Date.now() / 1000);
  const logLine = `${currentTime}: ${processInfo}\n`;
  fs.appendFileSync('activityMonitor.log', logLine);
};

function displayProcessInfo(processInfo) {
  process.stdout.clearLine();
  process.stdout.cursorTo(0);
  process.stdout.write(processInfo);
}

const main = () => {
  const refreshRate = 100;
  const logInterval = 60 * 1000;
  const command = getCommand();

  setInterval(() => {

    exec(command, (error, stdout, stderr) => {

      if (error) {
        console.error(`Error: ${error.message}`);
        return;
      };

      if (stderr) {
        console.error(`Command stderr: ${stderr}`);
        return;
      };

      const processInfo = stdout.trim();
      displayProcessInfo(processInfo)

    });
  }, refreshRate);

  if (!fs.existsSync('activityMonitor.log')) {
    fs.writeFileSync('activityMonitor.log', '')
  };

  setInterval(() => {

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`LogFile Error: ${error.message}`);
        return;
      };

      if (stderr) {
        console.error(`LogFile command stderr: ${stderr}`);
        return;
      };
      const processInfo = stdout.trim();
      logToFile(processInfo);
    })
  }, logInterval);
};

main();