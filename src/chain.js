var d3 = require('d3');

function generate(barcode, selector){
    var config = {
        length: 30,
        fixedLength: 5,
        circle: {
            radius: 6,
            color: '#333',
            charge: -9,
        },
        link: {
            color: '#444',
            length: 10,
            width: 1,
            strength: 1,
            rigidity: 1,
        },
        spacing: {
            x: 15,
            y: 10,
            top: -130,
            left: -50,
        },
        gravity: {
            strength: 0.1,
        },
    };
    var data = {
        nodes: [], // list of nodes
        links: [], // list of links
        chains: [], // list of lists of nodes
        chainlinks: [] // list of lists of links
    };
    function addBar(data, config) {
        var chain = [];
        var chainlink = [];
        for(var i = 0; i < config.length; i++) {
            var index = data.nodes.length;
            var node = { index: index };
            data.nodes.push(node);
            chain.push(node);

            if (i > 0) {
                var link = {source: index-1, target: index};
                data.links.push(link);
                chainlink.push(link);
            }
        }
        for(i = 0; i < config.length; i++) {
            var x = config.spacing.top + data.chains.length*config.spacing.x;
            var y = config.spacing.left + config.spacing.y*i;
            if (i < config.fixedLength) {
                chain[i].fx = x
                chain[i].fy = y;
            }
            else {
                chain[i].x = x
                chain[i].y = y;
            }
        }
        data.chains.push(chain);
        data.chainlinks.push(chainlink);
    }

    d3.select("svg").remove(); //clean previous contents
    
    var root = d3.select(selector),
        bbox = root.node().getBoundingClientRect(),
        width = bbox.width,
        height = bbox.height,
        
        svg = root.append("svg")
        .attr("width", width)
        .attr("height", height),
        scale = 3,
        chart = svg.append("g")
        .classed("chart", true)
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "scale("+1/scale+"),translate("+[scale*width/2,scale*height/4]+")")
    
    var lineFunction = d3.line()
        .curve(d3.curveCardinal)
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
        .alphaDecay(0)
//        .force("charge", d3.forceManyBody()
//               .strength(config.circle.charge))
    
        .force("link", forceLink(data.links)
               .strength(config.link.strength)
               .distance(config.link.length))

//        .force("gravity", forceGravity(data.nodes));

    data.chainlinks.map(function(chainlink, ix) {
        simulation
            .force("rigidity"+ix, forceRigidity(chainlink)
                   .strength(config.link.rigidity));
    });

    simulation
        .on("tick", ticked);
                 console.log(">>>");
    function forceLink(links) {
        var nodes = [],
            distance = 1,
            strength = 0.1;

        function force() {
            for(var ix = 0; ix < links.length; ix+=1) {
                var l = links[ix],
                    n0 = nodes[l.source],
                    n1 = nodes[l.target],
                    dx = (n1.x - n0.x),
                    dy = (n1.y - n0.y),
                    d  = Math.sqrt(dx*dx+dy*dy),
                    dd = d - distance,
                    f = strength*dd/d,
                    fx = f*dx,
                    fy = f*dy;

                
               
                n0.vx += fx;
                n1.vx -= fx;
                n0.vy += fy;
                n1.vy -= fy;
            }
        }
        force.initialize = function(n) {
            nodes = n;
        };
        force.strength = function(s) {
            strength = s;
            return this;
        };
        force.distance = function(d) {
            distance = d;
            return this;
        };

        return force;
    };
    
    function forceGravity(nodes) {
        function force(a) {
//            console.log("gravity", a);
            nodes.forEach(function(o, i) {
                o.vy += 3; 
            });
        }
        return force;
    }

    function forceRigidity(links) {
        var nodes = [],
            strength = 0.1;

        function addVector(link) {
            var n0 = nodes[link.source],
                n1 = nodes[link.target],
                v = subVec(n1, n0),
                d2 = len2Vec(v),
                d  = Math.sqrt(d2);
            
            link.vec = v;
            link.d2 = d2;
            link.d = d;
            link.unit = divVec(v, d);
        }

        function subVec(v1, v2) {
            return {x:v1.x-v2.x, y:v1.y-v2.y};
        }
        function len2Vec(v) {
            return v.x*v.x + v.y*v.y;
        }
        function lenVec(v) {
            return Math.sqrt(v.x*v.x + v.y*v.y);
        }
        function divVec(v, d) {
            return {x:v.x/d, y:v.y/d};
        }
        function mulVec(v, m) {
            return {x:v.x*m, y:v.y*m};
        }
        // Rotates a vector a clockwise rightangle (in r-h coord system)
        function clock90Vec(v) {
            return {x:v.y, y:-v.x};
        }
        // Not quite the cross product, but gets the perp. component
        function nqCrossProd(a, b) {
            return a.x*b.y - a.y*b.x;
        }
        function addMoments(link0, link1) {
            if (link0.target !== link1.source)
                throw new Error("unjoined links "+link0.target+" != "+link1.source);

            var midvec = subVec(link0.unit, link1.unit),
                f0 = link0.d * moment,
                f1 = link1.d * moment,
                n0 = nodes[link0.source],
                n1 = nodes[link0.target],
                n2 = nodes[link1.target],
                l0perp = clock90Vec(link0.unit),
                l1perp = clock90Vec(link1.unit),
                dirn = Math.sign(nqCrossProd(link0.unit, link1.unit)),
                moment = strength*lenVec(midvec)*dirn,
                l0force = mulVec(l0perp, moment),
                l1force = mulVec(l1perp, moment);
            //console.log(l0force.x, l0force.y, l1force.x, l1force.y);
            n0.vx += l0force.x;
            n0.vy += l0force.y;
            n1.vx -= l0force.x;
            n1.vy -= l0force.y;
            n1.vx -= l1force.x;
            n1.vy -= l1force.y;
            n2.vx += l1force.x;
            n2.vy += l1force.y;
        }

        function force() {
            links.map(addVector);
//            return;
            for(var ix = 1; ix < links.length; ix+=1) {
                addMoments(links[ix-1],links[ix]);
            }
        }
        force.initialize = function(n) {
            nodes = n;
        };
        force.strength = function(s) {
            strength = s;
            return this;
        };

        return force;
    };
    
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

