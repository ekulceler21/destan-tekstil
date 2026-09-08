(function () {
    'use strict';

    function kurFab() {
        const contactBar = document.querySelector('.contact-bar');
        if (!contactBar) return;

        let sonScrollY = window.scrollY;
        let gizli = false;
        let animasyon = null;

        const uyarla = () => {
            animasyon = null;
            const y = window.scrollY;
            const delta = y - sonScrollY;
            sonScrollY = y;
            if (Math.abs(delta) < 4) return;
            const asagi = delta > 0 && y > 90;
            if (asagi && !gizli) {
                gizli = true;
                contactBar.classList.add('is-hidden');
            } else if (!asagi && gizli) {
                gizli = false;
                contactBar.classList.remove('is-hidden');
            }
        };

        const tetikle = () => {
            if (animasyon === null) animasyon = requestAnimationFrame(uyarla);
        };

        window.addEventListener('scroll', tetikle, { passive: true });
        window.addEventListener('resize', tetikle, { passive: true });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', kurFab);
    } else {
        kurFab();
    }
})();