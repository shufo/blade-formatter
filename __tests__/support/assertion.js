const fs = require('fs');
const path = require('path');
const cmd = require('./cmd');

function assertFormatted(file) {
  const response = cmd.executeSync(
    path.resolve(__basedir, 'bin', 'blade-formatter'),
    [file, '-c'],
  );

  const output = response.output.join('\n');
  const exitCode = response.status;

  expect(exitCode).toEqual(0);
  expect(output).toMatch('Check formatting...');
  expect(output).toMatch('All matched files are formatted');
}

function assertNotFormatted(file) {
  fs.exists(file, (exists) => {
    if (!exists) {
      process.stdout.write('Format target file not found\n');
      process.exit(1);
    }
  });

  const response = cmd.executeSync(
    path.resolve(__basedir, 'bin', 'blade-formatter'),
    [file, '-c'],
  );

  const output = response.output.join('\n');
  const exitCode = response.status;

  expect(exitCode).toEqual(1);
  expect(output).toMatch('Check formatting...');
  expect(output).toMatch('formattable');
}

module.exports = { assertFormatted, assertNotFormatted };
