<template>
  <div id="main_content">
    <texture-viewer :citymodel="citymodel"></texture-viewer>
  </div>
</template>

<script>
import { TextureViewer } from '../src/entry'

import 'bootstrap/dist/css/bootstrap.css'

import test_cm from './data/Rotterdam.json';

export default {
  name: 'Rotterdam',
  components: {
    TextureViewer
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