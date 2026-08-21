import * as THREE from '/node_modules/three/build/three.module.js';

const CONFIG = {
  maxTextureSize: 512,
  radius: 7.5,
  tileWidth: 3.0,
  tileHeight: 3.9,
  camHeight: 1.0,
  camLookZ: -6,
  fov: 60,
  baseRotationSpeed: 0.0016,
  dragRotationSpeed: 0.006,
  rotationDecay: 0.95,
  parallaxStrength: 0.06,
  scrollRotationMultiplier: 0.0009,
  scrollRotationMax: 0.014,
  scrollSmoothing: 0.05,
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uCameraPosition;
  varying vec2 vUv;
  varying vec3 vWorldPosition;
  void main() {
    vec4 tex = texture2D(uMap, vUv);
    if (tex.a < 0.02) discard;

    vec2 centered = vUv - 0.5;
    float aspect = 0.9;
    vec2 c = vec2(centered.x, centered.y * aspect);
    float edge = 1.0 - smoothstep(0.36, 0.74, length(c));
    edge = mix(0.72, 1.0, edge);

    float luma = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 color = mix(vec3(luma * 0.86), tex.rgb, 0.85);

    float glow = pow(1.0 - smoothstep(0.4, 2.4, length(vWorldPosition.xz - uCameraPosition.xz)), 2.0) * 0.5;
    color = mix(color, vec3(1.0, 0.55, 0.15), glow * 0.35);

    float distFade = 1.0 - smoothstep(4.0, 16.0, length(vWorldPosition - uCameraPosition));
    float alpha = tex.a * edge * (0.45 + 0.55 * distFade);
    gl_FragColor = vec4(color * edge, alpha);
  }
`;

const state = {
  width: 0,
  height: 0,
  rotation: 0,
  velocity: 0,
  targetTiltX: 0,
  targetTiltY: 0,
  currentTiltX: 0,
  currentTiltY: 0,
  pointerDown: false,
  lastX: 0,
  hovered: null,
  running: false,
  scrollY: 0,
  lastScrollY: 0,
  scrollTarget: 0,
};

let scene, camera, renderer, ring, tiles, raycaster, tooltipEl;
const _world = new THREE.Vector3();
const _proj = new THREE.Vector3();

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
          return resolve(resizedTexture);
        }
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
        resolve(texture);
      },
      undefined,
      () => resolve(createFallbackTexture())
    );
  });
}

function uniqueGroups(products) {
  const seen = new Set();
  const unique = [];
  products.forEach((p) => {
    if (p.images && p.images.length > 0 && !seen.has(p.grupId || p.id)) {
      seen.add(p.grupId || p.id);
      unique.push(p);
    }
  });
  return unique;
}

function initGalleryMount() {
  const sceneEl = document.getElementById('galeri-3d-scene');
  if (!sceneEl) return null;
  return sceneEl;
}

function buildRing(items, loader) {
  ring = new THREE.Group();
  tiles = [];

  const logoItem = {
    id: null,
    name: 'Destan Tekstil',
    images: ['img/Destan_Tekstil_Logo_Transparan.png'],
  };
  const ringItems = intersperseLogo(items, logoItem, 3);

  ringItems.forEach((product, i) => {
    const geometry = new THREE.PlaneGeometry(CONFIG.tileWidth, CONFIG.tileHeight, 12, 16);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uMap: { value: createFallbackTexture() },
        uCameraPosition: { value: camera.position },
      },
      side: THREE.DoubleSide,
      transparent: true,
    });

    const tile = new THREE.Mesh(geometry, material);
    tile.userData = { product, baseScale: 1, targetScale: 1 };
    tiles.push(tile);
    ring.add(tile);
  });

  loadTextureNearIdle(loader, ringItems);
  return ring;
}

function intersperseLogo(items, logoItem, step) {
  const out = [];
  items.forEach((item, i) => {
    out.push(item);
    if ((i + 1) % step === 0) out.push(logoItem);
  });
  return out;
}

async function loadTextureNearIdle(loader, items) {
  const loads = items.map((item) => loadTexture(loader, item.images[0], renderer));
  const results = await Promise.allSettled(loads);
  results.forEach((result, i) => {
    const mat = tiles[i] && tiles[i].material;
    if (result.status === 'fulfilled' && mat && !mat.disposed) {
      mat.uniforms.uMap.value.dispose();
      mat.uniforms.uMap.value = result.value;
    }
  });
}

function layoutRing() {
  const n = tiles.length;
  for (let i = 0; i < n; i++) {
    const angle = (i / n) * Math.PI * 2;
    const tile = tiles[i];
    tile.position.set(
      Math.sin(angle) * CONFIG.radius,
      0,
      Math.cos(angle) * CONFIG.radius
    );
    tile.rotation.y = angle + Math.PI;
  }
}

function updateSize() {
  const mount = initGalleryMount();
  if (!mount || !renderer) return;
  state.width = mount.clientWidth;
  state.height = mount.clientHeight;
  if (!state.width || !state.height) return;

  camera.aspect = state.width / state.height;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(state.width, state.height);
}

function setupInteraction(mount) {
  raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  function setPointer(e) {
    const rect = mount.getBoundingClientRect();
    pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    return pointer;
  }

  mount.addEventListener('pointerdown', (e) => {
    state.pointerDown = true;
    state.lastX = e.clientX;
    state.velocity = 0;
    mount.setPointerCapture(e.pointerId);
  });

  mount.addEventListener('pointermove', (e) => {
    setPointer(e);
    if (state.pointerDown) {
      const dx = e.clientX - state.lastX;
      state.rotation += dx * CONFIG.dragRotationSpeed;
      state.velocity = dx * CONFIG.dragRotationSpeed;
      state.lastX = e.clientX;
      return;
    }

    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    state.targetTiltY = nx * CONFIG.parallaxStrength;
    state.targetTiltX = ny * CONFIG.parallaxStrength;

    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(tiles, false);
    const hit = hits[0];
    const prevHover = state.hovered;

    if (hit && hit.object) {
      state.hovered = hit.object;
      mount.style.cursor = 'pointer';
    } else {
      state.hovered = null;
      mount.style.cursor = 'grab';
    }

    if (prevHover !== state.hovered) {
      if (state.hovered) {
        const p = state.hovered.userData.product;
        const pos = projectTilePosition(state.hovered);
        showTooltip(p.name, p.price, pos.x, pos.y);
      } else {
        hideTooltip();
      }
    } else if (state.hovered) {
      const pos = projectTilePosition(state.hovered);
      showTooltip(
        state.hovered.userData.product.name,
        state.hovered.userData.product.price,
        pos.x,
        pos.y
      );
    }
  });

  mount.addEventListener('pointerup', (e) => {
    state.pointerDown = false;
    mount.style.cursor = state.hovered ? 'pointer' : 'grab';
  });

  mount.addEventListener('click', (e) => {
    if (Math.abs(state.velocity) > 0.005) return;
    setPointer(e);
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(tiles, false);
    if (hits[0] && hits[0].object) {
      const product = hits[0].object.userData.product;
      if (product && product.id) {
        window.location.href = `urun.html?id=${encodeURIComponent(product.id)}`;
      }
    }
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches) {
    CONFIG.baseRotationSpeed = 0;
  }
}

function projectTilePosition(tile) {
  const mount = initGalleryMount();
  if (!mount || !camera) return { x: 0, y: 0 };
  tile.getWorldPosition(_world);
  _proj.copy(_world).project(camera);
  const rect = mount.getBoundingClientRect();
  return {
    x: (_proj.x * 0.5 + 0.5) * rect.width,
    y: (-_proj.y * 0.5 + 0.5) * rect.height,
  };
}

function showTooltip(name, price, x, y) {
  if (!tooltipEl) return;
  tooltipEl.innerHTML = `<span class="galeri-3d-tip-name">${name}</span><span class="galeri-3d-tip-price">${price ? price.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' }) : 'Destan Tekstil'}</span>`;
  tooltipEl.classList.add('visible');
  if (typeof x === 'number' && typeof y === 'number') {
    tooltipEl.style.left = `${x}px`;
    tooltipEl.style.top = `${y}px`;
    tooltipEl.style.bottom = 'auto';
    tooltipEl.style.transform = 'translate(-50%, calc(-100% - 18px))';
  }
}

function hideTooltip() {
  if (tooltipEl) tooltipEl.classList.remove('visible');
}

function resizeObserver() {
  if (typeof ResizeObserver === 'undefined') {
    window.addEventListener('resize', updateSize);
    return;
  }
  const mount = initGalleryMount();
  if (mount) {
    const ro = new ResizeObserver(updateSize);
    ro.observe(mount);
  }
}

function startRenderLoop() {
  function tick() {
    updateTiles();
    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
}

function updateTiles() {
  state.velocity *= CONFIG.rotationDecay;
  state.rotation += CONFIG.baseRotationSpeed + state.velocity;

  state.velocity += (state.scrollTarget - state.velocity) * CONFIG.scrollSmoothing;
  state.scrollTarget *= 0.92;

  if (ring) ring.rotation.y = state.rotation;

  state.currentTiltX += (state.targetTiltX - state.currentTiltX) * 0.06;
  state.currentTiltY += (state.targetTiltY - state.currentTiltY) * 0.06;
  if (camera) {
    camera.rotation.x = -state.currentTiltX;
    camera.rotation.y = state.currentTiltY;
  }

  tiles.forEach((tile) => {
    tile.userData.targetScale = tile === state.hovered ? 1.09 : 1;
    const s = tile.userData.targetScale;
    tile.scale.x += (s - tile.scale.x) * 0.12;
    tile.scale.y += (s - tile.scale.y) * 0.12;
    tile.scale.z += (s - tile.scale.z) * 0.12;
  });

  if (state.hovered && tooltipEl && tooltipEl.classList.contains('visible')) {
    const p = projectTilePosition(state.hovered);
    tooltipEl.style.left = `${p.x}px`;
    tooltipEl.style.top = `${p.y}px`;
    tooltipEl.style.transform = 'translate(-50%, calc(-100% - 18px))';
  }
}

function prefersStaticGrid() {
  if (window.innerWidth < 768) return true;
  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return true;
  if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4) return true;
  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory < 4) return true;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true;
  return false;
}

