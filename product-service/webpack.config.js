// webpack.config.js
const slsw = require("serverless-webpack");
const path = require("path");

// webpack.config.js
module.exports = {
  context: __dirname,
  mode: slsw.lib.webpack.isLocal ? "development" : "production",
  target: "node",
  entry: slsw.lib.entries,
  devtool: slsw.lib.webpack.isLocal ? "eval-cheap-module-source-map" : "source-map",
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, ".webpack"),
    filename: "[name].js",
  },
  optimization: {
    concatenateModules: false,
  },
  module: {
    rules: [
      {
        exclude: [/node_modules/, /\.(test|spec)\.js/],
        include: __dirname,
        loader: "babel-loader",
        test: /\.jsx?$/,
        options: {
          presets: ["@babel/preset-env"],
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".json"],
    modules: ["node_modules", "bower_components", "shared", "/shared/vendor/modules"],
  },
};
