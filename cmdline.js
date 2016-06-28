//Reading command line args

module.exports = {
}
var _ = require('lodash')
// var app = require('../')
var minimist = require('minimist')
var argv = minimist(process.argv.slice(2))._
var argv = require('minimist')(process.argv.slice(2))
var args = argv._
var opts = _.omit(argv, '_')
//console.log(argv);
console.log('arguments: ', args)
console.log('options: ', opts)

console.log(opts.b)