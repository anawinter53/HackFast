#!/usr/bin/env node

import fs from 'fs-extra';
import path from 'path';
import chalk from 'chalk';
import readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


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
    const targetPath = path.isAbsolute(appName) ? appName : path.join(process.cwd(), appName);

    if (fs.existsSync(targetPath)) {
        console.log(chalk.red(`❌ Folder '${appName}' already exists.`));
        process.exit(1);
    }

    console.log(chalk.green(`🚀 Creating app in ${appName}/ ...`));

    await copyDir(path.join(__dirname, 'template'), targetPath);

    console.log(chalk.green(`✅ Done creating project folder and files.`));
    console.log(chalk.cyan(`\nNext steps:`));
    console.log(`cd ${appName}`);
    console.log(`npm install  # Run this inside both frontend and backend folders`);
    console.log(`npm run dev  # Then start your app\n`);
}

// prompt user to install modules or automate them by request
async function promptNpmInstall(appName) {
    const targetPath = path.resolve(process.cwd(), appName);
    const rl = readline.createInterface({ input, output });

    const answer = (await rl.question('Do you want to run these commands automatically now? (y/n) ')).trim().toLowerCase();
    rl.close();

    if (answer === 'y' || answer === 'yes') {
        try {
            console.log(chalk.blue('\nInstalling frontend dependencies...'));
            execSync('npm install', { cwd: path.join(targetPath, 'frontend'), stdio: 'inherit' });

            console.log(chalk.blue('\nInstalling backend dependencies...'));
            execSync('npm install', { cwd: path.join(targetPath, 'backend'), stdio: 'inherit' });

            console.log(chalk.green('\n✅ Dependencies installed successfully!'));
            console.log(chalk.cyan('You can now run your app with:'));
            console.log('npm run dev  # inside both frontend and backend folders');
        } catch (err) {
            console.error(chalk.red('\n❌ npm install failed. Please check the errors above.'));
            process.exit(1);
        }
    } else {
        console.log(chalk.yellow('\nOkay, remember to run npm install inside frontend and backend folders before running your app.'));
        process.exit(0);
    }
}

// cli entry point
async function main() {
    const args = process.argv.slice(2);

    // ensure the new keyword is used in cli command
    if (args.length < 2 || args[0] !== 'new') {
        console.log(chalk.yellow('Usage: node cli.js new <app-name>'));
        process.exit(1);
    }

    // run functions passing the app name from cli command
    try {
        await createProject(args[1]);
        await promptNpmInstall(args[1]);
    } catch (err) {
        console.log(chalk.red(`❌ Error: ${err.message}`));
        process.exit(1);
    }
}

main();
