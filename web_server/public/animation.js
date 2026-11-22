/* ============================================================
   OpenRouter Study Document Viewer — 애니메이션 헬퍼
   JavaScript 애니메이션 제어 (키프레임 클래스 토글, 모션 감소 존중)
   ============================================================ */

/* 모션 감소 미디어 쿼리 */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/* 모션 사용 가능 여부 */
function motionEnabled() {
  return !prefersReducedMotion.matches;
}

/* ---------------------------------------------------------------
   한 번에 한 가지 굵은 모션만 재생(동시 애니메이션 잠금)
   여러 요소가 동시에 움직이는 것을 방지하여 인지 부하 감소
   --------------------------------------------------------------- */
const motionLock = (function () {
  let active = false;
  const queue = [];

  function runNext() {
    if (active || queue.length === 0) return;
    active = true;
    const job = queue.shift();
    job.run().finally(() => {
      active = false;
      runNext();
    });
  }

  return {
    /* job: { run: () => Promise<void> } */
    enqueue(job) {
      queue.push(job);
      if (!active) runNext();
    },
  };
})();

/* ---------------------------------------------------------------
   요소에 애니메이션 클래스를 부여하고 트랜지션 완료까지 대기
   --------------------------------------------------------------- */
function animateClass(el, className, durationMs) {
  if (!el) return Promise.resolve();
  const timeout = durationMs || 300;

  return new Promise((resolve) => {
    if (!motionEnabled()) {
      el.classList.add(className);
      resolve();
      return;
    }
    let done = false;
    function onEnd(e) {
      if (e && e.target !== el) return;
      done = true;
      el.removeEventListener('animationend', onEnd);
      el.removeEventListener('transitionend', onEnd);
      resolve();
    }
    el.addEventListener('animationend', onEnd, { once: true });
    el.addEventListener('transitionend', onEnd, { once: true });
    el.classList.add(className);
    setTimeout(() => {
      if (!done) resolve();
    }, timeout + 50);
  });
}

/* 클래스 제거 */
function removeClassAfter(el, className, delayMs = 0) {
  if (!el) return;
  setTimeout(() => el.classList.remove(className), delayMs);
}

/* ---------------------------------------------------------------
   1. 카드 입장: 순차 페이드인 + 슬라이드업
   index 순서대로 staggerDelay 간격(기본 60ms)으로 진입
   --------------------------------------------------------------- */
function staggerEnter(cards, { delay = 60, duration = 250 } = {}) {
  if (!cards || cards.length === 0) return Promise.resolve();
  if (!motionEnabled()) {
    cards.forEach((c) => { c.style.opacity = '1'; c.style.animation = 'none'; });
    return Promise.resolve();
  }
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.animation = `cardEnter ${duration}ms var(--ease-entrance) forwards`;
    card.style.animationDelay = `${index * delay}ms`;
    card.classList.add('card-enter');
  });
  const last = cards[cards.length - 1];
  return animateClass(last, 'card-enter', (cards.length - 1) * delay + duration + 50);
}

/* 카드 입장 클래스 정리(재사용 시) */
function clearCardEnter(cards) {
  if (!cards) return;
  cards.forEach((card) => {
    card.style.opacity = '';
    card.style.animation = '';
    card.style.animationDelay = '';
    card.classList.remove('card-enter');
  });
}

/* ---------------------------------------------------------------
   2. 카드 열기/닫기: 3D 플립 (열기 300ms, 닫기 350ms)
   --------------------------------------------------------------- */
function flipCard(card, open = true) {
  if (!card) return Promise.resolve();
  const front = card.querySelector('.gf-front');
  const back = card.querySelector('.gf-back');
  if (!front || !back) return Promise.resolve();

  card.classList.remove('close');
  if (!open) card.classList.add('close');
  card.classList.add('is-flipping');

  const duration = open ? 300 : 350;

  return new Promise((resolve) => {
    if (!motionEnabled()) {
      /* 모션 감소: 즉시 상태만 변경 */
      if (open) {
        front.style.opacity = '0';
        back.style.opacity = '1';
      } else {
        front.style.opacity = '1';
        back.style.opacity = '0';
      }
      card.classList.remove('is-flipping', 'close');
      resolve();
      return;
    }
    let done = false;
    function onEnd(e) {
      if (e && e.target !== front && e.target !== back) return;
      done = true;
      front.removeEventListener('animationend', onEnd);
      back.removeEventListener('animationend', onEnd);
      card.classList.remove('is-flipping', 'close');
      resolve();
    }
    front.addEventListener('animationend', onEnd, { once: true });
    back.addEventListener('animationend', onEnd, { once: true });
    setTimeout(() => {
      if (!done) {
        card.classList.remove('is-flipping', 'close');
        resolve();
      }
    }, duration + 50);
  });
}

