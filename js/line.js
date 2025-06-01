import { width, height, padding, red, green, yellow, addSelectionHeading, removeSelectionHeading, getCommonName, createSvgCanvas, getCategoryColour } from "./common.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";

var json;
var svg;
var xAxisScale;

//Waste Per Capita vs Total Selector
document.getElementById("lineWasteModifier")
    .onchange = scaleChart;

export function initialiseLineChart() {
    d3.csv("linev2.csv")
        .then(async function (data) {
            json = await d3.nest()
                .key((d) => d.Type)
                .entries(data);
            lineVis();
        })
}

function getXAxisScale() {
    var xAxisScale = d3.scaleLinear()
        .domain(d3.extent(json[0].values, (d) => d.Reference_Year))
        .range([padding, width]);

    var xAxias = d3.axisBottom()
        .ticks(5)
        .scale(xAxisScale);

    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(xAxias);

    return xAxisScale;
}

function getYAxisScale(event) {
    var yAxisScale = d3.scaleLinear()
        .domain([0, d3.max(json, (d) => d3.max(d.values, (e) => scaleWasteByPopulation(e, event) * 1.5))])
        .range([height - padding, 0]);

    var yAxis = d3.axisLeft()
        .ticks(5)
        .scale(yAxisScale);

    svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${padding}, 0)`)
        .call(yAxis);
    return yAxisScale;
}

function lineVis() {
    svg = createSvgCanvas(d3, "lineChart");

    xAxisScale = getXAxisScale();
    json.map((d) => d.key);
    drawLineChart();
}

function drawLineChart(event) {
    var yAxisScale = getYAxisScale(event);
    // Draw the line
    svg.selectAll(".line")
        .data(json)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("stroke", (d) => getCategoryColour(d.key))
        .attr("d", (d) =>
            d3.line()
                .x((d) => xAxisScale(d.Reference_Year))
                .y((d) => yAxisScale(scaleWasteByPopulation(d, event)))
                (d.values)
        )
        .on("mouseover", function (event, d) {
            addSelectionHeading(svg, getCommonName(json[d].key), json[d].values[0].Value);
        })
        .on("mouseout", function (event, d) {
            removeSelectionHeading();
        })
        .append("title")
        .text((d) => getCommonName(d.key));
}

function scaleWasteByPopulation(d, event) {
    return +d.Value / (event?.target.checked ?? false ? +d.Estimated_Adult_Population : 1);
}

function scaleChart(event) {
    svg.selectAll(".line,.yAxis").remove();
    drawLineChart(event);
}
