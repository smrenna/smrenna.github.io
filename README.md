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
- **Talks**: add an entry to `data/talks.json` with `title`, `venue`, `location`, `date`
  (`url` is optional, for linking out to e.g. a conference's talk page):
  ```json
  { "title": "Pythia at LHCP", "venue": "LHCP 2026", "location": "CERN", "date": "March 2026" }
  ```
  The slides link is fully automatic — there's no filename field to keep in sync. The page
  computes the expected PDF path as `files/talks/<slug of date>-<slug of title>.pdf` (lowercase,
  accents stripped, everything but letters/digits collapsed to hyphens) and only shows a
  "Slides" link if a file actually exists there. For the example above, upload the PDF as
  `files/talks/march-2026-pythia-at-lhcp.pdf`. Rename the title in `talks.json` and the
  expected filename changes with it — no second place to update, and a mismatched name just
  means no "Slides" link shows up rather than a broken one. The "coming soon" note disappears
  automatically once the array is non-empty.
- **CV**: drop a PDF at `files/cv.pdf` (the "Download CV" link already points there).
- **Contact links**: edit the `<section id="contact">` block in `index.html` directly (rarely changes).
- **Research blurbs**: edit the `<section id="research">` block in `index.html` directly.

## Legacy site

The previous Jekyll site (built on the [academicpages](https://github.com/academicpages/academicpages.github.io)
theme) is preserved under `legacy-jekyll-site/` for reference. It is not part of the deployed site.
