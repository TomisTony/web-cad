// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

module.exports = function override(config, env) {
  config.resolve = {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  };
  return config;
};
