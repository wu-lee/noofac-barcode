var d3 = require('d3');

function generate(barcode, selector){
    var n = 10;
    var data= {
        nodes: d3.range(n).map(function(i) {
            return {
                index: i,
            };
        }),
        links: [],
    };
    
    for (var ix = 1; ix < n; ++ix) {
        data.links.push({source: ix-1, target: ix});
    }
    
    var simulation = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody()
               .strength(-30))
        .force("link", d3.forceLink(data.links)
               .strength(1)
               .distance(20)
               .iterations(10))
        .on("tick", ticked);

    d3.select("svg").remove(); //clean previous contents
    
    var root = d3.select(selector),
        bbox = root.node().getBoundingClientRect(),
        width = bbox.width,
        height = bbox.height,

        svg = root.append("svg")
        .attr("width", width)
        .attr("height", height),
    
        chart = svg.append("g")
        .classed("chart", true)
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate("+[width/2,height/2]+")")
    
    var links = chart.append("g")
        .attr("class", "links")
        .selectAll("line")
        .data(data.links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa");

    var nodes = chart.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", 3)
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
    
    
/*    
    d3.select(svg)
        .call(d3.drag()
              .subject(dragsubject)
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
  */  
    function ticked() {
        links
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });
        
        nodes
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });        
    }

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    
    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    
    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
}

generate("01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ .$%-/", "#root");
    d3.select('#text').text("hello");

