const ora = require('ora');
const inquirer = require('inquirer');
const semver = require('semver');
const chalk = require('chalk');
const Docker = require('docker-cli-js').Docker;

const Deploy = require('./lib/deploy.js');

const package = require('./package.json');
const currentVersion = package.version;
// const imageName = package.imageName;

const questions = [{
  type: 'input',
  name: 'version',
  message: `What\'s the next version${currentVersion ? ` (current ${currentVersion})` : ''}`,
  validate: function(value) {
    if (!semver.valid(value)) {
      return 'Version must match the format MAJOR.MINOR.PATCH, i.e. "1.2.3".';
    }
    if (currentVersion && semver.lt(value, currentVersion)) {
      return `Version must be greater than the current version (${currentVersion}).`;
    }
    return true;
  }
}];

// inquirer
//   .prompt(questions)
//   .then(answers => {
    const answers = { version: '1.2.3' }
    const imageName = `testimage`; // todo
    const nextVersion = semver.clean(answers.version);
  
    const spinner = ora();

    const deploy = new Deploy(imageName, nextVersion);

    deploy.on('build', (imageName) => spinner.start(`Building image ${chalk.magenta.bold(imageName)}`))
    deploy.on('build-completed', () => spinner.succeed())
    deploy.on('tag', (imageName, version) => spinner.start(`Tagging ${chalk.magenta.bold(imageName)}:${chalk.green.bold(version)}`))
    deploy.on('tag-completed', () => spinner.succeed())
    deploy.on('push', (imageName, version) => spinner.start(`Pushing ${chalk.magenta.bold(imageName)}:${chalk.green.bold(version)}`))
    deploy.on('push-completed', () => spinner.succeed())
    deploy.on('completed', () => spinner.start(chalk.green.bold(`Deploy completed.`)).succeed())

    deploy.on('error', (err) => {
      spinner.fail();
      console.error(err);
    })

    // deploy.start();

  //   // buildSpinner.start();

  //   // const docker = new Docker();
  //   // Promise.resolve()
  //   //   // .then(() => { throw new Error(`Failed to build image.`) })
  //   //   .then(() => docker.command(`build -t ${imageName} .`))
  //   //   .then(result => {
  //   //     if (!result.success) {
  //   //       throw new Error(`Failed to build image.`)
  //   //     }
  //   //     return result.containerId;
  //   //   })
  //   //   .then(containerId => {
        
  //   //   })
  //   //   .catch(err => {
  //   //     buildSpinner.fail(err.message);
  //   //     console.log(err);
  //   //   });

  //   // setTimeout(() => {
  //   //   buildSpinner.succeed()

  //   //   tagSpinner.start();
  //   //   setTimeout(() => {
  //   //     tagSpinner.succeed()

  //   //     pushSpinner.start();
  //   //     setTimeout(() => {
  //   //       pushSpinner.succeed()
  //   //     }, 1000);

  //   //   }, 1000);
  //   // }, 1000);

    
  // })



