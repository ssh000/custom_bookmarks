import * as d3 from 'd3';

const zoomMin = -5.0;
const zoomMax = 5.0;

const tree = (data, width, height) => d3.cluster().size([width, height]).nodeSize([20, height])(d3.hierarchy(data));

const getZoom = group => d3.zoom().scaleExtent([zoomMin, zoomMax]).on('zoom', () => group.attr('transform', d3.event.transform));

const isFound = (results, id) => results.find(result => result.id === id);

const width = document.documentElement.clientWidth;
const height = document.documentElement.clientHeight;

export const init = (selector) => {
    const svg = d3.select(selector).append('svg').attr('class', 'svg-container');

    svg
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMinYMin meet');

    const group = svg.append('g');

    group.append('g').attr('class', 'links');

    group.append('g').attr('class', 'nodes');

    return svg;
};

export const update = ({ svg, data, searchResults = [] }) => {
    if (Object.keys(data).length === 0) return;

    const group = svg.select('g');

    const root = tree(data, width, height);

    const links = group
        .select('.links')
        .selectAll('path')
        .data(root.links())
        .enter()
        .append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x));

    const nodes = group
        .select('.nodes')
        .selectAll('g')
        .data(root.descendants(), Math.random);

    const node = nodes
        .enter()
        .append('g')
        .attr('class', 'node')
        .classed('node node--not-found', d => searchResults.length > 0 && !isFound(searchResults, d.data.id))
        .attr('transform', d => `translate(${d.y},${d.x})`);

    links.exit().remove();

    nodes.exit().remove();

    node.append('svg:image')
        .attr('xlink:href', d => `http://www.google.com/s2/favicons?domain=${d.data.url}`)
        .attr('x', '-8px')
        .attr('y', '-8px')
        .attr('width', '16px')
        .attr('height', '16px');

    const href = node.append('a')
        .attr('xlink:href', d => d.data.url)
        .attr('target', '_blank');

    href.append('text')
        .attr('dx', d => (d.children ? -12 : 12))
        .attr('dy', 4)
        .style('text-anchor', d => (d.children ? 'end' : 'start'))
        .text(d => d.data.title)
        .attr('class', 'node__text');

    // Fit diagram to screen
    const bounds = group.node().getBBox();
    const scale = 0.75 / Math.max(bounds.width / width, bounds.height / height);
    const midX = bounds.x + bounds.width / 2;
    const midY = bounds.y + bounds.height / 2;
    const translate = [width / 2 - scale * midX, height / 2 - scale * midY];
    const zoom = getZoom(group);
    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(...translate).scale(scale));
};
