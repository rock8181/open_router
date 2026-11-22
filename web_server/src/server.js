const express = require('express');
const path = require('path');
const fs = require('fs');
const marked = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

/**
 * 데이터 계층 모듈 (JSON 영구 저장소)
 * data/ 디렉터리에 문서, 태그, 즐겨찾기, 접근 로그를 JSON 파일로 저장한다.
 */
const dataStore = require('./data/store');
dataStore.load();

/**
 * 허용된 루트 디렉토리 목록.
 * 보안상 이 두 루트 하위 경로에만 파일 시스템 접근을 허용한다.
 */
const ROOTS = {
  open_router: path.resolve('C:/work/openrouter/open_router'),
  study: path.resolve('C:/work/openrouter/study')
};

const ROOT_KEYS = Object.keys(ROOTS);

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

/**
 * 일관된 JSON 에러 응답 객체를 생성한다.
 * 형식: { error: { code, message, details } }
 */
function buildError(code, message, details = null) {
  return { error: { code, message, details } };
}

/**
 * HTTP 에러 응답을 보낸다.
 */
function sendError(res, status, code, message, details = null) {
  return res.status(status).json(buildError(code, message, details));
}

/**
 * 경로에 경로トラバーサ(..) 세그먼트, null 바이트, 절대 경로가 포함되어 있는지 검사한다.
 */
function hasTraversalOrUnsafe(p) {
  if (typeof p !== 'string') return true;
  if (p.length === 0) return false;
  if (p.includes('\0')) return true;
  if (path.isAbsolute(p)) return true;
  const segments = p.split(/[\\/]+/);
  return segments.includes('..');
}

/**
 * 클라이언트 IP를 추출한다 (레이트 리미팅용).
 */
function getClientIp(req) {
  return req.ip || (req.connection && req.connection.remoteAddress) || 'unknown';
}

/**
 * 쓰기 엔드포인트용 간단 인메모리 레이트 리미터.
 * IP당 1분당 30회로 요청을 제한한다.
 */
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 30;

function rateLimiter(req, res, next) {
  const ip = getClientIp(req);
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW_MS });
    return next();
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return sendError(res, 429, 'too_many_requests', '요청 한도를 초과했습니다. 잠시 후 다시 시도하세요.', null);
  }
  entry.count += 1;
  next();
}

/**
 * 비동기 라우트 핸들러 래퍼: 동기 예외를 전역 에러 핸들러로 전달한다.
 */
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

/**
 * 루트 키 유효성 검사
 */
function isValidRoot(root) {
  return typeof root === 'string' && ROOT_KEYS.includes(root);
}

/**
 * 디렉토리 항목 목록을 읽어 통일된 아이템 객체 배열로 반환한다.
 */
function listDirectoryItems(targetDir, rootPath, rootKey) {
  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  return entries.map(entry => {
    const fullPath = path.join(targetDir, entry.name);
    const stat = fs.statSync(fullPath);
    const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
    return {
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      path: relPath,
      root: rootKey,
      size: entry.isDirectory() ? 0 : stat.size,
      modifiedAt: stat.mtime.toISOString(),
      extension: entry.isDirectory() ? '' : path.extname(entry.name)
    };
  });
}

/* ------------------------------------------------------------------ */
/* 인메모리 스토어 (서버 재시작 시 초기화)                             */
/* ------------------------------------------------------------------ */

/**
 * recent: 최근 접근 문서 (최대 50건 보관, 조회 시 최신 10건 반환)
 * favorites: 'root|상대경로' 키 집합
 */
const store = {
  recent: [],
  favorites: new Set()
};

/* ------------------------------------------------------------------ */
/* 기존 엔드포인트                                                     */
/* ------------------------------------------------------------------ */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    port: PORT
  });
});

