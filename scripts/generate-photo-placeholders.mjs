import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';
import { parse } from 'yaml';

const root = fileURLToPath(new URL('../', import.meta.url));
const contentDirectory = path.join(root, 'src/content/projects');
const escapeXml = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
let created = 0;

for (const file of (await readdir(contentDirectory)).filter((name) => name.endsWith('.md'))) {
  const source = await readFile(path.join(contentDirectory, file), 'utf8');
  const frontmatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!frontmatter) throw new Error(`Missing project metadata: ${file}`);
  const { title, gallery = [], videoPoster } = parse(frontmatter[1]);
  const directory = path.join(root, 'public/images/projects', path.basename(file, '.md'));
  await mkdir(directory, { recursive: true });

  const slots = [
    ['final.png', '01', 'FINAL PROJECT'],
    ['prototype.png', '02', 'PROTOTYPE / BUILD DETAIL'],
  ];
  const prefix = `/images/projects/${path.basename(file, '.md')}/`;
  for (const photo of gallery) {
    if (photo.src.startsWith(prefix) && photo.src.endsWith('.png')) slots.push([path.basename(photo.src), String(slots.length + 1).padStart(2, '0'), photo.caption.toUpperCase()]);
  }
  if (videoPoster?.startsWith(prefix) && videoPoster.endsWith('.png')) slots.push([path.basename(videoPoster), 'VIDEO', 'PROJECT IN MOTION']);

  for (const [filename, number, label] of slots) {
    const graphic = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
      <rect width="1600" height="1000" fill="#171b1e"/>
      <rect x="64" y="64" width="1472" height="872" rx="8" fill="none" stroke="#394348" stroke-width="2"/>
      <path d="M80 112V80h32M1488 80h32v32M80 888v32h32M1488 920h32v-32" fill="none" stroke="#87cdbc" stroke-width="3"/>
      <g transform="translate(752 310)" fill="none" stroke="#87cdbc" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
        <rect x="0" y="0" width="96" height="80" rx="6"/>
        <circle cx="28" cy="24" r="7"/>
        <path d="M2 66l27-25 18 18 22-28 25 30"/>
      </g>
      <text x="800" y="465" text-anchor="middle" font-family="sans-serif" font-size="23" fill="#87cdbc">${escapeXml(number)} / ${escapeXml(label)}</text>
      <text x="800" y="545" text-anchor="middle" font-family="sans-serif" font-size="48" font-weight="600" fill="#ecedef">${escapeXml(title)}</text>
      <text x="800" y="603" text-anchor="middle" font-family="sans-serif" font-size="25" fill="#a1abb0">Photo placeholder</text>
    </svg>`;
    const image = await sharp(Buffer.from(graphic)).png().toBuffer();
    try {
      await writeFile(path.join(directory, filename), image, { flag: 'wx' });
      created += 1;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
    }
  }
}

console.log(`Created ${created} photo placeholders. Existing photos were left untouched.`);