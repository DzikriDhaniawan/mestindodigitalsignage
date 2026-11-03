/**
 * DIGITAL SIGNAGE INTERACTIVE KIOSK
 * Clean, lightweight, zero-dependency engine.
 */

// State Management
let currentView = 'home'; // 'home' (Landing Page 3 Opsi) | 'about-us' | 'galleries' | 'catalog'
let currentCategory = 'all';
let searchQuery = '';
let focusedCardIndex = 0;
let focusedPortalCardIndex = 0;
let isPlayerActive = false;
let idleTimer = null;
const IDLE_TIMEOUT_MS = 5 * 60 * 1000; // 5 menit idle (kembali ke Menu Utama)

// Loop Modes: 'single' (1 video) | 'folder' (semua video di folder ini) | 'none' (sekali putar)
let currentLoopMode = 'single';
let currentPlayingVideo = null;

// Portal View Elements
const portalLandingView = document.getElementById('portal-landing-view');
const portalVideosView = document.getElementById('portal-videos-view');
const portalCatalogView = document.getElementById('portal-catalog-view');
const portalNavBtns = document.querySelectorAll('.portal-nav-btn');
const videosViewTitle = document.getElementById('videos-view-title');
const videosBackBtn = document.getElementById('videos-back-btn');
const catalogBackBtn = document.getElementById('catalog-back-btn');

const cardOptionAboutUs = document.getElementById('card-option-about-us');
const cardOptionGalleries = document.getElementById('card-option-galleries');
const cardOptionCatalog = document.getElementById('card-option-catalog');
const portalBadgeAbout = document.getElementById('portal-badge-about');
const portalBadgeGalleries = document.getElementById('portal-badge-galleries');

// Standard App Elements
const clockTimeEl = document.getElementById('clock-time');
const clockDateEl = document.getElementById('clock-date');
const categoryChipsEl = document.getElementById('category-chips');
const videoGridEl = document.getElementById('video-grid');
const videoCountBadgeEl = document.getElementById('video-count-badge');
const searchInputEl = document.getElementById('search-input');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const refreshBtn = document.getElementById('refresh-btn');
const loopFolderActionBtn = document.getElementById('loop-folder-action-btn');
const loopFolderBtnText = document.getElementById('loop-folder-btn-text');

// Player Modal Elements
const playerModalEl = document.getElementById('player-modal');
const mainVideoEl = document.getElementById('main-video');
const mainIframeEl = document.getElementById('main-iframe');
const playerBackBtn = document.getElementById('player-back-btn');
const playerTitleEl = document.getElementById('player-title');
const playerCategoryEl = document.getElementById('player-category');
const playerLoopBtn = document.getElementById('player-loop-btn');
const playerLoopIcon = document.getElementById('player-loop-icon');
const playerLoopLabel = document.getElementById('player-loop-label');
const playerPrevBtn = document.getElementById('player-prev-btn');
const playerNextBtn = document.getElementById('player-next-btn');
const centerPlayBtn = document.getElementById('player-center-play-btn');
const playerProgressContainer = document.getElementById('player-progress-container');
const playerProgressBar = document.getElementById('player-progress-bar');

/* Helper: Deteksi dan Ambil File ID Google Drive jika ada (mendukung URL penuh, raw ID, atau objek video) */
function getGoogleDriveId(input) {
  if (!input) return null;
  if (typeof input === 'object') {
    return getGoogleDriveId(input.driveId) || getGoogleDriveId(input.driveUrl) || getGoogleDriveId(input.file);
  }
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
                trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) return match[1];
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/* ==========================================================================
   1. REAL-TIME CLOCK & DATE (Indonesian Format)
   ========================================================================== */
function updateClock() {
  if (!clockTimeEl && !clockDateEl) return;
  const now = new Date();
  
  // Format Waktu: HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  if (clockTimeEl) {
    clockTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
  }

  // Format Tanggal
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  if (clockDateEl) {
    clockDateEl.textContent = now.toLocaleDateString('id-ID', options);
  }
}
if (clockTimeEl || clockDateEl) {
  setInterval(updateClock, 1000);
  updateClock();
}

/* ==========================================================================
   2. SECTION & CATEGORY CLASSIFICATION
   ========================================================================== */
const ABOUT_KEYWORDS = ['about', 'profil', 'profile', 'branding', 'factory', 'visit', 'logo', 'mapping', 'anniversary', 'standard', 'quality'];
const GALLERY_KEYWORDS = ['galler', 'galeri', 'mesticote', 'agronomist', 'sawit', 'spreader', 'boron', 'gambut', 'ganoderma', 'pasti', 'top', 'super'];

function isAboutUsVideo(v) {
  const cat = (v.category || '').toLowerCase();
  if (cat.includes('about') || cat.includes('profil')) return true;
  if (cat.includes('galler') || cat.includes('galeri')) return false;
  const title = (v.title || '').toLowerCase();
  const file = (v.file || '').toLowerCase();
  return ABOUT_KEYWORDS.some(k => title.includes(k) || file.includes(k));
}

function isGalleriesVideo(v) {
  const cat = (v.category || '').toLowerCase();
  if (cat.includes('galler') || cat.includes('galeri')) return true;
  if (cat.includes('about') || cat.includes('profil')) return false;
  const title = (v.title || '').toLowerCase();
  const file = (v.file || '').toLowerCase();
  return GALLERY_KEYWORDS.some(k => title.includes(k) || file.includes(k));
}

function getSectionVideos(section) {
  const all = (typeof LOCAL_VIDEOS !== 'undefined') ? LOCAL_VIDEOS : [];
  if (section === 'about-us') {
    const direct = all.filter(v => v.section === 'about-us' || (v.category || '').toLowerCase().includes('about') || (v.category || '').toLowerCase().includes('profil'));
    if (direct.length > 0) return direct;
    const kw = all.filter(isAboutUsVideo);
    return kw.length > 0 ? kw : all;
  }
  if (section === 'galleries') {
    const direct = all.filter(v => v.section === 'galleries' || (v.category || '').toLowerCase().includes('galler') || (v.category || '').toLowerCase().includes('galeri'));
    if (direct.length > 0) return direct;
    const kw = all.filter(isGalleriesVideo);
    return kw.length > 0 ? kw : all;
  }
  return all;
}

function getUniqueCategories(videos) {
  const cats = new Set();
  videos.forEach(v => {
    if (v.category && v.category.trim() !== '') {
      cats.add(v.category.trim());
    }
  });
  return Array.from(cats);
}

function renderCategories() {
  if (!categoryChipsEl) return;
  const sectionVideos = getSectionVideos(currentView);
  const categories = getUniqueCategories(sectionVideos);

  categoryChipsEl.innerHTML = '';

  // Jika kategori folder hanya 1 (misal semua 'About Us'), tidak perlu menampilkan filter chip berlebih
  if (categories.length <= 1) {
    categoryChipsEl.style.display = 'none';
    return;
  }
  categoryChipsEl.style.display = 'flex';

  // "Semua Video" Button
  const allBtn = document.createElement('button');
  allBtn.className = `chip-btn ${currentCategory === 'all' ? 'active' : ''}`;
  allBtn.innerHTML = `<span>Semua Video</span><span class="chip-count">${sectionVideos.length}</span>`;
  allBtn.onclick = () => selectCategory('all');
  categoryChipsEl.appendChild(allBtn);

  // Each Category / Folder
  categories.forEach(cat => {
    const count = sectionVideos.filter(v => v.category === cat).length;
    const btn = document.createElement('button');
    btn.className = `chip-btn ${currentCategory === cat ? 'active' : ''}`;
    btn.innerHTML = `<span>${cat}</span><span class="chip-count">${count}</span>`;
    btn.onclick = () => selectCategory(cat);
    categoryChipsEl.appendChild(btn);
  });
}

