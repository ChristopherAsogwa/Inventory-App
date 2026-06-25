/**
 * generate-assets.js
 *
 * Generates PNG icon assets from the SVG store logo.
 * Run once before your first EAS build:
 *
 *   node scripts/generate-assets.js
 *
 * Requires `sharp`:
 *   npm install --save-dev sharp
 */

const fs = require('fs');
const path = require('path');

// Inline SVG matching AppLogo.tsx design (viewBox 0 0 80 80)
// Rendered on an indigo (#4f46e5) background for the app icon.
function buildSvg(size, bgColor, iconColor) {
  const scale = size / 80;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <!-- Background -->
  <rect width="${size}" height="${size}" fill="${bgColor}" rx="${size * 0.12}" />
  <!-- Scale group -->
  <g transform="scale(${scale})">
    <!-- Roof -->
    <path d="M6 44 L40 6 L74 44 Z" fill="${iconColor}" />
    <!-- Building body -->
    <rect x="12" y="41" width="56" height="34" rx="4" fill="${iconColor}" />
    <!-- Left window -->
    <rect x="16" y="53" width="18" height="13" rx="2.5" fill="${iconColor}" opacity="0.28" />
    <!-- Right window -->
    <rect x="46" y="53" width="18" height="13" rx="2.5" fill="${iconColor}" opacity="0.28" />
    <!-- Door -->
    <rect x="31" y="57" width="18" height="18" rx="3" fill="${iconColor}" opacity="0.22" />
    <!-- Door knob -->
    <circle cx="46" cy="66.5" r="1.8" fill="${iconColor}" opacity="0.55" />
    <!-- Chimney detail -->
    <rect x="33" y="24" width="14" height="5" rx="1.5" fill="${iconColor}" opacity="0.45" />
  </g>
</svg>`;
}

async function run() {
  let sharp;
  try {
    sharp = require('sharp');
  } catch {
    console.error(
      '❌  sharp is not installed. Run: npm install --save-dev sharp\n' +
      '   Then re-run: node scripts/generate-assets.js',
    );
    process.exit(1);
  }

  const assetsDir = path.join(__dirname, '..', 'assets');
  fs.mkdirSync(assetsDir, { recursive: true });

  const tasks = [
    {
      name: 'icon.png',
      size: 1024,
      bgColor: '#4f46e5',
      iconColor: '#ffffff',
      desc: 'App icon (iOS + Android)',
    },
    {
      name: 'adaptive-icon.png',
      size: 1024,
      bgColor: '#4f46e5',
      iconColor: '#ffffff',
      desc: 'Android adaptive icon foreground',
    },
    {
      name: 'splash-icon.png',
      size: 512,
      bgColor: '#4f46e5',
      iconColor: '#ffffff',
      desc: 'Native splash image',
    },
    {
      name: 'favicon.png',
      size: 48,
      bgColor: '#4f46e5',
      iconColor: '#ffffff',
      desc: 'Web favicon',
    },
  ];

  for (const task of tasks) {
    const svg = buildSvg(task.size, task.bgColor, task.iconColor);
    const outPath = path.join(assetsDir, task.name);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log(`✅  ${task.name.padEnd(24)} (${task.size}×${task.size})  — ${task.desc}`);
  }

  console.log('\n🎉  All assets generated in ./assets/');
  console.log('   Commit them, then run: eas build --platform android --profile preview');
}

run().catch((err) => {
  console.error('❌  Generation failed:', err.message);
  process.exit(1);
});
