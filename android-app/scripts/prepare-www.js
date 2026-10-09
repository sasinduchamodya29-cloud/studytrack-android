// Builds android-app/www from ../renderer (the SAME UI as the Windows app) + the mobile bridge.
// Run:  node scripts/prepare-www.js
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
const src = path.join(root, '..', 'renderer');
const www = path.join(root, 'www');

fs.rmSync(www, { recursive: true, force: true });
fs.cpSync(src, www, { recursive: true });

// chart.js + three are loaded by index.html as ../node_modules/... (= /node_modules/... on the web root)
const libs = [
  ['chart.js/dist/chart.umd.js'],
  ['three/build/three.min.js'],
  ['three/examples/js/controls/OrbitControls.js']
];
for (const [rel] of libs) {
  const from = path.join(root, 'node_modules', rel), to = path.join(www, 'node_modules', rel);
  if (!fs.existsSync(from)) throw new Error('Missing ' + from + ' - run "npm install" in android-app first');
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

// mobile files
fs.copyFileSync(path.join(root, 'mobile', 'mobile-bridge.js'), path.join(www, 'js', 'mobile-bridge.js'));
fs.copyFileSync(path.join(root, 'mobile', 'mobile.css'), path.join(www, 'css', 'mobile.css'));

// patch index.html: mobile viewport, bridge BEFORE every other script, mobile.css LAST
const f = path.join(www, 'index.html');
let h = fs.readFileSync(f, 'utf8');
const n0 = h.length;
h = h.replace(/<meta name="viewport"[^>]*>/, '<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">');
h = h.replace('<script src="js/phpcompat.js"></script>', '<script src="js/mobile-bridge.js"></script>\n<script src="js/phpcompat.js"></script>');
h = h.replace('<link rel="stylesheet" href="css/fit.css">', '<link rel="stylesheet" href="css/fit.css">\n<link rel="stylesheet" href="css/mobile.css">');
if (!h.includes('js/mobile-bridge.js') || !h.includes('css/mobile.css') || h.length === n0) throw new Error('index.html patch failed - index.html changed?');
fs.writeFileSync(f, h);
console.log('www ready:', www);
