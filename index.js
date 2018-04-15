#!/usr/bin/env node
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');
updateNotifier({pkg}).notify();

require('pretty-error').start();

// Install commands
require('./commands')();