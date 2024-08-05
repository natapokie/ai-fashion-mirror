import { spawn, SpawnOptions } from 'child_process';

export const spawnPromise = (command: string, args?: Array<string>, options?: SpawnOptions) =>
  new Promise<Buffer>((resolve, reject) => {
    const childProcess = spawn(command, args ?? [], options ?? {});

    let stdoutData = Buffer.alloc(0);
    let stderrData = Buffer.alloc(0);

    if (!childProcess.stdout) {
      throw new Error(`No 'stdout' available on spawned process '${command}'`);
    }

    if (!childProcess.stderr) {
      throw new Error(`No 'stderr' available on spawned process '${command}'`);
    }

    childProcess.once('error', (err: Error) => reject(err));

    childProcess.stdout.on(
      'data',
      (data: Buffer) => {
        // console.log('stdout data', data)
        stdoutData = Buffer.concat([stdoutData, data])
    },
    );
    childProcess.stdout.once('error', (err: Error) => reject(err));

    childProcess.stderr.on(
      'data',
      (data: Buffer) => {
        // console.log('stderr data', data.toString())
        stderrData = Buffer.concat([stderrData, data])
    },
    );
    childProcess.stderr.once('error', (err: Error) => reject(err));

    childProcess.stdout.on('close', () => {
        // console.log('stderrData', stderrData);

        // TODO: stderrData returns from logging not an error -- need to rewrite this
    //   if (stderrData.length > 0) return reject(new Error(stderrData.toString()));

      return resolve(stdoutData);
    });
  });