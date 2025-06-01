import { width, height, padding, red, green, yellow, addSelectionHeading, removeSelectionHeading, getCommonName, createSvgCanvas } from "./common.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";

var lineJson;
var svg;
var lineXScale;

//Waste Per Capita vs Total Selector
document.getElementById("lineWasteModifier")
    .onchange = lineVisUpdate;

export function createLine() {
    d3.csv("linev2.csv")
        .then(async function (data) {
            lineJson = await d3.nest()
                .key((d) => d.Type)
                .entries(data);
            lineVis();
        })
}

function lineGetXScale() {
    lineXScale = d3.scaleLinear()
        .domain(d3.extent(lineJson[0].values, (d) => d.Reference_Year))
        .range([padding, width]);

    var lineXAxis = d3.axisBottom()
        .ticks(5)
        .scale(lineXScale);

    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(lineXAxis);
}

function lineGetYScale(event) {
    var lineYScale = d3.scaleLinear()
        .domain([0, d3.max(lineJson, (d) => d3.max(d.values, (e) => lineCheckedThing(e, event) * 1.5))])
        .range([height - padding, 0]);

    var lineYAxis = d3.axisLeft()
        .ticks(5)
        .scale(lineYScale);

    svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${padding}, 0)`)
        .call(lineYAxis);
    return lineYScale;
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
    svg = createSvgCanvas(d3, "lineChart");

    lineGetXScale();
    lineJson.map((d) => d.key);
    lineDraw();
}

function lineDraw(event) {
    var lineYScale = lineGetYScale(event);
    // Draw the line
    svg.selectAll(".line")
        .data(lineJson)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("stroke", (d) => lineGetColor(d.key))
        .attr("d", (d) =>
            d3.line()
                .x((d) => lineXScale(d.Reference_Year))
                .y((d) => lineYScale(lineCheckedThing(d, event)))
                (d.values)
        )
        .on("mouseover", function (event, d) {
            addSelectionHeading(svg, getCommonName(lineJson[d].key), lineJson[d].values[0].Value);
        })
        .on("mouseout", function (event, d) {
            removeSelectionHeading();
        })
        .append("title")
        .text((d) => getCommonName(d.key));
}

function lineCheckedThing(d, event) {
    return +d.Value / (event?.target.checked ?? false ? +d.Estimated_Adult_Population : 1);
}

function lineVisUpdate(event) {
    svg.selectAll(".line,.yAxis").remove();
    lineDraw(event);
}
