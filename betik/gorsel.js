import { readdirSync, mkdirSync, copyFileSync, existsSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join, parse, extname } from 'node:path';
import sharp from 'sharp';

const srcDir = join(process.cwd(), 'img');
const outDir = join(process.cwd(), 'dist', 'img');

const WEBP_QUALITY = 93;
const BANNER_QUALITY = 95;
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
      // Logo kayıpsız (lossless) PNG olarak korunur — boyut değiştirilmez.
      await sharp(inPath)
        .png({ compressionLevel: 9 })
        .toFile(outPath);
      console.log(`LOGO     ${file.padEnd(48)} ${fmtMB(inBytes)} → ${fmtMB(statSync(outPath).size)}`);
      continue;
    }

    // .webp / .jpg / .jpeg uzantılı görsellerin TÜMÜ (gerçek formatı JPEG
    // veya WebP fark etmez) WebP olarak çıktılanır.
    // NOT: Kalite dosya boyutundan önemlidir. Çözünürlük KÜÇÜLTÜLMEZ
    // (resize uygulanmaz) ve zarar verici sıkıştırma yapılmaz.
    if (ext === '.webp' || ext === '.jpeg' || ext === '.jpg') {
      const webpFile = file.replace(/\.jpe?g$/i, '').replace(/\.webp$/i, '') + '.webp';
      const webpOut = join(outDir, webpFile);

      // Zaten WebP olan kaynaklar birebir (kayıpsız) kopyalanır. Yeniden
      // sıkıştırma kalite kaybettirir; yalnızca JPEG→WebP dönüşümü uygulanır.
      if (ext === '.webp') {
        copyFileSync(inPath, webpOut);
        console.log(`WEBP     ${webpFile.padEnd(48)} ${fmtMB(inBytes)} → ${fmtMB(statSync(webpOut).size)} [kayıpsız kopya]`);
        continue;
      }

      // Ana sayfa kategori banner'ları en yüksek kalitede korunur.
      const yuksekKalite = BANNER_HI.includes(file);
      const webpBuffer = await sharp(inPath)
        .rotate()
        .webp({ quality: yuksekKalite ? BANNER_QUALITY : WEBP_QUALITY })
        .toBuffer();
      writeFileSync(webpOut, webpBuffer);

      // Kaynak img/ klasörüne ASLA YAZILMAZ: orijinal görseller bozulmadan
      // korunur. Sıkıştırma yalnızca dist/img çıktısına uygulanır.

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