const EventEmitter = require('events');
const docker = require('./docker');

class Deploy extends EventEmitter {
  constructor(imageName, version) {
    super();

    const self = this;

    // Delay emits
    setImmediate(async () => {
      try {
        const containerId = await self.build(imageName);
        await self.tag(containerId, imageName, version);
        await self.push(imageName, version);
        await self.push(imageName, 'latest');
        self.emit('completed')
      } catch(err) {
        self.emit('error', err)
      }
    })
  }

  async build(imageName) {
    this.emit('build', imageName)
    const containerId = await docker.build(imageName);
    this.emit('build-completed', imageName, containerId);
    return containerId;
  }

  async tag(containerId, imageName, version) {
    this.emit('tag', imageName, version)
    await docker.tag(containerId, imageName, version);
    this.emit('tag-completed', imageName, version);
  }

  async push(imageName, version) {
    this.emit('push', imageName, version)
    await docker.push(imageName, version);
    this.emit('push-completed', imageName, version);
  }
}

module.exports = Deploy;