var data = d3.map();

var dataByYear = {};
$.post("/scatterplot", function(d) {
    dataByYear = d;
});

var colorScale = d3.scaleLinear()
  .domain([2.3, 8])
  .range(d3.schemePurples[3]);

var year = 2005;
onload = function() {
    var $ = function(id) { return document.getElementById(id); };
    $('slider').oninput = function() { 
        $('range').innerHTML = this.value; 
        year = this.value;
        console.log(year);
        for(i in dataByYear[year]) {
            var countryName = dataByYear[year][i].Country;
            data.set(countryName, +dataByYear[year][i].Life_Ladder);
        }
        console.log(data);
        d3.select("#mapdiv").select("svg").select("g").selectAll("path").attr("fill", function (d) {
            d.total = data.get(d.properties.name) || 0;
            return colorScale(d.total);
        })
    };
    $('slider').oninput();
};

var width_map = 640 ,
height_map = 250
active = d3.select(null);

var projection = d3.geoEquirectangular()
  .scale(120)
  .center([0,20])
  .translate([width_map / 2, height_map / 2]);

var path = d3.geoPath();
var zoom = d3.zoom().on("zoom", zoomed);

var svg_map = d3.select("#mapdiv").append("svg")
.attr("width", width_map )
.attr("height", height_map )
.on("click", stopped, true);

svg_map.append("rect")
    .attr("class", "background")
    .attr("width", width_map)
    .attr("height", height_map)
    .on("click", reset);

var g = svg_map.append('g');

var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Life Ladder: </strong><span class='details'>" + d.total.toFixed(3) +"</span>";
            });
svg_map.call(tip);
svg_map.call(zoom);

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .await(ready);

function ready(error, topo) {

    let mouseOver = function(d) {
        d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", .5)
        d3.select(this)
        .transition()
        .duration(200)
        .style("opacity", 1)
        .style("stroke", "black")
        tip.show(d)
    }

    let mouseLeave = function(d) {
        d3.selectAll(".Country")
        .transition()
        .duration(200)
        .style("opacity", 1)
        d3.select(this)
        .transition()
        .duration(200)
        .style("stroke", "none")
        tip.hide(d) 
    }

    let clickevent = function(d){

        country = d.id;
        country1 = country.toString();
        console.log(d);
        console.log(country1)
        console.log(year);
        // d3.queue().defer(d3.json, "/getDataPerCountryPie?country="+country1)
        // .await(drawpie);
        // d3.queue().defer(d3.json, "/getDataSun?country="+country1)
        // .await(drawsunburst);
        // d3.queue().defer(d3.json, "/getDataPerCountryBar?country=" + country1).await(updatebarchart);

        // d3.queue().defer(d3.json, "/getTextData?country=" + country1).await(drawtext);
    }

    // Draw the map
    g.selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
    // draw each country
    .attr("d", d3.geoPath()
        .projection(projection)
    )
    // set the color of each country
    .attr("fill", function (d) {
        d.total = data.get("$" + d.properties.name) || 0;
        return colorScale(d.total);
    })
    .style("stroke", "transparent")
    .attr("class", function(d){ return "Country" } )
    .style("opacity", .8)
    .on("mouseover", mouseOver )
    .on("mouseleave", mouseLeave )
    .on("click", clickevent );
}

function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}
function reset() {
    active.classed("active", false);
    active = d3.select(null);
  
    svg_map.transition()
        .duration(750)
        // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
        .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
}

function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    g.attr("transform", d3.event.transform); // updated for d3 v4
}

// const range = document.getElementById('range'), rangeV = document.getElementById('rangeV'),
// setValue = ()=>{
//     const newValue = Number( (range.value - range.min) * 100 / (range.max - range.min) ), newPosition = 10 - (newValue * 0.2);
//     rangeV.innerHTML = `<span>${range.value}</span>`;
//     rangeV.style.left = `calc(${newValue}% + (${newPosition}px))`;
// };
// document.addEventListener("DOMContentLoaded", setValue);
// range.addEventListener('input', setValue);