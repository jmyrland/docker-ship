
const state = {
    impressedInitially: false,
};

module.exports = {

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
  },

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

}

const delay = (ms) => new Promise((resolve) => {
  setTimeout(resolve, ms);
})