const semver = require('semver');
const fileExists = require('file-exists');
const path = require('path');
const printError = require('../lib/helpers/printError');

const asyncNoop = async () => {};

const defaults = {
  pkgPath: path.join(process.cwd(), '/package.json'),
  currentVersion: undefined,
  nextVersion: undefined,
  imageName: undefined,
  shouldUpdatePkgVersion: undefined,
  shipModulePath: undefined,
  shipModule: {
    handlePreBuild: asyncNoop,
    handlePostPush: asyncNoop
  },
}

const commands = [
  require('./default'),
]

module.exports = async () => {
  // Collect default values from package.json (if present)
  const folderContainsPkg = await fileExists(defaults.pkgPath);
  if (folderContainsPkg) {
    const pkg = require(defaults.pkgPath);
    defaults.imageName = pkg.dockerRepository;
    defaults.currentVersion = pkg.version;
    if (pkg.dockerShipModule) {
      const modulePath = path.join(process.cwd(), pkg.dockerShipModule);
      const moduleFound = await fileExists(modulePath);
      if (!moduleFound) {
        printError('Docker ship module was specified, but not found.', `wrong path? (${process.cwd()})`);
        process.exit(0);
      }
      const shipModule = require(modulePath);
      defaults.shipModulePath = modulePath;
      defaults.shipModule = Object.assign({}, defaults.shipModule, shipModule);
    }
  }
  else {
    defaults.pkgPath = undefined;
  }

  const yargs = require('yargs')
    .config(defaults);

  for (let command of commands) {
    yargs.command(
      command.cmd,
      command.desc,
      (yargs) => command.builder(yargs, defaults),
      command.handler
    )
  }

  const argv = yargs
    .option('update-pkg', {
      alias: 'u',
      type: 'boolean',
      describe: 'Update the version in package.json'
    })
    .version()
    .help()
    .argv
}