const stripHtml = html => {
  return (html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const createRef = (item, type) => ({
  slug: item.fileSlug,
  title: item.data.title || item.fileSlug,
  url: item.url,
  type,
});

const fallbackRef = (slug, type, prefix) => ({
  slug,
  title: slug,
  url: prefix ? `${prefix}${slug}/` : undefined,
  type,
});

const buildDescription = item => {
  if (!item) return "";
  const description = item.data.description || item.data.summary;
  if (description) return description;
  const text = stripHtml(item.templateContent);
  return text.length > 220 ? `${text.slice(0, 217)}…` : text;
};

module.exports = function () {
  return {
    permalink: "/assets/search-index.json",
    eleventyExcludeFromCollections: true,
    render(data) {
      const memes = data.collections.memes || [];
      const themes = data.collections.themes || [];
      const models = data.collections.papers || [];

      const memeMap = new Map(memes.map(item => [item.fileSlug, createRef(item, "meme")]));
      const themeMap = new Map(themes.map(item => [item.fileSlug, createRef(item, "theme")]));
      const modelMap = new Map(models.map(item => [item.fileSlug, createRef(item, "model")]));

      const getMeme = slug => memeMap.get(slug) || fallbackRef(slug, "meme", "/meme/");
      const getTheme = slug => themeMap.get(slug) || fallbackRef(slug, "theme", "/theme/");
      const getModel = slug => modelMap.get(slug) || fallbackRef(slug, "model", "/model/");

      const entries = [];

      models.forEach(item => {
        const description = buildDescription(item);
        entries.push({
          type: "model",
          slug: item.fileSlug,
          title: item.data.title || item.fileSlug,
          url: item.url,
          description,
          memes: (item.data.memes || []).map(getMeme),
          themes: (item.data.themes || []).map(getTheme),
          ancestors: (item.data.ancestors || []).map(getModel),
          descendants: (item.data.descendants || []).map(getModel),
        });
      });

      memes.forEach(item => {
        const description = buildDescription(item);
        entries.push({
          type: "meme",
          slug: item.fileSlug,
          title: item.data.title || item.fileSlug,
          url: item.url,
          description,
          models: models
            .filter(model => (model.data.memes || []).includes(item.fileSlug))
            .map(getModel),
        });
      });

      themes.forEach(item => {
        const description = buildDescription(item);
        entries.push({
          type: "theme",
          slug: item.fileSlug,
          title: item.data.title || item.fileSlug,
          url: item.url,
          description,
          models: models
            .filter(model => (model.data.themes || []).includes(item.fileSlug))
            .map(getModel),
        });
      });

      return JSON.stringify({ entries }, null, 2);
    },
  };
};
