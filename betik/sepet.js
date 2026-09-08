(function() {
    // --- 1. Ayarlar ve DOM Seçiciler ---
    const DOM = {
        cartItemsContainer: document.getElementById('cart-items-container'),
        emptyCartSection: document.getElementById('empty-cart-section'),
        cartContentSection: document.getElementById('cart-content-section'),
        cartCountHeader: document.querySelector('.cart-icon .cart-count'),
        cartCountMobile: document.querySelector('.mobile-menu .cart-count-mobile'),
        checkoutWhatsappBtn: document.getElementById('checkout-whatsapp-btn')
    };

    const CONFIG = {
        whatsappPhoneNumber:
            (typeof window.SITE_AYARLAR !== 'undefined' && window.SITE_AYARLAR.whatsappNumara
                ? String(window.SITE_AYARLAR.whatsappNumara).replace(/\D/g, '')
                : '') || ''
    };

    // --- 2. Yardımcı ve Veri Yönetimi Fonksiyonları ---
    function D() {
        return window.DIL || { cevir: function (k) { return k; }, renk: function (r) { return r; }, urun: function () { return null; } };
    }

    function yerelAd(item) {
        const u = item.grupId ? D().urun(item.grupId) : null;
        return u ? u.name : (item.name || '');
    }

    function yerelRenk(item) {
        if (!item.color) return '';
        return D().renk(item.color);
    }

    function getCartItems() {
        try {
            const cart = localStorage.getItem('cart');
            return cart ? JSON.parse(cart) : [];
        } catch (e) {
            console.error('Sepet localStorage verisi okunurken hata:', e);
            return [];
        }
    }

    function saveCartItems(cart) {
        try {
            localStorage.setItem('cart', JSON.stringify(cart));
            updateCartCountDisplays();
        } catch (e) {
            console.error('Sepet localStorage verisi kaydedilirken hata:', e);
        }
    }

    // --- 3. DOM İşleme ve Render Fonksiyonları ---
    function updateCartCountDisplays() {
        const cart = getCartItems();
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (DOM.cartCountHeader) {
            DOM.cartCountHeader.textContent = totalItems;
        }
        if (DOM.cartCountMobile) {
            DOM.cartCountMobile.textContent = totalItems;
        }
    }

    function getItemKey(item) {
        return `${item.id}|${item.size}|${item.color}`;
    }

    function renderCart() {
        const cart = getCartItems();
        DOM.cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            if (DOM.emptyCartSection) DOM.emptyCartSection.style.display = 'block';
            if (DOM.cartContentSection) DOM.cartContentSection.style.display = 'none';
        } else {
            if (DOM.emptyCartSection) DOM.emptyCartSection.style.display = 'none';
            if (DOM.cartContentSection) DOM.cartContentSection.style.display = 'block';
            cart.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.classList.add('cart-item');
                cartItemDiv.dataset.itemKey = getItemKey(item);
                const sizeText = item.size ? `${D().cevir('s.beden')}${item.size}` : '';
                const colorText = yerelRenk(item) ? `${D().cevir('s.renk')}${yerelRenk(item)}` : '';
                const imageHtml = item.image
                    ? `<img src="${item.image}" alt="${yerelAd(item)}" class="cart-item-image" onerror="gorselWebpYedekSepet(this)">`
                    : `<div class="cart-item-image cart-image-placeholder"><svg class="icon" aria-hidden="true"><use href="#icon-tshirt"></use></svg></div>`;
                cartItemDiv.innerHTML = `
                    ${imageHtml}
                    <div class="item-details">
                        <h3>${yerelAd(item)}</h3>
                        ${sizeText ? `<p>${sizeText}</p>` : ''}
                        ${colorText ? `<p>${colorText}</p>` : ''}
                        <div class="quantity-controls">
                            <button class="decrease-quantity-btn" data-item-key="${getItemKey(item)}">-</button>
                            <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-item-key="${getItemKey(item)}" aria-label="${D().cevir('u.adet')}">
                            <button class="increase-quantity-btn" data-item-key="${getItemKey(item)}">+</button>
                        </div>
                        <button class="remove-item-btn" data-item-key="${getItemKey(item)}"><svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg></button>
                    </div>
                `;
                DOM.cartItemsContainer.appendChild(cartItemDiv);
            });
        }
        updateCartCountDisplays();
    }

    // --- 4. Sepet Eylem Fonksiyonları ---
    function updateQuantity(itemKey, change) {
        let cart = getCartItems();
        const itemIndex = cart.findIndex(item => getItemKey(item) === itemKey);
        if (itemIndex > -1) {
            cart[itemIndex].quantity += change;
            if (cart[itemIndex].quantity <= 0) {
                removeFromCart(itemKey);
                return;
            }
            saveCartItems(cart);
            renderCart();
        }
    }

    function setQuantity(itemKey, value) {
        let cart = getCartItems();
        const itemIndex = cart.findIndex(item => getItemKey(item) === itemKey);
        if (itemIndex > -1) {
            let newQuantity = parseInt(value, 10);
            if (isNaN(newQuantity) || newQuantity < 1) newQuantity = 1;
            cart[itemIndex].quantity = newQuantity;
            saveCartItems(cart);
            renderCart();
        }
    }

    function removeFromCart(itemKey) {
        let cart = getCartItems();
        cart = cart.filter(item => getItemKey(item) !== itemKey);
        saveCartItems(cart);
        renderCart();
    }

    // --- 5. Olay Yöneticileri ---
    function handleCartControlsClick(event) {
        const target = event.target;
        const button = target.closest('button[data-item-key]');
        if (!button) return;
        const itemKey = button.dataset.itemKey;
        if (button.classList.contains('increase-quantity-btn')) {
            updateQuantity(itemKey, 1);
        } else if (button.classList.contains('decrease-quantity-btn')) {
            updateQuantity(itemKey, -1);
        } else if (button.classList.contains('remove-item-btn')) {
            if (confirm(D().cevir('s.silOnay'))) {
                removeFromCart(itemKey);
            }
        }
    }

    function handleCartControlsInput(event) {
        const input = event.target.closest('input.item-quantity');
        if (!input) return;
        const itemKey = input.dataset.itemKey;
        if (input.value === '') return;
        setQuantity(itemKey, input.value);
    }

    function handleCheckoutWhatsapp() {
        const d = D();
        const cart = getCartItems();
        if (cart.length === 0) {
            alert(d.cevir('s.siparisBos'));
            return;
        }
        if (!CONFIG.whatsappPhoneNumber) {
            alert(d.cevir('s.siparisYok'));
            return;
        }
        let whatsappMessage = `${d.cevir('s.wIntro')}\n\n`;
        whatsappMessage += `${d.cevir('s.wUrunler')}\n`;
        cart.forEach((item, index) => {
            const sizeText = item.size ? `, ${d.cevir('s.beden')}${item.size}` : '';
            const colorText = yerelRenk(item) ? `, ${d.cevir('s.renk')}${yerelRenk(item)}` : '';
            whatsappMessage += `${index + 1}. ${yerelAd(item)}${sizeText}${colorText} (x${item.quantity})\n`;
        });
        whatsappMessage += `${d.cevir('s.wAyirici')}\n`;
        whatsappMessage += d.cevir('s.wTeklif');
        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappLink = `https://wa.me/${CONFIG.whatsappPhoneNumber}?text=${encodedMessage}`;
        window.open(whatsappLink, '_blank');
        localStorage.removeItem('cart');
        updateCartCountDisplays();
        setTimeout(() => {
            window.location.href = 'tesekkurler.html';
        }, 500);
    }

    // --- 6. Başlatma ---
    function initializeCart() {
        renderCart();
        if (DOM.cartItemsContainer) {
            DOM.cartItemsContainer.addEventListener('click', handleCartControlsClick);
            DOM.cartItemsContainer.addEventListener('input', handleCartControlsInput);
        }
        if (DOM.checkoutWhatsappBtn) {
            DOM.checkoutWhatsappBtn.addEventListener('click', handleCheckoutWhatsapp);
        }
        window.DIL_DEGISTI_ISLEMLER = window.DIL_DEGISTI_ISLEMLER || [];
        window.DIL_DEGISTI_ISLEMLER.push(function () {
            renderCart();
        });
    }

    document.addEventListener('DOMContentLoaded', initializeCart);

})();
