import fs from 'fs';
import path from 'path';

export async function saveBase64Image(base64, filenamePrefix = 'upload') {
  if (!base64) return null;
  // handle data URL
  const matches = base64.match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/);
  let ext = 'png';
  let data = base64;
  if (matches) {
    ext = matches[2] === 'jpeg' ? 'jpg' : matches[2];
    data = matches[3];
  }
  const buffer = Buffer.from(data, 'base64');
  const uploadsDir = path.resolve(process.cwd(), 'public', 'uploads');
  try {
    await fs.promises.mkdir(uploadsDir, { recursive: true });
    const filename = `${filenamePrefix}-${Date.now()}.${ext}`;
    const dest = path.join(uploadsDir, filename);
    await fs.promises.writeFile(dest, buffer);
    // return web-accessible path
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('Failed to save image', err);
    return null;
  }
}
