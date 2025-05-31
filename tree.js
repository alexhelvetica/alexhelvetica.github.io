var treeYearSelect = document.getElementById("treeYearSelection").value;

var treeJson;

var treeSvg;

var treeHierarchy
var treeColor;
var treeOpacity;

//Waste Per Capita vs Total Selector
d3.select("#treeYearSelection")
    .on("change", function () {
        treeYearSelect = this.value;
        //alert("fuck");
        treeVisUpdate();
    });

function treeInit() {
    treeSvg = d3.select("#treeChart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    treeJson = d3.json("tree.json")
        .then(function (data) {
            treeJson = data;
            treeVis();
        });
}

function treeInit_GenerateJson() {
    d3.csv("tree great waste.csv")
        .then(function (data) {
            treeJson = d3.nest()
                .key((d) => d.Reference_Year)
                .key((d) => d.Type)
                .entries(data);
        })
}

function treeOpacitySet() {
    // And a opacity scale	----------------------------------------------------------------- need to fix
    treeOpacity = d3.scaleLinear()
        .domain(d3.extent(treeHierarchy.leaves(), (d) => d.data.value))
        //.domain([10, 30])
        .range([1, 1]);
}


//https://www.d3-graph-gallery.com/graph/treemap_custom.html
function treeVis() {

    treeSvg.append("g")
        .attr("transform", "translate(" + padding + "," + padding + ")");

    // Then d3.treemap computes the position of each element of the hierarchy
    treeGetTreeData();

    // prepare a color scale
    treeColor = d3.scaleOrdinal()
        .domain(["landFill", "recyclingWastage", "recyclingProcessed", "gardenWastage", "gardenProcessed"])
        .range(['#e2231b', '#FBEC5D', '#f7ec0f', '#00441b', '#a3cf69']);

    treeOpacitySet();

    // use this information to add rectangles:
    treeSvg.selectAll("rect")
        .data(treeHierarchy.leaves())
        .enter()
        .append("rect")
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("stroke", "black")
        .style("fill", function (d) { return treeColor(d.parent.data.name) })
        .style("opacity", function (d) { return treeOpacity(d.data.value) })
        .on("mouseover", function (event, d) {
            d3.select(this)
                .style("fill", "orange")
                .append("title")
                .text((d) => "This Value is " + d.data.name + " " + d.data.value);

            treeSvg.append("text")
                .attr("class", "treeText SVGText SVGHeading")
                .attr("x", 650)
                .attr("y", 40)
                .attr("textLength", "550px")
                .text(treeHierarchy.leaves()[d].data.name);

            treeSvg.append("text")
                .attr("class", "treeText SVGText")
                .attr("x", 700)
                .attr("y", 60)
                .attr("dy", "0em")
                .text(treeHierarchy.leaves()[d].data.value);
        })
        .on("mouseout", function (event, d) {
            d3.select(this)
                .style("fill", function (d) { return treeColor(d.parent.data.name) })
            d3.selectAll(".treeText").remove();
        });

    treeText();
}



function treeText() {
    // and to add the text labels
    /*
   treeSvg.selectAll("textName")
       .data(treeHierarchy.leaves())
       .enter()
       .append("text")
       .attr("class","treeText")
         .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
         .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
         .text(function(d){ return d.data.name})
         .attr("font-size", "19px")
          .attr("fill", function(d){
                       if (d.data.Type == "recyclingProcessed")
               return "black";
           return "white";
          });

   // and to add the text labels
*/

    // Add title for the 3 groups
    treeSvg.selectAll("titles")
        .data(treeHierarchy.descendants().filter(function (d) { return d.depth == 1 }))
        .enter()
        .append("text")
        .attr("class", "titles")
        .attr("x", function (d) { return d.x0 })
        .attr("y", function (d) { return d.y0 + 21 })
        .text(function (d) {
            switch (d.data.name) {
                case "landFill":
                    return "Land Fill";
                case "recyclingProcessed":
                    return "Recycling Processed";
                case "gardenProcessed":
                    return "Garden Waste Processed";
                case "Wastage":
                    return "Recycling/Garden Wastage";
            }
        })
        .attr("font-size", "19px")
        .attr("fill", "black");
}

function treeGetTreeData() {
    treeHierarchy = d3.hierarchy(treeJson.children[+treeYearSelect]).sum((d) => d.value);

    d3.treemap()
        .size([w, h])
        .paddingTop(50)
        .paddingRight(7)
        .paddingInner(3)      // Padding between each rectangle
        //.paddingOuter(6)
        //.padding(20)
        (treeHierarchy);
}

function treeVisUpdate() {
    //alert(treeJson.children[+treeYearSelect].name);

    treeGetTreeData();

    var values = treeSvg.selectAll("rect")
        .data(treeHierarchy.leaves());

    values.enter()
        .append("rect")
        .merge(values)
        .transition()
        .duration(50)
        .attr('x', function (d) { return d.x0; })
        .attr('y', function (d) { return d.y0; })
        .attr('width', function (d) { return d.x1 - d.x0; })
        .attr('height', function (d) { return d.y1 - d.y0; })
        .style("fill", function (d) { return treeColor(d.parent.data.name) })
        .style("opacity", function (d) { return treeOpacity(d.data.value) });

    d3.selectAll(".titles").remove();

    treeText();
}


window.onload = treeInit();