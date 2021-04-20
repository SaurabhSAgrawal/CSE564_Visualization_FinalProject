var width = 740 ,
height = 320
active = d3.select(null);

var projection = d3.geoMercator()
  .scale(120)
  .center([0,20])
  .translate([width / 2, height / 2]);

var path = d3.geoPath();

var svg = d3.select("#mapdiv").append("svg")
.attr("width", width )
.attr("height", height )
.on("click", stopped, true);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append('g');

var tip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>";
            });
svg.call(tip);

var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([10, 100, 1000, 5000, 10000, 50000])
  .range(d3.schemePurples[7]);
// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, )
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
        .style("stroke", "transparent")
        tip.hide(d) 
    }

    let clickevent = function(d){

        country=d.id
        country1= country.toString()
        d3.queue().defer(d3.json, "/getDataPerCountryPie?country="+country1)
        .await(drawpie);
        d3.queue().defer(d3.json, "/getDataSun?country="+country1)
        .await(drawsunburst);
        d3.queue().defer(d3.json, "/getDataPerCountryBar?country=" + country1).await(updatebarchart);

        d3.queue().defer(d3.json, "/getTextData?country=" + country1).await(drawtext);
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
    .attr("fill", function (d, i) {
        d.total = data.get(d.id) || 0;
        return colorScale(i);
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
  
    // svg.transition()
    //     .duration(750)
    //     // .call( zoom.transform, d3.zoomIdentity.translate(0, 0).scale(1) ); // not in d3 v4
    //     .call( zoom.transform, d3.zoomIdentity ); // updated for d3 v4
  }