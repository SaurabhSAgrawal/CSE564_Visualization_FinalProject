var data = d3.map();

var dataByYear = {};

var selected_country = "none";
var max_ladder = -10;
var min_ladder = 100;
var max_country = "";
var min_country = "";

var color_theme = "whole"; //"continent"

var colorScale = d3.scaleLinear()
  .domain([2.3, 8])
  .range(["#F7FBFF", "#08306B"]);

var country_continent = new Map();
var colorScale_asia = d3.scaleLinear()
                        .domain([2.3, 8])
                        .range(["#ffffff", "#ff004b"]);
var colorScale_europe = d3.scaleLinear()
                        .domain([2.3, 8])
                        .range(["#ffffff", "#0085ca"]);
var colorScale_africa = d3.scaleLinear()
                        .domain([2.3, 8])
                        .range(["#ffffff", "#189000"]);
var colorScale_north = d3.scaleLinear()
                        .domain([2.3, 8])
                        .range(["#ffffff", "#a200ff"]);
var colorScale_south = d3.scaleLinear()
                        .domain([2.3, 8])
                        .range(["#ffffff", "#ff7c00"]);
var colorScale_oceania = d3.scaleLinear()
                        .domain([2.3, 8])
                        .range(["#ffffff", "#ffff00"]);


$(document).ready(function() {
    $("input").change(function() {
        if (this.id == "slider")  return;
        if ($(this).is(":checked"))    color_theme = "continent";
        else color_theme = "whole";


        svg_scat.selectAll("circle")
            .transition()
            .duration(150)
            .ease(d3.easeLinear)
            // .style("fill", white);
            .style("fill", function(d) {
                if (color_theme == "whole") {
                    if (d["country"] == max_country)        return "#ff004b";
                    else if (d["country"] == min_country)   return "#ffff00";
                    else return white;
                }
                else return continent_colors[d["continent"]];
            });

        if (selected_country == "none") {
            foreground.style("stroke", function(d) {
                     if (typeof d == undefined || d == null)
                         return white;
                     if (color_theme == "whole") {
                         if (d["Country"] == max_country)        return "#ff004b";
                         else if (d["Country"] == min_country)   return "#ffff00";
                         else return white;
                     }
                     else return continent_colors[d["Continent"]];
                 })
                 .style("opacity", 0.3);
        }


        d3.select("#mapdiv")
            .select("svg")
            .select("g")
            .selectAll("path")
            .attr("fill", function(d) {
                d.total = data.get(d.properties.name) || 0;
                if (color_theme == "whole") {
                    if (d.properties.name == max_country)        return "#ff004b";
                    else if (d.properties.name == min_country)   return "#ffff00";
                    else return colorScale(d.total);
                }
                else if (color_theme == "continent") {
                    if (country_continent[d.properties.name] == "Asia")
                        return colorScale_asia(d.total);
                    else if (country_continent[d.properties.name] == "Europe")
                        return colorScale_europe(d.total);
                    else if (country_continent[d.properties.name] == "Africa")
                        return colorScale_africa(d.total);
                    else if (country_continent[d.properties.name] == "North America")
                        return colorScale_north(d.total);
                    else if (country_continent[d.properties.name] == "South America")
                        return colorScale_south(d.total);
                    else if (country_continent[d.properties.name] == "Oceania")
                        return colorScale_oceania(d.total);
                    else return "#ffffff";
            }
        })
    })
});

