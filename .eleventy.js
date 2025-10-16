const md = require("markdown-it")({ html: true, linkify: true })
  .use(require("markdown-it-attrs"));

module.exports = function (eleventyConfig) {
  eleventyConfig.setLibrary("md", md);
  eleventyConfig.addPassthroughCopy({ "assets": "assets" });

  // Collections
  eleventyConfig.addCollection("posts", c => c.getFilteredByGlob("content/posts/**/*.md"));
  eleventyConfig.addCollection("memes", c => c.getFilteredByGlob("content/memes/**/*.md"));
  eleventyConfig.addCollection("themes", c => c.getFilteredByGlob("content/themes/**/*.md"));

  // Very small wikilink transform: [[slug]] -> links to meme/theme/post if slug exists
  eleventyConfig.addTransform("wikilinks", (content, outputPath) => {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    // Replace [[slug]] with /meme/slug or /theme/slug or /post/slug (fall back order)
    return content.replace(/\[\[([a-z0-9-]+)\]\]/gi, (m, slug) => {
      // naive URL guesses; keep simple
      return `<a href="/meme/${slug}/">${slug}</a>`;
    });
  });

  return {
    dir: { input: "content", includes: "../_layouts", output: "_site" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["md", "njk"]
  };
};
