# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Jekyll-based personal academic homepage hosted on GitHub Pages, built on the "Academic Pages" theme. The site is for Xiangnan Wu (Kris Wu) and is deployed at https://xiangnan-wu.github.io.

## Development Commands

### Prerequisites
- Ruby + Bundler
- Node.js + npm

### Setup
```bash
bundle install
npm install
```

### Local Development
```bash
bundle exec jekyll serve        # Serve at http://localhost:4000
bundle exec jekyll liveserve   # With live reload (via hawkins gem)
```

### JavaScript Assets
```bash
npm run build:js    # Build JS bundle
npm run uglify      # Minify to main.min.js
npm run watch:js    # Watch and rebuild on changes
```

### Content Data Generation
Publications and talks can be generated from TSV data using the Python scripts or Jupyter notebooks in `markdown_generator/`:
```bash
cd markdown_generator
python publications.py    # Generate _publications/ markdown files from publications.tsv
python talks.py           # Generate _talks/ markdown files from talks.tsv
python talkmap.py         # Generate talk location map (talkmap/)
```

## Architecture

### Content Model
Jekyll **collections** drive the main content types:
- `_publications/` — research papers (auto-generated from `markdown_generator/publications.tsv`)
- `_talks/` — presentations and talks (auto-generated from `markdown_generator/talks.tsv`)
- `_teaching/` — courses taught
- `_portfolio/` — project showcases

Pages in `_pages/` define the site sections. `about.md` is the homepage (mapped to `/`).

### Templating
- `_layouts/` — page templates (default → single/archive → content)
- `_includes/` — reusable components (author profile sidebar, masthead, footer, etc.)
- Liquid templating language with YAML front matter on all content files

### Styling
SCSS modules in `_sass/` compiled by Jekyll. Main entry point is imported through `assets/css/`. No pre-compilation step needed — Jekyll handles SCSS.

### JavaScript
jQuery-based with plugins in `assets/js/plugins/`. Source is `assets/js/_main.js`; the minified bundle `assets/js/main.min.js` is what gets served. Edit `_main.js` and run `npm run uglify` to update.

### Configuration
- `_config.yml` — Jekyll config, site metadata, author info, collection definitions
- `_data/navigation.yml` — navigation links
- `_data/authors.yml` — author profile data (fallback to `_config.yml` author section)
- `_data/ui-text.yml` — localization strings

## Key Workflows

### Adding a Publication
1. Add entry to `markdown_generator/publications.tsv`
2. Run `python markdown_generator/publications.py` to regenerate `_publications/` markdown files
3. Or manually create a markdown file in `_publications/` with appropriate YAML front matter

### Updating Author Profile
Edit the `author` section in `_config.yml` or `_data/authors.yml`. The sidebar (`_includes/author-profile.html`) reads from these.

### Adding/Modifying Pages
Pages in `_pages/` use YAML front matter with `permalink:` to define their URL. The homepage is `_pages/about.md` with `permalink: /`.
