import { BladeFormatter } from '../../src/main';

const path = require('path');
const fs = require('fs-extra');
const cmd = require('./cmd');

function populateFixtures(targetDir) {
  fs.copySync(path.resolve(__basedir, '__tests__', 'fixtures'), targetDir);
}

async function checkIfTemplateIsFormattedTwice(input, target) {
  const cmdResult = await cmd.execute(
    path.resolve(__basedir, 'bin', 'blade-formatter'),
    [path.resolve(__basedir, '__tests__', 'fixtures', input)],
  );

  const formatted = fs.readFileSync(
    path.resolve(__basedir, '__tests__', 'fixtures', target),
  );

  expect(cmdResult).toEqual(formatted.toString('utf-8'));

  const cmdResult2 = await cmd.execute(
    path.resolve(__basedir, 'bin', 'blade-formatter'),
    [path.resolve(__basedir, '__tests__', 'fixtures', target)],
  );

  expect(cmdResult2).toEqual(formatted.toString('utf-8'));
}

async function doubleFormatCheck(input, target) {
  const formatter = new BladeFormatter();

  const first = await formatter.format(input);

  expect(first).toEqual(target);

  const second = await formatter.format(first);

  expect(second).toEqual(target);
}

module.exports = {
  populateFixtures,
  checkIfTemplateIsFormattedTwice,
  doubleFormatCheck,
};
