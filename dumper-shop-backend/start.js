require("dotenv").config();
const { fork } = require("child_process");
const path = require("path");
const fs = require("fs");

async function startMedusa() {
  const rootDir = process.cwd();

  // The path we just confirmed locally
  const cliPath = path.join(rootDir, "node_modules", "@medusajs/cli", "cli.js");

  console.log("--- Initializing Medusa v2 ---");
  console.log("Target CLI:", cliPath);

  if (!fs.existsSync(cliPath)) {
    console.error("❌ ERROR: CLI not found at " + cliPath);
    console.log("Current directory files:", fs.readdirSync(rootDir));
    process.exit(1);
  }

  // Trigger 'node node_modules/@medusajs/cli/cli.js start'
  const child = fork(cliPath, ["start"], {
    env: {
      ...process.env,
      NODE_ENV: "production",
      PORT: process.env.PORT || 9000,
    },
  });

  child.on("exit", (code) => {
    console.log(`Medusa process exited with code ${code}`);
  });
}

startMedusa();
