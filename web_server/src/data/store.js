const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * 데이터 저장소 모듈
 * 문서, 태그, 즐겨찾기, 접근 로그 데이터를 data/ 디렉터리의 JSON 파일로 영구 저장한다.
 * - documents.json: 문서 메타데이터
 * - tags.json: 태그 정보
 * - favorites.json: 즐겨찾기 정보
 * - access-log.json: 문서 접근 로그
 */

const DATA_DIR = path.resolve(__dirname, '../data');

const STORE_FILES = {
  documents: path.join(DATA_DIR, 'documents.json'),
  tags: path.join(DATA_DIR, 'tags.json'),
  favorites: path.join(DATA_DIR, 'favorites.json'),
  accessLogs: path.join(DATA_DIR, 'access-log.json')
};

// 메모리 캐시 (서버 시작 시 한 번 로드, 변경 시 JSON 파일에 기록)
let store = {
  documents: [],
  tags: [],
  favorites: [],
  accessLogs: []
};

function ensureDataDirectory() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile(filePath, defaultValue) {
  try {
    if (!fs.existsSync(filePath)) return defaultValue;
    const raw = fs.readFileSync(filePath, 'utf-8');
    if (!raw || !raw.trim()) return defaultValue;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultValue;
  } catch (e) {
    return defaultValue;
  }
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function saveAll() {
  writeJsonFile(STORE_FILES.documents, store.documents);
  writeJsonFile(STORE_FILES.tags, store.tags);
  writeJsonFile(STORE_FILES.favorites, store.favorites);
  writeJsonFile(STORE_FILES.accessLogs, store.accessLogs);
}

function generateId() {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function nowISO() {
  return new Date().toISOString();
}

/**
 * 저장소 초기화: data/ 디렉터리를 만들고 기존 JSON 파일을 메모리에 로드한다.
 */
function load() {
  ensureDataDirectory();
  store.documents = readJsonFile(STORE_FILES.documents, []);
  store.tags = readJsonFile(STORE_FILES.tags, []);
  store.favorites = readJsonFile(STORE_FILES.favorites, []);
  store.accessLogs = readJsonFile(STORE_FILES.accessLogs, []);
  return store;
}

function getStore() {
  return store;
}

function findDocumentIndex(id) {
  return store.documents.findIndex(d => d.id === id);
}

function findDocumentByPath(documentPath) {
  return store.documents.find(d => d.path === documentPath);
}

function findTagIndex(id) {
  return store.tags.findIndex(t => t.id === id);
}

/**
 * 입력 객체를 Document 모델 형태로 정규화한다.
 * Document: {id, name, path, type, size, modifiedAt, createdAt, tags[], favorite, accessCount, lastAccessed}
 */
function normalizeDocument(input) {
  return {
    id: input.id || generateId(),
    name: input.name || '',
    path: input.path || '',
    type: input.type || 'file',
    size: input.size != null ? Number(input.size) : 0,
    modifiedAt: input.modifiedAt || nowISO(),
    createdAt: input.createdAt || nowISO(),
    tags: Array.isArray(input.tags) ? [...input.tags] : [],
    favorite: input.favorite === true,
    accessCount: Number(input.accessCount || 0),
    lastAccessed: input.lastAccessed || null,
    root: input.root || null
  };
}

/**
 * 문서 목록 조회 (정렬, 필터, 검색 지원)
 * 옵션: sort(name|date|size|accessCount|lastAccessed), order(asc|desc), tag, favorite, type, q
 */
function listDocuments({ sort = 'name', order = 'asc', tag, favorite, type, q } = {}) {
  let docs = store.documents.map(d => ({ ...d }));

  if (tag) {
    docs = docs.filter(d => Array.isArray(d.tags) && d.tags.includes(tag));
  }
  if (favorite !== undefined && favorite !== '') {
    const isFavorite = favorite === 'true' || favorite === true;
    docs = docs.filter(d => d.favorite === isFavorite);
  }
  if (type) {
    docs = docs.filter(d => d.type === type);
  }
  if (q) {
    const query = q.toLowerCase();
    docs = docs.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.path.toLowerCase().includes(query) ||
      (Array.isArray(d.tags) && d.tags.some(t => t.toLowerCase().includes(query)))
    );
  }

  const direction = order === 'desc' ? -1 : 1;
  docs.sort((a, b) => {
    let cmp = 0;
    switch (sort) {
    case 'name':
      cmp = String(a.name || '').localeCompare(String(b.name || ''));
      break;
    case 'date':
      cmp = String(a.modifiedAt || '').localeCompare(String(b.modifiedAt || ''));
      break;
    case 'size':
      cmp = Number(a.size || 0) - Number(b.size || 0);
      break;
    case 'accessCount':
      cmp = Number(a.accessCount || 0) - Number(b.accessCount || 0);
      break;
    case 'lastAccessed':
      cmp = String(a.lastAccessed || '').localeCompare(String(b.lastAccessed || ''));
      break;
    default:
      cmp = 0;
    }
    return cmp * direction;
  });

  return docs;
}

function getDocument(id) {
  return store.documents.find(d => d.id === id) || null;
}

function getDocumentByPath(documentPath) {
  return findDocumentByPath(documentPath) || null;
}

/**
 * 문서 생성. 이미 같은 path의 문서가 있으면 기존 문서를 반환한다.
 */
function createDocument(input) {
  if (!input || !input.name || !input.path) {
    const err = new Error('document name and path are required');
    err.status = 400;
    throw err;
  }
  const existing = findDocumentByPath(input.path);
  if (existing) return existing;

  const doc = normalizeDocument(input);
  store.documents.push(doc);
  saveAll();
  return doc;
}

/**
 * 경로 기준으로 문서를 생성하거나 갱신한다(파일 시스템 동기화 용도).
 */
function upsertDocument(input) {
  if (!input || !input.name || !input.path) {
    const err = new Error('document name and path are required');
    err.status = 400;
    throw err;
  }
  const existing = findDocumentByPath(input.path);
  if (existing) {
    const patch = { ...input };
    delete patch.id;
    delete patch.path;
    return updateDocument(existing.id, patch) || existing;
  }
  return createDocument(input);
}

function updateDocument(id, patch) {
  const index = findDocumentIndex(id);
  if (index === -1) {
    const err = new Error('document not found');
    err.status = 404;
    throw err;
  }
  const doc = { ...store.documents[index], ...patch };
  doc.id = id;
  doc.updatedAt = nowISO();
  store.documents[index] = doc;
  saveAll();
  return doc;
}

function deleteDocument(id) {
  const index = findDocumentIndex(id);
  if (index === -1) {
    const err = new Error('document not found');
    err.status = 404;
    throw err;
  }
  const [removed] = store.documents.splice(index, 1);

  // 관련 태그 참조 제거, 즐겨찾기에서 해당 문서 제거
  store.documents.forEach(d => {
    if (Array.isArray(d.tags)) {
      d.tags = d.tags.filter(tid => tid !== id);
    }
  });
  store.favorites = store.favorites.filter(
    f => f.documentId !== id && f.documentPath !== removed.path
  );
  saveAll();
  return removed;
}

/**
 * 문서 접근 횟수를 1 증가시키고 마지막 접근 시각을 갱신한다(문서 열람 시 호출).
 */
function incrementAccess(id) {
  const index = findDocumentIndex(id);
  if (index === -1) return null;
  const doc = store.documents[index];
  doc.accessCount = Number(doc.accessCount || 0) + 1;
  doc.lastAccessed = nowISO();
  store.documents[index] = doc;
  saveAll();
  return doc;
}

function countDocumentsByTag(tagId) {
  return store.documents.filter(d => Array.isArray(d.tags) && d.tags.includes(tagId)).length;
}

/* ---------------- Tag CRUD ---------------- */

function listTags() {
  return store.tags.map(t => ({
    ...t,
    documentCount: countDocumentsByTag(t.id)
  }));
}

function getTag(id) {
  const t = store.tags.find(t => t.id === id);
  if (!t) return null;
  return { ...t, documentCount: countDocumentsByTag(t.id) };
}

function createTag(input) {
  if (!input || !input.name) {
    const err = new Error('tag name is required');
    err.status = 400;
    throw err;
  }
  const existing = store.tags.find(t => t.name === input.name);
  if (existing) return existing;

  const tag = {
    id: generateId(),
    name: input.name,
    color: input.color || '#000000',
    documentCount: 0
  };
  store.tags.push(tag);
  saveAll();
  return tag;
}

function updateTag(id, patch) {
  const index = findTagIndex(id);
  if (index === -1) {
    const err = new Error('tag not found');
    err.status = 404;
    throw err;
  }
  const tag = { ...store.tags[index], ...patch };
  tag.id = id;
  store.tags[index] = tag;
  saveAll();
  return tag;
}

function deleteTag(id) {
  const index = findTagIndex(id);
  if (index === -1) {
    const err = new Error('tag not found');
    err.status = 404;
    throw err;
  }
  // 모든 문서에서 해당 태그 참조 제거
  store.documents.forEach(d => {
    if (Array.isArray(d.tags)) {
      d.tags = d.tags.filter(tid => tid !== id);
    }
  });
  store.tags.splice(index, 1);
  saveAll();
}

/* ---------------- Favorite CRUD ---------------- */

function listFavorites() {
  return store.favorites.map(f => ({
    ...f,
    document: getDocumentByPath(f.documentPath)
  }));
}

function getFavoriteByDocumentPath(documentPath) {
  return store.favorites.find(f => f.documentPath === documentPath) || null;
}

function createFavorite(input) {
  if (!input || !input.documentPath) {
    const err = new Error('documentPath is required');
    err.status = 400;
    throw err;
  }
  const existing = getFavoriteByDocumentPath(input.documentPath);
  if (existing) return existing;

  const fav = {
    id: generateId(),
    documentPath: input.documentPath,
    favoritedAt: input.favoritedAt || nowISO()
  };
  store.favorites.push(fav);
  const doc = findDocumentByPath(input.documentPath);
  if (doc) doc.favorite = true;
  saveAll();
  return fav;
}

function deleteFavorite(id) {
  const index = store.favorites.findIndex(f => f.id === id);
  if (index === -1) {
    const err = new Error('favorite not found');
    err.status = 404;
    throw err;
  }
  const [removed] = store.favorites.splice(index, 1);
  const doc = findDocumentByPath(removed.documentPath);
  if (doc) doc.favorite = false;
  saveAll();
  return removed;
}

function deleteFavoriteByDocumentPath(documentPath) {
  const fav = getFavoriteByDocumentPath(documentPath);
  if (!fav) return null;
  store.favorites = store.favorites.filter(f => f.id !== fav.id);
  const doc = findDocumentByPath(documentPath);
  if (doc) doc.favorite = false;
  saveAll();
  return fav;
}

/**
 * 즐겨찾기 상태를 전환한다. 반환: {favorite: boolean, action: 'added'|'removed'}
 */
function toggleFavorite(documentPath) {
  const existing = getFavoriteByDocumentPath(documentPath);
  if (existing) {
    deleteFavorite(existing.id);
    const doc = findDocumentByPath(documentPath);
    if (doc) doc.favorite = false;
    saveAll();
    return { favorite: false, action: 'removed' };
  }
  createFavorite({ documentPath });
  const doc = findDocumentByPath(documentPath);
  if (doc) doc.favorite = true;
  saveAll();
  return { favorite: true, action: 'added' };
}

/* ---------------- Access Log ---------------- */

function listAccessLogs({ limit = 50, documentPath } = {}) {
  let logs = store.accessLogs.slice();
  if (documentPath) {
    logs = logs.filter(l => l.documentPath === documentPath);
  }
  logs.sort((a, b) => String(b.accessedAt || '').localeCompare(String(a.accessedAt || '')));
  return logs.slice(0, Number(limit));
}

function createAccessLog(input) {
  if (!input || !input.documentPath) {
    const err = new Error('documentPath is required');
    err.status = 400;
    throw err;
  }
  const log = {
    id: generateId(),
    documentPath: input.documentPath,
    accessedAt: input.accessedAt || nowISO(),
    userAgent: input.userAgent || ''
  };
  store.accessLogs.push(log);
  saveAll();
  return log;
}

/* ---------------- Tag assignment ---------------- */

function addTagToDocument(documentId, tagId) {
  const doc = getDocument(documentId);
  if (!doc) {
    const err = new Error('document not found');
    err.status = 404;
    throw err;
  }
  const tag = store.tags.find(t => t.id === tagId);
  if (!tag) {
    const err = new Error('tag not found');
    err.status = 404;
    throw err;
  }
  if (!Array.isArray(doc.tags)) doc.tags = [];
  if (doc.tags.includes(tagId)) return doc;
  doc.tags.push(tagId);
  saveAll();
  return doc;
}

function removeTagFromDocument(documentId, tagId) {
  const doc = getDocument(documentId);
  if (!doc) {
    const err = new Error('document not found');
    err.status = 404;
    throw err;
  }
  if (Array.isArray(doc.tags)) {
    doc.tags = doc.tags.filter(t => t !== tagId);
    saveAll();
  }
  return doc;
}

function getDocumentsByTag(tagId) {
  return store.documents.filter(d => Array.isArray(d.tags) && d.tags.includes(tagId));
}

/* ---------------- Search / Stats ---------------- */

/**
 * 문서 이름과 경로, 태그를 기준으로 검색한다. 내용 스니펫은 경로 기반으로 라우터에서 파일 읽어 보완한다.
 */
function searchDocuments(query) {
  if (!query) return [];
  const q = query.toLowerCase();
  return store.documents.filter(d =>
    d.name.toLowerCase().includes(q) ||
    d.path.toLowerCase().includes(q) ||
    (Array.isArray(d.tags) && d.tags.some(t => t.toLowerCase().includes(q)))
  );
}

function getStats() {
  return {
    documentCount: store.documents.length,
    tagCount: store.tags.length,
    favoriteCount: store.favorites.length,
    accessLogCount: store.accessLogs.length
  };
}

module.exports = {
  load,
  getStore,
  listDocuments,
  getDocument,
  getDocumentByPath,
  createDocument,
  upsertDocument,
  updateDocument,
  deleteDocument,
  incrementAccess,
  listTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  listFavorites,
  getFavoriteByDocumentPath,
  createFavorite,
  deleteFavorite,
  deleteFavoriteByDocumentPath,
  toggleFavorite,
  listAccessLogs,
  createAccessLog,
  addTagToDocument,
  removeTagFromDocument,
  getDocumentsByTag,
  searchDocuments,
  getStats
};
