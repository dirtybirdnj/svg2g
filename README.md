# svg2g
SVG conversion tools

svg2g currently does two things:

1. It breaks multiple paths in a single <path> element into individual discrete <path> elements
2. Optionally, it can convert these paths to bezier curves

Installation:

1. `mkdir svg2g`
2. `cd svg2g && git clone git@github.com:dirtybirdnj/svg2g.git`
3. Put an .svg file in the `svg2g` directory
4. See usage options below

Usage:

1. Convert mutlipath elements to individual paths: `index.js relativeFile.svg`
2. Convert line paths to bezier curves: `index.js relativeFile.svg -b`
