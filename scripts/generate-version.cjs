const { randomBytes } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const version = randomBytes(64).toString('hex');

// TS constant baked into the bundle
const outputDirectory = path.resolve('src/app/core');
fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(
  path.join(outputDirectory, 'version.ts'),
  `// Auto-generated during build. DO NOT EDIT.\nexport const APP_VERSION = "${version}";\n`,
  'utf8',
);

// Standalone manifest served as a static asset, fetched independently of the JS bundle
const publicDir = path.resolve('public');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, 'version.json'), JSON.stringify({ version }), 'utf8');

console.log(`Generated SPA version: ${version}`);
