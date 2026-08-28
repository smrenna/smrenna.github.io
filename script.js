function arxivUrl(id) {
  return `https://arxiv.org/abs/${id}`;
}

// Lightweight BibTeX parser for hand-written entries. Supports @type{key, field = {value}, ...}
// with brace- or quote-delimited values (braces may nest) and bare values (e.g. year = 2024).
// Does not support @string macros, crossref, or comments after a field on the same line.
function parseBibtex(text) {
  const entries = [];
  let i = 0;
  while (true) {
    const at = text.indexOf("@", i);
    if (at === -1) break;
    let j = at + 1;
    while (j < text.length && /[a-zA-Z]/.test(text[j])) j++;
    const type = text.slice(at + 1, j).toLowerCase();
    while (j < text.length && /\s/.test(text[j])) j++;
    if (text[j] !== "{") { i = at + 1; continue; }
    let depth = 0;
    const start = j;
    let k = j;
    for (; k < text.length; k++) {
      if (text[k] === "{") depth++;
      else if (text[k] === "}") { depth--; if (depth === 0) { k++; break; } }
    }
    entries.push(parseEntryBody(type, text.slice(start + 1, k - 1)));
    i = k;
  }
  return entries;
}

function parseEntryBody(type, body) {
  let depth = 0;
  let idx = 0;
  for (; idx < body.length; idx++) {
    const c = body[idx];
    if (c === "{") depth++;
    else if (c === "}") depth--;
    else if (c === "," && depth === 0) break;
  }
  const key = body.slice(0, idx).trim();
  const rest = body.slice(idx + 1);
  const fields = {};

  let pos = 0;
  while (pos < rest.length) {
    while (pos < rest.length && /[\s,]/.test(rest[pos])) pos++;
    if (pos >= rest.length) break;

    const nameStart = pos;
    while (pos < rest.length && /[a-zA-Z0-9_]/.test(rest[pos])) pos++;
    const name = rest.slice(nameStart, pos).toLowerCase();
    if (!name) { pos++; continue; }

    while (pos < rest.length && /\s/.test(rest[pos])) pos++;
    if (rest[pos] !== "=") continue;
    pos++;
    while (pos < rest.length && /\s/.test(rest[pos])) pos++;

    let value = "";
    if (rest[pos] === "{") {
      let d = 0;
      const vstart = pos;
      for (; pos < rest.length; pos++) {
        if (rest[pos] === "{") d++;
        else if (rest[pos] === "}") { d--; if (d === 0) { pos++; break; } }
      }
      value = rest.slice(vstart + 1, pos - 1);
    } else if (rest[pos] === '"') {
      const vstart = ++pos;
      while (pos < rest.length && rest[pos] !== '"') pos++;
      value = rest.slice(vstart, pos);
      pos++;
    } else {
      const vstart = pos;
      while (pos < rest.length && rest[pos] !== ",") pos++;
      value = rest.slice(vstart, pos);
    }

    fields[name] = value.trim().replace(/\s+/g, " ");
  }

  return { type, key, fields };
}

// "Last, First and Last2, First2 and others" -> "F. Last, F. Last2, et al."
// A piece with no comma (e.g. "CMS Collaboration") passes through unchanged.
function formatAuthors(raw) {
  return raw
    .split(/\s+and\s+/i)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => {
      if (/^others$/i.test(p)) return "et al.";
      if (!p.includes(",")) return p;
      const [last, first] = p.split(",").map((s) => s.trim());
      if (!first) return last;
      const initials = first.split(/\s+/).map((w) => (w[0] ? `${w[0]}.` : "")).join(" ");
      return `${initials} ${last}`;
    })
    .join(", ");
}

function renderPublications(bibText) {
  const containerIds = {
    "Pythia": "pub-group-pythia",
    "Machine Learning / AI": "pub-group-ml",
    "CMS Collaboration": "pub-group-cms"
  };
  const groupOrder = ["Pythia", "Machine Learning / AI", "CMS Collaboration"];

  const entries = parseBibtex(bibText);
  const byGroup = new Map(groupOrder.map((g) => [g, []]));
  for (const entry of entries) {
    const groupName = entry.fields.group;
    if (byGroup.has(groupName)) byGroup.get(groupName).push(entry);
  }

  for (const groupName of groupOrder) {
    const papers = byGroup.get(groupName);
    if (!papers || papers.length === 0) continue;

    const container = document.getElementById(containerIds[groupName]);
    if (!container) continue;

    const heading = document.createElement("h3");
    heading.className = "group-heading";
    heading.textContent = groupName;
    container.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "pub-list";

    for (const { fields } of papers) {
      const li = document.createElement("li");

      const title = document.createElement("span");
      title.className = "pub-title";
      title.textContent = fields.title || "";

      const meta = document.createElement("span");
      meta.className = "pub-meta";
      meta.textContent = `${formatAuthors(fields.author || "")} — ${fields.journal || ""}, ${fields.year || ""}`;

      li.appendChild(title);
      li.appendChild(meta);

      if (fields.eprint) {
        const links = document.createElement("span");
        links.className = "pub-links";
        const a = document.createElement("a");
        a.href = arxivUrl(fields.eprint);
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = `arXiv:${fields.eprint}`;
        links.appendChild(a);
        li.appendChild(links);
      }

      list.appendChild(li);
    }

    container.appendChild(list);
  }
}

// "March 2026" -> "march-2026"; strips accents, collapses non-alphanumerics to hyphens.
function slugify(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The slides PDF a talk is expected to link to, derived from its date + title so the
// filename can never drift out of sync with the metadata: rename the title, the expected
// file name changes with it. No entry in talks.json needs to name the file explicitly.
function talkSlidesPath(talk) {
  return `files/talks/${slugify(talk.date)}-${slugify(talk.title)}.pdf`;
}

async function fileExists(path) {
  try {
    const res = await fetch(path, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

function renderTalks(talks) {
  if (!talks || talks.length === 0) return;

  const note = document.getElementById("talks-note");
  const list = document.getElementById("talks-list");
  if (note) note.hidden = true;

  for (const talk of talks) {
    const li = document.createElement("li");

    const title = document.createElement("span");
    title.className = "talk-title";
    title.textContent = talk.title;

    const meta = document.createElement("span");
    meta.className = "talk-meta";
    const locationPart = talk.location ? `, ${talk.location}` : "";
    meta.textContent = `${talk.venue}${locationPart} — ${talk.date}`;

    li.appendChild(title);
    li.appendChild(meta);

    const links = document.createElement("span");
    links.className = "talk-links";
    li.appendChild(links);
    list.appendChild(li);

    // Populated asynchronously once we know whether the matching slides PDF exists,
    // so a talk with no uploaded slides just renders without a "Slides" link.
    const slidesPath = talkSlidesPath(talk);
    fileExists(slidesPath).then((exists) => {
      if (exists) {
        const a = document.createElement("a");
        a.href = slidesPath;
        a.textContent = "Slides";
        links.appendChild(a);
      }
      if (talk.url) {
        if (links.childNodes.length) links.appendChild(document.createTextNode(" · "));
        const a = document.createElement("a");
        a.href = talk.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.textContent = "More info";
        links.appendChild(a);
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("data/publications.bib")
    .then((res) => res.text())
    .then(renderPublications)
    .catch((err) => console.error("Failed to load publications:", err));

  fetch("data/talks.json")
    .then((res) => res.json())
    .then(renderTalks)
    .catch((err) => console.error("Failed to load talks:", err));

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