function selectCategory(cat) {
  currentCategory = cat;
  renderCategories();
  renderVideoGrid();

  if (loopFolderActionBtn && loopFolderBtnText) {
    if (cat !== 'all') {
      loopFolderBtnText.textContent = `Putar Berurutan (${cat})`;
    } else {
      loopFolderBtnText.textContent = 'Putar Berurutan (Semua)';
    }
  }
}

if (loopFolderActionBtn) {
  loopFolderActionBtn.onclick = () => {
    const videos = getFilteredVideos();
    if (videos.length > 0) {
      currentLoopMode = 'folder';
      playVideo(videos[0]);
    }
  };
}

/* ==========================================================================
   3. PORTAL NAVIGATION ENGINE (SWITCH BETWEEN HOME, ABOUT US, GALLERIES, CATALOG)
   ========================================================================== */
function updatePortalBadges() {
  const aboutVideos = getSectionVideos('about-us');
  const galleryVideos = getSectionVideos('galleries');
  if (portalBadgeAbout) {
    portalBadgeAbout.textContent = `${aboutVideos.length} Video`;
  }
  if (portalBadgeGalleries) {
    portalBadgeGalleries.textContent = `${galleryVideos.length} Video`;
  }
}

function switchView(viewName) {
  currentView = viewName;
  document.body.setAttribute('data-active-view', viewName);
  searchQuery = '';
  if (searchInputEl) searchInputEl.value = '';
  currentCategory = 'all';

  // Update navbar tab pills
  portalNavBtns.forEach(btn => {
    const target = btn.getAttribute('data-view');
    btn.classList.toggle('active', target === viewName);
  });

  if (viewName !== 'catalog') {
    if (typeof stopCatalogAutoFlip === 'function') stopCatalogAutoFlip();
    if (typeof toggleCatalogFullscreen === 'function' && document.body.classList.contains('catalog-fullscreen-active')) {
      toggleCatalogFullscreen(false);
    }
  }

  if (viewName === 'home') {
    if (portalLandingView) portalLandingView.style.display = 'flex';
    if (portalVideosView) portalVideosView.style.display = 'none';
    if (portalCatalogView) portalCatalogView.style.display = 'none';
    updatePortalBadges();
  } else if (viewName === 'about-us') {
    if (portalLandingView) portalLandingView.style.display = 'none';
    if (portalVideosView) portalVideosView.style.display = 'flex';
    if (portalCatalogView) portalCatalogView.style.display = 'none';
    if (videosViewTitle) videosViewTitle.textContent = 'About Us';
    if (loopFolderBtnText) loopFolderBtnText.textContent = 'Putar Semua';
    if (loopFolderActionBtn) loopFolderActionBtn.style.display = 'inline-flex';
    renderCategories();
    renderVideoGrid();
  } else if (viewName === 'galleries') {
    if (portalLandingView) portalLandingView.style.display = 'none';
    if (portalVideosView) portalVideosView.style.display = 'flex';
    if (portalCatalogView) portalCatalogView.style.display = 'none';
    if (videosViewTitle) videosViewTitle.textContent = 'Galleries';
    if (loopFolderBtnText) loopFolderBtnText.textContent = 'Putar Semua';
    if (loopFolderActionBtn) loopFolderActionBtn.style.display = 'inline-flex';
    renderCategories();
    renderVideoGrid();
  } else if (viewName === 'catalog') {
    if (portalLandingView) portalLandingView.style.display = 'none';
    if (portalVideosView) portalVideosView.style.display = 'none';
    if (portalCatalogView) portalCatalogView.style.display = 'flex';
    initCatalogBook();
    renderCatalogBook('none');
    setTimeout(fitBookSpread, 40);
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Attach Event Listeners to Nav Buttons & Cards
portalNavBtns.forEach(btn => {
  btn.onclick = () => {
    const target = btn.getAttribute('data-view');
    if (target) switchView(target);
  };
});

if (cardOptionAboutUs) {
  cardOptionAboutUs.onclick = () => switchView('about-us');
}
if (cardOptionGalleries) {
  cardOptionGalleries.onclick = () => switchView('galleries');
}
if (cardOptionCatalog) {
  cardOptionCatalog.onclick = () => switchView('catalog');
}

if (videosBackBtn) {
  videosBackBtn.onclick = () => switchView('home');
}
if (catalogBackBtn) {
  catalogBackBtn.onclick = () => {
    stopCatalogAutoFlip();
    if (document.body.classList.contains('catalog-fullscreen-active')) {
      toggleCatalogFullscreen(false);
    }
    switchView('home');
  };
}

/* ==========================================================================
   3B. INTERACTIVE DIGITAL LOOKBOOK & FLIPBOOK ENGINE (82 PAGES)
   ========================================================================== */
const CATALOG_TOTAL_PAGES = 82;
let catalogCurrentPage = 1;
let catalogUserManualSpread = false;

function shouldDefaultToTwoPages() {
  return window.innerWidth >= 860 && (window.innerWidth / Math.max(1, window.innerHeight)) >= 1.05;
}
let catalogSpreadMode = shouldDefaultToTwoPages();
let catalogAutoFlipInterval = null;
let catalogIsZoomed = false;
let catalogThumbsInitialized = false;
let slideshowDurationMs = 4000;

const catalogPageBadge = document.getElementById('catalog-page-badge');
const catalogSpreadToggleBtn = document.getElementById('catalog-spread-toggle-btn');
const catalogSpreadLabel = document.getElementById('catalog-spread-label');
const catalogAutoFlipBtn = document.getElementById('catalog-autoflip-btn');
const catalogAutoFlipLabel = document.getElementById('catalog-autoflip-label');
const catalogAutoFlipSvg = document.getElementById('catalog-autoflip-svg');
const catalogZoomBtn = document.getElementById('catalog-zoom-btn');
const catalogZoomLabel = document.getElementById('catalog-zoom-label');
const catalogFullscreenBtn = document.getElementById('catalog-fullscreen-btn');
const catalogFullscreenLabel = document.getElementById('catalog-fullscreen-label');
const catalogFullscreenSvg = document.getElementById('catalog-fullscreen-svg');

const catalogSlideshowHud = document.getElementById('catalog-slideshow-hud');
const catalogSlideshowProgress = document.getElementById('catalog-slideshow-progress');
const catalogProgressFill = document.getElementById('catalog-progress-fill');
const catalogSlideshowTag = document.getElementById('catalog-slideshow-tag');
const catalogSpeedBtn = document.getElementById('catalog-speed-btn');
const catalogHudStopBtn = document.getElementById('catalog-hud-stop-btn');

const dockExitFsBtn = document.getElementById('dock-exit-fs-btn');
const dockSlideshowFsBtn = document.getElementById('dock-slideshow-fs-btn');
const dockSlideshowFsSvg = document.getElementById('dock-slideshow-fs-svg');
const dockSlideshowFsLabel = document.getElementById('dock-slideshow-fs-label');
const dockSpreadFsBtn = document.getElementById('dock-spread-fs-btn');
const dockSpreadFsLabel = document.getElementById('dock-spread-fs-label');

const catalogBookStage = document.getElementById('catalog-book-stage');
const catalogBookSpread = document.getElementById('catalog-book-spread');
const catalogPageLeftWrap = document.getElementById('catalog-page-left-wrap');
const catalogPageRightWrap = document.getElementById('catalog-page-right-wrap');
const catalogPageLeftImg = document.getElementById('catalog-page-left');
const catalogPageRightImg = document.getElementById('catalog-page-right');
const catalogPageLeftNum = document.getElementById('catalog-page-left-num');
const catalogPageRightNum = document.getElementById('catalog-page-right-num');
const catalogBookSpine = document.getElementById('catalog-book-spine');
const catalogPrevBtn = document.getElementById('catalog-prev-btn');
const catalogNextBtn = document.getElementById('catalog-next-btn');
const catalogThumbsTrack = document.getElementById('catalog-thumbs-track');
const chapterChips = document.querySelectorAll('.catalog-toc-item');
const highlightCards = [];

function getCatalogPagePath(pageNum) {
  const safePage = Math.max(1, Math.min(CATALOG_TOTAL_PAGES, pageNum));
  return `assets/catalog-pages/page-${String(safePage).padStart(2, '0')}.jpg`;
}

function padPage(n) {
  return String(n).padStart(2, '0');
}

function syncResponsiveSpreadMode() {
  if (window.innerWidth < 680) {
    catalogSpreadMode = false;
  } else if (!catalogUserManualSpread) {
    catalogSpreadMode = shouldDefaultToTwoPages();
  }
  updateSpreadButtonUI();
}

function updateSpreadButtonUI() {
  if (catalogSpreadLabel) {
    catalogSpreadLabel.textContent = catalogSpreadMode ? '2 Halaman' : '1 Halaman';
  }
  if (catalogSpreadToggleBtn) {
    catalogSpreadToggleBtn.classList.toggle('active-mode', catalogSpreadMode);
  }
  if (dockSpreadFsLabel) {
    dockSpreadFsLabel.textContent = catalogSpreadMode ? '2 Hal' : '1 Hal';
  }
  if (dockSpreadFsBtn) {
    dockSpreadFsBtn.classList.toggle('active-mode', catalogSpreadMode);
  }
}

// Compute exact mathematical containment so the book fills the stage cleanly
function fitBookSpread() {
  if (!catalogBookStage || !catalogBookSpread) return;
  const stageRect = catalogBookStage.getBoundingClientRect();
  if (stageRect.width <= 0 || stageRect.height <= 0) return;

  const isFs = document.body.classList.contains('catalog-fullscreen-active');
  const isSlideshow = Boolean(catalogAutoFlipInterval);
  const isMobile = window.innerWidth <= 640;

  let padX, padY;
  if (isFs) {
    padX = isMobile ? 16 : 96;
    padY = isMobile ? 32 : 72;
  } else {
    padX = isMobile ? 16 : 86;
    padY = isSlideshow ? 78 : 38;
  }

  const availW = Math.max(100, stageRect.width - padX);
  const availH = Math.max(100, stageRect.height - padY);

  const showTwoPages = catalogSpreadMode && (catalogCurrentPage < CATALOG_TOTAL_PAGES);
  const ratio = showTwoPages ? (1800 / 1300) : (900 / 1300);

  let targetW, targetH;
  if ((availW / availH) > ratio) {
    targetH = availH;
    targetW = Math.round(availH * ratio);
  } else {
    targetW = availW;
    targetH = Math.round(availW / ratio);
  }

  catalogBookSpread.style.width = `${targetW}px`;
  catalogBookSpread.style.height = `${targetH}px`;
  catalogBookSpread.style.marginTop = (isSlideshow && !isFs) ? '8px' : '0px';
}

if (window.ResizeObserver && catalogBookStage) {
  const ro = new ResizeObserver(() => {
    fitBookSpread();
  });
  ro.observe(catalogBookStage);
}
window.addEventListener('resize', () => {
  const prevSpread = catalogSpreadMode;
  syncResponsiveSpreadMode();
  if (prevSpread !== catalogSpreadMode && currentView === 'catalog') {
    renderCatalogBook('none');
  } else {
    fitBookSpread();
  }
});

function initCatalogBook() {
  syncResponsiveSpreadMode();
  fitBookSpread();
  if (catalogThumbsInitialized || !catalogThumbsTrack) return;
  catalogThumbsInitialized = true;
  catalogThumbsTrack.innerHTML = '';

  for (let p = 1; p <= CATALOG_TOTAL_PAGES; p++) {
    const thumbBtn = document.createElement('button');
    thumbBtn.type = 'button';
    thumbBtn.className = 'catalog-thumb-item';
    thumbBtn.setAttribute('data-page', String(p));
    thumbBtn.innerHTML = `
      <img src="${getCatalogPagePath(p)}" alt="Hal ${p}" loading="lazy" draggable="false">
      <span class="catalog-thumb-num">${p}</span>
    `;
    thumbBtn.onclick = () => {
      stopCatalogAutoFlip();
      goToCatalogPage(p);
    };
    catalogThumbsTrack.appendChild(thumbBtn);
  }
}

function renderCatalogBook(animDirection = 'next') {
  if (!catalogBookSpread || !catalogPageLeftImg) return;

  syncResponsiveSpreadMode();

  // Trigger smooth page-turn / slide animation
  if (animDirection === 'next' || animDirection === 'prev') {
    catalogBookSpread.classList.remove('flip-next', 'flip-prev');
    void catalogBookSpread.offsetWidth; // force reflow
    catalogBookSpread.classList.add(animDirection === 'next' ? 'flip-next' : 'flip-prev');
  }

  const showTwoPages = catalogSpreadMode && (catalogCurrentPage < CATALOG_TOTAL_PAGES);

  catalogPageLeftImg.src = getCatalogPagePath(catalogCurrentPage);
  catalogPageLeftImg.alt = `Halaman Katalog ${catalogCurrentPage}`;
  if (catalogPageLeftNum) catalogPageLeftNum.textContent = String(catalogCurrentPage);

  if (showTwoPages) {
    const rightPage = catalogCurrentPage + 1;
    catalogBookSpread.classList.remove('single-page');
    if (catalogPageRightWrap) catalogPageRightWrap.style.display = 'flex';
    if (catalogBookSpine) catalogBookSpine.style.display = 'block';
    if (catalogPageRightImg) {
      catalogPageRightImg.src = getCatalogPagePath(rightPage);
      catalogPageRightImg.alt = `Halaman Katalog ${rightPage}`;
    }
    if (catalogPageRightNum) catalogPageRightNum.textContent = String(rightPage);
    if (catalogPageBadge) catalogPageBadge.textContent = `${padPage(catalogCurrentPage)}–${padPage(rightPage)}`;
  } else {
    catalogBookSpread.classList.add('single-page');
    if (catalogPageRightWrap) catalogPageRightWrap.style.display = 'none';
    if (catalogBookSpine) catalogBookSpine.style.display = 'none';
    if (catalogPageBadge) catalogPageBadge.textContent = padPage(catalogCurrentPage);
  }

  fitBookSpread();

  // Preload adjacent pages for zero-lag flipping
  const nextPreload = Math.min(CATALOG_TOTAL_PAGES, catalogCurrentPage + (showTwoPages ? 2 : 1));
  const preloadImg = new Image();
  preloadImg.src = getCatalogPagePath(nextPreload);

  // Sync active Filmstrip Thumbnails & center inside horizontal track
  if (catalogThumbsTrack) {
    const thumbItems = catalogThumbsTrack.querySelectorAll('.catalog-thumb-item');
    let activeThumbEl = null;
    thumbItems.forEach(item => {
      const p = parseInt(item.getAttribute('data-page') || '0', 10);
      const isCurrent = (p === catalogCurrentPage) || (showTwoPages && p === catalogCurrentPage + 1);
      item.classList.toggle('active-page', isCurrent);
      if (p === catalogCurrentPage) activeThumbEl = item;
    });
    if (activeThumbEl) {
      const trackWidth = catalogThumbsTrack.clientWidth;
      const itemLeft = activeThumbEl.offsetLeft;
      const itemWidth = activeThumbEl.offsetWidth;
      catalogThumbsTrack.scrollTo({
        left: Math.max(0, itemLeft - (trackWidth / 2) + (itemWidth / 2)),
        behavior: 'smooth'
      });
    }
  }
}

function goToCatalogPage(pageNum) {
  const target = Math.max(1, Math.min(CATALOG_TOTAL_PAGES, pageNum));
  const dir = target >= catalogCurrentPage ? 'next' : 'prev';
  catalogCurrentPage = target;
  renderCatalogBook(dir);
}

function nextCatalogPage() {
  const step = (catalogSpreadMode && catalogCurrentPage < CATALOG_TOTAL_PAGES) ? 2 : 1;
  if (catalogCurrentPage + step <= CATALOG_TOTAL_PAGES) {
    catalogCurrentPage += step;
  } else {
    catalogCurrentPage = 1; // Loop kembali ke halaman 1
  }
  renderCatalogBook('next');
}

function prevCatalogPage() {
  const step = catalogSpreadMode ? 2 : 1;
  if (catalogCurrentPage - step >= 1) {
    catalogCurrentPage -= step;
  } else if (catalogCurrentPage > 1) {
    catalogCurrentPage = 1;
  } else {
    catalogCurrentPage = catalogSpreadMode ? (CATALOG_TOTAL_PAGES - 1) : CATALOG_TOTAL_PAGES;
  }
  renderCatalogBook('prev');
}

/* ==========================================================================
   AUTO PLAY SLIDESHOW WITH CINEMATIC HUD & PROGRESS BAR
   ========================================================================== */
/* ==========================================================================
   CLEAN DISPLAY MODE (FULLSCREEN + SLIDESHOW OVERLAYS TOGGLE)
   When slideshow is running in fullscreen, all menus hide automatically.
   Clicking/tapping reveals them without pausing. Only the pause button pauses.
   ========================================================================== */
let catalogFsControlsTimer = null;

function setCatalogFsControlsVisible(visible) {
  if (catalogFsControlsTimer) {
    clearTimeout(catalogFsControlsTimer);
    catalogFsControlsTimer = null;
  }

  const isFs = document.body.classList.contains('catalog-fullscreen-active');
  const isSlideshowRunning = Boolean(catalogAutoFlipInterval);

  if (!isFs || !isSlideshowRunning) {
    document.body.classList.remove('catalog-fs-controls-hidden');
    return;
  }

  if (visible) {
    document.body.classList.remove('catalog-fs-controls-hidden');
    // Auto-hide again after 4.5 seconds if untouched during fullscreen slideshow
    catalogFsControlsTimer = setTimeout(() => {
      if (document.body.classList.contains('catalog-fullscreen-active') && catalogAutoFlipInterval) {
        document.body.classList.add('catalog-fs-controls-hidden');
      }
    }, 4500);
  } else {
    document.body.classList.add('catalog-fs-controls-hidden');
  }
}

function toggleCatalogFsControls() {
  const isCurrentlyHidden = document.body.classList.contains('catalog-fs-controls-hidden');
  setCatalogFsControlsVisible(isCurrentlyHidden);
}

function resetSlideshowProgress() {
  if (!catalogProgressFill) return;
  catalogProgressFill.style.transition = 'none';
  catalogProgressFill.style.width = '0%';
  void catalogProgressFill.offsetWidth; // force reflow
  catalogProgressFill.style.transition = `width ${slideshowDurationMs}ms linear`;
  catalogProgressFill.style.width = '100%';
}

function startCatalogAutoFlip() {
  if (catalogAutoFlipInterval) clearInterval(catalogAutoFlipInterval);
  if (catalogAutoFlipBtn) catalogAutoFlipBtn.classList.add('active-mode');
  if (catalogAutoFlipLabel) catalogAutoFlipLabel.textContent = 'Jeda Slideshow';
  if (catalogAutoFlipSvg) {
    catalogAutoFlipSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  }
  if (dockSlideshowFsBtn) dockSlideshowFsBtn.classList.add('active-mode');
  if (dockSlideshowFsLabel) dockSlideshowFsLabel.textContent = 'Jeda';
  if (dockSlideshowFsSvg) {
    dockSlideshowFsSvg.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
  }
  if (catalogSlideshowHud) catalogSlideshowHud.classList.add('active');
  if (catalogBookStage) catalogBookStage.classList.add('slideshow-running');
  if (catalogSlideshowProgress) catalogSlideshowProgress.classList.add('active');
  if (catalogSlideshowTag) catalogSlideshowTag.style.display = 'inline-flex';

  resetSlideshowProgress();
  catalogAutoFlipInterval = setInterval(() => {
    nextCatalogPage();
    resetSlideshowProgress();
  }, slideshowDurationMs);

  // In fullscreen mode, automatically enter clean display mode (hide menus)
  if (document.body.classList.contains('catalog-fullscreen-active')) {
    setCatalogFsControlsVisible(false);
  }

  setTimeout(fitBookSpread, 30);
}

function stopCatalogAutoFlip() {
  if (catalogAutoFlipInterval) {
    clearInterval(catalogAutoFlipInterval);
    catalogAutoFlipInterval = null;
  }
  if (catalogAutoFlipBtn) catalogAutoFlipBtn.classList.remove('active-mode');
  if (catalogAutoFlipLabel) catalogAutoFlipLabel.textContent = 'Slideshow';
  if (catalogAutoFlipSvg) {
    catalogAutoFlipSvg.innerHTML = '<polygon points="6 4 20 12 6 20 6 4"/>';
  }
  if (dockSlideshowFsBtn) dockSlideshowFsBtn.classList.remove('active-mode');
  if (dockSlideshowFsLabel) dockSlideshowFsLabel.textContent = 'Slideshow';
  if (dockSlideshowFsSvg) {
    dockSlideshowFsSvg.innerHTML = '<polygon points="6 4 20 12 6 20 6 4"/>';
  }
  if (catalogSlideshowHud) catalogSlideshowHud.classList.remove('active');
  if (catalogBookStage) catalogBookStage.classList.remove('slideshow-running');
  if (catalogSlideshowProgress) catalogSlideshowProgress.classList.remove('active');
  if (catalogProgressFill) {
    catalogProgressFill.style.transition = 'none';
    catalogProgressFill.style.width = '0%';
  }
  if (catalogSlideshowTag) catalogSlideshowTag.style.display = 'none';

  // When paused/stopped, ensure all menus are visible
  setCatalogFsControlsVisible(true);

  setTimeout(fitBookSpread, 30);
}

if (catalogSpeedBtn) {
  catalogSpeedBtn.onclick = (e) => {
    e.stopPropagation();
    if (slideshowDurationMs === 4000) {
      slideshowDurationMs = 2500;
      catalogSpeedBtn.textContent = '2.5 dtk/hal';
    } else if (slideshowDurationMs === 2500) {
      slideshowDurationMs = 6000;
      catalogSpeedBtn.textContent = '6 dtk/hal';
    } else {
      slideshowDurationMs = 4000;
      catalogSpeedBtn.textContent = '4 dtk/hal';
    }
    if (catalogAutoFlipInterval) {
      startCatalogAutoFlip();
    }
  };
}

if (catalogHudStopBtn) {
  catalogHudStopBtn.onclick = (e) => {
    e.stopPropagation();
    stopCatalogAutoFlip();
  };
}

/* ==========================================================================
   TRULY IMMERSIVE FULLSCREEN MODE CONTROLLER
   ========================================================================== */
function toggleCatalogFullscreen(forcedState) {
  const isCurrentlyFs = document.body.classList.contains('catalog-fullscreen-active');
  const targetState = forcedState !== undefined ? forcedState : !isCurrentlyFs;

  if (targetState) {
    document.body.classList.add('catalog-fullscreen-active');
    if (catalogFullscreenLabel) catalogFullscreenLabel.textContent = 'Keluar Penuh';
    if (catalogFullscreenBtn) catalogFullscreenBtn.classList.add('active-mode');
    if (catalogFullscreenSvg) {
      catalogFullscreenSvg.innerHTML = '<path d="M4 14h6m0 0v6m0-6L3 21m17-7h-6m0 0v6m0-6l7 7M10 10V4m0 6H4m6 0L3 3m10 7V4m0 6h6m-6 0l7-7"/>';
    }

    // In fullscreen mode, if slideshow is running, auto-enter clean mode (hide menus)
    if (catalogAutoFlipInterval) {
      setCatalogFsControlsVisible(false);
    } else {
      setCatalogFsControlsVisible(true);
    }

    const docEl = document.documentElement;
    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (docEl.requestFullscreen) {
        docEl.requestFullscreen().catch(() => {});
      } else if (docEl.webkitRequestFullscreen) {
        docEl.webkitRequestFullscreen();
      }
    }
  } else {
    document.body.classList.remove('catalog-fullscreen-active');
    setCatalogFsControlsVisible(true);
    if (catalogFullscreenLabel) catalogFullscreenLabel.textContent = 'Layar Penuh';
    if (catalogFullscreenBtn) catalogFullscreenBtn.classList.remove('active-mode');
    if (catalogFullscreenSvg) {
      catalogFullscreenSvg.innerHTML = '<path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>';
    }

    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  }

  setTimeout(fitBookSpread, 30);
  setTimeout(fitBookSpread, 180);
}

if (catalogFullscreenBtn) {
  catalogFullscreenBtn.onclick = () => {
    toggleCatalogFullscreen();
  };
}

if (dockExitFsBtn) {
  dockExitFsBtn.onclick = (e) => {
    e.stopPropagation();
    toggleCatalogFullscreen(false);
  };
}

if (dockSlideshowFsBtn) {
  dockSlideshowFsBtn.onclick = (e) => {
    e.stopPropagation();
    if (catalogAutoFlipInterval) {
      stopCatalogAutoFlip();
    } else {
      startCatalogAutoFlip();
    }
  };
}

if (dockSpreadFsBtn) {
  dockSpreadFsBtn.onclick = (e) => {
    e.stopPropagation();
    catalogUserManualSpread = true;
    catalogSpreadMode = !catalogSpreadMode;
    updateSpreadButtonUI();
    renderCatalogBook('none');
  };
}

document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.body.classList.contains('catalog-fullscreen-active')) {
    toggleCatalogFullscreen(false);
  }
});

