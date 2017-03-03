var d3 = require('d3');

function generateCode39Barcode(barcode, selector){
    d3.select("svg").remove(); //clean previous barcode
    var svg = d3.select(selector).append("svg");
    var config = {  // set configuration items
	"height": 30,
        "width": 500,
	"x": 10,
	"margin": 0,
	"amplitude": 0.85
	};
    var characters = {  // map each character to it's pattern
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
    ///////////////////////////////////////////////////////////////////////
    var data = []; // build you data array
	data.push('100101101101'); // Code 39 barcodes start with a *
    barcode.split("").forEach(function(d, i) {
	// for each character, append the pattern to our array
	data.push(characters[d]); //<-- look up for each character
    });
    data.push('100101101101'); // Code 39 barcodes end with a *
    ///////////////////////////////////////////////////////////////////////
    // set up line function
    var line = d3.line()
	.x(function(d) {
	    return d.cx = d.x
	})
	.y(function(d) {
		return d.cy = d.y
	})
    // group all the barcode paths
    var g = svg.append('g')
	.attr('class', 'barcode');
    // set up the data attributes necessary
    var data2 = data.map(function(c) {
	    return c + '0' // put a space between each character
	}).join('').split('')
	      .map(function(d, i) {
		  return [{
		      c: d,
		      x: config['margin']+ (i * config['amplitude']),
		      y: config['margin']
		  }, {
		      c: d,
				x: config['margin'] + (i * config['amplitude']),
		      y: config['margin'] + config['height']
		  }]
	      });
    var path = g.selectAll('path')
	.data(data2);
	     
    ///////////////////////////////////////////////////////////////////////
    path.enter()
	.append('path')
    // draw the barcode
	.style("stroke", function(d) {
	    return d[0].c == '1' ? '#000' : '#FFF'
	})
	.style("stroke-width", config['amplitude'])
	.attr("d", line);
    path.exit().remove();
    ///////////////////////////////////////////////////////////////////////
    // add the text underneath
    var text = svg.selectAll('text')
	.data([barcode]);
    text.exit().remove();
    text.enter()
	.append('text');
    text
	.text(barcode)
	.style('fill', 'black')
	.attr('y', config.margin + config.height + 15)
	.attr('x', g.node().getBBox().width/2 + config.margin);
}
///////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////

generateCode39Barcode("01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ .$%-/", "#root");
d3.select('#text').text("hello");
