import { spawn, spawnSync } from 'child_process';
import concat from 'concat-stream';
import process from 'process';

function createProcess(processPath: any, args = [], env = {}) {
  const concatedArgs = [processPath].concat(args);
  return spawn(process.execPath, concatedArgs, {
    env: {
      NODE_ENV: 'test',
      ...env,
    },
  });
}

export function execute(processPath: any, args: any = [], opts: any = {}) {
  const { env = null } = opts;
  const childProcess = createProcess(processPath, args, env);

  childProcess.stdout.setEncoding('utf-8');
  childProcess.stdin.setDefaultEncoding('utf-8');

  const promise = new Promise((resolve, reject) => {
    childProcess.stderr.once('data', (err: any) => {
      reject(err.toString());
    });

    childProcess.on('error', reject);
    childProcess.stdout.pipe(
      concat((result: any) => {
        resolve(result.toString());
      }),
    );
  });
  return promise;
}

export function executeSync(processPath: any, args: any = [], opts: any = {}) {
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