// Global click handler to reveal/hide menus in fullscreen slideshow without pausing
document.addEventListener('click', (e) => {
  const isFs = document.body.classList.contains('catalog-fullscreen-active');
  const isSlideshowRunning = Boolean(catalogAutoFlipInterval);

  if (isFs && isSlideshowRunning) {
    // If clicking on functional control buttons, do not toggle clean mode
    if (e.target.closest('button') || e.target.closest('.hud-speed-btn') || e.target.closest('.hud-stop-btn') || e.target.closest('.dock-fs-only-btn')) {
      return;
    }
    // Clicking anywhere else toggles the menus, NEVER pauses the slideshow!
    toggleCatalogFsControls();
  }
});

if (catalogPrevBtn) {
  catalogPrevBtn.onclick = (e) => {
    e.stopPropagation();
    prevCatalogPage();
    if (catalogAutoFlipInterval) {
      resetSlideshowProgress();
    }
  };
}

if (catalogNextBtn) {
  catalogNextBtn.onclick = (e) => {
    e.stopPropagation();
    nextCatalogPage();
    if (catalogAutoFlipInterval) {
      resetSlideshowProgress();
    }
  };
}

if (catalogPageLeftWrap) {
  catalogPageLeftWrap.onclick = () => {
    if (document.body.classList.contains('catalog-fullscreen-active') && catalogAutoFlipInterval) {
      // In fullscreen slideshow: handled by global click toggle, do not flip page or pause
      return;
    }
    if (catalogAutoFlipInterval) {
      return;
    }
    if (catalogSpreadMode) {
      prevCatalogPage();
    } else {
      nextCatalogPage();
    }
  };
}

