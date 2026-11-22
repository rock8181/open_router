/* ============================================================
   OpenRouter Study Document Viewer — app.js
   모든 사용자 텍스트: 한국어 / ES6+
   ============================================================ */

const BASE = '';
const PAGE_SIZE = 12;
const RECENT_LIMIT = 10;
const HOVER_PREVIEW_CHARS = 200;
const HOVER_DEBOUNCE = 300;
const SEARCH_DEBOUNCE = 300;
const LS_FAVORITES = 'docviewer:favorites';
const LS_TAGS = 'docviewer:tags';
const LS_RECENT = 'docviewer:recent';
const LS_DARK = 'docviewer:darkMode';

let currentRoot = 'open_router';
let currentDir = '';
let items = [];
let sortBy = 'name';
let sortDir = 'asc';
let page = 1;
let viewMode = 'grid';
let isSearchMode = false;
let isLoading = false;
let tagFilter = null;
let favFilter = false;
let darkMode = false;
let searchTimer = null;
let dropdownTimer = null;
let hoverTimer = null;
let hoverCtrl = null;
let viewerTrap = null;
let busyCard = null;
const cardCleanups = new WeakMap();
let undoStack = [];
let shortcutsVisible = false;

let favorites = loadJson(LS_FAVORITES, []);
let tags = loadJson(LS_TAGS, {});
let recent = loadJson(LS_RECENT, []);

function loadJson(key, def) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? def : JSON.parse(raw);
  } catch (e) {
    return def;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {}
}

const MSG = {
  load: '로드 중...',
  ready: '준비',
  loadError: '문서를 불러오지 못했습니다.',
  search: '검색 중...',
  searchError: '검색에 실패했습니다.',
  open: '문서 열기 중...',
  openError: '파일을 불러오지 못했습니다.',
  copySuccess: '클립보드에 복사되었습니다.',
  copyError: '클립보드 복사에 실패했습니다.',
  retry: '다시 시도',
  back: '목록으로',
  empty: '문서가 없습니다.',
  emptySearch: '검색 결과가 없습니다.',
  recent: '최근 문서',
  recentEmpty: '최근 문서가 없습니다.',
  tags: '태그',
  favorites: '즐겨찾기',
  favOnly: '즐겨찾기만 보기',
  viewGrid: '그리드 보기',
  viewList: '목록 보기',
  sort: '정렬',
  sortNameAsc: '이름 오름차순',
  sortNameDesc: '이름 내림차순',
  sortDateAsc: '날짜 오름차순',
  sortDateDesc: '날짜 내림차순',
  sortSizeAsc: '크기 오름차순',
  sortSizeDesc: '크기 내림차순',
  export: '내보내기',
  exportCsv: 'CSV 다운로드',
  exportJson: 'JSON 다운로드',
  dark: '다크 모드',
  light: '라이트 모드',
  shortcuts: '단축키',
  add: '새 문서/폴더',
  rename: '이름 변경',
  delete: '삭제',
  duplicate: '복제',
  download: '다운로드',
  undo: '실행 취소',
  redo: '다시 실행',
  star: '즐겨찾기 추가',
  unstar: '즐겨찾기 해제',
  addedRecent: '최근 문서에 추가됨',
  opRenamed: '이름 변경됨',
  opDeleted: '삭제됨',
  opDuplicated: '복제됨',
  opDownloaded: '다운로드됨',
  searchPlaceholder: '문서 검색...',
  pageOf: '페이지',
  prev: '이전',
  next: '다음',
  noShortcuts: '단축키 힌트를 표시할 수 없습니다.',
};

/* --------------------------------------------------------------
   DOM references
   -------------------------------------------------------------- */
const sidebarItems = document.querySelectorAll('.nav-item');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
const addBtn = document.getElementById('addBtn');
const moreBtn = document.getElementById('moreBtn');
const pageTitle = document.getElementById('pageTitle');
const breadcrumb = document.getElementById('breadcrumb');
const grid = document.getElementById('grid');
const docCount = document.getElementById('docCount');
const statusEl = document.getElementById('status');
const viewerOverlay = document.getElementById('viewerOverlay');
const viewerTitle = document.getElementById('viewerTitle');
const viewerContent = document.getElementById('viewerContent');
const closeViewerBtn = document.getElementById('closeViewerBtn');
const copyBtn = document.getElementById('copyBtn');

let viewToggleBtn, sortSelect, exportCsvBtn, exportJsonBtn, darkToggleBtn, favFilterBtn;
let paginationEl, searchDropdown, shortcutsEl;

/* --------------------------------------------------------------
   Utilities
   -------------------------------------------------------------- */
