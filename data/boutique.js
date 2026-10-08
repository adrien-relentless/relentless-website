/* Boutique Relentless — produits lus dans /data/boutique.csv (utilisé par /boutique/) */
(function () {
  /* ── Minimal CSV parser (handles quoted fields) ────────── */
  function parseCSV(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i++; }
          else { inQuotes = false; }
        } else {
          field += c;
        }
      } else {
        if (c === '"') { inQuotes = true; }
        else if (c === ',') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
        else if (c === '\r') { /* skip */ }
        else { field += c; }
      }
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    if (!rows.length) return [];
    var header = rows.shift();
    return rows.filter(function(r){ return r.length && r.some(function(v){return v && v.length;}); })
               .map(function(r){
                 var o = {};
                 header.forEach(function(h, idx){ o[h.trim()] = (r[idx] || '').trim(); });
                 return o;
               });
  }

  function escHTML(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function loadCSV(url, onData, onError) {
    if (typeof fetch === 'function') {
      fetch(url, { cache: 'no-cache' })
        .then(function(r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
        .then(function(t) { onData(parseCSV(t)); })
        .catch(function(err) { if (onError) onError(err); });
    } else if (typeof XMLHttpRequest !== 'undefined') {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
          if (xhr.status >= 200 && xhr.status < 300) onData(parseCSV(xhr.responseText));
          else if (onError) onError(new Error('HTTP ' + xhr.status));
        }
      };
      xhr.send();
    } else if (onError) {
      onError(new Error('No fetch or XHR available'));
    }
  }

  /* ── Boutique (data/boutique.csv) ──────────────────────────
     Ebooks   : lien Payhip (colonne "payhip", ex. https://payhip.com/b/AbC12) transformé en lien
                de paiement direct (payhip.com/buy?link=AbC12), ouvert dans une fenêtre séparée.
                Après l'achat, Payhip redirige vers /merci-ebook/ qui referme cette fenêtre
                (réglage Payhip : Account > Settings > Advanced Settings > Checkout Settings).
     Vêtements: paiement PayPal versé directement à l'adresse de la colonne "paypal"
                (taille + coupe transmises, adresse de livraison demandée par PayPal). */
  function formatPrice(p) {
    var n = parseFloat(String(p).replace(',', '.'));
    return isNaN(n) ? '' : n.toFixed(2).replace('.', ',') + ' €';
  }

  function renderShop(rows) {
    var root = document.getElementById('shop');
    if (!root) return;
    var groups = [
      { key: 'ebook', title: 'Ebooks', label: 'EBOOK' },
      { key: 'vetement', title: 'Vêtements', label: 'RELENTLESS' }
    ];
    root.innerHTML = groups.map(function(g) {
      // statut "masque" : le produit reste dans le fichier mais n'apparaît pas sur le site
      var items = rows.filter(function(r) { return (r.categorie || '').toLowerCase() === g.key && (r.statut || '').toLowerCase() !== 'masque'; });
      // colonne "mise_en_avant" remplie : produit placé en premier, liseré rouge, texte affiché en badge
      items = items.filter(isFeatured).concat(items.filter(function(r) { return !isFeatured(r); }));
      if (!items.length) return '';
      return '<div class="shop-group"><h3 class="shop-group-title">' + g.title + '</h3>' +
        '<div class="shop-grid">' + items.map(function(r) { return productCard(r, g); }).join('') + '</div></div>';
    }).join('') +
    '<p class="shop-note">Paiement via PayPal. Les ebooks sont envoyés automatiquement par email après l\'achat.</p>';
  }

  function productCard(r, g) {
    var soldOut = (r.statut || '').toLowerCase() === 'rupture';
    var placeholder = '<div class="product-placeholder"><b>' + escHTML(g.label) + '</b><span>' + escHTML(plainName(r.nom)) + '</span></div>';
    var img = r.image
      ? '<img src="/data/pics/boutique/' + escHTML(r.image) + '" alt="' + escHTML(plainName(r.nom)) + '" loading="lazy" ' +
        'onerror="this.outerHTML=this.parentNode.getAttribute(\'data-ph\')">'
      : placeholder;
    var featured = isFeatured(r);
    var featText = (r.mise_en_avant || '').trim();
    var badge = soldOut ? '<span class="product-badge sold-out">Rupture de stock</span>'
      : (featured && featText.toLowerCase() !== 'oui' ? '<span class="product-badge">' + escHTML(featText) + '</span>' : '');

    var buy;
    if (soldOut) {
      buy = '<button class="btn-primary product-btn" disabled>Indisponible</button>';
    } else if (g.key === 'ebook') {
      buy = r.payhip
        ? '<a class="btn-primary product-btn js-payhip" href="' + escHTML(payhipCheckoutUrl(r.payhip)) + '" target="_blank">Acheter</a>'
        : '<button class="btn-primary product-btn" disabled>Bientôt disponible</button>';
    } else {
      buy = paypalForm(r);
    }

    return '<div class="product-card' + (featured ? ' is-featured' : '') + '">' +
      '<div class="product-img" data-ph="' + escHTML(placeholder) + '">' + img + badge + '</div>' +
      '<div class="product-info">' +
        '<div class="product-name">' + htmlName(r.nom) + '</div>' +
        (r.description ? '<p class="product-desc">' + escHTML(r.description) + '</p>' : '') +
        '<div class="product-price">' + formatPrice(r.prix) + '</div>' +
        '<div class="product-buy">' + buy + '</div>' +
      '</div></div>';
  }

  /* Saut de ligne forcé dans un titre : écrire | dans la colonne "nom" du CSV.
     Sur le site le | devient un retour à la ligne ; pour PayPal et le texte alternatif il devient un espace. */
  function plainName(n) { return String(n || '').replace(/\s*\|\s*/g, ' ').trim(); }
  function htmlName(n) { return String(n || '').split('|').map(function(p) { return escHTML(p.trim()); }).join('<br>'); }

  function isFeatured(r) { return !!(r.mise_en_avant || '').trim(); }

  function optionSelect(id, label, list) {
    return '<select id="' + id + '" required>' +
      '<option value="">' + label + '</option>' +
      list.map(function(v) { return '<option value="' + escHTML(v) + '">' + escHTML(v) + '</option>'; }).join('') +
      '</select>';
  }

  /* Vêtements : formulaire PayPal (champs cachés) + bouton qui ouvre la fenêtre de commande.
     Taille, coupe, coordonnées et adresse sont saisies dans la fenêtre puis ajoutées au formulaire. */
  function paypalForm(r) {
    if (!r.paypal) return '<button class="btn-primary product-btn" disabled>Bientôt disponible</button>';
    var hidden = function(n, v) { return '<input type="hidden" name="' + n + '" value="' + escHTML(v) + '">'; };
    var html = '<form class="js-paypal" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"' +
      ' data-name="' + escHTML(plainName(r.nom)) + '" data-price="' + escHTML(formatPrice(r.prix)) + '"' +
      ' data-sizes="' + escHTML(r.tailles || '') + '" data-cuts="' + escHTML(r.coupes || '') + '"' +
      ' data-img="' + escHTML(r.image ? '/data/pics/boutique/' + r.image : '') + '">' +
      hidden('cmd', '_xclick') + hidden('business', r.paypal) + hidden('item_name', plainName(r.nom)) +
      hidden('amount', String(r.prix).replace(',', '.')) + hidden('currency_code', 'EUR') +
      hidden('no_shipping', '2') + hidden('charset', 'utf-8') + hidden('lc', 'FR');
    if (r.frais_port) html += hidden('shipping', String(r.frais_port).replace(',', '.'));
    html += '<button type="submit" class="btn-primary product-btn">Commander</button></form>';
    return html;
  }

  /* ── Fenêtre de commande (vêtements) ──────────────────────────────
     Recueille taille/coupe + coordonnées + adresse de livraison, puis ouvre PayPal.
     Tout est transmis au fournisseur comme options de la commande PayPal (visibles dans
     le détail de la transaction), en plus de l'adresse que PayPal demande lui-même.
     PayPal limite à 7 options de 200 caractères : Taille, Coupe, Client, Adresse, Message. */
  var COUNTRIES = [['FR','France'],['BE','Belgique'],['CH','Suisse'],['LU','Luxembourg'],['MC','Monaco'],['CA','Canada'],['DE','Allemagne'],['ES','Espagne'],['IT','Italie'],['GB','Royaume-Uni'],['NL','Pays-Bas'],['PT','Portugal']];
  var pendingForm = null;

  function field(id, label, input, cls) {
    return '<div class="om-field' + (cls ? ' ' + cls : '') + '"><label for="' + id + '">' + label + '</label>' + input + '</div>';
  }

  function buildModal() {
    var m = document.createElement('div');
    m.id = 'order-modal';
    m.className = 'order-modal';
    m.setAttribute('hidden', '');
    var req = ' <span class="req">*</span>';
    m.innerHTML =
      '<div class="order-modal-backdrop" data-close></div>' +
      '<div class="order-modal-box" role="dialog" aria-modal="true" aria-labelledby="om-title">' +
        '<button type="button" class="order-modal-close" data-close aria-label="Fermer">×</button>' +
        '<h3 id="om-title">FINALISER MA COMMANDE</h3>' +
        '<div class="om-recap"><img alt="" id="om-img"><div><div class="om-name" id="om-name"></div>' +
          '<div class="om-price" id="om-price"></div></div></div>' +
        '<form id="om-form" novalidate>' +
          '<p class="om-section">Article</p>' +
          '<div class="om-grid" id="om-options"></div>' +
          '<p class="om-section">Coordonnées</p>' +
          '<div class="om-grid">' +
            field('om-prenom', 'Prénom' + req, '<input type="text" id="om-prenom" autocomplete="given-name" required>') +
            field('om-nom', 'Nom' + req, '<input type="text" id="om-nom" autocomplete="family-name" required>') +
            field('om-email', 'Email' + req, '<input type="email" id="om-email" autocomplete="email" required>', 'full') +
            field('om-tel', 'Téléphone' + req, '<input type="tel" id="om-tel" autocomplete="tel" placeholder="06 12 34 56 78" required>', 'full') +
          '</div>' +
          '<p class="om-section">Adresse de livraison</p>' +
          '<div class="om-grid">' +
            field('om-adresse', 'Adresse' + req, '<input type="text" id="om-adresse" autocomplete="address-line1" required>', 'full') +
            field('om-complement', 'Complément <span class="om-optional">(facultatif)</span>', '<input type="text" id="om-complement" autocomplete="address-line2" placeholder="Bâtiment, étage…">', 'full') +
            field('om-cp', 'Code postal' + req, '<input type="text" id="om-cp" autocomplete="postal-code" inputmode="numeric" required>') +
            field('om-ville', 'Ville' + req, '<input type="text" id="om-ville" autocomplete="address-level2" required>') +
            field('om-pays', 'Pays' + req, '<select id="om-pays" autocomplete="country" required>' +
              COUNTRIES.map(function(c) { return '<option value="' + c[0] + '">' + c[1] + '</option>'; }).join('') + '</select>', 'full') +
          '</div>' +
          field('om-msg', 'Message <span class="om-optional">(facultatif)</span>', '<textarea id="om-msg" maxlength="150" rows="2" placeholder="Une précision pour la commande ?"></textarea>', 'full') +
          '<p class="om-error" id="om-error" role="alert"></p>' +
          '<button type="submit" class="btn-primary product-btn">Continuer vers le paiement PayPal</button>' +
          '<p class="om-help">Vos informations sont transmises uniquement au fournisseur pour la livraison.</p>' +
        '</form>' +
      '</div>';
    document.body.appendChild(m);
    m.addEventListener('click', function(e) { if (e.target.hasAttribute('data-close')) closeModal(); });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && !m.hasAttribute('hidden')) closeModal(); });
    document.getElementById('om-form').addEventListener('submit', confirmOrder);
    return m;
  }

  function openModal(form) {
    var m = document.getElementById('order-modal') || buildModal();
    pendingForm = form;
    var img = document.getElementById('om-img');
    if (form.dataset.img) { img.src = form.dataset.img; img.style.display = ''; } else { img.style.display = 'none'; }
    document.getElementById('om-name').textContent = form.dataset.name;
    document.getElementById('om-price').textContent = form.dataset.price;
    var sizes = (form.dataset.sizes || '').split('|').filter(Boolean);
    var cuts = (form.dataset.cuts || '').split('|').filter(Boolean);
    var opts = '';
    if (sizes.length) opts += field('om-taille', 'Taille <span class="req">*</span>', optionSelect('om-taille', 'Choisir', sizes));
    if (cuts.length)  opts += field('om-coupe', 'Coupe <span class="req">*</span>', optionSelect('om-coupe', 'Choisir', cuts));
    var box = document.getElementById('om-options');
    box.innerHTML = opts;
    box.previousElementSibling.style.display = opts ? '' : 'none';
    document.getElementById('om-error').textContent = '';
    m.querySelectorAll('.is-invalid').forEach(function(el) { el.classList.remove('is-invalid'); });
    m.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';
    m.querySelector('.order-modal-box').scrollTop = 0;
    setTimeout(function() { var f = m.querySelector('#om-options select, #om-prenom'); if (f) f.focus(); }, 50);
  }

  function closeModal() {
    var m = document.getElementById('order-modal');
    if (m) m.setAttribute('hidden', '');
    document.body.style.overflow = '';
    pendingForm = null;
  }

  function val(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  function confirmOrder(e) {
    e.preventDefault();
    var f = document.getElementById('om-form');
    var err = document.getElementById('om-error');
    f.querySelectorAll('.is-invalid').forEach(function(el) { el.classList.remove('is-invalid'); });
    var bad = Array.prototype.filter.call(f.querySelectorAll('[required]'), function(el) { return !el.checkValidity() || !el.value.trim(); });
    var tel = val('om-tel');
    var telEl = document.getElementById('om-tel');
    if (tel && ((tel.match(/\d/g) || []).length < 9 || /[^\d\s+().\-]/.test(tel)) && bad.indexOf(telEl) < 0) bad.push(telEl);
    if (bad.length) {
      bad.forEach(function(el) { el.classList.add('is-invalid'); });
      err.textContent = bad.indexOf(telEl) >= 0 && tel ? 'Merci d\'indiquer un numéro de téléphone valide.'
        : (bad.indexOf(document.getElementById('om-email')) >= 0 && val('om-email') ? 'Merci d\'indiquer une adresse email valide.'
        : 'Merci de remplir les champs obligatoires.');
      bad[0].focus();
      return;
    }
    var form = pendingForm;
    if (!form) return closeModal();
    form.querySelectorAll('.js-extra').forEach(function(el) { el.remove(); });
    var put = function(name, value) {
      var i = document.createElement('input');
      i.type = 'hidden'; i.name = name; i.value = value; i.className = 'js-extra';
      form.appendChild(i);
    };
    var n = 0;
    var opt = function(label, value) { if (!value) return; put('on' + n, label); put('os' + n, value.slice(0, 200)); n++; };
    var pays = document.getElementById('om-pays');
    var paysLabel = pays.options[pays.selectedIndex].text;
    opt('Taille', val('om-taille'));
    opt('Coupe', val('om-coupe'));
    opt('Client', val('om-prenom') + ' ' + val('om-nom') + ' · ' + val('om-email') + ' · ' + tel);
    opt('Adresse', val('om-adresse') + (val('om-complement') ? ', ' + val('om-complement') : '') + ', ' + val('om-cp') + ' ' + val('om-ville') + ', ' + paysLabel);
    opt('Message', val('om-msg'));
    // Pré-remplissage côté PayPal (utilisé si l'acheteur paie sans compte ou en crée un)
    put('first_name', val('om-prenom')); put('last_name', val('om-nom')); put('email', val('om-email'));
    put('address1', val('om-adresse')); put('address2', val('om-complement')); put('zip', val('om-cp'));
    put('city', val('om-ville')); put('country', pays.value); put('night_phone_b', tel.replace(/[^\d+]/g, ''));
    closeModal();
    form.submit();
  }

  document.addEventListener('submit', function(e) {
    var form = e.target;
    if (!form.classList || !form.classList.contains('js-paypal')) return;
    e.preventDefault();
    openModal(form);
  });

  /* Lien Payhip -> lien de paiement direct */
  function payhipCheckoutUrl(url) {
    var m = String(url).match(/payhip\.com\/b\/([A-Za-z0-9]+)/);
    return m ? 'https://payhip.com/buy?link=' + m[1] : url;
  }

  /* Ouvre le paiement Payhip dans une fenêtre séparée (onglet si le navigateur bloque la fenêtre) */
  document.addEventListener('click', function(e) {
    var a = e.target.closest && e.target.closest('a.js-payhip');
    if (!a) return;
    var w = Math.min(560, screen.availWidth), h = Math.min(820, screen.availHeight);
    var left = Math.max(0, (screen.availWidth - w) / 2), top = Math.max(0, (screen.availHeight - h) / 2);
    var win = window.open(a.href, 'payhip-paiement', 'width=' + w + ',height=' + h + ',left=' + left + ',top=' + top);
    if (win) { e.preventDefault(); win.focus(); }
  });

  /* Message envoyé par /merci-ebook/ une fois l'achat terminé */
  window.addEventListener('message', function(e) {
    if (e.origin !== window.location.origin || !e.data || e.data.type !== 'relentless-achat-ebook') return;
    var root = document.getElementById('shop');
    if (!root || document.getElementById('shop-thanks')) return;
    var box = document.createElement('div');
    box.id = 'shop-thanks';
    box.className = 'shop-thanks';
    box.setAttribute('role', 'status');
    box.innerHTML = '<strong>Merci pour ton achat !</strong> Ton ebook t\'a été envoyé par email. Pense à vérifier tes spams.';
    root.parentNode.insertBefore(box, root);
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  loadCSV('/data/boutique.csv', renderShop, function(err) {
    var root = document.getElementById('shop');
    if (root) root.innerHTML = '<p style="color:var(--muted);font-size:0.9rem;">Impossible de charger la boutique (' + escHTML(err.message) + ').</p>';
  });

})();
