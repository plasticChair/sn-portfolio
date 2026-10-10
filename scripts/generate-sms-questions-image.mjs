import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { chromium } from '@playwright/test';
import sharp from 'sharp';

const root = fileURLToPath(new URL('../', import.meta.url));
const destination = path.join(root, 'public/images/projects/sms-questions/architecture.png');
const font = await readFile(path.join(root, 'node_modules/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff2'));
const browser = await chromium.launch();
let image;
try {
  const page = await browser.newPage();
  image = await page.evaluate(async (fontData) => {
    const face = new FontFace('Cover Sans', `url(data:font/woff2;base64,${fontData})`);
    document.fonts.add(await face.load());
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1000;
    const context = canvas.getContext('2d');
    const rounded = (left, top, width, height, radius, color) => {
      context.fillStyle = color;
      context.beginPath();
      context.roundRect(left, top, width, height, radius);
      context.fill();
    };
    const text = (value, left, top, size, color, align = 'left') => {
      context.font = `${size}px "Cover Sans"`;
      context.fillStyle = color;
      context.textAlign = align;
      context.fillText(value, left, top);
    };
    const line = (points, color, width = 3) => {
      context.strokeStyle = color;
      context.lineWidth = width;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      points.forEach(([horizontal, vertical], index) => {
        if (index) context.lineTo(horizontal, vertical);
        else context.moveTo(horizontal, vertical);
      });
      context.stroke();
    };
    const background = context.createLinearGradient(0, 0, 1600, 1000);
    background.addColorStop(0, '#dce8e3');
    background.addColorStop(1, '#e4e8ed');
    context.fillStyle = background;
    context.fillRect(0, 0, 1600, 1000);
    context.fillStyle = '#c7d4d1';
    for (let horizontal = 70; horizontal < 1550; horizontal += 50) {
      for (let vertical = 260; vertical < 760; vertical += 50) {
        context.fillRect(horizontal, vertical, 2, 2);
      }
    }
    text('SMS-Questions', 110, 135, 66, '#203932');
    text('TEXT MESSAGES / LOCAL INFRASTRUCTURE', 113, 185, 20, '#4b665e');
    text('ARCHITECTURE ILLUSTRATION', 1488, 135, 18, '#62756e', 'right');

    const floor = context.createLinearGradient(0, 720, 0, 1000);
    floor.addColorStop(0, '#d3dcd7');
    floor.addColorStop(1, '#bfcfc9');
    context.fillStyle = floor;
    context.fillRect(0, 720, 1600, 280);
    line([[0, 720], [1600, 720]], '#bccbc5', 2);
    context.save();
    context.filter = 'blur(16px)';
    context.fillStyle = '#243d352c';
    context.beginPath();
    context.ellipse(440, 759, 180, 25, 0, 0, Math.PI * 2);
    context.fill();
    context.beginPath();
    context.ellipse(1180, 758, 230, 24, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();

    context.save();
    context.translate(315, 252);
    context.rotate(-0.055);
    rounded(8, 8, 276, 512, 34, '#162420');
    rounded(0, 0, 276, 512, 34, '#314a42');
    rounded(4, 4, 268, 504, 30, '#101b18');
    rounded(14, 14, 248, 480, 23, '#f1f4f1');
    rounded(92, 21, 92, 20, 10, '#162420');
    text('SMS', 37, 87, 25, '#25493e');
    line([[36, 103], [240, 103]], '#d5dfd9', 2);
    rounded(32, 126, 192, 96, 16, '#ccdfd6');
    text('Daily question', 47, 155, 17, '#315347');
    rounded(46, 173, 155, 7, 3, '#6e9685');
    rounded(46, 189, 118, 7, 3, '#6e9685');
    rounded(65, 246, 176, 68, 16, '#bc6150');
    text('Reply', 82, 273, 17, '#fff8f5');
    rounded(81, 286, 116, 6, 3, '#edc9bd');
    rounded(32, 338, 192, 81, 16, '#ccdfd6');
    text('Response summary', 47, 367, 16, '#315347');
    rounded(46, 383, 150, 7, 3, '#6e9685');
    rounded(46, 399, 94, 7, 3, '#6e9685');
    rounded(87, 469, 102, 5, 3, '#87958f');
    context.restore();

    context.fillStyle = '#334840';
    context.beginPath();
    context.moveTo(974, 314);
    context.lineTo(1042, 268);
    context.lineTo(1377, 268);
    context.lineTo(1309, 314);
    context.closePath();
    context.fill();
    context.fillStyle = '#182b24';
    context.beginPath();
    context.moveTo(1309, 314);
    context.lineTo(1377, 268);
    context.lineTo(1377, 698);
    context.lineTo(1309, 751);
    context.closePath();
    context.fill();
    rounded(964, 309, 352, 438, 10, '#273b32');
    rounded(978, 324, 324, 410, 5, '#111e18');
    for (let rack = 0; rack < 4; rack += 1) {
      const top = 340 + rack * 88;
      rounded(992, top, 296, 77, 4, '#394b42');
      line([[1003, top + 2], [1277, top + 2]], '#7a8c804d', 2);
      rounded(1009, top + 15, 118, 47, 3, '#1c2b23');
      for (let vent = 0; vent < 9; vent += 1) {
        rounded(1017 + vent * 11, top + 21, 4, 35, 1, '#506055');
      }
      rounded(1144, top + 16, 92, 45, 3, '#26372e');
      rounded(1157, top + 28, 54, 4, 2, '#829789');
      rounded(1157, top + 42, 38, 4, 2, '#829789');
      rounded(1251, top + 23, 10, 10, 5, rack === 1 ? '#d99270' : '#87d4ae');
      rounded(1251, top + 43, 10, 10, 5, '#789b88');
    }
    text('LOCAL APPLICATION', 1008, 715, 16, '#b9c8bd');

    context.setLineDash([10, 11]);
    line([[625, 508], [923, 508]], '#568376', 4);
    context.setLineDash([]);
    line([[912, 494], [926, 508], [912, 522]], '#568376', 4);
    line([[640, 494], [626, 508], [640, 522]], '#568376', 4);
    for (const radius of [24, 43, 63]) {
      context.beginPath();
      context.strokeStyle = '#386959';
      context.lineWidth = 5;
      context.arc(775, 447, radius, Math.PI * 1.22, Math.PI * 1.78);
      context.stroke();
    }
    rounded(770, 439, 10, 10, 5, '#386959');
    text('Wi-Fi', 775, 569, 26, '#385e50', 'center');
    text('QUESTIONS / REPLIES', 775, 608, 17, '#587769', 'center');

    text('ANDROID SMS GATEWAY', 452, 836, 25, '#25483b', 'center');
    text('Cellular SMS interface', 452, 873, 21, '#4c6b5d', 'center');
    text('PROXMOX HOME SERVER', 1170, 836, 25, '#25483b', 'center');
    text('Locally hosted application', 1170, 873, 21, '#4c6b5d', 'center');
    return canvas.toDataURL('image/png').split(',')[1];
  }, font.toString('base64'));
} finally {
  await browser.close();
}
await mkdir(path.dirname(destination), { recursive: true });
const bitmap = await sharp(Buffer.from(image, 'base64')).png({ compressionLevel: 9 }).toBuffer();
await writeFile(destination, bitmap, { flag: 'wx' });
console.log(`Created ${destination}. Existing images are never overwritten.`);