// Contact form handler.

function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.name.value.trim();
  const email = form.email.value.trim();
  const message = form.message.value.trim();
  if (!name || !email || !message) return;

  const subject = encodeURIComponent('Feedback from ' + name);
  const body = encodeURIComponent('From: ' + name + ' (' + email + ')\n\n' + message);
  window.location.href = 'mailto:hello@innerval.app?subject=' + subject + '&body=' + body;
  form.reset();
  document.getElementById('formSuccess').style.display = 'block';
}
