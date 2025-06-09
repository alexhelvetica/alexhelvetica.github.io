export const width = 1200;
export const height = 900;
export const padding = 40;
export const red = ["#fff5f0", "#fee0d2", "#fcbba1", "#fc9272", "#fb6a4a", "#ef3b2c", "#cb181d", "#a50f15", "#67000d"];
export const yellow = ["#FFFFF0", "#FDFD96", "#FFFDD0", "#FFFF31", "#FFFF00", "#FCF75E", "#FFF700", "#FFEF00", "#FBEC5D"];
export const green = ["#f7fcf5", "#e5f5e0", "#c7e9c0", "#a1d99b", "#74c476", "#41ab5d", "#238b45", "#006d2c", "#00441b"];
export const blue = ["#f2f0f7", "#cbc9e2", "#9e9ac8", "#756bb1", "#54278f"];

export function addSelectionHeading(svg, name, value) {
    svg.append("text")
        .attr("class", "SVGText SVGHeading")
        .attr("x", 650)
        .attr("y", padding)
        .attr("textLength", "550px")
        .text(name);
    //.attr("font-size", "48px")
    //.attr("overflow", "hidden")
    //.attr("white-space", "nowrap")
    //.attr("text-overflow", "ellipsis")
    // .attr("text-anchor", "middle") 
    //.attr("transform", "scale(2)")
    svg.append("text")
        .attr("class", "SVGText")
        .attr("x", 700)
        .attr("y", 60)
        .attr("dy", "0em")
        .text(`${value ?? 0} Tonnes`);
}
export function removeSelectionHeading() {
    document.querySelectorAll(".SVGText")
        .forEach((text) => {
            text.remove()
        });
}
export function getCommonName(name) {
    switch (name) {
        case "landFill":
            return "Land Fill";
        case "Wastage":
            return "Recycling/Garden Wastage";

        case "recyclingProcessed":
            return "Recycling Processed";
        case "recyclingTotal":
            return "Recycling Total";

        case "gardenProcessed":
            return "Garden Waste Processed";
        case "gardenTotal":
            return "Garden Waste Total";
    }
}

export function createSvgCanvas(d3, id) {
    return d3.select(`#${id}`)
        .append("svg")
        .attr("width", width)
        .attr("height", height);
}

export function getCategoryColourGroup(group) {
    switch (group) {
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
export function getCategoryColour(group) {
    switch (group) {
        case "gardenTotal":
        case "gardenWastage":
            return green[8];
        case "gardenProcessed":
            return green[4];
        case "recyclingTotal":
        case "recyclingWastage":
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

export function scaleWasteByPopulation(value, population, scaleWasteByPopulation) {
    return (value ?? 0) / (scaleWasteByPopulation ?? false ? population ?? 0 : 1);
}

export function mapToJson(map) {
    const obj = {};
    for (const [key, value] of map) {
        obj[key] = value instanceof Map ? mapToJson(value) : value;
    }
    return JSON.stringify(obj);
}