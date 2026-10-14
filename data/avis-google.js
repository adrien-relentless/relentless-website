/* Avis Google — bandeau défilant horizontal.
   Données : data/avis-google.csv (colonnes prenom, note, date, texte, afficher, fictif).
   - afficher = "oui" → avis montré (seuls les avis 5 étoiles avec texte sont affichés)
   - afficher = "non" → avis non montré mais compté dans la note et le nombre d'avis (ex. avis sans texte)
   - fictif = "oui" → avis de démonstration : un badge « Aperçu · avis fictifs » s'affiche.
     Remplacer par les vrais avis (et vider la colonne fictif) avant la mise en ligne.
   Lien « Voir tous les avis » : attribut data-google-url sur le bloc .reviews (vide → bouton masqué). */
(function () {
  function parseCSV(text) {
    var rows = [], row = [], f = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
      else if (c === '"') q = true;
      else if (c === ',') { row.push(f); f = ''; }
      else if (c === '\n') { row.push(f); rows.push(row); row = []; f = ''; }
      else if (c !== '\r') f += c;
    }
    if (f.length || row.length) { row.push(f); rows.push(row); }
    var h = (rows.shift() || []).map(function (s) { return s.trim(); });
    return rows.filter(function (r) { return r.some(function (v) { return v && v.trim(); }); })
      .map(function (r) { var o = {}; h.forEach(function (k, i) { o[k] = (r[i] || '').trim(); }); return o; });
  }
  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var STAR = '<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z"/></svg>';
  function stars(n) {
    var s = '';
    for (var i = 1; i <= 5; i++) s += i <= n ? STAR : STAR.replace('<svg', '<svg class="off"');
    return '<span class="rv-stars" aria-label="' + n + ' étoiles sur 5">' + s + '</span>';
  }
  function card(r) {
    return '<article class="rv-card">' +
      '<div class="rv-head"><span class="rv-avatar" aria-hidden="true">' + esc(r.prenom.charAt(0).toUpperCase()) + '</span>' +
      '<div class="rv-who"><span class="rv-name">' + esc(r.prenom) + '</span><span class="rv-date">' + esc(r.date) + '</span></div></div>' +
      stars(5) +
      '<p class="rv-text">' + esc(r.texte) + '</p>' +
      '<span class="rv-src">Avis Google</span>' +
      '</article>';
  }

  function render(root, rows) {
    var list = rows.filter(function (r) {
      return (r.afficher || '').toLowerCase() === 'oui' && parseInt(r.note, 10) === 5 && r.texte;
    });
    if (!list.length) { root.hidden = true; return; }
    var preview = list.some(function (r) { return (r.fictif || '').toLowerCase() === 'oui'; });
    /* Note et nombre d'avis : calculés sur TOUTES les lignes notées du CSV (y compris les avis sans texte, afficher = non). */
    var rated = rows.filter(function (r) { return parseInt(r.note, 10) >= 1; });
    var total = rated.length || list.length;
    var avg = rated.length ? rated.reduce(function (a, r) { return a + parseInt(r.note, 10); }, 0) / rated.length : 5;
    var avgTxt = avg.toFixed(1).replace('.', ',');
    var url = root.getAttribute('data-google-url');

    root.innerHTML =
      '<div class="rv-summary">' +
        '<div class="rv-score"><span class="rv-score-num">' + avgTxt + '</span>' +
          '<span class="rv-score-meta">' + stars(5) + '<small>' + total + ' avis Google</small></span></div>' +
        (preview ? '<span class="rv-preview">Aperçu · avis fictifs</span>' : '') +
        (url ? '<a class="btn-secondary rv-google-link" href="' + esc(url) + '" target="_blank" rel="noopener">Voir tous les avis</a>' : '') +
        '<div class="rv-arrows"><button type="button" class="rv-arrow" data-dir="-1" aria-label="Avis précédent">←</button>' +
          '<button type="button" class="rv-arrow" data-dir="1" aria-label="Avis suivant">→</button></div>' +
      '</div>' +
      '<div class="rv-viewport"><div class="rv-track" tabindex="0" aria-label="Avis de nos athlètes">' +
        list.map(card).join('') +
        list.map(card).join('').replace(/<article class="rv-card">/g, '<article class="rv-card" aria-hidden="true">') +
      '</div></div>';
    if (!url) { var a = root.querySelector('.rv-arrows'); if (a) a.style.marginLeft = 'auto'; }

    animate(root);
    addMore(root);
  }

  /* Défilement automatique continu, en boucle ; pause au survol, au toucher et au clavier. */
  function animate(root) {
    var track = root.querySelector('.rv-track');
    var SPEED = 32;                          // pixels par seconde
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var pos = 0, last = 0, paused = false, visible = true, resumeTimer = null;

    function half() { return track.scrollWidth / 2; }
    function pause() { paused = true; clearTimeout(resumeTimer); }
    function resumeSoon(ms) { clearTimeout(resumeTimer); resumeTimer = setTimeout(function () { pos = track.scrollLeft; paused = false; }, ms); }

    track.addEventListener('scroll', function () {
      var h = half();
      if (track.scrollLeft >= h) track.scrollLeft -= h;           // boucle sans fin
      if (Math.abs(track.scrollLeft - pos) > 2) pos = track.scrollLeft; // l'utilisateur a fait défiler
    }, { passive: true });
    track.addEventListener('mouseenter', pause);
    track.addEventListener('mouseleave', function () { resumeSoon(400); });
    track.addEventListener('touchstart', pause, { passive: true });
    track.addEventListener('touchend', function () { resumeSoon(3000); }, { passive: true });
    track.addEventListener('focusin', pause);
    track.addEventListener('focusout', function () { resumeSoon(1000); });

    root.querySelectorAll('.rv-arrow').forEach(function (b) {
      b.addEventListener('click', function () {
        pause();
        var c = track.querySelector('.rv-card');
        var step = c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(track).columnGap || 16) : 300;
        if (b.getAttribute('data-dir') === '-1' && track.scrollLeft < step) track.scrollLeft += half();
        track.scrollBy({ left: step * parseInt(b.getAttribute('data-dir'), 10), behavior: 'smooth' });
        resumeSoon(4000);
      });
    });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe(track);
    }
    if (reduce) return;

    function tick(t) {
      var dt = last ? Math.min((t - last) / 1000, 0.1) : 0;
      last = t;
      if (!paused && visible && !document.hidden && !root.classList.contains('rv-hold')) {
        pos += SPEED * dt;
        if (pos >= half()) pos -= half();
        track.scrollLeft = pos;
      }
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* « Lire la suite » : affiché seulement sur les avis coupés → ouvre une fenêtre avec l'avis complet. */
  function addMore(root) {
    var track = root.querySelector('.rv-track');
    function check() {
      root.querySelectorAll('.rv-card').forEach(function (c) {
        var t = c.querySelector('.rv-text'), b = c.querySelector('.rv-more');
        var cut = t.scrollHeight > t.clientHeight + 2;
        if (cut && !b) {
          b = document.createElement('button'); b.type = 'button'; b.className = 'rv-more'; b.textContent = 'Lire la suite';
          if (c.getAttribute('aria-hidden')) b.tabIndex = -1;
          t.insertAdjacentElement('afterend', b);
        } else if (!cut && b) b.remove();
      });
    }
    check();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(check);
    window.addEventListener('resize', check);
    track.addEventListener('click', function (e) {
      var b = e.target.closest('.rv-more');
      if (b) openModal(root, b.closest('.rv-card'));
    });
  }

  function openModal(root, c) {
    var m = document.createElement('div');
    m.className = 'rv-modal';
    m.innerHTML = '<div class="rv-modal-box" role="dialog" aria-modal="true" aria-label="Avis complet">' +
      '<button type="button" class="rv-modal-close" aria-label="Fermer">×</button>' +
      c.querySelector('.rv-head').outerHTML + c.querySelector('.rv-stars').outerHTML +
      '<p class="rv-modal-text">' + c.querySelector('.rv-text').innerHTML + '</p>' +
      '<span class="rv-src">Avis Google</span></div>';
    var prev = document.activeElement;
    root.classList.add('rv-hold');
    document.body.appendChild(m);
    document.documentElement.style.overflow = 'hidden';
    function close() {
      m.remove(); root.classList.remove('rv-hold'); document.documentElement.style.overflow = '';
      document.removeEventListener('keydown', key); if (prev) prev.focus();
    }
    function key(e) { if (e.key === 'Escape') close(); }
    m.addEventListener('click', function (e) { if (e.target === m || e.target.closest('.rv-modal-close')) close(); });
    document.addEventListener('keydown', key);
    m.querySelector('.rv-modal-close').focus();
  }

  function init() {
    document.querySelectorAll('.reviews[data-csv]').forEach(function (root) {
      fetch(root.getAttribute('data-csv'), { cache: 'no-cache' })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); })
        .then(function (t) { render(root, parseCSV(t)); })
        .catch(function () { root.hidden = true; });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
