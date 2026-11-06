---
title: "The writing guide"
description: "A practical guide to writing for this site: a clear structure, a simple voice, and the Markdown features that make a post easy to read."
tags:
  - Guide
draft: false
publishedAt: "2026-11-06"
---

A post on this site is one Markdown file in `src/content/posts`. There is no editor, database, or dashboard in the way. You write the file, the build turns it into static HTML, and a commit publishes it.

That simplicity is the point. This guide covers the structure I reach for, the Markdown that does the formatting, and the few habits that make a post easier to read.

> [!NOTE]
> Everything on this page is plain Markdown. Copy any example into a `.md` file and it will render the same way.

## Start with the file

Every post opens with YAML frontmatter. The schema requires five fields and accepts two optional ones.

```yaml
---
title: "A post title"
description: "One sentence for listings and search results."
tags:
  - Writing
  - Markdown
draft: false
publishedAt: "2026-11-06"
updatedAt: "2026-11-08"
coverImage: "/images/cover.jpg"
---
```

`title` and `description` appear on the post page and in its metadata. `tags` power the filters on [the posts index](/posts). `draft: true` keeps a post out of the index, feed, sitemap, and direct route. `publishedAt` and `updatedAt` use `YYYY-MM-DD`, and `updatedAt` cannot be earlier than `publishedAt`.

`coverImage` is optional. When it points at a file, the build crops it to 1200 by 630 for social metadata and shows it above the post. Without one, the build generates a social card from the title, tags, and date.

## Write for one reader

A blank page gets easier when you decide who it is for. Write to one person, not an audience.

A paragraph should carry one idea. When a paragraph starts doing two jobs, split it. A blank line starts a new paragraph. A single newline inside a paragraph is treated as a space, which keeps the source readable without adding a visible break.

Markdown handles the common inline styles: **bold for a key term**, _italic for emphasis or a title_, **_bold italic when you need both_**, ~~strikethrough for a correction~~, and `inline code for a command or filename`. Use them sparingly; a page where everything is emphasized has nothing emphasized.

