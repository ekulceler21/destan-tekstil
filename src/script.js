import * as THREE from 'three';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { vertexShader, fragmentShader } from './shaders.js';

const CONFIG = {
  images: [
    'img/Destan_Tekstil_Logo_Transparan.png',
    'img/penuar-sac-kesim-penuari-siyah.webp',
    'img/onluk-siyah.webp',
    'img/Destan_Tekstil_Logo_Transparan.png',
    'img/giyim-polar-ceket-siyah.webp',
    'img/penuar-sac-kesim-penuari-gold.webp',
    'img/Destan_Tekstil_Logo_Transparan.png',
    'img/onluk-pembe.webp',
    'img/giyim-calisma-yelegi-siyah.webp',
    'img/Destan_Tekstil_Logo_Transparan.png',
    'img/havlu-30x50-renk-secenekleri.webp',
    'img/giyim-estetisyen-formasi-beyaz.webp',
    'img/Destan_Tekstil_Logo_Transparan.png',
    'img/giyim-boya-kimonosu.webp',
    'img/havlu-lazer-epilasyon-antrasit.webp'
  ],
  maxTextureSize: 1024,
  tilesPerRevolution: 15,
  revolutions: 5,
  startRadius: 5,
  endRadius: 3.5,
  tileHeightRatio: 1.1,
  tileSegments: 24,
  spiralGap: 0.35,
  tileOverlap: 0.005,
  cameraZ: 12,
  cameraSmoothing: 0.075,
  baseRotationSpeed: 0.001,
  scrollRotationMultiplier: 0.0035,
  rotationDecay: 0.9,
  scrollMultiplier: 1.25,
  cameraYMultiplier: 0.2,
  parallaxStrength: 0.1,
  spiralOffsetY: -2.0,
};

gsap.registerPlugin(ScrollTrigger);

const state = {
  isMobile: window.innerWidth < 768,
  width: 0,
  height: 0,
  scrollProgress: 0,
  scrollVelocity: 0,
  spinVelocity: 0,
  targetCameraY: 0,
  currentCameraY: 0,
  mouseX: 0,
  mouseY: 0,
  targetTiltX: 0,
  targetTiltZ: 0,
  currentTiltX: 0,
  currentTiltZ: 0,
};

const hero = document.querySelector('.hero');
if (!hero) throw new Error('.hero section not found');

function createCurvedTileGeometry(radius, arcAngle, tileHeight, segments) {
  const geometry = new THREE.BufferGeometry();
  const vertices = [];
  const uvs = [];
  const indices = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const theta = t * arcAngle;
    const x = Math.sin(theta) * radius;
    const z = Math.cos(theta) * radius;

    vertices.push(x, tileHeight / 2, z);
    uvs.push(t, 1);

    vertices.push(x, -tileHeight / 2, z);
    uvs.push(t, 0);
  }

  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;

    indices.push(a, b, c);
    indices.push(b, d, c);
  }

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  return geometry;
}

function createFallbackTexture() {
  const data = new Uint8Array([255, 124, 26, 255]);
  const texture = new THREE.DataTexture(data, 1, 1);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function loadTexture(loader, path, renderer) {
  return new Promise((resolve) => {
    loader.load(
      path,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;

        const maxSize = CONFIG.maxTextureSize;
        const longest = Math.max(texture.image.width, texture.image.height);
        if (longest > maxSize) {
          const scale = maxSize / longest;
          const width = Math.max(1, Math.round(texture.image.width * scale));
          const height = Math.max(1, Math.round(texture.image.height * scale));
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(texture.image, 0, 0, width, height);
          const resizedTexture = new THREE.CanvasTexture(canvas);
          resizedTexture.colorSpace = THREE.SRGBColorSpace;
          resizedTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
          resizedTexture.minFilter = THREE.LinearMipmapLinearFilter;
          resizedTexture.magFilter = THREE.LinearFilter;
          resizedTexture.generateMipmaps = true;
          return resolve(resizedTexture);
        }

        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = true;
        resolve(texture);
      },
      undefined,
      () => resolve(createFallbackTexture())
    );
  });
}

function scheduleIdle(callback) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 1500 });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(callback));
  }
}

function initLenis() {
  const lenis = new Lenis({
    duration: 1.2,
    smoothWheel: true,
    smoothTouch: false,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  lenis.on('scroll', ({ scroll, limit, velocity }) => {
    state.scrollProgress = Math.min(scroll / Math.max(limit, 1), 1);
    state.scrollVelocity = velocity;
    state.spinVelocity +=
      velocity * CONFIG.scrollRotationMultiplier * CONFIG.scrollMultiplier;
    ScrollTrigger.update();
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
      const hash = raw.slice(hashIndex);
      const page = window.location.pathname.split('/').pop();
      if (pagePart && pagePart !== page && !(pagePart === 'index.html' && page === '')) {
        return;
      }
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: 0 });
    });
  });

  return lenis;
}

