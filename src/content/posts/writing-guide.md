---
title: "The writing guide"
description: "A practical guide to writing for this site: a clear structure, a simple voice, and the Markdown features that make a post easy to read."
tags:
  - Guide
draft: false
publishedAt: "2026-11-06"
---

Posts live in `src/content/posts`. Each post is a Markdown file with its own frontmatter. The site checks that frontmatter, compiles the content, and processes its images during the content build.

A good post gives the reader a clear reason to keep reading. It explains one subject, makes its point early, and includes enough detail for the reader to follow the reasoning or try the steps.

## Start with a clear idea

Before opening the editor, write down what the post is about and who is likely to read it. A useful test is to finish this sentence:

> This post explains...

Keep the answer specific. "How I fixed a slow query" gives you something to investigate and explain. "Thoughts on databases" could lead almost anywhere.

Choose one main question for the post. You can mention related ideas when they help answer it, but give each post a subject that can be described in a sentence. Split the draft when it starts covering separate questions that deserve their own explanations.

### Choose a structure that fits the subject

A tutorial needs a goal, any prerequisites, steps in the order they should be followed, and a way to check the result. An explainer needs a clear answer followed by the reasoning and evidence. A project note can describe the problem, the decision you made, and what happened after you tried it. A personal essay can follow the experience or question that changed your view.

Use the structure that suits the material. A short post may need only a few sections. A longer technical post may need an outline before you write the paragraphs.

## Give the post a clear shape

### Write a specific title

The title should tell readers what they will get from the post. Name the subject and, when it helps, the angle: a particular problem, decision, tool, or result.

Avoid vague titles that could belong to dozens of posts. Skip clickbait and exaggerated promises. Sentence case is easier to scan than capitalizing every word.

### Open with the subject

Use the first paragraph to give the reader a reason to continue. Start with the problem, result, question, or detail that led you to write the post. Add the context the reader needs, then state the main point early.

Cut introductions that only announce the topic. Phrases such as "Let's dive in" and "Here's what you need to know" delay the information the reader came for. Begin with that information instead.

### Organize the middle

Use `##` headings for the main sections and `###` headings for smaller parts. A reader should be able to scan the headings and understand the order of the explanation.

Give each section one job. A section might explain a decision, show how a feature works, walk through a step, or discuss a limitation. When a heading needs several unrelated paragraphs to make sense, consider splitting the section or narrowing its subject.

Keep the heading hierarchy shallow. Most posts will not need more than three heading levels. The page title already comes from the `title` frontmatter field, so start the article body with `##` rather than repeating the title as a Markdown heading.

### Finish with something useful

End when the explanation has reached its result. That might be the final step, the trade-off you chose, what you learned, or what the reader should check next. A short final paragraph is fine when it adds a consequence or a useful next action.

Avoid adding a generic conclusion that repeats the introduction. The reader has already read the post; give them the last piece of information they need and stop.

## Write in a natural voice

Write as though you are explaining the subject to one curious person. Use direct language and ordinary words. Technical terms are fine when they are the clearest terms available, but explain an unfamiliar one the first time it matters.

Use first person when the post describes something you did, tested, noticed, or believe. Keep those details honest. Do not invent an anecdote, benchmark, quote, conversation, or result to make a point sound more convincing. If you have not tested something yourself, say what your source supports and leave the rest open.

Prefer specific details to broad claims. A command, error message, version number, design decision, or measured result can help a reader understand what happened. Include a detail when it helps explain the point, not just to make the paragraph look technical.

Vary sentence length as the explanation requires. Short sentences can make a point clear. Longer ones are useful when the reasoning needs more room. Avoid making every paragraph the same size or ending each section with a slogan.

A few editing habits help:

- State the claim directly. Keep a contrast only when the difference is real and useful to the reader.
- Replace inflated descriptions with the actual effect. Explain what became faster, simpler, harder, or more reliable instead of calling it a game-changer.
- Remove filler such as "in today's fast-paced world", "it is important to note", and "in conclusion" when it adds no information.
- Use bold for a term that genuinely needs emphasis. Do not bold every label in a list.
- Use punctuation that makes the relationship between ideas clear. An em dash is one option, not the default connector for every sentence.
- Remove chat leftovers such as "I hope this helps" or "Let me know if you want more". A post should read as a finished piece on its own.

