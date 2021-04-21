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

/* add slider and function to update year value */
/* add dropdown buttons to change x-axis and y-axis attributes */
var x_attr = "Life_Ladder",
    y_attr = "Social_support";
$.post("/scatterplot", function(d) { drawScatterplot(d[year], x_attr, y_attr); });

function updateScatterplot() {
    svg_scat.selectAll("*").remove();
    $.post("/scatterplot", function(d) { drawScatterplot(d[year], x_attr, y_attr); });
}

function selectAxisAttribute() {
    dropdown_x = document.getElementById("select_x_attr");
    dropdown_y = document.getElementById("select_y_attr");
    x_attr = dropdown_x.options[dropdown_x.selectedIndex].value;
    y_attr = dropdown_y.options[dropdown_y.selectedIndex].value;
    updateScatterplot();
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
        .text(x_attr);

    svg_scat.append("text")
        .attr("id", "y_attr")
        .attr("font-family", "arial")
        .attr("transform", "rotate(270)")
        .attr("x", 0 - (svg_height_scat / 2))
        .attr("y", 0 - margin_scat.left/2+20)
        .style("text-anchor", "middle")
        .text(y_attr);

    x_min = d3.min(data, function(d) { return d[x_attr]; });
    x_max = d3.max(data, function(d) { return d[x_attr]; });

    y_min = d3.min(data, function(d) { return d[y_attr]; });
    y_max = d3.max(data, function(d) { return d[y_attr]; });

    x = d3.scaleLinear()
        .domain([x_min, x_max])
        .range([0, svg_width_scat]);

    svg_scat.append("g")
        .attr("id", "x_axis")
        .attr("font-family", "arial")
        .attr("transform", "translate(0, " + svg_height_scat + ")")
        .call(d3.axisBottom(x));

    y = d3.scaleLinear()
        .domain([y_max, y_min])
        .range([0, svg_height_scat]);

    svg_scat.append("g")
        .attr("id", "y_axis")
        .call(d3.axisLeft(y));

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
            revised_data.push({"x_val": data[i][x_attr], "y_val": data[i][y_attr], "count": 1});
    }

    svg_scat.append("g")
        .selectAll("dot")
        .data(revised_data)
        .enter()
        .append("circle")
            .attr("cx", function(d) { return x(d["x_val"]); })
            .attr("cy", function(d) { return y(d["y_val"]); })
            .attr("r", function(d) { return 2 * Math.sqrt(d["count"]); })
            .style("fill", "#ffffff");
}
