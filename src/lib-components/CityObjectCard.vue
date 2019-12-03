<template>
  <div class="card mb-2" :id="cityobject_id" :class="{ 'border-primary' : selected }">
    <div class="card-body">
      <CityObjectInfo :cityobject="cityobject" :cityobject_id="cityobject_id" @input="saveChanges" editable="true"></CityObjectInfo>
    </div>
  </div>
</template>

<script>
import $ from 'jquery'

import CityObjectInfo from './CityObjectInfo.vue'

export default {
  name: "CityObjectCard",
  components: {
    CityObjectInfo
  },
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