var pcp_blue = "#436390";

var foreground = 0, background = 0;

var mouseDown = 0;
document.body.onmousedown = function() {
  mouseDown = 1;
}
document.body.onmouseup = function() {
  mouseDown = 0;
}

var continent_number = {"Asia": 0, "Europe": 1, "Africa": 2, "North America": 3, "South America": 4, "Oceania": 5}
function drawPCP(data) {
    d3.selectAll(".svg_pcp").remove();

    var margin = 40, svgWidth = 650, svgHeight = 270, width = svgWidth - margin, height = svgHeight - margin;

    var x = d3.scalePoint().range([0, width]).padding(0.5);
    var y = {};
    var dragging = {};
    var line = d3.line();
    var axis = d3.axisLeft();

    var svg = d3.select("#pcp")
        .append("svg")
            .attr("class", "svg_pcp")
            .attr("width", svgWidth)
            .attr("height", svgHeight);
    /*Heading*/
    // svg.append("text")
    //     .attr("x", (width / 2))
    //     .attr("y", 20)
    //     .attr("font-size", "24px")
    //     .style("text-anchor", "middle")
    //     .text("Parallel Coordinate Plot");

    svg.append("text")
            .attr("x", (svgWidth / 2))
            .attr("y", 15 )
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill","#ccc")
            // .style("text-decoration", "underline")
            .attr("font-family", "arial")
            .attr("font-weight", "bold")
            .text("Parallel Coordinate Plot");

    var g = svg.append("g")
        .attr("transform", "translate(" + 40 + "," + 50 + ")");

    dimensions = d3.keys(data[0]).filter(function(d) { return (d != "Country" && d != "Alcohol_beer" && d != "Alcohol_wine" && d != "Alcohol_spirits" && d != "Alcohol_other" && d != "Positive_affect" && d != "Negative_affect") });
    dimensions= ["Continent", "Generosity", "Log_GDP_per_capita", "Life_Ladder", "Perceptions_of_corruption", "Freedom_to_make_life_choices", "Alcohol_all", "Healthy_life_expectancy_at_birth", "Social_support"];
    for (i in dimensions) {
        attrName = dimensions[i]
        if(attrName == "Continent") {
            // y[attrName] = d3.scaleBand()
            //   .domain(data.map(function(p) { return p[attrName]; }))
            //   .range([height - 30, 0]);
            y[attrName] = d3.scaleLinear()
                .range([height - 30, 0])
                .domain([5, 0]);
                // .domain(["Asia", "Europe", "Africa", "North America", "South America", "Oceania"]);


        }
        else {
            var y_min = d3.min(data, function(d) {
                if (d[attrName] == "null")  return 0;
                else return +d[attrName]; });
            var y_max = d3.max(data, function(d) {
                if (d[attrName] == "null")  return 0;
                else return +d[attrName]; });
            y[attrName] = d3.scaleLinear()
            // .domain( d3.extent(data, function(d) { return +d[attrName]; }) )
            .domain([y_min, y_max])
            .range([height - 30, 0]);
        }
    }
    x.domain(dimensions);

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    background = g.append("g")
        .attr("class", "background_pcp")
        .selectAll("path")
        .data(data)
        .enter().append("path")
            .attr("class", "path_pcp")
            .attr("d", path)
            .style("stroke", function(d) {
                //return "#08306B";
                return "#222";
                //return color(d.ClusterID + 1);
                // return continent_colors[d["Continent"]];
            });

    foreground = g.append("g")
        .attr("id", "pathsss")
        .attr("class", "foreground_pcp")
        .selectAll("path")
        .data(data)
        .enter().append("path")
            .attr("d", path)
            .attr("class", "path_pcp")
            .style("stroke", function(d) {
                //return "#08306B";
                // return pcp_blue; here
                //return color(d.ClusterID + 1);
                if (color_theme == "whole") {
                    if (d["Country"] == max_country)        return "#ff004b";
                    else if (d["Country"] == min_country)   return "#ffff00";
                    else return white;
                }
                else return continent_colors[d["Continent"]];
            })
            .style("opacity", 0.4);

    /* Add a group element for each dimension*/
    g = g.selectAll(".dimension")
    .data(dimensions)
    .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.drag()
                .subject(function(d) { return {x: x(d)}; })
                .on("start", function(d) {
                    dragging[d] = x(d);
                    background.attr("visibility", "hidden");
                })
                .on("drag", function(d) {
                    dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                    foreground.attr("d", path);
                    dimensions.sort(function(a, b) { return position(a) - position(b); });
                    x.domain(dimensions);
                    g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                })
                .on("end", function(d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                    transition(foreground)
                        .attr("d", path);
                    background
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                })
            )

    /* Add an axis and title*/
    // g.append("g")
    //     .attr("class", "axis_pcp")
    //     .each(function(d) { d3.select(this).call(axis.scale(y[d])); })
    //     .append("text")
    //         .style("text-anchor", "middle")
    //         .style("font-size", "12px")
    //         .style("fill", "white")
    //         .attr("y", -9)
    //         .attr("transform", "rotate(343)")
    //         .text(function(d) { return d.toLowerCase().replaceAll("_", " ").replace("gdp", "GDP"); });


    g.append("g")
        .attr("class", "axis_pcp")
        .each(function(d) {
            if (d != "Continent") {
                d3.select(this).call(d3.axisLeft().scale(y[d]));
            }
            else {
                d3.select(this).call(d3.axisLeft().scale(y[d])
                                        .tickValues([0,1,2,3,4,5])
                                        .tickFormat(function(p, i) { console.log(["Asia", "Europe", "Africa", "North America", "South America", "Oceania"][i]);return ["Asia", "Europe", "Africa", "North America", "South America", "Oceania"][i]; })
                )
            }
        })
        .append("text")
            .style("text-anchor", "middle")
            .style("font-size", "12px")
            .style("fill", "white")
            .attr("y", -9)
            .attr("transform", "rotate(343)")
            .text(function(d) { return d.toLowerCase().replaceAll("_", " ").replace("gdp", "GDP").replace("healthy life expectancy at birth", "healthy life expectancy").replace("freedom to make life choices", "freedom-life choices").replace("perceptions of corruption", "corruption perception"); });

    /*Add and store a brush for each axis*/
    g.append("g")
        .attr("class", "brush_pcp")
        .each(function(d) {
            d3.select(this)
                    .call(y[d].brush = d3.brushY()
                                            .extent([[-8, y[d].range()[1]], [8, y[d].range()[0]]])
                                                .on("start", brushstart)
                                                .on("brush", brush)
                                                .on("end", brushend)
                    );
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

    /*Legend*/
    var legend = svg.selectAll(".legend")
        .data(color.domain())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {
            return "translate(30," + (i + 3) * 20 + ")";
        });

    legend.append("rect")
        .attr("x", width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) {
            return d;
        });

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    /*Returns the path for a given data point*/
    function path(d) {
        return line(dimensions.map(function(p) {
            var val = d[p];
            if(val == null || val == "null") {
               val = 0;
            }
            if (p == "Continent") return [position(p), y[p](continent_number[val])]//+3]
            else return [position(p), y[p](val)];
        }));
    }

    function brushstart() {
        d3.event.sourceEvent.stopPropagation();
    }

    /*Handles a brush event, toggling the display of foreground lines*/
    function brush() {
        const actives = [];
        /*filter brushed extents*/
        svg.selectAll('.brush_pcp')
            .filter(function(d) {
                return d3.brushSelection(this);
            })
            .each(function(d) {
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this)
                    });
            });

        /*set un-brushed foreground line disappear*/
        foreground.style('display', function(d) {
            return actives.every(function(active) {
                const dim = active.dimension;
                if (active.dimension != "Continent")
                    return active.extent[0] <= y[dim](d[dim]) && y[dim](d[dim]) <= active.extent[1];
                else return active.extent[0] <= y[dim](continent_number[d[dim]]) && y[dim](continent_number[d[dim]]) <= active.extent[1]
            }) ? null : 'none';
        });
    }

    function brushend() {
        if (!d3.event.selection) {
            foreground.style("display", null);
            d3.selectAll(".selection").style("display", 'none');
            //d3.selectAll(".handle").style("display", 'none');
        }
    }
}
