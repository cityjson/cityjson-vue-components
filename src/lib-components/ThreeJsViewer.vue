<template>
  <div id="viewer" class="col-12 px-0 h-100"></div>
</template>

<script>
import $ from 'jquery'
import * as THREE from 'three'
import { BufferGeometryUtils } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import OrbitControls from 'three-orbitcontrols'
import earcut from 'earcut'

export default {
  name: 'ThreeJsViewer',
  props: {
    citymodel: Object,
    selected_objid: String,
    object_colors: {
      type: Object,
      default: function() {
        return {
          "Building": 0x7497df,
          "BuildingPart": 0x7497df,
          "BuildingInstallation": 0x7497df,
          "Bridge": 0x999999,
          "BridgePart": 0x999999,
          "BridgeInstallation": 0x999999,
          "BridgeConstructionElement": 0x999999,
          "CityObjectGroup": 0xffffb3,
          "CityFurniture": 0xcc0000,
          "GenericCityObject": 0xcc0000,
          "LandUse": 0xffffb3,
          "PlantCover": 0x39ac39,
          "Railway": 0x000000,
          "Road": 0x999999,
          "SolitaryVegetationObject": 0x39ac39,
          "TINRelief": 0xffdb99,
          "TransportSquare": 0x999999,
          "Tunnel": 0x999999,
          "TunnelPart": 0x999999,
          "TunnelInstallation": 0x999999,
          "WaterBody": 0x4da6ff
        }
      }
    },
    background_color: {
      type: Number,
      default: 0xd9eefc
    }
  },
  data() {
    return {
      camera_init: false
    }
  },
  beforeCreate() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = null;
    this.mouse = null;
    this.geoms = {};
    this.meshes = [];
    this.mesh_index = {};
    this.materials = [];
    this.materials_index = [];
  },
  async mounted() {
    this.$parent.$emit('rendering', true);

    setTimeout(async () => {
      this.initScene();

      if (Object.keys(this.citymodel).length > 0)
      {
        await this.loadCityObjects(this.citymodel);
      }
          
      this.renderer.render( this.scene, this.camera );

      let self = this;

      $("#viewer").dblclick(function(eventData) {
        if (eventData.button == 0) { //leftClick
          self.handleClick()
        }
      });

      this.$parent.$emit('rendering', false);
    }, 25);
  },
  watch: {
    background_color: function(newVal, ) {
      this.renderer.setClearColor(newVal);
      
      this.renderer.render(this.scene, this.camera);
    },
    object_colors: {
      handler: function(newVal, ) {
      for (var i = 0; i < this.meshes.length; i++)
        this.meshes[i].material.color.setHex(newVal[this.citymodel.CityObjects[this.meshes[i].name].type]);

      this.renderer.render(this.scene, this.camera);
      },
      deep: true
    },
    citymodel: {
      handler: async function(newVal, ) {
        this.$parent.$emit('rendering', true);

        setTimeout(async () => {
          this.clearScene();

          if (Object.keys(newVal).length > 0)
          {
            await this.loadCityObjects(newVal);
          }

          this.renderer.render(this.scene, this.camera);
    
          this.$parent.$emit('rendering', false);
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
    handleClick() {
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
    initScene() {
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
            
      let self = this;

      // add raycaster and mouse (for clickable objects)
      this.raycaster = new THREE.Raycaster()
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
      spot_light.intensity = 0.4
      spot_light.position.normalize()
      this.scene.add(spot_light);
      
      //render & orbit controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.addEventListener('change', function() {
        self.renderer.render(self.scene, self.camera);
      });
    },
    clearScene() {
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
      spot_light.intensity = 0.4
      spot_light.position.normalize()
      this.scene.add(spot_light);
    },
    //convert CityObjects to mesh and add them to the viewer
    async loadCityObjects(json) {      
      //create one geometry that contains all vertices (in normalized form)
      //normalize must be done for all coordinates as otherwise the objects are at same pos and have the same size
      var normGeom = new THREE.Geometry()
        var i
      for (i = 0; i < json.vertices.length; i++) {
        var point = new THREE.Vector3(
          json.vertices[i][0],
          json.vertices[i][1],
          json.vertices[i][2]
          );
          normGeom.vertices.push(point)
      }
      normGeom.normalize()
      
      for (i = 0; i < json.vertices.length; i++) {
        json.vertices[i][0] = normGeom.vertices[i].x;
        json.vertices[i][1] = normGeom.vertices[i].y;
        json.vertices[i][2] = normGeom.vertices[i].z;
      }
      
      var stats = this.getStats(json.vertices)
      var avgX = stats[3]
      var avgY = stats[4]
      var avgZ = stats[5]
      
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
      
      //iterate through all cityObjects
      for (var cityObj in json.CityObjects) {
        
        // try {
        await this.parseObject(cityObj, json)
          
        // } catch (e) {
        //   console.log("ERROR at creating: " + cityObj + "\n" + e.message);
        //   continue
        // }
        
        //set color of object
        var coType = json.CityObjects[cityObj].type;
        var material = new THREE.MeshLambertMaterial();
        material.color.setHex(this.object_colors[coType]);

        this.materials.push(material);
        
        //create mesh
        //geoms[cityObj].normalize()
        var _id = cityObj
        var coMesh = new THREE.Mesh(this.geoms[_id], material)
        coMesh.name = cityObj;
        coMesh.castShadow = true;
        coMesh.receiveShadow = true;
        // this.scene.add(coMesh);
        this.meshes.push(coMesh);
        this.mesh_index[_id] = coMesh;
      }

      let geoms = this.geoms;
      var geometries = Object.keys(geoms).map(function(key){
        return geoms[key];
      });
      var bf_geo = BufferGeometryUtils.mergeBufferGeometries(
        geometries,
        true
      );

      for (let i = 0; i < bf_geo.groups.length; i++) {
        bf_geo.groups[i].materialIndex = i;
      }

      var main_mesh = new THREE.Mesh(bf_geo, this.materials);
      this.scene.add(main_mesh);
    },
    createMaterials(){
      var materials = [];

      return materials;
    },
    //convert json file to viwer-object
    async parseObject(cityObj, json) {
      if (!(json.CityObjects[cityObj].geometry &&
        json.CityObjects[cityObj].geometry.length > 0))
      {
        return;
      }
   
      //create geometry and empty list for the vertices
      var geom = new THREE.Geometry()
      var vertices = [] // List of global indices in this surface

      for (var geom_i = 0; geom_i < json.CityObjects[cityObj].geometry.length; geom_i++)
      {
        //each geometrytype must be handled different
        var geomType = json.CityObjects[cityObj].geometry[geom_i].type
        
        var i;
        var j;
        if (geomType == "Solid") {
          var shells = json.CityObjects[cityObj].geometry[geom_i].boundaries;

          for (i = 0; i < shells.length; i++)
          {
            await this.parseShell(geom, shells[i], vertices, json);
          }
        } else if (geomType == "MultiSurface" || geomType == "CompositeSurface") {
          var surfaces = json.CityObjects[cityObj].geometry[geom_i].boundaries;

          await this.parseShell(geom, surfaces, vertices, json);
        } else if (geomType == "MultiSolid" || geomType == "CompositeSolid") {
          var solids = json.CityObjects[cityObj].geometry[geom_i].boundaries;

          for (i = 0; i < solids.length; i++) {
            for (j = 0; j < solids[i].length; j++) {
              await this.parseShell(geom, solids[i][j], vertices, json);
            }
          }
        }
      }
            
      //needed for shadow
      geom.computeFaceNormals();
      
      //add geom to the list
      var _id = cityObj
      var buffer_geom = new THREE.BufferGeometry().fromGeometry(geom);
      this.geoms[_id] = buffer_geom;
      
      return ("")
    },
    async parseShell(geom, boundaries, vertices, json)
    {
      // Contains the boundary but with the right verticeId
      var i; // 
      var j;
      for (i = 0; i < boundaries.length; i++) {
        var boundary = []
        var holes = []

        for (j = 0; j < boundaries[i].length; j++) {
          if (boundary.length > 0)
          {
            holes.push(boundary.length);
          }
          var new_boundary = this.extractLocalIndices(geom, boundaries[i][j], vertices, json)
          boundary.push(...new_boundary);
        }

        if (boundary.length == 3) {
          geom.faces.push(new THREE.Face3(boundary[0], boundary[1], boundary[2]))
        }
        else if (boundary.length > 3) {
          //create list of points
          var pList = []
          var k
          for (k = 0; k < boundary.length; k++) {
            pList.push({
              x: json.vertices[vertices[boundary[k]]][0],
              y: json.vertices[vertices[boundary[k]]][1],
              z: json.vertices[vertices[boundary[k]]][2]
            })
          }

          //get normal of these points
          var normal = await this.get_normal_newell(pList)
          
          //convert to 2d (for triangulation)
          var pv = []
          for (k = 0; k < pList.length; k++) {
            var re = await this.to_2d(pList[k], normal)
            pv.push(re.x)
            pv.push(re.y)
          }
            
          //triangulate
          var tr = await earcut(pv, holes, 2);
          
          //create faces based on triangulation
          for (k = 0; k < tr.length; k += 3) {
            geom.faces.push(
              new THREE.Face3(
                boundary[tr[k]],
                boundary[tr[k + 1]],
                boundary[tr[k + 2]]
                )
                )
          }
        }
      }
    },
    extractLocalIndices(geom, boundary, indices, json)
    {
      var new_boundary = []

      var j
      for (j = 0; j < boundary.length; j++) {
        //the original index from the json file
        var index = boundary[j];
        
        //if this index is already there
        if (indices.includes(index)) {
          var vertPos = indices.indexOf(index)
          new_boundary.push(vertPos)
        }
        else {
          // Add vertex to geometry
          var point = new THREE.Vector3(
            json.vertices[index][0],
            json.vertices[index][1],
            json.vertices[index][2]
            );
          geom.vertices.push(point)
          
          new_boundary.push(indices.length)
          indices.push(index)
        }
      }

      return new_boundary
    },
    getStats(vertices) {
      
      var minX = Number.MAX_VALUE;
      var minY = Number.MAX_VALUE;
      var minZ = Number.MAX_VALUE;
      
      var sumX = 0;
      var sumY = 0;
      var sumZ = 0
      var counter = 0
      
      for (var i in vertices){
        sumX = sumX + vertices[i][0]
        if (vertices[i][0] < minX){
          minX = vertices[i][0]
        }
        
        sumY = sumY + vertices[i][1]
        if (vertices[i][1] < minY){
          minY = vertices[i][1]
        }
        
        if (vertices[i][2] < minZ){
          minZ = vertices[i][2]
        }
        
        sumZ = sumZ + vertices[i][2]
        counter = counter + 1
      }
      
      var avgX = sumX/counter
      var avgY = sumY/counter
      var avgZ = sumZ/counter
      
      return ([minX, minY, minZ, avgX, avgY, avgZ])
      
    },
    //-- calculate normal of a set of points
    get_normal_newell(indices) {
      
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
    to_2d(p, n) {
      p = new THREE.Vector3(p.x, p.y, p.z)
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
      let x = p.dot(x3);
      let y = p.dot(y3);
      var re = {x: x, y: y};
      return re;
    }
  }
}
</script>