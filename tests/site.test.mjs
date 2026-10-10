import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { load } from 'cheerio';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
const dist = path.join(root, 'dist');
const content = path.join(root, 'src/content/projects');

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const groups = await Promise.all(entries.map((entry) => entry.isDirectory() ? walk(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return groups.flat();
}

const files = await walk(dist).catch(() => { throw new Error('Run npm run build before npm test to validate the generated site.'); });
const pages = files.filter((file) => file.endsWith('.html'));

test('Scott Nette identity appears in page titles and navigation', async () => {
  for (const file of pages) {
    const page = load(await readFile(file, 'utf8'));
    assert.ok(page('title').text().includes('Scott Nette'), `${file}: owner in page title`);
    assert.equal(page('.brand').attr('aria-label'), 'Scott Nette, home');
    assert.equal(page('.brand-mark').text(), 'SN');
  }
});

test('every published Markdown project has a card and a generated page; drafts are excluded', async () => {
  const homepage = load(await readFile(path.join(dist, 'index.html'), 'utf8'));
  const entries = (await walk(content)).filter((file) => file.endsWith('.md'));
  let published = 0;
  for (const entry of entries) {
    const markdown = await readFile(entry, 'utf8');
    const frontmatter = markdown.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    assert.ok(frontmatter, `${entry}: YAML frontmatter`);
    const data = parse(frontmatter[1]);
    const slug = path.relative(content, entry).replaceAll(path.sep, '/').replace(/\.md$/, '').toLowerCase();
    const cards = homepage(`a[href="/projects/${slug}/"]`);
    if (data.draft) {
      assert.equal(cards.length, 0, `${slug} draft must not be listed`);
      await assert.rejects(access(path.join(dist, 'projects', slug, 'index.html')), `${slug} draft must not generate a route`);
    } else {
      published += 1;
      assert.equal(cards.length, 1, `${slug} should appear exactly once`);
      const page = load(await readFile(path.join(dist, 'projects', slug, 'index.html'), 'utf8'));
      assert.equal(page('h1').text(), data.title);
      assert.ok(page('.prose h2').length > 0, `${slug} should have case-study content`);
      assert.equal(page('.case-image img').length, data.image ? 1 : 0, `${slug}: optional cover image`);
      assert.equal(cards.find('.project-image img').length, data.image ? 1 : 0, `${slug}: optional card image`);
      if (data.image) assert.equal(cards.find('.project-image img').attr('src'), data.image, `${slug}: tile uses the main photo`);
      assert.equal(page('.process-gallery img').length, (data.gallery ?? []).length, `${slug}: gallery images`);
      for (const photo of data.gallery ?? []) assert.equal(page(`.process-gallery img[src="${photo.src}"]`).attr('alt'), photo.alt, `${slug}: gallery description`);
      assert.equal(page('.case-video video').length, data.video ? 1 : 0, `${slug}: video appears only when a source is configured`);
      assert.equal(page('.video-placeholder').length, data.videoPoster && !data.video ? 1 : 0, `${slug}: poster-only video placeholder`);
      if (data.video) await access(path.join(dist, data.video.slice(1)));
      if (data.videoPoster) await access(path.join(dist, data.videoPoster.slice(1)));
      assert.equal(page('meta[property="og:image"]').length, data.image ? 1 : 0, `${slug}: no stock social image fallback`);
      assert.equal(page('.project-facts dd').toArray().some((item) => ['undefined', 'null'].includes(page(item).text())), false, `${slug}: no missing metadata rendered`);
    }
  }
  assert.equal(homepage('[data-project]').length, published);
});

test('Auto Relay Driver is removed from the catalog, routes, and sitemap', async () => {
  const homepage = load(await readFile(path.join(dist, 'index.html'), 'utf8'));
  assert.equal(homepage('a[href="/projects/auto-relay-driver/"]').length, 0);
  await assert.rejects(access(path.join(dist, 'projects/auto-relay-driver/index.html')));
  const sitemap = await readFile(path.join(dist, 'sitemap-0.xml'), 'utf8');
  assert.equal(sitemap.includes('/projects/auto-relay-driver/'), false);
});

test('generated pages have one main heading, descriptions, and local images with alt text', async () => {
  for (const file of pages) {
    const page = load(await readFile(file, 'utf8'));
    assert.equal(page('h1').length, 1, `${file}: one h1`);
    assert.ok(page('meta[name="description"]').attr('content'), `${file}: description`);
    assert.equal(page('html').attr('lang'), 'en');
    assert.equal(page('main').length, 1);
    for (const image of page('img').toArray()) {
      if (page(image).attr('role') === 'presentation') {
        assert.equal(page(image).attr('alt'), '', `${file}: decorative image has empty alt text`);
      } else {
        assert.ok(page(image).attr('alt')?.trim(), `${file}: image alt text`);
      }
      const source = page(image).attr('src');
      assert.ok(source?.startsWith('/images/'), `${file}: local image`);
      await access(path.join(dist, source.slice(1)));
    }
  }
});

test('all generated internal links and anchors resolve', async () => {
  for (const file of pages) {
    const page = load(await readFile(file, 'utf8'));
    for (const link of page('a[href]').toArray()) {
      const href = page(link).attr('href');
      if (!href?.startsWith('/') && !href?.startsWith('#')) continue;
      const url = new URL(href, `https://portfolio.test/${path.relative(dist, file).replaceAll(path.sep, '/')}`);
      const destination = url.pathname.endsWith('/') ? path.join(dist, url.pathname.slice(1), 'index.html') : path.join(dist, url.pathname.slice(1));
      await access(destination);
      if (url.hash) {
        const target = load(await readFile(destination, 'utf8'));
        assert.ok(target(`[id="${decodeURIComponent(url.hash.slice(1))}"]`).length, `${file}: broken anchor ${href}`);
      }
    }
  }
});

test('filter categories are generated from project data and controls progressively enhance', async () => {
  const page = load(await readFile(path.join(dist, 'index.html'), 'utf8'));
  const categories = new Set(page('[data-project]').toArray().map((card) => page(card).attr('data-category')));
  const buttons = new Set(page('[data-filter]').toArray().map((button) => page(button).attr('data-filter')));
  assert.deepEqual(buttons, new Set(['All', ...categories]));
  assert.ok(page('[data-catalog-controls]').is('[hidden]'));
  assert.equal(page('[data-project][hidden]').length, 0, 'Projects are visible without JavaScript');
});

test('sitemap, robots rules, custom 404, and Cloudflare headers are generated', async () => {
  for (const filename of ['sitemap-index.xml', 'sitemap-0.xml', 'robots.txt', '404.html', '_headers']) await access(path.join(dist, filename));
  const notFound = load(await readFile(path.join(dist, '404.html'), 'utf8'));
  assert.equal(notFound('meta[name="robots"]').attr('content'), 'noindex');
});