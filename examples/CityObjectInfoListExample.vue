<template>
  <div class="container mt-2">
    <ul class="col-4 list-group list-group-flush">
      <li class="list-group-item" v-for="(cityobject, id) in citymodel.CityObjects" :key="id" >
        <CityObjectInfo :cityobject="cityobject" :cityobject_id="id"></CityObjectInfo>
      </li>
    </ul>
  </div>
</template>

<script>
import { CityObjectInfo } from '../src/entry';

import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap'

import '@fortawesome/fontawesome-free/css/all.css'

import test_cm from './data/geores_testdata.json';

export default {
    name:  'CityObjectInfoListExample',
    components: {
      CityObjectInfo,
    },
    data() {
      return {
        citymodel: test_cm
      }
    }
}
</script>