---
title: "Welcome to the Blog"
date: "2026-08-10"
tags: ["notes", "markdown"]
summary: "A short template post showing Markdown syntax, callouts, code blocks, tables, and image support."
---

This is a template post for the new blog module. Each article is a normal Markdown file under `blog/posts/`, and the blog index reads metadata from `blog/posts/posts.json`.

## Markdown Basics

You can write regular Markdown:

- Lists for quick notes.
- **Bold text** and *emphasis*.
- Inline code such as `policy.forward(obs)`.
- Links to [arXiv](https://arxiv.org/).

## Callouts

Use Obsidian-style callouts in blockquotes:

> [!NOTE] Research note
> This is useful for definitions, assumptions, or short summaries.

> [!TIP] Practical tip
> Keep figures close to the paragraph that introduces them.

> [!WARNING] Caveat
> Be explicit about experiment settings before comparing numbers across papers.

## Code

```python
def success_rate(successes, trials):
    return successes / max(trials, 1)

print(f"{success_rate(48, 100):.1%}")
```

## LaTeX

Inline formulas use single dollar signs, such as $a^2 + b^2 = c^2$.

Block formulas use double dollar signs:

$$
\mathcal{L}(\theta) = -\sum_{i=1}^{N} y_i \log p_\theta(x_i)
$$

You can also use aligned equations:

$$
\begin{aligned}
Q(s_t, a_t) &= r_t + \gamma \max_a Q(s_{t+1}, a), \\
\pi(a_t \mid s_t) &= \operatorname{softmax}(Q(s_t, a_t)).
\end{aligned}
$$

## Tables

| Setting | Base Policy | Result |
| --- | --- | --- |
| Simulation | VLA | Stable |
| Real robot | VLA + verifier | Needs careful evaluation |

## Images

Images are responsive by default. Relative image paths are resolved from the Markdown file location, so `![Example](assets/example.png)` points to `blog/posts/assets/example.png`.
