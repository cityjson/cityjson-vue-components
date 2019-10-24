# CityJSON Vue components

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

### CityObjectCard

A simple card view with details about a city object.

### CityObjectsTree

A tree view of city objects.