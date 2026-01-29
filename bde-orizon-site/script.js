// Update footer year automatically
document.addEventListener('DOMContentLoaded', () => {
  const yearSpan = document.getElementById('year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }
  // Fetch events and render if needed
  fetchEvents();
});

// Toggle mobile menu (burger)
function toggleMenu() {
  const nav = document.querySelector('.nav');
  nav.classList.toggle('open');
}

// Fetch events from JSON file
async function fetchEvents() {
  try {
    const response = await fetch('events.json');
    const events = await response.json();
    renderEvents(events);
    renderHighlights(events);
  } catch (err) {
    console.error('Erreur lors du chargement des événements :', err);
  }
}

// Render event cards on events.html
function renderEvents(events) {
  const grid = document.getElementById('events-grid');
  if (!grid) return;
  // Filtering
  const searchInput = document.getElementById('search');
  const typeSelect = document.getElementById('type');
  let filtered = events.slice();
  const filterFn = () => {
    const query = (searchInput.value || '').toLowerCase();
    const type = typeSelect.value;
    filtered = events.filter(ev => {
      const matchesQuery =
        ev.title.toLowerCase().includes(query) ||
        ev.desc.toLowerCase().includes(query) ||
        ev.place.toLowerCase().includes(query);
      const matchesType = !type || ev.type === type;
      return matchesQuery && matchesType;
    });
    populateGrid();
  };
  if (searchInput && typeSelect) {
    searchInput.addEventListener('input', filterFn);
    typeSelect.addEventListener('change', filterFn);
  }
  const populateGrid = () => {
    grid.innerHTML = '';
    filtered.forEach(ev => {
      const card = document.createElement('div');
      card.className = 'event card';
      card.innerHTML = `
        <h3 class="h3">${ev.title}</h3>
        <p class="muted">${formatDate(ev.date)} à ${ev.time} — ${ev.place}</p>
        ${ev.price ? `<p class="price">${ev.price}</p>` : ''}
        <p>${ev.desc}</p>
        <p><strong>Type :</strong> ${ev.type}</p>
        <a class="btn btn-secondary full" href="${ev.link}" target="_blank" rel="noreferrer">${ev.linkLabel || 'En savoir plus'}</a>
      `;
      grid.appendChild(card);
    });
    if (filtered.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Aucun événement trouvé.';
      grid.appendChild(empty);
    }
  };
  populateGrid();
}

// Render highlight events on index.html (next 3)
function renderHighlights(events) {
  const container = document.getElementById('highlight-events');
  if (!container) return;
  // Sort by date ascending and take first 3
  const sorted = events.sort((a, b) => new Date(a.date) - new Date(b.date));
  const nextThree = sorted.slice(0, 3);
  nextThree.forEach(ev => {
    const item = document.createElement('div');
    item.className = 'mini-item';
    item.innerHTML = `
      <strong>${ev.title}</strong><br/>
      <span class="muted">${formatDate(ev.date)} — ${ev.place}</span>
    `;
    container.appendChild(item);
  });
}

// Format date to readable French format
function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}