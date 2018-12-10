var BarChart = {
    draw: function(id, data, color, old_color){
        console.log(data[0].number)
        var width = 740,
            height = 250;

        d3.select(id).select("svg").remove();

        var tooltip;
        var data_oringal = []
        // record orignial data before sorting
        data.forEach(function(n){
            data_oringal.push(n)
        });

        var x = d3.scale.ordinal().rangeRoundBands([0, width-50], .05);
        var y = d3.scale.linear().range([height, 15]);
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(10);

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")

        var svg = d3.select(id).append("svg")
            .attr("width", width + 200)
            .attr("height", height + 30)
            .append("g").attr("transform", "translate(" + 50 + "," + -10 + ")");

        x.domain(data.map(function(d) { return d.axis; }));
        
        y.domain([0, d3.max(data, function(d) { return d.old_number; })]);

        svg.append("g")
            .attr("class", "x axis")
            .attr('id','bar_xAxis')
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", "-.55em")
            .attr("transform", "rotate(-90)" )
            .attr('id','bar_xAxis2');

        svg.append("g")
            .attr("class", "y axis")
            .attr('id','bar_yAxis')
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -12)
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Number of Works");
        
        var init_bar = svg.selectAll("bar")
            .data(data)
            .enter().append("rect")
            .attr("id", function(d){return "bar_" + d.type})
            .style("opacity", 1)
            .attr("x", function(d) { return x(d.axis); })
            .attr("width", x.rangeBand())
            // .attr("y", height)
            // .attr("height", 0)
            .attr("y", function(d) { return y(d.old_number); })
            .attr("height", function(d) { return height - y(d.old_number); })          
            .on("mouseover", function(d){
                d3.select("#barchart").selectAll("rect").transition(200).style("opacity", 0.1)
                d3.select("#barchart").selectAll("#bar_" + d.type).transition(200).style("opacity", 0.65)
                d3.select(this).transition(200).style("opacity", 1)

                d3.selectAll("#rc_" + d.type).transition(200).attr('r', 3 * 1.75)

                tooltip.transition(200)
							.style('opacity', 0.8)
                tooltip.html(d.author + "'s usage of " + d.axis + ":"
                + "<br/>Used in " + d.number + " poems " + d.author + " wrote."
                + "<br/>" + d.axis + " is used to express " + d.type
                )
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY - 500+ "px");
                
            })
            .on("mouseout", function(d){
                d3.select("#barchart").selectAll("rect").transition(200).style("opacity", 1)
                d3.selectAll("#rc_" + d.type).transition(200).attr('r', 3)
                tooltip
                    .transition(200)
                    .style('opacity', 0)
                tooltip.style("left", "-600px")
                    .style("top","-600px");
            })
           
        
        function yChange(){
            y.domain([0, d3.max(data, function(d) { return d.number; })])

            yAxis.scale(y);

            d3.select('#bar_yAxis') // change axis
                .transition().duration(1000)
                .call(yAxis)
        }
    

        init_bar.style("fill", old_color)
            .call(yChange)
            .transition().duration(1000)
            .style("fill", color)
            .attr("x", function(d) { return x(d.axis); })
            .attr("width", x.rangeBand())
            .attr("y", function(d) { return y(d.number); })
            .attr("height", function(d) { return height - y(d.number); });
        
        
        
        tooltip = d3.select(id).append("div")
            .attr("class", "tooltip")
            .style('opacity', 0)
            .style('font-family', 'sans-serif')
            .style('font-size', '12px')
            .style('background-color', "lightyellow");
    } 
}
