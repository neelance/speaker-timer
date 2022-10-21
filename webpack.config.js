const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    "content-script": "./src/content-script.ts",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            transpileOnly: true,
          },
        },
      },
    ],
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: "src/manifest.json", to: "." },
        { from: "src/icon.png", to: "." },
      ],
    }),
  ],
  output: {
    path: `${__dirname}/dist`,
    filename: "[name].js",
    clean: true,
  },
};