function setStatus(msg, type = 'info') {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function setBusy(el, busy) {
  if (!el) return;
  el.disabled = busy;
  el.setAttribute('aria-busy', String(busy));
}

function toast(msg, kind = 'info', undoAction) {
  setStatus(msg, kind);
  if (kind !== 'error') {
    clearTimeout(statusEl._t);
    statusEl._t = setTimeout(() => {
      setStatus(MSG.ready, 'info');
    }, 3000);
  }
  if (undoAction) {
    showUndoToast(msg, undoAction);
  }
}

function showUndoToast(msg, action) {
  const existing = document.getElementById('undo-toast');
  if (existing) existing.remove();
  const box = document.createElement('div');
  box.id = 'undo-toast';
  box.className = 'undo-toast';
  box.setAttribute('role', 'alert');
  box.setAttribute('aria-live', 'assertive');
  box.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:2000;background:hsl(var(--color-surface));border:1px solid hsl(var(--color-border));border-radius:8px;padding:10px 14px;box-shadow:0 8px 24px hsl(var(--color-text-primary) / 0.15);display:flex;align-items:center;gap:10px;max-width:340px;color:hsl(var(--color-text-primary));animation:toastIn 0.2s ease both;';
  box.innerHTML = `<span style="flex:1;font-size:0.85rem">${escapeHtml(msg)}</span>
    <button type="button" id="undo-btn" style="background:hsl(var(--color-accent));color:hsl(var(--color-bg));border:none;border-radius:4px;padding:4px 10px;font-size:0.75rem;font-weight:600;cursor:pointer">${MSG.undo}</button>
    <button type="button" id="undo-dismiss" style="background:transparent;border:none;color:hsl(var(--color-text-muted));font-size:1.25rem;cursor:pointer;padding:0 4px">✕</button>`;
  document.body.appendChild(box);
  box.querySelector('#undo-btn').addEventListener('click', () => {
    box.remove();
    action();
  });
  box.querySelector('#undo-dismiss').addEventListener('click', () => box.remove());
  setTimeout(() => { if (box.parentNode) box.remove(); }, 6000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('ko-KR');
}

function cssEscape(value) {
  return window.CSS && window.CSS.escape ? window.CSS.escape(value) : String(value).replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
}

function isInputFocused() {
  const el = document.activeElement;
  return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
}

function buildURL(state) {
  const params = new URLSearchParams();
  if (state.root) params.set('root', state.root);
  if (state.dir) params.set('dir', state.dir);
  if (state.search === '1') params.set('search', '1');
  if (state.q) params.set('q', state.q);
  if (state.file) params.set('file', state.file);
  const qs = params.toString();
  return qs ? `${location.pathname}?${qs}` : location.pathname;
}

function navigate(state) {
  history.pushState(state, '', buildURL(state));
}

/* --------------------------------------------------------------
   Persistence helpers (favorites / tags / recent / dark mode)
   -------------------------------------------------------------- */
function toggleFavorite(path) {
  const idx = favorites.indexOf(path);
  if (idx === -1) {
    favorites.push(path);
    saveJson(LS_FAVORITES, favorites);
    return true;
  }
  favorites.splice(idx, 1);
  saveJson(LS_FAVORITES, favorites);
  return false;
}

function isFavorite(path) {
  return favorites.includes(path);
}

function setTag(path, tag) {
  if (tag) {
    tags[path] = tag;
  } else {
    delete tags[path];
  }
  saveJson(LS_TAGS, tags);
}

function getTag(path) {
  return tags[path];
}

function addRecent(item) {
  const entry = { name: item.name, path: item.path, root: currentRoot, time: Date.now() };
  recent = recent.filter((r) => r.path !== entry.path);
  recent.unshift(entry);
  recent = recent.slice(0, RECENT_LIMIT);
  saveJson(LS_RECENT, recent);
  renderSidebarRecent();
}

function setDarkMode(on) {
  darkMode = on;
  document.documentElement.dataset.tone = darkMode ? 'dark' : '';
  saveJson(LS_DARK, darkMode);
  if (darkToggleBtn) darkToggleBtn.textContent = darkMode ? '☀️' : '🌙';
  if (darkToggleBtn) darkToggleBtn.title = darkMode ? MSG.light : MSG.dark;
}

/* --------------------------------------------------------------
   URL / history
   -------------------------------------------------------------- */
function parseLocation() {
  const params = new URLSearchParams(location.search);
  const root = params.get('root') || 'open_router';
  const dir = params.get('dir') || '';
  const file = params.get('file') || '';

  if (params.get('search') === '1') {
    const q = params.get('q') || '';
    searchInput.value = q;
    if (q) {
      searchDocuments(q);
    } else {
      loadDocuments(root, dir);
    }
    return;
  }

  if (file) {
    closeViewer();
    loadDocuments(root, dir);
    return;
  }

  loadDocuments(root, dir);
}

/* --------------------------------------------------------------
   Grid cleanup
   -------------------------------------------------------------- */
function clearGrid() {
  for (const child of grid.children) {
    const cleanup = cardCleanups.get(child);
    if (cleanup) cleanup();
  }
  grid.innerHTML = '';
}

/* Note: WeakMap has no .clear(); cleanups are removed per-child above.
   This avoids the crash that .clear() would cause. */

function showGridError(message, onRetry) {
  clearGrid();
  const box = document.createElement('div');
  box.className = 'empty-state';
  box.setAttribute('role', 'alert');
  box.setAttribute('aria-live', 'assertive');
  box.innerHTML = `
    <p style="margin-bottom:12px">${escapeHtml(message)}</p>
    <button type="button" class="retry-btn" style="margin-top:12px;padding:8px 16px;background:#38bdf8;color:#0f172a;border:none;border-radius:6px;font-weight:600;cursor:pointer">${MSG.retry}</button>
    <button type="button" class="back-btn" style="margin-top:8px;padding:8px 16px;background:#334155;color:#e2e8f0;border:1px solid #475569;border-radius:6px;cursor:pointer">${MSG.back}</button>
  `;
  box.querySelector('.retry-btn').addEventListener('click', onRetry);
  box.querySelector('.back-btn').addEventListener('click', () => loadDocuments(currentRoot, currentDir));
  grid.appendChild(box);
}

function trapFocus(container) {
  const focusables = Array.from(container.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'));
  if (focusables.length === 0) return () => {};
  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  function onKeydown(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first || document.activeElement === container) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
}

function setupParallax(card) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) return null;
  const front = card.querySelector('.gf-front');
  const back = card.querySelector('.gf-back');
  if (!front || !back) return null;

  let frame = null;
  let targetX = 0;
  let targetY = 0;

  function update() {
    frame = null;
    front.style.transform = `translate(${targetX * 10}px, ${targetY * 10}px)`;
    back.style.transform = `translate(${targetX * -6}px, ${targetY * -6}px)`;
  }

  function onMove(e) {
    const rect = card.getBoundingClientRect();
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = (e.clientY - rect.top) / rect.height - 0.5;
    if (!frame) frame = requestAnimationFrame(update);
  }

  function onLeave() {
    targetX = 0;
    targetY = 0;
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }
    update();
  }

  card.addEventListener('mousemove', onMove);
  card.addEventListener('mouseleave', onLeave);

  return () => {
    card.removeEventListener('mousemove', onMove);
    card.removeEventListener('mouseleave', onLeave);
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }
    front.style.transform = '';
    back.style.transform = '';
  };
}

/* --------------------------------------------------------------
   Card creation (with fixes + features)
   -------------------------------------------------------------- */
