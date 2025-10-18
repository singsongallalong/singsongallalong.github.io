// content/assets/search-index.11ty.js

const stripHtml = (html) =>
      (html || "")
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

// Turn a collection item into a plain JSON-safe ref
function toRef(item, type) {
    return {
	slug: String(item.fileSlug || ""),
	title: String(item.data?.title || item.fileSlug || ""),
	url: String(item.url || ""),
	type: String(type || ""),
    };
}

function fallbackRef(slug, type, prefix) {
    slug = String(slug || "");
    return {
	slug,
	title: slug,
	url: prefix ? `${prefix}${slug}/` : "",
	type: String(type || ""),
    };
}

// Build a short text description—always a string
function buildDescription(item) {
    const d = item?.data;
    if (typeof d?.description === "string" && d.description.trim()) return d.description.trim();
    if (typeof d?.summary === "string" && d.summary.trim()) return d.summary.trim();
    const text = stripHtml(String(item?.templateContent || ""));
    return text.length > 220 ? `${text.slice(0, 217)}…` : text;
}

module.exports = class {
    data() {
	// Using a function for permalink is robust in Eleventy v3
	return {
	    permalink: () => "/assets/search-index.json",
	    eleventyExcludeFromCollections: true,
	};
    }

    render(data) {
	// 1) Pull the raw collections (arrays of Eleventy items)
	const rawMemes  = Array.isArray(data.collections?.memes)  ? data.collections.memes  : [];
	const rawThemes = Array.isArray(data.collections?.themes) ? data.collections.themes : [];
	const rawModels = Array.isArray(data.collections?.papers) ? data.collections.papers : [];
	const rawConcepts = Array.isArray(data.collections?.concepts) ? data.collections.concepts : [];
	const rawHypotheses = Array.isArray(data.collections?.hypotheses) ? data.collections.hypotheses : [];


	// 2) Project everything to plain, serializable refs and plain metadata
	const memes = rawMemes.map(it => ({
	    ref: toRef(it, "meme"),
	    fileSlug: String(it.fileSlug || ""),
	    description: buildDescription(it),
	}));

	const themes = rawThemes.map(it => ({
	    ref: toRef(it, "theme"),
	    fileSlug: String(it.fileSlug || ""),
	    description: buildDescription(it),
	}));

	const models = rawModels.map(it => ({
	    ref: toRef(it, "model"),
	    fileSlug: String(it.fileSlug || ""),
	    description: buildDescription(it),
	    memes:  Array.isArray(it.data?.memes)  ? it.data.memes.map(s => String(s).toLowerCase().trim())  : [],
	    themes: Array.isArray(it.data?.themes) ? it.data.themes.map(s => String(s).toLowerCase().trim()) : [],
	    ancestors: Array.isArray(it.data?.ancestors) ? it.data.ancestors.map(s => String(s)) : [],
	    descendants: Array.isArray(it.data?.descendants) ? it.data.descendants.map(s => String(s)) : [],
	}));

	const concepts = rawConcepts.map(it => ({
	    ref: { slug: it.fileSlug, title: it.data?.title || it.fileSlug, url: it.url, type: "concept" },
	    fileSlug: it.fileSlug,
	    description: it.data?.description || "",
	    parents: (it.data?.parents || []).map(s => String(s).toLowerCase().trim()),
	}));

	// 3) Lookup maps (plain)
	const memeMap  = new Map(memes.map(m  => [m.fileSlug,  m.ref]));
	const themeMap = new Map(themes.map(t => [t.fileSlug, t.ref]));
	const modelMap = new Map(models.map(m => [m.fileSlug,  m.ref]));
	const conceptMap = new Map(concepts.map(c => [c.fileSlug, c.ref]));

	const getMeme  = slug => memeMap.get(String(slug))  || fallbackRef(slug, "meme",  "/meme/");
	const getTheme = slug => themeMap.get(String(slug)) || fallbackRef(slug, "theme", "/theme/");
	const getModel = slug => modelMap.get(String(slug)) || fallbackRef(slug, "model", "/model/");
	const getConcept = slug => conceptMap.get(String(slug)) || { slug, title: slug, url: `/concept/${slug}/`, type: "concept" };
	

	// 4) Build entries (all plain JSON)
	const entries = [];

	// models → entry
	for (const m of models) {
	    entries.push({
		type: "model",
		slug: m.ref.slug,
		title: m.ref.title,
		url: m.ref.url,
		description: m.description,
		memes: m.memes.map(getMeme),
		themes: m.themes.map(getTheme),
		ancestors: m.ancestors.map(getModel),
		descendants: m.descendants.map(getModel),
	    });
	}

	// memes → entry (with models referencing them)
	for (const mem of memes) {
	    const usedBy = models
		  .filter(md => md.memes.includes(mem.fileSlug))
		  .map(md => getModel(md.fileSlug));
	    entries.push({
		type: "meme",
		slug: mem.ref.slug,
		title: mem.ref.title,
		url: mem.ref.url,
		description: mem.description,
		models: usedBy,
	    });
	}

	// themes → entry (with models referencing them)
	for (const th of themes) {
	    const usedBy = models
		  .filter(md => md.themes.includes(th.fileSlug))
		  .map(md => getModel(md.fileSlug));
	    entries.push({
		type: "theme",
		slug: th.ref.slug,
		title: th.ref.title,
		url: th.ref.url,
		description: th.description,
		models: usedBy,
	    });
	}

	// add concept entries
	for (const c of concepts) {
	    // collect children (optional)
	    const childSlugs = concepts.filter(x => x.parents.includes(c.fileSlug)).map(x => x.fileSlug);
	    entries.push({
		type: "concept",
		slug: c.ref.slug,
		title: c.ref.title,
		url: c.ref.url,
		description: c.description,
		parents: c.parents.map(getConcept),
		children: childSlugs.map(getConcept),
		// memes under this concept:
		memes: (data.collections?.memes || [])
		    .filter(m => (m.data?.concepts || []).map(s => String(s).toLowerCase().trim()).includes(c.fileSlug))
		    .map(m => ({ slug: m.fileSlug, title: m.data?.title || m.fileSlug, url: m.url, type: "meme" })),
	    });
	}

	for (const it of rawHypotheses) {
	    const title = (it.data?.title || it.fileSlug);
	    entries.push({
		type: "hypothesis",
		slug: it.fileSlug,
		title,
		url: it.url,
		description: (it.data?.description || "").trim(),
		// (optional) models: [], // you can prefill later if you want “Models:” chips
	    });
	}

	// 5) Return a string (not an object)
	return JSON.stringify({ entries }, null, 2);
    }
};
