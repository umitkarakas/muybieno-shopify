/* Muybieno — Kahve Bulucu motoru (client-side).
   Veri: section'daki .ehcf__data JSON'undan. Skorlama + render + sepete ekleme.
   Sınıflar section CSS'iyle (ehcf__) eşleşir. */
(function () {
  'use strict';

  var Q1 = [
    { id: 'pratik',     ic: 'cup',     b: 'Makinem yok / en pratiği',          s: 'En kolay hazırlık — sıcak su yeter' },
    { id: 'cezve',      ic: 'pot',     b: 'Cezve (Türk kahvesi)',              s: 'Ocakta cezveyle pişireceğim' },
    { id: 'filtre',     ic: 'filter',  b: 'Filtre makinesi / French press',    s: 'Öğütülmüş kahve kullanırım' },
    { id: 'espresso',   ic: 'beans',   b: 'Espresso makinem var',              s: 'Çekirdek alıp öğüteceğim' },
    { id: 'kapsul',     ic: 'capsule', b: 'Nespresso / kapsül makinem var',    s: 'Kapsül kullanırım' },
    { id: 'bilmiyorum', ic: 'spark',   b: 'Bilmiyorum, benim için seçin',      s: 'En kolayından başlayalım' }
  ];
  var Q2 = [
    { id: 'yumusak',    ic: 'leaf',   b: 'Yumuşak & dengeli',  s: 'Sütle de güzel, sert değil',        tgt: { s: 3, a: 2, g: 3 }, kav: ['Orta'] },
    { id: 'sert',       ic: 'flame',  b: 'Sert & yoğun',       s: 'Koyu, dolgun, tok',                 tgt: { s: 5, a: 1, g: 5 }, kav: ['Koyu (Espresso)', 'Orta-Koyu'] },
    { id: 'meyveli',    ic: 'cherry', b: 'Meyveli & canlı',    s: 'Aromatik, hafif asitli',            tgt: { s: 3, a: 5, g: 3 }, kav: ['Orta'] },
    { id: 'eminDegil',  ic: 'spark',  b: 'Emin değilim',       s: 'Yeni başlayanlar için en güvenlisi', tgt: { s: 3, a: 2, g: 3 }, kav: ['Orta'] }
  ];
  var Q3 = [
    { id: 'deneme',     ic: 'cup',   b: 'Önce küçük bir paket deneyeyim', s: 'Tek paket, uygun fiyatlı' },
    { id: 'farketmez',  ic: 'spark', b: 'Farketmez',                      s: 'En uygununu gösterin' }
  ];
  var FORM_LABEL = { cezve: 'Türk Kahvesi', filtre: 'Öğütülmüş Filtre', espresso: 'Çekirdek', kapsul: 'Kapsül', pratik: 'Pratik' };

  var ICON = {
    cup: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/></svg>',
    pot: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h11v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5Z"/><path d="M15 9h4l-3 4"/><path d="M6 8V6a2 2 0 0 1 2-2h3"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h14l-5 7v6l-4 2v-8Z"/></svg>',
    beans: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="9" cy="9" rx="4" ry="6" transform="rotate(35 9 9)"/><ellipse cx="15" cy="15" rx="4" ry="6" transform="rotate(35 15 15)"/></svg>',
    capsule: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h10l-1.5 11a4 4 0 0 1-4 3.5A4 4 0 0 1 7.5 14Z"/><line x1="6" y1="21" x2="18" y2="21"/></svg>',
    spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18"/></svg>',
    leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 16-9 0 8-4 12-9 12Z"/><path d="M4 20c2-4 5-6 8-7"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-2 1-3 1-3 1 2 2 2 2 2 0-3 2-6 2-8Z"/></svg>',
    cherry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="18" r="3"/><circle cx="17" cy="18" r="3"/><path d="M7 15c0-6 5-9 10-11M17 15c0-3 1-5 2-6"/></svg>',
    grind: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="7" r="4"/><path d="M8 11h8l-1 3H9Z"/><path d="M9 14v5h6v-5"/></svg>',
    paper: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h9l3 3v15H6Z"/><path d="M15 3v3h3"/></svg>',
    cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.7 13.4a2 2 0 0 0 2 1.6h9.7a2 2 0 0 0 2-1.6L23 6H6"/></svg>',
    restart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5"/></svg>'
  };

  function esc(t) { return String(t == null ? '' : t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function beanRow(label, val) {
    var dots = '';
    for (var i = 1; i <= 5; i++) {
      dots += '<svg class="ehcf__bean' + (i <= val ? ' on' : '') + '" viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="12" rx="6.4" ry="9" transform="rotate(45 12 12)"/><path class="ehcf__gr" d="M9 8 C 11 11, 13 13, 15 16"/></svg>';
    }
    return '<div class="ehcf__irow"><span class="ehcf__ilbl">' + label + '</span><span class="ehcf__idots" role="img" aria-label="' + label + ': 5 üzerinden ' + val + '">' + dots + '</span></div>';
  }
  function chipsFor(p) {
    return String(p.tat || '').split(/[,;·]/).map(function (x) { return x.trim(); }).filter(Boolean).slice(0, 4)
      .map(function (x) { return '<span class="ehcf__chip">' + esc(x) + '</span>'; }).join('');
  }
  function refUrl(u) { return u + (u.indexOf('?') > -1 ? '&' : '?') + 'ref=kahve-bulucu'; }

  function formFilter(id) {
    if (id === 'bilmiyorum') return function (p) { return ['pratik', 'filtre', 'cezve'].indexOf(p.form) > -1; };
    return function (p) { return p.form === id; };
  }
  function score(p, tgt, kavPref) {
    var d = Math.abs(p.s - tgt.s) * 1.0 + Math.abs(p.a - tgt.a) * 1.1 + Math.abs(p.g - tgt.g) * 1.0;
    if (kavPref && kavPref.indexOf(p.kav) > -1) d -= 1.2;
    if (p.available === false) d += 3;
    return d;
  }
  function equipNote(form) {
    if (form === 'espresso') return { ic: 'grind', txt: 'Küçük bir ipucu: çekirdek için bir <b>kahve değirmeni</b> gerekir — Ekipmanlar bölümünde bulabilirsiniz.' };
    if (form === 'filtre') return { ic: 'paper', txt: 'Küçük bir ipucu: filtre/V60 için <b>kağıt filtre</b> Ekipmanlar bölümünde.' };
    if (form === 'cezve') return { ic: 'pot', txt: 'Cezveniz yoksa Ekipmanlar bölümünden uygun bir <b>cezve</b> ekleyebilirsiniz.' };
    return null;
  }

  function initRoot(root) {
    if (root.__ehcfReady) return;
    root.__ehcfReady = true;
    var stage = root.querySelector('.ehcf__stage');
    var dataEl = root.querySelector('.ehcf__data');
    var products = [];
    try { products = JSON.parse(dataEl.textContent) || []; } catch (e) { products = []; }
    var cfg = {
      badge: root.getAttribute('data-badge') || 'Kahve Bulucu',
      title: root.getAttribute('data-title') || '',
      lead: root.getAttribute('data-lead') || '',
      cta: root.getAttribute('data-cta') || 'Başlayalım',
      hint: root.getAttribute('data-hint') || ''
    };
    var st = { q1: null, q2: null, q3: null };

    function optCard(o, act) {
      return '<button class="ehcf__opt" type="button" data-act="' + act + '" data-val="' + o.id + '">' +
        '<span class="ehcf__ico">' + ICON[o.ic] + '</span>' +
        '<span class="ehcf__txt"><b>' + o.b + '</b><span class="ehcf__sub">' + o.s + '</span></span>' +
        '<span class="ehcf__chev" aria-hidden="true">›</span></button>';
    }
    function progress(n) {
      var s = '';
      for (var i = 1; i <= 3; i++) s += '<i class="' + (i <= n ? 'on' : '') + '"></i>';
      return '<div class="ehcf__prog">' + s + '</div>';
    }

    function clearMcta() {
      // Sonuç ekranından çıkarken root'a taşınmış sabit CTA barını kaldır
      var m = root.querySelector(':scope > .ehcf__mcta');
      if (m) m.remove();
    }
    function renderIntro() {
      clearMcta();
      stage.innerHTML =
        '<div class="ehcf__screen">' +
          '<span class="ehcf__badge">☕ ' + esc(cfg.badge) + '</span>' +
          '<h1 class="ehcf__h1">' + esc(cfg.title) + '</h1>' +
          '<p class="ehcf__lead">' + esc(cfg.lead) + '</p>' +
          '<div class="ehcf__startrow">' +
            '<button class="ehcf__btn" type="button" data-act="start">' + esc(cfg.cta) + ' →</button>' +
            (cfg.hint ? '<span class="ehcf__hint">' + esc(cfg.hint) + '</span>' : '') +
          '</div>' +
        '</div>';
    }
    function renderQ1() {
      clearMcta();
      stage.innerHTML = '<div class="ehcf__screen">' + progress(1) +
        '<div class="ehcf__stephead"><span class="ehcf__qn">01</span><h2>Kahvenizi nasıl hazırlıyorsunuz?</h2></div>' +
        '<div class="ehcf__opts">' + Q1.map(function (o) { return optCard(o, 'q1'); }).join('') + '</div>' +
        '<div class="ehcf__backrow"><button class="ehcf__link" type="button" data-act="back" data-val="intro">← geri</button></div></div>';
    }
    function renderQ2() {
      clearMcta();
      stage.innerHTML = '<div class="ehcf__screen">' + progress(2) +
        '<div class="ehcf__stephead"><span class="ehcf__qn">02</span><h2>Nasıl bir tat seversiniz?</h2></div>' +
        '<div class="ehcf__opts">' + Q2.map(function (o) { return optCard(o, 'q2'); }).join('') + '</div>' +
        '<div class="ehcf__backrow"><button class="ehcf__link" type="button" data-act="back" data-val="q1">← geri</button></div></div>';
    }
    function renderQ3() {
      clearMcta();
      stage.innerHTML = '<div class="ehcf__screen">' + progress(3) +
        '<div class="ehcf__stephead"><span class="ehcf__qn">03</span><h2>Ne kadar denemek istersiniz?</h2></div>' +
        '<div class="ehcf__opts">' + Q3.map(function (o) { return optCard(o, 'q3'); }).join('') + '</div>' +
        '<div class="ehcf__backrow"><button class="ehcf__link" type="button" data-act="back" data-val="q2">← geri</button></div></div>';
    }

    function results() {
      var q2 = Q2.filter(function (x) { return x.id === st.q2; })[0];
      var pool = products.filter(formFilter(st.q1));
      if (!pool.length) pool = products.slice();
      pool = pool.map(function (p) { return { p: p, sc: score(p, q2.tgt, q2.kav) }; });
      if (st.q3 === 'deneme') {
        // "Önce küçük deneyeyim": tek/küçük paketi öne al, 1kg + çoklu avantaj paketlerini geri at
        pool.forEach(function (o) { o.sc += (o.p.size === 'deneme') ? -1.5 : 3.0; });
      } else {
        // "Farketmez": yeni başlayana yine de küçük paketi hafif öne al (aşırı büyük paket ilk sırada olmasın)
        pool.forEach(function (o) { if (o.p.size !== 'deneme') o.sc += 0.6; });
      }
      pool.sort(function (x, y) { return x.sc - y.sc; });
      return pool.map(function (o) { return o.p; });
    }

    function altCard(p) {
      return '<a class="ehcf__alt" href="' + esc(refUrl(p.url)) + '">' +
        '<span class="ehcf__aimg">' + (p.img ? '<img src="' + esc(p.img) + '" alt="' + esc(p.title) + '" loading="lazy">' : '') + '</span>' +
        '<span><b>' + esc(p.title) + '</b><span class="ehcf__aprice">' + esc(p.price) + '</span>' +
        '<span class="ehcf__amini">' + esc(FORM_LABEL[p.form] || '') + ' · Sertlik ' + p.s + '/5 · Asidite ' + p.a + '/5</span></span></a>';
    }

    function renderResults() {
      clearMcta();
      var list = results();
      if (!list.length) { renderIntro(); return; }
      var top = list[0];
      var alts = list.slice(1, 3);
      var q1 = Q1.filter(function (x) { return x.id === st.q1; })[0];
      var q2 = Q2.filter(function (x) { return x.id === st.q2; })[0];
      var eq = equipNote(top.form);
      var addBtn = '<button class="ehcf__btn" type="button" data-act="add" data-id="' + top.id + '" data-url="' + esc(refUrl(top.url)) + '">' + ICON.cart + ' Sepete ekle</button>';
      stage.innerHTML =
        '<div class="ehcf__screen has-mcta">' +
          '<div class="ehcf__rintro"><span class="ehcf__badge">✓ Size özel</span>' +
            '<h2>İşte size en uygun kahve ☕</h2>' +
            '<p>Seçiminiz: <b>' + esc(q1.b.toLowerCase()) + '</b> ve <b>' + esc(q2.b.toLowerCase()) + '</b> — bu kahve tam da bu profile oturuyor.</p></div>' +
          '<div class="ehcf__primary">' +
            '<div class="ehcf__pimg">' + (top.img ? '<img src="' + esc(top.img) + '" alt="' + esc(top.title) + '">' : '') + '</div>' +
            '<div class="ehcf__pbody">' +
              '<div class="ehcf__ptype">' + esc(FORM_LABEL[top.form] || '') + (top.kav ? ' · ' + esc(top.kav) : '') + '</div>' +
              '<div class="ehcf__ptitle">' + esc(top.title) + '</div>' +
              '<div class="ehcf__pwhy">' + esc(top.tat) + '.</div>' +
              '<div class="ehcf__chips">' + chipsFor(top) + '</div>' +
              '<div class="ehcf__intens">' + beanRow('Sertlik', top.s) + beanRow('Asidite', top.a) + beanRow('Gövde', top.g) + '</div>' +
              '<div class="ehcf__brew">' + ICON.cup + '<span><b>Nasıl hazırlanır:</b> ' + esc(top.brew) + '</span></div>' +
              (eq ? '<div class="ehcf__equip">' + ICON[eq.ic] + '<span>' + eq.txt + '</span></div>' : '') +
              '<div class="ehcf__pfoot"><span class="ehcf__price">' + esc(top.price) + '</span>' + addBtn +
                '<a class="ehcf__golink" href="' + esc(refUrl(top.url)) + '">Ürüne git →</a></div>' +
            '</div>' +
          '</div>' +
          (alts.length ? '<div class="ehcf__altwrap"><h3>Şunlar da ilginizi çekebilir</h3><div class="ehcf__alts">' + alts.map(altCard).join('') + '</div></div>' : '') +
          '<div class="ehcf__restart"><button class="ehcf__btn ehcf__btn--ghost" type="button" data-act="reset">↺ Yeniden başla</button></div>' +
          '<div class="ehcf__mcta">' +
            '<button class="ehcf__mcta-restart" type="button" data-act="reset" aria-label="Yeniden başla" title="Yeniden başla">' + ICON.restart + '</button>' +
            '<span class="ehcf__mcta-price"><span class="ehcf__price">' + esc(top.price) + '</span>' +
              '<a class="ehcf__golink" href="' + esc(refUrl(top.url)) + '">Ürüne git →</a></span>' +
            '<button class="ehcf__btn ehcf__btn--add" type="button" data-act="add" data-id="' + top.id + '" data-url="' + esc(refUrl(top.url)) + '"><span class="ehcf__btn-ico">' + ICON.cart + '</span><span>Sepete ekle</span></button>' +
          '</div>' +
        '</div>';
      // Sabit CTA barını animasyonlu/transformlu ekranın DIŞINA (root'a) taşı → gerçek viewport pinlemesi
      var _m = stage.querySelector('.ehcf__mcta');
      if (_m) root.appendChild(_m);
      try { window.scrollTo({ top: root.offsetTop - 20, behavior: 'smooth' }); } catch (e) {}
    }

    function updateBubble(html) {
      if (!html) return;
      try {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var fresh = doc.getElementById('cart-icon-bubble');
        var cur = document.getElementById('cart-icon-bubble');
        if (fresh && cur) cur.innerHTML = fresh.innerHTML;
      } catch (e) {}
    }
    function markAdded() {
      root.querySelectorAll('[data-act="add"]').forEach(function (b) {
        b.classList.add('is-ok');
        b.innerHTML = '✓ Sepete eklendi';
        b.setAttribute('data-act', 'go-cart');
      });
      root.querySelectorAll('.ehcf__golink').forEach(function (a) {
        a.textContent = 'Sepete git →';
        a.setAttribute('href', (window.routes && window.routes.cart_url) || '/cart');
      });
    }
    function markError() {
      root.querySelectorAll('[data-act="add"]').forEach(function (b) {
        b.disabled = true;
        b.style.opacity = '.6';
        b.innerHTML = '⚠ Şu an eklenemedi';
      });
    }
    function addToCart(id, fallbackUrl) {
      var url = (window.routes && window.routes.cart_add_url) || '/cart/add';
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/javascript' },
        body: JSON.stringify({ items: [{ id: Number(id), quantity: 1 }], sections: ['cart-icon-bubble'] })
      }).then(function (r) { return r.json(); }).then(function (d) {
        if (d && d.status && d.status >= 400) { markError(); return; }
        if (d && d.sections) updateBubble(d.sections['cart-icon-bubble']);
        markAdded();
      }).catch(function () { markError(); });
    }

    function go(where) {
      if (where === 'intro') renderIntro();
      else if (where === 'q1') renderQ1();
      else if (where === 'q2') renderQ2();
      else if (where === 'results') renderResults();
      if (where !== 'results') { try { window.scrollTo({ top: root.offsetTop - 20, behavior: 'smooth' }); } catch (e) {} }
    }

    // Dinleyici root'ta: mcta sonuç ekranında root'a taşındığı için stage'de değil root'ta olmalı
    root.addEventListener('click', function (e) {
      var el = e.target.closest('[data-act]');
      if (!el) return;
      var act = el.getAttribute('data-act');
      var val = el.getAttribute('data-val');
      if (act === 'start') renderQ1();
      else if (act === 'q1') { st.q1 = val; renderQ2(); }
      else if (act === 'q2') { st.q2 = val; renderQ3(); }
      else if (act === 'q3') { st.q3 = val; renderResults(); }
      else if (act === 'back') go(val);
      else if (act === 'reset') { st.q1 = st.q2 = st.q3 = null; renderIntro(); }
      else if (act === 'add') { e.preventDefault(); addToCart(el.getAttribute('data-id'), el.getAttribute('data-url')); }
      else if (act === 'go-cart') { window.location.href = (window.routes && window.routes.cart_url) || '/cart'; }
    });

    renderIntro();
  }

  function boot() { document.querySelectorAll('[data-ehcf]').forEach(initRoot); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  // Tema editöründe section yeniden yüklenince
  document.addEventListener('shopify:section:load', function (e) {
    var r = e.target.querySelector('[data-ehcf]');
    if (r) initRoot(r);
  });
})();
