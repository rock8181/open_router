const BASE = '';
let currentRoot = 'open_router';
let currentDir = '';
let isSearchMode = false;

const sidebarItems = document.querySelectorAll('.nav-item');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const refreshBtn = document.getElementById('refreshBtn');
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

async function loadDocuments(root, dir = '') {
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
    grid.innerHTML = '<div class="empty-state">문서를 불러오지 못했습니다.</div>';
  }
}

function renderGrid(items) {
  grid.innerHTML = '';
  if (items.length === 0) {
    grid.innerHTML = '<div class="empty-state">문서가 없습니다.</div>';
    return;
  }
  items.forEach(item => {
    const card = document.createElement('div');
    card.className = `card type-${item.type}`;
    card.innerHTML = `
      <div class="type-badge">${item.type === 'directory' ? '폴더' : '파일'}</div>
      <h3>${escapeHtml(item.name)}</h3>
      <div class="meta">
        ${item.type === 'file' ? `크기: ${formatSize(item.size)}` : '폴더'}
        ${item.modifiedAt ? ' | ' + new Date(item.modifiedAt).toLocaleDateString('ko-KR') : ''}
      </div>
    `;
    card.onclick = () => {
      if (item.type === 'directory') {
        loadDocuments(currentRoot, item.path);
      } else {
        openViewer(item);
      }
    };
    grid.appendChild(card);
  });
}

async function openViewer(item) {
  setStatus('문서 열기 중...');
  try {
    const res = await fetch(`${BASE}/api/view?root=${currentRoot}&file=${encodeURIComponent(item.path)}`);
    if (!res.ok) throw new Error('Failed to load file');
    const data = await res.json();
    viewerTitle.textContent = data.name;
    viewerContent.innerHTML = data.html;
    viewerOverlay.style.display = 'flex';
    setStatus('준비');
  } catch (e) {
    setStatus('오류: ' + e.message, 'error');
  }
}

async function searchDocuments(q) {
  isSearchMode = true;
  pageTitle.textContent = `검색: "${q}"`;
  breadcrumb.textContent = `검색 결과`;
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
  }
}

function renderSearchResults(results) {
  grid.innerHTML = '';
  if (results.length === 0) {
    grid.innerHTML = '<div class="empty-state">검색 결과가 없습니다.</div>';
    return;
  }
  results.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card type-file';
    card.innerHTML = `
      <div class="type-badge">파일</div>
      <h3>${escapeHtml(item.name)}</h3>
      <div class="meta">
        [${item.root}] ${item.path}
        ${item.snippet ? ' | ' : ''}
      </div>
      ${item.snippet ? `<div style="margin-top:8px;font-size:0.85rem;color:#94a3b8;">${escapeHtml(item.snippet)}</div>` : ''}
    `;
    card.onclick = () => openViewer({ name: item.name, path: item.file });
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

searchBtn.addEventListener('click', () => {
  const q = searchInput.value.trim();
  if (q) searchDocuments(q);
});

searchInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') {
    const q = searchInput.value.trim();
    if (q) searchDocuments(q);
  }
});

closeViewerBtn.addEventListener('click', () => {
  viewerOverlay.style.display = 'none';
  viewerContent.innerHTML = '';
});

copyBtn.addEventListener('click', () => {
  const text = viewerContent.innerText || viewerContent.textContent;
  navigator.clipboard.writeText(text).then(() => {
    const original = copyBtn.textContent;
    copyBtn.textContent = '복사됨';
    setTimeout(() => { copyBtn.textContent = original; }, 1500);
  });
});

viewerOverlay.addEventListener('click', e => {
  if (e.target === viewerOverlay) {
    viewerOverlay.style.display = 'none';
    viewerContent.innerHTML = '';
  }
});

loadDocuments(currentRoot);