function initScrollReveals() {
  const ctx = gsap.context(() => {
    gsap.utils.toArray('.reveal-text').forEach((el) => {
      gsap.fromTo(
        el,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            toggleActions: 'play none none none',
            once: true,
          },
        }
      );
    });
  });

  if (import.meta.hot) {
    import.meta.hot.dispose(() => ctx.revert());
  }

  window.addEventListener('load', () => ScrollTrigger.refresh());
}

function updateDimensions() {
  state.isMobile = window.innerWidth < 768;
  state.width = hero.clientWidth;
  state.height = hero.clientHeight;
}

let scene;
let camera;
let renderer;
let spiral;
let canvasEl;

function handleResize() {
  updateDimensions();

  if (!camera || !renderer) return;

  camera.aspect = state.width / state.height;
  camera.updateProjectionMatrix();
  camera.position.z = CONFIG.cameraZ + (state.isMobile ? 3 : 0);

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(state.width, state.height);

  if (state.isMobile) {
    state.targetTiltX = 0;
    state.targetTiltZ = 0;
  }
}

async function initWebGL() {
  updateDimensions();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, state.width / state.height, 0.1, 100);
  camera.position.set(0, 0, CONFIG.cameraZ + (state.isMobile ? 3 : 0));

  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0, 0);
  renderer.setSize(state.width, state.height);

  canvasEl = renderer.domElement;
  canvasEl.classList.add('hero__canvas');
  hero.appendChild(canvasEl);

  const loader = new THREE.TextureLoader();
  const texturePromises = CONFIG.images.map((path) =>
    loadTexture(loader, path, renderer)
  );
  const textures = await Promise.all(texturePromises);

  canvasEl.style.opacity = '1';

  spiral = new THREE.Group();

  const totalTiles = CONFIG.tilesPerRevolution * CONFIG.revolutions;
  const angleStep = (Math.PI * 2) / CONFIG.tilesPerRevolution;
  const arcAngle = angleStep + CONFIG.tileOverlap;
  const chord = 2 * CONFIG.startRadius * Math.sin(angleStep / 2);
  const tileHeight = chord * CONFIG.tileHeightRatio;
  const totalHeight = (totalTiles - 1) * CONFIG.spiralGap;
  const startY = totalHeight / 2;

  for (let i = 0; i < totalTiles; i++) {
    const t = i / Math.max(totalTiles - 1, 1);
    const radius = THREE.MathUtils.lerp(CONFIG.startRadius, CONFIG.endRadius, t);
    const geometry = createCurvedTileGeometry(
      radius,
      arcAngle,
      tileHeight,
      CONFIG.tileSegments
    );
    const texture = textures[i % CONFIG.images.length];

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMap: { value: texture },
        uCameraPosition: { value: camera.position },
      },
      side: THREE.DoubleSide,
      transparent: true,
    });

    const tile = new THREE.Mesh(geometry, material);
    tile.position.y = startY - i * CONFIG.spiralGap;
    tile.rotation.y = i * angleStep;
    spiral.add(tile);
  }

  spiral.position.y = CONFIG.spiralOffsetY;
  scene.add(spiral);

  window.addEventListener('mousemove', (e) => {
    if (state.isMobile) return;
    state.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    state.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    state.targetTiltX = state.mouseY * CONFIG.parallaxStrength;
    state.targetTiltZ = state.mouseX * CONFIG.parallaxStrength * -0.5;
  });

  window.addEventListener('resize', handleResize);

  function tick() {
    spiral.rotation.y += CONFIG.baseRotationSpeed + state.spinVelocity;
    state.spinVelocity *= CONFIG.rotationDecay;

    if (!state.isMobile) {
      state.currentTiltX +=
        (state.targetTiltX - state.currentTiltX) * CONFIG.cameraSmoothing;
      state.currentTiltZ +=
        (state.targetTiltZ - state.currentTiltZ) * CONFIG.cameraSmoothing;
      spiral.rotation.x = state.currentTiltX;
      spiral.rotation.z = state.currentTiltZ;
    }

    state.targetCameraY =
      -state.scrollProgress * CONFIG.cameraYMultiplier * 10;
    state.currentCameraY +=
      (state.targetCameraY - state.currentCameraY) * CONFIG.cameraSmoothing;
    camera.position.y = state.currentCameraY;
    camera.lookAt(0, state.currentCameraY * 0.4, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
}

initLenis();
initScrollReveals();

function initSiteNav() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach((el) => (el.textContent = totalItems));
  document.querySelectorAll('.cart-count-mobile').forEach((el) => (el.textContent = totalItems));

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
    document.addEventListener('click', (event) => {
      if (
        mobileMenu.classList.contains('active') &&
        !mobileMenu.contains(event.target) &&
        !mobileMenuBtn.contains(event.target)
      ) {
        mobileMenu.classList.remove('active');
        setMenuIcon(false);
      }
    });
  }
}

initSiteNav();

scheduleIdle(() => {
  initWebGL().catch((err) => {
    console.error('WebGL init failed:', err);
  });
});

handleResize();