A link can include a title that appears on hover, like [the CommonMark specification](https://commonmark.org "CommonMark specification"). GFM also turns a bare URL such as https://developer.mozilla.org into a link, and you can keep long destinations out of a paragraph with [reference-style links][tanstack-start].

Backslashes keep punctuation literal: \*this is not emphasis\* and \`this is not code\`. HTML entities still work, so &copy; renders as a copyright sign.

> [!TIP]
> Read the opening aloud. If you run out of breath, the sentence is too long.

## Give the piece a shape

Headings are landmarks. A reader should be able to scan them and understand the argument without reading every paragraph.

Use `##` for the main sections and `###` for subsections. Most posts stop at `####`. The build adds an id to every heading and wraps the text in a link, so [this section](#give-the-piece-a-shape) can be linked directly. Changing a heading changes its id and breaks old links.

### Keep the hierarchy shallow

If a subsection needs another subsection, the post may be doing too much. Split it into two posts or turn the detail into a footnote.

#### A fourth level is usually enough

Four levels is the practical limit for a technical post.

## Make lists earn their place

Lists are for items that belong together. They are not a way to avoid writing transitions.

### Unordered lists

- One idea per item
- Parallel grammar between items
- A nested item when it belongs to its parent
  - A detail that supports the parent
  - Another detail
- No more than five or six items

### Ordered lists

The number in the source does not have to increase. This source uses `1.` for every item, and the browser numbers them in order.

1. Write the file.
1. Run the checks.
1. Publish the result.

A list can also start at a later number:

3. Draft the opening.
4. Cut the throat-clearing.
5. Read it once more.

### Task lists

- [x] Draft the post
- [x] Add images
- [ ] Check every link
- [ ] Publish

Task lists come from GFM. The checkbox renders as a disabled input, so it reads as a status rather than a control.

## Quote what matters

A blockquote gives someone else the floor.

> Good writing is mostly rewriting.

A nested quote works too, which is useful when you are replying to yourself:

> Write for one reader.
>
> > If you cannot name the reader, the post is not ready.

### Call attention with alerts

GitHub alerts use the same blockquote syntax as above, with a marker on the first line. They render as callouts, and the title is supplied for you.

```md
> [!NOTE]
> Useful context that can wait until the end.
```

> [!NOTE]
> Useful context that can wait until the end.

> [!TIP]
> Keep posts in version control. A diff is the most useful editorial review tool there is.

> [!IMPORTANT]
> Say the main point early. A reader who stops after the first screen should still leave with something.
>
> Then use the rest of the post to earn the reader's attention.

> [!WARNING]
> Remote images are fetched while the site builds. A dead URL fails the build instead of shipping a broken image.

> [!CAUTION]
> Cloudflare Workers disallow `eval()` and `new Function`, so posts are compiled at build time rather than parsed per request.

Use an alert for a genuine interruption. If every other paragraph is a callout, the page reads like a warning label.

## Compare things in a table

A table earns its space when the reader needs to compare the same facts across several items.

| Element  | Use it for             |              Watch out for |
| :------- | :--------------------- | -------------------------: |
| **Bold** | A key term             |         Too many key terms |
| _Italic_ | Emphasis or a title    | Emphasis in every sentence |
| `Code`   | Commands and filenames |     Using it as decoration |
| Link     | Sources and next steps |  "Click here" as the label |

Wide tables scroll horizontally, and the wrapper keeps the page itself from scrolling on a phone.

## Show code, not decoration

Fenced code blocks are highlighted at build time. The language after the opening fence picks the grammar. A fence without a language falls back to plain text.

```bash
vp check
vp test
vp build
```

A diff is often clearer than a sentence about the change:

```diff
- The build is fast and it works well.
+ The build takes about four seconds.
```

A small JSON example, braces and all:

```json
{
  "title": "The writing guide",
  "draft": false,
  "tags": ["Writing", "Markdown"]
}
```

Shiki renders a light and a dark token set, and the stylesheet picks the right set for the current theme.

## Use images with intent

Markdown image syntax produces a figure with generated AVIF, WebP, and JPEG versions. The build downloads remote images once and serves local files.

![A laptop, notebook, and coffee on a desk](https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80 "A workspace")

The quoted string is a title attribute, not a visible caption. The alt text is what a screen reader announces, so describe the image rather than repeating the surrounding sentence. Images inside a sentence stay inline: the Markdown logo ![Markdown logo](https://raw.githubusercontent.com/github/explore/main/topics/markdown/markdown.png) renders at text size.

The optimizer creates variants at 480, 960, and 1440 pixels wide, skipping any size larger than the source. Add a local or remote image and let the build handle the rest.

## Link to sources

Reference-style links keep long URLs out of a paragraph. Define the target once and reuse it.

Both [TanStack Start][tanstack-start] and [TanStack Router][tanstack-router] use file-based routes. Relative links work too, like [the posts index](/posts). A bare URL such as https://commonmark.org is linked automatically.

## Keep asides out of the way

Footnotes come from GFM. A marker in the text records the note, and the note lands at the bottom with a link back.

The build compiles each post to static HTML before deployment, which keeps parsing out of the Worker.[^build] Images go through the same build pass.[^images]

## Edit before you publish

---

Run the checks, read the post once on a narrow screen, and remove anything that does not help the reader.

- [ ] The title says what the post is about
- [ ] The first paragraph earns the next one
- [ ] Every heading is a real landmark
- [ ] Links work and images have alt text
- [ ] The post is shorter than the first draft

If a post genuinely needs an authored React component rather than Markdown, save it as `.mdx`. For everything else, a `.md` file is enough.

[tanstack-start]: https://tanstack.com/start "TanStack Start"
[tanstack-router]: https://tanstack.com/router "TanStack Router"

[^build]: Cloudflare Workers do not allow `eval()` or `new Function`, so runtime compilation is not an option here.

[^images]: Sharp creates the AVIF, WebP, and JPEG variants during the build and writes them under `public/generated`.
