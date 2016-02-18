
var shapes = require('svg-path-shapes')
var normalize = require('normalize-svg-path')
var parse = require('parse-svg-path')
//var svgb = require('svg-builder')
var _ = require('lodash')
var simplify = require('simplify-js')

var path = __dirname + '/6.01.svg';

var fs = require('fs');
var cheerio = require('cheerio'),
    $ = cheerio.load(fs.readFileSync(path));

var traces = _.reduce($('path'), function (items, path) {
	items.push($(path).attr('d'))
	return items
}, [])


var strOutput = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';	
	strOutput += '<svg id="workspace" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 531 360" version="1.1">';

_(traces).forEach(function(layer){

	_(shapes(layer)).forEach(function(shape){

		var pathPoints = parse(shape)

		var pathPoints = _.reduce(parse(shape), function (items, points) {
			
			var values = points.slice(1)
			items.push({ x: values[0], y: values[1]})
			
			return items
		}, [])		

		var simplifiedPath = simplify(pathPoints,.1,true)

		//var bezierPath = normalize(pathPoints)
		var bezierPath = normalize(simplifiedPath)		

		strOutput += '<path d="'
		strOutput += 'M' + bezierPath[0].x + ',' + bezierPath[0].y + ' '

		_(bezierPath.slice(1)).forEach(function(element){
			strOutput += ' L ' + element.x + ',' + element.y + ' '
		})

		strOutput += '" stroke="#000000" fill="none"/>';

	});
});

strOutput += '</svg>';

function outputSVG(paths){


}

console.log(strOutput)


