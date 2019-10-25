'use strict';Object.defineProperty(exports,'__esModule',{value:true});function _interopDefault(e){return(e&&(typeof e==='object')&&'default'in e)?e['default']:e}var $=_interopDefault(require('jquery')),_=_interopDefault(require('lodash')),THREE=require('three'),OrbitControls=_interopDefault(require('three-orbitcontrols')),earcut=_interopDefault(require('earcut'));//
//
//
//
//
//

var script = {
  name: 'ExpandableBadge',
  props: {
    expanded: Boolean,
    color: {
      type: String,
      default: 'danger'
    },
    outline: {
      type: Boolean,
      default: true,
    }
  },
  computed: {
    bootstrapColorClass: function() {
      if (this.outline && !this.expanded)
      {
        return ['bg-white', 'border', 'border-' + this.color]
      }
      return ['border', 'border-' + this.color, 'badge-' + this.color];
    },
    bootstrapTextClass: function() {
      if (this.outline && !this.expanded)
      {
        return 'text-' + this.color;
      }
      return 'text-white';
    }
  }
};function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier
/* server only */
, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
  if (typeof shadowMode !== 'boolean') {
    createInjectorSSR = createInjector;
    createInjector = shadowMode;
    shadowMode = false;
  } // Vue.extend constructor export interop.


  var options = typeof script === 'function' ? script.options : script; // render functions

  if (template && template.render) {
    options.render = template.render;
    options.staticRenderFns = template.staticRenderFns;
    options._compiled = true; // functional template

    if (isFunctionalTemplate) {
      options.functional = true;
    }
  } // scopedId


  if (scopeId) {
    options._scopeId = scopeId;
  }

  var hook;

  if (moduleIdentifier) {
    // server build
    hook = function hook(context) {
      // 2.3 injection
      context = context || // cached call
      this.$vnode && this.$vnode.ssrContext || // stateful
      this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext; // functional
      // 2.2 with runInNewContext: true

      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__;
      } // inject component styles


      if (style) {
        style.call(this, createInjectorSSR(context));
      } // register component module identifier for async chunk inference


      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier);
      }
    }; // used by ssr in case component is cached and beforeCreate
    // never gets called


    options._ssrRegister = hook;
  } else if (style) {
    hook = shadowMode ? function () {
      style.call(this, createInjectorShadow(this.$root.$options.shadowRoot));
    } : function (context) {
      style.call(this, createInjector(context));
    };
  }

  if (hook) {
    if (options.functional) {
      // register for functional component in vue file
      var originalRender = options.render;

      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context);
        return originalRender(h, context);
      };
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate;
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
    }
  }

  return script;
}

var normalizeComponent_1 = normalizeComponent;/* script */
var __vue_script__ = script;

