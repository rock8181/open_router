#!/usr/bin/env node
// @changelog - 변경 사항 조회 및 기록 명령어
// 사용법: node changelog.js [view|add]

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHANGELOG_PATH = path.resolve(__dirname, 'CHANGELOG.md');
const PROJECT_ROOT = path.resolve(__dirname);

function view() {
  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.error('CHANGELOG.md 파일을 찾을 수 없습니다.');
    process.exit(1);
  }
  console.log(fs.readFileSync(CHANGELOG_PATH, 'utf-8'));
}

function add(entry) {
  if (!entry) {
    console.error('사용법: node changelog.js add "<변경 내용>"');
    process.exit(1);
  }

  if (!fs.existsSync(CHANGELOG_PATH)) {
    console.error('CHANGELOG.md 파일을 찾을 수 없습니다.');
    process.exit(1);
  }

  const now = new Date();
  const dateStr = now.toISOString().split('T')[0];
  const entryLine = `- [${dateStr}] ${entry}\n`;

  let content = fs.readFileSync(CHANGELOG_PATH, 'utf-8');

  // [Unreleased] 섹션의 Added 항목 뒤에 삽입
  const unreleasedMatch = content.match(/## \[Unreleased\]\n\n### Added\n/);
  if (unreleasedMatch) {
    const insertPos = unreleasedMatch.index + unreleasedMatch[0].length;
    content = content.slice(0, insertPos) + entryLine + content.slice(insertPos);
  } else {
    content += `\n\n${entryLine}`;
  }

  fs.writeFileSync(CHANGELOG_PATH, content, 'utf-8');
  console.log('Changelog 항목이 추가되었습니다.');
}

function gitLog() {
  try {
    const log = execSync('git log --oneline -10', { cwd: PROJECT_ROOT, encoding: 'utf-8' });
    console.log('최근 커밋 이력:\n');
    console.log(log);
  } catch (e) {
    console.error('Git 로그를 가져올 수 없습니다.');
  }
}

const args = process.argv.slice(2);
const command = args[0];

switch (command) {
  case 'view':
    view();
    break;
  case 'add':
    add(args[1]);
    gitLog();
    break;
  case 'log':
    gitLog();
    break;
  default:
    console.log('사용법:');
    console.log('  node changelog.js view   - CHANGELOG.md 내용 보기');
    console.log('  node changelog.js add "내용"  - 새 항목 추가');
    console.log('  node changelog.js log    - 최근 git 커밋 이력 보기');
}
