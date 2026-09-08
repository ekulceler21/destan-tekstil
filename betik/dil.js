/*
  ── ÇOKLU DİL DESTEĞİ (Türkçe / English / Deutsch / العربية) ──────────
  Kullanıcının seçtiği dil localStorage'da saklanır ve tüm sayfalarda
  anında uygulanır. Arapça seçildiğinde sayfa RTL (sağdan sola) olur.

  API:
    DIL.suanki()          -> 'tr' | 'en' | 'de' | 'ar'
    DIL.cevir(anahtar)    -> seçili dildeki metin
    DIL.renk(trAd)        -> renk adını seçili dile çevirir
    DIL.urun(grupId)      -> { name, description } (seçili dilde)
    DIL.kategori(kat)     -> kategori buton/adı
    DIL.baslik(kat)       -> katalog kategori başlığı
    DIL.sec(dil)          -> dili değiştirir ve render'ları tetikler
    DIL.uygula()          -> statik metinleri + dil seçiciyi günceller

  Dinamik içerikler değişince yeniden çizim için:
    window.DIL_DEGISTI_ISLEMLER = window.DIL_DEGISTI_ISLEMLER || [];
    window.DIL_DEGISTI_ISLEMLER.push(function (dil) { ... });
*/
(function () {
  'use strict';

  var KAYIT = 'destan-dil';
  var DILLER = ['tr', 'en', 'de', 'ar'];
  var DIL_ADLAR = { tr: 'Türkçe', en: 'English', de: 'Deutsch', ar: 'العربية' };
  var RTL_DILLER = { ar: true };

  var CEVIRILER = {
    tr: {
      'i.title': 'Destan Tekstil — Logolu Havlu ve Profesyonel Salon Tekstili',
      'k.title': 'Katalog | Kuaför ve Salon Tekstil Ürünleri - Destan Tekstil',
      's.title': 'Sepet | Destan Tekstil',
      't.title': 'Teşekkürler! | Destan Tekstil',

      'nav.anasayfa': 'Anasayfa',
      'nav.katalog': 'Katalog',
      'nav.hakkimizda': 'Hakkımızda',
      'nav.iletisim': 'İletişim',
      'nav.sepet': 'Sepet',
      'nav.acil': 'Menüyü aç',

      'ortak.tagline': 'Profesyonel salonlar ve iş yerleri için kaliteli tekstil çözümleri.',
      'footer.kategoriler': 'Kategoriler',
      'footer.tumu': 'Tümü',
      'footer.haklar': 'Tüm hakları saklıdır.',
      'footer.gonderim': 'Yurt içi & yurt dışı gönderim yapıyoruz · dünyanın her yerine',
      'footer.gonderimKisa': 'Yurt içi & yurt dışı gönderim yapıyoruz',
      'footer.meta': 'Kuaför & berber profesyonel ürünleri',

      'kategori.onluk': 'Önlükler',
      'kategori.penuar': 'Penuarlar',
      'kategori.havlu': 'Havlular',
      'kategori.giyim': 'Giyim',
      'kategori.tumu': 'Tümü',

      'contactbar.telefon': 'Telefon',
      'contactbar.eposta': 'E-posta',

      'i.meta': 'Denizli · Türkiye',
      'i.eyebrow': 'ÖNLÜK · PENUAR · HAVLU · GİYİM',
      'i.t1': 'Profesyonel salonlar',
      'i.t2': 've iş yerleri için',
      'i.t3': 'kaliteli tekstil çözümleri',
      'i.kapak': 'Logolu havlu, penuar ve çalışma kıyafetlerinde dayanıklılık ve şıklığı bir arada sunuyoruz. Markanıza özel çözümlerimizle tanışın.',
      'i.kaydir': 'Kaydır',
      'i.imza': 'Logolu havlu, penuar ve çalışma kıyafetlerinde dayanıklılık ve şıklık.',

      'i.labelKategoriler': 'Kategoriler',
      'i.tDort': 'Salonunuzun ihtiyaç duyduğu dört ana grup.',
      'kat1.ad': 'Askılı önlükler',
      'kat1.meta': 'Önlük',
      'kat2.ad': 'Penuarlar',
      'kat2.meta': 'Penuar',
      'kat3.ad': 'Logolu havlular',
      'kat3.meta': 'Havlu',
      'kat4.ad': 'Forma, kimono & yelek',
      'kat4.meta': 'Giyim',
      'kat5.ad': 'Tüm kataloğu incele',
      'kat5.meta': 'Katalog',

      'i.labelHakkimizda': 'Hakkımızda',
      'i.tKimdir': 'Destan Tekstil kimdir?',
      'step1.t': 'Hikayemiz',
      'step1.b': 'Destan Tekstil olarak, güzellik salonları, kuaförler ve işletmeler için uzun ömürlü, leke tutmaz ve markanıza özel logolu tekstil ürünleri üretiyoruz. Dayanıklı kumaş yapımız ve özel tasarımlarımızla işletmenizin kurumsal kimliğini güçlendiriyoruz.',
      'step2.t': 'Misyonumuz',
      'step2.b': 'Mesleğinizi en iyi şekilde icra etmeniz için kaliteli, dayanıklı ve fonksiyonel ekipmanlar sunmayı hedefliyoruz. Her ürünün arkasında gerçek ihtiyaçları görmüş bir tasarım anlayışı var.',
      'step3.t': 'Vizyonumuz',
      'step3.b': 'Profesyonel salon çevrelerinde tercih edilen bir Türk markası olmayı ve ürünlerimizi uluslararası pazarlara taşımayı vizyon ediniyoruz.',
      'step4.t': 'Topluluğumuz',
      'step4.b': 'Birlikte büyüdüğümüz kuaför, berber ve estetisyen topluluğumuzu önemsiyoruz. Onların geri bildirimleri, her yeni tasarımımızın ilk ilhamı.',

      'i.labelIletisim': 'İletişim',
      'i.tSorular': 'Sorularınız için bize ulaşın.',
      'i.adresAd': 'Adres',
      'i.adres1': 'Bahar Özkan',
      'i.adres2': 'Dokuzkavaklar Mah. 2061 Sokak',
      'i.adres3': 'Pamukkale / Denizli, Türkiye',
      'i.telefonLabel': 'Telefon',
      'i.baglantilar': 'Bağlantılar',

      'k.label': 'Katalog',
      'k.baslik': 'Tüm Kataloğumuz',
      'k.alt': 'Profesyonel salonlar ve iş yerleri için kaliteli tekstil çözümleri',
      'k.tip': 'Sürükle & döndür · Bir ürüne tıkla',
      'k.detay': 'Detayları Gör',
      'k.renk': 'Renk:',
      'k.gorsel': 'Ürün Görseli',
      'k.basTumu': 'Tüm Kataloğumuz',
      'k.basOnluk': 'Profesyonel Salon Önlükleri',
      'k.basPenuar': 'Penuarlar',
      'k.basHavlu': 'Salon Tekstili & Havlu',
      'k.basGiyim': 'İş Kıyafetleri & Giyim',

      'u.gorsel': 'Ürün Görseli',
      'u.anaGorsel': 'Ürün Ana Görseli',
      'u.aciklamaYeri': 'Ürünün detaylı açıklaması buraya gelecek.',
      'u.beden': 'Beden Seçin:',
      'u.renk': 'Renk Seçin:',
      'u.ekle': 'Sepete Ekle',
      'u.kucukGorsel': 'Ürün Küçük Görsel',
      'u.zoomGorsel': 'Büyütülmüş Görsel',
      'u.bedenUyari': 'Lütfen bir beden seçin!',
      'u.renkUyari': 'Lütfen bir renk seçin!',
      'u.adet': 'Adet',
      'u.sepetEklendi': '{n}x "{u}" sepete eklendi',
      'u.eklendiDetay': 'sepete eklendi!',
      'u.bedenKisa': 'Beden',
      'u.renkKisa': 'Renk',

      's.label': 'Sepet',
      's.baslik': 'Sepetiniz',
      's.alt': 'Siparişinizi kontrol edin ve tamamlayın',
      's.siparis': "WhatsApp'tan Sipariş Ver",
      'sBos.baslik': 'Sepetiniz boş!',
      'sBos.metin': 'Görünüşe göre henüz hiç ürün eklememişsiniz. Harika ürünlerimize göz atmak ister misiniz?',
      'sBos.buton': 'Ürünleri Görüntüle',
      's.beden': 'Beden: ',
      's.renk': 'Renk: ',
      's.silOnay': 'Bu ürünü sepetten kaldırmak istediğinize emin misiniz?',
      's.siparisBos': 'Sepetiniz boş. Siparişi tamamlamadan önce ürün ekleyin.',
      's.siparisYok': 'Şu anda WhatsApp siparişi alınamıyor. Telefon numarası henüz tanımlanmadı.',
      's.wIntro': "Merhaba! Destan Tekstil'den sipariş vermek istiyorum.",
      's.wUrunler': '--- Ürünlerim ---',
      's.wAyirici': '-------------------',
      's.wTeklif': 'Lütfen bana fiyat teklifi iletir misiniz?',

      't.baslik': 'Siparişiniz için teşekkürler!',
      't.metin': "Siparişiniz WhatsApp'a gönderildi. Kısa süre içinde tamamlamak için sizinle iletişime geçeceğiz.",
      't.devam': 'Alışverişe Devam Et'
    },

    en: {
      'i.title': 'Destan Tekstil — Logo Towels & Professional Salon Textiles',
      'k.title': 'Catalog | Salon Textile Products - Destan Tekstil',
      's.title': 'Cart | Destan Tekstil',
      't.title': 'Thank You! | Destan Tekstil',

      'nav.anasayfa': 'Home',
      'nav.katalog': 'Catalog',
      'nav.hakkimizda': 'About Us',
      'nav.iletisim': 'Contact',
      'nav.sepet': 'Cart',
      'nav.acil': 'Open menu',

      'ortak.tagline': 'Quality textile solutions for professional salons and businesses.',
      'footer.kategoriler': 'Categories',
      'footer.tumu': 'All',
      'footer.haklar': 'All rights reserved.',
      'footer.gonderim': 'We ship domestically & worldwide',
      'footer.gonderimKisa': 'We ship domestically & worldwide',
      'footer.meta': 'Professional products for hairdressers & barbers',

      'kategori.onluk': 'Aprons',
      'kategori.penuar': 'Capes',
      'kategori.havlu': 'Towels',
      'kategori.giyim': 'Clothing',
      'kategori.tumu': 'All',

      'contactbar.telefon': 'Phone',
      'contactbar.eposta': 'E-mail',

      'i.meta': 'Denizli · Türkiye',
      'i.eyebrow': 'APRONS · CAPES · TOWELS · CLOTHING',
      'i.t1': 'For professional salons',
      'i.t2': 'and businesses',
      'i.t3': 'quality textile solutions',
      'i.kapak': 'We combine durability and elegance in logo towels, capes and workwear. Discover custom solutions tailored to your brand.',
      'i.kaydir': 'Scroll',
      'i.imza': 'Durability and elegance in logo towels, capes and workwear.',

      'i.labelKategoriler': 'Categories',
      'i.tDort': 'The four core groups your salon needs.',
      'kat1.ad': 'Strap aprons',
      'kat1.meta': 'Apron',
      'kat2.ad': 'Capes',
      'kat2.meta': 'Cape',
      'kat3.ad': 'Logo towels',
      'kat3.meta': 'Towel',
      'kat4.ad': 'Uniforms, kimonos & vests',
      'kat4.meta': 'Clothing',
      'kat5.ad': 'Explore the full catalog',
      'kat5.meta': 'Catalog',

      'i.labelHakkimizda': 'About Us',
      'i.tKimdir': 'Who is Destan Tekstil?',
      'step1.t': 'Our Story',
      'step1.b': 'As Destan Tekstil, we produce long-lasting, stain-resistant textile products with your logo for beauty salons, hairdressers and businesses. Our durable fabrics and custom designs strengthen your corporate identity.',
      'step2.t': 'Our Mission',
      'step2.b': 'We aim to offer high-quality, durable and functional equipment so you can perform your profession at its best. Behind every product is a design approach shaped by real needs.',
      'step3.t': 'Our Vision',
      'step3.b': 'Our vision is to become a Turkish brand of choice among professional salons and to take our products to international markets.',
      'step4.t': 'Our Community',
      'step4.b': 'We care about our community of hairdressers, barbers and aestheticians with whom we grow together. Their feedback is the first inspiration for every new design.',

      'i.labelIletisim': 'Contact',
      'i.tSorular': 'Get in touch with your questions.',
      'i.adresAd': 'Address',
      'i.adres1': 'Bahar Özkan',
      'i.adres2': 'Dokuzkavaklar District, 2061 Street',
      'i.adres3': 'Pamukkale / Denizli, Türkiye',
      'i.telefonLabel': 'Phone',
      'i.baglantilar': 'Links',

      'k.label': 'Catalog',
      'k.baslik': 'Our Full Catalog',
      'k.alt': 'Quality textile solutions for professional salons and businesses',
      'k.tip': 'Drag & rotate · Click a product',
      'k.detay': 'View Details',
      'k.renk': 'Color:',
      'k.gorsel': 'Product Image',
      'k.basTumu': 'Our Full Catalog',
      'k.basOnluk': 'Professional Salon Aprons',
      'k.basPenuar': 'Capes',
      'k.basHavlu': 'Salon Textiles & Towels',
      'k.basGiyim': 'Workwear & Clothing',

      'u.gorsel': 'Product Image',
      'u.anaGorsel': 'Product Main Image',
      'u.aciklamaYeri': 'Detailed product description will appear here.',
      'u.beden': 'Select Size:',
      'u.renk': 'Select Color:',
      'u.ekle': 'Add to Cart',
      'u.kucukGorsel': 'Product Thumbnail',
      'u.zoomGorsel': 'Zoomed Image',
      'u.bedenUyari': 'Please select a size!',
      'u.renkUyari': 'Please select a color!',
      'u.adet': 'Quantity',
      'u.sepetEklendi': '"{u}" (x{n}) added to cart',
      'u.eklendiDetay': 'added to cart!',
      'u.bedenKisa': 'Size',
      'u.renkKisa': 'Color',

      's.label': 'Cart',
      's.baslik': 'Your Cart',
      's.alt': 'Review and complete your order',
      's.siparis': 'Order via WhatsApp',
      'sBos.baslik': 'Your cart is empty!',
      'sBos.metin': "It looks like you haven't added any products yet. Would you like to browse our great products?",
      'sBos.buton': 'Browse Products',
      's.beden': 'Size: ',
      's.renk': 'Color: ',
      's.silOnay': 'Are you sure you want to remove this item from your cart?',
      's.siparisBos': 'Your cart is empty. Add items before completing your order.',
      's.siparisYok': 'WhatsApp ordering is currently unavailable. The phone number is not set up yet.',
      's.wIntro': 'Hello! I would like to place an order from Destan Tekstil.',
      's.wUrunler': '--- My Items ---',
      's.wAyirici': '-------------------',
      's.wTeklif': 'Could you please send me a price quote?',

      't.baslik': 'Thank you for your order!',
      't.metin': 'Your order has been sent via WhatsApp. We will contact you shortly to complete it.',
      't.devam': 'Continue Shopping'
    },

    de: {
      'i.title': 'Destan Tekstil — Handtücher mit Logo & professionelle Salontextilien',
      'k.title': 'Katalog | Salontextil-Produkte - Destan Tekstil',
      's.title': 'Warenkorb | Destan Tekstil',
      't.title': 'Danke! | Destan Tekstil',

      'nav.anasayfa': 'Startseite',
      'nav.katalog': 'Katalog',
      'nav.hakkimizda': 'Über uns',
      'nav.iletisim': 'Kontakt',
      'nav.sepet': 'Warenkorb',
      'nav.acil': 'Menü öffnen',

      'ortak.tagline': 'Qualitäts-Textillösungen für professionelle Salons und Betriebe.',
      'footer.kategoriler': 'Kategorien',
      'footer.tumu': 'Alle',
      'footer.haklar': 'Alle Rechte vorbehalten.',
      'footer.gonderim': 'Wir versenden im In- und Ausland · in die ganze Welt',
      'footer.gonderimKisa': 'Wir versenden im In- und Ausland',
      'footer.meta': 'Professionelle Produkte für Friseure & Barbiere',

      'kategori.onluk': 'Schürzen',
      'kategori.penuar': 'Capes',
      'kategori.havlu': 'Handtücher',
      'kategori.giyim': 'Kleidung',
      'kategori.tumu': 'Alle',

      'contactbar.telefon': 'Telefon',
      'contactbar.eposta': 'E-Mail',

      'i.meta': 'Denizli · Türkiye',
      'i.eyebrow': 'SCHÜRZEN · CAPES · HANDTÜCHER · KLEIDUNG',
      'i.t1': 'Für professionelle Salons',
      'i.t2': 'und Betriebe',
      'i.t3': 'Qualitäts-Textillösungen',
      'i.kapak': 'Wir verbinden Langlebigkeit und Eleganz bei Handtüchern mit Logo, Capes und Arbeitskleidung. Entdecken Sie maßgeschneiderte Lösungen für Ihre Marke.',
      'i.kaydir': 'Scrollen',
      'i.imza': 'Langlebigkeit und Eleganz bei Handtüchern mit Logo, Capes und Arbeitskleidung.',

      'i.labelKategoriler': 'Kategorien',
      'i.tDort': 'Die vier Kerngruppen, die Ihr Salon braucht.',
      'kat1.ad': 'Bindenschürzen',
      'kat1.meta': 'Schürze',
      'kat2.ad': 'Capes',
      'kat2.meta': 'Cape',
      'kat3.ad': 'Handtücher mit Logo',
      'kat3.meta': 'Handtuch',
      'kat4.ad': 'Uniformen, Kimonos & Westen',
      'kat4.meta': 'Kleidung',
      'kat5.ad': 'Den kompletten Katalog entdecken',
      'kat5.meta': 'Katalog',

      'i.labelHakkimizda': 'Über uns',
      'i.tKimdir': 'Wer ist Destan Tekstil?',
      'step1.t': 'Unsere Geschichte',
      'step1.b': 'Als Destan Tekstil stellen wir langlebige, schmutzabweisende Textilprodukte mit Ihrem Logo für Schönheitssalons, Friseure und Betriebe her. Unsere strapazierfähigen Stoffe und individuellen Designs stärken Ihre Markenidentität.',
      'step2.t': 'Unsere Mission',
      'step2.b': 'Wir möchten Ihnen hochwertige, langlebige und funktionale Ausstattung bieten, damit Sie Ihren Beruf bestmöglich ausüben können. Hinter jedem Produkt steht ein Design, das aus echten Bedürfnissen entstanden ist.',
      'step3.t': 'Unsere Vision',
      'step3.b': 'Unsere Vision ist es, eine bevorzugte türkische Marke im professionellen Salonumfeld zu sein und unsere Produkte auf internationale Märkte zu bringen.',
      'step4.t': 'Unsere Gemeinschaft',
      'step4.b': 'Uns liegt die Gemeinschaft aus Friseuren, Barbieren und Kosmetikerinnen am Herzen, mit der wir zusammen wachsen. Ihr Feedback ist die erste Inspiration für jedes neue Design.',

      'i.labelIletisim': 'Kontakt',
      'i.tSorular': 'Kontaktieren Sie uns bei Fragen.',
      'i.adresAd': 'Adresse',
      'i.adres1': 'Bahar Özkan',
      'i.adres2': 'Dokuzkavaklar Viertel, Straße 2061',
      'i.adres3': 'Pamukkale / Denizli, Türkiye',
      'i.telefonLabel': 'Telefon',
      'i.baglantilar': 'Links',

      'k.label': 'Katalog',
      'k.baslik': 'Unser kompletter Katalog',
      'k.alt': 'Qualitäts-Textillösungen für professionelle Salons und Betriebe',
      'k.tip': 'Ziehen & drehen · Auf ein Produkt klicken',
      'k.detay': 'Details ansehen',
      'k.renk': 'Farbe:',
      'k.gorsel': 'Produktbild',
      'k.basTumu': 'Unser kompletter Katalog',
      'k.basOnluk': 'Professionelle Salon-Schürzen',
      'k.basPenuar': 'Capes',
      'k.basHavlu': 'Salontextilien & Handtücher',
      'k.basGiyim': 'Berufskleidung & Bekleidung',

      'u.gorsel': 'Produktbild',
      'u.anaGorsel': 'Hauptbild des Produkts',
      'u.aciklamaYeri': 'Die ausführliche Produktbeschreibung erscheint hier.',
      'u.beden': 'Größe wählen:',
      'u.renk': 'Farbe wählen:',
      'u.ekle': 'In den Warenkorb',
      'u.kucukGorsel': 'Produkt-Miniatur',
      'u.zoomGorsel': 'Vergrößertes Bild',
      'u.bedenUyari': 'Bitte wählen Sie eine Größe!',
      'u.renkUyari': 'Bitte wählen Sie eine Farbe!',
      'u.adet': 'Menge',
      'u.sepetEklendi': '„{u}" (x{n}) in den Warenkorb gelegt',
      'u.eklendiDetay': 'in den Warenkorb gelegt!',
      'u.bedenKisa': 'Größe',
      'u.renkKisa': 'Farbe',

      's.label': 'Warenkorb',
      's.baslik': 'Ihr Warenkorb',
      's.alt': 'Bestellung prüfen und abschließen',
      's.siparis': 'Über WhatsApp bestellen',
      'sBos.baslik': 'Ihr Warenkorb ist leer!',
      'sBos.metin': 'Sieht so aus, als hätten Sie noch keine Produkte hinzugefügt. Möchten Sie unsere tollen Produkte ansehen?',
      'sBos.buton': 'Produkte ansehen',
      's.beden': 'Größe: ',
      's.renk': 'Farbe: ',
      's.silOnay': 'Sind Sie sicher, dass Sie diesen Artikel aus dem Warenkorb entfernen möchten?',
      's.siparisBos': 'Ihr Warenkorb ist leer. Fügen Sie Artikel hinzu, bevor Sie die Bestellung abschließen.',
      's.siparisYok': 'WhatsApp-Bestellung derzeit nicht verfügbar. Die Telefonnummer ist noch nicht eingerichtet.',
      's.wIntro': 'Hallo! Ich möchte eine Bestellung bei Destan Tekstil aufgeben.',
      's.wUrunler': '--- Meine Artikel ---',
      's.wAyirici': '-------------------',
      's.wTeklif': 'Könnten Sie mir bitte ein Preisangebot senden?',

      't.baslik': 'Vielen Dank für Ihre Bestellung!',
      't.metin': 'Ihre Bestellung wurde per WhatsApp gesendet. Wir werden uns in Kürze mit Ihnen in Verbindung setzen.',
      't.devam': 'Weiter einkaufen'
    },

    ar: {
      'i.title': 'داستان تكستيل — مناشف بشعار ومنسوجات صالون احترافية',
      'k.title': 'الكتالوج | منتجات نسيج الصالون - داستان تكستيل',
      's.title': 'السلة | داستان تكستيل',
      't.title': 'شكرًا! | داستان تكستيل',

      'nav.anasayfa': 'الرئيسية',
      'nav.katalog': 'الكتالوج',
      'nav.hakkimizda': 'من نحن',
      'nav.iletisim': 'تواصل معنا',
      'nav.sepet': 'السلة',
      'nav.acil': 'افتح القائمة',

      'ortak.tagline': 'حلول نسيجية عالية الجودة للصالونات المحترفة والشركات.',
      'footer.kategoriler': 'الفئات',
      'footer.tumu': 'الكل',
      'footer.haklar': 'جميع الحقوق محفوظة.',
      'footer.gonderim': 'نشحن محليًا ودوليًا · إلى جميع أنحاء العالم',
      'footer.gonderimKisa': 'نشحن محليًا ودوليًا',
      'footer.meta': 'منتجات احترافية لمصففي الشعر والحلاقين',

      'kategori.onluk': 'مآزر',
      'kategori.penuar': 'أردية',
      'kategori.havlu': 'مناشف',
      'kategori.giyim': 'ملابس',
      'kategori.tumu': 'الكل',

      'contactbar.telefon': 'اتصال',
      'contactbar.eposta': 'البريد الإلكتروني',

      'i.meta': 'دنيزلي · تركيا',
      'i.eyebrow': 'مآزر · أردية · مناشف · ملابس',
      'i.t1': 'للصالونات المحترفة',
      'i.t2': 'والشركات',
      'i.t3': 'حلول نسيجية عالية الجودة',
      'i.kapak': 'نجمع بين المتانة والأناقة في المناشف ذات الشعار والأردية وملابس العمل. اكتشف حلولنا المخصصة لعلامتك التجارية.',
      'i.kaydir': 'مرر',
      'i.imza': 'متانة وأناقة في المناشف ذات الشعار والأردية وملابس العمل.',

      'i.labelKategoriler': 'الفئات',
      'i.tDort': 'المجموعات الأربع الأساسية التي يحتاجها صالونك.',
      'kat1.ad': 'مآزر بأشرطة',
      'kat1.meta': 'مريلة',
      'kat2.ad': 'أردية',
      'kat2.meta': 'رداء',
      'kat3.ad': 'مناشف بشعار',
      'kat3.meta': 'منشفة',
      'kat4.ad': 'أزياء وكيمونوات وسترات',
      'kat4.meta': 'ملابس',
      'kat5.ad': 'تصفح الكتالوج الكامل',
      'kat5.meta': 'الكتالوج',

      'i.labelHakkimizda': 'من نحن',
      'i.tKimdir': 'من هو داستان تكستيل؟',
      'step1.t': 'قصتنا',
      'step1.b': 'بصفتنا داستان تكستيل، ننتج منتجات نسيجية متينة ومقاومة للبقع ومزينة بشعارك لصالونات التجميل وصالونات الحلاقة والشركات. بنسيجنا القوي وتصميماتنا الخاصة نعزز الهوية المؤسسية لعملك.',
      'step2.t': 'مهمتنا',
      'step2.b': 'نهدف إلى تقديم معدات عالية الجودة ومتينة وعملية لتتمكن من أداء مهنتك على أفضل وجه. وراء كل منتج يوجد تصميم نابع من احتياجات حقيقية.',
      'step3.t': 'رؤيتنا',
      'step3.b': 'رؤيتنا أن نكون علامة تركية مفضلة في أوساط الصالونات المحترفة وأن ننقل منتجاتنا إلى الأسواق الدولية.',
      'step4.t': 'مجتمعنا',
      'step4.b': 'نهتم بمجتمعنا من مصففي الشعر والحلاقين وأخصائيي التجميل الذي ننمو معه. ملاحظاتهم هي أول مصدر إلهام لكل تصميم جديد.',

      'i.labelIletisim': 'تواصل معنا',
      'i.tSorular': 'تواصل معنا لاستفساراتك.',
      'i.adresAd': 'العنوان',
      'i.adres1': 'بهار أوزكان',
      'i.adres2': 'حي دوکوزکافاکلار، شارع 2061',
      'i.adres3': 'باموق قلعة / دنيزلي، تركيا',
      'i.telefonLabel': 'الهاتف',
      'i.baglantilar': 'روابط',

      'k.label': 'الكتالوج',
      'k.baslik': 'كتالوجنا الكامل',
      'k.alt': 'حلول نسيجية عالية الجودة للصالونات المحترفة والشركات',
      'k.tip': 'اسحب وأدر · انقر على منتج',
      'k.detay': 'عرض التفاصيل',
      'k.renk': 'اللون:',
      'k.gorsel': 'صورة المنتج',
      'k.basTumu': 'كتالوجنا الكامل',
      'k.basOnluk': 'مآزر صالون احترافية',
      'k.basPenuar': 'أردية',
      'k.basHavlu': 'منسوجات الصالون ومناشف',
      'k.basGiyim': 'ملابس العمل والملابس',

      'u.gorsel': 'صورة المنتج',
      'u.anaGorsel': 'الصورة الرئيسية للمنتج',
      'u.aciklamaYeri': 'سيظهر وصف المنتج التفصيلي هنا.',
      'u.beden': 'اختر المقاس:',
      'u.renk': 'اختر اللون:',
      'u.ekle': 'أضف إلى السلة',
      'u.kucukGorsel': 'صورة مصغرة للمنتج',
      'u.zoomGorsel': 'الصورة المكبّرة',
      'u.bedenUyari': 'يرجى اختيار مقاس!',
      'u.renkUyari': 'يرجى اختيار لون!',
      'u.adet': 'الكمية',
      'u.sepetEklendi': 'تمت إضافة «{u}» (×{n}) إلى السلة',
      'u.eklendiDetay': 'تمت الإضافة إلى السلة!',
      'u.bedenKisa': 'المقاس',
      'u.renkKisa': 'اللون',

      's.label': 'السلة',
      's.baslik': 'سلتك',
      's.alt': 'راجع طلبك وأكمله',
      's.siparis': 'اطلب عبر واتساب',
      'sBos.baslik': 'سلتك فارغة!',
      'sBos.metin': 'يبدو أنك لم تضف أي منتجات بعد. هل ترغب في تصفح منتجاتنا الرائعة؟',
      'sBos.buton': 'تصفح المنتجات',
      's.beden': 'المقاس: ',
      's.renk': 'اللون: ',
      's.silOnay': 'هل أنت متأكد من إزالة هذا المنتج من سلتك؟',
      's.siparisBos': 'سلتك فارغة. أضف منتجات قبل إكمال الطلب.',
      's.siparisYok': 'طلب واتساب غير متاح حاليًا. رقم الهاتف لم يُضبط بعد.',
      's.wIntro': 'مرحبًا! أريد تقديم طلب من داستان تكستيل.',
      's.wUrunler': '--- منتجاتي ---',
      's.wAyirici': '-------------------',
      's.wTeklif': 'هل يمكنكم إرسال عرض سعر لي؟',

      't.baslik': 'شكرًا لك على طلبك!',
      't.metin': 'تم إرسال طلبك عبر واتساب. سنتواصل معك قريبًا لاستكماله.',
      't.devam': 'متابعة التسوق'
    }
  };

  var RENKLER = {
    'Beyaz': { tr: 'Beyaz', en: 'White', de: 'Weiß', ar: 'أبيض' },
    'Krem': { tr: 'Krem', en: 'Cream', de: 'Creme', ar: 'كريمي' },
    'Pembe': { tr: 'Pembe', en: 'Pink', de: 'Rosa', ar: 'وردي' },
    'Siyah': { tr: 'Siyah', en: 'Black', de: 'Schwarz', ar: 'أسود' },
    'Gold': { tr: 'Gold', en: 'Gold', de: 'Gold', ar: 'ذهبي' },
    'Gri': { tr: 'Gri', en: 'Gray', de: 'Grau', ar: 'رمادي' },
    'Antrasit': { tr: 'Antrasit', en: 'Anthracite', de: 'Anthrazit', ar: 'أنثراسيت' },
    'Bej': { tr: 'Bej', en: 'Beige', de: 'Beige', ar: 'بيج' },
    'Tek Renk': { tr: 'Tek Renk', en: 'Single Color', de: 'Einfarbig', ar: 'لون واحد' }
  };

  var URUNLER = {
    'onluk': {
      tr: { name: 'Askılı Önlük', description: 'Gün boyu konforlu kullanım sunan ergonomik askı tasarımı ve leke tutmaz yapısıyla salonunuzun şıklığını tamamlar. Profesyonel kuaför, berber ve güzellik salonları için idealdir.' },
      en: { name: 'Strap Apron', description: 'Its ergonomic strap design and stain-resistant fabric provide all-day comfort and complete your salon elegance. Ideal for professional hairdressers, barbers and beauty salons.' },
      de: { name: 'Bindenschürze', description: 'Ergonomisches Trageband-Design und schmutzabweisender Stoff sorgen für Komfort den ganzen Tag und runden die Eleganz Ihres Salons ab. Ideal für professionelle Friseure, Barbiere und Schönheitssalons.' },
      ar: { name: 'مريلة بأشرطة', description: 'تصميم أشرطة مريح ونسيج مقاوم للبقع يوفران راحة طوال اليوم ويُكملان أناقة صالونك. مثالي لمصففي الشعر المحترفين وصالونات التجميل.' }
    },
    'penuar-sac-kesim': {
      tr: { name: 'Saç Kesim Penuarı', description: 'Kaygan yüzeyi ve nefes alabilir kumaşıyla müşterilerinize maksimum konfor sağlar. Kuaför ve berber salonları için özel üretim.' },
      en: { name: 'Haircut Cape', description: 'Its slippery surface and breathable fabric give your clients maximum comfort. Specially made for hair salons and barbershops.' },
      de: { name: 'Haarschnitt-Cape', description: 'Glatte Oberfläche und atmungsaktiver Stoff bieten Ihren Kunden maximalen Komfort. Speziell für Friseur- und Barbersalons gefertigt.' },
      ar: { name: 'رداء قص الشعر', description: 'سطح منزلق ونسيج قابل للتنفس يمنحان عملاءك أقصى درجات الراحة. مصنوع خصيصًا لصالونات الحلاقة والتصفيف.' }
    },
    'penuar-fon': {
      tr: { name: 'Fön Penuarı', description: 'Isıya ve yüksek hava akımına dayanıklı kumaş yapısıyla fön işlemlerinde ideal koruma sunar. Boyunluk ve kısa model seçenekleriyle profesyonel salonlara özel.' },
      en: { name: 'Blow-Dry Cape', description: 'Heat- and airflow-resistant fabric provides ideal protection during blow-drying. Nape protector and short models made for professional salons.' },
      de: { name: 'Föhn-Cape', description: 'Hitze- und luftstrombeständiger Stoff bietet idealen Schutz beim Föhnen. Nackenschutz- und Kurzmodelle für professionelle Salons.' },
      ar: { name: 'رداء التجفيف', description: 'نسيج مقاوم للحرارة والتيار الهوائي يوفر حماية مثالية أثناء التجفيف. موديلات بواقي الرقبة والقصيرة مخصصة للصالونات المحترفة.' }
    },
    'yelek': {
      tr: { name: 'Çalışma Yeleği', description: 'İşlevsel cep detayları ve rahat kesimiyle yoğun çalışma temposunda pratik kullanım sağlar. Ön, yan ve arka görünümleriyle kurumsal iş kıyafeti olarak idealdir.' },
      en: { name: 'Work Vest', description: 'Functional pockets and a comfortable cut make it practical for busy working days. Ideal as corporate workwear, shown from front, side and back.' },
      de: { name: 'Arbeitsweste', description: 'Funktionale Taschen und ein bequemer Schnitt machen sie im hektischen Arbeitsalltag praktisch. Ideal als Firmen-Arbeitskleidung in Vorder-, Seiten- und Rückansicht.' },
      ar: { name: 'سترة عمل', description: 'جيوب عملية وقصّة مريحة تجعلها عملية في أوقات العمل المزدحمة. مثالية كملابس عمل رسمية مع منظر أمامي وجانبي وخلفي.' }
    },
    'polar-ceket': {
      tr: { name: 'Polar Ceket', description: 'Soğuk çalışma ortamlarında sıcak tutan, hafif ve dayanıklı kumaş yapısına sahip kurumsal polar ceket. Gri ve siyah renk seçenekleri mevcuttur.' },
      en: { name: 'Fleece Jacket', description: 'A corporate fleece jacket that keeps you warm in cold working environments, made from light and durable fabric. Available in gray and black.' },
      de: { name: 'Fleecejacke', description: 'Eine Firmen-Fleecejacke, die in kalten Arbeitsumgebungen warm hält, aus leichtem und haltbarem Stoff. Erhältlich in Grau und Schwarz.' },
      ar: { name: 'جاكيت صوف', description: 'جاكيت صوف للشركات يحافظ على الدفء في البيئات الباردة، مصنوع من قماش خفيف ومتين. متوفر بالرمادي والأسود.' }
    },
    'forma': {
      tr: { name: 'Estetisyen Forması', description: 'Güzellik merkezleri ve klinikler için özel olarak tasarlanmış, esnek kumaşlı, profesyonel duruş sağlayan şık beyaz forması. Rahat ve şık kullanım sunar.' },
      en: { name: 'Aesthetician Uniform', description: 'A stylish white uniform with flexible fabric specially designed for beauty centers and clinics, offering a professional look with comfortable wear.' },
      de: { name: 'Kosmetikerin-Berufskleidung', description: 'Eine elegante weiße Berufskleidung aus flexiblem Stoff, speziell für Schönheitszentren und Kliniken entworfen, für einen professionellen und bequemen Auftritt.' },
      ar: { name: 'زي أخصائية التجميل', description: 'زي أبيض أنيق بقماش مرن مصمم خصيصًا لمراكز التجميل والعيادات، يمنح مظهرًا احترافيًا وراحة في الارتداء.' }
    },
    'kimono': {
      tr: { name: 'Boya Kimonosu', description: 'Leke ve boya sıçramalarına karşı tam koruma sağlayan, şık ve kolay giyilebilir profesyonel kimono. Kuaför ve berber kullanımı için idealdir.' },
      en: { name: 'Dye Kimono', description: 'A stylish, easy-to-wear professional kimono offering full protection against stains and dye splashes. Ideal for hairdressers and barbers.' },
      de: { name: 'Färb-Kimono', description: 'Ein eleganter, leicht anzuziehender Profi-Kimono mit vollem Schutz vor Flecken und Farbsprühern. Ideal für Friseure und Barbiere.' },
      ar: { name: 'كيمونو الصبغة', description: 'كيمونو احترافي أنيق وسهل الارتداء يوفر حماية كاملة من البقع ورش الصبغة. مثالي لمصففي الشعر والحلاقين.' }
    },
    'bornoz': {
      tr: { name: 'Bornoz', description: 'Yumuşak, yüksek emiciliğe sahip ve rahat kesimli profesyonel bornoz. Kuaför ve güzellik merkezleri için konforlu kullanım sunar.' },
      en: { name: 'Bathrobe', description: 'A soft professional bathrobe with high absorbency and a comfortable cut. Provides comfortable use for hair and beauty salons.' },
      de: { name: 'Bademantel', description: 'Ein weicher professioneller Bademantel mit hoher Saugfähigkeit und bequemem Schnitt. Komfortabel für Friseur- und Schönheitssalons.' },
      ar: { name: 'روب حمام', description: 'روب حمام احترافي ناعم عالي الامتصاص بقصّة مريحة. يوفر راحة لصالونات الحلاقة والتجميل.' }
    },
    'havlu-30x50': {
      tr: { name: '30x50 cm Logolu Havlu', description: 'İşletmenize özel logo nakışlı, yüksek emiciliğe sahip, yumuşak dokulu el ve yüz havlusu. Siyah, beyaz ve gri renk seçenekleri mevcuttur.' },
      en: { name: '30x50 cm Logo Towel', description: 'A soft hand and face towel with high absorbency and your company logo embroidered. Available in black, white and gray.' },
      de: { name: '30x50 cm Handtuch mit Logo', description: 'Ein weiches Hand- und Gesichtstuch mit hoher Saugfähigkeit und Ihrem Firmenlogo bestickt. Erhältlich in Schwarz, Weiß und Grau.' },
      ar: { name: 'منشفة بشعار 30×50 سم', description: 'منشفة يد ووجه ناعمة عالية الامتصاص مطرزة بشعار شركتك. متوفرة بالأسود والأبيض والرمادي.' }
    },
    'havlu-lazer': {
      tr: { name: 'Lazer Epilasyon Havlusu', description: 'Lazer epilasyon işlemleri için özel olarak üretilmiş, yüksek emiciliğe sahip antrasit renkli profesyonel salon havlusu. Hijyenik ve rahat kullanım sunar.' },
      en: { name: 'Laser Hair Removal Towel', description: 'A professional salon towel specially made for laser hair removal treatments, in anthracite with high absorbency. Hygienic and comfortable.' },
      de: { name: 'Laser-Haarentfernungs-Handtuch', description: 'Ein professionelles Salon-Handtuch speziell für Laser-Haarentfernung, in Anthrazit mit hoher Saugfähigkeit. Hygienisch und bequem.' },
      ar: { name: 'منشفة إزالة الشعر بالليزر', description: 'منشفة صالون احترافية مصنوعة خصيصًا لعلاجات إزالة الشعر بالليزر، بلون أنثراسيت وعالية الامتصاص. صحية ومريحة.' }
    },
    'havlu-ayak': {
      tr: { name: 'Ayak Havlusu', description: 'Salonlar için özel üretilmiş, emici ve yumuşak dokulu beyaz ayak havlusu. Kuaför ve güzellik merkezlerinde hijyenik kullanım için idealdir.' },
      en: { name: 'Foot Towel', description: 'A white foot towel specially made for salons, with absorbent and soft texture. Ideal for hygienic use in hair salons and beauty centers.' },
      de: { name: 'Fußhandtuch', description: 'Ein weißes Fußhandtuch speziell für Salons, mit saugfähiger und weicher Struktur. Ideal für den hygienischen Einsatz in Friseur- und Schönheitssalons.' },
      ar: { name: 'منشفة القدمين', description: 'منشفة قدم بيضاء مصنوعة خصيصًا للصالونات، بقوام ناعم وعالي الامتصاص. مثالية للاستخدام الصحي في صالونات التجميل.' }
    }
  };

  var suanki = 'tr';
  try {
    var kayit = localStorage.getItem(KAYIT);
    if (kayit && DILLER.indexOf(kayit) > -1) suanki = kayit;
  } catch (e) { /* gizlilik modunda saklama engellenebilir */ }

  function cevir(anahtar) {
    var t = CEVIRILER[suanki];
    return t && t[anahtar] != null ? t[anahtar] : (CEVIRILER.tr[anahtar] || anahtar || '');
  }

  function renk(trAd) {
    var r = RENKLER[trAd];
    return r ? (r[suanki] || r.tr || trAd) : (trAd || '');
  }

  function urun(grupId) {
    var u = URUNLER[grupId];
    if (!u) return null;
    var g = u[suanki] || u.tr;
    return { name: g.name, description: g.description };
  }

  function kategori(anahtar) {
    return cevir('kategori.' + (anahtar || 'tumu'));
  }

  function baslik(anahtar) {
    var map = { tumu: 'k.basTumu', onluk: 'k.basOnluk', penuar: 'k.basPenuar', havlu: 'k.basHavlu', giyim: 'k.basGiyim' };
    return cevir(map[anahtar] || 'k.basTumu');
  }

  function uygula() {
    var dil = suanki;
    var html = document.documentElement;
    html.setAttribute('lang', dil);
    html.setAttribute('dir', RTL_DILLER[dil] ? 'rtl' : 'ltr');
    html.classList.toggle('rtl', !!RTL_DILLER[dil]);

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var anahtar = el.getAttribute('data-i18n');
      var metin = cevir(anahtar);
      if (metin) el.textContent = metin;
    });

    document.querySelectorAll('[data-i18n-attr]').forEach(function (el) {
      var pairs = el.getAttribute('data-i18n-attr').split(';');
      pairs.forEach(function (pair) {
        var idx = pair.indexOf(':');
        if (idx < 0) return;
        var attr = pair.slice(0, idx);
        var metin = cevir(pair.slice(idx + 1));
        if (metin) el.setAttribute(attr, metin);
      });
    });

    document.querySelectorAll('[data-dil-etiket]').forEach(function (el) {
      el.textContent = DIL_ADLAR[dil];
    });

    document.querySelectorAll('.dil-liste > li[data-dil]').forEach(function (li) {
      var aktif = li.getAttribute('data-dil') === dil;
      li.classList.toggle('aktif', aktif);
      li.setAttribute('aria-selected', aktif ? 'true' : 'false');
    });

    document.querySelectorAll('.dil-secici.acik').forEach(function (b) {
      b.classList.remove('acik');
    });

    (window.DIL_DEGISTI_ISLEMLER || []).forEach(function (fn) {
      try { fn(dil); } catch (e) { console.error('Dil değişim işlemi hatası:', e); }
    });
  }

  function sec(dil) {
    if (DILLER.indexOf(dil) < 0) return;
    suanki = dil;
    try { localStorage.setItem(KAYIT, dil); } catch (e) { /* boş */ }
    uygula();
  }

  document.addEventListener('click', function (e) {
    var tus = e.target.closest ? e.target.closest('.dil-tusu') : null;
    if (tus) {
      e.preventDefault();
      var kutu = tus.closest('.dil-secici');
      var acikti = kutu.classList.contains('acik');
      document.querySelectorAll('.dil-secici.acik').forEach(function (b) {
        b.classList.remove('acik');
        var bTus = b.querySelector('.dil-tusu');
        if (bTus) bTus.setAttribute('aria-expanded', 'false');
      });
      if (!acikti) {
        kutu.classList.add('acik');
        tus.setAttribute('aria-expanded', 'true');
      }
      return;
    }
    var secenek = e.target.closest ? e.target.closest('.dil-liste > li[data-dil]') : null;
    if (secenek) {
      sec(secenek.getAttribute('data-dil'));
      var kapali = secenek.closest('.dil-secici');
      if (kapali) {
        kapali.classList.remove('acik');
        var kTus = kapali.querySelector('.dil-tusu');
        if (kTus) kTus.setAttribute('aria-expanded', 'false');
      }
      return;
    }
    document.querySelectorAll('.dil-secici.acik').forEach(function (b) {
      b.classList.remove('acik');
    });
  });

  window.DIL = {
    suanki: function () { return suanki; },
    cevir: cevir,
    renk: renk,
    urun: urun,
    kategori: kategori,
    baslik: baslik,
    sec: sec,
    uygula: uygula
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', uygula);
  } else {
    uygula();
  }
})();