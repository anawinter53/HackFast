#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');
const readline = require('readline');

// recursively copy folder contents
async function copyDir(src, dest) {
    fs.mkdirSync(dest, { recursive: true });

    for (const item of fs.readdirSync(src)) {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);

        if (fs.statSync(srcPath).isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

// create the project folder and copy template files
async function createProject(appName) {
    const targetPath = path.join(process.cwd(), appName);

    if (fs.existsSync(targetPath)) {
        console.log(chalk.red(`❌ Folder '${appName}' already exists.`));
        process.exit(1);
    }

    console.log(chalk.green(`🚀 Creating app in ${appName}/ ...`));

    await copyDir(path.join(__dirname, 'template'), targetPath);

//   console.log(chalk.blue(`📦 Installing dependencies... (this may take a minute)`));
//   try {
//     execSync('npm install', { cwd: path.join(targetPath, 'frontend'), stdio: 'inherit' });
//     execSync('npm install', { cwd: path.join(targetPath, 'backend'), stdio: 'inherit' });
//   } catch (err) {
//     console.log(chalk.yellow('⚠️  Could not auto-install dependencies. Run them manually.'));
//   }
//
//   console.log(chalk.green(`✅ Done! You can now:`));
//   console.log(chalk.cyan(`\n  cd ${appName}`));
//   console.log('  npm run dev   # Or run frontend/backend separately\n');

    console.log(chalk.green(`✅ Done creating project folder and files.`));
    console.log(chalk.cyan(`\nNext steps:`));
    console.log(`cd ${appName}`);
    console.log(`npm install  # Run this inside both frontend and backend folders`);
    console.log(`npm run dev  # Then start your app\n`);
}

// prompt user for npm install confirmation
function confirmNpmRun(query) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise(resolve => rl.question(query, ans => {
        rl.close();
        resolve(ans.trim().toLowerCase());
    }));
}

async function promptNpmInstall() {
    const answer = await confirmNpmRun('Have you run npm install in frontend and backend? (y/n) ');

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        console.log(chalk.green('🎉 Great! You can now run the app.'));
    } else {
        console.log(chalk.yellow('⚠️  Please run npm install manually inside frontend and backend before running the app.  ⚠️'));
    }
}

// CLI entry point
async function main() {
    const args = process.argv.slice(2);

    if (args.length < 2 || args[0] !== 'new') {
        console.log(chalk.yellow('Usage: node cli.js new <app-name>'));
        process.exit(1);
    }

    try {
        await createProject(args[1]);
        await promptNpmInstall();
    } catch (err) {
        console.log(chalk.red(`❌ Error: ${err.message}`));
        process.exit(1);
    }
}

main();
