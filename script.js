// スマホのメニュー
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector('.site-header nav');
if (menuBtn && nav) {
  menuBtn.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// スクロールすると、カードがふわっと出てくる
const targets = document.querySelectorAll('.project-card, .news-list details, .profile, .about-story, .department-note');
if ('IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-shown'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
}

// お問い合わせ：?type=ai / ?type=voice で「相談の種類」を選んでおく
const form = document.getElementById('contact-form');
if (form) {
  const type = new URLSearchParams(location.search).get('type');
  const map = { ai: 'AIの仕事', voice: '声優', program: '番組' };
  if (map[type]) form.elements.type.value = map[type];

  // 送信：Googleフォームに送る（届いた内容は、王様のスプレッドシートにたまる）
  form.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const result = form.querySelector('.form-result');
    const btn = form.querySelector('button[type="submit"]');
    if (form.elements.website && form.elements.website.value) { form.reset(); return; } // ロボット対策
    const action = form.dataset.gform;
    let entries = {};
    try { entries = JSON.parse(form.dataset.entries || '{}'); } catch (e) { /* 何もしない */ }
    if (!action || !entries.name) { result.textContent = '送信できませんでした。お手数ですが、メールでご連絡ください。'; return; }
    const body = new URLSearchParams();
    ['name', 'email', 'type', 'message'].forEach((k) => { if (entries[k] && form.elements[k]) body.append(entries[k], form.elements[k].value); });
    btn.disabled = true;
    result.textContent = '送信中…';
    fetch(action, { method: 'POST', mode: 'no-cors', body })
      .then(() => {
        form.reset();
        result.textContent = '送信しました！ありがとうございます。内容を確認して、ご連絡します。';
      })
      .catch(() => { result.textContent = '送信できませんでした。お手数ですが、メールでご連絡ください。'; })
      .finally(() => { btn.disabled = false; });
  });
}

// ---------- お知らせ（Googleスプレッドシートから読みこむ） ----------
// スプレッドシートの列：A 日付 / B タイトル / C 本文 / D リンク（なくてもOK）。1行目は見出し。
(() => {
  const lists = [...document.querySelectorAll('.news-list[data-news-csv]')];
  document.querySelectorAll('template').forEach((t) => lists.push(...t.content.querySelectorAll('.news-list[data-news-csv]')));
  const url = lists.length ? lists[0].dataset.newsCsv : '';
  if (!url) return; // URLがないときは、書いてあるお知らせのまま

  // CSV を読む（"..." の中のカンマや改行にも対応）
  function parseCSV(text) {
    const rows = []; let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
        else if (c === '"') q = false;
        else cell += c;
      } else if (c === '"') q = true;
      else if (c === ',') { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') {
        if (c === '\r' && text[i + 1] === '\n') i++;
        row.push(cell); rows.push(row); row = []; cell = '';
      } else cell += c;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function toDate(s) {
    const m = String(s).trim().match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
    if (!m) return null;
    return { key: m[1] + m[2].padStart(2, '0') + m[3].padStart(2, '0'), show: `${m[1]}.${m[2].padStart(2, '0')}.${m[3].padStart(2, '0')}` };
  }

  fetch(url, { cache: 'no-store' })
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.text(); })
    .then((text) => {
      const items = parseCSV(text).slice(1)
        .map((r) => ({ d: toDate(r[0] || ''), title: (r[1] || '').trim(), body: (r[2] || '').trim(), link: (r[3] || '').trim() }))
        .filter((it) => it.d && it.title)
        .sort((a, b) => (a.d.key < b.d.key ? 1 : -1));
      if (!items.length) return;
      lists.forEach((l) => {
        // サイトに直接書いた「固定のお知らせ」（data-pinned）は残して、シートのお知らせとまぜて日付順に
        const pinned = [...l.querySelectorAll('details[data-pinned]')].map((el) => ({ key: el.dataset.pinned, html: el.outerHTML }));
        const rows = items.map((it) => {
          const link = /^https?:\/\//.test(it.link) ? ` <a href="${esc(it.link)}" target="_blank" rel="noopener noreferrer">→ 詳しく見る</a>` : '';
          return { key: it.d.key, html: `<details><summary><time>${esc(it.d.show)}</time><span>${esc(it.title)}</span><b>＋</b></summary>` +
                   `<p>${esc(it.body).replace(/\n/g, '<br>')}${link}</p></details>` };
        });
        l.innerHTML = pinned.concat(rows).sort((a, b) => (a.key < b.key ? 1 : a.key > b.key ? -1 : 0)).map((x) => x.html).join('');
      });
    })
    .catch(() => { /* 読みこめないときは、書いてあるお知らせのまま */ });
})();
