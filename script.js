function toggleMenu() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  nav.classList.toggle('open');
}

function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

/**
 * Rendu du bouton HelloAsso (iframe) avec auto-resize.
 * On utilise un id unique par carte pour éviter les collisions.
 */
function renderHelloAssoIframe(src, iframeId) {
  return `
    <iframe
      id="${iframeId}"
      allowtransparency="true"
      src="${src}"
      style="width: 100%; height: 70px; border: none;"
      loading="lazy"
      onload="
        window.addEventListener('message', function(e) {
          try {
            // Mini sécurité : on accepte uniquement HelloAsso
            if (!e || !e.origin || !String(e.origin).includes('helloasso.com')) return;
            const dataHeight = e && e.data ? e.data.height : null;
            if (!dataHeight) return;
            const haWidgetElement = document.getElementById('${iframeId}');
            if (!haWidgetElement) return;
            haWidgetElement.style.height = (dataHeight + 2) + 'px';
          } catch (_) {}
        });
      "
    ></iframe>
  `;
}

async function loadEvents() {
  try {
    const res = await fetch('events.json', { cache: 'no-store' });
    const events = await res.json();

    // Sort by date/time
    events.sort((a, b) => (a.date + (a.time || "")) > (b.date + (b.time || "")) ? 1 : -1);

    // Events page list
    const list = document.getElementById('events-list');
    if (list) {
      list.innerHTML = events.map((ev, i) => {
        const pricesHtml = Array.isArray(ev.prices) && ev.prices.length
          ? `<ul class="event-prices">${ev.prices.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
          : '';

        // Si helloassoSrc existe => bouton d'inscription HelloAsso, sinon bouton Détails classique
        const ctaHtml = ev.helloassoSrc
          ? `<div class="ha-embed">${renderHelloAssoIframe(ev.helloassoSrc, `haWidget-${i}`)}</div>
             <a class="btn btn-ghost full" href="${ev.link || 'https://instagram.com/orizon_bde'}" target="_blank" rel="noreferrer">Infos (Instagram)</a>`
          : `<a class="btn btn-secondary full" href="${ev.link || 'https://instagram.com/orizon_bde'}" target="_blank" rel="noreferrer">Détails</a>`;

        return `
          <article class="event card">
            <div class="event-top">
              <span class="badge">${escapeHtml(ev.tag || 'Event')}</span>
              <span class="event-date">${formatDate(ev.date)}${ev.time ? " • " + escapeHtml(ev.time) : ""}</span>
            </div>
            <h3 class="h3">${escapeHtml(ev.title)}</h3>
            <p class="muted">${escapeHtml(ev.location || '')}</p>
            ${pricesHtml}
            ${ctaHtml}
          </article>
        `;
      }).join('');
    }

    // Home highlights (3 next)
    const hi = document.getElementById('highlight-events');
    if (hi) {
      const next3 = events.slice(0, 3);
      hi.innerHTML = next3.map(ev => `
        <a class="mini-item" href="${ev.link || 'events.html'}" target="_blank" rel="noreferrer">
          <div class="mini-title">${escapeHtml(ev.title)}</div>
          <div class="mini-meta">${formatDate(ev.date)}${ev.time ? " • " + escapeHtml(ev.time) : ""} — ${escapeHtml(ev.location || '')}</div>
        </a>
      `).join('');
    }

  } catch (e) {
    // Fail silently but show a friendly fallback
    const hi = document.getElementById('highlight-events');
    if (hi) hi.innerHTML = '<p class="muted">Événements bientôt disponibles.</p>';
  }
}

function formatDate(iso) {
  try {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });
  } catch {
    return iso;
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, s => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[s]));
}

document.addEventListener('click', (e) => {
  // Close burger menu when clicking outside on mobile
  const nav = document.querySelector('.nav');
  if (!nav || !nav.classList.contains('open')) return;
  const menu = document.getElementById('menu');
  const burger = document.querySelector('.burger');
  if (menu && burger && !menu.contains(e.target) && !burger.contains(e.target)) {
    nav.classList.remove('open');
  }
});

setYear();
loadEvents();
