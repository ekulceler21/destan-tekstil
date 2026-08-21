# MARKA — Spiral Hero Anasayfa

Kuaför ve berber profesyonelleri için MARKA e-ticaret sitesinin premium açık renkli anasayfası. Tam ekran Three.js spiral görsel galerisi, Lenis yumuşak kaydırma ve GSAP metin animasyonları içerir.

## Özellikler

- **3D spiral hero** — 75 kavisli `BufferGeometry` karo, özel GLSL shader malzemeleri
- **Kaydırma ile kamera** — Lenis ile dikey kamera hareketi
- **Hız tabanlı dönüş** — kaydırma hızı spiral momentumu oluşturur
- **Fare parallax** — masaüstünde spiral eğimi
- **Ertelenmiş WebGL** — LCP için `requestIdleCallback`
- **GSAP reveal** — hero altındaki içerik için tek seferlik animasyonlar
- **MARKA markası** — turuncu temalı palet, Anton + Oswald tipografi, mevcut ürün görselleri

## Kurulum

```bash
npm install
npm run dev      # geliştirme sunucusu
npm run build    # dist/ üretim derlemesi
npm run preview  # derlenmiş sürümü önizle
```

## Proje yapısı

```
├── index.html          # Spiral hero anasayfa (Vite giriş noktası)
├── katalog.html        # Ürün kataloğu (+ Three.js 3D galeri)
├── urun.html           # Ürün detay sayfası
├── sepet.html          # Sepet
├── tesekkurler.html    # Sipariş teşekkür sayfası
├── img/                # Ürün görselleri ve favicon (tek kaynak)
├── dist/img/           # Build çıktısına kopyalanan optimized görseller
├── betik/              # site.js · sepet.js · katalog3d.js
├── stil/               # landing.css (tüm sayfaların ortak tasarım dili)
└── src/
    ├── script.js
    ├── shaders.js
    └── styles.css
```

## Görselleri değiştirme

Spiral `img/urun1.jpeg` … `img/urun10.jpeg` dosyalarını kullanır. `src/script.js` içindeki `CONFIG` nesnesi görsel yolunu kontrol eder:

| Anahtar | Varsayılan | Açıklama |
|---------|------------|----------|
| `totalImages` | 10 | Spiralde kullanılacak görsel sayısı |
| `imageBase` | `/img/urun` | Görsel dosya adı öneki |
| `imageExt` | `.jpeg` | Görsel dosya uzantısı |

Görselleri güncellemek için:

1. `img/` klasöründeki ürün fotoğraflarını değiştirin
2. `npm run build` çalıştırın — `postbuild` adımı (`betik/gorsel.js`) `img/` içeriğini optimize edip `dist/img/` altına kopyalar

## CONFIG

`src/script.js` dosyasının başındaki `CONFIG` nesnesi spiral davranışını kontrol eder. Detaylar için İngilizce teknik açıklamalar orijinal brief'te korunmuştur:

| Anahtar | Varsayılan | Açıklama |
|---------|------------|----------|
| `startRadius` / `endRadius` | 5 / 3.5 | Spiral genişliği ve konik daralma |
| `scrollRotationMultiplier` | 0.0035 | Kaydırma → dönüş hızı |
| `cameraYMultiplier` | 0.2 | Kaydırma → kamera Y hareketi |
| `parallaxStrength` | 0.1 | Fare eğim şiddeti |

## Mevcut site ile entegrasyon

- **Ana giriş:** Vite dev/build ile `index.html` (spiral hero)
- **Katalog, sepet, hakkımızda:** Kök dizindeki mevcut HTML sayfalarına bağlantılar
- **Renkler:** `stil/landing.css` içindeki turuncu palet (`#ff7c1a`, `#f97316`)

## Stack

Vite 5 · Three.js · Lenis · GSAP · Custom GLSL · Plain CSS
