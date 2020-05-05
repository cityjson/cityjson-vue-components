<template>
  <div id="main_content">
    <div class="btn-group">
      <div class="dropdown">
        <button
          class="btn btn-primary dropdown-toggle"
          type="button"
          data-toggle="dropdown"
        >Change material</button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <a class="dropdown-item">object-type</a>
          <a class="dropdown-item">Textures</a>
        </div>
      </div>
      <div class="dropdown">
        <button
          class="btn btn-secondary dropdown-toggle"
          type="button"
          data-toggle="dropdown"
        >Change texture theme</button>
        <div id="themes" class="dropdown-menu" aria-labelledby="dropdownMenuButton">
        </div>
      </div>
    </div>
    <three-js-viewer @func="getTextureThemes" :citymodel="citymodel" texture_theme="rbgTexture"></three-js-viewer>
  </div>
</template>

<script>
import { ThreeJsViewer } from "../src/entry";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min.js";
import $ from "jquery";


import test_cm from "./data/LoD3_Railway_uncompressed.json";

export default {
  name: "ThreeJsExample",
  components: {
    ThreeJsViewer
  },
  data() {
    return {
      citymodel: test_cm,
    };
  },
  methods: {
    getTextureThemes(texture_themes) {
      console.log(texture_themes)
       for (var i=0;i<texture_themes.length;i++) {
      $("#themes").append("<a class='dropdown-item'>"+texture_themes[i]+"</a>");
        console.log(texture_themes[i]);
       }
    }
  }
};
</script>

<style>
html {
  margin: 0px;
  width: 100%;
  height: 100%;
  padding: 0px;
  overflow-y: hidden; /*important as otherwise size is somehow scrollable which is not desired */
}

body {
  margin: 0px;
  padding: 0px;
  height: 100%;
}

#main_content {
  height: 100%;
  width: 100%;
}
</style>