function createCard(item, index) {
  const isDir = item.type === 'directory';
  const isSearchResult = !!item.root;
  const path = item.path || item.file;
  const isFav = isFavorite(path);
  const tag = getTag(path);

  let metaText;
  if (isSearchResult) {
    metaText = `[${escapeHtml(String(item.root))}] ${escapeHtml(String(path))}`;
    if (item.snippet) metaText += ' | ';
  } else if (isDir) {
    metaText = '폴더';
    if (item.modifiedAt) metaText += ' | ' + formatDate(item.modifiedAt);
  } else {
    metaText = `크기: ${formatSize(item.size)}`;
    if (item.modifiedAt) metaText += ' | ' + formatDate(item.modifiedAt);
  }

  const snippet = isSearchResult && item.snippet
    ? `<div style="margin-top:8px;font-size:0.85rem;color:#94a3b8;">${escapeHtml(item.snippet)}</div>`
    : '';

  const card = document.createElement('div');
  card.className = `gf-root type-${isDir ? 'directory' : 'file'}`;
  card.dataset.path = path;
  card.dataset.type = isDir ? 'directory' : 'file';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', item.name);
  card.setAttribute('aria-expanded', 'false');
  card.draggable = true;

  // FIX: make .gf-front visible by default so names show on closed cards
  const starHtml = `<button class="card-star" type="button" aria-label="${isFav ? MSG.unstar : MSG.star}" title="${isFav ? MSG.unstar : MSG.star}" style="width:32px;height:32px;border-radius:6px;border:1px solid hsl(var(--color-border));background:hsl(var(--color-surface));color:hsl(var(--color-text-primary));cursor:pointer;font-size:1rem;display:flex;align-items:center;justify-content:center">${isFav ? '★' : '☆'}</button>`;
  const tagHtml = tag ? `<span class="card-tag" style="display:inline-block;font-size:0.7rem;padding:2px 8px;border-radius:4px;background:hsl(${tag.color});color:#fff;margin-left:6px;font-weight:600">${escapeHtml(tag.name)}</span>` : '';

  card.innerHTML = `
    <div class="gf-stage">
      <div class="gf-back"></div>
      <div class="gf-front" style="opacity:1">
        <div class="gf-files">
          <div class="gf-sheet">
            <div class="gf-label">
              <span class="type-badge">${isDir ? '폴더' : '파일'}</span>
              <h3 style="margin:2px 0 0 0;font-size:1rem">${escapeHtml(item.name)}</h3>
              ${tagHtml}
            </div>
            <div class="gf-key">
              <button class="gf-btn-add" type="button" title="추가" aria-label="추가">+</button>
              <button class="gf-btn-more" type="button" title="더보기" aria-label="더보기">···</button>
            </div>
            <div style="margin-top:8px">${starHtml}</div>
          </div>
          <div class="gf-meta" style="font-size:0.75rem;color:hsl(var(--color-text-muted));margin-top:6px">${escapeHtml(metaText)}${snippet}</div>
          <div class="card-preview" style="margin-top:8px;padding:8px;border-radius:6px;background:hsl(var(--color-bg))/0.6;font-size:0.8rem;color:hsl(var(--color-text-secondary));display:none;border:1px dashed hsl(var(--color-border))" aria-hidden="true"></div>
        </div>
      </div>
    </div>
  `;

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    card.style.animation = 'gfEnter 0.5s ease forwards';
    card.style.animationDelay = `${index * 0.06}s`;
  }
  card.style.opacity = '1';

  const cleanup = setupParallax(card);
  cardCleanups.set(card, cleanup);

  const onAction = () => {
    if (isDir) {
      loadDocuments(currentRoot, path);
    } else {
      openViewer({ name: item.name, path: path, root: currentRoot });
    }
  };

  card.addEventListener('click', onAction);
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAction();
    }
  });

  const addBtnEl = card.querySelector('.gf-btn-add');
  const moreBtnEl = card.querySelector('.gf-btn-more');
  const starBtn = card.querySelector('.card-star');

  starBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const nowFav = toggleFavorite(path);
    starBtn.textContent = nowFav ? '★' : '☆';
    starBtn.setAttribute('aria-label', nowFav ? MSG.unstar : MSG.star);
    starBtn.setAttribute('title', nowFav ? MSG.unstar : MSG.star);
    renderGrid();
  });

  addBtnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    setStatus(`${escapeHtml(item.name)} 추가`);
  });

  moreBtnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    showQuickActions(card, item);
  });

  // Hover preview: first HOVER_PREVIEW_CHARS of document on card hover
  const preview = card.querySelector('.card-preview');
  card.addEventListener('mouseenter', () => {
    if (isDir) return;
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => {
      hoverPreview(card, path);
    }, HOVER_DEBOUNCE);
  });
  card.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    if (preview) { preview.style.display = 'none'; preview.setAttribute('aria-hidden', 'true'); preview.textContent = ''; }
    if (hoverCtrl) { hoverCtrl.abort(); hoverCtrl = null; }
  });

  grid.appendChild(card);
}

function hoverPreview(card, path) {
  const preview = card.querySelector('.card-preview');
  if (!preview) return;
  if (hoverCtrl) hoverCtrl.abort();
  hoverCtrl = new AbortController();
  preview.textContent = '미리보기 로드 중…';
  preview.style.display = 'block';
  preview.setAttribute('aria-hidden', 'false');
  fetch(`${BASE}/api/view?root=${currentRoot}&file=${encodeURIComponent(path)}`, { signal: hoverCtrl.signal })
    .then((res) => {
      if (!res.ok) throw new Error('미리보기 실패');
      return res.json();
    })
    .then((data) => {
      const text = (data.content || '').replace(/\n/g, ' ').trim();
      preview.textContent = text.slice(0, HOVER_PREVIEW_CHARS) + (text.length > HOVER_PREVIEW_CHARS ? '…' : '');
    })
    .catch((e) => {
      if (e.name === 'AbortError') return;
      preview.textContent = '미리보기를 불러올 수 없습니다.';
    })
    .finally(() => {
      hoverCtrl = null;
    });
}

/* --------------------------------------------------------------
   Drag & drop reordering
   -------------------------------------------------------------- */
let dragSourceIndex = null;
let dragOverIndex = null;

function onDragStart(e, index) {
  dragSourceIndex = index;
  e.currentTarget.classList.add('is-dragging');
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', String(index));
}

function onDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const card = e.currentTarget;
  const index = Array.from(grid.children).indexOf(card);
  if (index === -1 || index === dragSourceIndex) return;
  if (dragOverIndex === index) return;
  if (dragOverIndex !== null) {
    const prev = grid.children[dragOverIndex];
    if (prev) prev.classList.remove('drag-over');
  }
  dragOverIndex = index;
  card.classList.add('drag-over');
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
  dragOverIndex = null;
}

function onDrop(e, index) {
  e.preventDefault();
  const card = e.currentTarget;
  card.classList.remove('drag-over');
  dragOverIndex = null;
  if (dragSourceIndex === null || dragSourceIndex === index) {
    dragSourceIndex = null;
    return;
  }
  reorderItems(dragSourceIndex, index);
  dragSourceIndex = null;
}

