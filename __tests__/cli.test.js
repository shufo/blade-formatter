/* eslint-disable max-len */
import { assertFormatted, assertNotFormatted } from './support/assertion';

const fs = require('fs');
const path = require('path');
const os = require('os');
const cmd = require('./support/cmd');
const util = require('./support/util');

describe('The blade formatter CLI', () => {
  test('should print the help', async function() {
    const response = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      ['-h'],
    );
    expect(response).toMatch('help');
  });

  test('should print a formatted file', async () => {
    const response = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [path.resolve(__basedir, '__tests__', 'fixtures', 'index.blade.php')],
    );

    return fs.readFile(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.index.blade.php',
      ),
      (err, data) => {
        expect(response).toMatch(data.toString('utf-8'));
      },
    );
  });

  test('should print multiple formatted files', async () => {
    const response = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(__basedir, '__tests__', 'fixtures', 'index.blade.php'),
        path.resolve(__basedir, '__tests__', 'fixtures', 'edit.blade.php'),
      ],
    );

    const formattedFiles = [
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.index.blade.php',
      ),
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.edit.blade.php',
      ),
    ];

    formattedFiles.forEach(formattedFile => {
      fs.readFile(formattedFile, (err, data) => {
        expect(response).toMatch(data.toString('utf-8'));
      });
    });
  });

  test('should exit with exit code 1 if check option enabled and not formatted', async () => {
    const response = cmd.executeSync(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(__basedir, '__tests__', 'fixtures', 'index.blade.php'),
        '-c',
      ],
    );

    const output = response.output.join('\n');
    const exitCode = response.status;

    expect(exitCode).toEqual(1);
    expect(output).toMatch('Check formatting...');
    expect(output).toMatch('formattable');
  });

  test('should exit with exit code 0 if check option enabled and formatted', async () => {
    const response = cmd.executeSync(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [`${__dirname}/fixtures/formatted.index.blade.php`, '-c'],
    );

    const output = response.output.join('\n');
    const exitCode = response.status;

    expect(exitCode).toEqual(0);
    expect(output).toMatch('Check formatting...');
    expect(output).toMatch('All matched files are formatted');
  });

  test('should overwrite file with formatted output if write option enabled', async () => {
    const tmpDir = path.resolve(os.tmpdir(), 'blade-formatter', 'fixtures');
    util.populateFixtures(tmpDir);

    // use index.blade.php as unformatted file
    assertNotFormatted(path.resolve(tmpDir, 'index.blade.php'));

    // format unformatted file
    const response = cmd.executeSync(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [path.resolve(tmpDir, 'index.blade.php'), '--write'],
    );

    const output = response.output.join('\n');
    const exitCode = response.status;

    expect(exitCode).toEqual(0);
    expect(output).toMatch('Fixed');
    expect(output).toMatch('Formatted Files');

    assertFormatted(path.resolve(tmpDir, 'index.blade.php'));
  });

  test('should show diffs if diff option enabled', async () => {
    const response = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(__basedir, '__tests__', 'fixtures', 'index.blade.php'),
        '--diff',
      ],
    );

    expect(response).toMatch('Differences');
    expect(response).toMatch('--<section id="content">');
    expect(response).toMatch('++    <section id="content">');
  });
});
