import { width, height, padding, red, yellow, green, blue, addSelectionHeading, createSvgCanvas } from "./common.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";

var dataset;
var yearSelect = document.getElementById("YearSelection").value;
var wasteModifier = document.getElementById("wasteModifier");
var wasteType = d3.select('input[name="wasteType"]:checked').node().value;
var mapView = document.getElementById("melbourne");

var svg;
var projection;

var geoPathjson;
var city;

//Waste Year Selection Update
d3.select("#YearSelection")
    .on("change", function () {
        yearSelect = this.value;
        getGeoPathJson(geoPathjson);

        replaceGeoPath();
    });

//Waste Per Capita vs Total Selector
d3.select("#wasteModifier")
    .on("change", function () {
        wasteModifier = this;

        replaceGeoPath();
    });

//Waste Category Update
d3.selectAll('input[name="wasteType"]')
    .on("change", function () {
        wasteType = this.value;

        replaceGeoPath();
    });

d3.select("#melbourne")
    .on("change", function () {
        mapView = this;

        setNewProjection();
    });

export function createMap() {
    d3.csv("geopath.csv")
        .then(function (data) {
            dataset = data;
        });

    getGeoPath();
}

function replaceGeoPath() {
    var colour = getColour();
    setNewPath(colour);
}

function getGeoPathCanvas() {
    svg = createSvgCanvas(d3, "geoPath");
}

function getGeoPathProjection() {
    if (!mapView.checked) {
        projection = d3.geoMercator()
            .center([145.45, -36.5])
            .translate([width / 2, height / 2])
            .scale(7500);
    }
    else {
        projection = d3.geoMercator()
            .center([145, -37.94])
            .translate([width / 2, height / 2])
            .scale(34000);
    }
}

function getGeoPathPath() {
    return d3.geoPath()
        .projection(projection);
}

function getGeoPath() {
    getGeoPathCanvas();
    getGeoPathProjection();
    var path = getGeoPathPath();

    d3.json("LGA_VIC.json")
        .then(function (json) {
            getGeoPathJson(json);
        }).then(function () {
            var colour = getColour();
            setPath(path, colour);
            setCities();
        })
}

function getGeoPathJson(json) {
    for (var i = 0; i < dataset.length; i++) {

        var dataLGA = dataset[i].LGA;
        var dataYear = dataset[i].Reference_Year;

        for (var j = 0; j < json.features.length; j++) {
            var jsonLGA = json.features[j].properties.LGA_name;

            if (jsonLGA == dataLGA && dataYear == yearSelect) {
                json.features[j].properties.landFill = parseFloat(dataset[i].landFill);
                json.features[j].properties.recyclingTotal = parseFloat(dataset[i].recyclingTotal);
                json.features[j].properties.recyclingProcessed = parseFloat(dataset[i].recyclingProcessed);
                json.features[j].properties.gardenTotal = parseFloat(dataset[i].gardenTotal);
                json.features[j].properties.gardenProcessed = parseFloat(dataset[i].gardenProcessed);
                json.features[j].properties.wasteTotal = parseFloat(dataset[i].wasteTotal);
                json.features[j].properties.wasteProcessed = parseFloat(dataset[i].wasteProcessed);
                json.features[j].properties.Population = parseFloat(dataset[i].Estimated_Adult_Population);
            }
        }
    }
    geoPathjson = json;
}

function selectGeoPathColor() {
    switch (wasteType) {
        case "landFill":
            return red;
        case "recyclingTotal":
        case "recyclingProcessed":
            return yellow;
        case "gardenTotal":
        case "gardenProcessed":
            return green;
        case "wasteTotal":
        case "wasteProcessed":
            return blue;
    }
}

function getColour() {
    return d3.scaleQuantize()
        .range(selectGeoPathColor())
        .domain([
            d3.min(geoPathjson.features, (d) =>
                eval(`d.properties.${wasteType}`) / (wasteModifier.checked ? d.properties.Population : 1)
            ),
            d3.max(geoPathjson.features, (d) =>
                eval(`d.properties.${wasteType}`) / (wasteModifier.checked ? d.properties.Population : 1)
            )
        ]);
}

function setPath(path, colour) {
    svg.selectAll("path")
        .data(geoPathjson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", (d) => setGeoPathFill(d, colour))
        .on("mouseover", function (event, d) {
            d3.select(this)
                .style("fill", "orange")
                .append("title")
                .text((d) => `This Value is ${d.properties.LGA_name}`);

            addSelectionHeading(svg, geoPathjson.features[d].properties.LGA_name, eval(`geoPathjson.features[d].properties.${wasteType}`));
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .style("fill", (d) => setGeoPathFill(d, colour))
            d3.selectAll("#geoPath .SVGText").remove();
        });
}

function setGeoPathFill(d, colour) {
    if (eval(`d.properties.${wasteType}`) != undefined) { //if LGA is not in dataset. Will be ares without an LGA, or the 3 LGAs that make up the former Delatite LGA for the 2001-2002 data.
        return colour(eval(`d.properties.${wasteType}`) / (wasteModifier.checked ? d.properties.Population : 1));
    }
    return "black";
}

function setNewPath(colour) {
    svg.selectAll("path")
        .data(geoPathjson.features)
        .transition()
        .delay(0)
        .duration(0)
        .style("fill", (d) => setGeoPathFill(d, colour));
}

function setNewProjection() {
    getGeoPathProjection();
    var path = getGeoPathPath();

    svg.selectAll("path")
        .data(geoPathjson.features)
        .transition()
        .delay(0)
        .duration(0)
        .attr("d", path);

    svg.selectAll("text")
        .data(city)
        .transition()
        .delay(0)
        .duration(0)
        .attr("x", (d) => projection([d.lon, d.lat])[0])
        .attr("y", (d) => projection([d.lon, d.lat])[1]);

    svg.selectAll("circle")
        .data(city)
        .transition()
        .delay(0)
        .duration(0)
        .attr("cx", (d) => projection([d.lon, d.lat])[0])
        .attr("cy", (d) => projection([d.lon, d.lat])[1]);
}

function setCities() {
    d3.csv("VIC_city.csv")
        .then(function (data) {
            city = data;

            svg.selectAll("text")
                .data(city)
                .enter()
                .append("text")
                .attr("x", (d) => projection([d.lon, d.lat])[0])
                .attr("y", (d) => projection([d.lon, d.lat])[1])
                .text((d) => d.place);

            svg.selectAll("circle")
                .data(city)
                .enter()
                .append("circle")
                .attr("cx", (d) => projection([d.lon, d.lat])[0])
                .attr("cy", (d) => projection([d.lon, d.lat])[1])
                .attr("r", 2)
                .attr("fill", "red");
        });
}