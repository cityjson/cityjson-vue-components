<template>
  <div class="container mt-2">
    <ul class="col-12 list-group list-group-flush">
      <city-objects-tree :cityobjects="citymodel.CityObjects"></city-objects-tree>
    </ul>
  </div>
</template>

<script>
import { CityObjectsTree } from "../src/entry";

import "bootstrap/dist/css/bootstrap.css";
// import 'bootstrap'

import "@fortawesome/fontawesome-free/css/all.css";

import test_cm from "./data/geores_testdata.json";

export default {
  name: "CityObjectsTreeExample",
  components: {
    CityObjectsTree
  },
  data() {
    return {
      citymodel: test_cm
    };
  }
};
</script>