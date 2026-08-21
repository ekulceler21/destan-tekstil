/*
  ── İLETİŞİM / TELEFON AYARLARI ────────────────────────────────
  Telefon numaranızı girmek istediğinizde SADECE burayı düzenleyin.
  Numara boşken WhatsApp bağlantıları sayfalarda görünmez.
*/
window.SITE_AYARLAR = {
  /* WhatsApp numarası: başında 0 olmadan, ülke kodu (90) ile yazın.
     örnek: '905xxxxxxxxx' */
  whatsappNumara: '90 505 514 14 11',

  /* Ekranda kullanıcıya gösterilecek yazı. örnek: '05xx xxx xx xx'
     Boş bırakılırsa yazı gösterilmez, yalnızca bağlantı görünür. */
  whatsappYazi: '90 505 514 14 11',
};

(function () {
  var a = window.SITE_AYARLAR || {};
  /* wa.me yalnızca rakamlardan oluşan numarayla çalışır;
     boşluk/tire/parantez temizlenir ki mobilde WhatsApp uygulaması açılsın. */
  var numara = String(a.whatsappNumara || '').replace(/\D/g, '');
  var yazi = a.whatsappYazi || '';

  if (numara) {
    document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
      el.href = 'https://wa.me/' + numara;
      var metinKutusu = el.querySelector('[data-whatsapp-yazi]');
      if (metinKutusu) metinKutusu.textContent = yazi;
    });
  } else {
    document.querySelectorAll('[data-whatsapp], [data-whatsapp-kolon]').forEach(function (el) {
      el.remove();
    });
  }
})();