function staticGridItems(products) {
  const params = new URLSearchParams(window.location.search);
  const kategori = params.get('kategori');
  let source = products;
  if (kategori && kategori !== 'tumu') {
    source = products.filter((p) => p.category === kategori);
  }
  const unique = uniqueGroups(source);
  return unique.length >= 3 ? unique : source;
}

function renderStaticGrid(items, mount) {
  if (!mount) return;

  const section = mount.closest('#galeri-3d');
  if (section) {
    section.style.position = 'relative';
    section.style.height = 'auto';
    section.style.overflow = 'visible';
    const tip = section.querySelector('.galeri-3d-tip');
    if (tip) tip.style.display = 'none';
    const overlay = section.querySelector('.page-intro-overlay');
    if (overlay) {
      overlay.style.position = 'relative';
      overlay.style.inset = 'auto';
      overlay.style.justifyContent = 'flex-start';
      overlay.style.pointerEvents = 'none';
    }
  }

  mount.innerHTML = '';
  mount.style.overflow = 'visible';
  mount.style.touchAction = 'auto';
  mount.style.cursor = 'default';

  const cards = (Array.isArray(items) ? items : [])
    .map((product) => {
      const imageHtml =
        product.images && product.images.length > 0
          ? `<img src="${product.images[0]}" alt="${product.name}" class="product-image" loading="lazy" decoding="async" onerror="gorselWebpYedek(this)">`
          : `<div class="product-image product-image-placeholder"><svg class="icon" aria-hidden="true"><use href="#icon-tshirt"></use></svg><span>Ürün Görseli</span></div>`;
      return `
        <div class="product-card">
          <a href="urun.html?id=${encodeURIComponent(product.id)}">
            ${imageHtml}
            <div class="product-info">
              <h3 class="product-title">${product.name}</h3>
            </div>
          </a>
        </div>
      `;
    })
    .join('');

  const aktifKategori = new URLSearchParams(window.location.search).get('kategori') || 'tumu';
  const kategoriFiltre = document.createElement('div');
  kategoriFiltre.className = 'kategori-filtre';
  kategoriFiltre.style.position = 'relative';
  kategoriFiltre.style.zIndex = '3';
  kategoriFiltre.style.margin = 'clamp(32px, 5vh, 56px) 0 1.5rem';
  kategoriFiltre.style.padding = '0 var(--gutter, 20px)';
  kategoriFiltre.innerHTML = [
    ['tumu', 'Tümü'],
    ['onluk', 'Önlükler'],
    ['penuar', 'Penuarlar'],
    ['havlu', 'Havlular'],
    ['giyim', 'Giyim'],
  ]
    .map(
      ([kategori, label]) =>
        `<a href="${kategori === 'tumu' ? 'katalog.html' : `katalog.html?kategori=${kategori}`}" class="kategori-btn${kategori === aktifKategori ? ' aktif' : ''}" data-kategori="${kategori}">${label}</a>`
    )
    .join('');
  mount.insertBefore(kategoriFiltre, mount.firstChild);

  const stackFeatured = document.querySelector('.katalog-stack .featured');
  if (stackFeatured) stackFeatured.style.display = 'none';

  const grid = document.createElement('div');
  grid.className = 'products-grid';
  grid.style.position = 'relative';
  grid.style.zIndex = '2';
  grid.style.padding = 'clamp(48px, 8vh, 96px) var(--gutter, 20px)';
  grid.style.margin = '0 auto';
  grid.style.maxWidth = 'var(--max-width, 1480px)';
  grid.innerHTML = cards;
  mount.appendChild(grid);
}

