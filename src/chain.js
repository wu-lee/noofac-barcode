var d3 = require('d3');

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

var characters = {  // map each character to its bitcode
    " ": "100110101101",
    "$": "100100100101",
    "%": "101001001001",
    "*": "100101101101",
    "+": "100101001001",
    "-": "100101011011",
    "/": "100100101001",
    ".": "110010101101",
    '0': '101001101101',
    "1": "110100101011",
    "2": "101100101011",
    "3": "110110010101",
    "4": "101001101011",
    "5": "110100110101",
    "6": "101100110101",
    "7": "101001011011",
    "8": "110100101101",
    "9": "101100101101",
    "A": "110101001011",
    "B": "101101001011",
    "C": "110110100101",
    "D": "101011001011",
    "E": "110101100101",
    "F": "101101100101",
    "G": "101010011011",
    "H": "110101001101",
    "I": "101101001101",
    "J": "101011001101",
    "K": "110101010011",
    "L": "101101010011",
    "M": "110110101001",
    "N": "101011010011",
    "O": "110101101001",
    "P": "101101101001",
    "Q": "101010110011",
    "R": "110101011001",
    "S": "101101011001",
    "T": "101011011001",
    "U": "110010101011",
    "V": "100110101011",
    "W": "110011010101",
    "X": "100101101011",
    "Y": "110010110101",
    "Z": "100110110101"
};

function stringToCode39Barcode(barcode){
    function charToCode(ch) {
        return characters[ch];
    }
    
    var data = Array.prototype.map.call(barcode, charToCode)
    // Code 39 barcodes start and end with a *
    data.unshift(characters['*']); 
    data.push(characters['*']);

    return data.join('0');
}

function barcodeToWidths(barcode) {
    var widths = [];
    var last;
    var count = 1;
    for(var ix = 1; ix < barcode.length; ix++) {
        if (barcode[ix] === barcode[ix-1]) {
            count += 1;
        }
        else {
            widths.push(count);
            count = 1;
        }
    }
    
    return widths;
}

function generate(barcode, selector){
    var config = {
        length: 20,
        fixedLength: 2,
        circle: {
            radius: 20,
            color: 'none',
            charge: -9,
        },
        link: {
            color: '#eee',
            length: 30,
            width: 1,
            strength: 1,
            rigidity: 0.3,
        },

        spacing: {
            x: 10,
            y: 20,
            top: 0,
            left: 0,
        },
        scale: 1/17,
        gravity: {
            strength: 0.1,
        },
    };
    var bc = stringToCode39Barcode(barcode);
    var bars = barcodeToWidths(bc);
    
    var data = {
        nodes: [], // list of nodes
        links: [], // list of links
        chains: [], // list of lists of nodes
        chainlinks: [] // list of lists of links
    };
    function addBar(data, config, x, y, width) {
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
            var yn = y + config.spacing.y*i;
            node = chain[i];
            if (i < config.fixedLength) {
                node.fx = node.x = x;
                node.fy = node.y = yn;
            }
            else {
                node.x = x
                node.y = yn;
            }

            // Perturb the position of the last point,
            // which triggers wriggling.
            if (i === config.length-1) {
                var r = Math.random()*2-1;
                node.x += r;
            }
        }
        chain.width = width;
        data.chains.push(chain);
        data.chainlinks.push(chainlink);
    }

    d3.select("svg").remove(); //clean previous contents
    
    var root = d3.select(selector),
        width = 100,
        height = 100,
        
        svg = root.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, (barcode.length+2)*13*10/2, 100].join(" "))
        .attr("preserveAspectRatio", "xMinYMin slice")

        chart = svg.append("g")
        .classed("chart", true)
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "scale("+config.scale+")")
    
    var lineFunction = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })


    // The intent here is to draw white bars with black borders.  The
    // borders form the black bars. The borders may overlap, however,
    // as necessary to create the appropriate width (which for
    // barcode39 should be at most 2 units for black or white).  We
    // can assume that the bars start an end with a narrow black
    // (because the fixed start and end character does), and alternate
    // black and white. Our noodles can therefore have the width of
    // the white bars, with uniformly 1 unit border.
    var x = config.spacing.left;
    var ix = 0;
    while(ix < bars.length-1) {
        var w1 = bars[ix++]*config.spacing.x,
            w2 = bars[ix++]*config.spacing.x;

        x += w1;
        addBar(data, config, x+w2/2, config.spacing.top, w2);
        x += w2;
    }

    
    var lineGraph1 = chart.append("g")
        .attr("class", "chains1")
        .selectAll("path")
        .data(data.chains)
        .enter()
        .append("g")
        .append("path")
        .attr("stroke", '#000')
        .attr("stroke-width", function(d) { return d.width+config.spacing.x*2; })
        .attr("fill", "none")
    
    var lineGraph2 = chart.append("g")
        .attr("class", "chains2")
        .selectAll("path")
        .data(data.chains)
        .enter()
        .append("g")
        .append("path")
        .attr("stroke", '#fff')
        .attr("stroke-width", function(d) { return d.width; })
        .attr("fill", "none");

    
    var circles = chart.append("g")
        .attr("class", "nodes")
        .selectAll("circle")
        .data(data.nodes)
        .enter()
        .append("circle")
        .attr("r", config.circle.radius)
        .attr("fill", config.circle.color)
        .attr("pointer-events", "visible")
        .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));

    var simulation = d3.forceSimulation(data.nodes)
        .alphaDecay(0)
//        .force("charge", d3.forceManyBody()
//               .strength(config.circle.charge))
    
        .force("link", forceLink(data.links)
               .strength(config.link.strength)
               .distance(config.link.length))

        .force("gravity", forceGravity(data.nodes));

    data.chainlinks.map(function(chainlink, ix) {
        simulation
            .force("rigidity"+ix, forceRigidity(chainlink)
                   .strength(config.link.rigidity));
    });

    simulation
        .on("tick", ticked);

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
            nodes.forEach(function(o, i) {
                o.vy += 0.5; 
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

        function addMoments(link0, link1, alpha) {
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
                // poor man's determinstic randomising hash function.
                dirn = ((link0.source % 13) * ((link0.source+5) % 7) % 3)*2-1,
                // Straightforward rigidity:
                // dirn = Math.sign(nqCrossProd(link0.unit, link1.unit)),
                moment = strength*lenVec(midvec)*dirn,
                l0force = mulVec(l0perp, moment),
                l1force = mulVec(l1perp, moment);

            n0.vx += l0force.x;
            n0.vy += l0force.y;
            n1.vx -= l0force.x;
            n1.vy -= l0force.y;
            n1.vx -= l1force.x;
            n1.vy -= l1force.y;
            n2.vx += l1force.x;
            n2.vy += l1force.y;
        }

        function force(alpha) {
            links.map(addVector);

            for(var ix = 1; ix < links.length; ix+=1) {
                addMoments(links[ix-1], links[ix], alpha);
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

        lineGraph1.attr("d", function(d) { return lineFunction(d); });
        lineGraph2.attr("d", function(d) { return lineFunction(d); });
//        mouse
//            .attr("cx", function(d) { return ptrPos.x })
//            .attr("cy", function(d) { return ptrPos.y });
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

module.exports = {
    generate: generate,
};
