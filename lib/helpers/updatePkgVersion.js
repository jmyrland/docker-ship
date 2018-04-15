const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = async (version) => {
  const cmd = `npm version ${version}`;
  const { stdout, stderr } = await exec(cmd);

  if (stderr) {
    throw new Error(stderr)
  }
}