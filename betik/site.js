document.addEventListener('DOMContentLoaded', () => {

    // --- Ürün verileri (gerçek ürün görselleriyle) ---
    const baseProducts = [
        {
            id: 'onluk',
            category: 'onluk',
            name: 'Askılı Önlük',
            price: 249.90,
            description: 'Gün boyu konforlu kullanım sunan ergonomik askı tasarımı ve leke tutmaz yapısıyla salonunuzun şıklığını tamamlar. Profesyonel kuaför, berber ve güzellik salonları için idealdir.',
            sizes: ['Standart'],
            colors: ['Beyaz', 'Krem', 'Pembe', 'Siyah'],
            colorImages: {
                'Beyaz': ['img/onluk-beyaz.jpeg'],
                'Krem': ['img/onluk-krem.jpeg'],
                'Pembe': ['img/onluk-pembe.jpeg'],
                'Siyah': ['img/onluk-siyah.jpeg']
            },
            seoTitle: 'Askılı Önlük | Profesyonel Salon Önlükleri - Destan Tekstil',
            seoDesc: 'Leke tutmaz, ergonomik askılı salon önlüğü. Beyaz, kre, pembe ve siyah renk seçenekleriyle kuaför ve berberler için. Destan Tekstil.'
        },
        {
            id: 'penuar-sac-kesim',
            category: 'penuar',
            name: 'Saç Kesim Penuarı',
            price: 199.90,
            description: 'Kaygan yüzeyi ve nefes alabilir kumaşıyla müşterilerinize maksimum konfor sağlar. Kuaför ve berber salonları için özel üretim.',
            sizes: ['Standart'],
            colors: ['Beyaz', 'Gold', 'Gri', 'Siyah'],
            colorImages: {
                'Beyaz': ['img/penuar-sac-kesim-penuari-beyaz.jpeg'],
                'Gold': ['img/penuar-sac-kesim-penuari-gold.jpeg'],
                'Gri': ['img/penuar-sac-kesim-penuari-gri.jpeg'],
                'Siyah': ['img/penuar-sac-kesim-penuari-siyah.jpeg']
            },
            seoTitle: 'Saç Kesim Penuarı | Kuaför Penuarı Modelleri - Destan Tekstil',
            seoDesc: 'Saç dökülmesini önleyen kaygan yüzeyli saç kesim penuarı. Beyaz, gold, gri ve siyah renk seçenekleriyle profesyonel kullanım. Destan Tekstil.'
        },
        {
            id: 'penuar-fon',
            category: 'penuar',
            name: 'Fön Penuarı',
            price: 179.90,
            description: 'Isıya ve yüksek hava akımına dayanıklı kumaş yapısıyla fön işlemlerinde ideal koruma sunar. Boyunluk ve kısa model seçenekleriyle profesyonel salonlara özel.',
            images: [
                'img/penuar-fon-penuari-siyah-omuzluk.jpeg',
                'img/penuar-fon-penuari-siyah-kisa.jpeg'
            ],
            sizes: ['Standart'],
            colors: [],
            seoTitle: 'Fön Penuarı | Isıya Dayanıklı Kuaför Penuarı - Destan Tekstil',
            seoDesc: 'Fön işlemlerine özel, ısıya dayanıklı fön penuarı. Boyunluk ve kısa model görselleriyle profesyonel pencuarlar. Destan Tekstil.'
        },
        {
            id: 'yelek',
            category: 'giyim',
            name: 'Çalışma Yeleği',
            price: 149.90,
            description: 'İşlevsel cep detayları ve rahat kesimiyle yoğun çalışma temposunda pratik kullanım sağlar. Ön, yan ve arka görünümleriyle kurumsal iş kıyafeti olarak idealdir.',
            images: [
                'img/giyim-calisma-yelegi-siyah.jpeg',
                'img/giyim-calisma-yelegi-siyah-arka.jpeg',
                'img/giyim-calisma-yelegi-siyah-yan.jpeg'
            ],
            sizes: ['S', 'M', 'L', 'XL'],
            colors: [],
            seoTitle: 'Çalışma Yeleği | Cepli Kurumsal İş Yeleği - Destan Tekstil',
            seoDesc: 'Cep detaylı ve rahat kesimli çalışma yeleği. Ön, yan ve arka görselleriyle kurumsal iş kıyafeti olarak ideal. Destan Tekstil.'
        },
        {
            id: 'polar-ceket',
            category: 'giyim',
            name: 'Polar Ceket',
            price: 299.90,
            description: 'Soğuk çalışma ortamlarında sıcak tutan, hafif ve dayanıklı kumaş yapısına sahip kurumsal polar ceket. Gri ve siyah renk seçenekleri mevcuttur.',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Gri', 'Siyah'],
            colorImages: {
                'Gri': ['img/giyim-polar-ceket-gri.jpeg', 'img/giyim-polar-ceket-gri-arka.jpeg'],
                'Siyah': ['img/giyim-polar-ceket-siyah.jpeg', 'img/giyim-polar-ceket-siyah-arka.jpeg']
            },
            seoTitle: 'Polar Ceket | Gri & Siyah Kurumsal Ceket - Destan Tekstil',
            seoDesc: 'Soğuk çalışma ortamları için hafif ve sıcak tutan kurumsal polar ceket. Gri ve siyah renklerde ön ve arka görselleriyle. Destan Tekstil.'
        },
        {
            id: 'forma',
            category: 'giyim',
            name: 'Estetisyen Forması',
            price: 199.90,
            description: 'Güzellik merkezleri ve klinikler için özel olarak tasarlanmış, esnek kumaşlı, profesyonel duruş sağlayan şık beyaz forması. Rahat ve şık kullanım sunar.',
            images: ['img/giyim-estetisyen-formasi-beyaz.jpeg'],
            sizes: ['S', 'M', 'L', 'XL'],
            colors: [],
            seoTitle: 'Estetisyen Forması | Güzellik Merkezi Çalışan Forması - Destan Tekstil',
            seoDesc: 'Esnek kumaşlı, profesyonel duruş sağlayan beyaz estetisyen forması. Güzellik merkezleri ve klinikler için özel tasarım. Destan Tekstil.'
        },
        {
            id: 'kimono',
            category: 'giyim',
            name: 'Boya Kimonosu',
            price: 229.90,
            description: 'Leke ve boya sıçramalarına karşı tam koruma sağlayan, şık ve kolay giyilebilir profesyonel kimono. Kuaför ve berber kullanımı için idealdir.',
            images: ['img/giyim-boya-kimonosu.jpeg'],
            sizes: ['S', 'M', 'L', 'XL'],
            colors: [],
            seoTitle: 'Boya Kimonosu | Boya Sıçramalarına Dayanıklı Kimono - Destan Tekstil',
            seoDesc: 'Boya ve leke sıçramalarına karşı tam koruma sağlayan, şık ve kolay giyilebilen beyaz boya kimonosu. Kuaförler için ideal. Destan Tekstil.'
        },
        {
            id: 'bornoz',
            category: 'giyim',
            name: 'Bornoz',
            price: 229.90,
            description: 'Yumuşak, yüksek emiciliğe sahip ve rahat kesimli profesyonel bornoz. Kuaför ve güzellik merkezleri için konforlu kullanım sunar.',
            images: ['img/giyim-bornoz.jpeg'],
            sizes: ['S', 'M', 'L', 'XL'],
            colors: [],
            seoTitle: 'Bornoz | Profesyonel Salon Bornozu - Destan Tekstil',
            seoDesc: 'Yumuşak ve emici kumaşlı, rahat kesimli profesyonel salon bornozu. Kuaför ve güzellik merkezleri için konforlu kullanım. Destan Tekstil.'
        },
        {
            id: 'havlu-30x50',
            category: 'havlu',
            name: '30x50 cm Logolu Havlu',
            price: 59.90,
            description: 'İşletmenize özel logo nakışlı, yüksek emiciliğe sahip, yumuşak dokulu el ve yüz havlusu. Siyah, beyaz ve gri renk seçenekleri mevcuttur.',
            images: [
                'img/havlu-30x50-renk-secenekleri.jpeg',
                'img/havlu-30x50-siyah-beyaz-gri.jpeg',
                'img/havlu-30x50-siyah-beyaz.jpeg',
                'img/havlu-gri.jpeg'
            ],
            sizes: ['Standart'],
            colors: ['Siyah', 'Beyaz', 'Gri'],
            seoTitle: '30x50 Logolu Havlu | Firmaya Özel Nakışlı Havlu - Destan Tekstil',
            seoDesc: 'İşletmenize özel logo nakışlı 30x50 cm el ve yüz havlusu. Yüksek emicilik, yumuşak doku; renk seçenekleriyle. Destan Tekstil.'
        },
        {
            id: 'havlu-lazer',
            category: 'havlu',
            name: 'Lazer Epilasyon Havlusu',
            price: 89.90,
            description: 'Lazer epilasyon işlemleri için özel olarak üretilmiş, yüksek emiciliğe sahip antrasit renkli profesyonel salon havlusu. Hijyenik ve rahat kullanım sunar.',
            images: ['img/havlu-lazer-epilasyon-antrasit.jpeg'],
            sizes: ['Standart'],
            colors: [],
            seoTitle: 'Lazer Epilasyon Havlusu | Antrasit Salon Havlusu - Destan Tekstil',
            seoDesc: 'Lazer epilasyon işlemleri için antrasit renkli, yüksek emicilikte profesyonel salon havlusu. Hijyenik ve konforlu kullanım. Destan Tekstil.'
        },
        {
            id: 'havlu-ayak',
            category: 'havlu',
            name: 'Ayak Havlusu',
            price: 69.90,
            description: 'Salonlar için özel üretilmiş, emici ve yumuşak dokulu beyaz ayak havlusu. Kuaför ve güzellik merkezlerinde hijyenik kullanım için idealdir.',
            images: ['img/havlu-ayak-havlusu-beyaz.jpeg'],
            sizes: ['Standart'],
            colors: [],
            seoTitle: 'Ayak Havlusu | Beyaz Salon Zemin Havlusu - Destan Tekstil',
            seoDesc: 'Salonlar için özel üretilmiş, emici ve yumuşak beyaz ayak havlusu. Kuaför ve güzellik merkezlerinde hijyenik kullanım. Destan Tekstil.'
        }
    ];

    // --- Renk varyantları: her renk, ayrı bir ürün ve sayfa olur ---
    function slugUzanti(renk) {
        return renk.toLowerCase().replace(/\s+/g, '-');
    }

    const products = [];
    baseProducts.forEach(bp => {
        if (bp.colors && bp.colors.length > 0) {
            bp.colors.forEach(renk => {
                products.push({
                    id: `${bp.id}-${slugUzanti(renk)}`,
                    grupId: bp.id,
                    renk: renk,
                    category: bp.category,
                    name: `${bp.name} (${renk})`,
                    price: bp.price,
                    oldPrice: bp.oldPrice,
                    description: bp.description,
                    images: webpDizisi((bp.colorImages && bp.colorImages[renk]) || bp.images),
                    sizes: bp.sizes,
                    badge: bp.badge,
                    seoTitle: bp.seoTitle,
                    seoDesc: bp.seoDesc
                });
            });
        } else {
            products.push({
                id: bp.id,
                grupId: bp.id,
                category: bp.category,
                name: bp.name,
                price: bp.price,
                oldPrice: bp.oldPrice,
                description: bp.description,
                images: webpDizisi(bp.images),
                sizes: bp.sizes,
                badge: bp.badge,
                seoTitle: bp.seoTitle,
                seoDesc: bp.seoDesc
            });
        }
    });

    window.MARKA_PRODUCTS = products;
    window.MARKA_PRODUCTS_READY = true;

    // --- Kategori adları ---
    const kategoriAdlari = {
        'tumu': 'Tüm Kataloğumuz',
        'onluk': 'Profesyonel Salon Önlükleri',
        'penuar': 'Penuarlar',
        'havlu': 'Salon Tekstili & Havlu',
        'giyim': 'İş Kıyafetleri & Giyim'
    };

    // --- Yardımcı Fonksiyonlar ---
    function formatPrice(price) {
        return price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' });
    }

    function colorHex(color) {
        const map = {
            'Siyah': '#1f2937',
            'Beyaz': '#ffffff',
            'Gri': '#9ca3af',
            'Gold': '#d4af37',
            'Pembe': '#ec4899',
            'Krem': '#f3e5c8',
            'Bej': '#d6c3a1',
            'Antrasit': '#374151'
        };
        return map[color] || '#f97316';
    }

    // --- WebP görsel yolu: ürün görselleri .webp olarak, jpeg yedeğiyle kullanılır ---
    function webpYolu(path) {
        return path ? path.replace(/\.jpe?g$/i, '.webp') : path;
    }

    function webpDizisi(arr) {
        return (arr || []).map(webpYolu);
    }

    // --- Alışveriş Sepeti ---
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        document.querySelectorAll('.cart-count').forEach(el => el.textContent = totalItems);
        document.querySelectorAll('.cart-count-mobile').forEach(el => el.textContent = totalItems);
    }

    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCount();
    }

    // --- Sepet bildirimi (toast) ---
    let toastTimer = null;
    function showCartToast(message) {
        let toast = document.getElementById('sepet-toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'sepet-toast';
            toast.setAttribute('role', 'status');
            toast.setAttribute('aria-live', 'polite');
            toast.innerHTML = '<span class="toast-check">✓</span><span class="toast-text"></span>';
            document.body.appendChild(toast);
        }
        toast.querySelector('.toast-text').textContent = message;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
    }

    function addToCart(productId, selectedSize, selectedColor, quantity) {
        const product = products.find(p => p.id === productId);
        if (!product) return;
        const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === selectedSize && item.color === selectedColor);
        if (existingItemIndex > -1) {
            cart[existingItemIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.images[0] || '',
                size: selectedSize,
                color: selectedColor,
                quantity: quantity
            });
        }
        saveCart();
        showCartToast(`${quantity}x "${product.name}" sepete eklendi`);
    }

    // --- Ürün Render Etme ---
    function renderProductCard(product) {
        const imageHtml = (product.images && product.images.length > 0)
            ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image" loading="lazy" decoding="async" onerror="gorselWebpYedek(this)">`
            : `<div class="product-image product-image-placeholder"><svg class="icon" aria-hidden="true"><use href="#icon-tshirt"></use></svg><span>Ürün Görseli</span></div>`;
        const colorInfo = product.renk
            ? `<p class="product-colors">Renk: <span class="color-swatch" style="background-color:${colorHex(product.renk)}"></span>${product.renk}</p>`
            : '';
        return `
            <div class="product-card">
                ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                <a href="urun.html?id=${product.id}">
                    ${imageHtml}
                    <div class="product-info">
                        <h3 class="product-title">${product.name}</h3>
                        ${colorInfo}
                        <button class="btn add-to-cart-quick" data-product-id="${product.id}">Detayları Gör</button>
                    </div>
                </a>
            </div>
        `;
    }

    function renderAllProducts() {
        const allProductsGrid = document.getElementById('all-products-grid');
        if (allProductsGrid) {
            const params = new URLSearchParams(window.location.search);
            const kategori = params.get('kategori');
            const baslikEl = document.getElementById('katalog-baslik');
            let filtered = products;
            if (kategori && kategoriAdlari[kategori] && kategori !== 'tumu') {
                filtered = products.filter(p => p.category === kategori);
                if (baslikEl) baslikEl.textContent = kategoriAdlari[kategori];
            } else {
                if (baslikEl) baslikEl.textContent = 'Tüm Kataloğumuz';
            }
            document.querySelectorAll('.kategori-btn').forEach(btn => {
                btn.classList.toggle('aktif', btn.dataset.kategori === (kategori || 'tumu'));
            });
            allProductsGrid.innerHTML = filtered.map(renderProductCard).join('');
        }
    }

    // --- Sayfaya Özel ---
    function renderProductPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        const product = products.find(p => p.id === productId);

        if (!product) {
            window.location.href = 'katalog.html';
            return;
        }

        // --- Ürün SEO (başlık + meta açıklama) ---
        const seoTitle = (product.seoTitle ? product.seoTitle + ' (renk: ' + product.renk + ')' : `${product.name} - Destan Tekstil`).replace(/ \(renk: undefined\)/, '');
        document.getElementById('product-page-title').textContent = seoTitle;
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.name = 'description';
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', product.seoDesc || product.description);

        // --- Ürün SEO (canonical + JSON-LD Product) ---
        const pageUrl = location.pathname.includes('katalog') ? 'katalog.html' : 'urun.html?id=' + productId;
        const canonicalEl = document.querySelector('link[rel="canonical"]');
        if (canonicalEl) canonicalEl.setAttribute('href', 'https://destantekstil.com.tr/' + pageUrl);

        let jsonLd = document.getElementById('product-jsonld');
        if (!jsonLd) {
            jsonLd = document.createElement('script');
            jsonLd.type = 'application/ld+json';
            jsonLd.id = 'product-jsonld';
            document.head.appendChild(jsonLd);
        }
        jsonLd.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.seoDesc || product.description,
            image: product.images.map(img => 'https://destantekstil.com.tr/' + img.replace(/^\//, '')),
            brand: { '@type': 'Brand', name: 'Destan Tekstil' }
        });

        document.getElementById('product-title').textContent = product.name;
        document.getElementById('product-description').textContent = product.description;

        const mainImage = document.getElementById('main-product-image');
        const mainPlaceholder = document.getElementById('main-product-placeholder');

        mainImage.src = product.images[0];
        mainImage.alt = product.name;
        mainImage.decoding = 'async';
        mainImage.fetchPriority = 'high';
        mainImage.style.display = 'block';
        if (mainPlaceholder) mainPlaceholder.style.display = 'none';

        const thumbnailContainer = document.getElementById('thumbnail-container');
        if (thumbnailContainer) {
            thumbnailContainer.innerHTML = product.images.map(imgSrc => `
                <img src="${imgSrc}" alt="Ürün Küçük Görsel" class="thumbnail" data-full-image="${imgSrc}" loading="lazy" decoding="async" onerror="gorselWebpYedek(this)">
            `).join('');
            thumbnailContainer.querySelectorAll('.thumbnail').forEach(thumbnail => {
                thumbnail.addEventListener('click', () => {
                    mainImage.src = thumbnail.dataset.fullImage;
                });
            });
        }

        const sizeOptionsContainer = document.getElementById('size-options-container');
        let selectedSize = null;
        if (sizeOptionsContainer && product.sizes && product.sizes.length > 0) {
            const autoSelect = product.sizes.length === 1;
            sizeOptionsContainer.innerHTML = product.sizes.map(size => `
                <span class="size-option ${autoSelect ? 'selected' : ''}" data-size="${size}">${size}</span>
            `).join('');
            if (autoSelect) selectedSize = product.sizes[0];
            sizeOptionsContainer.querySelectorAll('.size-option').forEach(option => {
                option.addEventListener('click', () => {
                    sizeOptionsContainer.querySelectorAll('.size-option').forEach(s => s.classList.remove('selected'));
                    option.classList.add('selected');
                    selectedSize = option.dataset.size;
                });
            });
        }

        const colorSelector = document.querySelector('.color-selector');
        const colorOptionsContainer = document.getElementById('color-options-container');
        let selectedColor = 'Tek Renk';
        if (colorOptionsContainer && product.renk) {
            const siblings = product.grupId
                ? products.filter(p => p.grupId === product.grupId)
                : [];
            if (siblings.length > 0) {
                if (colorSelector) colorSelector.style.display = 'block';
                colorOptionsContainer.innerHTML = siblings.map(sib => `
                    <a href="urun.html?id=${sib.id}" class="color-option ${sib.id === product.id ? 'selected' : ''}" data-color="${sib.renk}">
                        <span class="color-swatch" style="background-color:${colorHex(sib.renk)}"></span>${sib.renk}
                    </a>
                `).join('');
                selectedColor = product.renk;
            } else {
                if (colorSelector) colorSelector.style.display = 'none';
                selectedColor = 'Tek Renk';
            }
        }

        const quantityInput = document.getElementById('product-quantity');
        const sanitizeQuantity = () => {
            let val = parseInt(quantityInput.value);
            if (isNaN(val) || val < 1) val = 1;
            quantityInput.value = val;
            return val;
        };
        document.getElementById('decrease-quantity')?.addEventListener('click', () => {
            let currentQuantity = sanitizeQuantity();
            if (currentQuantity > 1) {
                quantityInput.value = currentQuantity - 1;
            }
        });
        document.getElementById('increase-quantity')?.addEventListener('click', () => {
            let currentQuantity = sanitizeQuantity();
            quantityInput.value = currentQuantity + 1;
        });
        quantityInput.addEventListener('change', sanitizeQuantity);

        document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
            if (!selectedSize) {
                alert('Lütfen bir beden seçin!');
                return;
            }
            if (!selectedColor) {
                alert('Lütfen bir renk seçin!');
                return;
            }
            const quantity = sanitizeQuantity();
            addToCart(productId, selectedSize, selectedColor, quantity);
            const messageEl = document.getElementById('add-to-cart-message');
            if (messageEl) {
                messageEl.textContent = `${quantity}x "${product.name}" (Beden: ${selectedSize}, Renk: ${selectedColor}) sepete eklendi!`;
                messageEl.style.display = 'block';
                setTimeout(() => {
                    messageEl.style.display = 'none';
                    messageEl.textContent = '';
                }, 3000);
            }
        });

        const zoomOverlay = document.getElementById('zoom-overlay');
        const zoomedImage = document.getElementById('zoomed-image');
        const closeZoom = document.getElementById('close-zoom');

        if (mainImage && zoomOverlay && zoomedImage && closeZoom) {
            mainImage.addEventListener('click', () => {
                zoomedImage.src = mainImage.src;
                zoomOverlay.classList.add('active');
            });
            closeZoom.addEventListener('click', () => {
                zoomOverlay.classList.remove('active');
            });
            zoomOverlay.addEventListener('click', (e) => {
                if (e.target === zoomOverlay) {
                    zoomOverlay.classList.remove('active');
                }
            });
        }
    }

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const mobileMenu = document.querySelector('.mobile-menu');

    if (mobileMenuBtn && mobileMenu) {
        const setMenuIcon = (open) => {
            const useEl = mobileMenuBtn.querySelector('use');
            useEl?.setAttribute('href', open ? '#icon-times' : '#icon-bars');
        };
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('active');
            setMenuIcon(mobileMenu.classList.contains('active'));
        });
    }

    document.addEventListener('click', (event) => {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (!mobileMenu.contains(event.target) && !mobileMenuBtn.contains(event.target)) {
                mobileMenu.classList.remove('active');
                const useEl = mobileMenuBtn.querySelector('use');
                useEl?.setAttribute('href', '#icon-bars');
            }
        }
    });

    if (mobileMenu) {
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.remove('active');
                const useEl = mobileMenuBtn.querySelector('use');
                useEl?.setAttribute('href', '#icon-bars');
            });
        });
    }

    // --- Kaydırma Animasyonu Mantığı (Scroll Reveal) ---
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-from-bottom, .slide-in-from-left, .slide-in-from-right, .scale-in-center');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    const activateInView = () => {
        animatedElements.forEach(element => {
            if (element.classList.contains('active')) return;
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                element.classList.add('active');
                observer.unobserve(element);
            }
        });
    };
    activateInView();
    window.addEventListener('load', () => setTimeout(activateInView, 100));
    window.addEventListener('scroll', activateInView, { passive: true });

    // --- İçeriği mevcut sayfaya göre render eder ---
    updateCartCount();
    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === 'katalog.html') {
        renderAllProducts();
    } else if (currentPage === 'urun.html') {
        renderProductPage();
    }
});

