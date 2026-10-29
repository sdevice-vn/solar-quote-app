// Tạo thư mục www/ từ src/index.html: dùng thư viện + font cục bộ (chạy offline), nạp native-shim.js
import fs from 'node:fs';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const nm = (p) => path.join(root, 'node_modules', p);
const www = path.join(root, 'www');
fs.rmSync(www, { recursive: true, force: true });
fs.mkdirSync(path.join(www, 'vendor'), { recursive: true });
fs.mkdirSync(path.join(www, 'fonts'), { recursive: true });

// thư viện PDF
fs.copyFileSync(nm('html2canvas/dist/html2canvas.min.js'), path.join(www, 'vendor/html2canvas.min.js'));
fs.copyFileSync(nm('jspdf/dist/jspdf.umd.min.js'), path.join(www, 'vendor/jspdf.umd.min.js'));
fs.copyFileSync(path.join(root, 'native-shim.js'), path.join(www, 'native-shim.js'));

// font: chỉ lấy các subset latin, latin-ext, vietnamese và đúng các độ đậm trang đang dùng
const fonts = [
  ['be-vietnam-pro', [400, 500, 600, 700]],
  ['bricolage-grotesque', [600, 700, 800]],
  ['ibm-plex-mono', [400, 500]],
];
const subsets = ['vietnamese', 'latin-ext', 'latin'];
let css = '';
for (const [pkg, weights] of fonts) {
  for (const w of weights) {
    for (const s of subsets) {
      const file = nm(`@fontsource/${pkg}/${s}-${w}.css`);
      if (!fs.existsSync(file)) { console.warn('thiếu', file); continue; }
      let txt = fs.readFileSync(file, 'utf8');
      txt = txt.replace(/,\s*url\([^)]*\.woff\)\s*format\(['"]woff['"]\)/g, '');
      txt = txt.replace(/url\(\.\/files\/([^)]+\.woff2)\)/g, (_, f) => {
        fs.copyFileSync(nm(`@fontsource/${pkg}/files/${f}`), path.join(www, 'fonts', f));
        return `url(./${f})`;
      });
      css += txt + '\n';
    }
  }
}
fs.writeFileSync(path.join(www, 'fonts/fonts.css'), css);

// sửa index.html
let html = fs.readFileSync(path.join(root, 'src/index.html'), 'utf8');
const must = (cond, msg) => { if (!cond) { console.error('LỖI build:', msg); process.exit(1); } };

const before = html;
html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/, '');
html = html.replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/css2[^"]*">/, '<link rel="stylesheet" href="fonts/fonts.css">');
must(!html.includes('fonts.googleapis.com'), 'không thay được link Google Fonts');

html = html.replace(
  /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/html2canvas\/1\.4\.1\/html2canvas\.min\.js">/,
  '<script src="native-shim.js"></script>\n<script src="vendor/html2canvas.min.js">');
html = html.replace(
  /<script src="https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js">/,
  '<script src="vendor/jspdf.umd.min.js">');
must(!html.includes('cdnjs.cloudflare.com'), 'không thay được script CDN');
must(html !== before, 'index.html không đổi');

// vùng an toàn (thanh trạng thái / thanh điều hướng) trên Android WebView cũ: Capacitor cấp biến --safe-area-inset-*
html = html.replace(/env\(safe-area-inset-(top|bottom|left|right),\s*0px\)/g,
  (_, side) => `var(--safe-area-inset-${side}, env(safe-area-inset-${side}, 0px))`);

fs.writeFileSync(path.join(www, 'index.html'), html);
console.log('OK: www/ đã sẵn sàng,', fs.readdirSync(path.join(www, 'fonts')).length, 'file font');
