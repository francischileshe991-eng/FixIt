// HandyHub ZM frontend app
// Loads worker data from workers.json and renders cards with live filtering.

(function () {
  const urlParams = new URLSearchParams(window.location.search);
  const initialTrade = (urlParams.get('trade') || '').trim();

  const state = {
    workers: [],
    query: (urlParams.get('q') || '').trim().toLowerCase(),
    trade: 'all',
    area: (urlParams.get('area') || 'all').trim()
  };

  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuBackdrop = document.getElementById('menuBackdrop');
  const navContainer = menuBtn ? menuBtn.closest('nav') : null;
  const searchInput = document.getElementById('searchInput');
  const areaFilter = document.getElementById('areaFilter');
  const tradeFilters = [...document.querySelectorAll('.trade-filter')];
  const clearFiltersBtn = document.getElementById('clearFilters');

  const featuredGrid = document.getElementById('featuredWorkers');
  const allWorkersGrid = document.getElementById('allWorkers');
  const featuredEmpty = document.getElementById('featuredEmpty');
  const allEmpty = document.getElementById('allEmpty');
  const workerCount = document.getElementById('workerCount');

  function isMobileViewport() {
    return window.innerWidth < 768;
  }

  function openMobileMenu() {
    if (!menuBtn || !navContainer || !menuBackdrop) return;
    navContainer.classList.add('menu-open');
    menuBackdrop.hidden = false;
    requestAnimationFrame(() => {
      menuBackdrop.classList.add('is-visible');
    });
    menuBtn.setAttribute('aria-expanded', 'true');
  }

  function closeMobileMenu() {
    if (!menuBtn || !navContainer || !menuBackdrop) return;
    navContainer.classList.remove('menu-open');
    menuBackdrop.classList.remove('is-visible');
    menuBtn.setAttribute('aria-expanded', 'false');
    window.setTimeout(() => {
      if (!navContainer.classList.contains('menu-open')) {
        menuBackdrop.hidden = true;
      }
    }, 210);
  }

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      if (!isMobileViewport()) return;
      const isOpen = navContainer.classList.contains('menu-open');
      if (isOpen) closeMobileMenu();
      else openMobileMenu();
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (isMobileViewport()) closeMobileMenu();
      });
    });

    menuBackdrop.addEventListener('click', closeMobileMenu);

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMobileMenu();
    });

    window.addEventListener('resize', () => {
      if (!isMobileViewport()) closeMobileMenu();
    });
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function renderStars(rating) {
    const full = Math.floor(rating);
    const hasHalf = rating - full >= 0.5;
    const empty = 5 - full - (hasHalf ? 1 : 0);

    return `${'★'.repeat(full)}${hasHalf ? '⯨' : ''}${'☆'.repeat(empty)} ${rating.toFixed(1)}`;
  }

  function normalizeTradeClass(trade) {
    if (trade === 'Plumber') return 'bg-sky-100 text-sky-800';
    if (trade === 'Electrician') return 'bg-yellow-100 text-yellow-800';
    if (trade === 'Carpenter') return 'bg-orange-100 text-orange-800';
    if (trade === 'Bricklayer/Builder') return 'bg-stone-200 text-stone-800';
    return 'bg-zinc-200 text-zinc-800';
  }

  function createCard(worker) {
    const tradeClass = normalizeTradeClass(worker.trade);
    const verifiedBadge = worker.verified
      ? '<span class="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Verified</span>'
      : '';

    const waMessage = encodeURIComponent(`Hi, I found you on HandyHub ZM. I need a ${worker.trade} in ${worker.area}.`);

    return `
      <article class="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <div class="mb-3 flex items-start justify-between gap-2">
          <h3 class="text-lg font-bold text-slate-900">${escapeHtml(worker.name)}</h3>
          ${worker.featured ? '<span class="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">Featured</span>' : ''}
        </div>
        <p class="text-sm text-slate-600"><span class="rounded-full px-2 py-1 text-xs font-semibold ${tradeClass}">${escapeHtml(worker.trade)}</span> • ${escapeHtml(worker.area)}</p>
        <p class="mt-2 text-xs text-slate-500">Services: ${escapeHtml(worker.services)}</p>
        <div class="mt-3 flex items-center gap-2 text-xs text-slate-700">
          ${verifiedBadge}
          <span>${renderStars(worker.rating)}</span>
        </div>
        <div class="mt-4 flex gap-2">
          <a href="https://wa.me/${encodeURIComponent(worker.whatsapp)}?text=${waMessage}" class="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">WhatsApp</a>
          <a href="tel:${escapeHtml(worker.phone)}" class="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold hover:bg-slate-100">Call</a>
        </div>
      </article>
    `;
  }

  function populateAreaFilter(workers) {
    const areas = [...new Set(workers.map((w) => w.area))].sort((a, b) => a.localeCompare(b));
    const options = ['<option value="all">All Areas</option>']
      .concat(areas.map((area) => `<option value="${escapeHtml(area)}">${escapeHtml(area)}</option>`));
    areaFilter.innerHTML = options.join('');
  }

  function matchesFilters(worker) {
    const searchable = `${worker.name} ${worker.trade} ${worker.area} ${worker.services}`.toLowerCase();
    const queryMatch = searchable.includes(state.query);
    const tradeMatch = state.trade === 'all' || worker.trade === state.trade;
    const areaMatch = state.area === 'all' || worker.area === state.area;

    return queryMatch && tradeMatch && areaMatch;
  }

  function render() {
    const filtered = state.workers.filter(matchesFilters);
    const featured = filtered.filter((w) => w.featured);

    featuredGrid.innerHTML = featured.map(createCard).join('');
    allWorkersGrid.innerHTML = filtered.map(createCard).join('');

    featuredEmpty.classList.toggle('hidden', featured.length > 0);
    allEmpty.classList.toggle('hidden', filtered.length > 0);

    workerCount.textContent = `${filtered.length} worker${filtered.length === 1 ? '' : 's'} found`;
  }

  function setActiveTradeButton(selected) {
    tradeFilters.forEach((btn) => {
      const isActive = btn.dataset.trade === selected;
      btn.className = isActive
        ? 'trade-filter rounded-full bg-brand-500 px-4 py-2 text-xs font-semibold text-white'
        : 'trade-filter rounded-full border border-brand-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700';
    });
  }

  async function loadWorkers() {
    try {
      const response = await fetch('./workers.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('Failed to load workers.json');

      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('workers.json must contain an array');

      state.workers = data;
      populateAreaFilter(data);
      const availableTrades = new Set(tradeFilters.map((btn) => btn.dataset.trade));
      if (availableTrades.has(initialTrade)) {
        state.trade = initialTrade;
      }

      const availableAreas = new Set(data.map((worker) => worker.area));
      if (state.area !== 'all' && !availableAreas.has(state.area)) {
        state.area = 'all';
      }

      searchInput.value = state.query;
      areaFilter.value = state.area;
      setActiveTradeButton(state.trade);
      render();
    } catch (error) {
      workerCount.textContent = 'Unable to load workers data. Please run via a static server.';
      featuredGrid.innerHTML = '';
      allWorkersGrid.innerHTML = '';
      featuredEmpty.classList.add('hidden');
      allEmpty.classList.add('hidden');
      console.error(error);
    }
  }

  searchInput.addEventListener('input', (event) => {
    state.query = event.target.value.trim().toLowerCase();
    render();
  });

  areaFilter.addEventListener('change', (event) => {
    state.area = event.target.value;
    render();
  });

  tradeFilters.forEach((btn) => {
    btn.addEventListener('click', () => {
      state.trade = btn.dataset.trade;
      setActiveTradeButton(state.trade);
      render();
    });
  });

  clearFiltersBtn.addEventListener('click', () => {
    state.query = '';
    state.trade = 'all';
    state.area = 'all';

    searchInput.value = '';
    areaFilter.value = 'all';
    setActiveTradeButton('all');
    render();
  });

  loadWorkers();
})();

