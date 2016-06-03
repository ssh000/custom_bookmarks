"use strict"

const _ = require("lodash")

let defaultNodes = []
let sortedNodes = []

chrome.browserAction.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL("bookmarks.html") })
})

chrome.bookmarks.getTree((itemTree) => {
  itemTree.forEach((item) => processNode(item, defaultNodes))
  let defaultBookmarks = _.first(itemTree)
  let children = groupNodesByHost(defaultNodes)
  children.forEach((item) => processNode(item, sortedNodes))

  let sortedBookmarks = { id: 0, title: '', children }

  let maxLabelLength = _.last(_.sortBy(defaultNodes, node => node.title.length)).title.length

  chrome.runtime.sendMessage({sortedNodes, sortedBookmarks, defaultNodes, defaultBookmarks, maxLabelLength})
})

const groupNodesByHost = (nodes) => {
  let nodeIds = _.map(nodes, (item) => _.toInteger(item.id)).sort((a, b) => a - b)
  let groupedByHost = _.groupBy(nodes, (node) => getItemName(node))

  return _.compact(_.map(groupedByHost, (nodes, title) => {
    let fakeId = getFakeId(nodeIds)
    if(_.includes(['folders'], title)) return
    if(nodes.length > 1) {
      return { id: fakeId, title, children: nodes }
    } else {
      return { id: fakeId, title: _.first(nodes).title, url: _.first(nodes).url }
    }
  }))
}

const getFakeId = (ids) => {
  let id = _.last(ids)
  ids.push(id += 1)
  return id
}

const getItemName = (node) => {
  if(!node.url) return 'folders'
  if(node.url.match(/file:\/\//)) return 'files'
  if(node.url.match(/https?:\/\//)) return new URL(node.url).host
  return 'unknown'
}

const processNode = (node, nodes) => {
  if(node.children) node.children.forEach((child) => processNode(child, nodes))
  nodes.push(node)
}
