#!/usr/bin/env python3
"""
build.py — regenerate index.html post list, archive, and tag cloud from posts/*.html metadata

Usage:
    python3 build.py

Each post HTML must contain a <script type="application/json" id="post-meta"> block:

    <script type="application/json" id="post-meta">
    {
      "title": "Your Post Title",
      "date": "May 10, 2026",
      "readTime": "12 min read",
      "tags": [
        {"label": "Distributed Systems", "color": "blue"},
        {"label": "Internals"}
      ],
      "excerpt": "One or two sentences describing the post.",
      "pinned": false
    }
    </script>

Available tag colors: blue, sage, rose, lavender, terra
Omit "color" for the default grey tag.
"""

import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path

POSTS_DIR = Path("posts")
INDEX_FILE = Path("index.html")

DATE_FORMATS = ["%b %d, %Y", "%B %d, %Y"]


def parse_date(date_str):
    for fmt in DATE_FORMATS:
        try:
            return datetime.strptime(date_str.strip(), fmt)
        except ValueError:
            pass
    return datetime.min


def read_post_meta(html_file):
    content = html_file.read_text(encoding="utf-8")
    match = re.search(
        r'<script[^>]+id="post-meta"[^>]*>(.*?)</script>',
        content, re.DOTALL
    )
    if not match:
        return None
    try:
        meta = json.loads(match.group(1))
        meta["file"] = html_file.name
        return meta
    except json.JSONDecodeError as e:
        print(f"  ✗ JSON error in {html_file.name}: {e}")
        return None


def render_tag(tag):
    color = tag.get("color", "")
    cls = f"tag tag-{color}" if color else "tag"
    return f'<span class="{cls}">{tag["label"]}</span>'


def render_post_item(meta):
    slug = meta["file"]
    title = meta["title"]
    date = meta["date"]
    read_time = meta["readTime"]
    tags = meta.get("tags", [])
    excerpt = meta.get("excerpt", "")
    pinned = meta.get("pinned", False)

    d = parse_date(date)
    year = str(d.year) if d != datetime.min else ""
    tags_str = ",".join(t["label"] for t in tags)

    tags_html = "\n              ".join(render_tag(t) for t in tags)
    pinned_class = " post-pinned" if pinned else ""

    return f'''\
        <li class="post-item{pinned_class}" data-year="{year}" data-tags="{tags_str}">
          <div class="post-meta">
            <span class="post-date">{date}</span>
            <span class="post-dot"></span>
            <span class="post-read-time">{read_time}</span>
            <span class="post-dot"></span>
            <div class="post-tags">
              {tags_html}
            </div>
          </div>
          <h2 class="post-title"><a href="posts/{slug}">{title}</a></h2>
          <p class="post-excerpt">{excerpt}</p>
        </li>'''


def render_archive(posts):
    year_counts = Counter()
    for m in posts:
        d = parse_date(m["date"])
        if d != datetime.min:
            year_counts[d.year] += 1

    lines = []
    for year in sorted(year_counts.keys(), reverse=True):
        count = year_counts[year]
        lines.append(
            f'            <li>'
            f'<span class="arch-link" data-filter-year="{year}">{year}</span>'
            f'<span class="arch-count">{count} post{"s" if count > 1 else ""}</span>'
            f'</li>'
        )
    return "\n".join(lines)


def render_tag_list(posts):
    tag_counts = Counter()
    for m in posts:
        for tag in m.get("tags", []):
            tag_counts[tag["label"]] += 1

    lines = []
    for label, count in sorted(tag_counts.items(), key=lambda x: (-x[1], x[0])):
        lines.append(
            f'            <li>'
            f'<span class="arch-link" data-filter-tag="{label}">{label}</span>'
            f'<span class="arch-count">{count}</span>'
            f'</li>'
        )
    return "\n".join(lines)


def render_tag_cloud(posts):
    tag_counts = Counter()
    for m in posts:
        for tag in m.get("tags", []):
            tag_counts[tag["label"]] += 1

    items = []
    for label, count in sorted(tag_counts.items(), key=lambda x: (-x[1], x[0])):
        items.append(
            f'          <span class="tag-cloud-item" data-filter-tag="{label}">'
            f'{label}<sup>{count}</sup></span>'
        )
    return "\n".join(items)


def replace_block(html, marker, content):
    pattern = rf'<!-- BUILD:{marker}_START -->.*?<!-- BUILD:{marker}_END -->'
    replacement = f'<!-- BUILD:{marker}_START -->\n{content}\n            <!-- BUILD:{marker}_END -->'
    result, n = re.subn(pattern, replacement, html, flags=re.DOTALL)
    if n == 0:
        print(f"  ✗ marker BUILD:{marker}_START/END not found in index.html")
    return result


def main():
    if not INDEX_FILE.exists():
        print(f"✗ {INDEX_FILE} not found")
        return

    posts = []
    for f in sorted(POSTS_DIR.glob("*.html")):
        meta = read_post_meta(f)
        if meta:
            posts.append(meta)
        else:
            print(f"  – skipping {f.name} (no post-meta block)")

    # pinned first, then newest first
    posts.sort(key=lambda m: (
        not m.get("pinned", False),
        -parse_date(m["date"]).timestamp()
    ))

    post_items = "\n\n".join(render_post_item(m) for m in posts)

    index = INDEX_FILE.read_text(encoding="utf-8")

    # Post list
    new_index, n = re.subn(
        r'(<ul class="post-list">).*?(</ul>)',
        f'\\1\n\n{post_items}\n\n      \\2',
        index,
        flags=re.DOTALL
    )
    if n == 0:
        print('✗ Could not find <ul class="post-list"> in index.html')
        return

    # Archive, tag list, tag cloud
    new_index = replace_block(new_index, "ARCHIVE",  render_archive(posts))
    new_index = replace_block(new_index, "TAG_LIST", render_tag_list(posts))
    new_index = replace_block(new_index, "TOPICS",   render_tag_cloud(posts))

    INDEX_FILE.write_text(new_index, encoding="utf-8")

    print(f"✓ index.html updated — {len(posts)} post(s)")
    for m in posts:
        pin = "★ " if m.get("pinned") else "  "
        print(f"  {pin}{m['date']:15s}  {m['title']}")


if __name__ == "__main__":
    main()
