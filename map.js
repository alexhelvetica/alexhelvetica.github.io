import { w, h, padding, red, yellow, green, blue } from "./const.js";
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@5/+esm";

var dataset;
var yearSelect = document.getElementById("YearSelection").value;
var wasteModifier = document.getElementById("wasteModifier");
var wasteType = d3.select('input[name="wasteType"]:checked').node().value;
var mapView = document.getElementById("melbourne");

var geoPath;
var projection;
var path;

var geoPathjson;
var color;
var city;

function getWidth() {
    if (self.innerWidth) {
        return self.innerWidth;
    }

    if (document.documentElement && document.documentElement.clientWidth) {
        return document.documentElement.clientWidth;
    }

    if (document.body) {
        return document.body.clientWidth;
    }
}


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
    getColor();
    setNewPath();
}

function getGeoPathCanvas() {
    geoPath = d3.select("#geoPath")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
}

function getGeoPathProjection() {
    if (!mapView.checked) {
        projection = d3.geoMercator()
            .center([145.45, -36.5])
            .translate([w / 2, h / 2])
            .scale(7500);
    }
    else {
        projection = d3.geoMercator()
            .center([145, -37.94])
            .translate([w / 2, h / 2])
            .scale(34000);
    }
}

function getGeoPathPath() {
    path = d3.geoPath()
        .projection(projection);
}

function getGeoPath() {
    getGeoPathCanvas();
    getGeoPathProjection();
    getGeoPathPath();

    d3.json("LGA_VIC.json")
        .then(function (json) {
            getGeoPathJson(json);
        }).then(function () {
            getColor();
            setPath();
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

function getColor() {
    color = d3.scaleQuantize()
        .range(selectGeoPathColor())
        .domain([
            d3.min(geoPathjson.features, (d) =>
                eval("d.properties." + wasteType) / (wasteModifier.checked ? d.properties.Population : 1)
            ),
            d3.max(geoPathjson.features, (d) =>
                eval("d.properties." + wasteType) / (wasteModifier.checked ? d.properties.Population : 1)
            )
        ]);
}

function setPath() {
    geoPath.selectAll("path")
        .data(geoPathjson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .style("fill", (d) => setGeoPathFill(d))
        .on("mouseover", function (event, d) {
            //var object =  d3.select(this);
            //var xPosition = path.centroid(object.datum())[0];
            //var yPosition = path.centroid(object.datum())[1];
            d3.select(this)
                .style("fill", "orange")
                .append("title")
                .text((d) => "This Value is " + d.properties.LGA_name);
            geoPath.append("text")
                .attr("class", "LGAText SVGText SVGHeading")
                .attr("id", "LGAName")
                .attr("x", 650)
                .attr("y", 40)
                //.attr("font-size", "48px")
                //.attr("overflow", "hidden")
                //.attr("white-space", "nowrap")
                //.attr("text-overflow", "ellipsis") 
                .attr("textLength", "550px")
                // .attr("text-anchor", "middle") 
                //.attr("transform", "scale(2)")
                .text(geoPathjson.features[d].properties.LGA_name)
            geoPath.append("text")
                .attr("class", "LGAText SVGText")
                .attr("x", 700)
                .attr("y", 60)
                .attr("dy", "0em")
                .text(eval("geoPathjson.features[d].properties." + wasteType) + " Tonnes");
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .style("fill", (d) => setGeoPathFill(d))
            d3.selectAll(".LGAText").remove();
        });
}



function setGeoPathFill(d) {
    if (eval("d.properties." + wasteType) != undefined) { //if LGA is not in dataset. Will be ares without an LGA, or the 3 LGAs that make up the former Delatite LGA for the 2001-2002 data.
        if (wasteModifier.checked)
            return color(eval("d.properties." + wasteType) / d.properties.Population);
        return color(eval("d.properties." + wasteType));
    }
    return "black";
}

function setNewPath() {
    geoPath.selectAll("path")
        .data(geoPathjson.features)
        .transition()
        .delay(0)
        .duration(0)
        .style("fill", (d) => setGeoPathFill(d));
}

function setNewProjection() {
    getGeoPathProjection();
    getGeoPathPath();

    geoPath.selectAll("path")
        .data(geoPathjson.features)
        .transition()
        .delay(0)
        .duration(0)
        .attr("d", path);

    geoPath.selectAll("text")
        .data(city)
        .transition()
        .delay(0)
        .duration(0)
        .attr("x", (d) => projection([d.lon, d.lat])[0])
        .attr("y", (d) => projection([d.lon, d.lat])[1]);

    geoPath.selectAll("circle")
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

            geoPath.selectAll("text")
                .data(city)
                .enter()
                .append("text")
                .attr("x", (d) => projection([d.lon, d.lat])[0])
                .attr("y", (d) => projection([d.lon, d.lat])[1])
                .text((d) => d.place);

            geoPath.selectAll("circle")
                .data(city)
                .enter()
                .append("circle")
                .attr("cx", (d) => projection([d.lon, d.lat])[0])
                .attr("cy", (d) => projection([d.lon, d.lat])[1])
                .attr("r", 2)
                .attr("fill", "red");
        });
}