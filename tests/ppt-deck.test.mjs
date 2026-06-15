import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const deckPath = new URL('../ppt/index.html', import.meta.url);

test('product deck implements the approved eight-slide Swiss contract', async () => {
  const html = await readFile(deckPath, 'utf8');
  const htmlWithoutComments = html.replace(/<!--[\s\S]*?-->/g, '');
  const slides = [...htmlWithoutComments.matchAll(/<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>/g)];
  const layouts = slides.map(({ 0: tag }) => tag.match(/data-layout="([^"]+)"/)?.[1]);

  assert.equal(slides.length, 8);
  assert.deepEqual(layouts, ['S01', 'S08', 'S11', 'S17', 'S22', 'S13', 'S22', 'S10']);
  assert.equal(new Set(layouts).size, 7);
  assert.match(html, /--accent:#C5E803/);
  assert.doesNotMatch(html, /\[必填\]|TBD|TODO/);
  assert.equal((html.match(/class="workflow-rail"/g) ?? []).length, 8);
  assert.match(html, /\.canvas-card > \.workflow-rail,\s*\.canvas-card > \.image-title-block\{position:absolute\}/);
  assert.equal((html.match(/class="slide [^"]*product-screenshot/g) ?? []).length, 2);
  assert.match(html, /data-image-slot="s22-hero-21x9"/);
  assert.match(html, /images\/05-cost-investment-21x9\.png/);
  assert.match(html, /images\/07-visual-modes-21x9\.png/);
  assert.match(html, /data-product-action="diagnosis"/);
  assert.match(html, /data-product-action="calculation"/);
  assert.match(html, /data-product-action="plan-selection"/);
  assert.match(html, /data-product-action="visual-switch"/);
  assert.match(html, /guizang-ppt-low-power/);
});
