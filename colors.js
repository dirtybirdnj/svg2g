//Colors - Randomly distribute mutlipath SVG document paths to a set of colored layers


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

// original object syntax, could not get this to work
// var gellyrollColors = {

// 	blue_36 : { 'hex' : '2123FC' },
// 	blue_138 : { 'hex' : '00014A' },
// 	blue_436 : { 'hex' : '212EC1' },
// 	blue_738 : { 'hex' : '1F873A' },
// 	green_429: { 'hex' : '44FF74' },
// 	green_427 : { 'hex' : '074726' },
// 	green_M29 : { 'hex' : '126935' },
// 	purple_724 : { 'hex' : 'CAA7DE' },
// 	purple_24 : { 'hex' : '6A1A94' },
// 	gold_703 : { 'hex' :'D7DEA7' },
// 	yellow_402 : { 'hex' : 'DFFF26' },
// 	orange_405 : { 'hex' : 'FF8900' },
// 	pink_418  : { 'hex' : 'FF478C' },
// 	black_49 : { 'hex' : '000000' },
// 	red_19: { 'hex' : 'A00000' },
// }

//More natural array syntax
var gellyrollColors = [

	'2123FC', //blue_36 
	'00014A', //blue_138 
	'212EC1', //blue_436
	'1F873A', // blue_738
	'44FF74', // green_429
	'074726', // green_427
	'126935', // green_M29
	'CAA7DE', // purple_724
	'6A1A94', // purple_24
	'D7DEA7', // gold_703
	'DFFF26', // yellow_402
	'FF8900', // orange_405
	'FF478C', // pink_418
	'000000', // black_49
	'A00000', // red_19
]

//Getting the filename arg
var argv = minimist(process.argv.slice(2))
var argv = require('minimist')(process.argv.slice(2))
var args = argv._
var opts = _.omit(argv, '_')

var fileName = args[0];

if(fileName == '' || fileName == undefined) thr('Enter a relative file path')

var bezierOutput = (opts.b ? true : false)

//Hardcoded filepath, to be replaced with command line arguments
var path = __dirname + '/' + fileName

var svgPaths = parseSVGPaths(path)
var seperatedPaths = seperatePaths(svgPaths)

//console.log(seperatedPaths.length + ' paths total')

var coloredPaths = distributePaths(seperatedPaths,gellyrollColors)


//Output the final SVG
console.log(wrapColoredSVG(coloredPaths));


// Expects output from distributePaths()
function wrapColoredSVG(coloredPaths){

	// console.log(coloredPaths)
	// console.log('colored paths ahoy')
	// process.exit()

	let documentPaths = []
	_.forEach(coloredPaths,function(path,color){

		let newPath = wrapPathData(path,color)

		// console.log(newPath.substring(0,100))
		// console.log('line 91')
		// process.exit()

		documentPaths.push(newPath)

		//console.log(newPath)
		//process.exit(1);

	})

	return wrapSVG(documentPaths)

}


//Take in an array of paths, output N paths based on N colors.length
function distributePaths(paths,colors){

	var pathColors = {}

	//Create keyed arrays for array pushes
	_(colors).forEach((color) => {

			pathColors[color] = []
		}
	)

	_(paths).forEach(function(path){

		var randomColor = colors[pickRandomColor(colors)]

		pathColors[randomColor].push(path) //= pathColors[randomColor] += path

		// console.log(pathColors)
		// console.log(randomColor)
		// process.exit()

	});


		// console.log(pathColors)
		// console.log('pathColors')
		// process.exit()

	return pathColors
}

function pickRandomColor(colors) {
    var result;
    var count = 0;

    for (var color in colors)
        if (Math.random() < 1/++count){
           result = color;
         }
    return result;
}

//#TODO
//Take in an array of paths, return a single compound path of all elements
function flattenPaths(paths){


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

//Takes in a multi-shape path and outputs an array of paths
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

			var newPointPath = pointPath(pathPoints)

			// console.log(newPointPath.substring(0,100))
			// console.log('new shit')
			// process.exit()


			//pathElements.push(wrapPath(pathPoints))
			pathElements.push(newPointPath)

		})

	})

	//console.log(newPointPath.substring(0,100))
	// console.log(pathElements)
	// console.log('outputing pathElements')
	// process.exit()		

	return pathElements
}

//Newer multicolor path wrapper
//Wraps the pathData array of x,y coords in a line or bezier <path> element
function wrapPathData(pathData, color){


		// console.log(pathData.substring(0,100))
		// console.log('wrapPathData')
		// process.exit()

	return '<path d="' + pathData + '" stroke="#' + color + '" fill="none" stroke_width="5"/>'

	//Extra unnecessary linejoin attributes
	//return '<path d="' + pathData + '" stroke="#' + color + '" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke_width="5"/>'

}

//Older path wrapping implementation
//Wraps the pathData array of x,y coords in a line or bezier <path> element
function wrapPath(pathData, color){


	var linePathString = pointPath(pathData)

	//console.log(pathData);
	//console.log(pathPointsToBezier(pathDataString))

	var pathDataString = (bezierOutput ? pathStringToBezier(linePathString) : linePathString)

	return '<path d="' + pathDataString + '" stroke="#' + color + '" fill="none" stroke_width="5"/>'

	//Extra linejoin crap
	//return '<path d="' + pathDataString + '" stroke="#' + color + '" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke_width="5"/>'

}

function wrapSVG(paths){

	var strOutput = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
	strOutput += '<svg id="workspace" width="auto" height="auto" xmlns="http://www.w3.org/2000/svg" version="1.1">'

		_(paths).forEach(function(element){
			strOutput += element
		})

	strOutput += '</svg>'

	return strOutput

}


//Composes an SVG path from coordinates
function pointPath(pathPointsArr){

	var pathDataString = 'M' + pathPointsArr[0].x + ',' + pathPointsArr[0].y //+ ' '
	_(pathPointsArr.slice(1)).forEach(function(element){
		
		pathDataString += ' L' + element.x + ',' + element.y //+ ' '
	
	})

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