// --- Görsel Bulunamazsa Yedek Görsel (kart) ---
function gorselYok(el) {
    const placeholder = document.createElement('div');
    placeholder.className = 'product-image product-image-placeholder';
    placeholder.innerHTML = '<svg class="icon" aria-hidden="true"><use href="#icon-tshirt"></use></svg><span>Ürün Görseli</span>';
    if (el && el.parentNode) {
        el.replaceWith(placeholder);
    }
}

// --- WebP öncelikli: webp yüklenemezse yedek görsel (kart) ---
function gorselWebpYedek(el) {
    gorselYok(el);
}

// --- WebP öncelikli yedek (ürün sayfası ana görsel) ---
function gorselWebpYedekAna(el) {
    gorselYokAna(el);
}

// --- WebP öncelikli yedek (sepet kart görseli) ---
function gorselWebpYedekSepet(el) {
    if (el && el.parentNode) {
        el.outerHTML = '<div class="cart-item-image cart-image-placeholder"><svg class="icon" aria-hidden="true"><use href="#icon-tshirt"></use></svg></div>';
    }
}

// --- Görsel Bulunamazsa Yedek Görsel (ürün sayfası ana görsel) ---
function gorselYokAna(el) {
    if (el) el.style.display = 'none';
    const ph = document.getElementById('main-product-placeholder');
    if (ph) {
        ph.style.display = 'flex';
        const span = ph.querySelector('span');
        if (span) span.textContent = 'Ürün Görseli';
    }
}

