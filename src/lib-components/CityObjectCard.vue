<template>
  <div class="card mb-2" :id="cityobject_id" :class="{ 'border-primary' : selected }">
    <div class="card-body">
      <div class="d-flex justify-content-between">
        <div class="font-weight-bold text-primary text-uppercase mb-2">{{ cityobject.type }}</div>
        <div class="col-auto p-0">
          <button class="btn btn-sm" :class="[ edit_mode ? 'btn-warning' : 'btn-outline-warning' ]" @click="edit_mode = !edit_mode"><i class="fas fa-pen mr-1"></i> {{ edit_mode ? 'Close edit' : 'Edit' }}</button>
        </div>
      </div>
      <h5 class="card-title text-truncate">
        {{ cityobject_id }}
      </h5>
      <div>
        <small v-show="'parents' in cityobject">
          Parents:
          <a
            v-for="parent_id in cityobject.parents"
            :key="parent_id"
            :href="'#' + parent_id"
            :title="parent_id">
              <i class="text-danger" :class="getIconStyle(getObject(parent_id), false)"></i>
          </a>
        </small>
        <small v-show="'children' in cityobject">
          Children:
          <a
            v-for="child_id in cityobject.children"
            :key="child_id"
            :href="'#' + child_id"
            :title="child_id">
              <i class="text-success" :class="getIconStyle(getObject(child_id), false)"></i>
          </a>
        </small>
      </div>
      <div class="d-flex mt-2">
        <div class="badge badge-pill badge-info mr-2" v-if="hasAttributes">
          <a href="#" class="text-white text-decoration-none" @click="toggle_mode(1)" v-if="hasAttributes">{{ attributesCount }} Attributes <i class="fas ml-1" :class="[ !edit_mode && is_mode(1) ? 'fa-chevron-up' : 'fa-chevron-down' ]"></i></a>
        </div>
        <div class="badge badge-pill badge-danger mr-2" v-if="hasAttributes">
          <a href="#" class="text-white text-decoration-none" @click="toggle_mode(2)" v-if="hasGeometries">{{ this.cityobject.geometry.length }} Geometries <i class="fas ml-1" :class="[ !edit_mode && is_mode(2) ? 'fa-chevron-up' : 'fa-chevron-down' ]"></i></a>
        </div>
      </div>
      <div v-if="hasAttributes && expanded || edit_mode">
        <hr>
        <table class="table table-striped table-borderless overflow-auto" v-show="edit_mode == false && is_mode(1)" >
          <tbody>
            <tr v-for="(value, key) in cityobject.attributes" :key="key">
              <th scope="row" class="py-1"><small class="font-weight-bold">{{ key }}</small></th>
              <td class="py-1"><small>{{ value }}</small></td>
            </tr>
          </tbody>
        </table>
        <div v-show="edit_mode == false && is_mode(2)">
          <ul>
            <li v-for="(geom, i) in cityobject.geometry" :key="i">{{ geom.type }}</li>
          </ul>
        </div>
        <div v-if="edit_mode">
          <textarea id="json_data" class="form-control" v-model="jsonString"></textarea>
          <div class="d-flex justify-content-end mt-2">
            <button type="button" class="btn btn-success btn-sm" @click="saveChanges"><i class="fas fa-save mr-1"></i> Save</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'

export default {
  name: "CityObjectCard",
  props: {
    cityobject: Object,
    cityobject_id: String,
    selected: {
      type: Boolean,
      default: false
    },
    expanded: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      edit_mode: false,
    }
  },
  computed: {
    attributesCount: function() {
      return Object.keys(this.cityobject.attributes).length;
    },
    hasAttributes: function() {
      return "attributes" in this.cityobject && this.attributesCount > 0;
    },
    hasGeometries: function() {
      return this.cityobject.geometry;
    },
    iconType: function() {
      return this.getIconStyle(this.cityobject);
    },
    jsonString: {
      get: function() {
        return JSON.stringify(this.cityobject, undefined, 4);
      }
    }
  },
  methods: {
    toggle_mode(mode) {
      if (this.expanded == mode)
      {
        this.expanded = 0;
      }
      else
      {
        this.expanded = mode;
      }
    },
    is_mode(mode) {
      return this.expanded == mode;
    },
    select_this() {
      this.$parent.$emit('object_clicked', this.cityobject_id);
    },
    getObject(objid) {
      if (this.$parent.citymodel)
      {
        return this.$parent.citymodel.CityObjects[objid];
      }
      else
      {
        return {};
      }
    },
    getIconStyle(cityobj, with_colour=true) {
      var type_icons = {
        "Building": ['fas', 'fa-building', 'text-danger', 'mr-1'],
        "BuildingPart": ['far', 'fa-building', 'text-danger', 'mr-1'],
        "BuildingInstallation": ['fas', 'fa-city', 'text-danger', 'mr-1'],
        "Bridge": ['fas', 'fa-archway', 'text-dark', 'mr-1'],
        "BridgePart": ['fas', 'fa-archway', 'text-secondary', 'mr-1'],
        "BridgeInstallation": ['fas', 'fa-archway', 'text-primary', 'mr-1'],
        "BridgeConstructionElement": ['fas', 'fa-archway', 'text-warning', 'mr-1'],
        "CityObjectGroup": ['fas', 'fa-cubes', 'text-dark', 'mr-1'],
        "CityFurniture": ['fas', 'fa-store-alt', 'text-danger', 'mr-1'],
        "GenericCityObject": ['fas', 'fa-cube', 'text-danger', 'mr-1'],
        "LandUse": ['fas', 'fa-chart-area', 'text-success', 'mr-1'],
        "PlantCover": ['fas', 'fa-leaf', 'text-success', 'mr-1'],
        "Railway": ['fas', 'fa-train', 'text-primary', 'mr-1'],
        "Road": ['fas', 'fa-road', 'text-dark', 'mr-1'],
        "SolitaryVegetationObject": ['fas', 'fa-tree', 'text-success', 'mr-1'],
        "TINRelief": ['fas', 'fa-mountain', 'text-success', 'mr-1'],
        "TransportSquare": ['fas', 'fa-circle-notch', 'text-dark', 'mr-1'],
        "Tunnel": ['fas', 'fa-dot-circle', 'text-dark', 'mr-1'],
        "TunnelPart": ['fas', 'fa-dot-circle', 'text-dark', 'mr-1'],
        "TunnelInstallation": ['fas', 'fa-dot-circle', 'text-warning', 'mr-1'],
        "WaterBody": ['fas', 'fa-water', 'text-primary', 'mr-1']
      };

      if (cityobj.type in type_icons)
      {
        var icon_style = type_icons[cityobj.type];
        if (!with_colour)
        {
          icon_style.splice(2, 1);
        } 
        return icon_style;
      }
      else
      {
        return ['fas', 'fa-question', 'text-secondary', 'mr-1'];
      }
    },
    saveChanges() {
      var card_id = $.escapeSelector(this.cityobject_id);
      var new_json = $(`#${card_id} #json_data`).val();
      var new_cityobject = JSON.parse(new_json);

      this.$emit('input', new_cityobject);
    }
  }
}
</script>