/* template */
var __vue_render__ = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"badge badge-pill mr-2",class:_vm.bootstrapColorClass},[_vm._ssrNode("<a href=\"#\""+(_vm._ssrClass("text-decoration-none",_vm.bootstrapTextClass))+">","</a>",[_vm._t("default"),_vm._ssrNode(" <i"+(_vm._ssrClass("fas ml-1",[ _vm.expanded ? 'fa-chevron-up' : 'fa-chevron-down' ]))+"></i>")],2)])};
var __vue_staticRenderFns__ = [];

  /* style */
  var __vue_inject_styles__ = undefined;
  /* scoped */
  var __vue_scope_id__ = undefined;
  /* module identifier */
  var __vue_module_identifier__ = "data-v-dd1a1ade";
  /* functional template */
  var __vue_is_functional_template__ = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var ExpandableBadge = normalizeComponent_1(
    { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
    __vue_inject_styles__,
    __vue_script__,
    __vue_scope_id__,
    __vue_is_functional_template__,
    __vue_module_identifier__,
    undefined,
    undefined
  );//

var script$1 = {
  name: "CityObjectInfo",
  components: {
    ExpandableBadge: ExpandableBadge
  },
  props: {
    cityobject: Object,
    cityobject_id: String,
    selected: {
      type: Boolean,
      default: false
    },
    editable: {
      type: Boolean,
      default: false,
    }
  },
  data: function data() {
    return {
      edit_mode: false,
      expanded: 0
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
    toggle_mode: function toggle_mode(mode) {
      if (this.expanded == mode)
      {
        this.expanded = 0;
      }
      else
      {
        this.expanded = mode;
      }
    },
    is_mode: function is_mode(mode) {
      return this.expanded == mode;
    },
    select_this: function select_this() {
      this.$parent.$emit('object_clicked', this.cityobject_id);
    },
    getObject: function getObject(objid) {
      if (this.$parent.citymodel)
      {
        return this.$parent.citymodel.CityObjects[objid];
      }
      else
      {
        return {};
      }
    },
    getIconStyle: function getIconStyle(cityobj, with_colour) {
      if ( with_colour === void 0 ) with_colour=true;

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
    saveChanges: function saveChanges() {
      var card_id = $.escapeSelector(this.cityobject_id);
      var new_json = $(("#" + card_id + " #json_data")).val();
      var new_cityobject = JSON.parse(new_json);

      this.$emit('input', new_cityobject);
    }
  }
};/* script */
var __vue_script__$1 = script$1;

/* template */
var __vue_render__$1 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',[_vm._ssrNode("<div class=\"d-flex justify-content-between align-items-center\"><div class=\"text-secondary\"><small><i"+(_vm._ssrClass(null,_vm.getIconStyle(_vm.cityobject)))+"></i>"+_vm._ssrEscape(" "+_vm._s(_vm.cityobject.type))+"</small></div> "+((_vm.editable)?("<div class=\"col-auto p-0\"><button"+(_vm._ssrClass("btn btn-sm",[ _vm.edit_mode ? 'btn-warning' : 'btn-outline-warning' ]))+"><i class=\"fas fa-pen mr-1\"></i>"+_vm._ssrEscape(" "+_vm._s(_vm.edit_mode ? 'Close edit' : 'Edit'))+"</button></div>"):"<!---->")+"</div> <h5 class=\"card-title text-truncate\">"+_vm._ssrEscape("\n    "+_vm._s(_vm.cityobject_id)+"\n  ")+"</h5> <div><small"+(_vm._ssrStyle(null,null, { display: ('parents' in _vm.cityobject) ? '' : 'none' }))+">\n      Parents:\n      "+(_vm._ssrList((_vm.cityobject.parents),function(parent_id){return ("<a"+(_vm._ssrAttr("href",'#' + parent_id))+(_vm._ssrAttr("title",parent_id))+"><i"+(_vm._ssrClass("text-danger",_vm.getIconStyle(_vm.getObject(parent_id), false)))+"></i></a>")}))+"</small> <small"+(_vm._ssrStyle(null,null, { display: ('children' in _vm.cityobject) ? '' : 'none' }))+">\n      Children:\n      "+(_vm._ssrList((_vm.cityobject.children),function(child_id){return ("<a"+(_vm._ssrAttr("href",'#' + child_id))+(_vm._ssrAttr("title",child_id))+"><i"+(_vm._ssrClass("text-success",_vm.getIconStyle(_vm.getObject(child_id), false)))+"></i></a>")}))+"</small></div> "),_vm._ssrNode("<div class=\"d-flex mt-2\">","</div>",[(_vm.hasAttributes)?_c('expandable-badge',{attrs:{"color":"info","expanded":!_vm.edit_mode && _vm.is_mode(1)},on:{"click":function($event){return _vm.toggle_mode(1)}}},[_vm._v("\n        "+_vm._s(_vm.attributesCount)+" Attributes\n    ")]):_vm._e(),_vm._ssrNode(" "),(_vm.hasGeometries)?_c('expandable-badge',{attrs:{"color":"danger","expanded":!_vm.edit_mode && _vm.is_mode(2)},on:{"click":function($event){return _vm.toggle_mode(2)}}},[_vm._v("\n        "+_vm._s(this.cityobject.geometry.length)+" Geometries\n    ")]):_vm._e()],2),_vm._ssrNode(" <div"+(_vm._ssrStyle(null,null, { display: (_vm.expanded || _vm.edit_mode) ? '' : 'none' }))+"><hr> <table class=\"table table-striped table-borderless overflow-auto\""+(_vm._ssrStyle(null,null, { display: (_vm.edit_mode == false && _vm.is_mode(1)) ? '' : 'none' }))+"><tbody>"+(_vm._ssrList((_vm.cityobject.attributes),function(value,key){return ("<tr><th scope=\"row\" class=\"py-1\"><small class=\"font-weight-bold\">"+_vm._ssrEscape(_vm._s(key))+"</small></th> <td class=\"py-1\"><small>"+_vm._ssrEscape(_vm._s(value))+"</small></td></tr>")}))+"</tbody></table> <div"+(_vm._ssrStyle(null,null, { display: (_vm.edit_mode == false && _vm.is_mode(2)) ? '' : 'none' }))+"><ul>"+(_vm._ssrList((_vm.cityobject.geometry),function(geom,i){return ("<li>"+_vm._ssrEscape(_vm._s(geom.type))+"</li>")}))+"</ul></div> <div"+(_vm._ssrStyle(null,null, { display: (_vm.edit_mode) ? '' : 'none' }))+"><textarea id=\"json_data\" class=\"form-control\">"+_vm._ssrEscape(_vm._s(_vm.jsonString))+"</textarea> <div class=\"d-flex justify-content-end mt-2\"><button type=\"button\" class=\"btn btn-success btn-sm\"><i class=\"fas fa-save mr-1\"></i> Save</button></div></div></div>")],2)};
var __vue_staticRenderFns__$1 = [];

  /* style */
  var __vue_inject_styles__$1 = undefined;
  /* scoped */
  var __vue_scope_id__$1 = undefined;
  /* module identifier */
  var __vue_module_identifier__$1 = "data-v-a369aeda";
  /* functional template */
  var __vue_is_functional_template__$1 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var CityObjectInfo = normalizeComponent_1(
    { render: __vue_render__$1, staticRenderFns: __vue_staticRenderFns__$1 },
    __vue_inject_styles__$1,
    __vue_script__$1,
    __vue_scope_id__$1,
    __vue_is_functional_template__$1,
    __vue_module_identifier__$1,
    undefined,
    undefined
  );//

var script$2 = {
  name: "CityObjectCard",
  components: {
    CityObjectInfo: CityObjectInfo
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
  data: function data() {
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
    toggle_mode: function toggle_mode(mode) {
      if (this.expanded == mode)
      {
        this.expanded = 0;
      }
      else
      {
        this.expanded = mode;
      }
    },
    is_mode: function is_mode(mode) {
      return this.expanded == mode;
    },
    select_this: function select_this() {
      this.$parent.$emit('object_clicked', this.cityobject_id);
    },
    getObject: function getObject(objid) {
      if (this.$parent.citymodel)
      {
        return this.$parent.citymodel.CityObjects[objid];
      }
      else
      {
        return {};
      }
    },
    getIconStyle: function getIconStyle(cityobj, with_colour) {
      if ( with_colour === void 0 ) with_colour=true;

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
    saveChanges: function saveChanges() {
      var card_id = $.escapeSelector(this.cityobject_id);
      var new_json = $(("#" + card_id + " #json_data")).val();
      var new_cityobject = JSON.parse(new_json);

      this.$emit('input', new_cityobject);
    }
  }
};/* script */
var __vue_script__$2 = script$2;

/* template */
var __vue_render__$2 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"card mb-2",class:{ 'border-primary' : _vm.selected },attrs:{"id":_vm.cityobject_id}},[_vm._ssrNode("<div class=\"card-body\">","</div>",[_c('CityObjectInfo',{attrs:{"cityobject":_vm.cityobject,"cityobject_id":_vm.cityobject_id,"editable":"true"}})],1)])};
var __vue_staticRenderFns__$2 = [];

  /* style */
  var __vue_inject_styles__$2 = undefined;
  /* scoped */
  var __vue_scope_id__$2 = undefined;
  /* module identifier */
  var __vue_module_identifier__$2 = "data-v-7a118b33";
  /* functional template */
  var __vue_is_functional_template__$2 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var CityObjectCard = normalizeComponent_1(
    { render: __vue_render__$2, staticRenderFns: __vue_staticRenderFns__$2 },
    __vue_inject_styles__$2,
    __vue_script__$2,
    __vue_scope_id__$2,
    __vue_is_functional_template__$2,
    __vue_module_identifier__$2,
    undefined,
    undefined
  );//

var script$3 = {
  name: 'CityObjectsTreeItem',
  props: {
    item: Object,
    cityobject_id: String,
    selected_objid: String,
  },
  data: function () {
    return {
      isOpen: false
    }
  },
  created: function created() {
    var this$1 = this;

    this.$on('object_clicked', function (objid) {
      this$1.$parent.$emit('object_clicked', objid);
    });
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
    select_this: function select_this() {
      this.$parent.$emit('object_clicked', this.cityobject_id);
    },
    toggle: function () {
      if (this.isFolder) {
        this.isOpen = !this.isOpen;
      }
    },
    makeFolder: function () {
      if (!this.isFolder) {
        this.$emit('make-folder', this.item);
        this.isOpen = true;
      }
    },
    getObject: function getObject(objid) {
      return this.$parent.citymodel.CityObjects[objid];
    },
    getGeometryIcon: function getGeometryIcon(geom_type) {
      var geometry_icons = {
        "MultiSurface": ['fas', 'fa-map'],
        "Solid": ['fas', 'fa-cube'],
        "MultiSolid": ['fas', 'fa-cubes']
      };

      if (geom_type in geometry_icons)
      {
        return geometry_icons[geom_type];
      }
      else
      {
        return ['fas', 'fa-question'];
      }
    },
    getIconStyle: function getIconStyle(cityobj, with_colour) {
      if ( with_colour === void 0 ) with_colour=true;

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
};/* script */
var __vue_script__$3 = script$3;

/* template */
var __vue_render__$3 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('li',{attrs:{"id":_vm.cityobject_id}},[_vm._ssrNode("<div>"+((_vm.isFolder)?("<a href=\"#\" class=\"mr-1\"><i"+(_vm._ssrClass("far text-dark text-decoration-none",[ _vm.isOpen ? 'fa-minus-square' : 'fa-plus-square' ]))+"></i></a>"):("<span class=\"mr-1\"><i class=\"far fa-square text-secondary\"></i></span>"))+" <a href=\"#\" id=\"objicon\""+(_vm._ssrAttr("title",_vm.item.type))+"><i"+(_vm._ssrClass(null,_vm.iconType))+"></i></a> <a href=\"#\" class=\"text-dark text-decoration-none\"><span"+(_vm._ssrClass(null,{ 'text-primary' : _vm.selected }))+">"+_vm._ssrEscape(_vm._s(_vm.cityobject_id))+"</span></a> "+(_vm._ssrList((_vm.singleGeometries),function(geom,i){return ("<a href=\"#\""+(_vm._ssrAttr("title",geom.type))+" class=\"badge badge-primary mr-1\"><i"+(_vm._ssrClass("mr-1",_vm.getGeometryIcon(geom.type)))+"></i><small>"+_vm._ssrEscape(_vm._s(geom.lod))+"</small></a>")}))+" "+(_vm._ssrList((_vm.geometryInstances),function(geom,i){return ("<span class=\"badge badge-secondary mr-1\"><i class=\"fas fa-external-link-alt\"></i></span>")}))+"</div> "),(_vm.isFolder)?_vm._ssrNode("<ul class=\"list-unstyled ml-4 mb-0\""+(_vm._ssrStyle(null,null, { display: (_vm.isOpen) ? '' : 'none' }))+">","</ul>",_vm._l((_vm.item.children),function(child_id){return _c('CityObjectsTreeItem',{key:child_id,staticClass:"item",attrs:{"item":_vm.getObject(child_id),"cityobject_id":child_id,"selected_objid":_vm.selected_objid}})}),1):_vm._e()],2)};
var __vue_staticRenderFns__$3 = [];

  /* style */
  var __vue_inject_styles__$3 = undefined;
  /* scoped */
  var __vue_scope_id__$3 = undefined;
  /* module identifier */
  var __vue_module_identifier__$3 = "data-v-65afc79c";
  /* functional template */
  var __vue_is_functional_template__$3 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var CityObjectsTreeItem = normalizeComponent_1(
    { render: __vue_render__$3, staticRenderFns: __vue_staticRenderFns__$3 },
    __vue_inject_styles__$3,
    __vue_script__$3,
    __vue_scope_id__$3,
    __vue_is_functional_template__$3,
    __vue_module_identifier__$3,
    undefined,
    undefined
  );//

var script$4 = {
  name: 'CityObjectsTree',
  components: {
    CityObjectsTreeItem: CityObjectsTreeItem
  },
  props: ['cityobjects', 'selected_objid', 'matches'],
  computed: {
    citymodel: function() {
      return this.$parent.citymodel;
    }
  },
  created: function created() {
    var self = this;

    this.$on('object_clicked', function (objid) {
      self.$parent.$emit('object_clicked', objid);
    });
  },
};/* script */
var __vue_script__$4 = script$4;

/* template */
var __vue_render__$4 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('ul',{staticClass:"list-unstyled overflow-auto px-3"},_vm._l((_vm.cityobjects),function(cityobject,coid){return _c('CityObjectsTreeItem',{directives:[{name:"show",rawName:"v-show",value:(_vm.matches(coid, cityobject)),expression:"matches(coid, cityobject)"}],key:coid,attrs:{"item":cityobject,"cityobject_id":coid,"selected_objid":_vm.selected_objid}})}),1)};
var __vue_staticRenderFns__$4 = [];

  /* style */
  var __vue_inject_styles__$4 = undefined;
  /* scoped */
  var __vue_scope_id__$4 = undefined;
  /* module identifier */
  var __vue_module_identifier__$4 = "data-v-297d0c6c";
  /* functional template */
  var __vue_is_functional_template__$4 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var CityObjectsTree = normalizeComponent_1(
    { render: __vue_render__$4, staticRenderFns: __vue_staticRenderFns__$4 },
    __vue_inject_styles__$4,
    __vue_script__$4,
    __vue_scope_id__$4,
    __vue_is_functional_template__$4,
    __vue_module_identifier__$4,
    undefined,
    undefined
  );//

var script$5 = {
  name: 'ThreeJsViewer',
  props: {
    citymodel: Object,
    selected_objid: String,
    object_colors: Object,
    background_color: {
      type: Number,
      default: 0xd9eefc
    }
  },
  data: function data() {
    return {
      camera_init: false
    }
  },
  beforeCreate: function beforeCreate() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = null;
    this.mouse = null;
    this.geoms = {};
    this.meshes = [];
    this.mesh_index = {};
  },
  mounted: async function mounted() {
    var this$1 = this;

    this.$parent.$emit('rendering', true);

    setTimeout(async function () {
      this$1.initScene();

      if (Object.keys(this$1.citymodel).length > 0)
      {
        await this$1.loadCityObjects(this$1.citymodel);
      }
          
      this$1.renderer.render( this$1.scene, this$1.camera );

      var self = this$1;

      $("#viewer").dblclick(function(eventData) {
        if (eventData.button == 0) { //leftClick
          self.handleClick();
        }
      });

      this$1.$parent.$emit('rendering', false);
    }, 25);
  },
  watch: {
    background_color: function(newVal ) {
      this.renderer.setClearColor(newVal);
      
      this.renderer.render(this.scene, this.camera);
    },
    object_colors: {
      handler: function(newVal ) {
      for (var i = 0; i < this.meshes.length; i++)
        { this.meshes[i].material.color.setHex(newVal[this.citymodel.CityObjects[this.meshes[i].name].type]); }

      this.renderer.render(this.scene, this.camera);
      },
      deep: true
    },
    citymodel: {
      handler: async function(newVal ) {
        var this$1 = this;

        this.$parent.$emit('rendering', true);

        setTimeout(async function () {
          this$1.clearScene();

          if (Object.keys(newVal).length > 0)
          {
            await this$1.loadCityObjects(newVal);
          }

          this$1.renderer.render(this$1.scene, this$1.camera);
    
          this$1.$parent.$emit('rendering', false);
        }, 25);
      },
      deep: true
    },
    selected_objid: function(newId, oldId) {
      if (oldId != null)
      {
        var coType = this.citymodel.CityObjects[oldId].type;
        this.mesh_index[oldId].material.color.setHex(this.object_colors[coType]);
      }

      if (newId != null)
      {
        this.mesh_index[newId].material.color.setHex(0xdda500);
      }

      this.renderer.render(this.scene, this.camera);
    }
  },
  methods: {
    handleClick: function handleClick() {
      var rect = this.renderer.domElement.getBoundingClientRect();
      //get mouseposition
      this.mouse.x = ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) * 2 - 1;
      this.mouse.y = -( (event.clientY - rect.top) / this.renderer.domElement.clientHeight) * 2 + 1;

      //get cameraposition
      this.raycaster.setFromCamera(this.mouse, this.camera);

      //calculate intersects
      var intersects = this.raycaster.intersectObjects(this.meshes);

      //if clicked on nothing return
      if (intersects.length == 0) {
        this.$parent.$emit('object_clicked', null);
        return
      }

      //get the id of the first object that intersects (equals the clicked object)
      var cityObjId = intersects[0].object.name;
      this.$parent.$emit('object_clicked', cityObjId);
    },
    initScene: function initScene() {
      this.scene = new THREE.Scene();
      var ratio = $("#viewer").width() / $("#viewer").height();
      this.camera = new THREE.PerspectiveCamera( 60, ratio, 0.001, 1000 );
      this.camera.up.set( 0, 0, 1 );
      
      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      var viewer = document.getElementById("viewer");
      viewer.appendChild( this.renderer.domElement );
      this.renderer.setSize($("#viewer").width(), $("#viewer").height());
      this.renderer.setClearColor(this.background_color);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
      var self = this;

      // add raycaster and mouse (for clickable objects)
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      //add AmbientLight (light that is only there that there's a minimum of light and you can see color)
      //kind of the natural daylight
      var am_light = new THREE.AmbientLight(0xFFFFFF, 0.7); // soft white light
      this.scene.add(am_light);

      // Add directional light
      var spot_light = new THREE.SpotLight(0xDDDDDD);
      spot_light.position.set(84616, -1, 447422);
      spot_light.target = this.scene;
      spot_light.castShadow = true;
      spot_light.intensity = 0.4;
      spot_light.position.normalize();
      this.scene.add(spot_light);
      
      //render & orbit controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.addEventListener('change', function() {
        self.renderer.render(self.scene, self.camera);
      });
    },
    clearScene: function clearScene() {
      while(this.scene.children.length > 0){ 
        this.scene.remove(this.scene.children[0]); 
      }

      var am_light = new THREE.AmbientLight(0xFFFFFF, 0.7); // soft white light
      this.scene.add(am_light);

      // Add directional light
      var spot_light = new THREE.SpotLight(0xDDDDDD);
      spot_light.position.set(84616, -1, 447422);
      spot_light.target = this.scene;
      spot_light.castShadow = true;
      spot_light.intensity = 0.4;
      spot_light.position.normalize();
      this.scene.add(spot_light);
    },
    //convert CityObjects to mesh and add them to the viewer
    loadCityObjects: async function loadCityObjects(json) {      
      //create one geometry that contains all vertices (in normalized form)
      //normalize must be done for all coordinates as otherwise the objects are at same pos and have the same size
      var normGeom = new THREE.Geometry();
        var i;
      for (i = 0; i < json.vertices.length; i++) {
        var point = new THREE.Vector3(
          json.vertices[i][0],
          json.vertices[i][1],
          json.vertices[i][2]
          );
          normGeom.vertices.push(point);
      }
      normGeom.normalize();
      
      for (i = 0; i < json.vertices.length; i++) {
        json.vertices[i][0] = normGeom.vertices[i].x;
        json.vertices[i][1] = normGeom.vertices[i].y;
        json.vertices[i][2] = normGeom.vertices[i].z;
      }
      
      var stats = this.getStats(json.vertices);
      var avgX = stats[3];
      var avgY = stats[4];
      var avgZ = stats[5];
      
      if (!this.camera_init)
      {
        this.camera.position.set(0, 0, 2);
        this.camera.lookAt(avgX, avgY, avgZ);
        
        this.controls.target.set(avgX,
          avgY,
          avgZ);
        
        //enable movement parallel to ground
        this.controls.screenSpacePanning = true;

        this.camera_init = true;
      }

      //count number of objects
      // var totalco = Object.keys(json.CityObjects).length;
      // console.log("Total # City Objects: ", totalco);
      
      //create dictionary
      var children = {};
      
      //iterate through all cityObjects
      for (var cityObj in json.CityObjects) {
        
        // try {
        //parse cityObj that it can be displayed in three js
        var returnChildren = await this.parseObject(cityObj, json);
        
        //if object has children add them to the childrendict
        for (i in returnChildren) {
          children[returnChildren[i]] = cityObj;
        }
          
        // } catch (e) {
        //   console.log("ERROR at creating: " + cityObj + "\n" + e.message);
        //   continue
        // }
        
        //set color of object
        var coType = json.CityObjects[cityObj].type;
        var material = new THREE.MeshLambertMaterial();
        material.color.setHex(this.object_colors[coType]);
        
        //create mesh
        //geoms[cityObj].normalize()
        var _id = cityObj;
        var coMesh = new THREE.Mesh(this.geoms[_id], material);
        coMesh.name = cityObj;
        coMesh.castShadow = true;
        coMesh.receiveShadow = true;
        this.scene.add(coMesh);
        this.meshes.push(coMesh);
        this.mesh_index[_id] = coMesh;
      }
    },
    //convert json file to viwer-object
    parseObject: async function parseObject(cityObj, json) {          
      if (json.CityObjects[cityObj].children != undefined) {
        return (json.CityObjects[cityObj].children)
      }
      
      //create geometry and empty list for the vertices
      var geom = new THREE.Geometry();
      
      //each geometrytype must be handled different
      var geomType = json.CityObjects[cityObj].geometry[0].type;
      var boundaries = [];
      if (geomType == "Solid") {
        boundaries = json.CityObjects[cityObj].geometry[0].boundaries[0];
      } else if (geomType == "MultiSurface" || geomType == "CompositeSurface") {
        boundaries = json.CityObjects[cityObj].geometry[0].boundaries;
      } else if (geomType == "MultiSolid" || geomType == "CompositeSolid") {
        boundaries = json.CityObjects[cityObj].geometry[0].boundaries;
      }
      
      //needed for assocation of global and local vertices
      var verticeId = 0;
      
      var vertices = []; //local vertices
      var boundary = [];
      
      //contains the boundary but with the right verticeId
      var i;
      var j;
      for (i = 0; i < boundaries.length; i++) {
        for (j = 0; j < boundaries[i][0].length; j++) {
          
          //the original index from the json file
          var index = boundaries[i][0][j];
          
          //if this index is already there
          if (vertices.includes(index)) {
            
            var vertPos = vertices.indexOf(index);
            boundary.push(vertPos);
            
          }
          else {
            
            //add vertice to geometry
            var point = new THREE.Vector3(
              json.vertices[index][0],
              json.vertices[index][1],
              json.vertices[index][2]
              );
            geom.vertices.push(point);
            
            vertices.push(index);
            boundary.push(verticeId);
            
            verticeId = verticeId + 1;
          }
            
        }
          
          /*
          console.log("Vert", vertices);
          console.log("Indi", indices);
          console.log("bound", boundary);
          console.log("geom", geom.vertices);
          */
          
          //create face
          //triangulated faces
          if (boundary.length == 3) {
            geom.faces.push(
              new THREE.Face3(boundary[0], boundary[1], boundary[2])
              );
              
              //non triangulated faces
            } else if (boundary.length > 3) {
              
              //create list of points
              var pList = [];
              for (j = 0; j < boundary.length; j++) {
                pList.push({
                  x: json.vertices[vertices[boundary[j]]][0],
                  y: json.vertices[vertices[boundary[j]]][1],
                  z: json.vertices[vertices[boundary[j]]][2]
                });
              }
              //get normal of these points
              var normal = await this.get_normal_newell(pList);
              
              //convert to 2d (for triangulation)
              var pv = [];
              for (j = 0; j < pList.length; j++) {
                var re = await this.to_2d(pList[j], normal);
                pv.push(re.x);
                pv.push(re.y);
              }
              
              //triangulate
              var tr = await earcut(pv, null, 2);
              
              //create faces based on triangulation
              for (j = 0; j < tr.length; j += 3) {
                geom.faces.push(
                  new THREE.Face3(
                    boundary[tr[j]],
                    boundary[tr[j + 1]],
                    boundary[tr[j + 2]]
                    )
                    );
                  }
                  
                }
                
                //reset boundaries
                boundary = [];
                
              }
              
              //needed for shadow
              geom.computeFaceNormals();
              
              //add geom to the list
              var _id = cityObj;
              this.geoms[_id] = geom;
              
              return ("")
              
            },
            getStats: function getStats(vertices) {
              
              var minX = Number.MAX_VALUE;
              var minY = Number.MAX_VALUE;
              var minZ = Number.MAX_VALUE;
              
              var sumX = 0;
              var sumY = 0;
              var sumZ = 0;
              var counter = 0;
              
              for (var i in vertices){
                sumX = sumX + vertices[i][0];
                if (vertices[i][0] < minX){
                  minX = vertices[i][0];
                }
                
                sumY = sumY + vertices[i][1];
                if (vertices[i][1] < minY){
                  minY = vertices[i][1];
                }
                
                if (vertices[i][2] < minZ){
                  minZ = vertices[i][2];
                }
                
                sumZ = sumZ + vertices[i][2];
                counter = counter + 1;
              }
              
              var avgX = sumX/counter;
              var avgY = sumY/counter;
              var avgZ = sumZ/counter;
              
              return ([minX, minY, minZ, avgX, avgY, avgZ])
              
            },
            //-- calculate normal of a set of points
            get_normal_newell: function get_normal_newell(indices) {
              
              // find normal with Newell's method
              var n = [0.0, 0.0, 0.0];
              
              for (var i = 0; i < indices.length; i++) {
                var nex = i + 1;

                if ( nex == indices.length) {
                  nex = 0;
                }

                n[0] = n[0] + ( (indices[i].y - indices[nex].y) * (indices[i].z + indices[nex].z) );
                n[1] = n[1] + ( (indices[i].z - indices[nex].z) * (indices[i].x + indices[nex].x) );
                n[2] = n[2] + ( (indices[i].x - indices[nex].x) * (indices[i].y + indices[nex].y) );
              }

              var b = new THREE.Vector3(n[0], n[1], n[2]);
              return(b.normalize())
            },
            to_2d: function to_2d(p, n) {
              p = new THREE.Vector3(p.x, p.y, p.z);
              var x3 = new THREE.Vector3(1.1, 1.1, 1.1);
              if ( x3.distanceTo(n) < 0.01 ) {
                x3.add(new THREE.Vector3(1.0, 2.0, 3.0));
              }
              var tmp = x3.dot(n);
              var tmp2 = n.clone();
              tmp2.multiplyScalar(tmp);
              x3.sub(tmp2);
              x3.normalize();
              var y3 = n.clone();
              y3.cross(x3);
              var x = p.dot(x3);
              var y = p.dot(y3);
              var re = {x: x, y: y};
              return re;
            }
          }
};/* script */
var __vue_script__$5 = script$5;

