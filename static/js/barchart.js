var width_bar = 350, height_bar = 280;
var margin_bar = {top: 50, bottom: 30, left: 100, right: 30};
var svg_width_bar = width_bar - margin_bar.left - margin_bar.right,
    svg_height_bar = height_bar - margin_bar.top - margin_bar.bottom;

var svg_bar = d3.select("#barchart")
    .append("svg")
        .attr("width", width_bar)
        .attr("height", height_bar)
    .append("g")
        .attr("transform", "translate(" + (margin_bar.left - 55) + ", " + (margin_bar.top - 25) + ")");

$.post("/barchart", function(d) { drawBarchart(d[year], "none"); });

function updateBarchart() {
    svg_bar.selectAll("*").remove();
    $.post("/barchart", function(d) { drawBarchart(d[year], selected_country); });
}

function drawBarchart(data, country_name) {
    var max = 0;
    var beer = 0, wine = 0, spirits = 0, other = 0;

    if (country_name == "none") {
        for (var i = 0; i < data.length; i++) {
            if (data[i]["Alcohol_beer"] != "null")
                beer += data[i]["Alcohol_beer"];
            if (data[i]["Alcohol_wine"] != "null")
                wine += data[i]["Alcohol_wine"];
            if (data[i]["Alcohol_spirits"] != "null")
                spirits += data[i]["Alcohol_spirits"];
            if (data[i]["Alcohol_other"] != "null") {
                other += data[i]["Alcohol_other"];
            }
        }
    }

    else {
        for (var i = 0; i < data.length; i++) {
            if (data[i]["Country"] == country_name) {
                beer = data[i]["Alcohol_beer"];
                wine = data[i]["Alcohol_wine"];
                spirits = data[i]["Alcohol_spirits"];
                other = data[i]["Alcohol_other"];
                break;
            }
        }
    }

    max = Math.max(beer, wine, spirits, other);

    var alcohol_labels = ["Beer", "Wine", "Spirits", "Other"];

    var x = d3.scaleBand()
        .domain(alcohol_labels)
        .range([0, svg_width_bar]);

    svg_bar.append("g")
        .attr("class", "axisWhite")
        .attr("id", "x_axis")
        .attr("font-family", "arial")
        .attr("transform", "translate(0, " + svg_height_bar + ")")
        .call(d3.axisBottom(x));

    var y = d3.scaleLinear()
        .domain([max, 0])
        .range([0, svg_height_bar]);

    svg_bar.append("g")
        .attr("class", "axisWhite")
        .attr("id", "y_axis")
        .call(d3.axisLeft(y));
// selected_country.replaceAll("none", "all countries")

    svg_bar.append("text")
        .attr("id", "country_name")
        .attr("font-family", "arial")
        .attr("font-weight", "bold")
        .attr("transform", "translate(" + (svg_width_bar/2) + ", " + (-10) + ")")
        .style("text-anchor", "middle")
        .text(selected_country.replaceAll("none", "all countries"));

    svg_bar.append("text")
        .attr("id", "graph_type")
        .attr("font-family", "arial")
        .attr("transform", "rotate(270)")
        .attr("x", 0 - (svg_height_bar / 2))
        .attr("y", 0 - margin_bar.left/2+20)
        .style("text-anchor", "middle")
        .text("alcohol consumption");

    svg_bar.selectAll("rect")
        .attr("id", "bars")
        .data([beer, wine, spirits, other])
        .enter()
        .append("rect")
        .attr("transform", function(d, i) { return "translate("+(x(alcohol_labels[i])+svg_width_bar/16)+","+y(d)+")"})
        .attr("width", svg_width_bar/8)
        .attr("height", function(d) { return svg_height_bar-y(d); })
        .style("fill", light_blue);

        // .attr("x", function(d, i) { return i*x.bandwidth()/4; })
        // .attr("y", svg_)
        // .attr("width", svg_width_bar*(2/3)/4)
        // .attr("height", function(d) { return y(d); })
        // .style("fill", white);
}
