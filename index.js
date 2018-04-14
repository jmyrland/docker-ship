#!/usr/bin/env node
require('pretty-error').start();

const ora = require('ora');
const inquirer = require('inquirer');
const semver = require('semver');
const chalk = require('chalk');
const collectInput = require('./lib/collectInput.js');

const Deploy = require('./lib/deploy.js');
const { isDockerInstalled, isDockerfilePresent } = require('./lib/docker.js');

const printError = (errorMessage, helpText) => {
  console.log(chalk.red('! ') + chalk.red.bold.underline(errorMessage));
  console.log(chalk.bold(`  ${helpText}`));
}

const updatePkgVersion = async (version) => {
  const util = require('util');
  const exec = util.promisify(require('child_process').exec);

  const cmd = `npm version ${version}`;
  const { stdout, stderr } = await exec(cmd);

  if (stderr) {
    throw new Error(stderr)
  }
}

const main = async () => {
  // Ensure that docker is installed
  if (!await isDockerInstalled()) {
    printError('Docker is not installed', 'verify installation by running `which docker`');
    process.exit(0);
  }
  if (!await isDockerfilePresent()) {
    printError('Dockerfile not located', `wrong dictionary? (${process.cwd()})`);
    process.exit(0);
  }

  // Ensure values for image and version
  const input = await collectInput();
  const { imageName, nextVersion } = input;

  // Setup process dependencies for process..
  const spinner = ora();

  // Initiate deployment
  const deploy = new Deploy(imageName, nextVersion);
  deploy.on('build', (imageName) => spinner.start(`Building ${chalk.magenta.bold(imageName)}`))
  deploy.on('build-completed', (imageName, containerId) => spinner.succeed(`Built ${chalk.magenta.bold(imageName)} (${chalk.yellow(containerId)})`))
  deploy.on('tag', (imageName, version) => spinner.start(`Tagging ${chalk.magenta.bold(imageName)}:${chalk.green.bold(version)}`))
  deploy.on('tag-completed', (imageName, version) => spinner.succeed(`Tagged ${chalk.magenta.bold(imageName)}:${chalk.green.bold(version)}`))
  deploy.on('push', (imageName, version) => spinner.start(`Pushing ${chalk.magenta.bold(imageName)}:${chalk.green.bold(version)}`))
  deploy.on('push-completed', (imageName, version) => spinner.succeed(`Pushed ${chalk.magenta.bold(imageName)}:${chalk.green.bold(version)}`))

  deploy.on('completed', async () => {
    if (input.shouldUpdatePkgVersion) {
      try {
        spinner.start('Updating version in package.json');
        await updatePkgVersion(nextVersion);
        spinner.succeed('Updated version in package.json');
      } catch(err) {
        spinner.fail();
        console.error(err);
      }
    }

    spinner.start(chalk.green.bold(`Deploy completed.`)).succeed();
    process.exit(0);
  })

  deploy.on('error', (err) => {
    spinner.fail();
    console.error(err);
    process.exit(1);
  })

}

main();