/* add slider and function to update year value */
/* add dropdown buttons to change x-axis and y-axis attributes */

/* This solves the dropdown problem */
$(document).ready(function(){
    $('select').not('.disabled').formSelect();
});

var white = "#ffffff";
var orange = "#ec7014";
var deep_blue = "#21457a";
var light_blue = "#768daf";

var x_attr = "Life_Ladder",
    y_attr = "Healthy_life_expectancy_at_birth";

var selected_countries = [];
var attributes = [];

$.post("/attributes", function(d) {
    for (var i = 0; i < d["attributes"].length; i++) {
        attributes.push(d["attributes"][i]);
    }
});

d3.select("#select_x_attr")
    .on("change", function(d) {
        x_attr = d3.select(this).property("value");
        updateScatterplot();
    });

d3.select("#select_y_attr")
    .on("change", function(d) {
        y_attr = d3.select(this).property("value");
        updateScatterplot();
    });

var width_scat = 350, height_scat = 280;
var margin_scat = {top: 30, bottom: 30, left: 100, right: 30};
var svg_width_scat = width_scat - margin_scat.left - margin_scat.right,
    svg_height_scat = height_scat - margin_scat.top - margin_scat.bottom;

var svg_scat = d3.select("#scatterplot")
    .append("svg")
        .attr("width", width_scat)
        .attr("height", height_scat)
    .append("g")
        .attr("transform", "translate(" + (margin_scat.left - 55) + ", " + (margin_scat.top - 25) + ")");

var tip_scat = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(function(d) {
              return "<strong>Country: </strong><span class='details'>"+d["country"]+"<br></span>"
              +"<strong>"+x_attr+": </strong><span class='details'>"+d["x_val"]+"<br></span>"
              +"<strong>"+y_attr+": </strong><span class='details'>"+d["y_val"]+"<br></span>";
            });

svg_scat.call(tip_scat);

$.post("/scatterplot", function(d) { drawScatterplot(d[year], x_attr, y_attr); });

function updateScatterplot() {
    svg_scat.selectAll("*").remove();
    $.post("/scatterplot", function(d) { drawScatterplot(d[year], x_attr, y_attr); });
}

function drawScatterplot(data, x_attr, y_attr) {
    var x, y;
    var x_min, x_max, y_min, y_max;
    var revised_data = [];

    svg_scat.append("text")
        .attr("id", "x_attr")
        .attr("font-family", "arial")
        .attr("transform", "translate("+(svg_width_scat/2)+", "+(svg_height_scat+margin_scat.bottom)+")")
        .style("text-anchor", "middle")
        .text(x_attr.replaceAll("_", " ").toLowerCase().replace("gdp", "GDP"));

    svg_scat.append("text")
        .attr("id", "y_attr")
        .attr("font-family", "arial")
        .attr("transform", "rotate(270)")
        .attr("x", 0 - (svg_height_scat / 2))
        .attr("y", 0 - margin_scat.left/2+20)
        .style("text-anchor", "middle")
        .text(y_attr.replaceAll("_", " ").toLowerCase().replace("gdp", "GDP"));

    var flag = 0;
    for (var i = 0; i < data.length; i++) {
        flag = 0;
        if (data[i][x_attr] == "null" || data[i][y_attr] == "null")
            continue;
        for (var j = 0; j < revised_data.length; j++) {
            if((revised_data[j]["x_val"] == data[i][x_attr]) && (revised_data[j]["y_val"] == data[i][y_attr])) {
                revised_data[j]["count"] += 1;
                flag = 1;
                break;
            }
        }
        if (flag == 0)
            revised_data.push({"x_val": data[i][x_attr], "y_val": data[i][y_attr], "country": data[i]["Country"], "count": 1});
    }

    x_min = d3.min(revised_data, function(d) { return d["x_val"]; });
    x_max = d3.max(revised_data, function(d) { return d["x_val"]; });

    y_min = d3.min(revised_data, function(d) { return d["y_val"]; });
    y_max = d3.max(revised_data, function(d) { return d["y_val"]; });

    x = d3.scaleLinear()
        .domain([x_min, x_max])
        .range([0, svg_width_scat]);

    svg_scat.append("g")
        .attr("class", "axisWhite")
        .attr("id", "x_axis")
        .attr("font-family", "arial")
        .attr("transform", "translate(0, " + svg_height_scat + ")")
        .call(d3.axisBottom(x));

    y = d3.scaleLinear()
        .domain([y_max, y_min])
        .range([0, svg_height_scat]);

    svg_scat.append("g")
        .attr("class", "axisWhite")
        .attr("id", "y_axis")
        .call(d3.axisLeft(y));



    svg_scat.append("g")
        .call(d3.brush()
            .extent([[0, 0], [svg_width_scat, svg_height_scat]])
            .on("brush", brushed)
            .on("end", brushended));

    svg_scat.append("g")
        .selectAll("dot")
        .data(revised_data)
        .enter()
        .append("circle")
            .attr("cx", function(d) { return x(d["x_val"]); })
            .attr("cy", function(d) { return y(d["y_val"]); })
            .attr("r", function(d) { return 3 * Math.sqrt(d["count"]); })
            .style("fill", white)
            .on("mouseover", function(d) {
                tip_scat.show(d);
                d3.select(this)
                    // .attr("r", function(d) { return 7*Math.sqrt(d["count"]); })
                    .style("fill", light_blue);
                    // .style("stroke", white);
                    // .style("stroke-width", 2);
            })
            .on("mouseout", function(d) {
                tip_scat.hide(d);
                if (!selected_countries.includes(d["country"]))
                    d3.select(this)
                        // .attr("r", function(d) { return 3*Math.sqrt(d["count"]); })
                        .style("fill", white);
            });

    function brushed() {
        emptyArray(selected_countries);

        var s = d3.event.selection,
            x0 = s[0][0],
            y0 = s[0][1],
            dx = s[1][0] - x0,
            dy = s[1][1] - y0;


        svg_scat.selectAll("circle")
            .style("fill", function (d) {
                if (x(d["x_val"]) >= x0 && x(d["x_val"]) <= x0 + dx
                 && y(d["y_val"]) >= y0 && y(d["y_val"]) <= y0 + dy) {
                     selected_countries.push(d["country"]);
                     /* UPDATE OTHER PLOTS */
                     return light_blue;//deep_blue;
                 }
                 else  {
                    //removeFromArray(selected_countries, d["country"]);
                    /* UPDATE OTHER PLOTS */
                    return white;
                 }
            });
            // .style("stroke-width", function(d) {
            //     if (selected_countries.includes(d["country"])) return 2;
            //     else return 0;
            // });
        getDataDrawPie();
        updateBarchart();
        for (var attr of line_attrs)
            svg_line.selectAll("#label_"+attr).remove();
        svg_line.selectAll("path").remove();
        updateLinechart();
    }

    function brushended() {
        getDataDrawPie();
        if (!d3.event.selection) {
            emptyArray(selected_countries);
            svg_scat.selectAll("circle")
                .transition()
                .duration(150)
                .ease(d3.easeLinear)
                .style("fill", white);
            /* UPDATE OTHER PLOTS */
        }
        for (var attr of line_attrs)
            svg_line.selectAll("#label_"+attr).remove();
        updateLinechart();
    }
}

function emptyArray(array) {
    while (array.length) {
        array.pop();
    }
}

function removeFromArray(array, element) {
    var index = array.indexOf(element);
    while (index > -1) {
        array.splice(index, 1);
        index = array.indexOf(element);
    }
}
