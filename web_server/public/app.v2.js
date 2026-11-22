const BASE = '';
let currentRoot = 'open_router';
let currentDir = '';
let isSearchMode = false;
let isLoading = false;
let lastFocused = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

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

let searchTimer = null;
let viewerTrap = null;
let viewerPendingItem = null;
let busyCard = null;
const cardCleanups = new WeakMap();

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
};

function setStatus(msg, type = 'info') {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function setBusy(el, busy) {
  if (!el) return;
  el.disabled = busy;
  el.setAttribute('aria-busy', String(busy));
}

function toast(msg, kind = 'info') {
  setStatus(msg, kind);
  if (kind !== 'error') {
    clearTimeout(statusEl._t);
    statusEl._t = setTimeout(() => {
      setStatus(MSG.ready, 'info');
    }, 3000);
  }
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

function cssEscape(value) {
  return window.CSS && window.CSS.escape ? window.CSS.escape(value) : String(value).replace(/[!"#$%&'()*+,.\/:;<=>?@\[\\\]^`{|}~]/g, '\\$&');
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

function clearGrid() {
  for (const child of grid.children) {
    const cleanup = cardCleanups.get(child);
    if (cleanup) cleanup();
  }
  grid.innerHTML = '';
}

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

function createCard(item, index) {
  const isDir = item.type === 'directory';
  const isSearchResult = !!item.root;
  const path = item.path || item.file;

  const card = document.createElement('div');
  card.className = `gf-root type-${isDir ? 'directory' : 'file'}`;
  card.dataset.path = path;
  card.dataset.type = isDir ? 'directory' : 'file';
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', item.name);
  card.setAttribute('aria-expanded', 'false');

  let metaText;
  if (isSearchResult) {
    metaText = `[${escapeHtml(String(item.root))}] ${escapeHtml(String(path))}`;
    if (item.snippet) metaText += ' | ';
  } else if (isDir) {
    metaText = '폴더';
    if (item.modifiedAt) metaText += ' | ' + new Date(item.modifiedAt).toLocaleDateString('ko-KR');
  } else {
    metaText = `크기: ${formatSize(item.size)}`;
    if (item.modifiedAt) metaText += ' | ' + new Date(item.modifiedAt).toLocaleDateString('ko-KR');
  }

  const snippet = isSearchResult && item.snippet
    ? `<div style="margin-top:8px;font-size:0.85rem;color:#94a3b8;">${escapeHtml(item.snippet)}</div>`
    : '';

  card.innerHTML = `
    <div class="gf-stage">
      <div class="gf-back"></div>
      <div class="gf-front">
        <div class="gf-files">
          <div class="gf-sheet">
            <div class="gf-label">
              <span class="type-badge">${isDir ? '폴더' : '파일'}</span>
              <h3>${escapeHtml(item.name)}</h3>
              <div class="meta">${escapeHtml(metaText)}${snippet}</div>
            </div>
            <div class="gf-key">
              <button class="gf-btn-add" type="button" title="추가" aria-label="추가">+</button>
              <button class="gf-btn-more" type="button" title="더보기" aria-label="더보기">···</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  if (!prefersReducedMotion.matches) {
    card.style.animation = 'gfEnter 0.5s ease forwards';
    card.style.animationDelay = `${index * 0.06}s`;
  }
  card.style.opacity = prefersReducedMotion.matches ? '1' : '0';

  const cleanup = setupParallax(card);
  cardCleanups.set(card, cleanup);

  const onAction = () => {
    if (isDir) {
      loadDocuments(currentRoot, path);
    } else {
      openViewer({ name: item.name, path: path });
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

  addBtnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    setStatus(`${escapeHtml(item.name)} 추가`);
  });

  moreBtnEl.addEventListener('click', (e) => {
    e.stopPropagation();
    const actions = isDir
      ? ['폴더 열기', '이름 변경', '삭제']
      : ['문서 열기', '복사', '이름 변경', '삭제'];
    const choice = prompt(`더보기 - ${escapeHtml(item.name)}\n${actions.join('\n')}`);
    if (choice) {
      setStatus(`선택: ${escapeHtml(choice)}`);
    }
  });

  grid.appendChild(card);
}

async function loadDocuments(root, dir) {
  if (isLoading) return;
  isLoading = true;
  currentRoot = root;
  currentDir = dir;
  isSearchMode = false;
  searchInput.value = '';

  const label = root === 'open_router' ? 'open_router/doc' : 'study/01_skill_claude';
  pageTitle.textContent = dir ? `${label} / ${dir}` : label;
  breadcrumb.textContent = `${label}${dir ? ' > ' + dir : ''}`;
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
    renderGrid(data.items);
    docCount.textContent = `${data.items.length}개 항목`;
    toast(MSG.ready);
  } catch (e) {
    showGridError(MSG.loadError, () => loadDocuments(root, dir));
  } finally {
    isLoading = false;
    setBusy(refreshBtn, false);
  }
}

function renderGrid(items) {
  clearGrid();
  if (items.length === 0) {
    grid.innerHTML = '<div class="empty-state" role="alert" aria-live="assertive">' + MSG.empty + '</div>';
    return;
  }
  items.forEach((item, index) => createCard(item, index));
}

async function openViewer(item) {
  if (isLoading) return;
  lastFocused = document.activeElement;
  viewerPendingItem = item;
  isLoading = true;

  if (busyCard) setBusy(busyCard, false);
  busyCard = document.querySelector(`[data-path="${cssEscape(item.path)}"]`);
  setBusy(busyCard, true);
  setBusy(closeViewerBtn, true);
  toast(MSG.open);

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
  lastFocused?.focus();
  lastFocused = null;
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
    renderSearchResults(data.results);
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

function renderSearchResults(results) {
  clearGrid();
  if (results.length === 0) {
    grid.innerHTML = '<div class="empty-state" role="alert" aria-live="assertive">' + MSG.emptySearch + '</div>';
    return;
  }
  results.forEach((item, index) => createCard(item, index));
}

sidebarItems.forEach((el) => {
  el.addEventListener('click', () => loadDocuments(el.dataset.root));
});

refreshBtn.addEventListener('click', () => loadDocuments(currentRoot, currentDir));

addBtn.addEventListener('click', () => {
  const name = prompt('새 문서/폴더 이름을 입력하세요');
  if (name) {
    setStatus(`추가: ${escapeHtml(name)}`);
  }
});

moreBtn.addEventListener('click', () => {
  const choice = prompt(`전체 작업\n폴더 열기\n이름 변경\n삭제\n설정`);
  if (choice) {
    setStatus(`선택: ${escapeHtml(choice)}`);
  }
});

searchBtn.addEventListener('click', () => {
  clearTimeout(searchTimer);
  const q = searchInput.value.trim();
  if (q) searchDocuments(q);
});

searchInput.addEventListener('input', (e) => {
  clearTimeout(searchTimer);
  const q = e.target.value.trim();
  searchTimer = setTimeout(() => {
    if (q) {
      searchDocuments(q);
    } else {
      loadDocuments(currentRoot, currentDir);
    }
  }, 300);
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
  if (e.target === viewerOverlay) {
    closeViewer();
  }
});

viewerOverlay.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeViewer();
  }
});

window.addEventListener('popstate', () => {
  if (viewerOverlay.style.display === 'flex') closeViewer();
  parseLocation();
});

parseLocation();
