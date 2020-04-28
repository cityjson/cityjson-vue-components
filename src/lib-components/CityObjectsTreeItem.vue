<template>
  <li :id="cityobject_id">
    <div class="d-flex flex-inline align-items-center">
      <div class="d-flex justify-content-center" style="width: 20px">
        <a href="#" @click="toggle" v-if="isFolder" class="mr-1">
          <i class="fas text-dark text-decoration-none" v-bind:class="[ isOpen ? 'fa-chevron-down' : 'fa-chevron-right' ]"></i>
        </a>
      </div>
      <div class="object-icon d-flex justify-content-center">
        <a href="#" id="objicon" :title="item.type"><i v-bind:class="iconType"></i></a>
      </div>
      <a href="#" class="text-dark text-decoration-none mr-1" @click="select_this"><span :class="{ 'text-primary' : selected }">{{ cityobject_id }}</span></a>
      <geometry-badge
        v-for="(geom, i) in item.geometry"
        :key="i"
        :geometry="geom"
      ></geometry-badge>
    </div>
    <ul class="list-unstyled ml-4 mb-0" v-show="isOpen" v-if="isFolder">
      <CityObjectsTreeItem
        class="item"
        v-for="child_id in item.children"
        :citymodel="citymodel"
        :key="child_id"
        :item="getObject(child_id)"
        :cityobject_id="child_id"
        :selected_objid="selected_objid"
        @object_clicked="$emit('object_clicked', $event)"
      ></CityObjectsTreeItem>
    </ul>
  </li>
</template>

<script>
import _ from 'lodash'

import GeometryBadge from './common/GeometryBadge.vue'

export default {
  name: 'CityObjectsTreeItem',
  components: {
    GeometryBadge
  },
  props: {
    item: Object,
    cityobject_id: String,
    selected_objid: String,
    citymodel: Object
  },
  data: function () {
    return {
      isOpen: false
    }
  },
  computed: {
    selected: function() {
      return this.cityobject_id == this.selected_objid;
    },
    singleGeometries: function() {
      return _.pickBy(this.item.geometry, function(geometry) {
        return geometry.lod;
      });
    },
    geometryInstances: function() {
      return _.pickBy(this.item.geometry, function(geom) {
        return geom.type == "GeometryInstance";
      });
    },
    isFolder: function () {
      return this.item.children &&
        this.item.children.length
    },
    iconType: function() {
      return this.getIconStyle(this.item);
    }
  },
  methods: {
    select_this() {
      this.$emit('object_clicked', this.cityobject_id);
    },
    toggle: function () {
      if (this.isFolder) {
        this.isOpen = !this.isOpen
      }
    },
    makeFolder: function () {
      if (!this.isFolder) {
        this.$emit('make-folder', this.item)
        this.isOpen = true
      }
    },
    getObject(objid) {
      return this.citymodel.CityObjects[objid];
    },
    getGeometryIcon(geom_type) {
      var geometry_icons = {
        "MultiSurface": ['fas', 'fa-map'],
        "Solid": ['fas', 'fa-cube'],
        "MultiSolid": ['fas', 'fa-cubes']
      }

      if (geom_type in geometry_icons)
      {
        return geometry_icons[geom_type];
      }
      else
      {
        return ['fas', 'fa-question'];
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
  }
}
</script>

<style>
.object-icon {
  width: 24px;
}
</style>