const dotenv = require('dotenv');
const SSH2Promise = require('ssh2-promise');

dotenv.config({ path: './test.env' });

const sshconfig = {
  host: process.env.DEPLOY_HOST,
  username: process.env.DEPLOY_USER,
  password: process.env.DEPLOY_PASS,
  port: process.env.DEPLOY_PORT,
}

module.exports = {

  handlePostPush: async ({ inquirer, spinner }, { imageName, nextVersion}) => {

    const ssh = new SSH2Promise(sshconfig);

    spinner.start(`Connecting to ${sshconfig.host}`);
    await ssh.connect(sshconfig);
    spinner.succeed(`Connected to ${sshconfig.host}`);

    spinner.start(`Pulling ${imageName}:${nextVersion} on server`);
    await ssh.exec(`docker pull ${imageName}:${nextVersion}`);
    spinner.succeed(`Fetched ${imageName}:${nextVersion} on server`);

    spinner.start(`Restarting containers on server`);
    await ssh.exec(`docker-compose up -d`);
    spinner.succeed(`Restarted containers on server`);

  }

}