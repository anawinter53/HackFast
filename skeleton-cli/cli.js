#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const chalk = require("chalk");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });

  for (const item of fs.readdirSync(src)) {
    const srcPath = path.join(src, item);
    const destPath = path.join(dest, item);

    if (fs.statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function createProject(appName) {
  const targetPath = path.join(process.cwd(), appName);

  if (fs.existsSync(targetPath)) {
    console.log(chalk.red(`❌ Folder "${appName}" already exists.`));
    process.exit(1);
  }

  console.log(chalk.green(`🚀 Creating app in ${appName}/ ...`));
  copyDir(path.join(__dirname, "template"), targetPath);

  console.log(chalk.blue(`📦 Installing dependencies... (this may take a minute)`));
  try {
    execSync("npm install", { cwd: path.join(targetPath, "frontend"), stdio: "inherit" });
    execSync("npm install", { cwd: path.join(targetPath, "backend"), stdio: "inherit" });
  } catch (err) {
    console.log(chalk.yellow("⚠️  Could not auto-install dependencies. Run them manually."));
  }

  console.log(chalk.green(`✅ Done! You can now:`));
  console.log(chalk.cyan(`\n  cd ${appName}`));
  console.log("  npm run dev   # Or run frontend/backend separately\n");
}

const [, , command, appName] = process.argv;

if (command === "new" && appName) {
  createProject(appName);
} else {
  console.log(chalk.yellow("Usage: node cli.js new <app-name>"));
}
