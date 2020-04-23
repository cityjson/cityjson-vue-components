<template>
  <div id="main_content">
    <three-js-viewer :citymodel="citymodel" texture_theme="rbgTexture"></three-js-viewer>
  </div>
</template>

<script>
import { ThreeJsViewer } from '../src/entry'

import 'bootstrap/dist/css/bootstrap.css'

import test_cm from './data/test.json';

export default {
  name: 'ThreeJsExample',
  components: {
    ThreeJsViewer
  },
  data() {
    return {
      citymodel: test_cm
    }
  }
}
</script>

<style>
html{
  margin: 0px;
  width: 100%;
  height: 100%;
  padding: 0px;
  overflow-y: hidden; /*important as otherwise size is somehow scrollable which is not desired */
}

body{
  margin: 0px;
  padding: 0px;
  height: 100%;
}

#main_content {
  height: 100%;
  width: 100%;
}
</style>