const path = require("path");
const webpack = require("webpack");

const SRC_DIR = path.join(__dirname, "client/src");
const DIST_DIR = path.join(__dirname, "client/dist");

var config = {
  entry: SRC_DIR + "/index.jsx",
  output: {
    path: DIST_DIR,
    filename: 'bundle.js'
  },
  module : {
  	loaders : [
        {
            test: /\.jsx?$/,
            loaders: ["react-hot", "babel"],
            include: path.join(SRC_DIR) 
        },
        {
            test: /\.css$/,
            loader: "style-loader!css-loader"
        }
  	]
  }
};

module.exports = config;