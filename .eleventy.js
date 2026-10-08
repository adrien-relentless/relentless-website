module.exports = function(eleventyConfig) {
  // Pass through static assets unchanged
  eleventyConfig.addPassthroughCopy("data");
  eleventyConfig.addPassthroughCopy({ "Index.html": "index.html" });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
