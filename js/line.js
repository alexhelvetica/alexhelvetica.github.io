import { width, height, padding, addSelectionHeading, removeSelectionHeading, getCommonName, createSvgCanvas, getCategoryColour, scaleWasteByPopulation } from "./common.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var json;
var svg;
var xAxisScale;
var yAxisScale;
var yAxis;

//Waste Per Capita vs Total Selector
const wasteModifier = document.getElementById("lineWasteModifier");
wasteModifier.onchange = drawLineChart;

const line = d3.line()
    .x((d) => xAxisScale(d.Reference_Year))
    .y((d) => yAxisScale(scaleWasteByPopulation(d.Value, d.Estimated_Adult_Population, wasteModifier.checked)));

export async function initialiseLineChart() {
    var data = await d3.csv("linev2.csv");
    json = await d3.group(
        data,
        (d) => d.Type
    );

    svg = createSvgCanvas(d3, "lineChart");
    yAxisScale = getYAxisScale();
    xAxisScale = getXAxisScale();
    drawLineChart();
}

function getXAxisScale() {
    var xAxisScale = d3.scaleLinear()
        .domain(d3.extent(json.entries().next().value[1], (d) => d.Reference_Year))
        .range([padding, width]);

    var xAxis = d3.axisBottom()
        .ticks(5)
        .scale(xAxisScale);

    svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", `translate(0, ${height - padding})`)
        .call(xAxis);

    return xAxisScale;
}

function getYAxisScale() {
    var yAxisScale = d3.scaleLinear()
        .range([height - padding, 0]);

    svg.append("g")
        .attr("class", "yAxis")
        .attr("transform", `translate(${padding}, 0)`);

    yAxis = d3.axisLeft()
        .ticks(5);

    return yAxisScale;
}

function drawLineChart() {
    yAxisScale
        .domain([0, d3.max(json.entries(), (d) =>
            d3.max(d[1], (d) => scaleWasteByPopulation(d.Value, d.Estimated_Adult_Population, wasteModifier.checked) * 1.5)
        )]);

    svg.selectAll(".yAxis")
        .call(yAxis.scale(yAxisScale));

    // Draw the line
    svg.selectAll(".line")
        .data(json.entries())
        .join("path")
        .attr("class", "line")
        .attr("stroke", (d) => getCategoryColour(d[0]))
        .attr("d", (d) => line(d[1])
        )
        .on("mouseover", function (event, d) {
            addSelectionHeading(svg, getCommonName(d[0]), d[1][0].Value);
        })
        .on("mouseout", function (event, d) {
            removeSelectionHeading();
        })
        .append("title")
        .text((d) => getCommonName(d[0]));
}