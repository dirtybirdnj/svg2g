
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

if(fileName == '' || fileName == undefined) thr('Enter a relative file path')

var bezierOutput = (opts.b ? true : false)

//Hardcoded filepath, to be replaced with command line arguments
var filePath = __dirname + '/' + fileName


//1. Get all GROUP elements within the file
//2. For each group element
//3. Gather array of all PATH elements
//4. For each path element
//5 Retain each color & width - Should all be the same per group
//6. Separate each path from multipath <path> elements
//7 When collecting path array elements, gather START XY and END XY
//8. Create a new path element with every subpath from the group
//9. Apply color / width to new single path element
//10. Output SVG of single elements


let groups = parseSVGGroups(filePath);
let output = parseGroupPaths(groups);

//console.log(groups);
console.log(output);


//Old Logic Series
//var svgPaths = parseSVGPaths(filePath)
//var seperatedPaths = seperatePaths(svgPaths)
//console.log(wrapSVG(seperatedPaths))

//Takes in multi-shape path(s) and outputs an array of paths
function seperatePaths(paths){

	var pathElements = [];

	_(paths).forEach(function(layer){

		_(shapes(layer)).forEach(function(shape){


			var pathPoints = _.reduce(parse(shape), function (items, points) {

			//if(points[0] == 'M') items.push({ x: values[0], y: values[1]})
			if(points[0].toUpperCase() == 'M'){

				//console.log('m path')
				items.push('M' + points.slice(1))

			}
			else if(points[0].toUpperCase() == 'C'){

				//console.log('c path')
				items.push('C' + points.slice(1))

			}
			else if(points[0].toUpperCase() == 'L'){

				//console.log('c path')
				items.push('L' + points.slice(1))

			}
			else if(points[0].toUpperCase() == 'Z') items.push(['Z'])
			else {

				console.log('Unsupported SVG path token')
				console.log(points)
				process.exit()

			}
			return items
			}, [])

			pathElements.push(_.join(pathPoints,' '))

		}) // end foreach multipath shapes

	}) // end foreach path

	return pathElements
}

//Wraps the pathData array of x,y coords in a line or bezier <path> element
function wrapPath(pathData){


	var linePathString = pointPath(pathData)

	//console.log(pathData);
	//console.log(pathPointsToBezier(pathDataString))

	var pathDataString = (bezierOutput ? pathStringToBezier(linePathString) : linePathString)

	return '<path d="' + pathDataString + '" stroke="#000000" fill="none"/>'

}

function simpleWrapPath(pathString){

	return '<path d="' + pathString + '" stroke="#000000" fill="none"/>'

}

function wrapSVG(paths){

	var strOutput = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
	strOutput += '<svg id="workspace" xmlns="http://www.w3.org/2000/svg" version="1.1">'

		_(paths).forEach(function(element){
			strOutput += simpleWrapPath(element)
		})

	strOutput += '</svg>'

	return strOutput

}

//Takes in an SVG file, returns an array of paths elements
function parseSVGPaths(filePath){

	$ = cheerio.load(fs.readFileSync(filePath));
	var paths = _.reduce($('path'), function (items, path) {

    items.push($(path).attr('d'))
		return items
	}, [])

	return paths
}

//Takes in an array of groups, returns an array of paths elements with color, stroke, first/last
function parseGroupPaths(group){

  let pathArray = group.children;

	//$ = cheerio.load(fs.readFileSync(filePath));
	var paths = _.reduce($('path'), function (items, path) {

    //fill-opacity="0" stroke="#9098FC" stroke-width="1"
    let pathString = $(path).attr('d');
    let stroke = $(path).attr('stroke');
    let strokeWidth = $(path).attr('stroke-width');


    let pathPieces = _.without(_.split(pathString,' '),'')
    let separatedPaths = seperatePaths(pathPieces)

    let pathObj = {
      //pieces: pathPieces,
      separated: separatedPaths,
      //d: pathString,
      stroke: stroke,
      strokeWidth: strokeWidth
    }

    items.push(pathObj);
		return items
	}, [])

  //Collect all groups paths together into one array
  let groupPaths = _.reduce(paths, function(allPaths, group){
    console.log(group.separated);
    //allPaths.push(group.separated);
    //return allPaths;
  })

  let groupObj = {
    strokeColor : paths[0].stroke,
    strokeWidth : paths[0].strokeWidth,
    paths: groupPaths
  }

  console.log(groupObj);
  process.exit();

	return paths
}


//Takes in an SVG file, returns an array of paths elements
function parseSVGGroups(filepath){

	$ = cheerio.load(fs.readFileSync(filepath));
	var groups = _.reduce($('g'), function (items, group) {

    //console.log(group);
		items.push(group)
		return items
	}, [])

	return groups
}




function pointPath(pathPointsArr){

	console.log(pathPointsArr)
	process.exit()

	var pathDataString = 'M ' + pathPointsArr[0].x + ' ' + pathPointsArr[0].y + ' '
	_(pathPointsArr.slice(1)).forEach(function(element){

		console.log('element')
		console.log(element)

		pathDataString += ' L ' + element.x + ' ' + element.y + ' '

	})

	console.log(pathDataString)
	console.log('debugg')
	process.exit()

	return pathDataString
}

function pathStringToBezier(pathPointString){

	var pathPieces = _.without(_.split(pathPointString,' '),'')
	var pathChunks = abs(_.chunk(pathPieces,3))
	var bezierPathArr = normalize(pathChunks)

	var bezierPathString = ''

	_(bezierPathArr).forEach(function(element){

		bezierPathString += ' ' + _.join(element,' ')

	});

	//var bezierPathString = _.join([bezierPathArr],' ')
	//return _.replace(bezierPathString,',',' ')
	return bezierPathString

}