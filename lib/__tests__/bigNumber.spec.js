import glob from 'glob';
import path from 'path';
import fs from 'fs';

it('ensure bignumber.js is not used directly', () => {
  const cwd = process.cwd();
  const files = glob.sync('**/*', {
    cwd,
    ignore: [
      'lib/bigNumberJs.ts', //ignore the file that wraps bignumber
      'node_modules/**',
      'dist/**',
      '.github/**',
      '.husky/**',
      '.next/**',
      '.yalc/**',
      'cache/**',
      'coverage/**',
      'cypress/**'
    ],
    nodir: true
  });
  const filesWithBigNumber = files.filter(f => {
    const extension = path.extname(f);
    const data = fs.readFileSync(f, 'utf8');
    if (['.js', '.ts'].includes(extension) && data.includes('bignumber.js')) return f;
  });
  //the only non-ignored file that should contain bignumber.js is this file
  expect(filesWithBigNumber.length).toBe(1);
});
