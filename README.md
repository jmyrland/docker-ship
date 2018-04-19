
# `docker-ship`

Build, tag and push docker images in one command.

<p align="center">
	<img src="https://rawgit.com/jmyrland/docker-ship/master/docker-ship.svg" width="100%">
</p>

The example above is equal to running the following docker-commands:
```
$ docker build -t jmyrland/test .
$ docker tag 9392f4f2e09c jmyrland/test:1.0.0
$ docker push jmyrland/test:1.0.0
$ docker push jmyrland/test:latest
```

## Installation:

    npm i -g docker-ship-cli

## Usage:

  	docker-ship [imageName] [nextVersion]

    Positionals:
      nextVersion  version to deploy (prompted if missing)                  [string]
      imageName    docker image name (prompted if missing)                  [string]

    Options:
      --update-pkg, -u  Update the version in package.json                 [boolean]
      --version         Show version number                                [boolean]
      --help            Show help                                          [boolean]


Executing `docker-ship` with the same parameters, with only the `nextVersion` changing can be tedious. You can add default values to a `package.json` file to avoid this.

When executing `docker-ship` in a folder with the following `package.json` file, both `version` and `dockerRepository` will be read as parameters.

```json
{
  "version": "1.0.0",
  "dockerRepository": "jmyrland/test"
}
```

- `version` is treated as the current version of the docker image, and will be used to ensure that the next version is newer. It will also be used to suggest a new version (when prompted).
- `dockerRepository` is treated as the `imageName`.

## Custom `pre build` and `post push` actions

You can add custom tailored pre-build and post-push actions by adding a `docker-ship-module` to
your project.

The `docker-ship-module` is just a simple nodejs module, and looks like this in its simplest form:
```js
module.exports = {
  handlePreBuild: async ({ inquirer, spinner }, args) => { },
  handlePostPush: async ({ inquirer, spinner }, args) => { }
}
```

These handlers are invoked in the `docker-ship`/deployment lifecycle as advertised. In addition to the `args` (`imageName`, `nextVersion`, etc.), these handlers are also given a reference to [inquirer](https://github.com/SBoudrias/Inquirer.js/) and an [ora spinner instance](https://github.com/sindresorhus/ora) - in case you want to
"inquire" input or display a nice spinner if you are doing some heavy lifting.

[Take a look at a simple example of a docker-ship-module.](examples/docker-ship-module)

Use cases for these actions:
- Clean up / build project before building the docker image is built.
- After push, remote in to a server and pull the latest image (or the specific version)
- After push, broadcast a notification to your team's chat service

-----------------

Tested with
- macOS version 10.13.4
- Node version 8+
- Docker version 18.04.0-ce-rc2, build f4926a2