/* template */
var __vue_render__$5 = function () {var _vm=this;var _h=_vm.$createElement;var _c=_vm._self._c||_h;return _c('div',{staticClass:"col-12 px-0 h-100",attrs:{"id":"viewer"}},[])};
var __vue_staticRenderFns__$5 = [];

  /* style */
  var __vue_inject_styles__$5 = undefined;
  /* scoped */
  var __vue_scope_id__$5 = undefined;
  /* module identifier */
  var __vue_module_identifier__$5 = "data-v-64b2552e";
  /* functional template */
  var __vue_is_functional_template__$5 = false;
  /* style inject */
  
  /* style inject SSR */
  

  
  var ThreeJsViewer = normalizeComponent_1(
    { render: __vue_render__$5, staticRenderFns: __vue_staticRenderFns__$5 },
    __vue_inject_styles__$5,
    __vue_script__$5,
    __vue_scope_id__$5,
    __vue_is_functional_template__$5,
    __vue_module_identifier__$5,
    undefined,
    undefined
  );/* eslint-disable import/prefer-default-export */var components=/*#__PURE__*/Object.freeze({__proto__:null,CityObjectCard: CityObjectCard,CityObjectInfo: CityObjectInfo,CityObjectsTree: CityObjectsTree,CityObjectsTreeItem: CityObjectsTreeItem,ThreeJsViewer: ThreeJsViewer});// Import vue components

// install function executed by Vue.use()
function install(Vue) {
  if (install.installed) { return; }
  install.installed = true;
  Object.keys(components).forEach(function (componentName) {
    Vue.component(componentName, components[componentName]);
  });
}

// Create module definition for Vue.use()
var CityJSONComponents = {
  install: install,
};

// To auto-install when vue is found
/* global window global */
var GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(CityJSONComponents);
}exports.CityObjectCard=CityObjectCard;exports.CityObjectInfo=CityObjectInfo;exports.CityObjectsTree=CityObjectsTree;exports.CityObjectsTreeItem=CityObjectsTreeItem;exports.ThreeJsViewer=ThreeJsViewer;exports.default=CityJSONComponents;