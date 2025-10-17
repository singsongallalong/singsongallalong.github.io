// content/_data/concepts.js
module.exports = (data) => {
  const raw = Array.isArray(data.collections?.concepts) ? data.collections.concepts : [];

  const concepts = raw.map(item => ({
    slug: item.fileSlug,
    title: item.data?.title || item.fileSlug,
    url: item.url,
    parents: (item.data?.parents || []).map(s => String(s).toLowerCase().trim()),
    description: item.data?.description || "",
  }));

  // index by slug
  const bySlug = new Map(concepts.map(c => [c.slug, c]));

  // compute children map
  const children = new Map(concepts.map(c => [c.slug, []]));
  for (const c of concepts) {
    for (const p of c.parents) {
      if (!children.has(p)) children.set(p, []);
      children.get(p).push(c.slug);
    }
  }

  // helper: ancestors (simple upward walk)
  function ancestorsOf(slug, seen = new Set()) {
    if (seen.has(slug)) return [];
    seen.add(slug);
    const node = bySlug.get(slug);
    if (!node) return [];
    const parents = node.parents || [];
    return [...parents, ...parents.flatMap(p => ancestorsOf(p, seen))];
  }

  // helper: breadcrumbs (first parent chain if multiple)
  function breadcrumb(slug, chain = []) {
    const node = bySlug.get(slug);
    if (!node || !node.parents?.length) return chain.concat(slug);
    // choose the first parent deterministically (alphabetical)
    const parent = [...node.parents].sort()[0];
    return breadcrumb(parent, chain).concat(slug);
  }

  return {
    conceptsAll: concepts,           // array of {slug,title,url,parents,description}
    conceptsBySlug: Object.fromEntries(bySlug),  // POJO for templates
    conceptChildren: Object.fromEntries(children),
    conceptAncestors: Object.fromEntries(
      concepts.map(c => [c.slug, ancestorsOf(c.slug)])
    ),
    conceptBreadcrumbs: Object.fromEntries(
      concepts.map(c => [c.slug, breadcrumb(c.slug)])
    ),
  };
};
