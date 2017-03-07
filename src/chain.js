var d3 = require('d3');

function generate(barcode, selector){
    var config = {
        length: 10,
        circle: {
            radius: 6,
            color: '#333',
            charge: -3,
        },
        link: {
            color: '#444',
            length: 50,
            width: 1,
            strength: 1,
        },
    };
    var data = {
        nodes: [], // list of nodes
        links: [], // list of links
        chains: [], // list of lists of nodes
    };
    function addBar(data, config) {
        var chain = [];
        for(var i = 0; i < config.length; i++) {
            var index = data.nodes.length;
            var node = { index: index };
            data.nodes.push(node);
            chain.push(node);

            if (i > 0)
                data.links.push({source: index-1, target: index});
        }
        chain[0].fx = chain[1].fx = data.chains.length*10;
        chain[0].fy = 0;
        chain[1].fy = 10;
        
        data.chains.push(chain);
    }
    
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
    
    
    var lineFunction = d3.line()
        .curve(d3.curveCatmullRom)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })

    
    addBar(data, config);
    addBar(data, config);
    addBar(data, config);
    addBar(data, config);
    addBar(data, config);
    addBar(data, config);

    var circles = chart.append("g")
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

    var lineGraph = chart.append("g")
        .attr("class", "chains")
        .selectAll("path")
        .data(data.chains)
        .enter()
        .append("g")
        .append("path")
        .attr("stroke", config.link.color)
        .attr("stroke-width", config.link.width)
        .attr("fill", "none");

    
    var simulation = d3.forceSimulation(data.nodes)
        .force("charge", d3.forceManyBody()
               .strength(config.circle.charge))
    
    simulation.force("link", d3.forceLink(data.links)
                     .strength(config.link.strength)
                     .distance(config.link.length)
                     .iterations(10));

    simulation
        .on("tick", ticked);

    function ticked() {
        circles
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });

        lineGraph.attr("d", function(d) { return lineFunction(d); });
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

