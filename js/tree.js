import { w, h, padding, red, yellow, green, addSelectionHeading, getCommonName } from "./common.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";

var treeYearSelect = document.getElementById("treeYearSelection").value;

var treeJson;

var treeSvg;

var treeHierarchy
var treeColor;
var treeOpacity;

//Waste Per Capita vs Total Selector
d3.select("#treeYearSelection")
    .on("change", function () {
        treeYearSelect = this.value;
        treeVisUpdate();
    });

export function createTree() {
    treeSvg = d3.select("#treeChart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    d3.json("tree.json")
        .then(function (data) {
            treeJson = data;
            treeVis();
        });
}

function treeOpacitySet() {
    // And a opacity scale	----------------------------------------------------------------- need to fix
    treeOpacity = d3.scaleLinear()
        .domain(d3.extent(treeHierarchy.leaves(), (d) => d.data.value))
        //.domain([10, 30])
        .range([1, 1]);
}


//https://www.d3-graph-gallery.com/graph/treemap_custom.html
function treeVis() {

    treeSvg.append("g")
        .attr("transform", `translate(${padding}, ${padding}`);

    // Then d3.treemap computes the position of each element of the hierarchy
    treeGetTreeData();

    // prepare a color scale
    treeColor = d3.scaleOrdinal()
        .domain(["landFill", "recyclingWastage", "recyclingProcessed", "gardenWastage", "gardenProcessed"])
        .range([red[4], yellow[8], yellow[4], green[8], green[4]]);

    treeOpacitySet();

    // use this information to add rectangles:
    treeSvg.selectAll("rect")
        .data(treeHierarchy.leaves())
        .enter()
        .append("rect")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("height", (d) => d.y1 - d.y0)
        .style("stroke", "black")
        .style("fill", (d) => treeColor(d.parent.data.name))
        .style("opacity", (d) => treeOpacity(d.data.value))
        .on("mouseover", function (event, d) {
            d3.select(this)
                .style("fill", "orange")
                .append("title")
                .text((d) => `This Value is ${d.data.name} ${d.data.value}`);

            addSelectionHeading(treeSvg, treeHierarchy.leaves()[d]?.data.name, treeHierarchy.leaves()[d]?.data.value);
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .style("fill", (d) => treeColor(d.parent.data.name))
            d3.selectAll("#treeChart .SVGText").remove();
        });

    treeText();
}

function treeText() {
    // Add title for the 3 groups
    treeSvg.selectAll("titles")
        .data(treeHierarchy.descendants().filter((d) => d.depth == 1))
        .enter()
        .append("text")
        .attr("class", "titles")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0 + 21)
        .text((d) => getCommonName(d.data.name))
        .attr("font-size", "19px")
        .attr("fill", "black");
}

function treeGetTreeData() {
    treeHierarchy = d3.hierarchy(treeJson.children[+treeYearSelect]).sum((d) => d.value);

    d3.treemap()
        .size([w, h])
        .paddingTop(50)
        .paddingRight(7)
        .paddingInner(3)      // Padding between each rectangle
        //.paddingOuter(6)
        //.padding(20)
        (treeHierarchy);
}

function treeVisUpdate() {
    treeGetTreeData();

    var values = treeSvg.selectAll("rect")
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
        .style("opacity", (d) => treeOpacity(d.data.value));

    d3.selectAll(".titles").remove();

    treeText();
}