# smrenna.github.io

Personal site for Stephen Mrenna. Plain static HTML/CSS/JS — `index.html`, `style.css`,
`script.js` — deployed by `.github/workflows/pages.yml` (no build step, no Jekyll).

Publications and talks are rendered at load time from JSON files in `data/`, so most updates
never touch `index.html`.

To preview locally, serve the directory (opening `index.html` directly via `file://` won't
work — the browser blocks `fetch()` of local JSON files without a server):

```
python3 -m http.server
```

## Editing

- **Publications**: add/edit an entry in `data/publications.json`. Each group (`Pythia`,
  `Machine Learning / AI`, `CMS Collaboration`) is a list of papers with `title`, `authors`,
  `venue`, `year`, and `arxiv_id`. Group order on the page follows the array order.
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
