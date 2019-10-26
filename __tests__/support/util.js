const path = require('path');
const fs = require('fs-extra');

function populateFixtures(targetDir) {
  fs.copy(path.resolve(__basedir, '__tests__', 'fixtures'), targetDir).catch(
    err => console.error(err),
  );
}

module.exports = { populateFixtures };
