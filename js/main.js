import { createMap } from "./map.js";
import { createTree } from "./tree.js";
import { initialiseLineChart } from "./line.js";

function init() {
    createMap();
    initialiseLineChart();
    createTree();
}

window.onload = init();