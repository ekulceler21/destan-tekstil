import { readdirSync, mkdirSync, copyFileSync, existsSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, parse, extname } from 'node:path';
import sharp from 'sharp';

const srcDir = join(process.cwd(), 'img');
const outDir = join(process.cwd(), 'dist', 'img');

const MAX_DIM = 1600;
const WEBP_QUALITY = 75;
const LOGO_MAX = 512;
const BANNER_DIM = 2048;
const BANNER_QUALITY = 88;
const BANNER_HI = ['001.webp', '002.webp', '003.webp', '004.webp'];

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

    // .webp / .jpg / .jpeg uzantılı görsellerin TÜMÜ (gerçek formatı JPEG
    // veya WebP fark etmez) WebP'ye dönüştürülüp küçültülür.
    if (ext === '.webp' || ext === '.jpeg' || ext === '.jpg') {
      // Ana sayfa kategori banner'ları mobilde de net görünsün diye
      // daha yüksek kalitede ve yüksek çözünürlükte sıkıştırılır.
      const yuksekKalite = BANNER_HI.includes(file);
      const pipeline = sharp(inPath)
        .rotate()
        .resize({
          width: yuksekKalite ? BANNER_DIM : MAX_DIM,
          height: yuksekKalite ? BANNER_DIM : MAX_DIM,
          fit: 'inside',
          withoutEnlargement: true,
        });

      const webpFile = file.replace(/\.jpe?g$/i, '').replace(/\.webp$/i, '') + '.webp';
      const webpOut = join(outDir, webpFile);
      const webpBuffer = await pipeline
        .webp({ quality: yuksekKalite ? BANNER_QUALITY : WEBP_QUALITY })
        .toBuffer();
      writeFileSync(webpOut, webpBuffer);

      // Kaynak img/ klasöründeki büyük dosyayı da optimize haliyle değiştir
      // (Github'a küçük dosya gitsin, kaynak kodu temiz kalsın).
      if (webpFile !== file) {
        rmSync(inPath, { force: true });
      }
      writeFileSync(inPath, webpBuffer);

      console.log(`WEBP     ${webpFile.padEnd(48)} ${fmtMB(inBytes)} → ${fmtMB(webpBuffer.length)}${yuksekKalite ? ' [YÜKSEK KALİTE]' : ''}`);
      continue;
    }

    copyFileSync(inPath, outPath);
    console.log(`KOPYA    ${file.padEnd(48)} ${fmtMB(inBytes)} → ${fmtMB(statSync(outPath).size)}`);
  } catch (err) {
    console.error(`HATA     ${file}: ${err.message}`);
  }
}

console.log('\nGörsel optimizasyonu tamamlandı.');