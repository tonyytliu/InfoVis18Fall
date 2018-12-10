// Basic open source codes for RadarChart from http://bl.ocks.org/nbremer/6506614
// Made modifications to suit our project
// Modifications:
// Oringinal axis should be in range (0%,100%), the range setting and 
//       change cooreponding formulas in coordinate calculations to suit our t-stat data
// Design Methods for Transition 
// Add animations when entering data
// Other changes like tooltip, color, etc.

var RadarChart = {
  draw: function(id, d, options, color, old_color){
  var cfg = {
	 radius: 3,
	 w: 300,
	 h: 300,
	 factor: 1,
	 factorLegend: 0.85,
	 levels: 3,
     maxValue: 0,
	 minValue: 0,
	 old_maxValue: 0,
     old_minValue: 0,
	 radians: 2 * Math.PI,
	 opacityArea: 0.1,
	 ToRight: 5,
	 TranslateX: 80,
	 TranslateY: 30,
	 ExtraWidthX: 200,
	 ExtraWidthY: 100,
	 color: d3.scale.category10()
	};
	
	if('undefined' !== typeof options){
	  for(var i in options){
        // console.log(i)
		if('undefined' !== typeof options[i]){
		  cfg[i] = options[i];
		}
	  }
    }
    cfg.maxValue = d3.max(d, function(i){return d3.max(i.map(function(o){return o.value;}))});
	cfg.minValue = d3.min(d, function(i){return d3.min(i.map(function(o){return o.value;}))});
	cfg.old_maxValue = d3.max(d, function(i){return d3.max(i.map(function(o){return o.old_value;}))});
	cfg.old_minValue = d3.min(d, function(i){return d3.min(i.map(function(o){return o.old_value;}))});
	if(cfg.old_maxValue === cfg.old_minValue){
		cfg.old_maxValue = 1
		cfg.old_minValue = -1
	}

	// uncomment if want to fix baseline at the 0.5*radius position
    // if(cfg.maxValue > -cfg.minValue){
    //     cfg.minValue = - cfg.maxValue
    // } else {
    //     cfg.maxValue = - cfg.minValue
	// }
	
	var allAxis = (d[0].map(function(i, j){return i.axis}));
	var total = allAxis.length;
	var radius = cfg.factor*Math.min(cfg.w/2, cfg.h/2);
	// var Format = d3.format('%');
	d3.select(id).select("svg").remove();
	
	var g = d3.select(id)
            .append("svg")
            .attr('id','rc')
			.attr("width", cfg.w+cfg.ExtraWidthX)
			.attr("height", cfg.h+cfg.ExtraWidthY)
			.append("g")
			.attr("transform", "translate(" + cfg.TranslateX + "," + cfg.TranslateY + ")");
			;

	var tooltip;
	
	//Circular segments
	// for(var j=0; j<cfg.levels-1; j++){
	//   var levelFactor = cfg.factor*radius*((j+1)/cfg.levels);
	//   g.selectAll(".levels")
	//    .data(allAxis)
	//    .enter()
	//    .append("svg:line")
	//    .attr("x1", function(d, i){return levelFactor*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
	//    .attr("y1", function(d, i){return levelFactor*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
	//    .attr("x2", function(d, i){return levelFactor*(1-cfg.factor*Math.sin((i+1)*cfg.radians/total));})
	//    .attr("y2", function(d, i){return levelFactor*(1-cfg.factor*Math.cos((i+1)*cfg.radians/total));})
	//    .attr("class", "line")
	//    .style("stroke", "grey")
	//    .style("stroke-opacity", "0.75")
	//    .style("stroke-width", "0.3px")
	//    .attr("transform", "translate(" + (cfg.w/2-levelFactor) + ", " + (cfg.h/2-levelFactor) + ")");
	// }
	
	series = 0;

	var axis = g.selectAll(".axis")
			.data(allAxis)
			.enter()
			.append("g")
			.attr("class", "axis");

	axis.append("line")
		.attr("x1", cfg.w/2)
		.attr("y1", cfg.h/2)
		.attr("x2", function(d, i){return cfg.w/2*(1-cfg.factor*Math.sin(i*cfg.radians/total));})
		.attr("y2", function(d, i){return cfg.h/2*(1-cfg.factor*Math.cos(i*cfg.radians/total));})
		.attr("class", "line")
		.style("stroke", "grey")
		.style("stroke-width", "1.5px")
		.style("stroke-opacity", 0.3);

	axis.append("text")
		.attr("class", "legend")
		.text(function(d){return d})
		.style("font-family", "sans-serif")
		.style("font-size", "11px")
		.attr("text-anchor", "middle")
		.attr("dy", "1.5em")
		.attr("transform", function(d, i){return "translate(0, -10)"})
		.attr("x", function(d, i){return cfg.w/2*(1-cfg.factorLegend*Math.sin(i*cfg.radians/total))-55*Math.sin(i*cfg.radians/total);})
		.attr("y", function(d, i){return cfg.h/2*(1-Math.cos(i*cfg.radians/total))-25*Math.cos(i*cfg.radians/total);});

 
	d.forEach(function(y, x){
	  dataValues = [];
	  g.selectAll(".nodes")
		.data(y, function(j, i){
		  dataValues.push([
			cfg.w/2*(1-((parseFloat(j.value)-cfg.minValue)/(cfg.maxValue-cfg.minValue))*cfg.factor*Math.sin(i*cfg.radians/total)), 
			cfg.h/2*(1-((parseFloat(j.value)-cfg.minValue)/(cfg.maxValue-cfg.minValue))*cfg.factor*Math.cos(i*cfg.radians/total)),
			cfg.w/2*(1-((parseFloat(j.old_value)-cfg.old_minValue)/(cfg.old_maxValue-cfg.old_minValue))*cfg.factor*Math.sin(i*cfg.radians/total)), 
			cfg.h/2*(1-((parseFloat(j.old_value)-cfg.old_minValue)/(cfg.old_maxValue-cfg.old_minValue))*cfg.factor*Math.cos(i*cfg.radians/total))
          ]);
        });
        
      dataValues.push(dataValues[0]);
    //   console.log(dataValues);

        var draw_1 = function(selection) {
            selection
                .attr("points",function(d) {
                var str="";
                for(var pti=0;pti<d.length;pti++){
                    str=str+d[pti][0]+","+d[pti][1]+" ";
				}
				// console.log(str)
                return str;
            })
		};
		
		var draw_1_init = function(selection) {
            selection
                .attr("points",function(d) {
                var str="";
                for(var pti=0;pti<d.length;pti++){
                    str=str+d[pti][2]+","+d[pti][3]+" ";
				}
				// console.log(str)
                return str;
            })
		};
		
      
	var init_area = 
	  	g.selectAll(".area")
            .data([dataValues])
            .enter()
            .append("polygon")
            .attr("class", "radar-chart-serie"+series)
            .style("fill-opacity", 0)
            .on('mouseover', function (d){
                z = "polygon."+d3.select(this).attr("class");
                g.selectAll("polygon")
                    .transition(200)
                    .style("fill-opacity", 0.1); 
                g.selectAll(z)
                    .transition(200)
                    .style("fill-opacity", 0.3);
                })
            .on('mouseout', function(){
                z = "polygon."+d3.select(this).attr("class");
                g.selectAll("polygon")
                    .transition(200)
                    .style("fill-opacity", cfg.opacityArea);
				})
			.call(draw_1_init)
			.style("fill", function(j, i){if(series==0){
				return "grey"} else{
				return old_color;
			}})
			.style("stroke-width", "2px")
			.style("stroke", function(j, i){if(series==0){
					return "grey"} else{
					return old_color;
				}})


		init_area.transition().duration(1000).call(draw_1)
            .style("fill", function(j, i){if(series==0){
                    return "grey"} else{
                    return color;
                }})
            .style("fill-opacity", cfg.opacityArea)
            .style("stroke-width", "2px")
            .style("stroke", function(j, i){if(series==0){
                    return "grey"} else{
                    return color;
                }})

	var draw_2 = function(selection) {
        selection
        .attr("alt", function(j){return j.value-cfg.minValue})
		.attr("cx", function(j, i){
			return cfg.w/2*(1-((j.value-cfg.minValue)/(cfg.maxValue-cfg.minValue))*cfg.factor*Math.sin(i*cfg.radians/total));
		})
		.attr("cy", function(j, i){
		  return cfg.h/2*(1-((j.value-cfg.minValue)/(cfg.maxValue-cfg.minValue))*cfg.factor*Math.cos(i*cfg.radians/total));
		})
        .style("fill", function(j, i){if(series==0){
            return "grey"} else{
            return color
        }})
        .style("fill-opacity", .9)
	};

	var draw_2_init = function(selection) {
		selection
		.attr("alt", function(d){return d.old_value-cfg.old_minValue})
		.attr("cx", function(d, i){
			return cfg.w/2*(1-((d.old_value-cfg.old_minValue)/(cfg.old_maxValue-cfg.old_minValue))*cfg.factor*Math.sin(i*cfg.radians/total));
		})
		.attr("cy", function(d, i){
		  return cfg.h/2*(1-((d.old_value-cfg.old_minValue)/(cfg.old_maxValue-cfg.old_minValue))*cfg.factor*Math.cos(i*cfg.radians/total));
		})
		.style("fill", function(d, i){if(series==0){
            return "grey"} else{
            return old_color
        }})
        .style("fill-opacity", .9)
	
	};
	
	var init_nodes =  g.selectAll(".nodes")
		.data(y).enter()
		.append("svg:circle")
		.attr("id", function(d){return "rc_" + d.type})
		.attr("class", "radar-chart-serie"+series)
		.attr('r', cfg.radius)
		.on('mouseover', function (d){
				if(d3.select(this).attr("class") === "radar-chart-serie1"){
					tooltip.transition(200)
							.style('opacity', 0.8)
					tooltip.html(d.axis  + "<br/>" + d.author + "'s usage Frequency: " 
					+ (Math.round(d.freq * 10000)/10000)
					+ ("<br/>" + d.dynasty + "'s usage Frequency: " + Math.round(d.dynasty_freq * 10000)/10000)
					+ ("<br/>" + "Used to express: " + d.type))
					.style("left", (d3.event.pageX -820) + "px")
					.style("top", (d3.event.pageY - 10) + "px");
					// console.log()
					d3.selectAll("#rc_" + d.type).transition(200).attr('r', cfg.radius * 1.75)
					
					d3.select(this).transition(200).attr('r', cfg.radius * 2.5)
					
					d3.select("#barchart").selectAll("rect")
						.transition(200)
						.style("opacity", 0.1)
					d3.selectAll("#bar_" + d.type)
						.transition(200).style("opacity", 1)
					};
					z = "polygon."+d3.select(this).attr("class");
					g.selectAll("polygon")
						.transition(200)
						.style("fill-opacity", 0.1); 
					g.selectAll(z)
						.transition(200)
						.style("fill-opacity", 0.3);
				  })
		.on('mouseout', function(d){
					d3.selectAll("#rc_" + d.type).transition(200).attr('r', cfg.radius)
					d3.select("#barchart").selectAll("rect")
						.transition(200)
						.style("opacity", 1)
					tooltip
						.transition(200)
						.style('opacity', 0)
					tooltip.style("left", "-600px")
						.style("top","-600px");
					g.selectAll("polygon")
						.transition(200)
						.style("fill-opacity", cfg.opacityArea);
					
				  })
		.call(draw_2_init)
	init_nodes.transition().duration(1000).call(draw_2);

	  series++;
    });
    // console.log(g)
	//Tooltip
	tooltip = d3.select(id).append("div")
			   .attr("class", "tooltip")
			   .style('opacity', 0)
			   .style('font-family', 'sans-serif')
			   .style('font-size', '12px')
			   .style('background-color', "lightyellow");
  }

};