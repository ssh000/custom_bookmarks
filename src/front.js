"use strict"

const graph = require("./graph")
const search = require("./search")
let selectedType = 'default'
let buttonClassesMapping = {
  default: '.sort-default',
  sorted: '.sort-by-hostname'
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  let options = init(request)
  update(request, selectedType, options)
})

const init = (request) => {
  let zoomMin = 0.1,
      zoomMax = 1.0

  let {scrollWidth, offsetWidth, clientWidth, scrollHeight, offsetHeight, clientHeight} = document.body

  let viewerWidth = _.max([scrollWidth, document.documentElement.scrollWidth,
    offsetWidth, document.documentElement.offsetWidth, clientWidth, document.documentElement.clientWidth])

  let viewerHeight = _.max([scrollHeight, document.documentElement.scrollHeight,
    offsetHeight, document.documentElement.offsetHeight, clientHeight, document.documentElement.clientHeight])

  let zoom = d3.behavior.zoom()
    .scaleExtent([zoomMin, zoomMax])

  let svg = d3.select("#tree-container")
    .append("svg")
    .attr("width", viewerWidth)
    .attr("height", viewerHeight)
    .attr("class", "overlay")
    .call(zoom)

  let svgGroup = svg.append("g")

  let sortDefaultButton = document.querySelector('.sort-default')
  let sortByHostnameButton = document.querySelector('.sort-by-hostname')
  let zoomInButton = document.querySelector('.zoom-in')
  let zoomOutButton = document.querySelector('.zoom-out')

  let options = { width: viewerWidth, height: viewerHeight, svgGroup, zoom, maxLabelLength: request.maxLabelLength, zoomMin, zoomMax }

  zoom.on("zoom", () => svgGroup.attr("transform", `translate(${d3.event.translate}) scale(${d3.event.scale})`))

  sortDefaultButton.addEventListener('click', (event) => update(request, 'default', options))
  sortByHostnameButton.addEventListener('click', (event) => update(request, 'sorted', options))
  zoomInButton.addEventListener('click', (event) => newZoom(options, 'add'))
  zoomOutButton.addEventListener('click', (event) => newZoom(options, 'subtract'))

  return options
}

const newZoom = (options, action) => {
  let scale = _.floor(options.zoom.scale(), 1)
  let viewerCenter = [options.width / 2, options.height / 2]
  let graphOriginalSize = options.svgGroup.node().getBBox()
  let center = [viewerCenter[0] - (graphOriginalSize.width * scale / 2), viewerCenter[1] - (graphOriginalSize.height * scale / 2)]

  let newZoom = _.clamp(_[action](scale, options.zoomMin), options.zoomMin, options.zoomMax)

  options.svgGroup
    .transition()
    .duration(500)
    .attr("transform", `translate(${center[0]},${center[1]}) scale(${newZoom})`)

  options.zoom.scale(newZoom)
  options.zoom.translate([...center])
}

const update = (request, type, options) => {
  selectedType = type

  let activeButton = document.querySelector(buttonClassesMapping[type])
  let buttons =  document.querySelectorAll('.button')

  _.each(buttons, (button) => button.classList.remove('selected'))
  activeButton.classList.add('selected')

  graph.render(request[`${type}Bookmarks`], options)
  search.init(options.svgGroup, request[`${type}Nodes`])
}
