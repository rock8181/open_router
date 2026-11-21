const BASE = '';
let currentRoot = 'open_router';
let currentDir = '';
let isSearchMode = false;
let isLoading = false;
let lastFocused = null;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

function setStatus(msg, type = 'info') {
  statusEl.textContent = msg;
  statusEl.className = `status ${type}`;
}

function setBusy(el, busy) {
  if (!el) return;
  el.disabled = busy;
  el.setAttribute('aria-busy', busy);
}

async function loadDocuments(root, dir = '') {
  if (isLoading) return;
  isLoading = true;
  currentRoot = root;
  currentDir = dir;
  isSearchMode = false;
  searchInput.value = '';

  sidebarItems.forEach(el => {
    el.classList.toggle('active', el.dataset.root === root);
  });

  const label = root === 'open_router' ? 'open_router/doc' : 'study/01_skill_claude';
  pageTitle.textContent = dir ? `${label} / ${dir}` : label;
  breadcrumb.textContent = `${label}${dir ? ' > ' + dir : ''}`;

  setBusy(refreshBtn, true);
  setStatus('로드 중...');
  try {
    const res = await fetch(`${BASE}/api/documents?root=${root}${dir ? '&dir=' + encodeURIComponent(dir) : ''}`);
    if (!res.ok) throw new Error('Failed to load');
    const data = await res.json();
    renderGrid(data.items);
    docCount.textContent = `${data.items.length}개 항목`;
    setStatus('준비');
  } catch (e) {
    setStatus('오류: ' + e.message, 'error');
    grid.innerHTML = '<div class="empty-state" role="alert">문서를 불러오지 못했습니다.</div>';
  } finally {
    isLoading = false;
    setBusy(refreshBtn, false);
  }
}

function renderGrid(items) {
  grid.innerHTML = '';
  if (items.length === 0) {
    grid.innerHTML = '<div class="empty-state">문서가 없습니다.</div>';
    return;
  }
  items.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = `gf-root type-${item.type}`;
    card.dataset.path = item.path;
    card.dataset.type = item.type;
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', item.name);
    card.setAttribute('aria-expanded', 'false');
    card.innerHTML = `
      <div class="gf-stage">
        <div class="gf-back"></div>
        <div class="gf-front">
          <div class="gf-files">
            <div class="gf-sheet">
              <div class="gf-label">
                <span class="type-badge">${item.type === 'directory' ? '폴더' : '파일'}</span>
                <h3>${escapeHtml(item.name)}</h3>
                <div class="meta">
                  ${item.type === 'file' ? `크기: ${formatSize(item.size)}` : '폴더'}
                  ${item.modifiedAt ? ' | ' + new Date(item.modifiedAt).toLocaleDateString('ko-KR') : ''}
                </div>
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

    if (!prefersReducedMotion) {
      card.style.animation = 'gfEnter 0.5s ease forwards';
      card.style.animationDelay = `${index * 0.06}s`;
    }
    card.style.opacity = prefersReducedMotion ? '1' : '0';

    const onCardClick = () => {
      if (item.type === 'directory') {
        loadDocuments(currentRoot, item.path);
      } else {
        openViewer(item);
      }
    };

    card.addEventListener('click', onCardClick);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onCardClick();
      }
    });

    const addBtnEl = card.querySelector('.gf-btn-add');
    const moreBtnEl = card.querySelector('.gf-btn-more');

    addBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (item.type === 'directory') {
        const name = prompt('새 문서/폴더 이름');
        if (name) {
          setStatus(`추가: ${escapeHtml(name)}`);
        }
      } else {
        setStatus(`${escapeHtml(item.name)} 추가`);
      }
    });

    moreBtnEl.addEventListener('click', (e) => {
      e.stopPropagation();
      const actions = item.type === 'directory'
        ? ['폴더 열기', '이름 변경', '삭제']
        : ['문서 열기', '복사', '이름 변경', '삭제'];
      const choice = prompt(`더보기 - ${escapeHtml(item.name)}\n${actions.join('\n')}`);
      if (choice) {
        setStatus(`선택: ${escapeHtml(choice)}`);
      }
    });

    const front = card.querySelector('.gf-front');
    const back = card.querySelector('.gf-back');

    if (!prefersReducedMotion) {
      card.addEventListener('mousemove', handleParallax);
      card.addEventListener('mouseleave', handleParallaxLeave);
    }

    function handleParallax(e) {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      front.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      back.style.transform = `translate(${x * -6}px, ${y * -6}px)`;
    }

    function handleParallaxLeave() {
      front.style.transform = '';
      back.style.transform = '';
    }

    grid.appendChild(card);
  });
}

async function openViewer(item) {
  if (isLoading) return;
  lastFocused = document.activeElement;
  isLoading = true;
  setBusy(closeViewerBtn, true);
  setStatus('문서 열기 중...');
  try {
    const res = await fetch(`${BASE}/api/view?root=${currentRoot}&file=${encodeURIComponent(item.path)}`);
    if (!res.ok) throw new Error('Failed to load file');
    const data = await res.json();
    viewerTitle.textContent = data.name;
    viewerContent.textContent = data.content;
    viewerOverlay.setAttribute('aria-hidden', 'false');
    viewerOverlay.style.display = 'flex';
    viewerOverlay.focus();
    setStatus('준비');
  } catch (e) {
    setStatus('오류: ' + e.message, 'error');
    grid.innerHTML = '<div class="empty-state" role="alert">파일을 불러오지 못했습니다.</div>';
  } finally {
    isLoading = false;
    setBusy(closeViewerBtn, false);
  }
}

function closeViewer() {
  viewerOverlay.setAttribute('aria-hidden', 'true');
  viewerOverlay.style.display = 'none';
  viewerContent.textContent = '';
  lastFocused?.focus();
  lastFocused = null;
}

async function searchDocuments(q) {
  if (isLoading) return;
  isSearchMode = true;
  pageTitle.textContent = `검색: "${q}"`;
  breadcrumb.textContent = `검색 결과`;
  setBusy(searchBtn, true);
  setStatus('검색 중...');
  try {
    const res = await fetch(`${BASE}/api/search?q=${encodeURIComponent(q)}${currentRoot ? '&root=' + currentRoot : ''}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    renderSearchResults(data.results);
    docCount.textContent = `${data.results.length}개 결과`;
    setStatus('준비');
  } catch (e) {
    setStatus('검색 오류: ' + e.message, 'error');
    grid.innerHTML = '<div class="empty-state" role="alert">검색에 실패했습니다.</div>';
  } finally {
    isLoading = false;
    setBusy(searchBtn, false);
  }
}

