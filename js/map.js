import { d3, width, height, padding, addSelectionHeading, removeSelectionHeading, createSvgCanvas, scaleWasteByPopulation, getCategoryColourGroup } from "./common.js";

var dataset;
const yearSelect = document.getElementById("YearSelection");
const wasteModifier = document.getElementById("wasteModifier");
const wasteType = document.choropleth.wasteType;
const mapView = document.getElementById("melbourne");

var svg;
var projection;
var geoPathjson;
var city;

//Waste Year Selection Update
yearSelect.onchange = yearSelectionChange;

// terrible, I will fix this later.
function yearSelectionChange() {
    getGeoPathJson(geoPathjson);

    replaceGeoPath();
}
//Waste Per Capita vs Total Selector
wasteModifier.onchange = replaceGeoPath;

//Waste Category Update
wasteType.onchange = replaceGeoPath;

mapView.onchange = setNewProjection;

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
    svg = createSvgCanvas("geoPath");
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

            if (jsonLGA == dataLGA && dataYear == yearSelect.value) {
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

function getColour() {
    return d3.scaleQuantize()
        .range(getCategoryColourGroup(wasteType.value))
        .domain(
            d3.extent(geoPathjson.features, (d) =>
                scaleWasteByPopulation(d.properties[wasteType.value], d.properties.Population, wasteModifier.checked)
            ),
        );
}

function setPath(path, colour) {
    svg.selectAll("path")
        .data(geoPathjson.features)
        .join("path")
        .attr("class", "shape")
        .attr("d", path)
        .style("fill", (d) => setGeoPathFill(d, colour))
        .on("mouseover", function (event, d) {
            addSelectionHeading(svg, d.properties.LGA_name, d.properties[wasteType.value]);
        })
        .on("mouseout", function (event, d) {
            removeSelectionHeading();
        })
        .append("title")
        .text((d) => `This Value is ${d.properties.LGA_name} ${d.properties[wasteType.value] ?? 0} Tonnes`);
}

function setGeoPathFill(d, colour) {
    // if (d.properties[wasteType.value] != undefined) { //if LGA is not in dataset. Will be areas without an LGA, or the 3 LGAs that make up the former Delatite LGA for the 2001-2002 data.
    return colour(scaleWasteByPopulation(d.properties[wasteType.value], d.properties.Population, wasteModifier.checked));
    // }
    // return "white";
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
                .join("text")
                .attr("x", (d) => projection([d.lon, d.lat])[0])
                .attr("y", (d) => projection([d.lon, d.lat])[1])
                .text((d) => d.place);

            svg.selectAll("circle")
                .data(city)
                .join("circle")
                .attr("cx", (d) => projection([d.lon, d.lat])[0])
                .attr("cy", (d) => projection([d.lon, d.lat])[1])
                .attr("r", 2)
                .attr("fill", "red");
        });
}