if (catalogPageRightWrap) {
  catalogPageRightWrap.onclick = () => {
    if (document.body.classList.contains('catalog-fullscreen-active') && catalogAutoFlipInterval) {
      // In fullscreen slideshow: handled by global click toggle, do not flip page or pause
      return;
    }
    if (catalogAutoFlipInterval) {
      return;
    }
    nextCatalogPage();
  };
}

if (catalogSpreadToggleBtn) {
  catalogSpreadToggleBtn.onclick = () => {
    catalogUserManualSpread = true;
    catalogSpreadMode = !catalogSpreadMode;
    updateSpreadButtonUI();
    renderCatalogBook('none');
  };
}

if (catalogAutoFlipBtn) {
  catalogAutoFlipBtn.onclick = () => {
    if (catalogAutoFlipInterval) {
      stopCatalogAutoFlip();
    } else {
      startCatalogAutoFlip();
    }
  };
}

// Global Keyboard Shortcuts for Catalog & Fullscreen
window.addEventListener('keydown', (e) => {
  if (document.body.getAttribute('data-active-view') === 'catalog') {
    if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      toggleCatalogFullscreen();
    } else if (e.key === 'Escape' && document.body.classList.contains('catalog-fullscreen-active')) {
      e.preventDefault();
      toggleCatalogFullscreen(false);
    } else if (e.key === ' ' && e.target.tagName !== 'INPUT') {
      e.preventDefault();
      if (catalogAutoFlipInterval) {
        stopCatalogAutoFlip();
      } else {
        startCatalogAutoFlip();
      }
    } else if (e.key === 'ArrowRight') {
      nextCatalogPage();
      if (catalogAutoFlipInterval) {
        resetSlideshowProgress();
      }
    } else if (e.key === 'ArrowLeft') {
      prevCatalogPage();
      if (catalogAutoFlipInterval) {
        resetSlideshowProgress();
      }
    }
  }
});

