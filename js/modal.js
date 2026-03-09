// Custom modal dialog system.

function showModal({ icon, title, message, buttons }) {
  document.getElementById('modalIcon').textContent = icon || '';
  document.getElementById('modalTitle').textContent = title || '';
  document.getElementById('modalMessage').textContent = message || '';
  const actionsEl = document.getElementById('modalActions');
  actionsEl.innerHTML = '';
  buttons.forEach(b => {
    const btn = document.createElement('button');
    btn.className = 'btn ' + (b.cls || 'btn-secondary');
    btn.textContent = b.label;
    btn.onclick = () => { closeModal(); if (b.action) b.action(); };
    actionsEl.appendChild(btn);
  });
  document.getElementById('modalOverlay').classList.add('visible');
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('visible');
}
