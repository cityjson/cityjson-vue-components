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
          <a class="dropdown-item" @click="toggle_material_type('object-type')">object-type</a>
          <a class="dropdown-item" @click="toggle_material_type('Textures')">Textures</a>
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
    <three-js-viewer
      @getTextureThemes="getTextureThemes"
      :citymodel="citymodel"
      :texture_theme="texture_theme"
      :material_type="material_type"
    ></three-js-viewer>
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
      texture_theme: "",
      material_type: "Textures", 
      textureThemes:[] // all themes
    };
  },
  methods: {
    getTextureThemes(texture_themes) {
      texture_themes.push("test")
      for (var i = 0; i < texture_themes.length; i++) {
        //HELPPPP!!! Got crazy about the nested qoutes!
        // Maybe this part can use v-for but I do know how to do it :(
        var click_function="@click='toggle_texture_theme("+texture_themes[i]+")'"  

        var html_theme =
         " <a class='dropdown-item' "+click_function+">"+texture_themes[i]+"</a>"
        $("#themes").append(html_theme);
        console.log(html_theme)
      }
      this.textureThemes=texture_themes
      this.texture_theme = texture_themes[0]; //set the default theme~
    },
    toggle_material_type: function(type) {
      this.material_type = type;
      console.log("the current material type is", type);
    },
    toggle_texture_theme: function(theme) {
      this.texture_theme = theme;
      console.log("the current texture theme is", theme);
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