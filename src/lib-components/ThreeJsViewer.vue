<template>
  <div id="viewer" class="col-12 px-0 h-100"></div>
</template>
<script>
import $ from "jquery";
import * as THREE from "three";
import OrbitControls from "three-orbitcontrols";
import earcut from "earcut";
import { Matrix4, Vector3 } from "three";

export default {
  name: "ThreeJsViewer",
  props: {
    citymodel: Object,
    selected_objid: String,
    texture_theme: String,
    material_type: String,
    textures_server: {
      type: String,
      default: "api/" // temporarily create a server using http-server package  (also see vue.config.js)
    }, // server storing the texture files e.g. .jpeg

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

    this.mainMatrix = new Matrix4();

    // MATERIAL RELATED

    this.poly_index = []; // record the each poly of one obj
    this.obj_poly_index = {}; //record the poly_index of all objs

    this.materials = []; //store all the mesh-related materials in advance
    this.materials_index = []; // record the material index of one cityObj
    this._uvs = []; //record the uv cooridnates of one cityObj

    this.textureThemes_uvs = {}; //store all the different textureThemes and their corresponding uv coordinates (pay attention to the variable "texture_theme")
    this.textureThemes_materials_index = {}; //store all the different textureThemes and their corresponding material index

    // TEMPLATE GEOMETRY RELATED
    this.template_geoms = []; // store the constructed threejs geometries
    this.tg_poly_index = []; //for each template gemetry, store the corresponding "poly_index"
    this.tg_textureThemes_uvs = {};
    this.tg_textureThemes_materials_index = {};
  },

  async mounted() {
    this.$parent.$emit("rendering", true);
    // get all the exsiting texture theme
    this.getTextureThemes(this.citymodel);

    setTimeout(async () => {
      this.initScene();
      if (Object.keys(this.citymodel).length > 0) {
        await this.prepareCityObjects(this.citymodel);
        this.loadCityObjects(this.citymodel)
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
    },
        texture_theme: function() {
      this.$parent.$emit("rendering", true);

      setTimeout(async () => {
        this.clearScene();

        if (Object.keys(this.citymodel).length > 0) {
          await this.loadCityObjects(this.citymodel);
        }

        this.renderer.render(this.scene, this.camera);

        this.$parent.$emit("rendering", false);
      }, 25);
    },
    material_type: function() {
      this.$parent.$emit("rendering", true);

      setTimeout(async () => {
        this.clearScene();

       if (Object.keys(this.citymodel).length > 0) {
          await this.loadCityObjects(this.citymodel);
        }

        this.renderer.render(this.scene, this.camera);

        this.$parent.$emit("rendering", false);
      }, 25);
    }
  },
  methods: {
    getTextureThemes(json) {
      var texture_themes = [];
      // QUESTION: Should I also need to check the texture themes in geotemplate???? But I will
      for (var cityObj in json.CityObjects) {
        for (
          var geom_i = 0;
          geom_i < json.CityObjects[cityObj].geometry.length;
          geom_i++
        ) {
          if (
            "texture" in this.citymodel.CityObjects[cityObj].geometry[geom_i]
          ) {
            let _themes = Object.keys(
              this.citymodel.CityObjects[cityObj].geometry[geom_i].texture
            );
            texture_themes = texture_themes.concat(_themes);
          }
        }
      }

      // check texture theme in geo template
      if ("geometry-templates" in json) {
        for (
          geom_i = 0;
          geom_i < json["geometry-templates"]["templates"].length;
          geom_i++
        ) {
          if ("texture" in json["geometry-templates"]["templates"][geom_i]) {
            let _themes = Object.keys(
              json["geometry-templates"]["templates"][geom_i].texture
            );
            texture_themes = texture_themes.concat(_themes);
          }
        }
      }

      var uniqueTextureThemes = [...new Set(texture_themes)];

      //store all the themes to this.textureThemes_uvs, but the uv cooridnates are still []
      uniqueTextureThemes.forEach(
        (key, i) => (this.textureThemes_uvs[key] = [])
      );
      this.textureThemes = uniqueTextureThemes;

      this.$emit("getTextureThemes", uniqueTextureThemes);
    },
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
      var intersects = this.raycaster.intersectObjects(this.meshes);

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
    async prepareCityObjects(json) {
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

      normGeom.computeBoundingSphere();
      var sphere = normGeom.boundingSphere;
      var center = sphere.center;
      var radius = sphere.radius;

      var s = radius === 0 ? 1 : 1.0 / radius;

      this.mainMatrix.set(
        s,
        0,
        0,
        -s * center.x,
        0,
        s,
        0,
        -s * center.y,
        0,
        0,
        s,
        -s * center.z,
        0,
        0,
        0,
        1
      );

      normGeom.applyMatrix4(this.mainMatrix);

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

      if ("geometry-templates" in json) {
        for (var theme in this.textureThemes_uvs) {
          await this.parseTemplateGeom(theme, json);
        }
      }

      var _tmp=this.material_type
      this.material_type="Textures"
      //store all the uv_coordinates and materials_index for each theme
      for (var theme in this.textureThemes_uvs) {
        var _obj_uvs = {};
        var _obj_mater_index = {};

        for (var cityObj in json.CityObjects) {
          await this.parseObject(theme, cityObj, json);
          _obj_uvs[cityObj] = this._uvs;
          _obj_mater_index[cityObj] = this.materials_index;
          this._uvs = [];
          this.materials_index = [];
        }
        this.textureThemes_uvs[theme] = _obj_uvs;
        this.textureThemes_materials_index[theme] = _obj_mater_index;
      }
      this.material_type=_tmp
    },
    loadCityObjects(json) {
      this.createMaterials(json);

      // interate all the cityobjs
      for (var cityObj in json.CityObjects) {
        var _id = cityObj;
        var buffergeom;

        // Kepp this.geoms still store geom but the mesh is buffergeom

        var geoMaterials;
        var geoMaterialsIndex;
        var geoPolyIndex;

        if (_id in this.geoms) {
          buffergeom = new THREE.BufferGeometry().fromGeometry(this.geoms[_id]);
          if (this.material_type == "Textures") {
            this.geoms[_id].faceVertexUvs = this.textureThemes_uvs[
              this.texture_theme
            ][_id];
            geoMaterialsIndex = this.textureThemes_materials_index[
              this.texture_theme
            ][_id];
            var uniqueIndex = [...new Set(geoMaterialsIndex)];

            geoMaterials = uniqueIndex.map(x => this.materials[x]);

            buffergeom.clearGroups();

            geoPolyIndex = this.obj_poly_index[_id];

            for (var i = 0; i < geoPolyIndex.length - 1; i++) {
              buffergeom.addGroup(
                geoPolyIndex[i] * 3,
                (geoPolyIndex[i + 1] - geoPolyIndex[i]) * 3,
                uniqueIndex.indexOf(geoMaterialsIndex[i])
              );
            }
          } else {
            let material_i = Object.keys(this.object_colors).findIndex(function(
              color
            ) {
              return color == json.CityObjects[cityObj].type;
            });

            buffergeom.groups[0].materialIndex = 0;
            geoMaterials = this.materials[material_i];
          }
        }

        var coMesh = new THREE.Mesh(buffergeom);
        coMesh.material = geoMaterials;
        coMesh.name = cityObj;
        coMesh.castShadow = true;
        coMesh.receiveShadow = true;
        this.scene.add(coMesh);
        this.meshes.push(coMesh);
        this.mesh_index[_id] = coMesh;
      }
    },
    createMaterials(json) {
      var materials = [];

      if (this.material_type == "Textures") {
        var textures = json.appearance["textures"];
        for (let i = 0; i < textures.length; i++) {
          var texture = new THREE.TextureLoader().load(
            this.textures_server + textures[i]["image"]
          );
          texture.magFilter = THREE.NearestFilter;
          texture.minFilter = THREE.NearestFilter;
          materials.push(
            new THREE.MeshLambertMaterial({
              map: texture
            })
          );
        }

        materials.push(new THREE.MeshLambertMaterial({ color: "black" }));
      } else {
        let object_colors = this.object_colors;
        materials = Object.keys(object_colors).map(function(key) {
          var material = new THREE.MeshLambertMaterial();

          material.color.setHex(object_colors[key]);

          return material;
        });
      }

      this.materials = materials;
    },
    async parseTemplateGeom(theme, json) {
      //create geometry and empty list for the vertices
      this.tg_textureThemes_uvs[theme] = [];
      this.tg_textureThemes_materials_index[theme] = [];
      for (
        var geom_i = 0;
        geom_i < json["geometry-templates"]["templates"].length;
        geom_i++
      ) {
        var geom = new THREE.Geometry();
        var vertices = []; // List of global indices in this surface

        //each geometrytype must be handled different
        var geomType = json["geometry-templates"]["templates"][geom_i].type;

        var geoTexture = null;
        var shellTexture;

        // sparse different texture themes
        if ("texture" in json["geometry-templates"]["templates"][geom_i]) {
          let _texture =
            json["geometry-templates"]["templates"][geom_i].texture;
          if (theme in _texture) {
            geoTexture = _texture[theme].values;
          }
        }
        var i;
        var j;
        if (geomType == "Solid") {
          var shells =
            json["geometry-templates"]["templates"][geom_i].boundaries;

          for (i = 0; i < shells.length; i++) {
            if (geoTexture == null) {
              shellTexture == null;
            } else {
              shellTexture = geoTexture[i];
            }
            await this.parseShell(
              geom,
              shells[i],
              vertices,
              json,
              shellTexture,
              true
            );
          }
        } else if (
          geomType == "MultiSurface" ||
          geomType == "CompositeSurface"
        ) {
          var surfaces =
            json["geometry-templates"]["templates"][geom_i].boundaries;
          await this.parseShell(
            geom,
            surfaces,
            vertices,
            json,
            geoTexture,
            true
          );
        } else if (geomType == "MultiSolid" || geomType == "CompositeSolid") {
          var solids =
            json["geometry-templates"]["templates"][geom_i].boundaries;

          for (i = 0; i < solids.length; i++) {
            for (j = 0; j < solids[i].length; j++) {
              shellTexture = geoTexture[i][j];
              await this.parseShell(
                geom,
                solids[i][j],
                vertices,
                json,
                shellTexture,
                true
              );
            }
          }
        }

        this.template_geoms.push(geom);
        this.tg_poly_index.push(this.poly_index);
        this.tg_textureThemes_uvs[theme].push(geom.faceVertexUvs);
        this.tg_textureThemes_materials_index[theme].push(this.materials_index);

        this.materials_index = [];
        this.poly_index = [];
      }

      return "";
    },
    //convert json file to viwer-object
    async parseObject(theme, cityObj, json) {
      if (
        !(
          json.CityObjects[cityObj].geometry &&
          json.CityObjects[cityObj].geometry.length > 0
        )
      ) {
        return;
      }

      //create geometry and empty list for the vertices
      var geom = new THREE.Geometry();
      var vertices = []; // List of global indices in this surface

      for (
        var geom_i = 0;
        geom_i < json.CityObjects[cityObj].geometry.length;
        geom_i++
      ) {
        //each geometrytype must be handled different
        var geomType = json.CityObjects[cityObj].geometry[geom_i].type;

        var geoTexture = null;
        var shellTexture;

        // sparse different texture themes
        if ("texture" in json.CityObjects[cityObj].geometry[geom_i]) {
          let _texture = json.CityObjects[cityObj].geometry[geom_i].texture;
          if (theme in _texture) {
            geoTexture = _texture[theme].values;
          }
        }

        var i;
        var j;
        if (geomType == "Solid") {
          var shells = json.CityObjects[cityObj].geometry[geom_i].boundaries;

          for (i = 0; i < shells.length; i++) {
            if (geoTexture == null) {
              shellTexture == null;
            } else {
              shellTexture = geoTexture[i];
            }
            await this.parseShell(
              geom,
              shells[i],
              vertices,
              json,
              shellTexture
            );
          }
        } else if (
          geomType == "MultiSurface" ||
          geomType == "CompositeSurface"
        ) {
          var surfaces = json.CityObjects[cityObj].geometry[geom_i].boundaries;
          await this.parseShell(geom, surfaces, vertices, json, geoTexture);
        } else if (geomType == "MultiSolid" || geomType == "CompositeSolid") {
          var solids = json.CityObjects[cityObj].geometry[geom_i].boundaries;

          for (i = 0; i < solids.length; i++) {
            for (j = 0; j < solids[i].length; j++) {
              shellTexture = geoTexture[i][j];
              await this.parseShell(
                geom,
                solids[i][j],
                vertices,
                json,
                shellTexture
              );
            }
          }
        } else if (geomType == "GeometryInstance") {
          var geoTemplate_i =
            json.CityObjects[cityObj].geometry[geom_i].template;
          var referencePoint =
            json.vertices[
              json.CityObjects[cityObj].geometry[geom_i].boundaries[0]
            ]; //QUESTION:  why array??
          var m = new THREE.Matrix4();
          m.set(
            ...json.CityObjects[cityObj].geometry[geom_i].transformationMatrix
          );

          var instance = this.template_geoms[geoTemplate_i].clone();
          // instance.translate(referencePoint);
          instance.applyMatrix4(m);
          var s = new Vector3();
          s.setFromMatrixScale(this.mainMatrix);
          instance.scale(s.x, s.y, s.z);
          instance.translate(...referencePoint);

          geom.vertices = geom.vertices.concat(instance.vertices);
          geom.faces = geom.faces.concat(instance.faces);

          geom.faceVertexUvs[0] = geom.faceVertexUvs[0].concat(
            this.tg_textureThemes_uvs[theme][geoTemplate_i][0]
          );
          this.materials_index = this.materials_index.concat(
            this.tg_textureThemes_materials_index[theme][geoTemplate_i]
          );
          let l = this.poly_index.length;
          let _tg_poly_index = this.tg_poly_index[geoTemplate_i].map(function(
            val
          ) {
            return val + l;
          });
          this.poly_index = this.poly_index.concat(_tg_poly_index);
        }
      }

      this._uvs = geom.faceVertexUvs;

      //needed for shadow
      geom.computeFaceNormals();
      this.poly_index.push(geom.faces.length);

      this.obj_poly_index[cityObj] = this.poly_index;
      this.poly_index = [];
      //add geom to the list
      var _id = cityObj;
      this.geoms[_id] = geom;

      return "";
    },
    async parseShell(
      geom,
      boundaries,
      vertices,
      json,
      shellTexture,
      isTemplateGeom = false
    ) {
      // Contains the boundary but with the right verticeId
      var i; //
      var j;
      for (i = 0; i < boundaries.length; i++) {
        this.poly_index.push(geom.faces.length);
        var boundary = [];
        var holes = [];
        var uvs = [];

        for (j = 0; j < boundaries[i].length; j++) {
          if (shellTexture != null) {
            if (j < shellTexture[i].length) {
              var ringTexture = shellTexture[i][j]; // img_source for the outer ring
            }

            if (ringTexture[0] != null) {
              this.materials_index.push(ringTexture[0]);
            }
            //assue if the outring has no url, dont consider inner rings
            else {
              this.materials_index.push(json.appearance["textures"].length);
            }
          } else {
            ringTexture = [null];
          }

          if (boundary.length > 0) {
            holes.push(boundary.length);
          }
          var new_boundary = this.extractLocalIndices(
            geom,
            boundaries[i][j],
            vertices,
            json,
            ringTexture,
            uvs,
            isTemplateGeom
          );
          boundary.push(...new_boundary);
        }

        //create list of points
        var pList = [];
        var vertices_coordinates;

        if (isTemplateGeom) {
          vertices_coordinates =
            json["geometry-templates"]["vertices-templates"];
        } else {
          vertices_coordinates = json.vertices;
        }
        for (var k = 0; k < boundary.length; k++) {
          pList.push({
            x: vertices_coordinates[vertices[boundary[k]]][0],
            y: vertices_coordinates[vertices[boundary[k]]][1],
            z: vertices_coordinates[vertices[boundary[k]]][2]
          });
        }

        //get normal of these points
        var normal = await this.get_normal_newell(pList);

        //convert to 2d (for triangulation)
        var pv = [];
        for (k = 0; k < pList.length; k++) {
          var re = await this.to_2d(pList[k], normal);
          pv.push(re.x);
          pv.push(re.y);
        }

        //triangulate
        var tr = await earcut(pv, holes, 2);
        if (tr.length == 0) {
          this.materials_index.pop();
          this.poly_index.pop();

          continue;
        }

        //create faces based on triangulation
        for (k = 0; k < tr.length; k += 3) {
          geom.faces.push(
            new THREE.Face3(
              boundary[tr[k]],
              boundary[tr[k + 1]],
              boundary[tr[k + 2]]
            )
          );
          if (ringTexture[0] && this.material_type == "Textures") {
            geom.faceVertexUvs[0].push([
              uvs[tr[k]],
              uvs[tr[k + 1]],
              uvs[tr[k + 2]]
            ]);
          } else {
            geom.faceVertexUvs[0].push([
              new THREE.Vector2(0, 1),
              new THREE.Vector2(1, 1),
              new THREE.Vector2(1, 0)
            ]);
          }
        }
      }
    },
    extractLocalIndices(
      geom,
      boundary,
      indices,
      json,
      ringTexture,
      uvs,
      isTemplateGeom = false
    ) {
      var new_boundary = [];

      var j;
      for (j = 0; j < boundary.length; j++) {
        //the original index from the json file
        var index = boundary[j];

        //if this index is already there
        if (indices.includes(index)) {
          var vertPos = indices.indexOf(index);
          new_boundary.push(vertPos);
        } else {
          // Add vertex to geometry
          var vertices_coordinates;
          if (isTemplateGeom) {
            vertices_coordinates =
              json["geometry-templates"]["vertices-templates"];
          } else {
            vertices_coordinates = json.vertices;
          }
          // Add vertex to geometry
          var point = new THREE.Vector3(
            vertices_coordinates[index][0],
            vertices_coordinates[index][1],
            vertices_coordinates[index][2]
          );
          geom.vertices.push(point);

          new_boundary.push(indices.length);
          indices.push(index);
        }
        if (ringTexture[0]) {
          var uv = json.appearance["vertices-texture"][ringTexture[j + 1]];

          uvs.push(new THREE.Vector2(uv[0], uv[1]));
        }
      }

      return new_boundary;
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