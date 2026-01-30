function toggleMenu() {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  nav.classList.toggle('open');
}

function setYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

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
            if (!e || !e.origin || !String(e.origin).includes('helloasso.com')) return;
            const dataHeight = e && e.data ? e.data.height : null;
            if (!dataHeight) return;
            const el = document.getElementById('${iframeId}');
            if (!el) return;
            el.style.height = (dataHeight + 2) + 'px';
          } catch (_) {}
        });
      "
    ></iframe>
  `;
}

async function loadEvents() {
  try {
    const res = await fetch('events.json', { cache: 'no-store' });
    const data = await res.json();
    const events = Array.isArray(data) ? data : [];

    // tri
    events.sort((a, b) => (a.date + (a.time || "")) > (b.date + (b.time || "")) ? 1 : -1);

    const list = document.getElementById('events-list');
    if (list) {
      list.innerHTML = events.map((ev, i) => {
        const pricesHtml = Array.isArray(ev.prices) && ev.prices.length
          ? `<ul class="event-prices">${ev.prices.map(p => `<li>${escapeHtml(p)}</li>`).join('')}</ul>`
          : '';

        const noteHtml = ev.note
          ? `<p class="event-note">${escapeHtml(ev.note)}</p>`
          : '';

        // ✅ CTA : respecte noCta
        let ctaHtml = '';
        if (ev.helloassoSrc) {
          ctaHtml = `
            <div class="ha-embed">${renderHelloAssoIframe(ev.helloassoSrc, `haWidget-${i}`)}</div>
            ${ev.link ? `<a class="btn btn-ghost full" href="${ev.link}" target="_blank" rel="noreferrer">Infos (Instagram)</a>` : ''}
          `;
        } else if (ev.noCta === true) {
          ctaHtml = ''; // rien du tout
        } else if (ev.link) {
          ctaHtml = `<a class="btn btn-secondary full" href="${ev.link}" target="_blank" rel="noreferrer">Infos</a>`;
        } else {
          ctaHtml = ''; // pas de lien => pas de bouton
        }

        return `
          <article class="event card">
            <div class="event-top">
              <span class="badge">${escapeHtml(ev.tag || 'Event')}</span>
              <span class="event-date">${formatDate(ev.date)}${ev.time ? " • " + escapeHtml(ev.time) : ""}</span>
            </div>

            <h3 class="h3">${escapeHtml(ev.title)}</h3>
            <p class="muted">${escapeHtml(ev.location || '')}</p>

            ${noteHtml}
            ${pricesHtml}
            ${ctaHtml}
          </article>
        `;
      }).join('');
    }

    // Home highlights
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
