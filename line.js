import { w, h, padding, red, green, yellow } from "./const.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";

var lineWasteModifier = document.getElementById("lineWasteModifier");
//var lineWasteType = d3.select('input[name="lineWasteType"]:checked').node().value; 

var lineCsv;
var lineJson;

var lineSvg;

var lineXScale;
var lineYScale;
var lineYAxis;
var lineXAxis;

var lineLGA;

//Waste Per Capita vs Total Selector
d3.select("#lineWasteModifier")
    .on("change", () => lineVisUpdate());

//Waste Category Update
d3.selectAll('input[name="lineWasteType"]')
    .on("change", () => lineVisUpdate());


export function createLine() {
    d3.csv("linev2.csv")
        .then(function (data) {
            lineCsv = data;
            lineJson = d3.nest()
                .key((d) => d.Type)
                .entries(lineCsv);

            lineVis()
        })
}


function lineGetXScale() {
    lineXScale = d3.scaleLinear()
        .domain(d3.extent(lineCsv, (d) => d.Reference_Year))
        .range([padding, w]);

    lineXAxis = d3.axisBottom()
        .ticks(5)
        .scale(lineXScale);

    lineSvg.append("g")
        .attr("transform", "translate(0, " + (h - padding) + ")")
        .call(lineXAxis);
}

function lineGetYScale() {
    lineYScale = d3.scaleLinear()
        .domain([0, d3.max(lineCsv, (d) => lineCheckedThing(d) * 1.5)])
        .range([h - padding, 0]);

    lineYAxis = d3.axisRight()
        .ticks(5)
        .scale(lineYScale);

    lineSvg.append("g")
        .attr("class", "yAxis")
        .attr("transform", "translate(" + padding + "," + 0 + ")")
        .call(lineYAxis);
}

function lineGetColor(d) {
    switch (d) {
        case "gardenTotal":
            return green[8];
        case "gardenProcessed":
            return green[4];
        case "recyclingTotal":
            return yellow[8];
        case "recyclingProcessed":
            return yellow[4];
        case "landFill":
            return red[4];
        case "Wastage":
            return red[8];
        default:
            return "black";
    }
}


function lineVis() {
    lineSvg = d3.select("#lineChart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    lineGetXScale();

    lineGetYScale();

    lineLGA = lineJson.map((d) => d.key)

    //closest x to mouse??
    /*
    var bisect = d3.bisector((d) => d.x).left;
    
    var focusText = lineSvg
        .append('g')
        .append('text')
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle")
    */
    lineDraw();

    //rect to find mouse position
    /*
    lineSvg
        .append('rect')
        .style("fill", "none")
        .style("pointer-events", "all")
        .attr('width', width)
        .attr('height', height)
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseout', mouseout);
*/
}

function lineDraw() {
    // Draw the line
    lineSvg.selectAll(".line")
        .data(lineJson)
        .enter()
        .append("path")
        .attr("fill", "none")
        .attr("stroke", (d) => lineGetColor(d.key))
        .attr("stroke-width", 5)
        .attr("class", "line")
        .attr("d", (d) =>
            d3.line()
                .x((d) => lineXScale(d.Reference_Year))
                .y((d) => lineYScale(lineCheckedThing(d)))
                (d.values)
        )
        .on("mouseover", function (event, d) {
            var object = d3.select(this);

            d3.select(this)
                .attr("stroke", "orange")
                .attr("stroke-width", 10)
                .append("title")
                .text((d) => lineCategories(d.key));

            lineSvg.append("text")
                .attr("class", "lineText SVGText SVGHeading")
                .attr("x", 650)
                .attr("y", 40)
                .attr("textLength", "550px")
                .text(lineCategories(lineJson[d].key) /*eval("lineJson[d].values[0]." + lineWasteType)*/);
            lineSvg.append("text")
                .attr("class", "lineText SVGText")
                .attr("x", 700)
                .attr("y", 60)
                .attr("dy", "0em")
                .text(`${lineJson[d].values[0].Value} Tonnes`);
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .attr("stroke", lineGetColor(lineJson[d].key))
                .attr("stroke-width", 5);
            d3.selectAll(".lineText").remove();
        });
}

function lineCategories(category) {
    switch (category) {
        case "landFill":
            return "Land Fill";

        case "recyclingProcessed":
            return "Recycling Processed";

        case "gardenProcessed":
            return "Garden Waste Processed";

        case "recyclingTotal":
            return "Recycling Total";

        case "gardenTotal":
            return "Garden Waste Total";

        case "Wastage":
            return "Recycling/Garden Wastage";
    }
}

function lineCheckedThing(d) {
    if (lineWasteModifier.checked)
        return +d.Value /*+eval("d." + lineWasteType)*/ / +d.Estimated_Adult_Population;
    return +d.Value /*+eval("d." + lineWasteType)*/;
}

function lineVisUpdate() {
    lineSvg.selectAll(".line").remove();
    lineSvg.selectAll(".yAxis").remove();

    lineGetYScale();
    lineDraw();
}

/*
function mouseover() {
    focus.style("opacity", 1)
    focusText.style("opacity",1)
}

function mousemove() {
    // recover coordinate we need
    var x0 = x.invert(d3.mouse(this)[0]);
    var i = bisect(data, x0, 1);
    selectedData = data[i]
    focusText
      .html("x:" + selectedData.x + "  -  " + "y:" + selectedData.y)
      .attr("x", x(selectedData.x)+15)
      .attr("y", y(selectedData.y))
}
 function mouseout() {
    focus.style("opacity", 0)
    focusText.style("opacity", 0)
}

*/