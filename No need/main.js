var w = 1200;
var h = 900;
var padding = 40;
var dataset;

function init(){
	dataset = d3.csv("Data.csv")
		.then(function(data){
			dataset = data;
		});

	getGeoPath();
	//lineChart();
}

window.onload = init();