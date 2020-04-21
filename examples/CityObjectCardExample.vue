<template>
  <div class="container mt-2">
    <div :class="mainClass">
      <CityObjectCard :cityobject="citymodel.CityObjects[example_id]" :cityobject_id="example_id"></CityObjectCard>
    </div>
    <ul>
      <li>GMLID_BUI367978_1828_268: Only geometry</li>
      <li>GMLID_3260444_166090_1429: Road with atts and geoms</li>
    </ul>
  </div>
</template>

<script>
import { CityObjectCard } from '../src/entry';

import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap'

import '@fortawesome/fontawesome-free/css/all.css'

import test_cm from './data/geores_testdata.json';

export default {
  name:  'CityObjectCardExample', // vue library dev component
  components: {
    CityObjectCard,
  },
  data() {
    return {
      citymodel: test_cm,
      example_id: 'GMLID_BUI367978_1828_268',
      narrow: false
    }
  },
  computed: {
    mainClass: function() {
      return this.narrow ? 'col-4' : []
    }
  }
}
</script>