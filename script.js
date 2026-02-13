function toggleMenu() {
  document.querySelector(".nav")?.classList.toggle("open");
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr || "";
    return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
  } catch {
    return dateStr || "";
  }
}

function buildEventCard(e) {
  const prices = Array.isArray(e.prices) ? e.prices : [];
  const badge = e.badge || "Événement";
  const dateTxt = e.date ? `${formatDate(e.date)} · ${e.time || ""}`.trim() : (e.time || "");

  const pricesHtml = prices.length
    ? `<ul class="event-prices">${prices.map(p => `<li>${p}</li>`).join("")}</ul>`
    : "";

  const noteHtml = e.note ? `<p class="event-note">${e.note}</p>` : "";

  let ctas = "";
  if (e.link && e.linkLabel) {
    ctas += `<a class="btn btn-primary full" href="${e.link}" target="_blank" rel="noreferrer">${e.linkLabel}</a>`;
  }
  if (e.secondaryLink && e.secondaryLabel) {
    ctas += `<a class="btn btn-secondary full" href="${e.secondaryLink}" target="_blank" rel="noreferrer">${e.secondaryLabel}</a>`;
  }

  return `
    <article class="card event">
      <div class="event-top">
        <span class="badge">${badge}</span>
        <span class="event-date">${dateTxt}</span>
      </div>
      <h3 class="h3">${e.title || "Sans titre"}</h3>
      <p class="muted">${e.location || ""}</p>
      ${pricesHtml}
      ${noteHtml}
      <div class="spacer"></div>
      ${ctas}
    </article>
  `;
}

async function fetchEventsJSON() {
  // URL fiable : prend l'URL de la page courante (events.html) et résout events.json au même endroit
  const url = new URL("events.json", window.location.href).toString();

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status} sur ${url}`);
  return await res.json();
}

async function loadEvents() {
  const eventsList = document.getElementById("events-list");
  if (!eventsList) return;

  try {
    const data = await fetchEventsJSON();

    const events = Array.isArray(data.events) ? data.events : [];
    if (!events.length) {
      eventsList.innerHTML = `<div class="card" style="padding:18px;">Aucun événement trouvé dans <code>events.json</code>.</div>`;
      return;
    }

    eventsList.innerHTML = events.map(buildEventCard).join("");
  } catch (err) {
    console.error("Erreur chargement events:", err);
    eventsList.innerHTML = `
      <div class="card" style="padding:18px;">
        Impossible de charger <code>events.json</code>.<br>
        Vérifie que <code>events.json</code> est bien dans le même dossier que <code>events.html</code> sur GitHub Pages.
      </div>
    `;
  }
}

async function loadHighlights() {
  const highlight = document.getElementById("highlight-events");
  if (!highlight) return;

  try {
    const data = await fetchEventsJSON();
    const events = Array.isArray(data.events) ? data.events : [];
    const top = events.slice(0, 2);

    highlight.innerHTML = top.map(e => `
      <a class="mini-item" href="events.html">
        <div class="mini-title">${e.title || ""}</div>
        <div class="mini-meta">${formatDate(e.date)} · ${e.time || ""} — ${e.location || ""}</div>
      </a>
    `).join("");
  } catch (err) {
    console.error("Erreur highlights:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const y = document.getElementById("year");
  if (y) y.textContent = new Date().getFullYear();

  loadHighlights();
  loadEvents();
});
