# SSH into server and pull latest after push

This example illustrates how to ssh in to a server, post push,
followed by pulling the newly pushed image - followed by restarting
docker-compose.

[ssh2-promise](https://www.npmjs.com/package/ssh2-promise) is
used to remote in to the server. Also, [dotenv](https://www.npmjs.com/package/dotenv)
is used to load connection info from [test.env](./test-env) (pro-tip: don't commit this file in your repo).

This is the main attraction (located in the [docker-ship-module.js](./docker-ship-module.js)):

```js
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
```