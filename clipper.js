'use strict'

var fs = require('fs')
var minimist = require('minimist')
var _ = require('lodash')
var cheerio = require('cheerio')
var parse = require('parse-svg-path')
var Shape = require('clipper-js')



//Getting the filename arg
var argv = minimist(process.argv.slice(2))
var args = argv._
var opts = _.omit(argv, '_')



var fileName = args[0];

if(fileName == '' || fileName == undefined) thr('Enter a relative file path')

var bezierOutput = (opts.b ? true : false)

//Hardcoded filepath, to be replaced with command line arguments
var path = __dirname + '/' + fileName


let groups = parseSVGGroups(path)
let clippedPaths = clipPaths(groups)
//console.log(clippedPaths.paths)

console.log(wrapSVG(clippedPaths.paths))

// Expects output from parseSVGGroups
function clipPaths(pathGroups){

	let clipShape = new Shape(pathGroups['clip'])

	let clippedShape = new Shape(pathGroups['subject']).difference(clipShape)


	return clippedShape

}

function simpleWrapPath(pathString){

	return '<path d="' + pathString + '" stroke="#000000" fill="none"/>'

}

function wrapSVG(paths){

	var strOutput = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>'
	strOutput += '<svg id="workspace" xmlns="http://www.w3.org/2000/svg" version="1.1">'

		_(paths).forEach(function(element){

			strOutput += simpleWrapPath(pointPath(element))	
			
		})

	strOutput += '</svg>'

	return strOutput

}

// Format the path array that parse() returns for use with clipper-js
function formatPathArr(array){

	let pathArr = []

	_.each(array,(item) => {

		if(item[0] == 'M' || item[0] == 'L'){
			pathArr.push({X: item[1], Y: item[2]})
		}
	})

	return pathArr
}

//Takes in a group, returns an array of paths
function parseGroupPaths(group){

	let $ = cheerio.load(group)
	var paths = _.reduce($('path'), function (items, path) {
		
		let pathArr = parse($(path).attr('d'))
		let formattedArr = formatPathArr(pathArr)
		
		items.push(formatPathArr(pathArr))
		return items
	}, [])	

	return paths
		
}


//Takes in an SVG file, returns an array of paths elements
function parseSVGPaths(filepath){

	$ = cheerio.load(fs.readFileSync(path))
	var paths = _.reduce($('path'), function (items, path) {
		items.push($(path).attr('d'))
		return items
	}, [])

	return paths
}

function parseSVGGroups(filepath){

	let $ = cheerio.load(fs.readFileSync(path))
	var groups = _.reduce($('g'), function (items, group) {
		//items.push(group)
		let groupId = $(group).attr('id')

		//items.push({ id: groupId ,paths : parseGroupPaths(group)})
		items[groupId] = parseGroupPaths(group)
		return items
	}, [])	

	return groups
}

//Composes an SVG path from coordinates
function pointPath(pathPointsArr){

	// console.log('pathArr')
	// console.log(pathPointsArr)
	// console.log('first elem')
	// console.log(pathPointsArr[0])
	// process.exit()

	var pathDataString = 'M' + pathPointsArr[0].X + ',' + pathPointsArr[0].Y //+ ' '
	_(pathPointsArr.slice(1)).forEach(function(element){
		
		pathDataString += ' L' + element.X + ',' + element.Y //+ ' '
	
	})

	pathDataString +='Z'

	return pathDataString
}

//http://jsclipper.sourceforge.net/6.1.3.1/index.html?p=sources_as_text/starter_boolean.txt
function paths2string (paths, scale) {
  var svgpath = "", i, j;
  if (!scale) scale = 1;
  for(i = 0; i < paths.length; i++) {
    for(j = 0; j < paths[i].length; j++){
      if (!j) svgpath += "M";
      else svgpath += "L";
      svgpath += (paths[i][j].X / scale) + ", " + (paths[i][j].Y / scale);
    }
    svgpath += "Z";
  }
  if (svgpath=="") svgpath = "M0,0";
  return svgpath;
}

