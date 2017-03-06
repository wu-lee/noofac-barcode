var d3 = require('d3');

function generate(barcode, selector){
    var config = {
        circle: {
            radius: 6,
            color: '#333',
            charge: -30,
        },
        link: {
            color: '#bbb',
            length: 50,
            strength: 1,
        },
    };
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
               .strength(config.circle.charge))
        .force("link", d3.forceLink(data.links)
               .strength(config.link.strength)
               .distance(config.link.length)
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
        .attr("r", config.circle.radius)
        .attr("fill", config.circle.color)
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));
    
    var lineFunction = d3.line()
        .curve(d3.curveCatmullRom)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })

    var lineGraph = chart.append("path")
        .attr("stroke", "blue")
        .attr("stroke-width", 1)
        .attr("fill", "none");

    function ticked() {        
        nodes
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        lineGraph
            .attr("d", lineFunction(data.nodes))
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

