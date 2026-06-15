import { createRequire } from 'node:module';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const require = createRequire(import.meta.url);
const sharp = require('sharp');

const [costInput, visualInput] = process.argv.slice(2);

if (!costInput || !visualInput) {
  console.error('Usage: node compose-screenshots.mjs <cost-screenshot> <visual-screenshot>');
  process.exit(2);
}

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.resolve(scriptDir, '..', 'images');
const WIDTH = 2100;
const HEIGHT = 900;
const PAPER = '#fafaf8';
const INK = '#0a0a0a';
const GREY = '#d4d4d2';
const HELPER = '#737373';
const ACCENT = '#C5E803';

await mkdir(outputDir, { recursive: true });

function gridSvg() {
  const vertical = Array.from({ length: 17 }, (_, index) => {
    const x = 50 + index * 125;
    return `<line x1="${x}" y1="0" x2="${x}" y2="900"/>`;
  }).join('');
  const horizontal = Array.from({ length: 8 }, (_, index) => {
    const y = 50 + index * 112;
    return `<line x1="0" y1="${y}" x2="2100" y2="${y}"/>`;
  }).join('');

  return `<svg width="2100" height="900" xmlns="http://www.w3.org/2000/svg">
    <rect width="2100" height="900" fill="${PAPER}"/>
    <g stroke="${GREY}" stroke-width="1" opacity="0.48">${vertical}${horizontal}</g>
  </svg>`;
}

function costOverlaySvg() {
  return `<svg width="2100" height="900" xmlns="http://www.w3.org/2000/svg">
    <style>
      .mono{font:600 22px 'Helvetica Neue','Noto Sans SC',sans-serif;letter-spacing:3px}
      .label{font:600 24px 'Helvetica Neue','Noto Sans SC',sans-serif;letter-spacing:2px}
      .num{font:200 72px 'Helvetica Neue','Noto Sans SC',sans-serif;letter-spacing:-3px}
      .note{font:500 22px 'Helvetica Neue','Noto Sans SC',sans-serif}
    </style>
    <rect x="50" y="58" width="1460" height="784" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="1548" y="58" width="502" height="784" fill="${INK}"/>
    <rect x="1548" y="58" width="18" height="784" fill="${ACCENT}"/>
    <text x="1608" y="112" fill="${ACCENT}" class="mono">DECISION RUN · 05</text>
    <text x="1608" y="190" fill="${PAPER}" class="label">ENGINEERING COST</text>
    <text x="1608" y="268" fill="${PAPER}" class="num">163-367</text>
    <text x="1970" y="268" fill="${PAPER}" class="note">万元</text>
    <line x1="1608" y1="308" x2="2005" y2="308" stroke="${HELPER}"/>
    <text x="1608" y="376" fill="${PAPER}" class="label">TOTAL INVESTMENT</text>
    <text x="1608" y="454" fill="${ACCENT}" class="num">720</text>
    <text x="1762" y="454" fill="${ACCENT}" class="note">万元</text>
    <line x1="1608" y1="494" x2="2005" y2="494" stroke="${HELPER}"/>
    <text x="1608" y="562" fill="${PAPER}" class="label">PAYBACK</text>
    <text x="1608" y="640" fill="${PAPER}" class="num">3.2</text>
    <text x="1744" y="640" fill="${PAPER}" class="note">年</text>
    <text x="1608" y="760" fill="${PAPER}" class="note">工程口径与总投资口径分开展示</text>
    <text x="1608" y="802" fill="${HELPER}" class="note">规则测算 · 可复核 · 可调整</text>
  </svg>`;
}

function visualOverlaySvg() {
  return `<svg width="2100" height="900" xmlns="http://www.w3.org/2000/svg">
    <style>
      .mono{font:600 22px 'Helvetica Neue','Noto Sans SC',sans-serif;letter-spacing:3px}
      .title{font:200 58px 'Helvetica Neue','Noto Sans SC',sans-serif;letter-spacing:-2px}
      .tab{font:600 27px 'Helvetica Neue','Noto Sans SC',sans-serif}
      .note{font:500 21px 'Helvetica Neue','Noto Sans SC',sans-serif}
    </style>
    <rect x="50" y="58" width="1460" height="784" fill="none" stroke="${INK}" stroke-width="2"/>
    <rect x="1548" y="58" width="502" height="784" fill="${PAPER}" stroke="${INK}" stroke-width="2"/>
    <rect x="1548" y="58" width="502" height="18" fill="${ACCENT}"/>
    <text x="1598" y="130" fill="${HELPER}" class="mono">VISUAL DEEPENING · 07</text>
    <text x="1598" y="214" fill="${INK}" class="title">确认方案后</text>
    <text x="1598" y="278" fill="${INK}" class="title">再深化表达</text>
    <rect x="1598" y="342" width="402" height="76" fill="${PAPER}" stroke="${GREY}"/>
    <text x="1624" y="390" fill="${INK}" class="tab">日间场景</text>
    <rect x="1598" y="438" width="402" height="76" fill="${ACCENT}"/>
    <text x="1624" y="486" fill="${INK}" class="tab">夜间运营</text>
    <rect x="1598" y="534" width="402" height="76" fill="${PAPER}" stroke="${GREY}"/>
    <text x="1624" y="582" fill="${INK}" class="tab">材料策略</text>
    <line x1="1598" y1="672" x2="2000" y2="672" stroke="${INK}"/>
    <text x="1598" y="724" fill="${INK}" class="note">概念视觉用于投前沟通</text>
    <text x="1598" y="764" fill="${HELPER}" class="note">不作为施工图或报批图</text>
  </svg>`;
}

async function compose(input, outputName, overlay) {
  const screenshot = await sharp(input)
    .resize(1420, 744, { fit: 'contain', background: PAPER })
    .png()
    .toBuffer();

  await sharp(Buffer.from(gridSvg()))
    .composite([
      { input: screenshot, left: 70, top: 78 },
      { input: Buffer.from(overlay), left: 0, top: 0 },
    ])
    .png()
    .toFile(path.join(outputDir, outputName));
}

await compose(costInput, '05-cost-investment-21x9.png', costOverlaySvg());
await compose(visualInput, '07-visual-modes-21x9.png', visualOverlaySvg());