initMap();
function initMap() {
    $.post("/scatterplot", function(d) {
        dataByYear = d;
        for(i in dataByYear[year]) {
            var countryName = dataByYear[year][i].Country;
            var ladderScore = +dataByYear[year][i].Life_Ladder;
            var continent = dataByYear[year][i].Continent;
            if(max_ladder < ladderScore) {
                max_ladder = ladderScore;
                max_country = countryName;
            }
            if(min_ladder > ladderScore) {
                min_ladder = ladderScore;
                min_country = countryName;
            }
            data.set(countryName, ladderScore);
            country_continent[countryName] = continent;
        }


        d3.select("#mapdiv").select("svg").select("g").selectAll("path").attr("fill", function (d) {
            d.total = data.get(d.properties.name) || 0;
            if (color_theme == "whole") {
                if (d.properties.name == max_country)        return "#ff004b";
                else if (d.properties.name == min_country)   return "#ffff00";
                else return colorScale(d.total);
            }
            else if (color_theme == "continent") {
                if (country_continent[d.properties.name] == "Asia")
                    return colorScale_asia(d.total);
                else if (country_continent[d.properties.name] == "Europe")
                    return colorScale_europe(d.total);
                else if (country_continent[d.properties.name] == "Africa")
                    return colorScale_africa(d.total);
                else if (country_continent[d.properties.name] == "North America")
                    return colorScale_north(d.total);
                else if (country_continent[d.properties.name] == "South America")
                    return colorScale_south(d.total);
                else if (country_continent[d.properties.name] == "Oceania")
                    return colorScale_oceania(d.total);
                else return "#ffffff";
            }
        });
        drawPCP(dataByYear[year]);
        //console.log(min_country);
        //console.log(max_country);
        max_ladder = -10;
        min_ladder = 100;
    });
}

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
            if (color_theme == "whole") {
                if (d.properties.name == max_country)        return "#ff004b";
                else if (d.properties.name == min_country)   return "#ffff00";
                else return colorScale(d.total);
            }
            else if (color_theme == "continent") {
                if (country_continent[d.properties.name] == "Asia")
                    return colorScale_asia(d.total);
                else if (country_continent[d.properties.name] == "Europe")
                    return colorScale_europe(d.total);
                else if (country_continent[d.properties.name] == "Africa")
                    return colorScale_africa(d.total);
                else if (country_continent[d.properties.name] == "North America")
                    return colorScale_north(d.total);
                else if (country_continent[d.properties.name] == "South America")
                    return colorScale_south(d.total);
                else if (country_continent[d.properties.name] == "Oceania")
                    return colorScale_oceania(d.total);
                else return "#ffffff";
            }
        });
        /* update scatterplot as year value changes */
        if (year_prev != year) {
            updateScatterplot();
            //updateLinechart();
            for (var attr in line_attrs)
                svg_line.selectAll("#label_"+attr).remove();
            selected_country = "none";
            // updateLinechart();
            drawPCP(dataByYear[year]);
            updateBarchart();
            getDataDrawPie();
            year_prev = year;
            //console.log(min_country);
            //console.log(max_country);
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
        svg_scat.selectAll("circle")
            .style("fill", function(d2) {
                if (d2["country"] == selected_country) {
                    return continent_colors[d2["continent"]];
                }
                else {
                    return white;
                }
            })
            .attr("r", function(d2) {
                if (d2["country"] == selected_country)
                    return 10 * Math.sqrt(d2["count"]);
                else return 5 * Math.sqrt(d2["count"]);
            });

        foreground
             .style("opacity", 1)
             .style('display', function(d) {
            if (d["Country"] == selected_country)   return null;
            else return "none";
        });

        updateBarchart();
        getDataDrawPie();
        for (var attr of line_attrs)
            svg_line.selectAll("#label_"+attr).remove();
        updateLinechart();
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
        if (color_theme == "whole") {
            if (d.properties.name == max_country)        return "#ff004b";
            else if (d.properties.name == min_country)   return "#ffff00";
            else return colorScale(d.total);
        }
        else if (color_theme == "continent") {
            if (country_continent[d.properties.name] == "Asia")
                return colorScale_asia(d.total);
            else if (country_continent[d.properties.name] == "Europe")
                return colorScale_europe(d.total);
            else if (country_continent[d.properties.name] == "Africa")
                return colorScale_africa(d.total);
            else if (country_continent[d.properties.name] == "North America")
                return colorScale_north(d.total);
            else if (country_continent[d.properties.name] == "South America")
                return colorScale_south(d.total);
            else if (country_continent[d.properties.name] == "Oceania")
                return colorScale_oceania(d.total);
            else return "#ffffff";
        }
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
        .style("fill", function(d2) {
            if (color_theme == "whole") {
                if (d2["country"] == max_country)        return "#ff004b";
                else if (d2["country"] == min_country)   return "#ffff00";
                else return white;
            }
            else return continent_colors[d2["continent"]];
         })
        .attr("r", function(d2) { return 5 * Math.sqrt(d2["count"]); });

    selected_country = "none";

    foreground
         .style("opacity", 0.3)
         .style('display', function(d) { return null; });

    updateBarchart();
    getDataDrawPie();
    updateLinechart();
}

function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    // g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")"); // not in d3 v4
    g.attr("transform", d3.event.transform); // updated for d3 v4
}
