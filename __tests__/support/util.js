const path = require('path');
const fs = require('fs-extra');

function populateFixtures(targetDir) {
  fs.copySync(path.resolve(__basedir, '__tests__', 'fixtures'), targetDir);
}

module.exports = { populateFixtures };
