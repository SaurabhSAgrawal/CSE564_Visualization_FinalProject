function drawScatterplot(data, x_attr, y_attr) {
    var data = [];
    var x, y;
    var x_min, x_max, y_min, y_max;

    svg_scat.append("text")
        .attr("id", "x_attr")
        .attr("font-family", "arial")
        .attr("transform", "translate("+(svg_width_1/2)+", "+(svg_height+margin.bottom)+")")
        .style("text-anchor", "middle")
        .text(x_attr);

    svg_scat.append("text")
        .attr("id", "y_attr")
        .attr("font-family", "arial")
        .attr("transform", "rotate(270)")
        .attr("x", 0 - (svg_height / 2))
        .attr("y", 0 - margin.left + 10)
        .style("text-anchor", "middle")
        .text(y_attr);

    x_min = d3.min(data, function(d) { return d[x_attr]; });
    x_max = d3.max(data, function(d) { return d[x_attr]; });

    y_min = d3.min(data, function(d) { return d[y_attr]; });
    y_max = d3.max(data, function(d) { return d[y_attr]; });

    x = d3.scaleLinear()
        .domain([x_min, x_max])
        .range([0, svg_width_1]);

    svg_scat.append("g")
        .attr("id", "x_axis")
        .attr("font-family", "arial")
        .attr("transform", "translate(0, " + svg_height + ")")
        .call(d3.axisBottom(x));

    y = d3.scaleLinear()
        .domain([y_max, y_min])
        .range([0, svg_height]);

    svg_scat.append("g")
        .attr("id", "y_axis")
        .call(d3.axisLeft(y));
}


function drawScatterplot_1(x_attribute, y_attribute) {
    var x, y;
    var x_min, x_max, y_min, y_max;
    revised_data = [];

    /* X-axis */
    if (x_attribute != undefined) {
        svg.append("text")
            .attr("id", "x_attr")
            .attr("font-family", "arial")
            .attr("transform", "translate(" + (svg_width/2) + ", " + (svg_height + 70) + ")")
            .style("text-anchor", "middle")
            .text(x_attribute);

        // NUMERICAL
        if (numerical.includes(x_attribute)) {
            x_min = d3.min(adult, function(d) { return d[x_attribute]; });
            x_max = d3.max(adult, function(d) { return d[x_attribute]; });

            x = d3.scaleLinear()
                .domain([x_min, x_max])
                .range([0, svg_width]);

            svg.append("g")
                .attr("id", "x_axis")
                .attr("font-family", "arial")
                .attr("transform", "translate(0, " + svg_height + ")")
                .call(d3.axisBottom(x));
        }

        // CATEGORICAL
        else if (categorical.includes(x_attribute)) {
            x = d3.scaleBand()
                .domain(categories[x_attribute])
                .range([0, svg_width]);

            svg.append("g")
                .attr("id", "x_axis")
                .attr("font-family", "arial")
                .attr("transform", "translate(0, " + svg_height + ")")
                .call(d3.axisBottom(x))
                .selectAll("text")
                    .attr("transform", "rotate(315)");
        }
    }

    /* Y-axis */
    if (y_attribute != undefined) {
        svg.append("text")
            .attr("id", "y_attr")
            .attr("font-family", "arial")
            .attr("transform", "rotate(270)")
            .attr("x", 0 - (svg_height / 2))
            .attr("y", 0 - margin.left + 10)
            .style("text-anchor", "middle")
            .text(y_attribute);

        if (numerical.includes(y_attribute)) {
            y_min = d3.min(adult, function(d) { return d[y_attribute]; });
            y_max = d3.max(adult, function(d) { return d[y_attribute]; });

            y = d3.scaleLinear()
                .domain([y_max, y_min])
                .range([0, svg_height]);

            svg.append("g")
                .attr("id", "y_axis")
                .call(d3.axisLeft(y));
        }

        else if (categorical.includes(y_attribute)) {
            y = d3.scaleBand()
                .domain(categories[y_attribute])
                .range([0, svg_height]);

            svg.append("g")
                .attr("id", "y_axis")
                .call(d3.axisLeft(y));

        }
    }

    if ((x_attribute != undefined) && (y_attribute != undefined)) {
        var flag = 0;
        for (var i = 0; i < num_instances; i++) {
            flag = 0;
            for (var j = 0; j < revised_data.length; j++) {
                if ((revised_data[j]["x_val"] == adult[i][x_attribute]) && (revised_data[j]["y_val"] == adult[i][y_attribute])) {
                    revised_data[j]["count"] += 1;
                    flag = 1;
                    break;
                }
            }
            if (flag == 0) revised_data.push({"x_val": adult[i][x_attribute], "y_val": adult[i][y_attribute], "count": 1});
        }

        svg.append("g")
            .selectAll("dot")
            .data(revised_data)
            .enter()
            .append("circle")
                .attr("cx", function(d) {
                    if (numerical.includes(x_attribute))
                        return x(d["x_val"]);
                    else if (categorical.includes(x_attribute))
                        return x(d["x_val"]) + (svg_width / (2 * categories[x_attribute].length)); })
                .attr("cy", function(d) {
                    if (numerical.includes(y_attribute))
                        return y(d["y_val"]);
                    else if (categorical.includes(y_attribute))
                        return y(d["y_val"]) + (svg_height / (2 * categories[y_attribute].length)); })
                .attr("r", function(d) { return 2 * Math.sqrt(d["count"]); })
                .style("fill", "#ff004b");
    }
}
