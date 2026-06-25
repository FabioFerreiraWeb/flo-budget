const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, '..', 'assets', 'images');
const DIST = path.join(__dirname, '..', 'dist');

const copies = [
  ['icon.png', 'icon.png'],
  ['icon.png', 'apple-touch-icon.png'],
  ['favicon.png', 'favicon.png'],
];

copies.forEach(([src, dest]) => {
  const from = path.join(SRC, src);
  const to = path.join(DIST, dest);
  fs.copyFileSync(from, to);
  console.log(`✓ dist/${dest}`);
});
