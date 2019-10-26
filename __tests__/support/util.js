const { spawnSync } = require('child_process');
const path = require('path');

function populateFixtures(targetDir) {
  spawnSync(
    'cp',
    [path.resolve(__basedir, '__tests__', 'fixtures'), targetDir, '-fR'],
    {
      env: {
        NODE_ENV: 'test',
      },
      encoding: 'utf-8',
    },
  );
}

module.exports = { populateFixtures };
