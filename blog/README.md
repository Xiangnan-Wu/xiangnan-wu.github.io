# Blog 使用说明

纯静态博客，无需任何构建工具。支持 **Markdown 写作** + **LaTeX 公式渲染**。

---

## 目录结构

```
Blog/
├── index.html          # 首页（文章列表，由 build.py 自动生成）
├── build.py            # 构建脚本：扫描 posts/ 并更新首页
└── posts/
    ├── post.css        # 文章页共享样式
    ├── post.js         # 文章页共享逻辑（Markdown 渲染 + KaTeX + 目录）
    ├── raft-to-paxos.html
    ├── production-rag.html
    └── btree-vs-lsm.html
```

---

## 写一篇新文章

### 第一步：复制模板

```bash
cp posts/raft-to-paxos.html posts/your-post-slug.html
```

### 第二步：修改文章头部信息

打开新文件，找到以下几处改成你自己的内容：

```html
<title>你的文章标题 · Kris Wu</title>
```

```html
<!-- 标签：可选 tag-blue / tag-sage / tag-rose / tag-lavender / tag-terra / tag-default -->
<div class="post-tag-row">
  <span class="tag tag-blue">Distributed Systems</span>
  <span class="tag tag-default">Consensus</span>
</div>

<h1>你的文章标题</h1>

<div class="post-meta-row">
  <span>Kris Wu</span><span class="dot">·</span>
  <span>Jan 1, 2026</span><span class="dot">·</span>
  <span>10 min read</span>
</div>
```

```html
<!-- 底部上一篇 / 下一篇 -->
<nav class="post-nav">
  <a href="上一篇.html" class="post-nav-item">
    <div class="post-nav-label">← Previous</div>
    <div class="post-nav-title">上一篇标题</div>
  </a>
  <a href="下一篇.html" class="post-nav-item post-nav-next">
    <div class="post-nav-label">Next →</div>
    <div class="post-nav-title">下一篇标题</div>
  </a>
</nav>
```

### 第三步：填写文章元数据（用于首页）

在文件末尾 `<script src="post.js">` 的**上方**，加入以下 JSON 块：

```html
<script type="application/json" id="post-meta">
{
  "title": "你的文章标题",
  "date": "Jan 1, 2026",
  "readTime": "10 min read",
  "tags": [
    {"label": "Distributed Systems", "color": "blue"},
    {"label": "Internals"}
  ],
  "excerpt": "一两句话的摘要，会显示在首页文章列表里。",
  "pinned": false
}
</script>
```

标签颜色可选：`blue` / `sage` / `rose` / `lavender` / `terra`，省略 `"color"` 则显示默认灰色。

`"pinned": true` 会将文章置顶并显示 ★。

### 第四步：更新首页

```bash
python3 build.py
```

脚本会自动扫描 `posts/` 里所有带 `post-meta` 的文件，按日期排序后更新 `index.html`。

---

### 第五步：写正文（Markdown）

找到文件底部的 `<script id="md-source" type="text/markdown">` 标签，把里面的内容替换成你的 Markdown：

```html
<script id="md-source" type="text/markdown">
这里写你的文章正文，支持完整的 Markdown 语法。

## 二级标题（会自动生成右侧目录）

### 三级标题

普通段落文字...

- 无序列表
- 第二项

1. 有序列表

**加粗** 和 *斜体* 和 `行内代码`

> 引用块

---

| 列1 | 列2 | 列3 |
|---|---|---|
| A | B | C |

```python
# 代码块，会自动语法高亮
def hello():
    print("world")
```
</script>
```

### 支持的代码语言高亮

`rust` `python` `typescript` `bash`

如需其他语言，在 `<head>` 里加一行：
```html
<script src="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/languages/go.min.js"></script>
```
[完整语言列表](https://github.com/highlightjs/highlight.js/tree/main/src/languages)

---

## 写 LaTeX 公式

| 类型 | 写法 | 效果 |
|---|---|---|
| 行内公式 | `$E = mc^2$` | 嵌在文字中间 |
| 块级公式 | `$$\sum_{i=1}^{n} x_i$$` | 独占一行，居中显示 |

**注意：** 公式内不要出现 Markdown 的特殊字符（如 `_` 下划线），如需使用请用 `\_` 转义，或者改写成 `\text{subscript}` 的形式。

---

## 插入图片

将图片文件放在 `posts/` 目录下，然后在 Markdown 里引用：

```markdown
![图片描述](图片文件名.png)
```

---

## 可用的标签颜色

```html
<span class="tag tag-blue">蓝灰色</span>      <!-- 系统设计、分布式 -->
<span class="tag tag-sage">鼠尾草绿</span>    <!-- AI、Go、LLM -->
<span class="tag tag-rose">玫瑰粉</span>      <!-- 工程文化 -->
<span class="tag tag-lavender">薰衣草紫</span><!-- 数据库、性能 -->
<span class="tag tag-terra">赭石色</span>     <!-- 可观测性 -->
<span class="tag tag-default">灰色（默认）</span>
```

---

## 本地预览

直接用浏览器打开 `index.html` 即可。如果遇到跨域问题（CDN 字体/脚本加载失败），用任意静态服务器启动：

```bash
# Python
python3 -m http.server 8080

# Node.js
npx serve .
```

然后访问 `http://localhost:8080`。

---

## 发布

这是纯静态网站，可以直接托管在：

- **GitHub Pages**：把整个目录推到 `gh-pages` 分支
- **Vercel / Netlify**：拖拽文件夹上传，或连接 Git 仓库自动部署
- **任意静态文件服务器**：直接上传即可