function onDragEnd() {
  document.querySelectorAll('.gf-root.is-dragging').forEach((c) => c.classList.remove('is-dragging'));
  document.querySelectorAll('.gf-root.drag-over').forEach((c) => c.classList.remove('drag-over'));
  dragSourceIndex = null;
  dragOverIndex = null;
}

function reorderItems(from, to) {
  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved);
  page = 1;
  renderGrid();
}

/* --------------------------------------------------------------
   Sorting
   -------------------------------------------------------------- */
function compareItems(a, b) {
  if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
  let va, vb;
  if (sortBy === 'name') { va = String(a.name); vb = String(b.name); }
  else if (sortBy === 'date') { va = a.modifiedAt || ''; vb = b.modifiedAt || ''; }
  else { va = Number(a.size || 0); vb = Number(b.size || 0); }
  let c = 0;
  if (typeof va === 'string') c = va.localeCompare(vb, 'ko');
  else c = va - vb;
  return sortDir === 'asc' ? c : -c;
}

/* --------------------------------------------------------------
   Filtering / rendering
   -------------------------------------------------------------- */
function filteredItems() {
  let list = items.slice();
  if (favFilter) list = list.filter((i) => isFavorite(i.path || i.file));
  if (tagFilter) list = list.filter((i) => {
    const t = getTag(i.path || i.file);
    return t && t.name === tagFilter;
  });
  list.sort(compareItems);
  return list;
}

function renderPagination(total, count) {
  if (!paginationEl) return;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (page > totalPages) page = totalPages;
  const start = (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);
  paginationEl.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'pagination';
  wrap.style.cssText = 'display:flex;align-items:center;justify-content:center;gap:8px;padding:10px 0;font-size:0.85rem;color:hsl(var(--color-text-secondary))';
  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.textContent = MSG.prev;
  prevBtn.disabled = page === 1;
  prevBtn.style.cssText = 'padding:4px 10px;border-radius:6px;border:1px solid hsl(var(--color-border));background:hsl(var(--color-surface));color:hsl(var(--color-text-primary));cursor:pointer';
  prevBtn.addEventListener('click', () => { if (page > 1) { page--; renderGrid(); } });
  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.textContent = MSG.next;
  nextBtn.disabled = page === totalPages;
  nextBtn.style.cssText = prevBtn.style.cssText;
  nextBtn.addEventListener('click', () => { if (page < totalPages) { page++; renderGrid(); } });
  const info = document.createElement('span');
  info.textContent = `${MSG.pageOf} ${page} / ${totalPages} (${count}개)`;
  wrap.appendChild(prevBtn);
  wrap.appendChild(info);
  wrap.appendChild(nextBtn);
  paginationEl.appendChild(wrap);
}

function renderGrid() {
  clearGrid();
  const list = filteredItems();
  const total = list.length;
  if (total === 0) {
    grid.innerHTML = '<div class="empty-state" role="alert" aria-live="assertive">' + (isSearchMode ? MSG.emptySearch : MSG.empty) + '</div>';
    docCount.textContent = '0개 항목';
    if (paginationEl) paginationEl.innerHTML = '';
    return;
  }
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);
  pageItems.forEach((item, index) => createCard(item, index));
  docCount.textContent = `${total}개 항목`;
  renderPagination(total, total);
  // list view layout tweaks
  if (viewMode === 'list') {
    grid.style.display = 'block';
    grid.style.gridTemplateColumns = '1fr';
    for (const child of grid.children) {
      child.style.display = 'flex';
      child.style.flexDirection = 'column';
      child.style.width = '100%';
      child.style.aspectRatio = 'auto';
      child.style.minHeight = '72px';
    }
  } else {
    grid.style.display = '';
    grid.style.gridTemplateColumns = '';
  }
}

/* --------------------------------------------------------------
   Breadcrumb (clickable segments)
   -------------------------------------------------------------- */
function renderBreadcrumb() {
  const label = currentRoot === 'open_router' ? 'open_router/doc' : 'study/01_skill_claude';
  pageTitle.textContent = currentDir ? `${label} / ${currentDir}` : label;
  const parts = currentDir ? currentDir.split('/').filter(Boolean) : [];
  const segments = [{ label, dir: '' }];
  let acc = '';
  for (const p of parts) {
    acc = acc ? acc + '/' + p : p;
    segments.push({ label: p, dir: acc });
  }
  breadcrumb.innerHTML = '';
  segments.forEach((seg, i) => {
    const isLast = i === segments.length - 1;
    const el = document.createElement(isLast ? 'span' : 'button');
    el.textContent = seg.label;
    el.className = isLast ? 'breadcrumb-current' : 'breadcrumb-seg';
    el.setAttribute('aria-current', isLast ? 'page' : 'false');
    if (!isLast) {
      el.type = 'button';
      el.style.cssText = 'background:none;border:none;color:hsl(var(--color-accent));cursor:pointer;padding:0;font:inherit';
      el.addEventListener('click', () => loadDocuments(currentRoot, seg.dir));
    } else {
      el.style.cssText = 'color:hsl(var(--color-text-secondary));font-weight:600';
    }
    breadcrumb.appendChild(el);
    if (!isLast) {
      const sep = document.createElement('span');
      sep.textContent = ' › ';
      sep.className = 'breadcrumb-sep';
      sep.style.cssText = 'color:hsl(var(--color-text-muted));user-select:none';
      breadcrumb.appendChild(sep);
    }
  });
}

/* --------------------------------------------------------------
   Sidebar (recent + tags + fav filter)
   -------------------------------------------------------------- */
function renderSidebarRecent() {
  let section = document.getElementById('recent-section');
  if (!section) {
    section = document.createElement('section');
    section.id = 'recent-section';
    section.className = 'glass-panel';
    section.style.cssText = 'margin-bottom:24px';
    const h = document.createElement('h3');
    h.textContent = MSG.recent;
    h.style.cssText = 'font-size:0.75rem;font-weight:600;color:hsl(var(--color-text-muted));letter-spacing:0.05em;margin-bottom:10px';
    section.appendChild(h);
    const list = document.createElement('div');
    list.id = 'recent-list';
    section.appendChild(list);
    const status = document.getElementById('status');
    status.parentNode.insertBefore(section, status);
  }
  const list = document.getElementById('recent-list');
  list.innerHTML = '';
  if (recent.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'font-size:0.8rem;color:hsl(var(--color-text-muted));padding:8px';
    empty.textContent = MSG.recentEmpty;
    list.appendChild(empty);
    return;
  }
  recent.forEach((entry) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.style.cssText = 'width:100%;display:flex;align-items:center;gap:8px;padding:8px;border:none;border-radius:6px;background:hsl(var(--color-surface-elev));color:hsl(var(--color-text-primary));font-size:0.85rem;cursor:pointer;margin-bottom:6px;text-align:left';
    row.addEventListener('click', () => loadDocuments(entry.root, entry.path.substring(0, entry.path.lastIndexOf('/'))));
    const name = document.createElement('span');
    name.style.cssText = 'flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    name.textContent = entry.name;
    row.appendChild(name);
    list.appendChild(row);
  });
}