// Touch Swipe Gesture on Book Stage (Kiosk Touchscreen & Smartphone)
if (catalogBookStage) {
  let touchStartX = 0;
  let touchStartY = 0;

  catalogBookStage.addEventListener('touchstart', (e) => {
    if (e.touches && e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    }
  }, { passive: true });

  catalogBookStage.addEventListener('touchend', (e) => {
    if (e.changedTouches && e.changedTouches.length === 1) {
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        if (dx < 0) {
          nextCatalogPage();
        } else {
          prevCatalogPage();
        }
        if (catalogAutoFlipInterval) {
          resetSlideshowProgress();
        }
      }
    }
  }, { passive: true });
}

// Highlight Product/Topic Cards in Catalog
highlightCards.forEach(card => {
  card.onclick = () => {
    stopCatalogAutoFlip();
    const page = parseInt(card.getAttribute('data-page') || '1', 10);
    goToCatalogPage(page);
  };
});

/* ==========================================================================
   4. VIDEO GRID RENDERING (With Native Video Frame Thumbnails)
   ========================================================================== */
function getFilteredVideos() {
  const sectionVideos = getSectionVideos(currentView);
  return sectionVideos.filter(v => {
    const matchesCat = (currentCategory === 'all' || v.category === currentCategory);
    const matchesSearch = !searchQuery || 
      (v.title && v.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.category && v.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });
}

function renderVideoGrid() {
  if (!videoGridEl) return;
  const filtered = getFilteredVideos();

  // Update badge counter
  if (videoCountBadgeEl) {
    videoCountBadgeEl.textContent = `${filtered.length} file`;
  }

  videoGridEl.innerHTML = '';

  if (filtered.length === 0) {
    videoGridEl.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg></div>
        <div class="empty-title">Belum Ada Video Tersedia</div>
        <div class="empty-desc">
          Pastikan file video (.mp4) sudah ditaruh di dalam folder <b>"videos"</b>, 
          lalu klik 2x file <b>"UPDATE-VIDEOS.bat"</b> untuk memuat daftar materi.
        </div>
      </div>
    `;
    return;
  }

  filtered.forEach((video, index) => {
    const card = document.createElement('div');
    card.className = `video-card ${index === focusedCardIndex ? 'remote-focused' : ''}`;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Putar video ${video.title}`);

    // Create thumbnail container
    const thumbContainer = document.createElement('div');
    thumbContainer.className = 'thumbnail-container';

    // Fallback icon behind
    const fallbackEl = document.createElement('div');
    fallbackEl.className = 'thumbnail-fallback';
    fallbackEl.innerHTML = `
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-8v-6h8v6z"/>
      </svg>
    `;
    thumbContainer.appendChild(fallbackEl);

    // Helper function untuk memuat thumbnail frame video lokal jika offline / tanpa link drive
    function loadLocalFrameSnapshot() {
      const localSrc = video.localFile || (video.file && !video.file.startsWith('http') ? video.file : null);
      if (!localSrc) return;
      const previewVideo = document.createElement('video');
      previewVideo.className = 'thumbnail-preview-video';
      previewVideo.src = `${localSrc}#t=2.0`;
      previewVideo.preload = 'metadata';
      previewVideo.muted = true;
      previewVideo.playsInline = true;
      previewVideo.setAttribute('playsinline', '');
      previewVideo.setAttribute('muted', '');
      previewVideo.tabIndex = -1;

      previewVideo.addEventListener('loadeddata', () => {
        previewVideo.style.opacity = '1';
        fallbackEl.style.display = 'none';
      });

      previewVideo.addEventListener('loadedmetadata', () => {
        const seekTarget = Math.min(2.0, (previewVideo.duration || 5) * 0.2);
        previewVideo.currentTime = seekTarget;
      });

      previewVideo.addEventListener('seeked', () => {
        previewVideo.style.opacity = '1';
        fallbackEl.style.display = 'none';
      });

      thumbContainer.appendChild(previewVideo);
    }

    const driveId = getGoogleDriveId(video);
    if (driveId) {
      // 1. Google Drive Thumbnail Otomatis jika ada driveId / driveUrl
      const driveThumb = document.createElement('img');
      driveThumb.className = 'thumbnail-img';
      driveThumb.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w640`;
      driveThumb.alt = video.title;
      driveThumb.referrerPolicy = 'no-referrer';
      driveThumb.onload = () => {
        driveThumb.style.display = 'block';
        fallbackEl.style.display = 'none';
      };
      driveThumb.onerror = () => {
        driveThumb.remove();
        loadLocalFrameSnapshot();
      };
      thumbContainer.appendChild(driveThumb);
    } else if (video.poster) {
      // 2. Custom Poster Image jika ada
      const img = document.createElement('img');
      img.className = 'thumbnail-img';
      img.src = video.poster;
      img.alt = video.title;
      img.onload = () => {
        img.style.display = 'block';
        fallbackEl.style.display = 'none';
      };
      thumbContainer.appendChild(img);
    } else {
      // 3. Native Video Frame Snapshot untuk File Lokal Offline
      loadLocalFrameSnapshot();
    }

    // Play icon badge
    const playBadge = document.createElement('div');
    playBadge.className = 'play-badge';
    playBadge.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="7 4 20 12 7 20 7 4"/></svg>';
    thumbContainer.appendChild(playBadge);

    // Card Body
    const body = document.createElement('div');
    body.className = 'card-body';

    const catBadge = document.createElement('span');
    catBadge.className = 'card-category-tag';
    catBadge.textContent = video.category || 'Materi';

    const title = document.createElement('h3');
    title.className = 'card-title';
    title.textContent = video.title;

    body.appendChild(catBadge);
    body.appendChild(title);

    // Deskripsi bersih: Hanya nama file saja
    if (video.description) {
      const desc = document.createElement('p');
      desc.className = 'card-desc';
      desc.textContent = video.description;
      body.appendChild(desc);
    }

    card.appendChild(thumbContainer);
    card.appendChild(body);

    // Click handler to open player
    card.onclick = () => {
      // Jika diklik langsung, default loop ke 1 video
      playVideo(video);
    };

    // Focus handler for remote / keyboard navigation
    card.onfocus = () => {
      focusedCardIndex = index;
      updateRemoteFocus();
    };

    videoGridEl.appendChild(card);
  });
}

/* ==========================================================================
   4. VIDEO PLAYER MODAL & LOOP CONTROLS
   ========================================================================== */
/* Helper: 100% menggunakan link Google Drive melalui Stream Proxy (/api/stream) agar bermain langsung di <video> asli */
function resolveVideoSource(video) {
  const driveId = getGoogleDriveId(video);
  const streamEndpoint = (window.location.protocol === 'file:')
    ? `http://localhost:3456/api/stream?id=${driveId}`
    : `/api/stream?id=${driveId}`;

  return {
    type: 'drive-stream',
    src: streamEndpoint,
    driveId: driveId
  };
}

let playerControlsTimeout = null;

function showCenterPlayBtn() {
  if (centerPlayBtn) {
    centerPlayBtn.classList.remove('hidden');
    centerPlayBtn.style.display = 'flex';
  }
}

function hideCenterPlayBtn() {
  if (centerPlayBtn) {
    centerPlayBtn.classList.add('hidden');
    setTimeout(() => {
      if (centerPlayBtn.classList.contains('hidden')) {
        centerPlayBtn.style.display = 'none';
      }
    }, 250);
  }
}

function showPlayerOverlay() {
  const header = document.querySelector('.player-header');
  if (header) {
    header.classList.remove('overlay-hidden');
  }
  if (playerProgressContainer) {
    playerProgressContainer.classList.remove('overlay-hidden');
  }
  clearTimeout(playerControlsTimeout);

  // Auto-hide tombol kontrol & progress bar setelah 2.5 detik saat video sedang berputar
  if (isPlayerActive && mainVideoEl && !mainVideoEl.paused) {
    playerControlsTimeout = setTimeout(() => {
      if (isPlayerActive && mainVideoEl && !mainVideoEl.paused) {
        if (header) header.classList.add('overlay-hidden');
        if (playerProgressContainer) playerProgressContainer.classList.add('overlay-hidden');
      }
    }, 2500);
  }
}

function playVideo(video) {
  if (!playerModalEl) return;

  currentPlayingVideo = video;
  const fileName = video.description || (video.file ? video.file.split('/').pop() : video.title);
  playerTitleEl.textContent = video.title || fileName;
  if (playerCategoryEl) {
    playerCategoryEl.textContent = video.category || '';
    playerCategoryEl.style.display = video.category ? 'inline-block' : 'none';
  }

  const sourceInfo = resolveVideoSource(video);

  if (mainIframeEl) {
    mainIframeEl.style.display = 'none';
    mainIframeEl.src = '';
  }

  if (mainVideoEl) {
    // Hentikan stream video sebelumnya agar tidak membebani bandwidth Wi-Fi
    mainVideoEl.onerror = null;
    mainVideoEl.pause();
    mainVideoEl.style.display = 'block';
    mainVideoEl.referrerPolicy = 'no-referrer';
    mainVideoEl.setAttribute('playsinline', '');
    mainVideoEl.playsInline = true;
    mainVideoEl.src = sourceInfo.src;

    if (playerProgressBar) {
      playerProgressBar.style.width = '0%';
    }

    // Coba putar otomatis
    const playPromise = mainVideoEl.play();
    if (playPromise !== undefined) {
      playPromise.then(() => {
        hideCenterPlayBtn();
        showPlayerOverlay();
      }).catch(err => {
        console.warn("Autoplay ditahan browser, klik/sentuh layar untuk memutar:", err);
        showCenterPlayBtn();
      });
    }

    // Retry otomatis sekali pada <video> asli jika jaringan sempat jeda (tanpa pernah membuka iframe Drive)
    let retriedStream = false;
    mainVideoEl.onerror = (e) => {
      console.warn("Video stream error:", e);
      if (!retriedStream && sourceInfo.driveId) {
        retriedStream = true;
        setTimeout(() => {
          if (currentPlayingVideo === video && mainVideoEl) {
            mainVideoEl.src = `${sourceInfo.src}&retry=${Date.now()}`;
            mainVideoEl.play().catch(() => showCenterPlayBtn());
          }
        }, 400);
      } else {
        showCenterPlayBtn();
      }
    };
  }

  playerModalEl.classList.add('active');
  isPlayerActive = true;

  updateLoopUI();
  showPlayerOverlay();

  // Focus the prominent back button so user/remote can quickly exit
  setTimeout(() => {
    if (playerBackBtn) playerBackBtn.focus();
  }, 100);
}

function closeVideoPlayer() {
  if (!playerModalEl) return;
  clearTimeout(playerControlsTimeout);
  const header = document.querySelector('.player-header');
  if (header) header.classList.remove('overlay-hidden');
  if (playerProgressContainer) playerProgressContainer.classList.remove('overlay-hidden');

  hideCenterPlayBtn();

  if (mainVideoEl) {
    mainVideoEl.onerror = null;
    mainVideoEl.pause();
    mainVideoEl.removeAttribute('src');
    mainVideoEl.load();
    mainVideoEl.style.display = 'none';
  }
  if (mainIframeEl) {
    mainIframeEl.src = '';
    mainIframeEl.style.display = 'none';
  }
  playerModalEl.classList.remove('active');
  isPlayerActive = false;
  currentPlayingVideo = null;

  // Refocus last focused card in grid
  focusCardByIndex(focusedCardIndex);
}

function updateLoopUI() {
  if (mainVideoEl) {
    mainVideoEl.loop = (currentLoopMode === 'single');
  }

  if (!playerLoopBtn) return;
  playerLoopBtn.classList.remove('active-single', 'active-folder', 'active-none');

  const ICON_LOOP_ONE = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/><path d="M11 10h1v4"/></svg>';
  const ICON_LOOP_ALL = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>';
  const ICON_LOOP_OFF = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="6" width="12" height="12" rx="1"/></svg>';

  if (currentLoopMode === 'single') {
    playerLoopBtn.classList.add('active-single');
    playerLoopIcon.innerHTML = ICON_LOOP_ONE;
    playerLoopLabel.textContent = 'Loop: 1 Video Saja';
    playerLoopBtn.title = 'Mode: Mengulang 1 Video Ini Terus Menerus (Klik untuk Ganti)';
  } else if (currentLoopMode === 'folder') {
    playerLoopBtn.classList.add('active-folder');
    playerLoopIcon.innerHTML = ICON_LOOP_ALL;
    const catName = currentPlayingVideo ? currentPlayingVideo.category : 'Folder Ini';
    playerLoopLabel.textContent = `Loop: Folder ${catName}`;
    playerLoopBtn.title = `Mode: Memutar Berurutan Semua Video di Folder ${catName} (Klik untuk Ganti)`;
  } else {
    playerLoopBtn.classList.add('active-none');
    playerLoopIcon.innerHTML = ICON_LOOP_OFF;
    playerLoopLabel.textContent = 'Loop: Mati (Sekali Putar)';
    playerLoopBtn.title = 'Mode: Selesai Video Kembali ke Menu (Klik untuk Ganti)';
  }
}

function cycleLoopMode() {
  if (currentLoopMode === 'single') {
    currentLoopMode = 'folder';
  } else if (currentLoopMode === 'folder') {
    currentLoopMode = 'none';
  } else {
    currentLoopMode = 'single';
  }
  updateLoopUI();
}

function playNextVideoInFolder() {
  if (!currentPlayingVideo) return;
  const section = currentPlayingVideo.section || (currentView === 'galleries' ? 'galleries' : 'about-us');
  const folderVideos = getSectionVideos(section);

  if (folderVideos.length > 0) {
    let currentIndex = folderVideos.indexOf(currentPlayingVideo);
    if (currentIndex === -1) {
      currentIndex = folderVideos.findIndex(v => (v.driveId && v.driveId === currentPlayingVideo.driveId) || v.title === currentPlayingVideo.title || v.file === currentPlayingVideo.file);
    }
    const nextIndex = (currentIndex >= 0) ? (currentIndex + 1) % folderVideos.length : 0;
    playVideo(folderVideos[nextIndex]);
  }
}

function playPrevVideoInFolder() {
  if (!currentPlayingVideo) return;
  const section = currentPlayingVideo.section || (currentView === 'galleries' ? 'galleries' : 'about-us');
  const folderVideos = getSectionVideos(section);

  if (folderVideos.length > 0) {
    let currentIndex = folderVideos.indexOf(currentPlayingVideo);
    if (currentIndex === -1) {
      currentIndex = folderVideos.findIndex(v => (v.driveId && v.driveId === currentPlayingVideo.driveId) || v.title === currentPlayingVideo.title || v.file === currentPlayingVideo.file);
    }
    const prevIndex = (currentIndex >= 0) ? (currentIndex - 1 + folderVideos.length) % folderVideos.length : 0;
    playVideo(folderVideos[prevIndex]);
  }
}

if (playerBackBtn) {
  playerBackBtn.onclick = closeVideoPlayer;
}

if (playerLoopBtn) {
  playerLoopBtn.onclick = cycleLoopMode;
}

if (playerNextBtn) {
  playerNextBtn.onclick = playNextVideoInFolder;
}

if (playerPrevBtn) {
  playerPrevBtn.onclick = playPrevVideoInFolder;
}

// Center play button click listener
if (centerPlayBtn) {
  centerPlayBtn.onclick = (e) => {
    e.stopPropagation();
    if (mainVideoEl) {
      mainVideoEl.play().then(() => {
        hideCenterPlayBtn();
        showPlayerOverlay();
      }).catch(err => console.warn(err));
    }
  };
}

// Klik video atau container untuk toggle Play / Pause
const videoContainerEl = document.querySelector('.video-container');
if (videoContainerEl) {
  videoContainerEl.onclick = (e) => {
    if (e.target.closest('.player-header') || e.target.closest('.player-progress-container')) return;
    if (e.target === centerPlayBtn || (centerPlayBtn && centerPlayBtn.contains(e.target))) return;
    if (mainIframeEl && mainIframeEl.style.display !== 'none') return;

    if (mainVideoEl) {
      if (mainVideoEl.paused) {
        mainVideoEl.play().then(() => {
          hideCenterPlayBtn();
          showPlayerOverlay();
        }).catch(err => console.warn(err));
      } else {
        mainVideoEl.pause();
        showCenterPlayBtn();
        showPlayerOverlay();
      }
    }
  };
}

// Progress Bar seeking click
if (playerProgressContainer) {
  playerProgressContainer.onclick = (e) => {
    e.stopPropagation();
    if (mainVideoEl && mainVideoEl.duration) {
      const rect = playerProgressContainer.getBoundingClientRect();
      const pos = (e.clientX - rect.left) / rect.width;
      mainVideoEl.currentTime = pos * mainVideoEl.duration;
      showPlayerOverlay();
    }
  };
}

// Event saat video selesai diputar
if (mainVideoEl) {
  mainVideoEl.onended = () => {
    if (!currentPlayingVideo) {
      closeVideoPlayer();
      return;
    }

    if (currentLoopMode === 'single') {
      // 1. Loop 1 Video saja
      mainVideoEl.currentTime = 0;
      mainVideoEl.play().catch(e => console.warn(e));
    } else if (currentLoopMode === 'folder') {
      // 2. Loop Berurutan Semua Video dalam Folder Ini Saja
      playNextVideoInFolder();
    } else {
      // 3. Tanpa Loop -> Selesai dan kembali ke menu
      closeVideoPlayer();
    }
  };

  // Video timeupdate untuk update progress bar
  mainVideoEl.addEventListener('timeupdate', () => {
    if (mainVideoEl.duration && playerProgressBar) {
      const percent = (mainVideoEl.currentTime / mainVideoEl.duration) * 100;
      playerProgressBar.style.width = `${percent}%`;
    }
  });

  mainVideoEl.addEventListener('play', () => {
    hideCenterPlayBtn();
    showPlayerOverlay();
  });

  mainVideoEl.addEventListener('pause', () => {
    showCenterPlayBtn();
    showPlayerOverlay();
  });
}

// Interaction listeners untuk auto-hide kontrol pemutar saat video berputar
if (playerModalEl) {
  ['touchstart', 'mousemove', 'click', 'keydown'].forEach(evt => {
    playerModalEl.addEventListener(evt, showPlayerOverlay, { passive: true });
  });
}

/* ==========================================================================
   5. REMOTE TV / KEYBOARD D-PAD NAVIGATION
   ========================================================================== */
function updateRemoteFocus() {
  const cards = document.querySelectorAll('.video-card');
  cards.forEach((c, idx) => {
    if (idx === focusedCardIndex) {
      c.classList.add('remote-focused');
      c.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      c.classList.remove('remote-focused');
    }
  });
}

function focusCardByIndex(idx) {
  const cards = document.querySelectorAll('.video-card');
  if (cards.length === 0) return;
  focusedCardIndex = Math.max(0, Math.min(idx, cards.length - 1));
  cards[focusedCardIndex].focus();
  updateRemoteFocus();
}

// Global Key Listeners for TV Remote D-Pad, OK, and Back buttons
window.addEventListener('keydown', (e) => {
  resetIdleTimer();

  // 1. If Video Player is Active
  if (isPlayerActive) {
    if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'BrowserBack' || e.key === 'GoBack') {
      e.preventDefault();
      closeVideoPlayer();
      return;
    }
    if (e.key === 'l' || e.key === 'L') {
      e.preventDefault();
      cycleLoopMode();
      return;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      playNextVideoInFolder();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      playPrevVideoInFolder();
      return;
    }
    if (e.key === ' ' || e.key === 'Enter') {
      if (document.activeElement !== playerBackBtn && 
          document.activeElement !== playerLoopBtn && 
          document.activeElement !== playerNextBtn && 
          document.activeElement !== playerPrevBtn) {
        e.preventDefault();
        if (mainVideoEl.paused) {
          mainVideoEl.play();
        } else {
          mainVideoEl.pause();
        }
      }
    }
    return;
  }

  // 2. If inside Section View (About Us, Galleries, Catalog) and user presses Back/Esc
  if (currentView !== 'home') {
    if (e.key === 'Escape' || e.key === 'Backspace' || e.key === 'BrowserBack' || e.key === 'GoBack') {
      e.preventDefault();
      switchView('home');
      return;
    }
  }

  // 3. If in Landing Page Portal (Home)
  if (currentView === 'home') {
    const portalCards = [cardOptionAboutUs, cardOptionGalleries, cardOptionCatalog].filter(Boolean);
    if (portalCards.length === 0) return;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusedPortalCardIndex = (focusedPortalCardIndex + 1) % portalCards.length;
      portalCards[focusedPortalCardIndex].focus();
      return;
    }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusedPortalCardIndex = (focusedPortalCardIndex - 1 + portalCards.length) % portalCards.length;
      portalCards[focusedPortalCardIndex].focus();
      return;
    }
    if (e.key === 'Enter') {
      if (document.activeElement && document.activeElement.classList.contains('portal-card')) {
        document.activeElement.click();
      }
      return;
    }
  }

  // 3B. If in Catalog View: Left/Right Arrow flips pages
  if (currentView === 'catalog') {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      stopCatalogAutoFlip();
      nextCatalogPage();
      return;
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stopCatalogAutoFlip();
      prevCatalogPage();
      return;
    }
  }

  // 4. If in Video Grid View
  const cards = document.querySelectorAll('.video-card');
  if (cards.length === 0) return;

  const cols = calculateGridColumns();

  switch (e.key) {
    case 'ArrowRight':
      e.preventDefault();
      focusCardByIndex(focusedCardIndex + 1);
      break;
    case 'ArrowLeft':
      e.preventDefault();
      focusCardByIndex(focusedCardIndex - 1);
      break;
    case 'ArrowDown':
      e.preventDefault();
      focusCardByIndex(focusedCardIndex + cols);
      break;
    case 'ArrowUp':
      e.preventDefault();
      focusCardByIndex(focusedCardIndex - cols);
      break;
    case 'Enter':
      if (document.activeElement.classList.contains('video-card')) {
        document.activeElement.click();
      }
      break;
    case 'f':
    case 'F':
      toggleFullscreen();
      break;
  }
});

