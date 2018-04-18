const sshconfig = {
  host: '192.168.1.2',
  username: 'ubuntu',
  identity: '/here/is/my/key'
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