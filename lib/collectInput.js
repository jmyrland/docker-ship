const inquirer = require('inquirer');
const semver = require('semver');
const fileExists = require('file-exists');
const path = require('path');

const intializeYargs = async (resolve) => {
  const defaults = {
    pkgPath: path.join(process.cwd(), '/package.json'),
    currentVersion: undefined,
    nextVersion: undefined,
    imageName: undefined,
  }

  // Collect default values from package.json (if present)
  const folderContainsPkg = await fileExists(defaults.pkgPath);
  if (folderContainsPkg) {
    const pkg = require(defaults.pkgPath);
    defaults.imageName = pkg.dockerRepository;
    defaults.currentVersion = pkg.version;
  }
  else {
    defaults.pkgPath = undefined;
  }

  return await new Promise((resolve) => {
    const argv = require('yargs')
      .config(defaults)
      .command(
        '$0 [imageName] [nextVersion]',
        'Build, tag and push docker image',
        (yargs) => {
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
        (argv) => {
          if(argv.nextVersion && !semver.valid(argv.nextVersion)) {
            console.log(chalk.red('! ') + chalk.red.bold.underline('Invalid value for "nextVersion"'));
            argv.nextVersion = undefined;
          }
          resolve(argv);
        },
      )
      .help()
      .argv
  });


};

const inquireMissingParameters = async ({ nextVersion, currentVersion, imageName }) => {
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
    }
  ];

  const knownValues = { nextVersion, imageName };
  const answers = await inquirer.prompt(questions);
  const result = { ...knownValues, ...answers };
  return { ...result, nextVersion: semver.clean(result.nextVersion) };
}

module.exports = async () => {
  const args = await intializeYargs();
  const params = await inquireMissingParameters(args);
  return params;
}