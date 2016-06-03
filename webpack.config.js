"use strict"

const path = require("path")
const webpack = require("webpack")

const front = ["./src/front"]
const background = ["./src/background"]

const plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.NoErrorsPlugin()
]

let debug = true
let filename = "[name].js"

module.exports = {
  entry: {
    front,
    background
  },
  output: {
    path: path.resolve(__dirname, "build"),
    filename
  },
  debug,
  resolve: {
    extensions: ["", ".js"]
  }
}
