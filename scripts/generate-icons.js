const sharp = require('sharp');
const path = require('path');

const SVG = Buffer.from(`<svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <rect width="1024" height="1024" rx="224" fill="#4F46E5"/>
  <rect x="0" y="0" width="1024" height="512" rx="224" fill="#5A52F0" opacity="0.4"/>
  <rect x="0" y="0" width="1024" height="200" rx="224" fill="#6366F1" opacity="0.3"/>
  <rect x="280" y="240" width="110" height="560" rx="18" fill="white"/>
  <rect x="280" y="240" width="420" height="110" rx="18" fill="white"/>
  <rect x="280" y="450" width="320" height="100" rx="18" fill="white"/>
  <ellipse cx="690" cy="720" rx="72" ry="72" fill="white" opacity="0.22"/>
  <path d="M690 580 Q740 640 740 700 Q740 754 690 780 Q640 754 640 700 Q640 640 690 580Z" fill="white" opacity="0.90"/>
</svg>`);

const OUT = path.join(__dirname, '..', 'assets', 'images');

async function run() {
  await sharp(SVG).resize(1024, 1024).png().toFile(path.join(OUT, 'icon.png'));
  console.log('✓ icon.png (1024×1024)');

  await sharp(SVG).resize(1024, 1024).png().toFile(path.join(OUT, 'adaptive-icon.png'));
  console.log('✓ adaptive-icon.png (1024×1024)');

  await sharp(SVG).resize(32, 32).png().toFile(path.join(OUT, 'favicon.png'));
  console.log('✓ favicon.png (32×32)');

  console.log('\nDone — files written to assets/images/');
}

run().catch(err => { console.error(err); process.exit(1); });
