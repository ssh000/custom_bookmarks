"use strict"

const _ = require("lodash")
const d3 = require("d3")

const render = (data, options) => {
  let levelWidth = [1],
      pixelsPerLine = 25

  const childCount = (level, node) => {
    if (node.children && node.children.length > 0) {
      if (levelWidth.length <= level + 1) levelWidth.push(0)

      levelWidth[level + 1] += node.children.length
      node.children.forEach(n => childCount(level + 1, n))
    }
  }

  const calculateScale = (elementBBox) => {
    let newScale = (_.floor((options.height / elementBBox.height * 100) / 100, 1))
    return _.clamp(newScale, options.zoomMin, options.zoomMax)
  }

  const centerGraph = () => {
    let viewerCenter = [options.width / 2, options.height / 2]
    let graph = d3.select('g')
    let graphOriginalSize = graph.node().getBBox()
    let scale = calculateScale(graphOriginalSize)
    let center = [viewerCenter[0] - (graphOriginalSize.width * scale / 2), viewerCenter[1] - (graphOriginalSize.height * scale / 2)]

    graph
      .transition()
      .duration(750)
      .attr("transform", `translate(${center[0]},${center[1]}) scale(${scale})`)

    options.zoom.scale(scale)
    options.zoom.translate([...center])
  }

  const update = (data) => {
    let newHeight = d3.max(levelWidth) * pixelsPerLine
    let diagonal = d3.svg.diagonal().projection(d => [d.y, d.x])
    let tree = d3.layout.tree().size([newHeight, options.width])
    let nodes = tree.nodes(data),
        links = tree.links(nodes)

    let link = options.svgGroup.selectAll(".link")
      .data(links, d => Math.random())

    nodes.forEach((d) => d.y = d.depth * (options.maxLabelLength * 2))

    link
      .enter().append("path")
      .attr("class", "link")
      .attr("d", diagonal)

    let node = options.svgGroup.selectAll(".node")
      .data(nodes, d => Math.random())

    node
      .enter()
      .append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.y},${d.x})`)

    node
      .exit().remove()

    link
      .exit().remove()

    node.append("svg:image")
      .attr("xlink:href", d => `http://www.google.com/s2/favicons?domain=${d.url}`)
      .attr("x", "-8px")
      .attr("y", "-8px")
      .attr("width", "16px")
      .attr("height", "16px")

    node.append('a')
      .attr('xlink:href', d => d.url)
      .attr('target', '_blank')
      .append("text")
      .attr("dx", (d) => d.children ? -12 : 12 )
      .attr("dy", 3)
      .style("text-anchor", d => d.children ? "end" : "start")
      .text(d => d.title)
  }

  childCount(0, data)
  update(data)
  centerGraph()
}

module.exports = { render }
