import { readdirSync, mkdirSync, copyFileSync, existsSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, parse, extname } from 'node:path';
import sharp from 'sharp';

const srcDir = join(process.cwd(), 'img');
const outDir = join(process.cwd(), 'dist', 'img');

const MAX_DIM = 1600;
const WEBP_QUALITY = 75;
const LOGO_MAX = 512;

function fmtMB(bytes) {
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const files = readdirSync(srcDir);

for (const file of files) {
  const ext = extname(file).toLowerCase();
  const inPath = join(srcDir, file);
  const outPath = join(outDir, file);
  const inStats = statSync(inPath);
  let inBytes = inStats.size;

  try {
    if (!inStats.isFile()) continue;

    if (file === 'favicon.png') {
      copyFileSync(inPath, outPath);
      console.log(`KOPYA    ${file.padEnd(48)} ${fmtMB(inBytes)} → ${fmtMB(inBytes)}`);
      continue;
    }

    if (file === 'Destan_Tekstil_Logo_Transparan.png') {
      await sharp(inPath)
        .resize({ width: LOGO_MAX, height: LOGO_MAX, fit: 'inside', withoutEnlargement: true })
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      console.log(`LOGO     ${file.padEnd(48)} ${fmtMB(inBytes)} → ${fmtMB(statSync(outPath).size)}`);
      continue;
    }

    if (ext === '.jpeg' || ext === '.jpg') {
      const pipeline = sharp(inPath)
        .rotate()
        .resize({ width: MAX_DIM, height: MAX_DIM, fit: 'inside', withoutEnlargement: true });

      const webpFile = file.replace(/\.jpe?g$/i, '.webp');
      const webpOut = join(outDir, webpFile);
      const webpSrc = join(srcDir, webpFile);

      if (existsSync(webpSrc)) continue;

      const webpBuffer = await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer();
      writeFileSync(webpOut, webpBuffer);
      writeFileSync(webpSrc, webpBuffer);

      console.log(`WEBP     ${webpFile.padEnd(48)} ${fmtMB(inBytes)} → ${fmtMB(webpBuffer.length)}`);
      continue;
    }

    copyFileSync(inPath, outPath);
    console.log(`KOPYA    ${file.padEnd(48)} ${fmtMB(inBytes)} → ${fmtMB(statSync(outPath).size)}`);
  } catch (err) {
    console.error(`HATA     ${file}: ${err.message}`);
  }
}

console.log('\nGörsel optimizasyonu tamamlandı.');