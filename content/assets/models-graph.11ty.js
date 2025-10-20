// content/assets/models-graph.11ty.js
const slugify = s => String(s || "").trim().toLowerCase();

module.exports = class {
  data() {
    return { permalink: "/assets/models-graph.json", eleventyExcludeFromCollections: true };
  }

  render(data) {
    const models = Array.isArray(data.collections?.papers) ? data.collections.papers : [];

    const nodeMap = new Map();
    for (const it of models) {
      nodeMap.set(it.fileSlug, {
        id: it.fileSlug,
        label: it.data?.title || it.fileSlug,
        url: it.url,
        date: it.data?.date || null,
        // add tags:
        memes:  (it.data?.memes  || []).map(slugify),
        themes: (it.data?.themes || []).map(slugify),
        stub: false,
      });
    }

    const edges = [];
    for (const it of models) {
      const me = it.fileSlug;
      const ancestors = Array.isArray(it.data?.ancestors) ? it.data.ancestors : [];
      for (const aRaw of ancestors) {
        const a = slugify(aRaw);
        if (!nodeMap.has(a)) {
          nodeMap.set(a, { id: a, label: a, url: `/model/${a}/`, date: null, memes: [], themes: [], stub: true });
        }
        edges.push({ source: a, target: me, kind: "ancestor" });
      }
    }

    return JSON.stringify({ nodes: [...nodeMap.values()], edges }, null, 2);
  }
};
