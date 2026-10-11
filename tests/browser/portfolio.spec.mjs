import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('opening hero leads into the existing project catalog', async ({ page }, testInfo) => {
  await page.goto('/');
  const hero = page.locator('.opening-hero');
  await expect(hero).toBeVisible();
  expect(await hero.evaluate((element) => getComputedStyle(element, '::before').backgroundColor)).toBe('rgba(11, 14, 16, 0.55)');
  await expect(hero.locator('h1')).toBeVisible();
  const image = hero.locator('img');
  if (await image.count()) {
    await expect(image).toHaveAttribute('alt', '');
    await image.evaluate((element) => element.decode());
  }
  const viewportHeight = page.viewportSize().height;
  const projectsTop = await page.locator('#work').evaluate((element) => element.getBoundingClientRect().top);
  expect(projectsTop).toBeLessThan(viewportHeight);
  const total = await page.locator('[data-project]').count();
  await page.screenshot({ path: testInfo.outputPath('opener.png') });
  await hero.getByRole('link', { name: 'View projects', exact: true }).click();
  await expect(page).toHaveURL(/#work$/);
  await expect(page.getByRole('heading', { name: 'Projects', exact: true })).toBeInViewport();
  await expect(page.locator('[data-project]:visible')).toHaveCount(total);
});

test('home renders local images without overflow or browser errors', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  const total = await page.locator('[data-project]').count();
  await expect(page.locator('[data-project]:visible')).toHaveCount(total);
  await page.locator('img').evaluateAll((images) => images.forEach((image) => { image.loading = 'eager'; }));
  await page.waitForFunction(() => [...document.images].every((image) => image.complete && image.naturalWidth > 0));
  const dimensions = await page.evaluate(() => ({ content: document.documentElement.scrollWidth, viewport: innerWidth }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport);
  const clipped = await page.locator('h1, h2, h3, .filter-button, .brand-name').evaluateAll((elements) => elements.filter((element) => element.scrollWidth > element.clientWidth + 1).map((element) => element.textContent));
  expect(clipped).toEqual([]);
  expect(errors).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('home.png'), fullPage: true });
});

test('project photos fit wide frames without cropping and tile opacity leaves text readable', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.locator('img').evaluateAll(async (images) => {
    images.forEach((image) => { image.loading = 'eager'; });
    await Promise.all(images.map((image) => image.decode()));
  });
  const cards = page.locator('.has-image .project-link');
  test.skip(await cards.count() === 0, 'No project images to check');
  const first = cards.first();
  const image = first.locator('.project-image img');
  await page.mouse.move(0, 0);
  await expect(image).toHaveCSS('object-fit', 'contain');
  await expect(image).toHaveCSS('background-color', 'rgb(16, 18, 20)');
  const opacity = await image.evaluate((element) => Number(getComputedStyle(element).getPropertyValue('--tile-image-opacity')));
  expect(opacity).toBeGreaterThanOrEqual(0.9);
  expect(opacity).toBeLessThanOrEqual(1);
  await expect(image).toHaveCSS('opacity', String(opacity));
  await expect(first.locator('.project-info')).toHaveCSS('opacity', '1');
  await first.focus();
  await expect(image).toHaveCSS('opacity', '1');
  await expect(image).toHaveCSS('transform', 'none');
  await page.screenshot({ path: testInfo.outputPath('fitted-tiles.png'), fullPage: true });
  const projects = await cards.evaluateAll((links) => links.map((link) => ({
    href: link.getAttribute('href'),
    square: link.querySelector('img').naturalWidth === link.querySelector('img').naturalHeight,
  })));
  const selected = projects.find((project) => project.square) ?? projects[0];
  await page.goto(selected.href);
  const cover = page.locator('.case-image img');
  await cover.evaluate((element) => element.decode());
  await expect(cover).toHaveCSS('object-fit', 'contain');
  await expect(cover).toHaveCSS('background-color', 'rgb(16, 18, 20)');
  const dimensions = await cover.boundingBox();
  expect(dimensions.width).toBeGreaterThan(dimensions.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('fitted-cover.png'), fullPage: true });
});

