/* eslint-disable max-len */
import { assertFormatted, assertNotFormatted } from './support/assertion';

const fs = require('fs');
const path = require('path');
const os = require('os');
const cmd = require('./support/cmd');
const util = require('./support/util');
const { spawnSync } = require('child_process');

describe('The blade formatter CLI', () => {
  test.concurrent('should print the help', async function () {
    const response = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      ['-h'],
    );
    expect(response).toMatch('help');
  });

  test.concurrent('should print a formatted file', async () => {
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

  test.concurrent('should print multiple formatted files', async () => {
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

  test.concurrent(
    'should exit with exit code 1 if check option enabled and not formatted',
    async () => {
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
    },
  );

  test.concurrent(
    'should exit with exit code 0 if check option enabled and formatted',
    async () => {
      const response = cmd.executeSync(
        path.resolve(__basedir, 'bin', 'blade-formatter'),
        [`${__dirname}/fixtures/formatted.index.blade.php`, '-c'],
      );

      const output = response.output.join('\n');
      const exitCode = response.status;

      expect(exitCode).toEqual(0);
      expect(output).toMatch('Check formatting...');
      expect(output).toMatch('All matched files are formatted');
    },
  );

  test.concurrent(
    'should overwrite file with formatted output if write option enabled',
    async () => {
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
    },
  );

  test.concurrent('should show diffs if diff option enabled', async () => {
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

  test.concurrent(
    'should indent correctly if indent option passed',
    async () => {
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
    },
  );

  test.concurrent('should ignore commented lines #8', async () => {
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

  test.concurrent('it can format php tag mixed file', async () => {
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

  test.concurrent('should consider longline line wrap', async () => {
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

  test.concurrent(
    'should properly formatted even if directive nested',
    async () => {
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
    },
  );

  test.concurrent('should properly formatted with raw php block', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'raw_php_block.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.raw_php_block.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('stdin option', async () => {
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

  test.concurrent(
    'show not error even if line return exists after unescaped blade brace',
    async () => {
      const cmdResult = await spawnSync(
        '/bin/cat',
        [
          '__tests__/fixtures/escaped_bug.blade.php',
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
          'formatted.escaped_bug.blade.php',
        ),
      );

      expect(cmdResult).toEqual(formatted.toString('utf-8'));
    },
  );

  test.concurrent('Do nothing if something goes wrong #128', async () => {
    const originalContent = fs.readFileSync(
      path.resolve(__basedir, '__tests__', 'fixtures', 'escaped_bug.blade.php'),
    );

    await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'escaped_bug.blade.php',
        ),
      ],
      '-w',
    );

    const result = fs.readFileSync(
      path.resolve(__basedir, '__tests__', 'fixtures', 'escaped_bug.blade.php'),
    );

    expect(originalContent).toEqual(result);
  });

  test.concurrent('Do nothing if path is included in ignore file', async () => {
    expect(fs.existsSync('.bladeignore')).toBe(true);
    expect(fs.readFileSync('.bladeignore').toString()).toContain(
      '__tests__/**/ignore_target_file.blade.php',
    );
    const response = cmd.executeSync(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [`${__dirname}/fixtures/ignore_target_file.blade.php`, '-c'],
    );
    const output = response.output.join('\n');

    expect(output).not.toContain('ignore_target_file.blade.php');
    expect(output).toContain('All matched files are formatted');
  });

  test.concurrent('multiline blade comment', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'multiline_blade_comment.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.multiline_blade_comment.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('blade brace without space', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'blade_brace_without_space.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.blade_brace_without_space.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('unescape blade brace', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'escaped_blade_tag.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.escaped_blade_tag.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('@props directive', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [path.resolve(__basedir, '__tests__', 'fixtures', 'props.blade.php')],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.props.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('directive in script tag', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'directive_in_scripts.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.directive_in_scripts.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('complicated directive in script tag', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'directive_in_scripts_complex.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.directive_in_scripts_complex.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('case directive should be indented', async () => {
    const cmdResult = await cmd.execute(
      path.resolve(__basedir, 'bin', 'blade-formatter'),
      [
        path.resolve(
          __basedir,
          '__tests__',
          'fixtures',
          'case_directive.blade.php',
        ),
      ],
    );

    const formatted = fs.readFileSync(
      path.resolve(
        __basedir,
        '__tests__',
        'fixtures',
        'formatted.case_directive.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });
});