function init() {
  const products = window.MARKA_PRODUCTS;
  const mount = document.getElementById('galeri-3d-scene');
  const section = document.getElementById('galeri-3d');

  // Mobil / düşük güçlü cihaz / azaltılmış animasyon tercihinde 3D yerine statik grid
  if (products && mount && section && prefersStaticGrid()) {
    renderStaticGrid(staticGridItems(products), mount);
    return;
  }

  if (!products || products.length < 3 || !mount || !section) {
    if (section) section.style.display = 'none';
    return;
  }

  const items = staticGridItems(products);
  if (items.length < 3) {
    section.style.display = 'none';
    return;
  }

  const canvas = document.createElement('canvas');
  mount.appendChild(canvas);

  try {
    renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
  } catch (err) {
    console.error('WebGL init failed:', err);
    canvas.remove();
    renderStaticGrid(staticGridItems(products), mount);
    return;
  }

  renderer.setClearColor(0, 0);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    CONFIG.fov,
    1,
    0.1,
    100
  );
  camera.position.set(0, CONFIG.camHeight, 0);
  camera.lookAt(0, 0, CONFIG.camLookZ);

  tooltipEl = mount.querySelector('.galeri-3d-tooltip');

  buildRing(items, new THREE.TextureLoader());
  layoutRing();
  scene.add(ring);

  updateSize();
  setupInteraction(mount);
  resizeObserver();

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        state.running = entry.isIntersecting;
      });
    },
    { threshold: 0.1 }
  );
  io.observe(mount);

  let scrollTick = 0;
  function onScroll() {
    scrollTick++;
    if (scrollTick % 3 !== 0) return;
    state.lastScrollY = state.scrollY;
    state.scrollY = window.scrollY || window.pageYOffset || 0;
    const delta = state.scrollY - state.lastScrollY;
    if (state.running) {
      const target = delta * CONFIG.scrollRotationMultiplier;
      const cap = CONFIG.scrollRotationMax;
      state.scrollTarget = Math.max(-cap, Math.min(cap, target));
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  state.scrollY = window.scrollY || 0;
  state.lastScrollY = state.scrollY;

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) state.running = false;
    else setRunningFromIO();
  });

  function setRunningFromIO() {
    const entry = io.takeRecords().find(() => true);
    if (entry) state.running = entry.isIntersecting;
  }

  startRenderLoop();
}

function scheduleIdle(callback) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: 2000 });
  } else {
    requestAnimationFrame(() => requestAnimationFrame(callback));
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    scheduleIdle(init);
  });
} else {
  scheduleIdle(init);
}