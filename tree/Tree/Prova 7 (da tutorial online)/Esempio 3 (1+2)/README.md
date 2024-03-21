# d3js Tree Visualizer with Search, Panning, Expand and Collapse

## Overview

This example pulls together various examples of work with trees in D3.js.
[See the d3js Tree Visualizer live here](http://bl.ocks.org/adamfeuer/raw/a8950c5197fe491f13969a03100159d5).

Features: 
* Expanding and collapsing nodes
* Panning
* Zooming
* Search with autocomplete and centering on found node

The panning functionality can certainly be improved in my opinion and I would be thrilled to see better solutions contributed.

One can do all manner of housekeeping or server related calls on the drop event to manage a remote tree dataset for example.

Panning can either be done by dragging an empty part of the SVG around or dragging a node towards an edge.

Zooming is performed by either double clicking on an empty part of the SVG or by scrolling the mouse-wheel.
To Zoom out hold shift when double-clicking.

Expanding and collapsing of nodes is achieved by clicking on the desired node.

The tree auto-calculates its sizes both horizontally and vertically so it can adapt between many nodes being present in the view 
to very few whilst making the view managable and pleasing on the eye.

Based on:
* https://gist.github.com/robschmuecker/7880033
* https://gist.github.com/PBrockmann/0f22818096428b12ea23

## Running locally

* `./serve.sh`
* Point your web browser at http://localhost:8000

## License

MIT License.

## Contact

Adam Feuer adam at adamfeuer.com or @adamfeuer