app.get('/api/documents', (req, res) => {
  const { root, dir = '' } = req.query;
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (hasTraversalOrUnsafe(dir)) {
    return sendError(res, 403, 'forbidden', '경로에 안전하지 않은 문자가 포함되어 있습니다.', { dir });
  }

  const rootPath = ROOTS[root];
  const targetDir = path.resolve(rootPath, dir);
  try {
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
      return sendError(res, 404, 'not_found', '디렉토리를 찾을 수 없습니다.', { root, dir, path: targetDir });
    }
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  let items;
  try {
    items = listDirectoryItems(targetDir, rootPath, root);
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  res.json({ root, dir, items });
});

app.get('/api/view', asyncHandler(async (req, res) => {
  const { root, file } = req.query;
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (!file || typeof file !== 'string' || hasTraversalOrUnsafe(file)) {
    return sendError(res, 400, 'invalid_parameter', '파일 경로가 올바르지 않습니다.', { file });
  }

  const rootPath = ROOTS[root];
  const filePath = path.resolve(rootPath, file);
  try {
    if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      return sendError(res, 404, 'not_found', '파일을 찾을 수 없습니다.', { root, file, path: filePath });
    }
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  let content;
  try {
    content = fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  let html;
  try {
    html = marked.parse(content);
  } catch (e) {
    html = '';
  }

  const stat = fs.statSync(filePath);

  // 데이터 계층에 문서 등록/갱신 및 접근 통계 기록 (문서 열람 시 접근 로그 남김)
  let doc = dataStore.getDocumentByPath(file);
  if (!doc) {
    doc = dataStore.createDocument({
      name: path.basename(filePath),
      path: file,
      type: 'file',
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      createdAt: new Date().toISOString(),
      root
    });
  } else {
    dataStore.updateDocument(doc.id, {
      name: path.basename(filePath),
      size: stat.size,
      modifiedAt: stat.mtime.toISOString(),
      root
    });
    doc = dataStore.getDocumentByPath(file);
  }
  dataStore.incrementAccess(doc.id);
  dataStore.createAccessLog({ documentPath: file, userAgent: req.get('User-Agent') || '' });

  res.json({
    path: file,
    name: path.basename(filePath),
    content,
    html,
    size: Buffer.byteLength(content, 'utf-8'),
    modifiedAt: stat.mtime.toISOString(),
    root,
    accessCount: doc.accessCount,
    favorite: doc.favorite,
    tags: doc.tags,
    lastAccessed: doc.lastAccessed
  });
}));

app.get('/api/search', asyncHandler(async (req, res) => {
  const { q, root } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return sendError(res, 400, 'invalid_parameter', '검색어가 필요합니다.', { q });
  }
  if (root && !isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }

  const results = [];
  const query = q.toLowerCase().trim();
  const rootsToSearch = root ? [ROOTS[root]] : Object.values(ROOTS);

  for (const rootPath of rootsToSearch) {
    if (!fs.existsSync(rootPath)) continue;
    try {
      scanDir(rootPath, rootPath, query, results);
    } catch (e) {
      continue;
    }
  }

  results.sort((a, b) => b.score - a.score);
  res.json({ query, root, results: results.slice(0, 20), total: results.length });
}));

function scanDir(dir, rootPath, query, results) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath, rootPath, query, results);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const lower = content.toLowerCase();
        const titleLower = entry.name.toLowerCase();

        let score = 0;
        let snippet = '';

        if (titleLower.includes(query)) score += 10;

        const idx = lower.indexOf(query);
        if (idx !== -1) {
          score += 5;
          const start = Math.max(0, idx - 50);
          const end = Math.min(lower.length, idx + 50);
          snippet = content.substring(start, end).replace(/\n/g, ' ').trim();
        }

        if (score > 0) {
          results.push({
            file: path.relative(rootPath, fullPath).replace(/\\/g, '/'),
            name: entry.name,
            score,
            snippet: snippet || content.substring(0, 100).replace(/\n/g, ' ').trim(),
            root: ROOT_KEYS.find(k => ROOTS[k] === rootPath)
          });
        }
      } catch (e) {}
    }
  }
}

/* ------------------------------------------------------------------ */
/* 신규 엔드포인트                                                     */
/* ------------------------------------------------------------------ */

/**
 * GET /api/recent - 최근 접근 문서 최대 10건 조회
 */
app.get('/api/recent', (req, res) => {
  const items = [...store.recent]
    .sort((a, b) => new Date(b.accessedAt) - new Date(a.accessedAt))
    .slice(0, 10);
  res.json({ items, total: items.length });
});

/**
 * POST /api/recent - 문서 접근 기록
 * 바디: { root, path, type? }
 */