test('only Necklace Light has the upward tile shift and covers stay centered', async ({ page }, testInfo) => {
  await page.goto('/');
  const tiles = page.locator('.project-image img');
  await tiles.evaluateAll(async (images) => {
    images.forEach((image) => { image.loading = 'eager'; });
    await Promise.all(images.map((image) => image.decode()));
  });
  const positions = await tiles.evaluateAll((images) => images.map((image) => ({
    href: image.closest('a').getAttribute('href'),
    position: getComputedStyle(image).objectPosition,
  })));
  expect(positions.length).toBeGreaterThan(0);
  for (const image of positions) {
    expect(image.position).toBe(image.href === '/projects/necklace-light/' ? '50% -100px' : '50% 50%');
  }
  const tile = page.locator('.project-link[href="/projects/necklace-light/"]');
  const image = tile.locator('img');
  await image.evaluate((element) => element.decode());
  await expect(image).toHaveCSS('object-position', '50% -100px');
  await expect(image).toHaveCSS('object-fit', 'contain');
  await tile.scrollIntoViewIfNeeded();
  await tile.screenshot({ path: testInfo.outputPath('necklace-tile.png') });
  await tile.click();
  const cover = page.locator('.case-image img');
  await cover.evaluate((element) => element.decode());
  await expect(cover).toHaveCSS('object-position', '50% 50%');
  await expect(cover).toHaveCSS('object-fit', 'contain');
});

test('SMS Questions is discoverable and describes the isolated home deployment', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Software', exact: true }).click();
  await expect(page.locator('[data-project]:visible')).toHaveCount(1);
  const project = page.locator('[data-project]:visible');
  await expect(project.locator('h3')).toHaveText('SMS-Questions');
  const tileImage = project.locator('img');
  await expect(tileImage).toHaveAttribute('src', '/images/projects/sms-questions/architecture.png');
  await expect(tileImage).toHaveAttribute('alt', /Architecture illustration/);
  await tileImage.evaluate((element) => element.decode());
  await page.locator('#work').scrollIntoViewIfNeeded();
  await page.screenshot({ path: testInfo.outputPath('sms-tile.png') });
  await project.locator('a').click();
  await expect(page).toHaveURL(/\/projects\/sms-questions\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('SMS-Questions');
  await expect(page.locator('.case-summary')).toContainText('Proxmox-hosted application on my home server');
  await expect(page.locator('.prose')).toContainText('old Android phone');
  await expect(page.locator('.prose')).toContainText('SMS gateway app');
  await expect(page.locator('.prose')).toContainText('Linux VM on my server');
  await expect(page.locator('.prose')).toContainText(/isolated from the Internet/i);
  await expect(page.locator('.prose')).toContainText('Wi-Fi connection to my phone');
  const cover = page.locator('.case-image img');
  await expect(cover).toHaveAttribute('src', '/images/projects/sms-questions/architecture.png');
  await cover.evaluate((element) => element.decode());
  await expect(cover).toHaveCSS('object-fit', 'contain');
  await expect(cover).toHaveAttribute('alt', /Architecture illustration/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('sms-questions.png'), fullPage: true });
});