function renderSidebarTags() {
  let section = document.getElementById('tags-section');
  if (!section) {
    section = document.createElement('section');
    section.id = 'tags-section';
    section.className = 'glass-panel';
    section.style.cssText = 'margin-bottom:24px';
    const h = document.createElement('h3');
    h.textContent = MSG.tags;
    h.style.cssText = 'font-size:0.75rem;font-weight:600;color:hsl(var(--color-text-muted));letter-spacing:0.05em;margin-bottom:10px';
    section.appendChild(h);
    const chips = document.createElement('div');
    chips.id = 'tag-chips';
    chips.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px';
    section.appendChild(chips);
    const status = document.getElementById('status');
    status.parentNode.insertBefore(section, status);
  }
  const chips = document.getElementById('tag-chips');
  chips.innerHTML = '';
  const names = Object.values(tags).map((t) => t.name).filter((v, i, a) => a.indexOf(v) === i);
  names.forEach((name) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    const tagPath = Object.entries(tags).find(([, t]) => t.name === name);
    const color = tagPath ? tags[tagPath[0]].color : '210, 20%, 94%';
    chip.style.cssText = `display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;border:1px solid hsl(var(--color-border));background:hsl(${color});color:#fff;font-size:0.75rem;font-weight:600;cursor:pointer`;
    chip.textContent = name;
    chip.addEventListener('click', () => {
      tagFilter = tagFilter === name ? null : name;
      favFilter = false;
      updateFilterButtons();
      page = 1;
      renderGrid();
    });
    chips.appendChild(chip);
  });
}

function renderSidebar() {
  renderSidebarRecent();
  renderSidebarTags();
}

function updateFilterButtons() {
  if (favFilterBtn) {
    favFilterBtn.textContent = favFilter ? '★ 즐겨찾기' : '☆ 즐겨찾기';
    favFilterBtn.style.background = favFilter ? 'hsl(var(--color-accent))' : '';
    favFilterBtn.style.color = favFilter ? 'hsl(var(--color-bg))' : '';
  }
}

/* --------------------------------------------------------------
   Inline search dropdown
   -------------------------------------------------------------- */
function showSearchDropdown(results) {
  if (!searchDropdown) return;
  if (!searchInput.value.trim()) {
    searchDropdown.style.display = 'none';
    return;
  }
  searchDropdown.innerHTML = '';
  if (results.length === 0) {
    const empty = document.createElement('div');
    empty.style.cssText = 'padding:8px;font-size:0.8rem;color:hsl(var(--color-text-muted))';
    empty.textContent = '검색 결과 없음';
    searchDropdown.appendChild(empty);
    searchDropdown.style.display = 'block';
    return;
  }
  results.slice(0, 8).forEach((item) => {
    const row = document.createElement('button');
    row.type = 'button';
    row.style.cssText = 'width:100%;display:flex;flex-direction:column;gap:2px;padding:8px;border:none;border-bottom:1px solid hsl(var(--color-border));background:hsl(var(--color-surface));color:hsl(var(--color-text-primary));font-size:0.85rem;cursor:pointer;text-align:left';
    row.addEventListener('click', () => {
      searchDropdown.style.display = 'none';
      openViewer({ name: item.name, path: item.path, root: item.root });
    });
    const name = document.createElement('div');
    name.style.cssText = 'font-weight:600';
    name.textContent = item.name;
    const path = document.createElement('div');
    path.style.cssText = 'font-size:0.7rem;color:hsl(var(--color-text-muted));overflow:hidden;text-overflow:ellipsis;white-space:nowrap';
    path.textContent = item.path || item.file;
    row.appendChild(name);
    row.appendChild(path);
    searchDropdown.appendChild(row);
  });
  searchDropdown.style.display = 'block';
}

/* --------------------------------------------------------------
   Quick actions (prompt-based): rename / delete / duplicate / download
   -------------------------------------------------------------- */
function showQuickActions(card, item) {
  const isDir = item.type === 'directory';
  const actions = isDir ? ['열기', MSG.rename, MSG.delete] : [MSG.open.replace('중…',''), MSG.rename, MSG.duplicate, MSG.download, MSG.delete];
  const choice = prompt(`${item.name}\n${actions.join('\n')}`);
  if (!choice) return;
  if (choice === MSG.rename) doRename(item);
  else if (choice === MSG.delete) doDelete(item);
  else if (choice === MSG.duplicate) doDuplicate(item);
  else if (choice === MSG.download) doDownload(item);
  else if (choice === '열기' || choice === MSG.open.replace('중…','')) {
    if (isDir) loadDocuments(currentRoot, item.path);
    else openViewer(item);
  } else {
    setStatus(`알 수 없는 작업: ${escapeHtml(choice)}`);
  }
}

function doRename(item) {
  const name = prompt(`새 이름을 입력하세요 (${escapeHtml(item.name)})`);
  if (!name) return;
  const oldName = item.name;
  item.name = name;
  const idx = items.findIndex((i) => (i.path || i.file) === (item.path || item.file));
  if (idx !== -1) items[idx].name = name;
  renderGrid();
  undoStack.push({ type: 'rename', item, oldName, path: item.path });
  toast(MSG.opRenamed, 'success', () => {
    item.name = oldName;
    if (idx !== -1) items[idx].name = oldName;
    renderGrid();
    toast('이름 변경 취소됨');
  });
}

function doDelete(item) {
  if (!confirm(`정말로 "${escapeHtml(item.name)}"을(를) 삭제하시겠습니까?`)) return;
  const idx = items.findIndex((i) => (i.path || i.file) === (item.path || item.file));
  const removed = idx !== -1 ? items.splice(idx, 1)[0] : null;
  renderGrid();
  undoStack.push({ type: 'delete', item: removed, idx });
  toast(MSG.opDeleted, 'success', () => {
    if (removed) {
      items.splice(removedIdx(removed, idx), 0, removed);
      renderGrid();
      toast('삭제 취소됨');
    }
  });
}

