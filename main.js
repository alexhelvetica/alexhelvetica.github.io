import { createMap } from "./map.js";
import { createTree } from "./tree.js";
import { createLine } from "./line.js";

function init() {
    createMap();
    createLine();
    createTree();
}

window.onload = init();