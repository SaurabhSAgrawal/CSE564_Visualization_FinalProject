getDataDrawPie();

function getDataDrawPie() {
    $.post("/piechart", {
        'year': year, 'countrylist': selected_countries, 'country': selected_country
    }, function(result) {
        pie_data = result;
        //console.log(pie_data);
        drawPieChart(pie_data);
    })
}
//drawPieChart([{"name":"Positive Affect", "value":60}, {"name":"Negative Affect", "value":40}])
function drawPieChart(pie_data) {
    d3.select("#piechart svg").remove();
    d3.select("#piechartlegend div").remove();

    var widthpie = 300;
    var heightpie= 220;
    var paddingpie = 0;
    var opacitypie = .8;

    var radius = Math.min(widthpie - paddingpie, heightpie - paddingpie) / 2;
    radius = radius - 25;
    var color = d3.scaleOrdinal().domain(pie_data)
                                .range(["#F7FBFF", "rgb(118, 141, 175)"]);

    var svg3 = d3.select("#piechart")
                    .append('svg')
                    .attr('class', 'pie')
                    .attr('width', widthpie)
                    .attr('height', heightpie);

    svg3.append("text")
            .attr("x", (widthpie / 2))
            .attr("y", 15 )
            .attr("text-anchor", "middle")
            .style("font-size", "16px")
            .style("fill","#ccc")
            // .style("text-decoration", "underline")
            .attr("font-family", "arial")
            .attr("font-weight", "bold")
            .text("Positive/Negative Affect");

    var g1 = svg3.append('g')
                    .attr('transform', 'translate(' + (widthpie / 2) + ',' + ((heightpie + 30) / 2) + ')');

    var arc = d3.arc()
                .innerRadius(0)
                .outerRadius(radius);

    var pie = d3.pie()
                .value(function(d) { return d.value; })
                .sort(null);

    var pathpie = g1.selectAll('pie_path')
                    .attr("class", "pieclass")
                    .data(pie(pie_data))
                    .enter()
                    .append("g")
                    .append('path')
                    .attr('d', arc)
                    .attr('fill', (d,i) => color(i))
                    .style('opacity', opacitypie)
                    .transition()
                    .duration(function(d, i) {
                        return i * 800;
                        })
                        .attrTween('d', function(d) {
                        var i = d3.interpolate(d.startAngle + 0.1, d.endAngle);
                        return function(t) {
                            d.endAngle = i(t);
                            return arc(d);
                        }
                    })
                    .each(function(d, i) { this._current = i; });

    let legend = d3.select("#piechartlegend").append('div')
                .attr('class', 'legend')
                .style('margin-top', '5px');

    let keys = legend.selectAll('.key')
                .data(pie_data)
                .enter().append('div')
                .attr('class', 'key')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('margin-right', '20px');

    keys.append('div')
        .attr('class', 'symbol')
        .style('height', '10px')
        .style('width', '10px')
        .style('margin', '5px 5px')
        .style('background-color', (d, i) => color(i));

    keys.append('div')
        .attr('class', 'name')
        .text(d => `${d.name} (${d.value}%)`);

    keys.exit().remove();
}
