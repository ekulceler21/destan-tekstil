import Lenis from '/node_modules/lenis/dist/lenis.mjs';

const lenis = new Lenis({
  duration: 1.4,
  smoothWheel: true,
  smoothTouch: false,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

document.querySelectorAll('a[href*="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const raw = link.getAttribute('href');
    const hashIndex = raw.indexOf('#');
    if (hashIndex < 0) return;
    const pagePart = raw.slice(0, hashIndex);
    const page = window.location.pathname.split('/').pop();
    if (pagePart && pagePart !== page && !(pagePart === 'index.html' && page === '')) {
      return;
    }
    const target = document.querySelector(raw.slice(hashIndex));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: 0 });
  });
});