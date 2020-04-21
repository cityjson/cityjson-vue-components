<template>
  <div id="viewer" class="col-12 px-0 h-100"></div>
</template>

<script crossorigin="anonymous">
import $ from "jquery";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import earcut from "earcut";
import { BufferGeometryUtils } from "../../BufferGeometryUtils.js";

var allmateri = [];
var order_materi = [];

export default {
  name: "TextureViewer",
  props: {
    citymodel: Object,
    selected_objid: String,
    object_colors: {
      type: Object,
      default: function() {
        return {
          Building: 0x7497df,
          BuildingPart: 0x7497df,
          BuildingInstallation: 0x7497df,
          Bridge: 0x999999,
          BridgePart: 0x999999,
          BridgeInstallation: 0x999999,
          BridgeConstructionElement: 0x999999,
          CityObjectGroup: 0xffffb3,
          CityFurniture: 0xcc0000,
          GenericCityObject: 0xcc0000,
          LandUse: 0xffffb3,
          PlantCover: 0x39ac39,
          Railway: 0x000000,
          Road: 0x999999,
          SolitaryVegetationObject: 0x39ac39,
          TINRelief: 0xffdb99,
          TransportSquare: 0x999999,
          Tunnel: 0x999999,
          TunnelPart: 0x999999,
          TunnelInstallation: 0x999999,
          WaterBody: 0x4da6ff
        };
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
    };
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
    this.geometries = [];
  },
  async mounted() {
    this.$parent.$emit("rendering", true);

    setTimeout(async () => {
      this.initScene();

      if (Object.keys(this.citymodel).length > 0) {
        await this.loadCityObjects(this.citymodel);
      }

      this.renderer.render(this.scene, this.camera);

      let self = this;

      $("#viewer").dblclick(function(eventData) {
        if (eventData.button == 0) {
          //leftClick
          self.handleClick();
        }
      });

      this.$parent.$emit("rendering", false);
    }, 25);
  },
  watch: {
    background_color: function(newVal) {
      this.renderer.setClearColor(newVal);

      this.renderer.render(this.scene, this.camera);
    },
    object_colors: {
      handler: function(newVal) {
        for (var i = 0; i < this.meshes.length; i++)
          this.meshes[i].material.color.setHex(
            newVal[this.citymodel.CityObjects[this.meshes[i].name].type]
          );

        this.renderer.render(this.scene, this.camera);
      },
      deep: true
    },
    citymodel: {
      handler: async function(newVal) {
        this.$parent.$emit("rendering", true);

        setTimeout(async () => {
          this.clearScene();

          if (Object.keys(newVal).length > 0) {
            await this.loadCityObjects(newVal);
          }

          this.renderer.render(this.scene, this.camera);

          this.$parent.$emit("rendering", false);
        }, 25);
      },
      deep: true
    },
    selected_objid: function(newId, oldId) {
      if (oldId != null) {
        var coType = this.citymodel.CityObjects[oldId].type;
        this.mesh_index[oldId].material.color.setHex(
          this.object_colors[coType]
        );
      }

      if (newId != null) {
        this.mesh_index[newId].material.color.setHex(0xdda500);
      }

      this.renderer.render(this.scene, this.camera);
    }
  },
  methods: {
    handleClick() {
      var rect = this.renderer.domElement.getBoundingClientRect();
      //get mouseposition
      this.mouse.x =
        ((event.clientX - rect.left) / this.renderer.domElement.clientWidth) *
          2 -
        1;
      this.mouse.y =
        -((event.clientY - rect.top) / this.renderer.domElement.clientHeight) *
          2 +
        1;

      //get cameraposition
      this.raycaster.setFromCamera(this.mouse, this.camera);

      //calculate intersects
      var intersects = this.raycaster.intersectObjects(this.geometries);

      //if clicked on nothing return
      if (intersects.length == 0) {
        this.$parent.$emit("object_clicked", null);
        return;
      }

      //get the id of the first object that intersects (equals the clicked object)
      var cityObjId = intersects[0].object.name;
      this.$parent.$emit("object_clicked", cityObjId);
    },
    initScene() {
      this.scene = new THREE.Scene();
      var ratio = $("#viewer").width() / $("#viewer").height();
      this.camera = new THREE.PerspectiveCamera(60, ratio, 0.001, 1000);
      this.camera.up.set(0, 0, 1);

      this.renderer = new THREE.WebGLRenderer({
        antialias: true
      });
      var viewer = document.getElementById("viewer");
      viewer.appendChild(this.renderer.domElement);
      this.renderer.setSize($("#viewer").width(), $("#viewer").height());
      this.renderer.setClearColor(this.background_color);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      let self = this;

      // add raycaster and mouse (for clickable objects)
      this.raycaster = new THREE.Raycaster();
      this.mouse = new THREE.Vector2();

      //add AmbientLight (light that is only there that there's a minimum of light and you can see color)
      //kind of the natural daylight
      var am_light = new THREE.AmbientLight(0xffffff, 0.7); // soft white light
      this.scene.add(am_light);

      // Add directional light
      var spot_light = new THREE.SpotLight(0xdddddd);
      spot_light.position.set(84616, -1, 447422);
      spot_light.target = this.scene;
      spot_light.castShadow = true;
      spot_light.intensity = 0.4;
      spot_light.position.normalize();
      this.scene.add(spot_light);

      //render & orbit controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.addEventListener("change", function() {
        self.renderer.render(self.scene, self.camera);
      });
    },
    clearScene() {
      while (this.scene.children.length > 0) {
        this.scene.remove(this.scene.children[0]);
      }

      var am_light = new THREE.AmbientLight(0xffffff, 0.7); // soft white light
      this.scene.add(am_light);

      // Add directional light
      var spot_light = new THREE.SpotLight(0xdddddd);
      spot_light.position.set(84616, -1, 447422);
      spot_light.target = this.scene;
      spot_light.castShadow = true;
      spot_light.intensity = 0.4;
      spot_light.position.normalize();
      this.scene.add(spot_light);
    },
    //convert CityObjects to mesh and add them to the viewer
    async loadCityObjects(json) {
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

      if (!this.camera_init) {
        this.camera.position.set(0, 0, 2);
        this.camera.lookAt(avgX, avgY, avgZ);

        this.controls.target.set(avgX, avgY, avgZ);

        //enable movement parallel to ground
        this.controls.screenSpacePanning = true;

        this.camera_init = true;
      }

      // prepare all the materials from json file
      var textures = json.appearance["textures"];
      for (i = 0; i < textures.length; i++) {
        allmateri.push(
          new THREE.MeshBasicMaterial({
            map: new THREE.TextureLoader().load(
              "api/examples/data/" + textures[i]["image"]
            )
          })
        );
      }

      // material for "null"
      allmateri.push(
        new THREE.MeshBasicMaterial({
          map: new THREE.TextureLoader().load(
            "api/examples/data/appearances/ground.jpg"
          )
        })
      );

      //iterate through all cityObjects
      for (var cityObj in json.CityObjects) {
        await this.parseObject(cityObj, json);
      }

      console.log("Let's see what we have here");
      var bf_geo = BufferGeometryUtils.mergeBufferGeometries(//BufferGeometryUtils.mergeBufferGeometries(
        this.geometries,
        true
      );
      for (i = 0; i < bf_geo.groups.length; i++) {
        bf_geo.groups[i].materialIndex = order_materi[i];
      }

      var coMesh = new THREE.Mesh(bf_geo, allmateri);
      this.scene.add(coMesh);
    },
    //convert json file to viwer-object
    async parseObject(cityObj, json) {
      if (
        !(
          json.CityObjects[cityObj].geometry &&
          json.CityObjects[cityObj].geometry.length > 0
        )
      ) {
        return;
      }

      //each geometrytype must be handled different
      var geomType = json.CityObjects[cityObj].geometry[0].type;
      var boundaries = [];
      if (geomType == "Solid") {
        boundaries = json.CityObjects[cityObj].geometry[0].boundaries[0];
      } else if (geomType == "MultiSurface" || geomType == "CompositeSurface") {
        boundaries = json.CityObjects[cityObj].geometry[0].boundaries;
      } else if (geomType == "MultiSolid" || geomType == "CompositeSolid") {
        boundaries = json.CityObjects[cityObj].geometry[0].boundaries[0][0];
      }

      //needed for assocation of global and local vertices
      var verticeId = 0;
      var vertices = []; //local vertices
      var indices = []; //global vertices
      var boundary = [];
      var uvs = []; // corresponding to boundary

      // get global texture information
      var texture_global = json.appearance;
      // get texture information of one CityObject
      var textures =
        json.CityObjects[cityObj].geometry[0].texture["rgbTexture"].values;
      //contains the boundary but with the right verticeId
      var i;
      var j;

      for (i = 0; i < boundaries.length; i++) {
        var b_geom = new THREE.Geometry();
        var b_vertices = []; // for single boundary
        var b_boundary = [];
        var b_verticeId = 0;
        var b_uvs = [];

        var img = texture_global["textures"][textures[i][0][0]];
        if (img) order_materi.push(textures[i][0][0]);
        else order_materi.push(allmateri.length - 1);

        for (j = 0; j < boundaries[i][0].length; j++) {
          //the original index from the json file
          var index = boundaries[i][0][j];

          //add vertice to geometry
          var point = new THREE.Vector3(
            json.vertices[index][0],
            json.vertices[index][1],
            json.vertices[index][2]
          );
          b_geom.vertices.push(point);

          b_vertices.push(index);
          b_boundary.push(b_verticeId);

          b_verticeId = b_verticeId + 1;

          if (img) {
            var uv = texture_global["vertices-texture"][textures[i][0][j + 1]];
            b_uvs.push(new THREE.Vector2(uv[0], uv[1]));
          }
        }

        //create face
        var pList = [];
        for (j = 0; j < b_boundary.length; j++) {
          pList.push({
            x: json.vertices[b_vertices[b_boundary[j]]][0],
            y: json.vertices[b_vertices[b_boundary[j]]][1],
            z: json.vertices[b_vertices[b_boundary[j]]][2]
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
        if (tr.length == 0) {
          order_materi.pop();
          continue;
        }

        //create faces based on triangulation
        for (j = 0; j < tr.length; j += 3) {
          var face = new THREE.Face3(
            b_boundary[tr[j]],
            b_boundary[tr[j + 1]],
            b_boundary[tr[j + 2]]
          );
          b_geom.faces.push(face);

          if (img) {
            b_geom.faceVertexUvs[0].push([
              b_uvs[tr[j]],
              b_uvs[tr[j + 1]],
              b_uvs[tr[j + 2]]
            ]);
          } else {
            b_geom.faceVertexUvs[0].push([(0, 0), (0, 1), (1, 0)]);
          }
        }
        var buffergeo = new THREE.BufferGeometry().fromGeometry(b_geom);
        this.geometries.push(buffergeo);
      }

      return "";
    },
    getStats(vertices) {
      var minX = Number.MAX_VALUE;
      var minY = Number.MAX_VALUE;
      var minZ = Number.MAX_VALUE;

      var sumX = 0;
      var sumY = 0;
      var sumZ = 0;
      var counter = 0;

      for (var i in vertices) {
        sumX = sumX + vertices[i][0];
        if (vertices[i][0] < minX) {
          minX = vertices[i][0];
        }

        sumY = sumY + vertices[i][1];
        if (vertices[i][1] < minY) {
          minY = vertices[i][1];
        }

        if (vertices[i][2] < minZ) {
          minZ = vertices[i][2];
        }

        sumZ = sumZ + vertices[i][2];
        counter = counter + 1;
      }

      var avgX = sumX / counter;
      var avgY = sumY / counter;
      var avgZ = sumZ / counter;

      return [minX, minY, minZ, avgX, avgY, avgZ];
    },
    //-- calculate normal of a set of points
    get_normal_newell(indices) {
      // find normal with Newell's method
      var n = [0.0, 0.0, 0.0];

      for (var i = 0; i < indices.length; i++) {
        var nex = i + 1;

        if (nex == indices.length) {
          nex = 0;
        }

        n[0] =
          n[0] +
          (indices[i].y - indices[nex].y) * (indices[i].z + indices[nex].z);
        n[1] =
          n[1] +
          (indices[i].z - indices[nex].z) * (indices[i].x + indices[nex].x);
        n[2] =
          n[2] +
          (indices[i].x - indices[nex].x) * (indices[i].y + indices[nex].y);
      }

      var b = new THREE.Vector3(n[0], n[1], n[2]);
      return b.normalize();
    },
    to_2d(p, n) {
      p = new THREE.Vector3(p.x, p.y, p.z);
      var x3 = new THREE.Vector3(1.1, 1.1, 1.1);
      if (x3.distanceTo(n) < 0.01) {
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
      var re = { x: x, y: y };
      return re;
    }
  }
};
</script>

