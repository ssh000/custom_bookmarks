"use strict"

const Sifter = require("sifter")

const init = (svgGroup, nodes) => {
  let sifter = new Sifter(nodes)
  let query = ""
  let searchResults = document.querySelector('.search-query')

  window.addEventListener('keypress', (event) => {
    updateQuery(String.fromCharCode(event.keyCode))
  })

  document.body.addEventListener('keydown', (event) => {
    handleTextHotkeys(event)
  })

  document.body.addEventListener('keyup', (event) => {
    filterNodes()
    searchResults.classList.remove('with-placeholder')
    searchResults.innerHTML = query
  })

  const filterNodes = () => {
    let searchResult = sifter.search(query, {
      fields: ['title', 'url']
    })

    let result = _.at(nodes, searchResult.items.map(item => item.id))

    let newNodesIds = result.map(d => d.id)

    let resultNodes = svgGroup.selectAll('g.node')
      .attr('class', 'node')
      .filter(d => {
        return !_.includes(newNodesIds, d.id)
      })

    resultNodes.attr('class', 'node notFound')
  }

  const handleTextHotkeys = (e) => {
    if (_.includes([8, 32], e.keyCode)) e.preventDefault()
    switch (e.keyCode) {
      case 8:
        backspace()
        break
      case 32:
        spacebar()
        break
      case 27:
      case 46:
        clearQuery()
        break
    }
  }

  const updateQuery = (letter) => {
    query += letter
  }

  const clearQuery = () => {
    query = ''
  }

  const spacebar = () => {
    query += " "
  }

  const backspace = () => {
    query = _.join(_.initial(query), '')
  }
}

module.exports = { init }
