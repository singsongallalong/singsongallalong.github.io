const { DateTime } = require("luxon");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const evidenceStore = [];
globalThis.evidenceStore = evidenceStore; // <-- add this line

const md = require("markdown-it")({ html: true, linkify: true })
  .use(require("markdown-it-attrs"))
  .use((md) => {
    // Wrap all blockquotes with a default .quote class
    const originalRender = md.renderer.rules.blockquote_open || function(tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

    md.renderer.rules.blockquote_open = function (tokens, idx, options, env, self) {
      tokens[idx].attrJoin("class", "quote");
      return originalRender(tokens, idx, options, env, self);
    };
  });

const removeIndexEntries = items =>
      (items || []).filter(item => item.fileSlug && item.fileSlug !== "index");


function stripHtml(html = "") {
  return String(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function enhanceEvidenceHtml(html) {
  // add lazy-loading etc. to all images
  html = html.replace(/<img\s+([^>]*?)>/gi, (m, attrs) => {
    let a = attrs;
    if (!/\bloading=/.test(a))  a += ' loading="lazy"';
    if (!/\bdecoding=/.test(a)) a += ' decoding="async"';
    if (!/\bclass=/.test(a))    a += ' class="evidence-img"';
    return `<img ${a}>`;
  });

  // convert bare images with a title attribute into <figure>
  // (markdown: ![alt](src "Caption") -> title="Caption")
  html = html.replace(
    /^(?:\s*<p>)?\s*<img([^>]*?)title="([^"]+)"([^>]*?)>\s*(?:<\/p>)?$/i,
    (_m, pre, caption, post) =>
      `<figure class="evidence-figure"><img ${pre} ${post}><figcaption>${caption}</figcaption></figure>`
  );

  return html;
}

module.exports = function (eleventyConfig) {
    eleventyConfig.setLibrary("md", md);
    eleventyConfig.addPassthroughCopy({ "content/images": "images" });
    eleventyConfig.addPassthroughCopy({ "assets": "assets" });
    eleventyConfig.addGlobalData("evidenceStore", evidenceStore);

    eleventyConfig.addPlugin(syntaxHighlight);

    eleventyConfig.addFilter("sortByTitle", collection => {
	return [...(collection || [])].sort(byTitle);
    });

    eleventyConfig.addFilter("sortByDateDesc", (items = []) => {
	const norm = (it) => {
	    // prefer Eleventy’s computed item.date, then page.date, then front-matter date
	    const d =
		  (it && it.date) ||
		  (it && it.data && it.data.page && it.data.page.date) ||
		  (it && it.data && it.data.date) ||
		  0;
	    // Already a Date? keep it; else try to parse.
	    return d instanceof Date ? d : new Date(d || 0);
	};
	return [...items].sort((a, b) => norm(b) - norm(a));
    });

    // Sort plain objects of shape {date, ...}, newest first (used in What's new)
    eleventyConfig.addFilter("sortByDateDescMixed", (arr = []) => {
	return [...arr].sort((a, b) => {
	    const da = a.date instanceof Date ? a.date : new Date(a.date || 0);
	    const db = b.date instanceof Date ? b.date : new Date(b.date || 0);
	    return db - da;
	});
    });

    eleventyConfig.addFilter("filterByConcept", (collection, slug) => {
	return (collection || []).filter(item =>
	    (item.data.concepts || []).includes(slug)
	);
    });

    eleventyConfig.addFilter("date", (value, fmt = "yyyy-LL-dd") => {
	// value can be a Date or a string; normalize
	const dt = value instanceof Date ? DateTime.fromJSDate(value) : DateTime.fromISO(String(value));
	return dt.isValid ? dt.toFormat(fmt) : String(value);
    });

    eleventyConfig.addFilter("findByFileSlug", (collection, slug) => {
	return (collection || []).find(item => item.fileSlug === slug);
    });

    eleventyConfig.addFilter("filterByMeme", (collection, slug) => {
	return (collection || []).filter(item =>
	    (item.data.memes || []).includes(slug)
	);
    });

    eleventyConfig.addFilter("filterByTheme", (collection, slug) => {
	return (collection || []).filter(item =>
	    (item.data.themes || []).includes(slug)
	);
    });

    eleventyConfig.addFilter("evidenceFor", (slug) =>
	evidenceStore.filter(e => e.hypothesis === String(slug).toLowerCase())
    );

    // Collections
    eleventyConfig.addCollection("papers", collectionApi =>
	removeIndexEntries(
	    collectionApi.getFilteredByGlob("content/papers/**/*.md")
	).sort(byTitle)
    );

    eleventyConfig.addCollection("memes", collectionApi =>
	removeIndexEntries(
	    collectionApi.getFilteredByGlob("content/memes/**/*.md")
	).sort(byTitle)
    );

    eleventyConfig.addCollection("themes", collectionApi =>
	removeIndexEntries(
	    collectionApi.getFilteredByGlob("content/themes/**/*.md")
	).sort(byTitle)
    );
    
    eleventyConfig.addCollection("concepts", api =>
	api.getFilteredByGlob("content/concepts/**/*.md")
    );

    eleventyConfig.addCollection("hypotheses", (api) =>
	api.getFilteredByGlob("content/hypotheses/**/*.md")
    );

    // helpers
    eleventyConfig.addFilter("filterMemesByConcept", (memes, conceptSlug) => {
	const s = String(conceptSlug).toLowerCase();
	return (memes || []).filter(m =>
	    (m.data.concepts || []).map(x => String(x).toLowerCase().trim()).includes(s)
	);
    });

    eleventyConfig.addFilter("findBySlug", (items, slug) =>
	(items || []).find(i => i.fileSlug === slug)
    );

    eleventyConfig.addTransform("wikilinks", (content, outputPath) => {
	if (typeof content !== "string") return content;
	if (!outputPath || !outputPath.endsWith(".html")) return content;

	// [[meme:Slug-Here|Display Text]]
	// [[Slug-Here|Display Text]]
	// [[Slug-Here]]
	const WIKILINK_RE = /\[\[(?:([A-Za-z]+):)?([^\]\|]+?)(?:\|([^\]]+))?\]\]/g;

	const prefixMap = {
	    meme:  (slug) => `/meme/${slug}/`,
	    theme: (slug) => `/theme/${slug}/`,
	    concept: (slug) => `/concept/${slug}/`,
	    model: (slug) => `/model/${slug}/`,
	    paper: (slug) => `/model/${slug}/`,
	    hypothesis: (slug) => `/hypothesis/${slug}/`,
	};

	const escapeHtml = (s) =>
	      String(s)
	      .replace(/&/g, "&amp;")
	      .replace(/</g, "&lt;")
	      .replace(/>/g, "&gt;")
	      .replace(/"/g, "&quot;")
	      .replace(/'/g, "&#39;");

	return content.replace(WIKILINK_RE, (_m, prefixRaw, slugCandidateRaw, aliasRaw) => {
	    // What the author typed (preserve casing/spaces for display if no alias)
	    const typed = (slugCandidateRaw || "").trim();
	    const display = (aliasRaw && aliasRaw.trim()) || typed;

	    // Normalize slug for the URL (lowercase; collapse spaces to hyphens if you want)
	    const normalizedSlug = typed.toLowerCase(); // or: typed.toLowerCase().replace(/\s+/g, "-")

	    // Route by prefix if provided, else use your default guess order
	    const prefix = (prefixRaw || "").toLowerCase();
	    let href;
	    if (prefix && prefixMap[prefix]) {
		href = prefixMap[prefix](normalizedSlug);
	    } else {
		// default order: model, meme, theme (keep your original order)
		href = `/meme/${normalizedSlug}/`;
		// If you later want smarter guessing, switch to a shortcode (has collections)
	    }

	    return `<a href="${href}">${escapeHtml(display)}</a>`;
	});
    });

    eleventyConfig.addPairedShortcode("evidence", function (content, slugs, opts = {}) {
	const page = this.page || {};
	const ids = (Array.isArray(slugs) ? slugs : String(slugs || ""))
	      .split(",")
	      .map(s => s.trim().toLowerCase())
	      .filter(Boolean);

	const id = opts.id ||
	      `ev-${(page.fileSlug || "p")}-${ids[0] || "h"}-${Math.random().toString(36).slice(2, 8)}`;

	// Render inner Markdown to HTML, then enhance images
	const innerHtml = md.render(content.trim());
	const quoteHtml = enhanceEvidenceHtml(innerHtml);

	// Plain-text excerpt for search / summaries
	const excerpt = stripHtml(quoteHtml);
	const weight  = Number(opts.weight || 1) || 1;
	const note    = String(opts.note || "");

	for (const h of ids) {
	    evidenceStore.push({
		hypothesis: h,
		pageUrl: page.url,
		pageTitle: (page.data && page.data.title) || page.fileSlug || page.inputPath,
		anchor: `#${id}`,
		id,
		quoteHtml,
		excerpt: excerpt.length > 280 ? `${excerpt.slice(0, 277)}…` : excerpt,
		weight,
		note,
	    });
	}

	return `
<blockquote id="${id}" class="evidence" data-hypotheses="${ids.join(",")}"${note ? ` data-note="${note}"` : ""}>
  ${quoteHtml}
</blockquote>`;
    });

    return {
	dir: { input: "content", includes: "../_layouts", output: "_site" },
	markdownTemplateEngine: "njk",
	htmlTemplateEngine: "njk",
	templateFormats: ["md", "njk", "11ty.js"]
    };
};