/* ---------------------------------------------------------------
   4. 파일 시트 팬아웃: 폴더 열릴 때 파일 시트 순차 부채꼴
   파일당 40ms 지연(--sheet-fan-delay 토큰 사용)
   --------------------------------------------------------------- */
function fanSheets(container, show = true) {
  if (!container) return Promise.resolve();
  const sheets = Array.from(container.querySelectorAll('.gf-sheet'));
  if (sheets.length === 0) return Promise.resolve();
  if (!motionEnabled()) {
    sheets.forEach((s) => {
      s.classList.remove('sheet-fan-in', 'sheet-fan-out');
      s.style.opacity = show ? '1' : '0';
    });
    return Promise.resolve();
  }
  sheets.forEach((sheet, index) => {
    sheet.classList.remove('sheet-fan-in', 'sheet-fan-out');
    sheet.classList.add(show ? 'sheet-fan-in' : 'sheet-fan-out');
    sheet.style.animationDelay = `${index * 40}ms`;
  });
  const last = sheets[sheets.length - 1];
  return animateClass(last, show ? 'sheet-fan-in' : 'sheet-fan-out', (sheets.length - 1) * 40 + 200 + 50);
}

/* ---------------------------------------------------------------
   5. 토스트 애니메이션: 오른쪽 하단 슬라이드인 (200ms)
   --------------------------------------------------------------- */
let toastContainer = null;

function ensureToastContainer() {
  if (toastContainer) return toastContainer;
  toastContainer = document.createElement('div');
  toastContainer.className = 'toast-container';
  document.body.appendChild(toastContainer);
  return toastContainer;
}

