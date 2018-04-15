const chalk = require('chalk');

module.exports = (errorMessage, helpText) => {
  console.log(chalk.red('! ') + chalk.red.bold.underline(errorMessage));
  console.log(chalk.bold(`  ${helpText}`));
}