const { DateTime } = require("luxon");

const md = require("markdown-it")({ html: true, linkify: true })
      .use(require("markdown-it-attrs"));

const byTitle = (a, b) => {
    const titleA = (a.data.title || a.fileSlug || "").toLowerCase();
    const titleB = (b.data.title || b.fileSlug || "").toLowerCase();
    if (titleA < titleB) return -1;
    if (titleA > titleB) return 1;
    return 0;
};

const removeIndexEntries = items =>
      (items || []).filter(item => item.fileSlug && item.fileSlug !== "index");

module.exports = function (eleventyConfig) {
    eleventyConfig.setLibrary("md", md);
    eleventyConfig.addPassthroughCopy({ "content/images": "images" });
    eleventyConfig.addPassthroughCopy({ "assets": "assets" });

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

    // add alongside your existing memes/themes/papers
    eleventyConfig.addCollection("concepts", api =>
	api.getFilteredByGlob("content/concepts/**/*.md")
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

    return {
	dir: { input: "content", includes: "../_layouts", output: "_site" },
	markdownTemplateEngine: "njk",
	htmlTemplateEngine: "njk",
	templateFormats: ["md", "njk", "11ty.js"]
    };
};
