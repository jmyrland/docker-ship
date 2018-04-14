#!/usr/bin/env node

const ora = require('ora');
const inquirer = require('inquirer');
const semver = require('semver');
const chalk = require('chalk');
const collectInput = require('./lib/collectInput.js');

const Deploy = require('./lib/deploy.js');
const { isDockerInstalled } = require('./lib/docker.js');

const main = async (args) => {
  // Ensure that docker is installed
  if (!await isDockerInstalled()) {
    console.log(chalk.red('! ') + chalk.red.bold.underline('Docker is not installed'));
    console.log(chalk.bold('  verify installation by running `which docker`'));
    process.exit(0);
  }

  // Ensure values for image and version
  const { imageName, nextVersion } = await collectInput(args);

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

  deploy.on('completed', () => {
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