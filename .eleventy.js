module.exports = function(eleventyConfig) {
  // Images, CSV, scripts et styles copiés tels quels
  eleventyConfig.addPassthroughCopy("data");

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    },
    // Les pages .html sont publiées telles quelles (aucun traitement de gabarit) :
    //   contact.html   -> /contact/
    //   rejoindre.html -> /rejoindre/
    //   Index.html     -> /  (adresse fixée par son en-tête "permalink")
    htmlTemplateEngine: false,
    markdownTemplateEngine: "njk"
  };
};