function removedIdx(removed, originalIdx) {
  return originalIdx !== null ? originalIdx : items.length;
}

function doDuplicate(item) {
  const name = prompt(`복제할 이름을 입력하세요 (${escapeHtml(item.name)})`, `${item.name} (복사본)`);
  if (!name) return;
  const copy = { ...item, name };
  items.push(copy);
  renderGrid();
  undoStack.push({ type: 'duplicate', item: copy });
  toast(MSG.opDuplicated, 'success', () => {
    const idx = items.findIndex((i) => (i.path || i.file) === (copy.path || copy.file));
    if (idx !== -1) items.splice(idx, 1);
    renderGrid();
    toast('복제 취소됨');
  });
}

function doDownload(item) {
  fetch(`${BASE}/api/view?root=${currentRoot}&file=${encodeURIComponent(item.path || item.file)}`)
    .then((res) => {
      if (!res.ok) throw new Error('다운로드 실패');
      return res.json();
    })
    .then((data) => {
      const blob = new Blob([data.content || ''], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = item.name;
      a.click();
      URL.revokeObjectURL(url);
      toast(MSG.opDownloaded, 'success', () => {
        toast('다운로드 취소(작업 없음)');
      });
    })
    .catch(() => toast('다운로드 실패', 'error'));
}

/* --------------------------------------------------------------
   Export (CSV / JSON)
   -------------------------------------------------------------- */
function exportData(format) {
  const list = filteredItems();
  if (format === 'json') {
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json;charset=utf-8' });
    downloadBlob(blob, 'openrouter_documents.json', 'application/json');
  } else {
    const lines = ['이름,유형,경로,크기,수정일'];
    for (const item of list) {
      lines.push([
        escapeCsv(item.name),
        item.type,
        escapeCsv(item.path || item.file),
        item.size,
        item.modifiedAt || ''
      ].join(','));
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    downloadBlob(blob, 'openrouter_documents.csv', 'text/csv');
  }
  toast('내보내기 완료');
}

function escapeCsv(v) {
  const s = String(v == null ? '' : v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function downloadBlob(blob, name, type) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* --------------------------------------------------------------
   View mode toggle
   -------------------------------------------------------------- */
function toggleViewMode() {
  viewMode = viewMode === 'grid' ? 'list' : 'grid';
  if (viewToggleBtn) viewToggleBtn.textContent = viewMode === 'grid' ? MSG.viewGrid : MSG.viewList;
  page = 1;
  renderGrid();
}

/* --------------------------------------------------------------
   Documents / viewer / search
   -------------------------------------------------------------- */
async function loadDocuments(root, dir) {
  if (isLoading) return;
  isLoading = true;
  currentRoot = root;
  currentDir = dir;
  isSearchMode = false;
  searchInput.value = '';
  tagFilter = null;
  favFilter = false;
  page = 1;
  updateFilterButtons();

  const label = root === 'open_router' ? 'open_router/doc' : 'study/01_skill_claude';
  pageTitle.textContent = dir ? `${label} / ${dir}` : label;
  renderBreadcrumb();
  docCount.textContent = '';

  sidebarItems.forEach((el) => {
    el.classList.toggle('active', el.dataset.root === root);
  });

  setBusy(refreshBtn, true);
  toast(MSG.load);
  clearGrid();
  navigate({ root, dir });

  try {
    const res = await fetch(`${BASE}/api/documents?root=${root}${dir ? '&dir=' + encodeURIComponent(dir) : ''}`);
    if (!res.ok) throw new Error('문서 목록을 불러오지 못했습니다.');
    const data = await res.json();
    items = data.items || [];
    renderGrid();
    docCount.textContent = `${data.items.length}개 항목`;
    toast(MSG.ready);
  } catch (e) {
    showGridError(MSG.loadError, () => loadDocuments(root, dir));
  } finally {
    isLoading = false;
    setBusy(refreshBtn, false);
  }
}

async function openViewer(item) {
  if (isLoading) return;
  const lastFocused = document.activeElement;
  viewerTrap = null;
  isLoading = true;

  if (busyCard) setBusy(busyCard, false);
  busyCard = document.querySelector(`[data-path="${cssEscape(item.path)}"]`);
  setBusy(busyCard, true);
  setBusy(closeViewerBtn, true);
  toast(MSG.open);

  addRecent(item);

  try {
    const res = await fetch(`${BASE}/api/view?root=${currentRoot}&file=${encodeURIComponent(item.path)}`);
    if (!res.ok) throw new Error('파일을 불러오지 못했습니다.');
    const data = await res.json();
    viewerTitle.textContent = data.name;
    viewerContent.textContent = data.content;
    viewerOverlay.setAttribute('aria-hidden', 'false');
    viewerOverlay.style.display = 'flex';
    viewerTrap = trapFocus(viewerOverlay);
    closeViewerBtn.focus();
    navigate({ root: currentRoot, dir: currentDir, file: item.path });
    toast(MSG.ready);
  } catch (e) {
    showGridError(MSG.openError, () => openViewer(item));
    toast(MSG.openError, 'error');
  } finally {
    isLoading = false;
    setBusy(closeViewerBtn, false);
    if (busyCard) setBusy(busyCard, false);
    busyCard = null;
  }
}

function closeViewer() {
  if (viewerTrap) {
    viewerTrap();
    viewerTrap = null;
  }
  viewerOverlay.setAttribute('aria-hidden', 'true');
  viewerOverlay.style.display = 'none';
  viewerContent.textContent = '';
  viewerTitle.textContent = '';
  history.pushState({ root: currentRoot, dir: currentDir }, '', buildURL({ root: currentRoot, dir: currentDir }));
}

async function searchDocuments(q) {
  if (isLoading) return;
  isSearchMode = true;
  currentDir = '';
  pageTitle.textContent = `검색: "${escapeHtml(q)}"`;
  breadcrumb.textContent = '검색 결과';
  docCount.textContent = '';
  setBusy(searchBtn, true);
  toast(MSG.search);
  clearGrid();
  navigate({ search: '1', q, root: currentRoot });

  try {
    const res = await fetch(`${BASE}/api/search?q=${encodeURIComponent(q)}${currentRoot ? '&root=' + encodeURIComponent(currentRoot) : ''}`);
    if (!res.ok) throw new Error('검색 실패');
    const data = await res.json();
    items = data.results || [];
    renderGrid();
    docCount.textContent = `${data.results.length}개 결과`;
    toast(MSG.ready);
  } catch (e) {
    showGridError(MSG.searchError, () => searchDocuments(q));
    toast(MSG.searchError, 'error');
  } finally {
    isLoading = false;
    setBusy(searchBtn, false);
  }
}

/* --------------------------------------------------------------
   Shortcuts hint
   -------------------------------------------------------------- */
function toggleShortcuts() {
  if (shortcutsEl && shortcutsVisible) {
    shortcutsEl.remove();
    shortcutsVisible = false;
    return;
  }
  shortcutsVisible = true;
  if (shortcutsEl) shortcutsEl.remove();
  const box = document.createElement('div');
  shortcutsEl = box;
  box.id = 'shortcuts-hint';
  box.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:2000;background:hsl(var(--color-surface));border:1px solid hsl(var(--color-border));border-radius:10px;padding:24px 32px;box-shadow:0 20px 40px hsl(var(--color-text-primary) / 0.2);max-width:420px;color:hsl(var(--color-text-primary));animation:toastIn 0.2s ease both';
  box.innerHTML = `
    <h3 style="margin:0 0 12px 0;font-size:1rem;color:hsl(var(--color-accent))">${MSG.shortcuts}</h3>
    <table style="width:100%;font-size:0.85rem;border-collapse:collapse">
      <tr><td style="padding:4px;padding-right:8px;text-align:right;color:hsl(var(--color-text-muted))">Ctrl + F</td><td style="padding:4px">검색 입력 포커스</td></tr>
      <tr><td style="padding:4px;padding-right:8px;text-align:right;color:hsl(var(--color-text-muted))">/</td><td style="padding:4px">검색 입력 포커스</td></tr>
      <tr><td style="padding:4px;padding-right:8px;text-align:right;color:hsl(var(--color-text-muted))">Ctrl + N</td><td style="padding:4px">새 폴더/문서</td></tr>
      <tr><td style="padding:4px;padding-right:8px;text-align:right;color:hsl(var(--color-text-muted))">Ctrl + O</td><td style="padding:4px">포커스 항목 열기</td></tr>
      <tr><td style="padding:4px;padding-right:8px;text-align:right;color:hsl(var(--color-text-muted))">Esc</td><td style="padding:4px">뷰어 닫기</td></tr>
      <tr><td style="padding:4px;padding-right:8px;text-align:right;color:hsl(var(--color-text-muted))">?</td><td style="padding:4px">단축키 힌트 표시/숨기기</td></tr>
    </table>
    <button type="button" style="margin-top:12px;padding:6px 12px;border-radius:6px;border:1px solid hsl(var(--color-border));background:hsl(var(--color-surface));color:hsl(var(--color-text-primary));cursor:pointer">닫기</button>
  `;
  box.querySelector('button').addEventListener('click', () => {
    box.remove();
    shortcutsVisible = false;
    shortcutsEl = null;
  });
  document.body.appendChild(box);
}

function handleGlobalKeydown(e) {
  if (e.ctrlKey && e.key.toLowerCase() === 'f') {
    e.preventDefault();
    searchInput.focus();
    return;
  }
  if (e.key === '/' && !isInputFocused()) {
    e.preventDefault();
    searchInput.focus();
    return;
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'n') {
    e.preventDefault();
    const name = prompt('새 폴더/문서 이름을 입력하세요');
    if (name) setStatus(`추가: ${escapeHtml(name)}`);
    return;
  }
  if (e.ctrlKey && e.key.toLowerCase() === 'o') {
    e.preventDefault();
    const focused = document.querySelector('.gf-root:focus-visible, .gf-root[tabindex="0"]:focus');
    if (focused) focused.click();
    return;
  }
  if (e.key === 'Escape') {
    closeViewer();
    if (shortcutsEl) { shortcutsEl.remove(); shortcutsVisible = false; shortcutsEl = null; }
    return;
  }
  if (e.key === '?') {
    e.preventDefault();
    toggleShortcuts();
    return;
  }
}

/* --------------------------------------------------------------
   UI injection (toolbar, pagination, dark mode, filters)
   -------------------------------------------------------------- */
function initInjectedUI() {
  // Search dropdown (inline quick search results)
  searchDropdown = document.createElement('div');
  searchDropdown.id = 'searchDropdown';
  searchDropdown.className = 'search-dropdown';
  searchDropdown.style.cssText = 'position:absolute;top:100%;left:0;right:0;width:calc(100% - 32px);margin-top:6px;z-index:600;border:1px solid hsl(var(--color-border));border-radius:8px;background:hsl(var(--color-surface));box-shadow:0 10px 24px hsl(var(--color-text-primary) / 0.15);display:none';
  searchInput.parentNode.insertBefore(searchDropdown, searchInput.nextSibling);

  // Toolbar additions
  const toolbar = document.getElementById('toolbar');

  viewToggleBtn = document.createElement('button');
  viewToggleBtn.type = 'button';
  viewToggleBtn.className = 'glass-key';
  viewToggleBtn.textContent = viewMode === 'grid' ? MSG.viewGrid : MSG.viewList;
  viewToggleBtn.title = '보기 모드';
  viewToggleBtn.style.cssText = 'margin-left:8px';
  viewToggleBtn.addEventListener('click', toggleViewMode);
  toolbar.appendChild(viewToggleBtn);

  const sortLabel = document.createElement('span');
  sortLabel.textContent = MSG.sort + ':';
  sortLabel.style.cssText = 'margin-left:10px;font-size:0.8rem;color:hsl(var(--color-text-muted));white-space:nowrap';
  toolbar.appendChild(sortLabel);

  sortSelect = document.createElement('select');
  sortSelect.style.cssText = 'margin-left:6px;padding:4px 8px;border-radius:6px;border:1px solid hsl(var(--color-border));background:hsl(var(--color-surface));color:hsl(var(--color-text-primary));font-size:0.8rem';
  const opts = [
    [MSG.sortNameAsc, 'name', 'asc'],
    [MSG.sortNameDesc, 'name', 'desc'],
    [MSG.sortDateAsc, 'date', 'asc'],
    [MSG.sortDateDesc, 'date', 'desc'],
    [MSG.sortSizeAsc, 'size', 'asc'],
    [MSG.sortSizeDesc, 'size', 'desc'],
  ];
  opts.forEach(([label, by, dir]) => {
    const o = document.createElement('option');
    o.value = `${by}:${dir}`;
    o.textContent = label;
    if (by === sortBy && dir === sortDir) o.selected = true;
    sortSelect.appendChild(o);
  });
  sortSelect.addEventListener('change', () => {
    const [by, dir] = sortSelect.value.split(':');
    sortBy = by;
    sortDir = dir;
    page = 1;
    renderGrid();
  });
  toolbar.appendChild(sortSelect);

  exportCsvBtn = document.createElement('button');
  exportCsvBtn.type = 'button';
  exportCsvBtn.className = 'glass-key';
  exportCsvBtn.textContent = MSG.exportCsv;
  exportCsvBtn.title = MSG.export;
  exportCsvBtn.style.cssText = 'margin-left:8px;font-size:0.75rem;padding:6px 10px';
  exportCsvBtn.addEventListener('click', () => exportData('csv'));
  toolbar.appendChild(exportCsvBtn);

  exportJsonBtn = document.createElement('button');
  exportJsonBtn.type = 'button';
  exportJsonBtn.className = 'glass-key';
  exportJsonBtn.textContent = MSG.exportJson;
  exportJsonBtn.title = MSG.export;
  exportJsonBtn.style.cssText = 'margin-left:6px;font-size:0.75rem;padding:6px 10px';
  exportJsonBtn.addEventListener('click', () => exportData('json'));
  toolbar.appendChild(exportJsonBtn);

  favFilterBtn = document.createElement('button');
  favFilterBtn.type = 'button';
  favFilterBtn.className = 'glass-key';
  favFilterBtn.textContent = '☆ ' + MSG.favorites;
  favFilterBtn.title = MSG.favOnly;
  favFilterBtn.style.cssText = 'margin-left:8px;font-size:0.75rem;padding:6px 10px';
  favFilterBtn.addEventListener('click', () => {
    favFilter = !favFilter;
    tagFilter = null;
    page = 1;
    updateFilterButtons();
    renderGrid();
  });
  toolbar.appendChild(favFilterBtn);

  darkToggleBtn = document.createElement('button');
  darkToggleBtn.type = 'button';
  darkToggleBtn.className = 'glass-key';
  darkToggleBtn.textContent = darkMode ? '☀️' : '🌙';
  darkToggleBtn.title = darkMode ? MSG.light : MSG.dark;
  darkToggleBtn.style.cssText = 'margin-left:8px;font-size:1rem;padding:6px';
  darkToggleBtn.addEventListener('click', () => setDarkMode(!darkMode));
  toolbar.appendChild(darkToggleBtn);

  // Pagination bar below grid
  const gridSection = document.querySelector('.grid-section') || grid.parentNode;
  paginationEl = document.createElement('div');
  paginationEl.id = 'pagination';
  gridSection.appendChild(paginationEl);

  // Restore dark mode
  setDarkMode(darkMode);

  // Initial search dropdown empty
  searchDropdown.style.display = 'none';
}

/* --------------------------------------------------------------
   Event listeners
   -------------------------------------------------------------- */
function attachListeners() {
  sidebarItems.forEach((el) => {
    el.addEventListener('click', () => loadDocuments(el.dataset.root));
  });

  refreshBtn.addEventListener('click', () => loadDocuments(currentRoot, currentDir));

  addBtn.addEventListener('click', () => {
    const name = prompt('새 문서/폴더 이름을 입력하세요');
    if (name) setStatus(`추가: ${escapeHtml(name)}`);
  });

  moreBtn.addEventListener('click', () => {
    const choice = prompt(`전체 작업\n폴더 열기\n이름 변경\n삭제\n설정`);
    if (choice) setStatus(`선택: ${escapeHtml(choice)}`);
  });

  // Debounced quick search with inline dropdown
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimer);
    clearTimeout(dropdownTimer);
    const q = e.target.value.trim();
    searchTimer = setTimeout(() => {
      searchDropdown.style.display = 'none';
      if (q) {
        searchDocuments(q);
      } else {
        loadDocuments(currentRoot, currentDir);
      }
    }, SEARCH_DEBOUNCE);
    dropdownTimer = setTimeout(() => {
      if (!q) { searchDropdown.style.display = 'none'; return; }
      fetch(`${BASE}/api/search?q=${encodeURIComponent(q)}${currentRoot ? '&root=' + encodeURIComponent(currentRoot) : ''}`)
        .then((res) => res.json())
        .then((data) => showSearchDropdown(data.results || []))
        .catch(() => { searchDropdown.style.display = 'none'; });
    }, SEARCH_DEBOUNCE);
  });

  searchBtn.addEventListener('click', () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (q) searchDocuments(q);
  });

  closeViewerBtn.addEventListener('click', closeViewer);

  copyBtn.addEventListener('click', async () => {
    const text = viewerContent.textContent || '';
    try {
      await navigator.clipboard.writeText(text);
      const original = copyBtn.textContent;
      copyBtn.textContent = '복사됨';
      copyBtn.setAttribute('aria-checked', 'true');
      toast(MSG.copySuccess);
      setTimeout(() => {
        copyBtn.textContent = original;
        copyBtn.removeAttribute('aria-checked');
      }, 1500);
    } catch (e) {
      toast(MSG.copyError, 'error');
    }
  });

  viewerOverlay.addEventListener('click', (e) => {
    if (e.target === viewerOverlay) closeViewer();
  });

  viewerOverlay.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeViewer();
  });

  window.addEventListener('popstate', () => {
    if (viewerOverlay.style.display === 'flex') closeViewer();
    parseLocation();
  });

  document.addEventListener('keydown', handleGlobalKeydown);

  // Drag & drop delegation on grid
  grid.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.gf-root');
    if (!card) return;
    const index = Array.from(grid.children).indexOf(card);
    if (index === -1) return;
    onDragStart(e, index);
  });
  grid.addEventListener('dragover', (e) => {
    const card = e.target.closest('.gf-root');
    if (!card) return;
    const index = Array.from(grid.children).indexOf(card);
    if (index === -1) return;
    onDragOver(e);
  });
  grid.addEventListener('dragleave', (e) => {
    const card = e.target.closest('.gf-root');
    if (card) onDragLeave(e);
  });
  grid.addEventListener('drop', (e) => {
    const card = e.target.closest('.gf-root');
    if (!card) return;
    const index = Array.from(grid.children).indexOf(card);
    if (index === -1) return;
    onDrop(e, index);
  });
  grid.addEventListener('dragend', () => onDragEnd());
}

/* --------------------------------------------------------------
   Init
   -------------------------------------------------------------- */
function init() {
  initInjectedUI();
  attachListeners();
  renderSidebar();
  parseLocation();
}

init();
