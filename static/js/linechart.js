var line_attrs = ["Healthy_life_expectancy_at_birth"];


var width_line = 390, height_line = 280;
var margin_line = {top: 50, bottom: 30, left: 100, right: 30};
var svg_width_line = width_line - margin_line.left - margin_line.right,
    svg_height_line = height_line - margin_line.top - margin_line.bottom;
var svg_line = "";
// var svg_line = d3.select("#linechart")
//     .append("svg")
//         .attr("class", "linechart_svg")
//         .attr("width", width_line)
//         .attr("height", height_line)
//     .append("g")
//         .attr("transform", "translate(" + (margin_line.left - 55) + ", " + (margin_line.top - 25) + ")");

var tip_line = d3.tip()
                .attr("class", "d3-tip")
                .offset([-10, 0])
                .html(function(d, i) {
                    return "<strong>"+d[i]["attr"].toLowerCase().replaceAll("_", " ").replaceAll("gdp", "GDP")+"</strong>";
                    // if (i == 0)         return "<strong>Beer: </strong><span class='details'>"+d;
                    // else if (i == 1)    return "<strong>Wine: </strong><span class='details'>"+d;
                    // else if (i == 2)    return "<strong>Spirits: </strong><span class='details'>"+d;
                    // else if (i == 3)    return "<strong>Other: </strong><span class='details'>"+d;
                });


$.post("/linechart", function(d) { drawLinechart(d); });

d3.select("#select_line_attrs")
    .on("change", function(d) {
        var temp = [];
        for (var attr of line_attrs)
            temp.push(attr);
        emptyArray(line_attrs);
        console.log(temp);
        for (var option of d3.select("#select_line_attrs").property("selectedOptions"))
            line_attrs.push(option.value);
        for (var attr of temp)
            if (!line_attrs.includes(attr))
                svg_line.selectAll("#label_"+attr).remove();
        updateLinechart();
    });

function updateLinechart() {
    // svg_line.selectAll("path").remove();
    d3.selectAll(".linechart_svg").remove();
    svg_line.selectAll("#country_name").remove();
    d3.selectAll("#data_line").remove();
    $.post("/linechart", function(d) { drawLinechart(d); });
}

function drawLinechart(data) {
    d3.selectAll(".linechart_svg").remove();
    svg_line = d3.select("#linechart")
    .append("svg")
        .attr("class", "linechart_svg")
        .attr("width", width_line)
        .attr("height", height_line)
    .append("g")
        .attr("transform", "translate(" + (margin_line.left - 55) + ", " + (margin_line.top - 25) + ")");
    svg_line.call(tip_line);
    var max = 0;
    var linechart_title = "";
    var attr_values = new Map();
    var years = [];
    for (var year = 2005; year < 2021; year++)
        years.push(year.toString());

    if (selected_countries.length > 0) {
        linechart_title = "selected countries";

        for (var attr of line_attrs) {
            var attr_year_values = new Map();

            for (var year of years)
                attr_year_values[year.toString()] = "null";


            for (var year of Object.keys(data[attr])) {
                var country_count = 0;
                for (var country of Object.keys(data[attr][year])) {
                    if (selected_countries.includes(country)) {
                        if (data[attr][year][country] != "null") {
                            country_count += 1;
                            if (attr_year_values[year] == "null")
                                attr_year_values[year] = data[attr][year][country];
                            else attr_year_values[year] += data[attr][year][country];
                        }
                        else attr_year_values[year] = "null";
                    }
                }
                if (attr_year_values[year] != "null")
                    attr_year_values[year] = attr_year_values[year]/country_count;
            }
            attr_values[attr] = [];
            for (var year of years) {
                if (attr_year_values[year] != "null")
                    attr_values[attr].push({"attr": attr, "year": year, "value": attr_year_values[year]});
            }
        }
    }

    else if (selected_country == "none") {
        linechart_title = "all countries";

        for (var attr of line_attrs) {
            var attr_year_values = new Map();

            for (var year of years)
                attr_year_values[year.toString()] = "null";

            for (var year of Object.keys(data[attr])) {
                // year = parseInt(year);
                for (var country of Object.keys(data[attr][year])) {
                    if (data[attr][year][country] != "null") {
                        if (attr_year_values[year] == "null")
                            attr_year_values[year] = data[attr][year][country];
                        else attr_year_values[year] += data[attr][year][country];
                    }
                }
                if (attr_year_values[year] != "null")
                    attr_year_values[year] = attr_year_values[year]/Object.keys(data[attr][year]).length;
            }
            attr_values[attr] = [];
            for (var year of years) {
                if (attr_year_values[year] != "null")
                    attr_values[attr].push({"attr": attr, "year": year, "value": attr_year_values[year]});
            }
        }
    }

    else {
        linechart_title = selected_country;
        console.log(selected_country);
        for (var attr of line_attrs) {
            var attr_year_values = new Map();

            for (var year of years)
                attr_year_values[year.toString()] = "null";

            for (var year of Object.keys(data[attr])) {
                if (data[attr][year][selected_country] != "null" && data[attr][year][selected_country] != undefined) {
                    if (attr_year_values[year] == "null")
                        attr_year_values[year] = data[attr][year][selected_country];
                    else attr_year_values[year] += data[attr][year][selected_country];
                }
            }
            attr_values[attr] = [];
            for (var year of years) {
                if (attr_year_values[year] != "null")
                    attr_values[attr].push({"attr": attr, "year": year, "value": attr_year_values[year]});
            }
        }
    }


    var x = d3.scaleBand()
        .domain(years)
        .range([0, svg_width_line]);

    svg_line.append("g")
        .attr("class", "axisWhite")
        .attr("id", "x_axis")
        .attr("font-family", "arial")
        .attr("transform", "translate(0, " + svg_height_line + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "rotate(45)")
        .style("text-anchor", "start");

    var y = d3.scaleLinear()
        .domain([1, 0])
        .range([0, svg_height_line]);

    svg_line.append("g")
        .attr("class", "axisWhite")
        .attr("id", "y_axis")
        .call(d3.axisLeft(y));

    svg_line.append("text")
        .attr("id", "country_name")
        .attr("font-family", "arial")
        .attr("font-weight", "bold")
        .attr("transform", "translate(" + (svg_width_line/2) + ", " + (-10) + ")")
        .style("text-anchor", "middle")
        .text(linechart_title);

    for (var attr of line_attrs) {
        svg_line.append("path")
            .attr("id", "data_line")
            .datum(attr_values[attr])
            .attr("fill", "none")
            .attr("stroke", light_blue)
            .attr("stroke-width", 2)
            .attr("d", d3.line()
                .x(function(d) { if (d["value"] != "null") return x(d["year"]); })
                .y(function(d) { if (d["value"] != "null") return y(d["value"]); })
            );
            // .mouseover();

        // svg_line.append("text")
    	// 	.attr("transform", "translate(" + (svg_width_line+3) + "," + y(attr_values[attr][attr_values[attr].length-1]["value"]) + ")")
        //     .attr("id", "label_"+attr)
        //     .attr("dy", ".35em")
    	// 	.attr("text-anchor", "start")
    	// 	.style("fill", "white")
        //     .style("font-size", "10px")
    	// 	.text(attr.replaceAll("_", " ").toLowerCase().replace("gdp", "GDP"));
    }
    svg_line.selectAll("#data_line")
            .on("mouseover", function(d, i) { tip_line.show(d, i); d3.select(this).style("stroke", "red");})
            .on("mouseout", function(d, i) { tip_line.hide(d, i); d3.select(this).style("stroke", light_blue);})
}
