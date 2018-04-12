const EventEmitter = require('events');
const Docker = require('docker-cli-js').Docker;

const fakeTime = 500;

class Deploy extends EventEmitter {
  constructor(imageName, version) {
    super();

    const docker = new Docker();
    const t = this;

    setImmediate(() => {
      t.build(docker, imageName)
        .then(containerId => Promise.resolve()
          .then(() => t.tag(docker, imageName, version))
          .then(() => t.push(docker, imageName, version))
          .then(() => t.tag(docker, imageName, 'latest'))
          .then(() => t.push(docker, imageName, 'latest'))
        )
        .then(() => t.emit('completed'))
        .catch(err => t.emit('error', err));
    })
  }

  build(docker, imageName) {
    this.emit('build', imageName)
    const self = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        self.emit('build-completed', imageName)
        resolve();
      }, fakeTime);
    })
  }

  tag(docker, imageName, version) {
    this.emit('tag', imageName, version)
    const self = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        self.emit('tag-completed', imageName, version)
        resolve();
      }, fakeTime);
    })
  }

  push(docker, imageName, version) {
    this.emit('push', imageName, version)
    const self = this;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, fakeTime); 
    })
    .then(() => {
      if ( false && version === 'latest') 
        throw new Error('test');
      else {
        self.emit('push-completed', imageName, version)
        return Promise.resolve()
      }
    })
  }
}

module.exports = Deploy;


// export default ({ imageName, version }) => {

//   const emitter = new EventEmitter();


//   return emitter;

//   const buildSpinner = ora(`Building version ${nextVersion}`);
//   const tagSpinner = ora(`Tagging version ${nextVersion}`);
//   const pushSpinner = ora(`Pushing version ${nextVersion}`);
  
//   buildSpinner.start();

//   const docker = new Docker();

//   Promise.resolve()
//     .then(() => docker.command(`build -t ${imageName} .`))
//     .then(result => {
//       if (!result.success) {
//         throw new Error(`Failed to build image.`)
//       }
//       emitter.emit('build-completed')
//       return result.containerId;
//     })
//     .then(containerId => {
      
//     })
//     .catch(err => {
//       emitter.emit('error', err);
//     });
// }