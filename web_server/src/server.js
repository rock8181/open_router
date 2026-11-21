const express = require('express');
const path = require('path');
const fs = require('fs');
const marked = require('marked');

const app = express();
const PORT = process.env.PORT || 3000;

const ROOTS = {
  open_router: path.resolve('C:/work/openrouter/open_router/doc'),
  study: path.resolve('C:/work/openrouter/study/01_skill_claude')
};

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());

function isWithinRoot(rootPath, targetPath) {
  const resolved = path.resolve(targetPath);
  return resolved === rootPath || resolved.startsWith(rootPath + path.sep);
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/documents', (req, res) => {
  const { root, dir = '' } = req.query;
  const rootPath = ROOTS[root];
  if (!rootPath) {
    return res.status(400).json({ error: 'Invalid root' });
  }
  const targetDir = path.resolve(rootPath, dir);
  if (!isWithinRoot(rootPath, targetDir)) {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (!fs.existsSync(targetDir) || !fs.statSync(targetDir).isDirectory()) {
    return res.status(404).json({ error: 'Directory not found' });
  }

  const entries = fs.readdirSync(targetDir, { withFileTypes: true });
  const items = entries.map(entry => {
    const fullPath = path.join(targetDir, entry.name);
    const stat = fs.statSync(fullPath);
    const relPath = path.relative(rootPath, fullPath);
    return {
      name: entry.name,
      type: entry.isDirectory() ? 'directory' : 'file',
      path: relPath.replace(/\\/g, '/'),
      size: entry.isDirectory() ? 0 : stat.size,
      modifiedAt: stat.mtime.toISOString(),
      extension: entry.isDirectory() ? '' : path.extname(entry.name)
    };
  });

  items.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  res.json({ root, dir, items });
});

app.get('/api/view', (req, res) => {
  const { root, file } = req.query;
  const rootPath = ROOTS[root];
  if (!rootPath || !file) {
    return res.status(400).json({ error: 'Invalid parameters' });
  }
  const filePath = path.resolve(rootPath, file);
  if (!isWithinRoot(rootPath, filePath) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    return res.status(404).json({ error: 'File not found' });
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const html = marked.parse(content);

  res.json({
    path: file,
    name: path.basename(filePath),
    content,
    html,
    size: Buffer.byteLength(content, 'utf-8'),
    modifiedAt: fs.statSync(filePath).mtime.toISOString()
  });
});

app.get('/api/search', (req, res) => {
  const { q, root } = req.query;
  if (!q) return res.status(400).json({ error: 'Query required' });

  const results = [];
  const query = q.toLowerCase();
  const rootsToSearch = root ? [ROOTS[root]] : Object.values(ROOTS);

  for (const rootPath of rootsToSearch) {
    if (!fs.existsSync(rootPath)) continue;
    scanDir(rootPath, rootPath, query, results);
  }

  results.sort((a, b) => b.score - a.score);
  res.json({ query, results: results.slice(0, 20) });
});

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
            root: Object.keys(ROOTS).find(k => ROOTS[k] === rootPath)
          });
        }
      } catch (e) {}
    }
  }
}

app.listen(PORT, () => {
  console.log(`Web server running at http://localhost:${PORT}`);
});
