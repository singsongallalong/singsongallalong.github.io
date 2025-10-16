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
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });

  eleventyConfig.addFilter("sortByTitle", collection => {
    return [...(collection || [])].sort(byTitle);
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

  // Very small wikilink transform: [[slug]] -> links to meme/theme/model if slug exists
  eleventyConfig.addTransform("wikilinks", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) return content;

    return content.replace(/\[\[([a-z0-9-:]+)\]\]/gi, (match, raw) => {
      const [prefix, slugCandidate] = raw.includes(":")
        ? raw.split(":")
        : [null, raw];
      const slug = slugCandidate.toLowerCase();

      const prefixMap = {
        meme: `/meme/${slug}/`,
        theme: `/theme/${slug}/`,
        model: `/model/${slug}/`,
        paper: `/model/${slug}/`,
      };

      if (prefix && prefixMap[prefix]) {
        return `<a href="${prefixMap[prefix]}">${slug}</a>`;
      }

      // default order: model, meme, theme
      const guesses = [`/model/${slug}/`, `/meme/${slug}/`, `/theme/${slug}/`];
      return `<a href="${guesses[0]}">${slug}</a>`;
    });
  });

  return {
    dir: { input: "content", includes: "../_layouts", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk"],
  };
};
