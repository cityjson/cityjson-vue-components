# CityJSON Vue components

[![npm version](https://badge.fury.io/js/cityjson-vue-components.svg)](https://badge.fury.io/js/cityjson-vue-components)

A collection of Vue components to work with CityJSON files.

## Installation

You can install from `npm` with:

`
npm i cityjson-vue-components
`

or the development version from GitHub:

`
npm install git+https://git@github.com/tudelft3d/cityjson-vue-components.git
`

## Usage

In your main JavaScript folder, import the library and register the components:

```
import CityJSONComponents from 'cityjson-vue-components'

Vue.use(CityJSONComponents)
```

Then you can simply use the components in your template.

## Components

### ThreeJsViewer

A 3D viewer for a citymodel which is based on [threejs](https://threejs.org/).

### CityObjectInfo

A component that view details about a city object.

### CityObjectCard

A card wrapper for `CityObjectInfo`.

### CityObjectsTree

A tree view of city objects.

## Development

The components are located in the `lib-components` folder and they are exported through `src/lib-components/index.js`.

Examples to ease the development are provided in the `examples` folder. You can work with them running: `vue serve examples/{exampleName}.vue`.

To build a new version run: `npm run build`. The output files are located in `dist`.

For more information you may read:
- the official cookbook [recipe](https://vuejs.org/v2/cookbook/packaging-sfc-for-npm.html) of Vue.js of how to bundle components for npm, or
- the [vue-sfc-rollup](https://github.com/team-innovation/vue-sfc-rollup) template upon which this repository is based.


### useful links
http://geovalidation.bk.tudelft.nl/val3dity/docs/definitions/  
https://www.cityjson.org/specs/1.0.1/#geometry-objects  
https://www.cityjson.org/specs/1.0.1/#texture-object  
https://pypi.org/project/cjio/  


### How to run things locally
https://threejs.org/docs/#manual/en/introduction/How-to-run-things-locally 


### demo
toggle demo : https://www.dropbox.com/s/v369n5phuqe3xr0/toggle.mp4?dl=0

