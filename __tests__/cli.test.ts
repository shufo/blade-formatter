/* eslint-disable max-len */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawnSync } from 'child_process';
import { performance } from 'perf_hooks';
import * as cmd from './support/cmd';
import * as util from './support/util';
import { assertFormatted, assertNotFormatted } from './support/assertion';
import { version } from '../package.json';

const binPath = path.resolve('bin', 'blade-formatter.js');

describe('The blade formatter CLI', () => {
  test.concurrent('should print the help', async function () {
    const response = await cmd.execute(binPath, ['-h']);
    expect(response).toMatch('help');
  });

  test.concurrent('should print a formatted file', async () => {
    const response = await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'index.blade.php')]);

    return fs.readFile(path.resolve('__tests__', 'fixtures', 'formatted.index.blade.php'), (err: any, data: any) => {
      expect(response).toMatch(data.toString('utf-8'));
    });
  });

  test.concurrent('should print multiple formatted files', async () => {
    const response = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'index.blade.php'),
      path.resolve('__tests__', 'fixtures', 'edit.blade.php'),
    ]);

    const formattedFiles = [
      path.resolve('__tests__', 'fixtures', 'formatted.index.blade.php'),
      path.resolve('__tests__', 'fixtures', 'formatted.edit.blade.php'),
    ];

    formattedFiles.forEach((formattedFile) => {
      const data = fs.readFileSync(formattedFile);
      expect(response).toMatch(data.toString('utf-8'));
    });
  });

  test.concurrent('should exit with exit code 1 if check option enabled and not formatted', async () => {
    const response = cmd.executeSync(binPath, [path.resolve('__tests__', 'fixtures', 'index.blade.php'), '-c']);

    const output = response.output.join('\n');
    const exitCode = response.status;

    expect(exitCode).toEqual(1);
    expect(output).toMatch('Check formatting...');
    expect(output).toMatch('formattable');
  });

  test.concurrent('should exit with exit code 0 if check option enabled and formatted', async () => {
    const response = cmd.executeSync(binPath, [`${__dirname}/fixtures/formatted.index.blade.php`, '-c']);

    const output = response.output.join('\n');
    const exitCode = response.status;

    expect(exitCode).toEqual(0);
    expect(output).toMatch('Check formatting...');
    expect(output).toMatch('All matched files are formatted');
  });

  test.concurrent('should overwrite file with formatted output if write option enabled', async () => {
    const tmpDir = path.resolve(os.tmpdir(), 'blade-formatter', 'fixtures');
    util.populateFixtures(tmpDir);

    // use index.blade.php as unformatted file
    assertNotFormatted(path.resolve(tmpDir, 'index.blade.php'));

    // format unformatted file
    const response = cmd.executeSync(binPath, [path.resolve(tmpDir, 'index.blade.php'), '--write']);

    const output = response.output.join('\n');
    const exitCode = response.status;

    expect(exitCode).toEqual(0);
    expect(output).toMatch('Fixed');
    expect(output).toMatch('Formatted Files');

    assertFormatted(path.resolve(tmpDir, 'index.blade.php'));
  });

  test.concurrent('should show diffs if diff option enabled', async () => {
    const response = await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'index.blade.php'), '--diff']);

    expect(response).toMatch('Differences');
    expect(response).toMatch('--<section id="content">');
    expect(response).toMatch('++    <section id="content">');
  });

  test.concurrent('should indent correctly if indent option passed', async () => {
    const shortHandResponse = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'index.blade.php'),
      '-i',
      '2',
    ]);

    const longNameResponse = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'index.blade.php'),
      '--indent-size',
      '2',
    ]);

    const targetFile = path.resolve('__tests__', 'fixtures', 'formatted_with_indent_size_2.index.blade.php');

    fs.readFile(targetFile, (err: any, data: any) => {
      expect(shortHandResponse).toEqual(data.toString('utf-8'));
      expect(longNameResponse).toEqual(data.toString('utf-8'));
    });
  });

  test.concurrent('should ignore commented lines #8', async () => {
    const formatted = await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'commented.blade.php')]);

    const expectedTarget = path.resolve('__tests__', 'fixtures', 'formatted.commented.blade.php');

    fs.readFile(expectedTarget, (err: any, expected: any) => {
      expect(formatted).toEqual(expected.toString('utf-8'));
    });
  });

  test.concurrent('it can format php tag mixed file', async () => {
    const cmdResult = await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'shorttag.blade.php')]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted_shorttag.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('should consider longline line wrap', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'blade_comment_in_longline.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.blade_comment_in_longline.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('should properly formatted even if directive nested', async () => {
    const cmdResult = await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'if_nest.blade.php')]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.if_nest.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('should properly formatted with raw php block', async () => {
    const cmdResult = await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'raw_php_block.blade.php')]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.raw_php_block.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('stdin option', async () => {
    const cmdResult = await spawnSync('/bin/cat', ['__tests__/fixtures/index.blade.php', '|', binPath, '--stdin'], {
      stdio: 'pipe',
      shell: true,
    }).stdout.toString();

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.index.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('stdin option should respects runtime config', async () => {
    const cmdResult = await spawnSync(
      '/bin/cat',
      [
        path.resolve('__tests__/fixtures/runtimeConfig/indentSize/index.blade.php'),
        '|',
        path.resolve(binPath),
        '--stdin',
      ],
      { stdio: 'pipe', shell: true, cwd: path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'indentSize') },
    ).stdout.toString();

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'indentSize', 'formatted.index.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('error with stdin option', async () => {
    const cmdResult = await spawnSync(
      '/bin/cat',
      ['__tests__/fixtures/syntax.error.blade.php', '|', binPath, '--stdin'],
      { stdio: 'pipe', shell: true },
    );

    // assert exit status is 1
    expect(cmdResult.status).toEqual(1);

    const cmdOutput = cmdResult.stdout.toString('utf-8');

    expect(cmdOutput).toContain('SyntaxError');
    expect(cmdOutput).toContain('Parse Error');
  });

  test.concurrent('show not error even if line return exists after unescaped blade brace', async () => {
    const cmdResult = await spawnSync(
      '/bin/cat',
      ['__tests__/fixtures/escaped_bug.blade.php', '|', binPath, '--stdin'],
      { stdio: 'pipe', shell: true },
    ).stdout.toString();

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.escaped_bug.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('Do nothing if something goes wrong #128', async () => {
    const originalContent = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'escaped_bug.blade.php'));

    await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'escaped_bug.blade.php')], '-w');

    const result = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'escaped_bug.blade.php'));

    expect(originalContent).toEqual(result);
  });

  test.concurrent('Do nothing if path is included in ignore file', async () => {
    expect(fs.existsSync('.bladeignore')).toBe(true);
    expect(fs.readFileSync('.bladeignore').toString()).toContain('__tests__/**/ignore_target_file.blade.php');
    const response = cmd.executeSync(binPath, [`${__dirname}/fixtures/ignore_target_file.blade.php`, '-c']);
    const output = response.output.join('\n');

    expect(output).not.toContain('ignore_target_file.blade.php');
    expect(output).toContain('All matched files are formatted');
  });

  test.concurrent('multiline blade comment', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'multiline_blade_comment.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.multiline_blade_comment.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('blade brace without space', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'blade_brace_without_space.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.blade_brace_without_space.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('unescape blade brace', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'escaped_blade_tag.blade.php'),
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.escaped_blade_tag.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('@props directive', async () => {
    const cmdResult = await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'props.blade.php')]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.props.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('directive in script tag', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'directive_in_scripts.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.directive_in_scripts.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('can fomrat alpine attributes', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'alpine_attributes.blade.php'),
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.alpine_attributes.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('complicated directive in script tag', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'directive_in_scripts_complex.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.directive_in_scripts_complex.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('case directive should be indented', async () => {
    const cmdResult = await cmd.execute(binPath, [path.resolve('__tests__', 'fixtures', 'case_directive.blade.php')]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.case_directive.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('should not indent twice on multiline templating string in script tag #279', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'multiline_templating_string_in_script_tag.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.multiline_templating_string_in_script_tag.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));

    const cmdResult2 = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'formatted.multiline_templating_string_in_script_tag.blade.php'),
    ]);
    expect(cmdResult2).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('should not indent after inline php directive #299', async () => {
    const input = 'inline_php_directive.blade.php';
    const target = 'formatted.inline_php_directive.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('raw php tag should keep indent #304', async () => {
    const input = 'raw_php_tag.blade.php';
    const target = 'formatted.raw_php_tag.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('raw php tag should keep indent #313', async () => {
    const input = 'append_tag.blade.php';
    const target = 'formatted.append_tag.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('support overwrite directive #327', async () => {
    const input = 'overwrite_tag.blade.php';
    const target = 'formatted.overwrite_tag.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('nested for loop #335', async () => {
    const input = 'nested_for.blade.php';
    const target = 'formatted.nested_for.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('class attributes nesting forever #333', async () => {
    const input = 'multiline_class.blade.php';
    const target = 'formatted.multiline_class.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('class/button directive', async () => {
    const input = 'class_directive.blade.php';
    const target = 'formatted.class_directive.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('multiline blade brace #382', async () => {
    const input = 'multiline_blade_brace.blade.php';
    const target = 'formatted.multiline_blade_brace.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('ignore entire file', async () => {
    const input = 'ignore_entire_file_comment.blade.php';
    const target = 'ignore_entire_file_comment.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('specify custom runtime config', async () => {
    const input = 'runtimeConfig/index.blade.php';
    const target = 'runtimeConfig/formatted.runtime_config.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target, [
      '--config',
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', '.bladeformatterrc'),
    ]);
  });

  test.concurrent('specify wrap attributes config by rc file', async () => {
    const cmdResult = await cmd.execute(binPath, [
      '--config',
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', '.bladeformatterrc.force-aligned'),
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'index.blade.php'),
    ]);

    expect(cmdResult).not.toContain('Error');
  });

  test.concurrent('specify sort tailwindcss classes config by rc file', async () => {
    const cmdResult = await cmd.execute(binPath, [
      '--config',
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', '.bladeformatterrc.sort-tailwind-classes'),
      path.resolve('__tests__', 'fixtures', 'tailwindcss.blade.php'),
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.tailwindcss.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('runtime config syntax error', async () => {
    const cmdResult = await cmd.execute(binPath, [
      '--config',
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', '.bladeformatterrc.syntax.error'),
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'index.blade.php'),
    ]);

    expect(cmdResult).toContain('JSON Syntax Error');
  });

  test.concurrent('runtime config type error', async () => {
    const cmdResult = await cmd.execute(binPath, [
      '--config',
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', '.bladeformatterrc.type.error'),
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'index.blade.php'),
    ]);

    expect(cmdResult).toContain('Config Error');
    expect(cmdResult).toContain('must be integer');
  });

  test.concurrent('component attribute', async () => {
    const input = 'component_attribute.blade.php';
    const target = 'formatted.component_attribute.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('custom directives', async () => {
    const input = 'custom_directives.blade.php';
    const target = 'formatted.custom_directives.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target);
  });

  test.concurrent('no multiple empty lines option', async () => {
    const input = 'no_multiple_empty_lines.blade.php';
    const target = 'formatted.no_multiple_empty_lines.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target, ['--no-multiple-empty-lines']);
  });

  test.concurrent('disable no multiple empty lines option', async () => {
    const input = 'no_multiple_empty_lines.blade.php';
    const target = 'formatted.disable_no_multiple_empty_lines.blade.php';
    await util.checkIfTemplateIsFormattedTwice(input, target, ['--no-multiple-empty-lines=false']);
  });

  test.concurrent('runtime config test for no multiple empty lines', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve(
        '__tests__',
        'fixtures',
        'runtimeConfig',
        'no_multiple_empty_lines',
        'no_multiple_empty_lines.blade.php',
      ),
    ]);

    const formatted = fs.readFileSync(
      path.resolve(
        '__tests__',
        'fixtures',
        'runtimeConfig',
        'no_multiple_empty_lines',
        'formatted.disable_no_multiple_empty_lines.blade.php',
      ),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('sort html attributes option', async () => {
    const cmdResult = await cmd.execute(binPath, [
      '--sort-html-attributes',
      'code-guide',
      path.resolve('__tests__', 'fixtures', 'sort_html_attribute.blade.php'),
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.sort_html_attribute.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('sort html attributes runtime config', async () => {
    const cmdResult = await cmd.execute(binPath, [
      '--config',
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', '.bladeformatterrc.sort-html-attributes'),
      path.resolve('__tests__', 'fixtures', 'sort_html_attribute.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.sort_html_attribute.alphabetical.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('unknown option passed', async () => {
    const cmdResult = await cmd.execute(binPath, ['--unknown', 'foo']);

    expect(cmdResult).toContain('error: Unknown argument: unknown');
    expect(cmdResult).toContain('For more information try --help');
  });

  test.concurrent('help shows current version', async () => {
    const cmdResult = await cmd.execute(binPath, ['--help']);

    expect(cmdResult).toContain(version);
  });

  test.concurrent('large file', async () => {
    const input = 'largefile.blade.php';
    const target = 'formatted.largefile.blade.php';
    const startTime = performance.now();
    await util.checkIfTemplateIsFormattedTwice(input, target);
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(15000);
  });

  test.concurrent('data url', async () => {
    const input = 'data_url.blade.php';
    const target = 'formatted.data_url.blade.php';
    const startTime = performance.now();
    await util.checkIfTemplateIsFormattedTwice(input, target);
    const endTime = performance.now();
    expect(endTime - startTime).toBeLessThan(7500);
  });

  test.concurrent('respect tailwind.config.js automatically', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'tailwind', 'index.blade.php'),
      '--sort-tailwindcss-classes',
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'tailwind', 'formatted.index.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('specify tailwind.config.js path (absolute path)', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'tailwind', 'index.blade.php'),
      '--sort-tailwindcss-classes',
      '--tailwindcss-config-path',
      path.resolve('__tests__', 'fixtures', 'tailwind', 'tailwind.config.example.js'),
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'tailwind', 'formatted.index.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('specify tailwind.config.js path (relative path)', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'tailwind', 'index.blade.php'),
      '--sort-tailwindcss-classes',
      '--tailwindcss-config-path',
      '__tests__/fixtures/tailwind/tailwind.config.example.js',
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'tailwind', 'formatted.index.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('unresolvable tailwind config', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'tailwind', 'index.blade.php'),
      '--sort-tailwindcss-classes',
      '--tailwindcss-config-path',
      '__tests__/fixtures/tailwind/tailwind.config.unresolvable.js',
    ]);

    expect(cmdResult).toContain("Cannot find module 'tailwindcss/unresolvable");
  });

  test.concurrent('runtime config test (tailwind)', async () => {
    // automatically recognize tailwind config from .bladeformatter.json
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'tailwind', 'index.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'tailwind', 'formatted.index.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('no php syntax check option from CLI', async () => {
    // automatically recognize tailwind config from .bladeformatter.json
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'no_php_syntax_check.blade.php'),
      '--no-php-syntax-check',
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.no_php_syntax_check.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('runtime config test (no_php_syntax_check)', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'noPhpSyntaxCheck', 'index.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'noPhpSyntaxCheck', 'formatted.index.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('custom html attributes order option', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'custom_html_attributes_order.blade.php'),
      '--sort-html-attributes',
      'custom',
      '--custom-html-attributes-order',
      'id,aria-.+,src,class',
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.custom_html_attributes_order.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('custom html attributes order option (with space)', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'custom_html_attributes_order.blade.php'),
      '--sort-html-attributes',
      'custom',
      '--custom-html-attributes-order',
      'id, aria-.+, src, class',
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'formatted.custom_html_attributes_order.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('custom html attributes order option (runtimeConfig)', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'customHtmlAttributesOrder', 'index.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'customHtmlAttributesOrder', 'formatted.index.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('--end-of-line option', async () => {
    const cmdResult = await cmd.execute(binPath, [
      '--end-of-line',
      'CRLF',
      path.resolve('__tests__', 'fixtures', 'end_of_line.blade.php'),
    ]);

    const formatted = fs.readFileSync(path.resolve('__tests__', 'fixtures', 'formatted.end_of_line.blade.php'));

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });

  test.concurrent('endOfLine option (runtime config)', async () => {
    const cmdResult = await cmd.execute(binPath, [
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'endOfLine', 'end_of_line.blade.php'),
    ]);

    const formatted = fs.readFileSync(
      path.resolve('__tests__', 'fixtures', 'runtimeConfig', 'endOfLine', 'formatted.end_of_line.blade.php'),
    );

    expect(cmdResult).toEqual(formatted.toString('utf-8'));
  });
});
