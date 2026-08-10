# Blog Authoring

This blog is a static Markdown-powered module. It does not require Jekyll, npm, or a build step.

## Add a Post

1. Create a Markdown file in `blog/posts/`, for example `blog/posts/my-post.md`.
2. Add front matter at the top:

```markdown
---
title: "My Post"
date: "2026-08-10"
tags: ["robotics", "notes"]
summary: "One short sentence for the blog index."
---
```

3. Add the post to `blog/posts/posts.json`:

```json
{
  "slug": "my-post",
  "title": "My Post",
  "date": "2026-08-10",
  "tags": ["robotics", "notes"],
  "summary": "One short sentence for the blog index.",
  "readingTime": "5 min read"
}
```

The `slug` must match the Markdown filename without `.md`.

## Callouts

Use Obsidian-style Markdown callouts:

```markdown
> [!NOTE] Research note
> This becomes a styled note box.

> [!TIP] Practical tip
> This becomes a styled tip box.

> [!WARNING] Caveat
> This becomes a styled warning box.
```

Supported types are `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and `CAUTION`.

## Images

Put article images under `blog/posts/assets/` or a post-specific folder under `blog/posts/`.

```markdown
![Robot rollout](assets/robot-rollout.png)
```

Relative image paths are resolved from the Markdown file location.

## LaTeX

Write inline formulas with `$...$`:

```markdown
The loss is $L(\theta)$.
```

Write display formulas with `$$...$$`:

```markdown
$$
\mathcal{L}(\theta) = -\sum_i y_i \log p_\theta(x_i)
$$
```

The post page uses MathJax, so common LaTeX commands and aligned equations are supported.

## Local Preview

Because posts are loaded with `fetch()`, preview through a local HTTP server:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/blog/`.
