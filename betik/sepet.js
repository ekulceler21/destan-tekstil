(function() {
    // --- 1. Ayarlar ve DOM Seçiciler ---
    const DOM = {
        cartItemsContainer: document.getElementById('cart-items-container'),
        emptyCartSection: document.getElementById('empty-cart-section'),
        cartContentSection: document.getElementById('cart-content-section'),
        cartSubtotalSpan: document.getElementById('cart-subtotal'),
        cartTotalSpan: document.getElementById('cart-total'),
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

    function calculateCartTotals(cart) {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        return { subtotal, total: subtotal };
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
                const sizeText = item.size ? `Beden: ${item.size}` : '';
                const colorText = item.color ? `Renk: ${item.color}` : '';
                const imageHtml = item.image
                    ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image" onerror="gorselWebpYedekSepet(this)">`
                    : `<div class="cart-item-image cart-image-placeholder"><svg class="icon" aria-hidden="true"><use href="#icon-tshirt"></use></svg></div>`;
                cartItemDiv.innerHTML = `
                    ${imageHtml}
                    <div class="item-details">
                        <h3>${item.name}</h3>
                        ${sizeText ? `<p>${sizeText}</p>` : ''}
                        ${colorText ? `<p>${colorText}</p>` : ''}
                        <p class="item-price">₺ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</p>
                        <div class="quantity-controls">
                            <button class="decrease-quantity-btn" data-item-key="${getItemKey(item)}">-</button>
                            <input type="number" class="item-quantity" value="${item.quantity}" min="1" data-item-key="${getItemKey(item)}" aria-label="Adet">
                            <button class="increase-quantity-btn" data-item-key="${getItemKey(item)}">+</button>
                        </div>
                        <button class="remove-item-btn" data-item-key="${getItemKey(item)}"><svg class="icon" aria-hidden="true"><use href="#icon-trash"></use></svg></button>
                    </div>
                `;
                DOM.cartItemsContainer.appendChild(cartItemDiv);
            });
            const { subtotal, total } = calculateCartTotals(cart);
            if (DOM.cartSubtotalSpan) DOM.cartSubtotalSpan.textContent = `₺ ${subtotal.toFixed(2).replace('.', ',')}`;
            if (DOM.cartTotalSpan) DOM.cartTotalSpan.textContent = `₺ ${total.toFixed(2).replace('.', ',')}`;
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
            if (confirm('Bu ürünü sepetten kaldırmak istediğinize emin misiniz?')) {
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
        const cart = getCartItems();
        if (cart.length === 0) {
            alert('Sepetiniz boş. Siparişi tamamlamadan önce ürün ekleyin.');
            return;
        }
        if (!CONFIG.whatsappPhoneNumber) {
            alert('Şu anda WhatsApp siparişi alınamıyor. Telefon numarası henüz tanımlanmadı.');
            return;
        }
        const { total } = calculateCartTotals(cart);
        let whatsappMessage = `Merhaba! Destan Tekstil'den sipariş vermek istiyorum.\n\n`;
        whatsappMessage += `--- Ürünlerim ---\n`;
        cart.forEach((item, index) => {
            const sizeText = item.size ? `, Beden: ${item.size}` : '';
            const colorText = item.color ? `, Renk: ${item.color}` : '';
            whatsappMessage += `${index + 1}. ${item.name}${sizeText}${colorText} (x${item.quantity}) - ₺ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
        });
        whatsappMessage += `-------------------\n`;
        whatsappMessage += `*Sipariş Toplamı: ₺ ${total.toFixed(2).replace('.', ',')}*\n\n`;
        whatsappMessage += `Lütfen siparişi tamamlamama yardımcı olur musunuz?`;
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
    }

    document.addEventListener('DOMContentLoaded', initializeCart);

})();
