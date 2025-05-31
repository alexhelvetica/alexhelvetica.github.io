import { width, height, padding, red, green, yellow, addSelectionHeading, getCommonName, createSvgCanvas } from "./common.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";

var lineWasteModifier = document.getElementById("lineWasteModifier");

var lineJson;
var svg;
var lineXScale;
var lineYScale;

//Waste Per Capita vs Total Selector
d3.select("#lineWasteModifier")
    .on("change", () => lineVisUpdate());

//Waste Category Update
d3.selectAll('input[name="lineWasteType"]')
    .on("change", () => lineVisUpdate());


export function createLine() {
    d3.csv("linev2.csv")
        .then(function (data) {
            lineJson = d3.nest()
                .key((d) => d.Type)
                .entries(data);

            lineVis(data);
        })
}

function lineGetXScale(data) {
    lineXScale = d3.scaleLinear()
        .domain(d3.extent(data, (d) => d.Reference_Year))
        .range([padding, width]);

    var lineXAxis = d3.axisBottom()
        .ticks(5)
        .scale(lineXScale);

    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(lineXAxis);
}

function lineGetYScale(data) {
    lineYScale = d3.scaleLinear()
        .domain([0, d3.max(data, (d) => lineCheckedThing(d) * 1.5)])
        .range([height - padding, 0]);

    var lineYAxis = d3.axisLeft()
        .ticks(5)
        .scale(lineYScale);

    svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${padding}, 0)`)
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

function lineVis(data) {
    svg = createSvgCanvas(d3, "lineChart");

    lineGetXScale(data);
    lineGetYScale(data);
    lineJson.map((d) => d.key);
    lineDraw();
}

function lineDraw() {
    // Draw the line
    svg.selectAll(".line")
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
            d3.select(this)
                .attr("stroke", "orange")
                .attr("stroke-width", 10)
                .append("title")
                .text((d) => getCommonName(d.key));

            addSelectionHeading(svg, getCommonName(lineJson[d].key), lineJson[d].values[0].Value);
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .attr("stroke", lineGetColor(lineJson[d].key))
                .attr("stroke-width", 5);
            d3.selectAll("#line .SVGText").remove();
        });
}

function lineCheckedThing(d) {
    if (lineWasteModifier.checked)
        return +d.Value /*+eval(`d.${lineWasteType}`)*/ / +d.Estimated_Adult_Population;
    return +d.Value /*+eval(`d.${lineWasteType}`)*/;
}

function lineVisUpdate() {
    svg.selectAll(".line").remove();
    svg.selectAll(".yAxis").remove();

    lineGetYScale();
    lineDraw();
}
