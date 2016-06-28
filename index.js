
var shapes = require('svg-path-shapes')
var normalize = require('normalize-svg-path')
var parse = require('parse-svg-path')
var _ = require('lodash')
var simplify = require('simplify-js')
var cheerio = require('cheerio')
var minimist = require('minimist')
var abs = require('abs-svg-path')
var thr = require('throw')
var fs = require('fs');

//Getting the filename arg
var argv = minimist(process.argv.slice(2))
var argv = require('minimist')(process.argv.slice(2))
var args = argv._
var opts = _.omit(argv, '_')

var fileName = args[0];

if(fileName == '' || fileName == undefined) thr('Enter a relative file path');

var bezierOutput = (opts.b ? true : false)

//Hardcoded filepath, to be replaced with command line arguments
var path = __dirname + '/' + fileName;

var svgPaths = parseSVGPaths(path)
var seperatedPaths = seperatePaths(svgPaths);
console.log(wrapSVG(seperatedPaths));

//Takes in a multi-shape path and 
function seperatePaths(paths){

	var pathElements = [];

	_(paths).forEach(function(layer){

		_(shapes(layer)).forEach(function(shape){

			var pathPoints = parse(shape)

			var pathPoints = _.reduce(parse(shape), function (items, points) {
				var values = points.slice(1)
				items.push({ x: values[0], y: values[1]})
				return items
			}, [])		

			pathElements.push(wrapPath(pathPoints))

		})

	})	

	return pathElements
}

//Wraps the pathData array of x,y coords in a line or bezier <path> element
function wrapPath(pathData){


	var linePathString = pointPath(pathData);

	//console.log(pathData);
	//console.log(pathPointsToBezier(pathDataString))

	var pathDataString = (bezierOutput ? pathStringToBezier(linePathString) : linePathString)

	return '<path d="' + pathDataString + '" stroke="#000000" fill="none"/>';

}

function wrapSVG(paths){

	var strOutput = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>';	
	strOutput += '<svg id="workspace" xmlns="http://www.w3.org/2000/svg" version="1.1">';

		_(paths).forEach(function(element){
			strOutput += element
		})

	strOutput += '</svg>';

	return strOutput;

}

//Takes in an SVG file, returns an array of paths elements
function parseSVGPaths(filepath){

	$ = cheerio.load(fs.readFileSync(path));
	var paths = _.reduce($('path'), function (items, path) {
		items.push($(path).attr('d'))
		return items
	}, [])

	return paths
}

function pointPath(pathPointsArr){

	var pathDataString = 'M ' + pathPointsArr[0].x + ' ' + pathPointsArr[0].y + ' '
	_(pathPointsArr.slice(1)).forEach(function(element){
		
		pathDataString += ' L ' + element.x + ' ' + element.y + ' '
	
	})

	return pathDataString
}

function pathStringToBezier(pathPointString){

	var pathPieces = _.without(_.split(pathPointString,' '),'')
	var pathChunks = abs(_.chunk(pathPieces,3))
	var bezierPathArr = normalize(pathChunks)

	var bezierPathString = '';

	_(bezierPathArr).forEach(function(element){

		bezierPathString += ' ' + _.join(element,' ')

	});

	//var bezierPathString = _.join([bezierPathArr],' ')
	//return _.replace(bezierPathString,',',' ')
	return bezierPathString

}

//Original Sketch / Mockup, 
//Includes non-essential simplification and bezier conversion

// _(traces).forEach(function(layer){
// 	_(shapes(layer)).forEach(function(shape){

// 		var pathPoints = parse(shape)

// 		var pathPoints = _.reduce(parse(shape), function (items, points) {
// 			var values = points.slice(1)
// 			items.push({ x: values[0], y: values[1]})
// 			return items
// 		}, [])		

// 		var simplifiedPath = simplify(pathPoints,.1,true)
// 		var bezierPath = normalize(simplifiedPath)		

// 		strOutput += '<path d="'
// 		strOutput += 'M' + bezierPath[0].x + ',' + bezierPath[0].y + ' '

// 		_(bezierPath.slice(1)).forEach(function(element){
// 			strOutput += ' L ' + element.x + ',' + element.y + ' '
// 		})

// 		strOutput += '" stroke="#000000" fill="none"/>';

// 	})
// })