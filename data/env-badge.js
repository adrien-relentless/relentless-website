/* Repère visuel de l'environnement de DEV.
   Si le site est ouvert sur la branche dev de Netlify (adresse « dev--… ») ou en local (localhost / 127.0.0.1) :
   - bandeau jaune fixé en haut de la page « ENVIRONNEMENT DEV — ne pas partager » ;
   - « [DEV] » ajouté devant le titre de l'onglet.
   Sur la prod (autre adresse), le script ne fait rien : le même code peut être mergé de dev vers main. */
(function () {
  var h = location.hostname;
  var isDev = h.indexOf('dev--') === 0 || h === 'localhost' || h === '127.0.0.1' || h === '[::1]';
  if (!isDev) return;

  var label = h.indexOf('dev--') === 0 ? 'DEV' : 'LOCAL';
  if (document.title.indexOf('[' + label + ']') !== 0) document.title = '[' + label + '] ' + document.title;
  document.documentElement.classList.add('is-dev');

  var css = document.createElement('style');
  css.textContent =
    '.env-dev-bar{position:fixed;top:0;left:0;right:0;height:26px;z-index:2147483000;display:flex;align-items:center;justify-content:center;gap:.6rem;' +
    'background:#ffd400;color:#111;font:700 11px/1 "JetBrains Mono",ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;' +
    'background-image:repeating-linear-gradient(135deg,rgba(0,0,0,.08) 0 10px,transparent 10px 20px);pointer-events:none}' +
    'html.is-dev body{padding-top:26px}' +
    'html.is-dev nav{top:26px!important}';
  document.head.appendChild(css);

  function bar() {
    if (document.querySelector('.env-dev-bar')) return;
    var b = document.createElement('div');
    b.className = 'env-dev-bar';
    b.setAttribute('aria-hidden', 'true');
    b.textContent = label === 'DEV' ? 'Environnement DEV — ne pas partager' : 'Environnement LOCAL — ne pas partager';
    document.body.appendChild(b);
  }
  if (document.body) bar(); else document.addEventListener('DOMContentLoaded', bar);
})();
