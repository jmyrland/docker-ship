const ora = require('ora');
const inquirer = require('inquirer');
const semver = require('semver');
const chalk = require('chalk');
const printError = require('../lib/helpers/printError')

const Deploy = require('../lib/deploy');
const { isDockerInstalled, isDockerfilePresent } = require('../lib/docker');
const updatePkgVersion = require('../lib/helpers/updatePkgVersion');

const command = async (args) => {
  // Ensure that docker is installed
  if (!await isDockerInstalled()) {
    printError('Docker is not installed', 'verify installation by running `which docker`');
    process.exit(0);
  }
  // Ensure that a Dockerfile is present
  if (!await isDockerfilePresent()) {
    printError('Dockerfile not located', `wrong dictionary? (${process.cwd()})`);
    process.exit(0);
  }
  // Validate args version
  if (args.nextVersion && !semver.valid(args.nextVersion)) {
    printError('Invalid value for "nextVersion"');
    // Set as incoming version as undefined - will be "inquired"
    args.nextVersion = undefined;
  }

  // Ensure values for image and version
  const input = await inquireMissingParameters(args);
  const { imageName, nextVersion } = input;

  // Setup process dependencies for process..
  const spinner = ora();

  // Get handlers from external module
  const { handlePreBuild, handlePostPush } = args.shipModule;
  const ctx = { spinner, inquirer };

  // Execute pre build action
  await handlePreBuild(ctx, input);

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

    // Execute post push action
    await handlePostPush(ctx, input);

    spinner.start(chalk.green.bold(`Deploy completed.`)).succeed();
    process.exit(0);
  })

  deploy.on('error', (err) => {
    spinner.fail();
    console.error(err);
    process.exit(1);
  })
}

const inquireMissingParameters = async ({ pkgPath, updatePkg, nextVersion, currentVersion, imageName }) => {
  const questions = [
    {
      when: !imageName,
      type: 'input',
      name: 'imageName',
      message: `Docker image name?`,
      validate: (value) => !!value,
    },
    {
      when: !nextVersion || !semver.valid(nextVersion),
      type: 'input',
      name: 'nextVersion',
      default: semver.inc(currentVersion, 'patch'),
      message: `Version to deploy?${currentVersion ? ` (current ${currentVersion})` : ''}`,
      validate: function(value) {
        if (!semver.valid(value)) {
          return 'Version must match the format MAJOR.MINOR.PATCH, i.e. "1.2.3".';
        }
        if (currentVersion && !semver.gt(value, currentVersion)) {
          return `Version must be greater than the current version (${currentVersion}).`;
        }
        return true;
      }
    },
    {
      when: !!pkgPath && !updatePkg,
      type: 'confirm',
      name: 'shouldUpdatePkgVersion',
      default: true,
      message: 'Should the package.json version be updated after?'
    }
  ];

  const knownValues = { nextVersion, imageName, shouldUpdatePkgVersion: updatePkg };
  const answers = await inquirer.prompt(questions);
  const result = { ...knownValues, ...answers };
  return { ...result, nextVersion: semver.clean(result.nextVersion) };
}

module.exports = {
  cmd: '$0 [imageName] [nextVersion]',
  desc: 'Build, tag and push docker image',
  builder: (yargs, defaults) => {
    yargs.positional('nextVersion', {
      describe: 'version to deploy (prompted if missing)',
      type: 'string',
    })
    yargs.positional('imageName', {
      describe: 'docker image name (prompted if missing)',
      type: 'string',
      default: defaults.imageName
    })
  },
  handler: command
};