Do not force a personal tone into technical reference material. A clear explanation is more useful than jokes or opinions that do not belong there.

## Add evidence and examples

Explain how you reached a conclusion when the reader may want to check it. Link to the original documentation, issue, paper, article, or tool you used. Use a descriptive link label so the reader knows where it leads.

Keep facts, estimates, and personal opinions distinct. Give dates, versions, units, and relevant conditions when they affect the result. When evidence is incomplete, say what you could verify and what remains uncertain. Never fill a gap with a plausible-sounding detail.

For a tutorial, include the prerequisites that affect whether the steps will work. State the environment or version when it matters. Use an example that a reader can adapt, and check that commands and code match the explanation.

## Create the post file

Save posts in `src/content/posts/`. Use a readable, lowercase filename with hyphens, such as `debugging-a-slow-query.md`. The filename becomes the post's URL slug, so changing it later changes the address.

The content system accepts top-level `.md` and `.mdx` files. It also accepts a single-level folder containing `index.md` or `index.mdx`, such as `cloudflare-notes/index.mdx`. Deeper nested post paths are rejected. Each post must have a unique slug; the content build reports duplicates.

Use `.md` for a normal article. Use `.mdx` when you need JSX, such as a callout or a captioned image.

### Add frontmatter

Every post needs YAML frontmatter at the top of the file. These fields are required:

- `title`: the post title.
- `description`: a short summary used in post listings and metadata.
- `tags`: an array of non-empty tag strings. An empty array is allowed.
- `draft`: a boolean that controls whether the post is public.
- `publishedAt`: a real calendar date in `YYYY-MM-DD` format.

`updatedAt` and `coverImage` are optional. The repository updates `updatedAt` when a committed post is edited. When you set it yourself, use a valid date on or after `publishedAt`. A `coverImage` path points to the image used for the post's cover and social metadata.

For example:

```yaml
---
title: "A post about a useful problem"
description: "What changed, why it mattered, and how the fix works."
tags:
  - Engineering
  - Notes
draft: true
publishedAt: "2026-11-06"
# coverImage: "/images/post-cover.jpg"
---
```

Keep `draft: true` while the post is in progress. A draft stays out of the posts index, homepage, RSS feed, sitemap, and its public route. Change it to `false` when the post is ready to publish.

Use tags that describe the subject. Keep their spelling consistent across posts so the tag list remains useful. Tag matching is case-insensitive, but the original spelling is displayed.

A custom `coverImage` is optional. Without one, the build creates a branded social cover from the title, tags, and publication date. With one, the build crops the supplied image to `1200 × 630` for the cover. Keep the important part of the image near the center so it survives the crop.

## Use Markdown well

The site processes posts with GitHub Flavored Markdown (GFM) and MDX. Leave a blank line between block elements. Markdown is easier to maintain when the source is simple and the formatting has a clear purpose.

### Headings and paragraphs

Use headings to divide the explanation, not to decorate it. Keep the hierarchy in order: `##`, then `###`, then `####` when a fourth level is genuinely needed.

A paragraph should stay with one idea. Split it when the subject changes or when the reader has to hold too many steps in mind. A single sentence can stand alone when it needs emphasis, but a row of one-sentence paragraphs quickly becomes tiring.

### Emphasis, links, and inline code

Use bold for an important term, italics for light emphasis or titles, and strikethrough when showing a correction. Use inline code for filenames, commands, package names, and short code references.

```md
Use **bold** sparingly, _italics_ when useful, and `inline code` for technical names.

See the [TanStack Start documentation](https://tanstack.com/start/latest/docs/framework/react/overview) for the framework details.
```

Prefer descriptive link text over labels such as "click here". GFM also turns a bare URL into a link, but a named link is easier to understand in the middle of a paragraph. For long URLs that appear more than once, use a reference-style link:

```md
The app uses [TanStack Start][tanstack-start].

[tanstack-start]: https://tanstack.com/start/latest/docs/framework/react/overview
```

### Lists

Use a bullet list when several items belong together. Use a numbered list when the order matters, such as a procedure. Keep list items grammatically consistent and put the useful information in the item itself.

Avoid turning every paragraph into a list. If the points need explanation or transitions, write them as prose.

GFM supports task lists too:

```md
- [x] Check the frontmatter
- [ ] Test the links
- [ ] Preview the post
```

The checkboxes are displayed as status markers. They are not interactive controls.

### Tables

Use a table when readers need to compare the same information across several items. Keep the columns short and the number of rows manageable. A table is a poor place for long explanations, and wide tables scroll horizontally on smaller screens.

```md
| Format | Use it for |
| :--- | :--- |
| `**bold**` | A term that needs emphasis |
| `` `code` `` | A command or filename |
| Link | A source or related page |
```

GFM also supports strikethrough, automatic links, and footnotes. Use footnotes for brief supporting details that would interrupt the paragraph, not for information the reader needs in order to follow the main point.

### Quotes and callouts

Use a blockquote for text attributed to someone else. Keep the quote accurate and link to its source when one is available.

For a note that needs visual separation, use the site's `Callout` component in an MDX post:

```mdx
<Callout type="tip" title="Before you run this">
Check that the command points to the right environment.
</Callout>
```

The supported callout types are `note`, `tip`, `warning`, and `danger`. Use a callout when the information deserves attention, such as a warning about data loss or a condition that changes the steps. Ordinary background information belongs in the paragraph.

### Code blocks

Use fenced code blocks for examples that need their own space. Add a language after the opening fence so the site can highlight the code. Supported identifiers include `bash`, `css`, `diff`, `html`, `js`, `json`, `jsx`, `md`, `mdx`, `sh`, `text`, `ts`, `tsx`, and `yaml`. A block without a language is treated as plain text.

```bash
pnpm run content:build
pnpm run check
```

Keep examples focused. Remove unrelated lines, use realistic values, and make sure the example agrees with the surrounding explanation. Mark placeholder values clearly so readers do not mistake them for real credentials, paths, or IDs.

### Images

Use standard Markdown image syntax for an image in the article:

```md
![A diagram showing a request moving from the browser to the Worker](/images/request-flow.png)
```

Put local images in `public/` when you want to reference them with a root path such as `/images/request-flow.png`. A relative path is resolved from the post file. Remote `https` image URLs are also supported.

The build downloads or reads each image and creates optimized versions for the page. A missing local file or an image URL that returns an error can fail the content build, so check the source before publishing. Always write useful alt text. Describe what the image shows or what information it adds; do not repeat the paragraph around it.

The title in standard Markdown image syntax is an HTML title attribute, not a visible caption. Use the site's `PostImage` component when a visible caption is needed:

```mdx
<PostImage
  src="/images/request-flow.png"
  alt="A request moving from the browser to the Worker and then to the API."
  caption="The request path for a signed-in user."
/>
```

`PostImage` also accepts `title`, `className`, `inline`, and `priority` props. Most images can use the defaults.

### Footnotes

A footnote is useful for a short qualification or source detail that would interrupt the main paragraph:

```md
The content is compiled during the build.[^build]

[^build]: The site does not compile post content for each request.
```

Keep essential explanations in the main text. Readers should not have to jump to the bottom of the post to understand a key term or instruction.

## Check the post before publishing

Preview the post locally and read it once from beginning to end. Then check the content and the rendered page separately. A source file can look tidy while a link, image, or code block still fails in the browser.

Run the content build first. It validates the post collection, compiles the Markdown/MDX, checks for duplicate slugs, and processes images.

```bash
pnpm run content:build
pnpm run check
pnpm run test
pnpm run build
```

Use `pnpm run dev` to preview the site locally at `http://localhost:3000`.

Before publishing, check the following:

- [ ] The title describes the actual subject of the post.
- [ ] The opening gives the reader useful context and reaches the point quickly.
- [ ] Each section contributes to the same main question.
- [ ] Technical claims, commands, and examples are accurate.
- [ ] Links lead to the intended pages and images load successfully.
- [ ] Images have alt text, and captions add information rather than repeat it.
- [ ] Headings follow a sensible order. Update any in-page links if a heading changes, because heading IDs are generated from the heading text.
- [ ] The frontmatter contains valid dates and the intended tags.
- [ ] `draft` is `false` when the post is ready to be public.
- [ ] The rendered post is readable on a narrow screen.

Read the opening and the final paragraphs aloud. Remove sentences that repeat a point, add drama without adding information, or sound like they belong in a chatbot response. Keep the details that make the post yours.
