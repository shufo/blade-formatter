/* eslint-disable max-len */
import { assertFormatted, assertNotFormatted } from './support/assertion';

const fs = require('fs');
const path = require('path');
const os = require('os');
const cmd = require('./support/cmd');
const util = require('./support/util');
const { spawnSync } = require('child_process');

describe('The blade formatter CLI', () => {
  test('should print the help', async function () {
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

    formattedFiles.forEach((formattedFile) => {
      const data = fs.readFileSync(formattedFile);
      expect(response).toMatch(data.toString('utf-8'));
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

  test('should indent correctly if indent option passed', async () => {
    const shortHandResponse = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(__basedir, '__tests__', 'fixtures', 'index.blade.php'),
        '-i',
        '2',
      ],
    );

    const longNameResponse = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(__basedir, '__tests__', 'fixtures', 'index.blade.php'),
        '--indent-size',
        '2',
      ],
    );

    const targetFile = path.resolve(
      __basedir,
      '__tests__',
      'fixtures',
      'formatted_with_indent_size_2.index.blade.php',
    );

    fs.readFile(targetFile, (err, data) => {
      expect(shortHandResponse).toEqual(data.toString('utf-8'));
      expect(longNameResponse).toEqual(data.toString('utf-8'));
    });
  });

  test('should ignore commented lines #8', async () => {
    const formatted = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [path.resolve(__basedir, '__tests__', 'fixtures', 'commented.blade.php')],
    );

    const expectedTarget = path.resolve(
      __basedir,
      '__tests__',
      'fixtures',
      'formatted.commented.blade.php',
    );

    fs.readFile(expectedTarget, (err, expected) => {
      expect(formatted).toEqual(expected.toString('utf-8'));
    });
  });

  test('it can format php tag mixed file', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [path.resolve(__basedir, '__tests__', 'fixtures', 'shorttag.blade.php')],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted_shorttag.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test('should consider longline line wrap', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'blade_comment_in_longline.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.blade_comment_in_longline.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test('should properly formatted even if directive nested', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [path.resolve(__basedir, '__tests__', 'fixtures', 'if_nest.blade.php')],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.if_nest.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test('stdin option', async () => {
    const cmdResult = await spawnSync(
      '/bin/cat',
      [
        '__tests__/fixtures/index.blade.php',
        '|',
        './bin/blade-formatter',
        '--stdin',
      ],
      { stdio: 'pipe', shell: true },
    ).stdout.toString();

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.index.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });
});