test('category, search, reset, and shareable filter URLs work', async ({ page }) => {
  await page.goto('/');
  const cards = await page.locator('[data-project]').evaluateAll((elements) => elements.map((element) => ({ category: element.dataset.category, title: element.querySelector('h3').textContent, search: element.dataset.search })));
  test.skip(cards.length === 0, 'No published projects to filter');
  const selected = cards[0];
  const categoryCount = cards.filter((card) => card.category === selected.category).length;
  const queryCount = cards.filter((card) => card.category === selected.category && card.search.toLowerCase().includes(selected.title.toLowerCase())).length;
  await page.getByRole('button', { name: selected.category, exact: true }).click();
  await expect(page.locator('[data-project]:visible')).toHaveCount(categoryCount);
  await page.getByRole('searchbox', { name: 'Search projects' }).fill(selected.title);
  await expect(page.locator('[data-project]:visible')).toHaveCount(queryCount);
  expect(new URL(page.url()).searchParams.get('category')).toBe(selected.category);
  expect(new URL(page.url()).searchParams.get('q')).toBe(selected.title);
  await page.reload();
  await expect(page.getByRole('searchbox')).toHaveValue(selected.title);
  await expect(page.locator('[data-project]:visible')).toHaveCount(queryCount);
  await page.getByRole('searchbox').fill('no-match-39e12e15-portfolio-test');
  await expect(page.getByRole('heading', { name: 'No projects found' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters', exact: true }).click();
  await expect(page.locator('[data-project]:visible')).toHaveCount(cards.length);
  await expect(page.getByRole('heading', { name: 'No projects found' })).toBeHidden();
  await page.getByRole('searchbox').fill(selected.title);
  await page.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('');
});

test('case studies and contact navigation work', async ({ page }, testInfo) => {
  await page.goto('/');
  const first = page.locator('[data-project]').first();
  test.skip(await first.count() === 0, 'No published case studies');
  const title = await first.locator('h3').textContent();
  await first.locator('a').click();
  await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  const section = page.locator('.case-toc a').first();
  if (await section.count()) {
    const anchor = await section.getAttribute('href');
    await section.click();
    expect(new URL(page.url()).hash).toBe(anchor);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('case-study.png'), fullPage: true });
  await page.goto('/about/#contact');
  await expect(page.locator('#contact')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('mobile menu is keyboard-accessible and desktop navigation is visible', async ({ page }, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'mobile') {
    const toggle = page.getByRole('button', { name: 'Open navigation' });
    await toggle.click();
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeHidden();
    await expect(toggle).toBeFocused();
    await toggle.click();
    await page.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/about\/$/);
  } else {
    await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  }
});

test('home, about, and case-study pages pass WCAG accessibility checks', async ({ page }) => {
  await page.goto('/');
  const project = await page.locator('[data-project] a').first().getAttribute('href').catch(() => null);
  for (const route of ['/', '/about/', ...(project ? [project] : [])]) {
    await page.goto(route);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations, `${route}: ${JSON.stringify(result.violations.map((violation) => ({ id: violation.id, nodes: violation.nodes.map((node) => node.target) })))}`).toEqual([]);
  }
});

test('projects and navigation remain available without JavaScript', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: testInfo.project.use.viewport });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4322/');
  const total = await page.locator('[data-project]').count();
  await expect(page.locator('[data-project]:visible')).toHaveCount(total);
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await page.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await context.close();
});

test('every published case study has readable content without horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const projects = await page.locator('[data-project] a').evaluateAll((links) => links.map((link) => ({ href: link.getAttribute('href'), title: link.querySelector('h3').textContent })));
  for (const project of projects) {
    const response = await page.goto(project.href);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1, name: project.title, exact: true })).toBeVisible();
    await expect(page.locator('.prose')).toBeVisible();
    await page.locator('main img').evaluateAll(async (images) => {
      images.forEach((image) => { image.loading = 'eager'; });
      await Promise.all(images.map((image) => image.decode()));
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), project.href).toBe(true);
  }
});

test('Cyr wheel has four photos and a playable local video', async ({ page }, testInfo) => {
  const failures = [];
  page.on('response', (response) => { if (response.status() >= 400) failures.push(response.url()); });
  await page.goto('/projects/cyr-wheel/');
  await expect(page.getByRole('heading', { name: 'Cyr Wheel', exact: true })).toBeVisible();
  await expect(page.locator('.case-image img, .prototype-photo img, .process-gallery img')).toHaveCount(4);
  await expect(page.locator('.process-gallery img')).toHaveCount(2);
  await expect(page.locator('.video-placeholder')).toHaveCount(0);
  const video = page.locator('.case-video video');
  await expect(video).toHaveCount(1);
  await expect(video).toHaveAttribute('src', '/videos/cyr-wheel/demo.mp4');
  await expect(video).toHaveAttribute('controls', '');
  await expect(video).toHaveAttribute('playsinline', '');
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((element) => element.readyState)).toBeGreaterThanOrEqual(2);
  await video.evaluate(async (element) => {
    element.muted = true;
    await element.play();
  });
  await expect.poll(() => video.evaluate((element) => element.currentTime)).toBeGreaterThan(0.1);
  expect(await video.evaluate((element) => {
    if (!(element instanceof HTMLVideoElement)) throw new Error('Expected a video element');
    element.pause();
    return element.error;
  })).toBeNull();
  await page.locator('main img').evaluateAll(async (images) => {
    images.forEach((image) => { image.loading = 'eager'; });
    await Promise.all(images.map((image) => image.decode()));
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(result.violations).toEqual([]);
  expect(failures).toEqual([]);
  await page.screenshot({ path: testInfo.outputPath('cyr-wheel.png'), fullPage: true });
});