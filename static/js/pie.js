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
    var opacityHoverpie = 1;
    var otherOpacityOnHoverpie = .8;
    var tooltipMarginpie = 0;

    var radius = Math.min(widthpie - paddingpie, heightpie - paddingpie) / 2;
    radius = radius - 20;
    var color = d3.scaleOrdinal().domain(pie_data)
                                .range(["#F7FBFF", "#08306B"]);

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
            .style("text-decoration", "underline")  
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
                    .style('stroke', 'white')
                    .on("mouseover", function(d) {
                        d3.selectAll('pie_path')
                          .style("opacity", otherOpacityOnHoverpie);
                        d3.select(this) 
                          .style("opacity", opacityHoverpie);
                  
                        // let g1 = d3.select("svg").
                        // transition()
                        // .duration(700)
                        //   .style("cursor", "pointer")
                        //   .append("g")
                        //   .attr("class", "tooltip")
                        //   .style("opacity", 0);
                   
                        // g1.append("text")
                        //   .attr("class", "name-text")
                        //   .text(`${d.pie_data.name} (${d.pie_data.value})`)
                        //   .attr('text-anchor', 'middle');
                      
                        // let textpie = g1.select("text");
                        // let bboxpie = textpie.node().getBBox();
                        // let paddingpie = 2;
                        // g1.insert("rect", "text")
                        //   .attr("x", bboxpie.x - paddingpie)
                        //   .attr("y", bboxpie.y - paddingpie)
                        //   .attr("width", bboxpie.width + (paddingpie*2))
                        //   .attr("height", bboxpie.height + (paddingpie*2))
                        //   .style("fill", "white")
                        //   .style("opacity", 0.75);
                      })
                    // .on("mousemove", function(d) {
                    //       let mousePositionpie = d3.mouse(this);
                    //       let x = mousePositionpie[0] + widthpie/2;
                    //       let y = mousePositionpie[1] + heightpie/2 - tooltipMarginpie;
                      
                    //       let textpie = d3.select('.tooltip text');
                    //       let bboxpie = textpie.node().getBBox();
                    //       if(x - bboxpie.width/2 < 0) {
                    //         x = bboxpie.width/2;
                    //       }
                    //       else if(widthpie - x - bboxpie.width/2 < 0) {
                    //         x = widthpie - bboxpie.width/2;
                    //       }
                      
                    //       if(y - bboxpie.height/2 < 0) {
                    //         y = bboxpie.height + tooltipMarginpie * 2;
                    //       }
                    //       else if(heightpie - y - bboxpie.height/2 < 0) {
                    //         y = heightpie - bboxpie.height/2;
                    //       }
                      
                    //       d3.select('.tooltip')
                    //         .style("opacity", 1)
                    //         .attr('transform',`translate(${x}, ${y})`);
                    //   })
                    .on("mouseout", function(d) {   
                        d3.select("svg")
                          .style("cursor", "none")  
                          .select(".tooltip").remove();
                      d3.selectAll('.pieclass')
                          .style("opacity", opacitypie);
                      })
                    // .on("touchstart", function(d) {
                    //     d3.select(".pie")
                    //       .style("cursor", "none");    
                    // })
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