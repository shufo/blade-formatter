const { spawn, spawnSync } = require('child_process');
const concat = require('concat-stream');
const process = require('process');

function createProcess(processPath, args = [], env = null) {
  const concatedArgs = [processPath].concat(args);
  return spawn(process.execPath, concatedArgs, {
    env: {
      NODE_ENV: 'test',
      ...env,
    },
  });
}

function execute(processPath, args = [], opts = {}) {
  const { env = null } = opts;
  const childProcess = createProcess(processPath, args, env);

  childProcess.stdout.setEncoding('utf-8');
  childProcess.stdin.setEncoding('utf-8');

  const promise = new Promise((resolve, reject) => {
    childProcess.stderr.once('data', (err) => {
      reject(err.toString());
    });

    childProcess.on('error', reject);
    childProcess.stdout.pipe(
      concat((result) => {
        resolve(result.toString());
      }),
    );
  });
  return promise;
}

function executeSync(processPath, args = [], opts = {}) {
  const { env = null } = opts;
  const concatedArgs = [processPath].concat(args);
  return spawnSync(process.execPath, concatedArgs, {
    env: {
      NODE_ENV: 'test',
      ...env,
    },
    encoding: 'utf-8',
  });
}

module.exports = { execute, executeSync };