function renderSearchResults(results) {
  grid.innerHTML = '';
  if (results.length === 0) {
    grid.innerHTML = '<div class="empty-state">검색 결과가 없습니다.</div>';
    return;
  }
  results.forEach((item, index) => {
    const card = document.createElement('div');
    card.className = 'gf-root type-file';
    card.dataset.path = item.file;
    card.dataset.type = 'file';
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', item.name);
    card.innerHTML = `
      <div class="gf-stage">
        <div class="gf-back"></div>
        <div class="gf-front">
          <div class="gf-files">
            <div class="gf-sheet">
              <div class="gf-label">
                <span class="type-badge">파일</span>
                <h3>${escapeHtml(item.name)}</h3>
                <div class="meta">
                  [${item.root}] ${item.path}
                  ${item.snippet ? ' | ' : ''}
                </div>
                ${item.snippet ? `<div style="margin-top:8px;font-size:0.85rem;color:#94a3b8;">${escapeHtml(item.snippet)}</div>` : ''}
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

    if (!prefersReducedMotion) {
      card.style.animation = 'gfEnter 0.5s ease forwards';
      card.style.animationDelay = `${index * 0.06}s`;
    }
    card.style.opacity = prefersReducedMotion ? '1' : '0';

    card.addEventListener('click', () => openViewer({ name: item.name, path: item.file }));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openViewer({ name: item.name, path: item.file });
      }
    });

    card.querySelector('.gf-btn-add').addEventListener('click', (e) => {
      e.stopPropagation();
      setStatus(`${escapeHtml(item.name)} 추가`);
    });

    card.querySelector('.gf-btn-more').addEventListener('click', (e) => {
      e.stopPropagation();
      const choice = prompt(`더보기 - ${escapeHtml(item.name)}\n문서 열기\n복사\n이름 변경\n삭제`);
      if (choice) {
        setStatus(`선택: ${escapeHtml(choice)}`);
      }
    });

    const front = card.querySelector('.gf-front');
    const back = card.querySelector('.gf-back');

    if (!prefersReducedMotion) {
      card.addEventListener('mousemove', handleParallax);
      card.addEventListener('mouseleave', handleParallaxLeave);
    }

    function handleParallax(e) {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      front.style.transform = `translate(${x * 10}px, ${y * 10}px)`;
      back.style.transform = `translate(${x * -6}px, ${y * -6}px)`;
    }

    function handleParallaxLeave() {
      front.style.transform = '';
      back.style.transform = '';
    }

    grid.appendChild(card);
  });
}

function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

sidebarItems.forEach(el => {
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
  const q = searchInput.value.trim();
  if (q) searchDocuments(q);
});

searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.isComposing) {
    const q = searchInput.value.trim();
    if (q) searchDocuments(q);
  }
});

closeViewerBtn.addEventListener('click', closeViewer);

copyBtn.addEventListener('click', () => {
  const text = viewerContent.textContent || viewerContent.innerText;
  navigator.clipboard.writeText(text).then(() => {
    const original = copyBtn.textContent;
    copyBtn.textContent = '복사됨';
    setTimeout(() => { copyBtn.textContent = original; }, 1500);
  }).catch(() => {
    setStatus('클립보드 복사 실패', 'error');
  });
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

loadDocuments(currentRoot);
