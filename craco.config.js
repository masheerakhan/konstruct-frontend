/**
 * Exclude html2pdf.js from source-map-loader to avoid
 * "Failed to parse source map ... es6-promise.map" warning
 * (that package references a missing source map file).
 */
const { getLoaders, loaderByName } = require("@craco/craco");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const { hasFoundAny, matches } = getLoaders(
        webpackConfig,
        loaderByName("source-map-loader")
      );
      if (hasFoundAny && matches.length > 0) {
        matches.forEach((match) => {
          const loader = match.loader;
          const existingExclude = loader.exclude;
          const html2pdfExclude = /node_modules[\\/]html2pdf\.js/;
          loader.exclude = Array.isArray(existingExclude)
            ? [...existingExclude, html2pdfExclude]
            : existingExclude
            ? [existingExclude, html2pdfExclude]
            : html2pdfExclude;
        });
      }
      return webpackConfig;
    },
  },
};
