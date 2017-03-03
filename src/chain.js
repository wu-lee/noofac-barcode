var d3 = require('d3');

function generate(barcode, selector){
    var n = 10;
    var nodes = d3.range(n).map(function(i) {
        return {
            index: i,
        };
    });
    
    var links = [];
    
    for (var ix = 1; ix < n; ++ix) {
        links.push({source: ix-1, target: ix});
    }
    
    var simulation = d3.forceSimulation(nodes)
        .force("charge", d3.forceManyBody().strength(-30))
        .force("link", d3.forceLink(links).strength(1).distance(20).iterations(10))
        .on("tick", ticked);

    var canvas = document.querySelector("canvas"),
        context = canvas.getContext("2d"),
        bbox = canvas.getBoundingClientRect(),
        width = bbox.width,
        height = bbox.height;
    console.log(width, height);

    d3.select(canvas)
        .attr('width', width)
        .attr('height', height)
    
    .call(d3.drag()
        .container(canvas)
        .subject(dragsubject)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));
function ticked() {
  context.clearRect(0, 0, width, height);
  context.save();
  context.translate(width / 2, height / 2);

  context.beginPath();
  links.forEach(drawLink);
  context.strokeStyle = "#aaa";
  context.stroke();

  context.beginPath();
  nodes.forEach(drawNode);
  context.fill();
  context.strokeStyle = "#fff";
  context.stroke();

  context.restore();
}

function dragsubject() {
  return simulation.find(d3.event.x - width / 2, d3.event.y - height / 2);
}

function dragstarted() {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d3.event.subject.fx = d3.event.subject.x;
  d3.event.subject.fy = d3.event.subject.y;
}

function dragged() {
  d3.event.subject.fx = d3.event.x;
  d3.event.subject.fy = d3.event.y;
}

function dragended() {
  if (!d3.event.active) simulation.alphaTarget(0);
  d3.event.subject.fx = null;
  d3.event.subject.fy = null;
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
}

function drawNode(d) {
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, 3, 0, 2 * Math.PI);
}
}
generate("01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ .$%-/", "#root");
    d3.select('#text').text("hello");