function showToast(msg, kind = 'info', duration = 3000) {
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-enter`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.textContent = msg;
  container.appendChild(toast);

  animateClass(toast, 'toast-enter', 200).then(() => {
    toast.classList.remove('toast-enter');
  });

  const timeout = setTimeout(() => {
    toast.classList.add('toast-exit');
    animateClass(toast, 'toast-exit', 200).then(() => {
      toast.remove();
      if (container.children.length === 0) {
        container.remove();
        toastContainer = null;
      }
    });
  }, duration);

  return { element: toast, cancel: () => clearTimeout(timeout) };
}

/* ---------------------------------------------------------------
   6. 다이얼로그 애니메이션: 스케일 + 페이드 (200ms)
   --------------------------------------------------------------- */
function openDialog(el) {
  if (!el) return Promise.resolve();
  el.style.display = el.style.display || 'block';
  el.classList.add('dialog-enter');
  return animateClass(el, 'dialog-enter', 200).then(() => {
    el.classList.remove('dialog-enter');
  });
}

function closeDialog(el) {
  if (!el) return Promise.resolve();
  el.classList.add('dialog-exit');
  return animateClass(el, 'dialog-exit', 200).then(() => {
    el.classList.remove('dialog-exit');
    el.style.display = 'none';
  });
}

/* ---------------------------------------------------------------
   7. 드래그앤드롭 시각: 리프트 + 섀도우 + 커서 추종
   --------------------------------------------------------------- */
function setupDragVisual(card) {
  if (!card) return () => {};
  let dragImage = null;
  let active = false;

  function onDragStart(e) {
    if (!motionEnabled()) return;
    active = true;
    dragImage = card.cloneNode(true);
    dragImage.className = (card.className || '') + ' is-dragging';
    dragImage.style.width = `${card.offsetWidth}px`;
    dragImage.style.height = `${card.offsetHeight}px`;
    dragImage.style.position = 'fixed';
    dragImage.style.top = `${card.offsetTop}px`;
    dragImage.style.left = `${card.offsetLeft}px`;
    dragImage.style.transition = 'none';
    document.body.appendChild(dragImage);
    card.classList.add('is-dragging');

    function onMove(ev) {
      if (!dragImage) return;
      dragImage.style.left = `${ev.clientX - dragImage.offsetWidth / 2}px`;
      dragImage.style.top = `${ev.clientY - dragImage.offsetHeight / 2}px`;
    }
    document.addEventListener('mousemove', onMove);

    function onDrop() {
      document.removeEventListener('mousemove', onMove);
      if (dragImage) dragImage.remove();
      dragImage = null;
      card.classList.remove('is-dragging');
      active = false;
      document.removeEventListener('mouseup', onDrop);
      document.removeEventListener('dragend', onDrop);
    }
    document.addEventListener('mouseup', onDrop, { once: true });
    document.addEventListener('dragend', onDrop, { once: true });
  }

  card.addEventListener('dragstart', onDragStart);
  return () => {
    card.removeEventListener('dragstart', onDragStart);
    if (dragImage) dragImage.remove();
  };
}

/* 드래그 오버 타겟 시각 피드백 */
function setDragOver(el, over) {
  if (!el) return;
  if (over) el.classList.add('drag-over');
  else el.classList.remove('drag-over');
}

/* ---------------------------------------------------------------
   8. 정렬 애니메이션: 카드 재정렬 시 부드러운 전환
   --------------------------------------------------------------- */
function sortCards(cards, newOrder) {
  if (!cards || cards.length === 0) return Promise.resolve();
  const list = Array.from(cards);
  if (!motionEnabled()) {
    newOrder.forEach((card) => {
      if (list.includes(card)) card.parentNode.appendChild(card);
    });
    return Promise.resolve();
  }
  /* 이탈 중인 카드에 exiting 클래스 부여 */
  list.forEach((card) => card.classList.add('grid-sort', 'exiting'));

  return new Promise((resolve) => {
    let done = false;
    function onEnd(e) {
      if (e && e.target !== cardList[cardList.length - 1]) return;
      done = true;
      cardList.forEach((c) => {
        c.removeEventListener('transitionend', onEnd);
        c.classList.remove('grid-sort', 'exiting');
        c.style.transform = '';
        c.style.opacity = '';
      });
      resolve();
    }
    const cardList = newOrder.filter((c) => list.includes(c));
    cardList.forEach((c) => c.addEventListener('transitionend', onEnd, { once: true }));
    /* DOM 순서 재배치 */
    cardList.forEach((c) => c.parentNode.appendChild(c));
    /* 다음 프레임에서 위치 보정 후 재배치 트랜지션 재생 */
    requestAnimationFrame(() => {
      cardList.forEach((c) => {
        c.style.transform = '';
        c.style.opacity = '1';
      });
    });
    setTimeout(() => {
      if (!done) {
        cardList.forEach((c) => {
          c.classList.remove('grid-sort', 'exiting');
          c.style.transform = '';
          c.style.opacity = '';
        });
        resolve();
      }
    }, 350);
  });
}

/* ---------------------------------------------------------------
   9. 즐겨찾기 토글: 스타 채움 애니메이션 (200ms)
   --------------------------------------------------------------- */
function toggleFavorite(btn) {
  if (!btn) return Promise.resolve();
  const isActive = btn.classList.contains('is-active');
  const next = !isActive;

  btn.classList.add('toggling');
  if (next) {
    btn.classList.add('is-active');
    btn.setAttribute('aria-checked', 'true');
  } else {
    btn.classList.remove('is-active');
    btn.setAttribute('aria-checked', 'false');
  }

  return animateClass(btn, 'toggling', 200).then(() => {
    btn.classList.remove('toggling');
    return next;
  });
}

/* ---------------------------------------------------------------
   10. 테마 토글: 태양/달 회전 (300ms)
   --------------------------------------------------------------- */
function toggleTheme(btn) {
  if (!btn) return Promise.resolve();
  btn.classList.add('toggling');
  return animateClass(btn, 'toggling', 300).then(() => {
    btn.classList.remove('toggling');
  });
}

/* ---------------------------------------------------------------
   모션 감소 변경 시 실행 중인 애니메이션 초기화
   --------------------------------------------------------------- */
prefersReducedMotion.addEventListener('change', () => {
  document
    .querySelectorAll('.card-enter, .sheet-fan-in, .sheet-fan-out, .toast-enter, .toast-exit, .dialog-enter, .dialog-exit, .toggling, .is-dragging')
    .forEach((el) => {
      el.style.animation = 'none';
      el.classList.remove('card-enter', 'sheet-fan-in', 'sheet-fan-out', 'toast-enter', 'toast-exit', 'dialog-enter', 'dialog-exit', 'toggling', 'is-dragging');
      el.style.opacity = '';
      el.style.transform = '';
    });
  document.querySelectorAll('.grid-sort').forEach((el) => {
    el.classList.remove('grid-sort', 'exiting');
    el.style.transition = '';
    el.style.transform = '';
    el.style.opacity = '';
  });
});
