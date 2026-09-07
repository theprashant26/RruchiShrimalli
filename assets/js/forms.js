/*!
 * Rruchi.com lead form handler
 * Posts every form submission to the Google Apps Script web app,
 * which appends a row to the "Rruchi.com Leads" Google Sheet.
 *
 * Each form is identified by a `data-form-source` attribute so you can
 * see in the Sheet which page produced each lead. page_url is also
 * auto-captured.
 */
(function () {
  'use strict';

  var ENDPOINT =
    'https://script.google.com/macros/s/AKfycbyd5jYanganEr_Gr-0PYPeW2wcK3k6-ABAc6wiTYa4GMf9wGiJpNhG-KIyEujTy0CTr/exec';

  function buildSuccess() {
    var box = document.createElement('div');
    box.className = 'lead-form-success';
    box.innerHTML =
      '<i class="icofont-check-circled"></i>' +
      '<div><strong>Thanks!</strong> Your message has been received. ' +
      'I will be in touch within 24 hours.</div>';
    return box;
  }

  function showError(form, msg) {
    var existing = form.querySelector('.lead-form-error');
    if (existing) existing.parentNode.removeChild(existing);
    var box = document.createElement('div');
    box.className = 'lead-form-error';
    box.textContent =
      msg ||
      'Something went wrong. Please try again or email rruchishrimalli@gmail.com directly.';
    form.insertBefore(box, form.firstChild);
  }

  function ensureHidden(form, name, value) {
    if (form.querySelector('input[name="' + name + '"]')) return;
    var inp = document.createElement('input');
    inp.type = 'hidden';
    inp.name = name;
    inp.value = value;
    form.appendChild(inp);
  }

  function attach(form, source) {
    ensureHidden(form, 'form_source', source);
    ensureHidden(form, 'page_url', window.location.href);

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var btn = form.querySelector('button[type="submit"], button:not([type])');
      var originalHtml = btn ? btn.innerHTML : null;
      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '<span>Sending&hellip;</span>';
      }

      fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        body: new FormData(form)
      })
        .then(function () {
          var success = buildSuccess();
          form.parentNode.replaceChild(success, form);
          // Scroll into view so the user sees the confirmation
          success.scrollIntoView({ behavior: 'smooth', block: 'center' });
        })
        .catch(function () {
          if (btn) {
            btn.disabled = false;
            btn.innerHTML = originalHtml;
          }
          showError(form);
        });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form.lead-form').forEach(function (form) {
      var source = form.getAttribute('data-form-source') || 'lead-form';
      attach(form, source);
    });
    document.querySelectorAll('form.contact-form').forEach(function (form) {
      var source = form.getAttribute('data-form-source') || 'contact-application';
      attach(form, source);
    });
  });
})();
