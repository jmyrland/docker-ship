
# Docker ship module

This example illutstrates the possibility of adding "pre build" & "post push" actions.

We have added `docker-ship-cli` as a dev dependency in this example project and added a npm run script for deploying (`npm run deploy`).

In this example, we have added a field to `package.json` called `"dockerShipModule"`.
This field is a path to a javscript file, which contains two actions (`handlePreBuild`
& `handlePostPush`).

## Pre build action: `handlePreBuild`
```js
handlePreBuild: async ({ inquirer, spinner }, args) => {
  const questions = [
    {
      type: 'confirm',
      name: 'impressed',
      default: false,
      message: 'This action is initiated from an external source. Impressed?'
    }
  ];
  const answers = await inquirer.prompt(questions);
  state.impressedInitially = answers.impressed;

  spinner.start("Doing some heavy lifting in docker-ship-module.js pre build..");
  await delay(1000);
  spinner.succeed("Heavy lifting in docker-ship-module.js pre build completed!");
}
```

## Post push action: `handlePreBuild`
```js
handlePostPush: async ({ inquirer, spinner }, args) => {
  const questions = [
    {
      when: !state.impressedInitially,
      type: 'confirm',
      name: 'impressed',
      default: true,
      message: 'This action is ALSO initiated from an external source. Still not impressed?',
    }
  ];
  const answers = await inquirer.prompt(questions);

  spinner.start("Doing some heavy lifting in docker-ship-module.js post push..");
  await delay(1000);
  spinner.succeed("Heavy lifting in docker-ship-module.js post push completed!");
}
```

These actions are invoked as described:
- `handlePreBuild`: This action is executed before the docker image is built
- `handlePostPush`: This action is executed after the docker image has been pushed

These actions are a way to custom tailor the deployment process. In this example,
the actions are pretty useless - but they illustrate what can be done. The only restriction
of what these actions may actually contain, is set by your imagination.

This is the output of this example:

![Docker ship module example](./example.svg)