app.post('/api/recent', rateLimiter, asyncHandler(async (req, res) => {
  const { root, path: filePath } = req.body || {};
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (!filePath || typeof filePath !== 'string' || hasTraversalOrUnsafe(filePath)) {
    return sendError(res, 400, 'invalid_parameter', '파일 경로가 올바르지 않습니다.', { path: filePath });
  }

  const rootPath = ROOTS[root];
  const resolved = path.resolve(rootPath, filePath);
  if (resolved !== rootPath && !resolved.startsWith(rootPath + path.sep)) {
    return sendError(res, 403, 'forbidden', '허용되지 않은 경로에 접근할 수 없습니다.', { path: filePath });
  }

  let stat;
  try {
    stat = fs.statSync(resolved);
  } catch (e) {
    return sendError(res, 404, 'not_found', '문서를 찾을 수 없습니다.', { root, path: filePath });
  }

  const entry = {
    root,
    path: filePath,
    name: path.basename(resolved),
    type: stat.isDirectory() ? 'directory' : 'file',
    accessedAt: new Date().toISOString()
  };
  const existingIndex = store.recent.findIndex(item => item.root === root && item.path === filePath);
  if (existingIndex !== -1) {
    store.recent.splice(existingIndex, 1);
  }
  store.recent.unshift(entry);
  if (store.recent.length > 50) store.recent.length = 50;

  res.json({ recorded: entry, recent: store.recent.slice(0, 10) });
}));

/**
 * GET /api/favorites - 즐겨찾기 문서 목록 조회
 */
app.get('/api/favorites', (req, res) => {
  const items = [];
  for (const key of store.favorites) {
    const [root, ...rest] = key.split('|');
    const relPath = rest.join('|');
    const rootPath = ROOTS[root];
    if (!rootPath) continue;
    const fullPath = path.resolve(rootPath, relPath);
    try {
      if (!fs.existsSync(fullPath)) continue;
      const stat = fs.statSync(fullPath);
      items.push({
        root,
        path: relPath.replace(/\\/g, '/'),
        name: path.basename(fullPath),
        type: stat.isDirectory() ? 'directory' : 'file',
        size: stat.isDirectory() ? 0 : stat.size,
        modifiedAt: stat.mtime.toISOString()
      });
    } catch (e) {
      continue;
    }
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ items, total: items.length });
});

/**
 * POST /api/favorites - 즐겨찾기 상태 토글
 * 바디: { root, path }
 */
app.post('/api/favorites', rateLimiter, asyncHandler(async (req, res) => {
  const { root, path: filePath } = req.body || {};
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (!filePath || typeof filePath !== 'string' || hasTraversalOrUnsafe(filePath)) {
    return sendError(res, 400, 'invalid_parameter', '파일 경로가 올바르지 않습니다.', { path: filePath });
  }

  const rootPath = ROOTS[root];
  const resolved = path.resolve(rootPath, filePath);
  if (resolved !== rootPath && !resolved.startsWith(rootPath + path.sep)) {
    return sendError(res, 403, 'forbidden', '허용되지 않은 경로에 접근할 수 없습니다.', { path: filePath });
  }

  const key = `${root}|${filePath}`;
  let favorited;
  if (store.favorites.has(key)) {
    store.favorites.delete(key);
    favorited = false;
  } else {
    try {
      fs.statSync(resolved);
    } catch (e) {
      return sendError(res, 404, 'not_found', '문서를 찾을 수 없습니다.', { root, path: filePath });
    }
    store.favorites.add(key);
    favorited = true;
  }

  res.json({ favorited, path: filePath, root });
}));

/**
 * GET /api/tags - 모든 태그와 문서 수 조회
 * 마크다운 파일 본문의 #태그 표기어를 인덱싱한다.
 */
app.get('/api/tags', (req, res) => {
  const tagIndex = new Map(); // tag -> Set of 'root|relPath'

  for (const rootKey of ROOT_KEYS) {
    const rootPath = ROOTS[rootKey];
    if (!fs.existsSync(rootPath)) continue;
    try {
      indexTagsInDir(rootPath, rootKey, tagIndex);
    } catch (e) {
      continue;
    }
  }

  const tags = [...tagIndex.entries()]
    .map(([tag, docs]) => ({ tag, count: docs.size }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  res.json({ tags, total: tags.length });
});

function indexTagsInDir(dir, rootKey, tagIndex) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch (e) {
    return;
  }
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      indexTagsInDir(fullPath, rootKey, tagIndex);
    } else if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const tags = new Set();
        const TAG_REGEX = /#([\w\uAC00-\uD7A3]+)/g;
        let match;
        while ((match = TAG_REGEX.exec(content)) !== null) {
          tags.add(match[1].toLowerCase());
        }
        const relPath = path.relative(dir, fullPath).replace(/\\/g, '/');
        // dir은 루트이므로 relPath가 루트 기준 상대 경로와 동일하다
        const key = `${rootKey}|${relPath}`;
        for (const tag of tags) {
          if (!tagIndex.has(tag)) tagIndex.set(tag, new Set());
          tagIndex.get(tag).add(key);
        }
      } catch (e) {}
    }
  }
}

