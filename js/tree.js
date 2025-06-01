import { width, height, padding, addSelectionHeading, removeSelectionHeading, getCommonName, createSvgCanvas, getCategoryColour } from "./common.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";

var treeJson;

var svg;

var treeHierarchy
var treeColor;

//Waste Per Capita vs Total Selector
document.getElementById("treeYearSelection")
    .onchange = treeVisUpdate;

export function createTree() {
    svg = createSvgCanvas(d3, "treeChart");

    d3.json("tree.json")
        .then(function (data) {
            treeJson = data;
            treeVis();
        });
}

//https://www.d3-graph-gallery.com/graph/treemap_custom.html
function treeVis() {
    // Then d3.treemap computes the position of each element of the hierarchy
    treeGetTreeData("2009-2010");

    // use this information to add rectangles:
    svg.selectAll("rect")
        .data(treeHierarchy.leaves())
        .enter()
        .append("rect")
        .attr("class", "shape")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("fill", (d) => getCategoryColour(d.parent.data.name))
        .on("mouseover", function (event, d) {
            addSelectionHeading(svg, treeHierarchy.leaves()[d]?.data.name, treeHierarchy.leaves()[d]?.data.value);
        })
        .on("mouseout", function (event, d) {
            removeSelectionHeading();
        })
        .append("title")
        .text((d) => `This Value is ${d.data.name} ${d.data.value} Tonnes`);

    treeText();
}

function treeText() {
    // Add title for the 3 groups
    svg.selectAll("titles")
        .data(treeHierarchy.descendants().filter((d) => d.depth == 1))
        .enter()
        .append("text")
        .attr("class", "titles")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0 + 21)
        .text((d) => getCommonName(d.data.name))
}

function treeGetTreeData(event) {
    treeHierarchy = d3.hierarchy(treeJson.children[+event.target.value])
        .sum((d) => d.value);

    d3.treemap()
        .size([width, height])
        .paddingTop(50)
        .paddingRight(7)
        .paddingInner(3)      // Padding between each rectangle
        //.paddingOuter(6)
        //.padding(20)
        (treeHierarchy);
}

function treeVisUpdate(event) {
    treeGetTreeData(event);

    var values = svg.selectAll("rect")
        .data(treeHierarchy.leaves());

    values.enter()
        .append("rect")
        .merge(values)
        .transition()
        .duration(50)
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("fill", (d) => treeColor(d.parent.data.name))

    d3.selectAll(".titles").remove();

    treeText();
}