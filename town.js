// PLA STUDIO の町：建物・ぷにぃ・しかけ・スタンプカード
(() => {
  const wrap = document.querySelector('.town-wrap');
  if (!wrap) return;
  const IMG = wrap.dataset.img || 'img/';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- セリフ ----------
  // 1〜7：王様のセリフ（そのまま）
  const LINES = {
    welcome: 'ようこそ、PLA STUDIOの町へ〜！ ぷにぃと一緒にあそぼっ👻',
    poke: '気になる建物、ぽちっとしてみて！',
    guide: '今日はどこから回る？ ぷにぃが案内するよ！',
    post: 'おてがみやご相談は、郵便局をのぞいてみてね💌',
    game: 'ゲーム開発室は、ただいま制作中〜！『巡』をこつこつ作ってるんだって！',
    time: '朝の町も、夜の町も、それぞれ楽しいよ〜！',
    complete: 'わーい！全部まわってくれたんだね！ありがとう🎉',
    // ここから下：クロちょの案（王様チェック待ち）
    pout: 'もう〜！くすぐったいってば〜！',
    hint: 'この町のどこかに、ちっちゃいぷにぃがかくれてるよ…さがしてみてね👀',
    found: 'みつかっちゃった〜！',
    balloon: 'あっ、風船が〜！',
    cat: 'にゃっ！',
    stall: 'クレープ、いかが〜？🍦',
    hotballoon: 'ふわふわ〜🎈',
    train: 'ポッポー！🚂',
    here: (name) => `ここは${name}だよ〜！`,
    hello: { morning: 'おはよう〜☀️', day: 'こんにちは〜！', evening: '夕方の町、きれいだね〜🌇', night: 'こんばんは〜🌙' },
  };
  const REACT = {
    hq: 'ようこそ、PLA本部へ！👑',
    ai: 'ピピッ…自動化中…🤖',
    studio: 'あ・え・い・う・え・お・あ・お！🎙️',
    game: 'トンテンカン🔨',
    tv: '3、2、1…キュー！📺',
    post: 'おてがみ、とどけま〜す💌',
    board: 'おしらせ、更新中〜📢',
  };
  const NAMES = { hq: 'PLA本部', ai: 'AI研究所', studio: '収録スタジオ', game: 'ゲーム開発室', tv: '放送局', post: '郵便局', board: '掲示板' };
  const EMOJI = { hq: '🏢', ai: '💻', studio: '🎙️', game: '🎮', tv: '📺', post: '💌', board: '📢' };

  // ---------- 時間（朝・昼・夕方・夜） ----------
  const TIMES = ['morning', 'day', 'evening', 'night'];
  const TIME_LABEL = { morning: '☀️ 朝', day: '🌤️ 昼', evening: '🌇 夕方', night: '🌙 夜' };
  const h = new Date().getHours();
  let time = h >= 5 && h < 10 ? 'morning' : h < 16 && h >= 10 ? 'day' : h < 19 && h >= 16 ? 'evening' : 'night';
  const timeBtn = wrap.querySelector('[data-tool="time"]');
  function setTime(t) {
    time = t;
    TIMES.forEach((x) => document.body.classList.toggle('t-' + x, x === t));
    if (timeBtn) timeBtn.textContent = `${TIME_LABEL[t]}の町`;
  }
  setTime(time);
  if (timeBtn) timeBtn.addEventListener('click', () => {
    setTime(TIMES[(TIMES.indexOf(time) + 1) % TIMES.length]);
    say(LINES.time, 'happy');
  });

  // ---------- ふきだし ----------
  const bubbles = {};
  function bubbleAt(key, el, html, ms = 2600) {
    let b = bubbles[key];
    if (!b) { b = bubbles[key] = document.createElement('div'); b.className = 'bubble'; b.setAttribute('role', 'status'); wrap.appendChild(b); }
    b.innerHTML = html;
    const r = el.getBoundingClientRect(), w = wrap.getBoundingClientRect();
    b.style.left = Math.min(Math.max(r.left + r.width / 2 - w.left, 120), w.width - 120) + 'px';
    b.style.top = (r.top - w.top) + 'px';
    b.classList.add('show');
    clearTimeout(b._t);
    if (ms) b._t = setTimeout(() => b.classList.remove('show'), ms);
    return b;
  }
  function hideBubble(key) { if (bubbles[key]) bubbles[key].classList.remove('show'); }

  // ---------- 今見えている町（パソコン用 or スマホ用） ----------
  const towns = [...wrap.querySelectorAll('.town')];
  const activeTown = () => towns.find((t) => t.getBoundingClientRect().width > 0) || towns[0];
  const q = (sel) => activeTown().querySelector(sel);
  const qa = (sel) => [...activeTown().querySelectorAll(sel)];

  // ---------- ぷにぃ ----------
  const FACE = { happy: IMG + 'punii_happy.png', cry: IMG + 'punii_cry.png', pout: IMG + 'punii_pout.png' };
  function walker() { return q('.punii-walker'); }
  function setFace(face) { towns.forEach((t) => t.querySelector('.punii-img').setAttribute('href', FACE[face])); }
  let faceTimer;
  function say(text, face = 'happy', ms = 3200, extraHtml = '') {
    setFace(face);
    clearTimeout(faceTimer);
    faceTimer = setTimeout(() => setFace('happy'), ms);
    const w = walker();
    return bubbleAt('punii', w.querySelector('.punii-img'), `<div>${text}</div>${extraHtml}`, ms);
  }

  // パソコン：広場をお散歩、案内で建物の前まで歩く
  const SPOTS = JSON.parse(wrap.dataset.spots || '{}');
  let pos = SPOTS.plaza || [690, 560];
  function moveTo(xy, done) {
    const w = towns[0].querySelector('.punii-walker');
    if (!w) return;
    w.classList.toggle('flip', xy[0] < pos[0]);
    w.classList.add('walking');
    hideBubble('punii');
    w.setAttribute('transform', `translate(${xy[0]} ${xy[1]})`);
    w.style.transform = `translate(${xy[0]}px, ${xy[1]}px)`;
    pos = xy;
    setTimeout(() => { w.classList.remove('walking'); done && done(); }, reduce ? 0 : 1250);
  }
  const wander = [[690, 560], [520, 560], [700, 520], [600, 610], [480, 520]];
  let wanderIdx = 0, busy = false;
  setInterval(() => {
    if (busy || hovered || document.hidden || activeTown() !== towns[0] || document.querySelector('.panel[open]')) return;
    wanderIdx = (wanderIdx + 1) % wander.length;
    moveTo(wander[wanderIdx]);
  }, 7000);

  // ぷにぃをクリック
  let talkIdx = 0, clicks = [];
  const TALK = ['welcome', 'poke', 'guide', 'post', 'time', 'hint', 'game'];
  function guideButtons() {
    return '<div class="bubble-btns">' + Object.keys(NAMES).map((k) => `<button type="button" data-go="${k}">${EMOJI[k]} ${NAMES[k]}</button>`).join('') + '</div>';
  }
  function talk() {
    const now = Date.now();
    clicks = clicks.filter((t) => now - t < 2500).concat(now);
    if (clicks.length >= 5) { clicks = []; say(LINES.pout, 'pout', 2600); bounceWalker(); return; }
    const key = TALK[talkIdx % TALK.length];
    talkIdx++;
    if (key === 'guide') say(LINES.guide, 'happy', 8000, guideButtons());
    else if (key === 'welcome') say(`${LINES.hello[time]} ${LINES.welcome}`);
    else say(LINES[key]);
    bounceWalker();
  }
  function bounceWalker() {
    const img = walker().querySelector('.punii-img');
    img.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-22px) scale(1.08)' }, { transform: 'translateY(0)' }], { duration: 450, easing: 'ease-out' });
  }
  towns.forEach((t) => {
    const p = t.querySelector('.punii-in');
    p.addEventListener('click', (e) => { e.stopPropagation(); talk(); });
    p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); talk(); } });
  });
  wrap.addEventListener('click', (e) => {
    const go = e.target.closest('[data-go]');
    if (!go) return;
    const bid = go.dataset.go;
    hideBubble('punii');
    if (activeTown() === towns[0] && SPOTS[bid]) { busy = true; moveTo(SPOTS[bid], () => { busy = false; enter(bid); }); }
    else {
      const el = q(`.bld[data-bld="${bid}"]`);
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      setTimeout(() => enter(bid), reduce ? 0 : 700);
    }
  });

  // スマホ：スクロールすると、ぷにぃが道を歩く
  const spTown = wrap.querySelector('.town-sp');
  const road = spTown && spTown.querySelector('.sp-road');
  let lastNear = null;
  function spWalk() {
    if (!spTown || activeTown() !== spTown) return;
    const r = spTown.getBoundingClientRect();
    const vb = spTown.viewBox.baseVal;
    const scale = r.width / vb.width;
    const center = window.innerHeight * 0.62;
    const yInSvg = (center - r.top) / scale; // 画面のこの高さに、ぷにぃを合わせる
    const len = road.getTotalLength();
    // 道の上で、y がいちばん近い点をさがす（あらく → こまかく）
    let best = 0, bestD = Infinity;
    for (let l = 0; l <= len; l += len / 120) { const d = Math.abs(road.getPointAtLength(l).y - yInSvg); if (d < bestD) { bestD = d; best = l; } }
    for (let l = Math.max(0, best - len / 120); l <= Math.min(len, best + len / 120); l += 2) { const d = Math.abs(road.getPointAtLength(l).y - yInSvg); if (d < bestD) { bestD = d; best = l; } }
    const p = road.getPointAtLength(best);
    const w = spTown.querySelector('.punii-walker');
    const prev = w._x || p.x;
    w.classList.toggle('flip', p.x < prev - 0.5 ? true : p.x > prev + 0.5 ? false : w.classList.contains('flip'));
    w._x = p.x;
    w.setAttribute('transform', `translate(${p.x} ${p.y})`);
    w.classList.add('walking');
    clearTimeout(w._stop);
    w._stop = setTimeout(() => w.classList.remove('walking'), 220);
    // 建物の前に着いたら、ぴょこん
    let near = null;
    spTown.querySelectorAll('.bld').forEach((b) => {
      const m = b.transform.baseVal.consolidate().matrix;
      if (Math.abs(m.f + 50 - p.y) < 40) near = b;
    });
    if (near && near !== lastNear) {
      near.classList.remove('hop'); void near.getBBox(); near.classList.add('hop');
      bubbleAt('punii', w.querySelector('.punii-img'), LINES.here(NAMES[near.dataset.bld]), 1600);
    }
    lastNear = near;
  }
  if (spTown) {
    let ticking = false;
    window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { spWalk(); ticking = false; }); } }, { passive: true });
    window.addEventListener('resize', spWalk);
    setTimeout(spWalk, 300);
  }

  // ---------- 建物に入る ----------
  const panel = document.getElementById('town-panel');
  function openPanel(bid) {
    const tpl = document.getElementById('tpl-' + bid);
    if (!tpl || !panel) return;
    panel.className = 'panel p-' + bid;
    panel.querySelector('.panel-emoji').textContent = bid === 'stamp' ? '🎫' : EMOJI[bid];
    panel.querySelector('.panel-title').textContent = bid === 'stamp' ? 'スタンプカード' : NAMES[bid];
    const body = panel.querySelector('.panel-body');
    body.innerHTML = '';
    body.appendChild(tpl.content.cloneNode(true));
    if (bid === 'stamp') renderStamps(body);
    if (typeof panel.showModal === 'function') panel.showModal(); else panel.setAttribute('open', '');
    body.scrollTop = 0;
  }
  function closePanel() {
    if (panel.open) panel.close(); else panel.removeAttribute('open');
  }
  if (panel) {
    panel.querySelector('.panel-close').addEventListener('click', closePanel);
    panel.addEventListener('click', (e) => { if (e.target === panel) closePanel(); });
    panel.addEventListener('close', () => {
      qa('.bld.open').forEach((b) => b.classList.remove('open', 'react'));
      zoomHome();
      if (pendingComplete) { pendingComplete = false; celebrate(); }
    });
  }
  // ---------- カメラ（選んだ建物にズーム） ----------
  const homeVB = new Map(towns.map((t) => [t, t.getAttribute('viewBox').split(' ').map(Number)]));
  function animVB(svg, to, ms, done) {
    const from = svg.getAttribute('viewBox').split(' ').map(Number);
    if (reduce || !ms) { svg.setAttribute('viewBox', to.join(' ')); done && done(); return; }
    const t0 = performance.now();
    const ease = (k) => (k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2);
    (function step(now) {
      const k = Math.min(1, (now - t0) / ms), e = ease(k);
      svg.setAttribute('viewBox', from.map((v, i) => v + (to[i] - v) * e).join(' '));
      if (k < 1) requestAnimationFrame(step); else done && done();
    })(t0);
  }
  function zoomTo(b, done) {
    const svg = b.ownerSVGElement, home = homeVB.get(svg);
    const sr = svg.getBoundingClientRect(), br = b.getBoundingClientRect();
    const cur = svg.getAttribute('viewBox').split(' ').map(Number);
    const k = cur[2] / sr.width;
    const cx = cur[0] + (br.left + br.width / 2 - sr.left) * k, cy = cur[1] + (br.top + br.height / 2 - sr.top) * k;
    const w = Math.min(home[2], Math.max(br.width * k * 2.6, home[2] * .42)), hgt = w * home[3] / home[2];
    const x = Math.min(Math.max(cx - w / 2, home[0]), home[0] + home[2] - w);
    const y = Math.min(Math.max(cy - hgt / 2, home[1]), home[1] + home[3] - hgt);
    hideBubble('punii');
    if (scrollable()) { frame._back = frame.scrollLeft; frame.scrollTo({ left: (frame.scrollWidth - frame.clientWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); }
    animVB(svg, [x, y, w, hgt], 650, done);
  }
  function zoomHome() {
    towns.forEach((t) => { if (t.getAttribute('viewBox') !== homeVB.get(t).join(' ')) animVB(t, homeVB.get(t), 550); });
    if (frame && frame._back != null) { frame.scrollTo({ left: frame._back, behavior: reduce ? 'auto' : 'smooth' }); frame._back = null; }
  }

  function enter(bid) {
    const b = q(`.bld[data-bld="${bid}"]`);
    if (!b) return;
    unhover();
    stamp(bid);
    const go = () => {
      b.classList.remove('hop', 'react'); void b.getBBox();
      b.classList.add('hop', 'react', 'open');
      bubbleAt('bld', b.querySelector('.sign'), REACT[bid], 1200);
      setTimeout(() => { hideBubble('bld'); openPanel(bid); }, reduce ? 0 : 900);
    };
    if (activeTown() === towns[0]) zoomTo(b, go); else go();
  }

  // カーソルをのせた建物だけ大きく。
  // 建物そのものは動かさず、「見た目のコピー」をぷにぃのすぐうしろに重ねて、いちばん前に見せる
  //（建物の順番を入れかえると、クリックが別のところを押したあつかいになってしまうため）
  let hovered = null, clone = null;
  towns.forEach((t, ti) => t.querySelectorAll('.bld').forEach((b, i) => { if (!b.id) b.id = `bld-${ti}-${i}`; }));
  function hover(b) {
    if (hovered === b) return;
    unhover();
    hovered = b;
    b.classList.add('is-hover');
    const svg = b.ownerSVGElement;
    svg.classList.add('hovering');
    // 本物をそのままコピーして前に重ね、本物は透明にする（クリックは本物が受けとる）
    clone = b.cloneNode(true);
    clone.removeAttribute('id');
    clone.removeAttribute('data-bld');
    clone.removeAttribute('tabindex');
    clone.removeAttribute('role');
    clone.setAttribute('class', 'hover-clone');
    clone.setAttribute('aria-hidden', 'true');
    clone.style.pointerEvents = 'none';
    b.style.opacity = '0';
    svg.insertBefore(clone, svg.querySelector(':scope > .punii-walker'));
  }
  function unhover() {
    if (clone) { clone.remove(); clone = null; }
    if (!hovered) return;
    const b = hovered; hovered = null;
    b.style.opacity = '';
    b.classList.remove('is-hover');
    b.ownerSVGElement.classList.remove('hovering');
  }

  towns.forEach((t) => t.querySelectorAll('.bld').forEach((b) => {
    b.addEventListener('click', (e) => { if (e.target.closest('.gimmick')) return; enter(b.dataset.bld); });
    b.addEventListener('mouseenter', () => {
      if (document.querySelector('.panel[open]')) return;
      hover(b);
      // ぷにぃがその建物に寄ってくる（ちょっと止まってから）
      clearTimeout(b._comeT);
      b._comeT = setTimeout(() => {
        if (hovered !== b || busy || activeTown() !== towns[0]) return;
        const spot = SPOTS[b.dataset.bld];
        if (!spot) return;
        busy = true;
        moveTo(spot, () => {
          busy = false;
          if (hovered === b) say(LINES.here(NAMES[b.dataset.bld]), 'happy', 1800);
        });
      }, 350);
    });
    b.addEventListener('mouseleave', () => { clearTimeout(b._comeT); if (hovered === b) unhover(); });
    b.addEventListener('focus', () => hover(b));
    b.addEventListener('blur', () => { if (hovered === b) unhover(); });
    b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); enter(b.dataset.bld); } });
  }));

  // ゲーム開発室：ときどき窓からなにかがのぞく…
  setInterval(() => {
    if (document.hidden) return;
    towns.forEach((t) => {
      const g = t.querySelector('.bld-game');
      g.classList.add('peeking');
      setTimeout(() => g.classList.remove('peeking'), 900);
    });
  }, 9000);

  // ---------- しかけ ----------
  const sunClicks = new WeakMap();
  function retrigger(el, cls, ms) { el.classList.remove(cls); void el.getBBox(); el.classList.add(cls); if (ms) setTimeout(() => el.classList.remove(cls), ms); }
  wrap.addEventListener('click', (e) => {
    const g = e.target.closest('.gimmick');
    if (!g) return;
    e.stopPropagation();
    switch (g.dataset.gimmick) {
      case 'crown': retrigger(g, 'spin', 1000); break;
      case 'cloud': retrigger(g, 'poof', 2600); break;
      case 'sun': {
        const n = (sunClicks.get(g) || 0) + 1; sunClicks.set(g, n);
        retrigger(g, 'bounce', 400);
        if (n % 3 === 0) g.classList.toggle('cool');
        break;
      }
      case 'moon': retrigger(g, 'wink', 900); break;
      case 'fountain': retrigger(g, 'splash', 900); break;
      case 'tree': retrigger(g, 'shake', 500); break;
      case 'flower': retrigger(g, 'twirl', 700); break;
      case 'cat': retrigger(g, 'awake', 2400); bubbleAt('cat', g, LINES.cat, 1400); break;
      case 'balloon': retrigger(g, 'away', 3000); say(LINES.balloon, 'cry', 2200); break;
      case 'stall': retrigger(g, 'bounce', 450); bubbleAt('etc', g, LINES.stall, 1600); break;
      case 'hotballoon': retrigger(g, 'bounce', 450); bubbleAt('etc', g, LINES.hotballoon, 1600); break;
      case 'train': bubbleAt('etc', e.target, LINES.train, 1400); break;
    }
  });

  // ---------- かくれぷにぃ ----------
  wrap.addEventListener('click', (e) => {
    const hp = e.target.closest('.hidden-punii');
    if (!hp) return;
    e.stopPropagation();
    const id = 'hid' + hp.dataset.hid;
    towns.forEach((t) => t.querySelector(`.hidden-punii[data-hid="${hp.dataset.hid}"]`).classList.add('found'));
    bubbleAt('hid', hp, LINES.found, 1600);
    stamp(id);
  });

  // ---------- スタンプカード ----------
  const ALL = ['hq', 'ai', 'studio', 'game', 'tv', 'post', 'board', 'hid1', 'hid2', 'hid3'];
  const STAMP_LABEL = { hid1: 'かくれぷにぃ①', hid2: 'かくれぷにぃ②', hid3: 'かくれぷにぃ③' };
  const STAMP_COLOR = { hq: '#ff9a1f', ai: '#1fb8f0', studio: '#a45cf0', game: '#2ec27e', tv: '#ff6fa5', post: '#ff5a4f', board: '#e8a33a', hid1: '#b48cff', hid2: '#b48cff', hid3: '#b48cff' };
  let got = new Set();
  try { got = new Set(JSON.parse(localStorage.getItem('pla-town-stamps') || '[]')); } catch (e) { /* 保存できない環境でも動く */ }
  let pendingComplete = false;
  const stampBtn = wrap.querySelector('[data-tool="stamp"]');
  function refreshStamps() {
    if (stampBtn) stampBtn.innerHTML = `🎫 スタンプ <span class="count">${got.size}/${ALL.length}</span>`;
    got.forEach((id) => {
      if (id.startsWith('hid')) towns.forEach((t) => { const el = t.querySelector(`.hidden-punii[data-hid="${id.slice(3)}"]`); if (el) el.classList.add('found'); });
    });
  }
  function stamp(id) {
    if (got.has(id)) return;
    got.add(id);
    try { localStorage.setItem('pla-town-stamps', JSON.stringify([...got])); } catch (e) { /* 何もしない */ }
    refreshStamps();
    if (got.size === ALL.length) {
      if (panel && panel.open) pendingComplete = true; else setTimeout(celebrate, 900);
    }
  }
  function renderStamps(body) {
    const grid = body.querySelector('.stamp-grid');
    grid.innerHTML = ALL.map((id) => got.has(id)
      ? `<div class="stamp got" style="background:${STAMP_COLOR[id]}"><div><span>${id.startsWith('hid') ? '👻' : EMOJI[id]}</span>${STAMP_LABEL[id] || NAMES[id]}</div></div>`
      : `<div class="stamp"><div>${id.startsWith('hid') ? '？' : NAMES[id]}</div></div>`).join('');
  }
  if (stampBtn) stampBtn.addEventListener('click', () => openPanel('stamp'));
  refreshStamps();

  function celebrate() {
    say(LINES.complete, 'happy', 5000);
    if (reduce) return;
    const colors = ['#ff9a1f', '#1fb8f0', '#a45cf0', '#ffd23f', '#ff6fa5', '#2ec27e'];
    for (let i = 0; i < 70; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = Math.random() * .8 + 's';
      c.style.borderRadius = i % 3 ? '2px' : '50%';
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 3600);
    }
  }

  // ---------- スマホ：横にスワイプして町を歩く ----------
  const frame = wrap.querySelector('.town-frame');
  const hint = wrap.querySelector('.swipe-hint');
  const scrollable = () => frame && frame.scrollWidth > frame.clientWidth + 4;
  function centerOn(svgX, smooth) {
    if (!scrollable()) return;
    const svg = towns[0], vb = svg.viewBox.baseVal;
    const x = (svgX - vb.x) / vb.width * svg.getBoundingClientRect().width - frame.clientWidth / 2;
    frame.scrollTo({ left: Math.max(0, x), behavior: smooth && !reduce ? 'smooth' : 'auto' });
  }
  setTimeout(() => centerOn((SPOTS.plaza || [600])[0], false), 50);
  // 最初の位置あわせのあとで、王様たちがスワイプしたら案内を消す
  if (frame && hint) setTimeout(() => frame.addEventListener('scroll', () => hint.classList.add('hide'), { once: true, passive: true }), 600);

  // ---------- 最初のあいさつ ----------
  setTimeout(() => {
    const r = activeTown().getBoundingClientRect();
    if (r.top < window.innerHeight && r.bottom > 0) say(`${LINES.hello[time]} ${LINES.welcome}`, 'happy', 4200);
  }, 1200);
})();
