var data = d3.map();

var dataByYear = {};

var selected_country = "none";
var max_ladder = -10;
var min_ladder = 100;
var max_country = "";
var min_country = "";

initMap();
function initMap() {
    $.post("/scatterplot", function(d) {
        dataByYear = d;
        for(i in dataByYear[year]) {
            var countryName = dataByYear[year][i].Country;
            var ladderScore = +dataByYear[year][i].Life_Ladder;
            if(max_ladder < ladderScore) {
                max_ladder = ladderScore;
                max_country = countryName;
            }
            if(min_ladder > ladderScore) {
                min_ladder = ladderScore;
                min_country = countryName;
            }
            data.set(countryName, ladderScore);
        }
        d3.select("#mapdiv").select("svg").select("g").selectAll("path").attr("fill", function (d) {
            d.total = data.get(d.properties.name) || 0;
            return colorScale(d.total);
        })
        drawPCP(dataByYear[year]);
        // d3.selectAll(".Country")
        // .style("opacity", function(d) {if(d == max_country || d == min_country) {
        //     return .5;
        // }});
        console.log(min_country);
        console.log(max_country);
        max_ladder = -10;
        min_ladder = 100;
    });
}

// var pcpData = {}
// $.post("/pcp", function(d) {
//     pcpData = JSON.parse(d.pcpData);
//     drawPCP(pcpData[2005]);
// });

var colorScale = d3.scaleLinear()
  .domain([2.3, 8])
  .range(["#F7FBFF", "#08306B"]);

var year = 2012;
var year_prev = year;
onload = function() {
    var $ = function(id) { return document.getElementById(id); };
    $('slider').oninput = function() {
        $('range').innerHTML = this.value;
        year = this.value;
        // console.log(year);
        for(i in dataByYear[year]) {
            var countryName = dataByYear[year][i].Country;
            var ladderScore = +dataByYear[year][i].Life_Ladder;
            if(max_ladder < ladderScore) {
                max_ladder = ladderScore;
                max_country = countryName;
            }
            if(min_ladder > ladderScore) {
                min_ladder = ladderScore;
                min_country = countryName;
            }
            data.set(countryName, ladderScore);
        }
        // console.log(data);
        d3.select("#mapdiv").select("svg").select("g").selectAll("path").attr("fill", function (d) {
            d.total = data.get(d.properties.name) || 0;
            return colorScale(d.total);
        });
        /* update scatterplot as year value changes */
        if (year_prev != year) {
            updateScatterplot();
            updateBarchart();
            // for (var attr in line_attrs)
            //     svg_line.selectAll("#label_"+attr).remove();
            // updateLinechart();
            drawPCP(dataByYear[year]);
            updateBarchart();
            getDataDrawPie();
            year_prev = year;
            console.log(min_country);
            console.log(max_country);
            max_ladder = -10;
            min_ladder = 100;
        }
    };
    $('slider').oninput();
};

var width_map = 640 ,
height_map = 280
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
    // d3.selectAll(".Country")
    //     .style("opacity", function(d) {if(d == max_country || d == min_country) {
    //         return 1;
    //     }});
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

        country = d.properties.name;
        selected_country = country.toString();
        // console.log(d);
        // console.log(selected_country);
        // console.log(year);

        svg_scat.selectAll("circle")
            .style("fill", function(d2) {
                if (d2["country"] == selected_country) {
                    return "#768daf";
                }
                else {
                    return white;
                }
            })
            .attr("r", function(d2) {
                if (d2["country"] == selected_country)
                    return 5 * Math.sqrt(d2["count"]);
                else return 3 * Math.sqrt(d2["count"]);
            });

        updateBarchart();
        getDataDrawPie();
        updateLinechart();
        // d3.queue().defer(d3.json, "/getDataPerCountryPie?country="+selected_country)
        // .await(drawpie);
        // d3.queue().defer(d3.json, "/getDataSun?country="+selected_country)
        // .await(drawsunburst);
        // d3.queue().defer(d3.json, "/getDataPerCountryBar?country=" + selected_country).await(updatebarchart);

        // d3.queue().defer(d3.json, "/getTextData?country=" + selected_country).await(drawtext);
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
        d.total = data.get(d.properties.name) || 0;
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

    svg_scat.selectAll("circle")
        .style("fill", function(d2) { return white;  })
        .attr("r", function(d2) { return 3 * Math.sqrt(d2["count"]); });

    selected_country = "none";
    updateBarchart();
    getDataDrawPie();
    updateLinechart();
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