/**
 * GET /api/tags/:tag - 특정 태그를 가진 문서 조회
 */
app.get('/api/tags/:tag', (req, res) => {
  const { tag } = req.params;
  if (!tag || !/^[\w\uAC00-\uD7A3-]{1,50}$/.test(tag)) {
    return sendError(res, 400, 'invalid_parameter', '태그 이름이 올바르지 않습니다.', { tag });
  }

  const tagIndex = new Map();
  for (const rootKey of ROOT_KEYS) {
    const rootPath = ROOTS[rootKey];
    if (!fs.existsSync(rootPath)) continue;
    try {
      indexTagsInDir(rootPath, rootKey, tagIndex);
    } catch (e) {
      continue;
    }
  }

  const docs = tagIndex.get(tag.toLowerCase()) || [];
  const items = [];
  for (const key of docs) {
    const [root, ...rest] = key.split('|');
    const relPath = rest.join('|');
    const rootPath = ROOTS[root];
    const fullPath = path.resolve(rootPath, relPath);
    try {
      if (!fs.existsSync(fullPath)) continue;
      const stat = fs.statSync(fullPath);
      items.push({
        root,
        path: relPath.replace(/\\/g, '/'),
        name: path.basename(fullPath),
        type: stat.isDirectory() ? 'directory' : 'file',
        size: stat.isDirectory() ? 0 : stat.size,
        modifiedAt: stat.mtime.toISOString()
      });
    } catch (e) {
      continue;
    }
  }
  items.sort((a, b) => a.name.localeCompare(b.name));
  res.json({ tag, items, total: items.length });
});

/**
 * POST /api/rename - 파일/폴더 이름 변경 (프롬프트 기반)
 * 바디: { root, oldPath, newPath }
 */
