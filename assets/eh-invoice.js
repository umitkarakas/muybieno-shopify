/*
 * eh-invoice.js — Sepet sayfası "Fatura Bilgileri" alanları
 * TC Kimlik / Vergi No toplar, cart.attributes olarak canlı kaydeder (Paraşüt uyumlu),
 * Kurumsal fatura seçilince zorunlu alanları doğrulayıp checkout'u geçici olarak engeller.
 * Belge: CLAUDE.md → "Checkout fatura alanları".
 *
 * Not: main-cart-footer bölümü sepet güncellemelerinde yeniden render edilir; bu yüzden
 * tüm dinleyiciler document seviyesinde delegasyonla bağlanır (tek sefer init).
 */
(function () {
  if (window.__ehInvoiceInit) return;
  window.__ehInvoiceInit = true;

  var SAVE_DELAY = 450;
  var saveTimer = null;

  function root() {
    return document.querySelector('[data-eh-invoice]');
  }

  function currentTur(box) {
    var r = box && box.querySelector('[data-eh-tur]:checked');
    return r ? r.value : 'Şahıs';
  }

  function isKurumsal(box) {
    return currentTur(box) === 'Kurumsal';
  }

  function val(box, key) {
    var el = box && box.querySelector('[data-eh-val="' + key + '"]');
    return el ? el.value.trim() : '';
  }

  function setErr(box, key, msg) {
    var e = box.querySelector('[data-eh-err="' + key + '"]');
    var f = box.querySelector('[data-eh-val="' + key + '"]');
    if (e) e.textContent = msg || '';
    if (f) f.classList.toggle('is-invalid', !!msg);
  }

  function togglePanels(box) {
    if (!box) return;
    var kurumsal = isKurumsal(box);
    var ps = box.querySelector('[data-eh-panel="sahis"]');
    var pk = box.querySelector('[data-eh-panel="kurumsal"]');
    if (ps) ps.hidden = kurumsal;
    if (pk) pk.hidden = !kurumsal;
    box.querySelectorAll('.eh-invoice__seg-opt').forEach(function (l) {
      var inp = l.querySelector('input');
      l.classList.toggle('is-active', !!(inp && inp.checked));
    });
  }

  // Resmi TC Kimlik No algoritması
  function validTCKN(v) {
    if (!/^[1-9]\d{10}$/.test(v)) return false;
    var d = v.split('').map(Number);
    var odd = d[0] + d[2] + d[4] + d[6] + d[8];
    var even = d[1] + d[3] + d[5] + d[7];
    var d10 = ((odd * 7) - even) % 10;
    if (d10 < 0) d10 += 10;
    if (d10 !== d[9]) return false;
    var sum10 = 0;
    for (var i = 0; i < 10; i++) sum10 += d[i];
    return sum10 % 10 === d[10];
  }

  // showAll=true → boş zorunlu alanlar için de hata göster (checkout denemesi)
  function validate(box, showAll) {
    if (!box) return true;
    ['tckn', 'unvan', 'vno', 'vd'].forEach(function (k) { setErr(box, k, ''); });
    var ok = true;

    if (isKurumsal(box)) {
      if (!val(box, 'unvan')) { if (showAll) setErr(box, 'unvan', 'Firma ünvanı zorunludur.'); ok = false; }
      var vno = val(box, 'vno');
      if (!vno) { if (showAll) setErr(box, 'vno', 'Vergi numarası zorunludur.'); ok = false; }
      else if (!/^\d{10,11}$/.test(vno)) { setErr(box, 'vno', 'Vergi no 10 haneli (şahıs firması için 11 haneli TCKN) olmalı.'); ok = false; }
      if (!val(box, 'vd')) { if (showAll) setErr(box, 'vd', 'Vergi dairesi zorunludur.'); ok = false; }
    } else {
      var tc = val(box, 'tckn');
      if (tc && !validTCKN(tc)) { setErr(box, 'tckn', 'Geçerli bir TC Kimlik No girin.'); ok = false; }
    }
    return ok;
  }

  function buildAttributes(box) {
    var kurumsal = isKurumsal(box);
    return {
      'Fatura Türü': kurumsal ? 'Kurumsal' : 'Şahıs',
      'TC Kimlik No': kurumsal ? '' : val(box, 'tckn'),
      'Firma Ünvanı': kurumsal ? val(box, 'unvan') : '',
      'Vergi Dairesi': kurumsal ? val(box, 'vd') : '',
      'Vergi No': kurumsal ? val(box, 'vno') : ''
    };
  }

  function save(box) {
    if (!box) return;
    fetch('/cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ attributes: buildAttributes(box) })
    }).catch(function () {});
  }

  function scheduleSave(box) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () { save(box); }, SAVE_DELAY);
  }

  function blockCheckout(box) {
    save(box);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    var first = box.querySelector('.is-invalid');
    if (first) { try { first.focus({ preventScroll: true }); } catch (e) { first.focus(); } }
  }

  // Fatura türü değişimi
  document.addEventListener('change', function (e) {
    var tur = e.target.closest && e.target.closest('[data-eh-tur]');
    if (!tur) return;
    var box = tur.closest('[data-eh-invoice]');
    togglePanels(box);
    validate(box, false);
    save(box); // türü değiştirince karşı tarafın alanlarını hemen temizle
  });

  // Alan girişi → doğrula + gecikmeli kaydet
  document.addEventListener('input', function (e) {
    var f = e.target.closest && e.target.closest('[data-eh-val]');
    if (!f) return;
    var box = f.closest('[data-eh-invoice]');
    validate(box, false);
    scheduleSave(box);
  });

  // Alan bırakılınca hemen kaydet
  document.addEventListener('blur', function (e) {
    var f = e.target.closest && e.target.closest('[data-eh-val]');
    if (f) save(f.closest('[data-eh-invoice]'));
  }, true);

  // Alanlarda Enter'a basınca yanlışlıkla checkout'a gitme; kaydet ve dur
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var f = e.target.closest && e.target.closest('[data-eh-invoice] input');
    if (f) { e.preventDefault(); save(f.closest('[data-eh-invoice]')); }
  });

  // Checkout butonuna basınca (capture) doğrula, geçersizse engelle
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('#checkout, [name="checkout"]');
    if (!btn) return;
    var box = root();
    if (!box) return;
    if (!validate(box, true)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      blockCheckout(box);
    }
  }, true);

  // Enter/implicit submit ile sepet formunun checkout'a gitmesini de kapıla
  document.addEventListener('submit', function (e) {
    var form = e.target;
    if (!form || form.id !== 'cart') return;
    var box = root();
    if (box && !validate(box, true)) {
      e.preventDefault();
      e.stopImmediatePropagation();
      blockCheckout(box);
    }
  }, true);

  function init() { togglePanels(root()); }
  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
