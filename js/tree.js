import { width, height, padding, addSelectionHeading, removeSelectionHeading, getCommonName, createSvgCanvas, getCategoryColour } from "./common.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var json;
var svg;
var treeHierarchy

//Waste Per Capita vs Total Selector
const treeYearSelection = document.getElementById("treeYearSelection");
treeYearSelection.onchange = treeVis;

export async function createTree() {
    json = await d3.json("tree.json")
    svg = createSvgCanvas(d3, "treeChart");
    treeVis();
}


function treeGetTreeData() {
    treeHierarchy = d3.hierarchy(json.children[treeYearSelection.value])
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

function treeVis() {
    treeGetTreeData();

    svg.selectAll("rect")
        .data(treeHierarchy.leaves())
        .join(
            function (enter) {
                var rect = enter
                    .append("rect")
                    .attr("class", "shape");

                rect.append("title")
                return rect;
            },
        )
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("fill", (d) => getCategoryColour(d.parent.data.name))
        .select("title")
        .text((d) => `This Value is ${d.data.name} ${d.data.value} Tonnes`);;

    d3.selectAll(".titles").remove();

    svg.selectAll("titles")
        .data(treeHierarchy.descendants().filter((d) => d.depth == 1))
        .join(
            function (enter) {
                var title = enter
                    .append("text")
                    .attr("class", "titles")

                return title;
            },
        )
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0 + 21)
        .text((d) => getCommonName(d.data.name))
}