/* Formulaire de prise de contact Relentless — partagé par /contact/ et /rejoindre/.
   Les réponses sont envoyées au Google Form « Prise de Contact Coaching Relentless ».
   Si une question est ajoutée ou modifiée dans Google Forms, mettre à jour les
   identifiants entry.XXXX ci-dessous (une seule fois, ici). */
(function () {
  var FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSfe8ihrf56hAc4KGSXbfT6OlhRLCJeBnD7Zys1GTE1ZpxFj7w';
  var DATE_ENTRY = 'entry.97006698';

  var root = document.getElementById('contact-form');
  if (!root) return;

  root.innerHTML =
    '<div class="form-card" id="formCard">' +
    '<form id="contactForm" novalidate>' +
    '<div class="form-grid">' +
      '<div class="field"><label for="f-prenom">Prénom <span class="req">*</span></label>' +
      '<input type="text" id="f-prenom" name="entry.1753035351" autocomplete="given-name" required></div>' +

      '<div class="field"><label for="f-nom">Nom <span class="req">*</span></label>' +
      '<input type="text" id="f-nom" name="entry.1662093808" autocomplete="family-name" required></div>' +

      '<div class="field"><label for="f-naissance">Date de naissance <span class="req">*</span></label>' +
      '<input type="date" id="f-naissance" autocomplete="bday" required></div>' +

      '<div class="field"><label for="f-insta">Compte Insta / WhatsApp <span class="req">*</span></label>' +
      '<input type="text" id="f-insta" name="entry.1438241806" placeholder="@toncompte ou 06…" required></div>' +

      '<div class="field full"><label for="f-background">Quel est ton background sportif ? <span class="req">*</span></label>' +
      '<textarea id="f-background" name="entry.687149264" required></textarea></div>' +

      '<fieldset class="full"><legend>Quel est ton niveau actuel ? <span class="req">*</span></legend><div class="choices">' +
        '<label class="choice"><input type="radio" name="entry.1978210093" value="Débutant  (Moins d\'un an de pratique)" required><span>Débutant<small>Moins d\'un an de pratique</small></span></label>' +
        '<label class="choice"><input type="radio" name="entry.1978210093" value="Intermédiaire (Entre 1 et 5 ans d\'entrainement en force)"><span>Intermédiaire<small>Entre 1 et 5 ans d\'entraînement en force</small></span></label>' +
        '<label class="choice"><input type="radio" name="entry.1978210093" value="Avancé (Plus de 5 ans d\'entrainement en force)"><span>Avancé<small>Plus de 5 ans d\'entraînement en force</small></span></label>' +
      '</div></fieldset>' +

      '<div class="field full"><label for="f-perfs">Performances <span class="req">*</span></label>' +
      '<input type="text" id="f-perfs" name="entry.900578603" placeholder="Ex : SQUAT 200 / BENCH 130 / DEADLIFT 220" required></div>' +

      '<div class="field full"><label for="f-objectifs">Quelles sont tes motivations et tes objectifs ? <span class="req">*</span></label>' +
      '<textarea id="f-objectifs" name="entry.1334713382" required></textarea></div>' +

      '<div class="field full"><label for="f-pourquoi">Pourquoi nous contacter nous spécifiquement / Comment nous as-tu connus ? <span class="req">*</span></label>' +
      '<textarea id="f-pourquoi" name="entry.987808445" required></textarea></div>' +

      '<fieldset class="full"><legend>Par qui préfères-tu être suivi ? <span class="req">*</span></legend><div class="choices">' +
        '<label class="choice"><input type="radio" name="entry.859982271" value="Florent" required><span>Florent</span></label>' +
        '<label class="choice"><input type="radio" name="entry.859982271" value="Théo"><span>Théo</span></label>' +
        '<label class="choice"><input type="radio" name="entry.859982271" value="Adrien"><span>Adrien</span></label>' +
        '<label class="choice"><input type="radio" name="entry.859982271" value="Pas de préférence"><span>Pas de préférence</span></label>' +
      '</div></fieldset>' +
    '</div>' +
    '<button type="submit" class="btn-primary" id="submitBtn">Envoyer ma demande</button>' +
    '<p class="form-msg" id="formMsg" role="status" aria-live="polite"></p>' +
    '</form>' +
    '<div class="success" id="success" tabindex="-1">' +
      '<h2>MERCI, C\'EST BIEN REÇU !</h2>' +
      '<p>Ta demande a été transmise aux coachs. Nous revenons vers toi très vite sur Instagram ou WhatsApp.</p>' +
    '</div>' +
    '</div>';

  var form = document.getElementById('contactForm');
  var msg = document.getElementById('formMsg');
  var btn = document.getElementById('submitBtn');
  var card = document.getElementById('formCard');

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.className = 'form-msg';
    msg.textContent = '';

    if (!form.checkValidity()) {
      var first = form.querySelector(':invalid');
      msg.className = 'form-msg error';
      msg.textContent = 'Merci de remplir tous les champs obligatoires.';
      if (first) first.focus();
      return;
    }

    var data = new URLSearchParams(new FormData(form));
    var d = document.getElementById('f-naissance').value.split('-'); // AAAA-MM-JJ
    data.append(DATE_ENTRY + '_year', d[0]);
    data.append(DATE_ENTRY + '_month', String(parseInt(d[1], 10)));
    data.append(DATE_ENTRY + '_day', String(parseInt(d[2], 10)));

    btn.disabled = true;
    btn.textContent = 'Envoi en cours…';

    fetch(FORM_URL + '/formResponse', { method: 'POST', mode: 'no-cors', body: data })
      .then(function () {
        card.classList.add('sent');
        document.getElementById('success').focus();
      })
      .catch(function () {
        btn.disabled = false;
        btn.textContent = 'Envoyer ma demande';
        msg.className = 'form-msg error';
        msg.innerHTML = 'L\'envoi a échoué. Réessaie, ou <a href="' + FORM_URL + '/viewform" target="_blank" rel="noopener">remplis le formulaire directement sur Google Forms</a>.';
      });
  });
})();
