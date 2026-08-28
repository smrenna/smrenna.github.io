# smrenna.github.io

Personal site for Stephen Mrenna. Plain static HTML/CSS/JS — `index.html`, `style.css`,
`script.js` — deployed by `.github/workflows/pages.yml` (no build step, no Jekyll).

Publications are rendered at load time from `data/publications.bib` (plain BibTeX) and talks
from `data/talks.json`, so most updates never touch `index.html`.

To preview locally, serve the directory (opening `index.html` directly via `file://` won't
work — the browser blocks `fetch()` of local files without a server):

```
python3 -m http.server
```

## Editing

- **Publications**: add/edit an `@article{...}` entry in `data/publications.bib`. Recognized
  fields are `title`, `author` (BibTeX `Last, First and Last2, First2` form — end with `and
  others` for "et al."), `journal`, `year`, and `eprint` (arXiv id, used to build the arXiv
  link). Every entry needs a custom `group` field set to exactly `Pythia`, `Machine Learning /
  AI`, or `CMS Collaboration` — that's what sorts it into the right section (page order is
  fixed to that order regardless of where the entry sits in the file). Write author names with
  real UTF-8 characters (e.g. `Torbjörn`), not LaTeX escapes (`\"o`) — the page's parser doesn't
  decode those. This is a small hand-rolled parser, not a full BibTeX implementation: no
  `@string` macros, `crossref`, or comments on the same line as a field.
- **Talks**: add an entry to `data/talks.json`, e.g.:
  ```json
  { "title": "...", "venue": "...", "location": "...", "date": "March 2026", "url": "https://..." }
  ```
  `url` is optional. The "coming soon" note disappears automatically once the array is non-empty.
- **CV**: drop a PDF at `files/cv.pdf` (the "Download CV" link already points there).
- **Contact links**: edit the `<section id="contact">` block in `index.html` directly (rarely changes).
- **Research blurbs**: edit the `<section id="research">` block in `index.html` directly.

## Legacy site

The previous Jekyll site (built on the [academicpages](https://github.com/academicpages/academicpages.github.io)
theme) is preserved under `legacy-jekyll-site/` for reference. It is not part of the deployed site.
