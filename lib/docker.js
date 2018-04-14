const util = require('util');
const exec = util.promisify(require('child_process').exec);
const os = require('os');
const fileExists = require('file-exists');

module.exports.isDockerInstalled = async () => {
  try {
    const cmd = `which docker`;
    await exec(cmd);
    return true;
  } catch(err) {
    return false;
  }
}

module.exports.isDockerfilePresent = async () => await fileExists('Dockerfile')

module.exports.build = async (imageName) => {
  const cmd = `docker build -t ${imageName} .`;
  const { stdout, stderr } = await exec(cmd);

  if (stderr) {
    throw new Error(stderr)
  }

  const containerId = extractContainerId(stdout);
  if (!containerId) {
    throw new Error(`Failed to extract container id after build. Result: ${os.EOL + stdout}`)
  }

  return containerId;
}

module.exports.tag = async (containerId, imageName, version) => {
  const cmd = `docker tag ${containerId} ${imageName}:${version}`;
  const { stdout, stderr } = await exec(cmd);

  if (stderr) {
    throw new Error(stderr)
  }
}

module.exports.push = async (imageName, version) => {
  const cmd = `docker push ${imageName}:${version}`;
  const { stdout, stderr } = await exec(cmd);

  if (stderr) {
    throw new Error(stderr)
  }
}

const extractContainerId = (stdout) => {
  const regx = /Successfully built (.+)/
  const lines = stdout.split(os.EOL);
  const [containerId] = lines
    .map(l => regx.exec(l))
    .filter(matches => !!matches)
    .map(matches => matches[1]);
  return containerId;
}