function calculateGridColumns() {
  if (!videoGridEl) return 3;
  const cards = document.querySelectorAll('.video-card');
  if (cards.length > 1) {
    const firstTop = cards[0].offsetTop;
    let cols = 0;
    for (let i = 0; i < cards.length; i++) {
      if (Math.abs(cards[i].offsetTop - firstTop) < 5) {
        cols++;
      } else {
        break;
      }
    }
    return Math.max(1, cols);
  }
  return 1;
}

/* ==========================================================================
   6. FULLSCREEN & ACTIONS
   ========================================================================== */
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.warn("Fullscreen request error:", err);
    });
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

if (fullscreenBtn) {
  fullscreenBtn.onclick = toggleFullscreen;
}

if (refreshBtn) {
  refreshBtn.onclick = () => {
    window.location.reload();
  };
}

if (searchInputEl) {
  searchInputEl.oninput = (e) => {
    searchQuery = e.target.value;
    renderVideoGrid();
  };
}

/* ==========================================================================
   7. STANDBY IDLE TIMER (Returns to Home Portal after 5 Mins Idle)
   ========================================================================== */
function resetIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    if (isPlayerActive) {
      closeVideoPlayer();
    }
    if (currentView !== 'home') {
      console.log("Idle timeout reached, returning to Main Menu Portal...");
      switchView('home');
    }
  }, IDLE_TIMEOUT_MS);
}

['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach(evt => {
  window.addEventListener(evt, resetIdleTimer, { passive: true });
});

window.addEventListener('resize', () => {
  updateRemoteFocus();
});
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    updateRemoteFocus();
  }, 150);
});

// Initial boot
document.addEventListener('DOMContentLoaded', () => {
  switchView('home');
  resetIdleTimer();
});
