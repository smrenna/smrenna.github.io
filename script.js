function arxivUrl(id) {
  return `https://arxiv.org/abs/${id}`;
}

function renderPublications(groups) {
  const containerIds = {
    "Pythia": "pub-group-pythia",
    "Machine Learning / AI": "pub-group-ml",
    "CMS Collaboration": "pub-group-cms"
  };

  for (const group of groups) {
    const container = document.getElementById(containerIds[group.group]);
    if (!container) continue;

    const heading = document.createElement("h3");
    heading.className = "group-heading";
    heading.textContent = group.group;
    container.appendChild(heading);

    const list = document.createElement("ul");
    list.className = "pub-list";

    for (const paper of group.papers) {
      const li = document.createElement("li");

      const title = document.createElement("span");
      title.className = "pub-title";
      title.textContent = paper.title;

      const meta = document.createElement("span");
      meta.className = "pub-meta";
      meta.textContent = `${paper.authors} — ${paper.venue}, ${paper.year}`;

      const links = document.createElement("span");
      links.className = "pub-links";
      const a = document.createElement("a");
      a.href = arxivUrl(paper.arxiv_id);
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = `arXiv:${paper.arxiv_id}`;
      links.appendChild(a);

      li.appendChild(title);
      li.appendChild(meta);
      li.appendChild(links);
      list.appendChild(li);
    }

    container.appendChild(list);
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

    if (talk.url) {
      const links = document.createElement("span");
      links.className = "talk-links";
      const a = document.createElement("a");
      a.href = talk.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = "More info";
      links.appendChild(a);
      li.appendChild(links);
    }

    list.appendChild(li);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetch("data/publications.json")
    .then((res) => res.json())
    .then(renderPublications)
    .catch((err) => console.error("Failed to load publications:", err));

  fetch("data/talks.json")
    .then((res) => res.json())
    .then(renderTalks)
    .catch((err) => console.error("Failed to load talks:", err));

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