app.post('/api/rename', rateLimiter, asyncHandler(async (req, res) => {
  const { root, oldPath, newPath } = req.body || {};
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (!oldPath || typeof oldPath !== 'string' || hasTraversalOrUnsafe(oldPath)) {
    return sendError(res, 400, 'invalid_parameter', '원본 경로가 올바르지 않습니다.', { oldPath });
  }
  if (!newPath || typeof newPath !== 'string' || hasTraversalOrUnsafe(newPath)) {
    return sendError(res, 400, 'invalid_parameter', '새 경로가 올바르지 않습니다.', { newPath });
  }

  const rootPath = ROOTS[root];
  const oldResolved = path.resolve(rootPath, oldPath);
  const newResolved = path.resolve(rootPath, newPath);
  if ((oldResolved !== rootPath && !oldResolved.startsWith(rootPath + path.sep)) ||
      (newResolved !== rootPath && !newResolved.startsWith(rootPath + path.sep))) {
    return sendError(res, 403, 'forbidden', '허용되지 않은 경로에 접근할 수 없습니다.', { oldPath, newPath });
  }

  try {
    fs.statSync(oldResolved);
  } catch (e) {
    return sendError(res, 404, 'not_found', '이름 변경할 대상을 찾을 수 없습니다.', { root, path: oldPath });
  }
  try {
    fs.statSync(newResolved);
    return sendError(res, 409, 'conflict', '이미 동일한 이름의 항목이 존재합니다.', { root, path: newPath });
  } catch (e) {
    // 존재하지 않아야 정상
  }

  try {
    fs.renameSync(oldResolved, newResolved);
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  res.json({
    root,
    oldPath,
    newPath,
    name: path.basename(newResolved),
    message: '이름 변경을 완료했습니다.'
  });
}));

/**
 * POST /api/delete - 파일/폴더 삭제 (확인 기반)
 * 바디: { root, path, confirm: true }
 */
app.post('/api/delete', rateLimiter, asyncHandler(async (req, res) => {
  const { root, path: filePath, confirm } = req.body || {};
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (!filePath || typeof filePath !== 'string' || hasTraversalOrUnsafe(filePath)) {
    return sendError(res, 400, 'invalid_parameter', '파일 경로가 올바르지 않습니다.', { path: filePath });
  }
  if (confirm !== true) {
    return sendError(res, 400, 'confirmation_required', '삭제하려면 confirm=true가 필요합니다.', { path: filePath });
  }

  const rootPath = ROOTS[root];
  const resolved = path.resolve(rootPath, filePath);
  if (resolved !== rootPath && !resolved.startsWith(rootPath + path.sep)) {
    return sendError(res, 403, 'forbidden', '허용되지 않은 경로에 접근할 수 없습니다.', { path: filePath });
  }
  if (resolved === rootPath) {
    return sendError(res, 403, 'forbidden', '루트 디렉토리 자체는 삭제할 수 없습니다.', { path: filePath });
  }

  try {
    fs.statSync(resolved);
  } catch (e) {
    return sendError(res, 404, 'not_found', '삭제할 대상을 찾을 수 없습니다.', { root, path: filePath });
  }

  store.favorites.delete(`${root}|${filePath}`);

  try {
    fs.rmSync(resolved, { recursive: true, force: true });
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  res.json({ deleted: true, root, path: filePath, message: '삭제를 완료했습니다.' });
}));

/**
 * POST /api/duplicate - 문서 복제
 * 바디: { root, path }
 */
app.post('/api/duplicate', rateLimiter, asyncHandler(async (req, res) => {
  const { root, path: filePath } = req.body || {};
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (!filePath || typeof filePath !== 'string' || hasTraversalOrUnsafe(filePath)) {
    return sendError(res, 400, 'invalid_parameter', '파일 경로가 올바르지 않습니다.', { path: filePath });
  }

  const rootPath = ROOTS[root];
  const resolved = path.resolve(rootPath, filePath);
  if (resolved !== rootPath && !resolved.startsWith(rootPath + path.sep)) {
    return sendError(res, 403, 'forbidden', '허용되지 않은 경로에 접근할 수 없습니다.', { path: filePath });
  }

  let stat;
  try {
    stat = fs.statSync(resolved);
  } catch (e) {
    return sendError(res, 404, 'not_found', '복제할 대상을 찾을 수 없습니다.', { root, path: filePath });
  }
  if (!stat.isFile()) {
    return sendError(res, 400, 'invalid_parameter', '파일만 복제할 수 있습니다.', { path: filePath });
  }

  const dir = path.dirname(resolved);
  const base = path.basename(resolved);
  const ext = path.extname(base);
  const nameWithoutExt = base.slice(0, base.length - ext.length);
  let newName = `${nameWithoutExt} (복사)${ext}`;
  let newResolved = path.join(dir, newName);
  let counter = 1;
  while (fs.existsSync(newResolved)) {
    newName = `${nameWithoutExt} (복사 ${counter})${ext}`;
    newResolved = path.join(dir, newName);
    counter += 1;
  }

  try {
    fs.copyFileSync(resolved, newResolved);
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  const newRelPath = path.relative(rootPath, newResolved).replace(/\\/g, '/');
  const newStat = fs.statSync(newResolved);
  res.json({
    root,
    oldPath: filePath,
    path: newRelPath,
    name: path.basename(newResolved),
    size: newStat.size,
    message: '복제를 완료했습니다.'
  });
}));

/**
 * GET /api/export?format=csv|json - 문서 목록 내보내기
 * 쿼리: root, dir, format
 */
app.get('/api/export', (req, res) => {
  const { root, dir = '', format } = req.query;
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (hasTraversalOrUnsafe(dir)) {
    return sendError(res, 403, 'forbidden', '경로에 안전하지 않은 문자가 포함되어 있습니다.', { dir });
  }
  if (format !== 'csv' && format !== 'json') {
    return sendError(res, 400, 'invalid_parameter', 'format은 csv 또는 json이어야 합니다.', { format });
  }

  const rootPath = ROOTS[root];
  const targetDir = path.resolve(rootPath, dir);
  try {
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
      return sendError(res, 404, 'not_found', '디렉토리를 찾을 수 없습니다.', { root, dir });
    }
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  let items;
  try {
    items = listDirectoryItems(targetDir, rootPath, root);
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  if (format === 'json') {
    res.json({ root, dir, items, total: items.length, exportedAt: new Date().toISOString() });
    return;
  }

  const escapeCsv = value => {
    const s = String(value == null ? '' : value);
    if (/[",\n\r]/.test(s)) {
      return '"' + s.replace(/"/g, '""') + '"';
    }
    return s;
  };
  const header = 'root,path,name,type,size,modifiedAt,extension';
  const lines = [header, ...items.map(item =>
    [item.root, item.path, item.name, item.type, item.size, item.modifiedAt, item.extension].map(escapeCsv).join(',')
  )];
  res.set('Content-Type', 'text/csv; charset=utf-8');
  res.set('Content-Disposition', `attachment; filename="export_${root}_${Date.now()}.csv"`);
  res.send(lines.join('\r\n'));
});

/**
 * GET /api/sort?by=name|date|size&order=asc|desc - 문서 목록 정렬
 * 쿼리: root, dir, by, order
 */
app.get('/api/sort', (req, res) => {
  const { root, dir = '', by = 'name', order = 'asc' } = req.query;
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (hasTraversalOrUnsafe(dir)) {
    return sendError(res, 403, 'forbidden', '경로에 안전하지 않은 문자가 포함되어 있습니다.', { dir });
  }
  if (!['name', 'date', 'size'].includes(by)) {
    return sendError(res, 400, 'invalid_parameter', 'by는 name, date, size 중 하나여야 합니다.', { by });
  }
  if (!['asc', 'desc'].includes(order)) {
    return sendError(res, 400, 'invalid_parameter', 'order는 asc 또는 desc여야 합니다.', { order });
  }

  const rootPath = ROOTS[root];
  const targetDir = path.resolve(rootPath, dir);
  try {
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
      return sendError(res, 404, 'not_found', '디렉토리를 찾을 수 없습니다.', { root, dir });
    }
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  let items;
  try {
    items = listDirectoryItems(targetDir, rootPath, root);
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  const direction = order === 'desc' ? -1 : 1;
  items.sort((a, b) => {
    let cmp = 0;
    if (by === 'name') cmp = a.name.localeCompare(b.name);
    else if (by === 'date') cmp = new Date(a.modifiedAt) - new Date(b.modifiedAt);
    else if (by === 'size') cmp = a.size - b.size;
    return cmp * direction;
  });

  res.json({ root, dir, by, order, items, total: items.length });
});

/**
 * GET /api/paginate?page=&limit= - 페이지네이션된 문서 목록
 * 쿼리: root, dir, page, limit
 */
app.get('/api/paginate', (req, res) => {
  const { root, dir = '', page = '1', limit = '20' } = req.query;
  if (!isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }
  if (hasTraversalOrUnsafe(dir)) {
    return sendError(res, 403, 'forbidden', '경로에 안전하지 않은 문자가 포함되어 있습니다.', { dir });
  }

  const pageNum = Number.parseInt(page, 10);
  const limitNum = Number.parseInt(limit, 10);
  if (!Number.isFinite(pageNum) || pageNum < 1) {
    return sendError(res, 400, 'invalid_parameter', 'page는 1 이상의 정수여야 합니다.', { page });
  }
  if (!Number.isFinite(limitNum) || limitNum < 1 || limitNum > 100) {
    return sendError(res, 400, 'invalid_parameter', 'limit는 1 이상 100 이하의 정수여야 합니다.', { limit });
  }

  const rootPath = ROOTS[root];
  const targetDir = path.resolve(rootPath, dir);
  try {
    if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
      return sendError(res, 404, 'not_found', '디렉토리를 찾을 수 없습니다.', { root, dir });
    }
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  let items;
  try {
    items = listDirectoryItems(targetDir, rootPath, root);
  } catch (e) {
    return sendError(res, 500, 'internal_server_error', '서버 오류가 발생했습니다.', null);
  }

  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  const total = items.length;
  const totalPages = Math.ceil(total / limitNum);
  const offset = (pageNum - 1) * limitNum;
  const pageItems = items.slice(offset, offset + limitNum);

  res.json({
    root,
    dir,
    page: pageNum,
    limit: limitNum,
    total,
    totalPages,
    items: pageItems
  });
});

/* ------------------------------------------------------------------ */
/* 데이터 계층 API (JSON 영구 저장소: data/ 디렉터리)                    */
/* 모델: Document {id, name, path, type, size, modifiedAt, createdAt, tags[], favorite, accessCount, lastAccessed}
/*        Tag {id, name, color, documentCount}
/*        AccessLog {id, documentPath, accessedAt, userAgent}
/*        Favorite {id, documentPath, favoritedAt}                       */
/* ------------------------------------------------------------------ */

// 문서 목록 조회 (정렬: name|date|size|accessCount|lastAccessed,
// 필터: tag/favorite/type, 키워드 검색: q)
app.get('/api/data/documents', (req, res) => {
  try {
    const docs = dataStore.listDocuments({
      sort: req.query.sort,
      order: req.query.order,
      tag: req.query.tag,
      favorite: req.query.favorite,
      type: req.query.type,
      q: req.query.q
    });
    res.json({ documents: docs, total: docs.length });
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 단일 문서 조회
app.get('/api/data/documents/:id', (req, res) => {
  try {
    const doc = dataStore.getDocument(req.params.id);
    if (!doc) {
      return sendError(res, 404, 'not_found', '문서를 찾을 수 없습니다.', { id: req.params.id });
    }
    res.json(doc);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 문서 생성
app.post('/api/data/documents', rateLimiter, (req, res) => {
  try {
    const doc = dataStore.createDocument(req.body);
    return res.status(201).json(doc);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 문서 수정
app.put('/api/data/documents/:id', rateLimiter, (req, res) => {
  try {
    const doc = dataStore.updateDocument(req.params.id, req.body);
    return res.json(doc);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 문서 삭제
app.delete('/api/data/documents/:id', rateLimiter, (req, res) => {
  try {
    dataStore.deleteDocument(req.params.id);
    return res.status(204).end();
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 파일 시스템의 마크다운 파일을 문서 저장소에 동기화
app.post('/api/data/documents/sync', rateLimiter, (req, res) => {
  try {
    let synced = 0;

    function scan(dir, rootPath, rootKey) {
      let entries;
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch (e) {
        return;
      }
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scan(fullPath, rootPath, rootKey);
        } else if (entry.name.endsWith('.md') || entry.name.endsWith('.markdown')) {
          try {
            const stat = fs.statSync(fullPath);
            const relPath = path.relative(rootPath, fullPath).replace(/\\/g, '/');
            dataStore.upsertDocument({
              name: entry.name,
              path: relPath,
              type: 'file',
              size: stat.size,
              modifiedAt: stat.mtime.toISOString(),
              root: rootKey
            });
            synced++;
          } catch (e) {}
        }
      }
    }

    for (const rootKey of Object.keys(ROOTS)) {
      scan(ROOTS[rootKey], ROOTS[rootKey], rootKey);
    }

    return res.json({ synced });
  } catch (e) {
    return sendError(res, 500, 'sync_failed', e.message, null);
  }
});

// 태그 목록 조회 (documentCount 포함) / 생성
app.get('/api/data/tags', (req, res) => {
  try {
    const tags = dataStore.listTags();
    res.json({ tags, total: tags.length });
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.post('/api/data/tags', rateLimiter, (req, res) => {
  try {
    const tag = dataStore.createTag(req.body);
    return res.status(201).json(tag);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.get('/api/data/tags/:id', (req, res) => {
  try {
    const tag = dataStore.getTag(req.params.id);
    if (!tag) {
      return sendError(res, 404, 'not_found', '태그를 찾을 수 없습니다.', { id: req.params.id });
    }
    res.json(tag);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.put('/api/data/tags/:id', rateLimiter, (req, res) => {
  try {
    const tag = dataStore.updateTag(req.params.id, req.body);
    return res.json(tag);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.delete('/api/data/tags/:id', rateLimiter, (req, res) => {
  try {
    dataStore.deleteTag(req.params.id);
    return res.status(204).end();
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 문서 태그 할당 / 해제
app.post('/api/data/documents/:id/tags', rateLimiter, (req, res) => {
  try {
    const { tagId } = req.body || {};
    if (!tagId) {
      return sendError(res, 400, 'invalid_parameter', 'tagId가 필요합니다.', { tagId });
    }
    const doc = dataStore.addTagToDocument(req.params.id, tagId);
    return res.json(doc);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.delete('/api/data/documents/:id/tags/:tagId', rateLimiter, (req, res) => {
  try {
    const doc = dataStore.removeTagFromDocument(req.params.id, req.params.tagId);
    return res.json(doc);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 태그별 문서 조회
app.get('/api/data/tags/:id/documents', (req, res) => {
  try {
    const docs = dataStore.getDocumentsByTag(req.params.id);
    res.json({ documents: docs, total: docs.length });
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 즐겨찾기 토글 (문서별)
app.post('/api/data/documents/:id/favorite', rateLimiter, (req, res) => {
  try {
    const doc = dataStore.getDocument(req.params.id);
    if (!doc) {
      return sendError(res, 404, 'not_found', '문서를 찾을 수 없습니다.', { id: req.params.id });
    }
    const result = dataStore.toggleFavorite(doc.path);
    return res.json({ documentId: doc.id, ...result });
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 즐겨찾기 목록 조회 / 추가 / 삭제
app.get('/api/data/favorites', (req, res) => {
  try {
    const favs = dataStore.listFavorites();
    res.json({ favorites: favs, total: favs.length });
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.post('/api/data/favorites', rateLimiter, (req, res) => {
  try {
    const fav = dataStore.createFavorite(req.body);
    return res.status(201).json(fav);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.delete('/api/data/favorites/:id', rateLimiter, (req, res) => {
  try {
    dataStore.deleteFavorite(req.params.id);
    return res.status(204).end();
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.delete('/api/data/favorites/path', rateLimiter, (req, res) => {
  try {
    const { documentPath } = req.query;
    if (!documentPath) {
      return sendError(res, 400, 'invalid_parameter', 'documentPath 쿼리 파라미터가 필요합니다.', null);
    }
    const removed = dataStore.deleteFavoriteByDocumentPath(documentPath);
    if (!removed) {
      return sendError(res, 404, 'not_found', '즐겨찾기를 찾을 수 없습니다.', { documentPath });
    }
    return res.json(removed);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 접근 로그 조회 / 기록
app.get('/api/data/access-logs', (req, res) => {
  try {
    const logs = dataStore.listAccessLogs({
      limit: req.query.limit,
      documentPath: req.query.documentPath
    });
    res.json({ accessLogs: logs, total: logs.length });
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

app.post('/api/data/access-logs', rateLimiter, (req, res) => {
  try {
    const log = dataStore.createAccessLog(req.body);
    return res.status(201).json(log);
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

// 문서 검색 (문서 이름/경로/태그 + 파일 내용 스니펫)
app.get('/api/data/search', (req, res) => {
  const { q, root, sort = 'name', order = 'asc' } = req.query;
  if (!q || typeof q !== 'string' || q.trim().length === 0) {
    return sendError(res, 400, 'invalid_parameter', '검색어가 필요합니다.', { q });
  }
  if (root && !isValidRoot(root)) {
    return sendError(res, 403, 'invalid_root', '허용되지 않은 루트 디렉토리입니다.', { root });
  }

  try {
    let docs = dataStore.searchDocuments(q);

    if (root) {
      docs = docs.filter(d => d.path === root || d.path.startsWith(root + '/'));
    }

    const direction = order === 'desc' ? -1 : 1;
    docs.sort((a, b) => {
      let cmp = 0;
      if (sort === 'name') cmp = String(a.name || '').localeCompare(String(b.name || ''));
      else if (sort === 'date') cmp = String(a.modifiedAt || '').localeCompare(String(b.modifiedAt || ''));
      else if (sort === 'size') cmp = Number(a.size || 0) - Number(b.size || 0);
      else if (sort === 'accessCount') cmp = Number(a.accessCount || 0) - Number(b.accessCount || 0);
      return cmp * direction;
    });

    const query = q.toLowerCase();
    const results = docs.map(doc => {
      let snippet = '';
      let score = 0;
      let content = '';
      const rootPath = doc.root ? ROOTS[doc.root] : null;

      if (rootPath) {
        try {
          const fullPath = path.resolve(rootPath, doc.path);
          if (fs.existsSync(fullPath)) {
            content = fs.readFileSync(fullPath, 'utf-8');
            const lower = content.toLowerCase();
            const idx = lower.indexOf(query);
            if (idx !== -1) {
              score += 5;
              const start = Math.max(0, idx - 50);
              const end = Math.min(lower.length, idx + 50);
              snippet = content.substring(start, end).replace(/\n/g, ' ').trim();
            }
          }
        } catch (e) {}
      }

      if (doc.name.toLowerCase().includes(query)) score += 10;
      if (!snippet) snippet = (content || doc.name).substring(0, 100).replace(/\n/g, ' ').trim();

      return {
        id: doc.id,
        file: doc.path,
        name: doc.name,
        title: doc.name,
        score,
        snippet,
        root: doc.root,
        tags: doc.tags,
        favorite: doc.favorite,
        accessCount: doc.accessCount,
        modifiedAt: doc.modifiedAt
      };
    }).sort((a, b) => b.score - a.score);

    res.json({ query, results, total: results.length });
  } catch (e) {
    return sendError(res, 500, 'search_failed', e.message, null);
  }
});

// 통계 요약
app.get('/api/data/stats', (req, res) => {
  try {
    res.json(dataStore.getStats());
  } catch (e) {
    return sendError(res, e.status || 500, 'store_error', e.message, null);
  }
});

/* ------------------------------------------------------------------ */
/* 404 및 전역 에러 핸들러                                             */
/* ------------------------------------------------------------------ */

app.use((req, res) => {
  res.status(404).json(buildError('not_found', '요청한 리소스를 찾을 수 없습니다.', { path: req.originalUrl }));
});

app.use((err, req, res) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json(buildError('internal_server_error', '서버 오류가 발생했습니다.', null));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Web server running at http://localhost:${PORT}`);
});
