<template>
  <div id="viewer" class="col-12 px-0 h-100"></div>
</template>

<script>
import $ from 'jquery'
import * as THREE from 'three'
import OrbitControls from 'three-orbitcontrols'
import earcut from 'earcut'

export default {
  name: 'ThreeJsViewer',
  props: {
    citymodel: Object,
    selected_objid: String,
    objectColors: {
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
    this.meshVertices = {};
    this.meshTriangles = {};
    this.meshTriangleIDs = {};
    this.spotLight = null;
    this.ambLight = null;
  },
  async mounted() {
    this.$emit('rendering', true);

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

      this.$emit('rendering', false);
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
        this.$emit('rendering', true);

        setTimeout(async () => {
          this.clearScene();

          if (Object.keys(newVal).length > 0)
          {
            await this.loadCityObjects(newVal);
          }

          this.renderer.render(this.scene, this.camera);
    
          this.$emit('rendering', false);
        }, 25);
      },
      deep: true
    },
    selected_objid: function(newId, oldId) {
      if (oldId != null && oldId in this.citymodel.CityObjects)
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
      console.log( this.camera );

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
        this.$emit('object_clicked', null);
        return
      }

      //get the id of the first object that intersects (equals the clicked object)
      var cityObjId = intersects[0].object.name;
      this.$emit('object_clicked', cityObjId);
    },
    initScene() {
      this.scene = new THREE.Scene();
      var ratio = $("#viewer").width() / $("#viewer").height();
      this.camera = new THREE.PerspectiveCamera( 60, ratio, 0.001, 1000 );
      
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

			this.ambLight = new THREE.AmbientLight( 0xFFFFFF, 0.7 );
			this.ambLight.name = "ambLight";
			this.spotLight = new THREE.SpotLight( 0xDDDDDD, 0.4 );
			this.spotLight.name = "spotLight";
			this.spotLight.target = this.scene;
			this.spotLight.castShadow = true;
      this.scene.add( this.spotLight, this.ambLight );
      
      //render & orbit controls
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.addEventListener('change', function() {
        self.renderer.render(self.scene, self.camera);
      });
    },
    clearScene() {

			for ( var i = this.scene.children.length - 1; i >= 0; i -- ) {

				if ( this.scene.children[ i ].name != "ambLight" && this.scene.children[ i ].name != "spotLight" ) {

          this.scene.remove( this.scene.children[ i ] );
          
        }
        
			}

    },
    //convert CityObjects to mesh and add them to the viewer
    async loadCityObjects(data) {

      if (typeof data === "object") {

          for (const coType in this.objectColors) {

              this.meshVertices[ coType ] = [];
              this.meshTriangles[ coType ] = [];
              this.meshTriangleIDs[ coType ] = [];

          }

          for (const objectId in data.CityObjects) {

              this.parseObject(objectId, data);

          }

          const group = new THREE.Group();

          console.log( this.meshTriangleIDs );

          for (const coType in this.objectColors) {

              if (this.meshVertices[coType].length == 0) {

                  continue;

              }

              const geom = new THREE.BufferGeometry();

              geom.setIndex(this.meshTriangles[coType]);
              geom.setAttribute('position', new THREE.Float32BufferAttribute(this.meshVertices[coType].length * 3, 3));

              let positions = geom.attributes.position.array;

              for ( const [ i, vertexIndex ] of this.meshVertices[coType].entries() ) {

                  const vertex = data.vertices[ vertexIndex ];

                  positions[i * 3] = vertex[ 0 ];
                  positions[i * 3 + 1] = vertex[ 1 ];
                  positions[i * 3 + 2] = vertex[ 2 ];

              }

              geom.attributes.position.needsUpdate = true;
              geom.computeVertexNormals();

              const material = new THREE.MeshLambertMaterial();
              material.color.setHex(this.objectColors[coType]);

              const mesh = new THREE.Mesh(geom, material);
              mesh.name = coType;
              mesh.castShadow = true;
              mesh.receiveShadow = true;

              mesh.triangleIDs = this.meshTriangleIDs[ coType ];

              group.add( mesh );

          }

        this.scene.add( group );

        console.log( group );

        const bbox = this.getBbox( data );
        const midX = bbox[ 0 ] + ( ( bbox[ 3 ] - bbox[ 0 ] ) / 2 );
        const midY = bbox[ 1 ] + ( ( bbox[ 4 ] - bbox[ 1 ] ) / 2 );
        const maxZ = bbox[ 5 ];
        // const minZ = bbox[ 2 ];

        this.camera.position.set( midX, midY, maxZ * 10 );
        this.camera.lookAt( midX, midY, 0 );
        this.camera.far = maxZ * 1000;
        this.camera.near = maxZ;
        this.camera.updateProjectionMatrix();
        this.controls.target.set( midX, midY, 0 );
        this.spotLight.position.set( midX, midY, maxZ * 1000 );
        this.spotLight.target = group;

      }

    },

    parseObject(objectId, json) {

        const cityObject = json.CityObjects[objectId];

        if (!(cityObject.geometry &&
                cityObject.geometry.length > 0)) {

            return;

        }

        const coType = cityObject.type;
        let vertices = this.meshVertices[ coType ];
        let triangles = this.meshTriangles[ coType ];
        let ids = this.meshTriangleIDs[ coType ];

        for (let geom_i = 0; geom_i < cityObject.geometry.length; geom_i++) {

            const geomType = cityObject.geometry[geom_i].type;

            if (geomType == "Solid") {

                const shells = cityObject.geometry[geom_i].boundaries;

                for (let i = 0; i < shells.length; i++) {

                    this.parseShell(shells[i], vertices, triangles, ids, objectId, json);

                }

            } else if (geomType == "MultiSurface" || geomType == "CompositeSurface") {

                const surfaces = cityObject.geometry[geom_i].boundaries;

                this.parseShell(surfaces, vertices, triangles, ids, objectId, json);

            } else if (geomType == "MultiSolid" || geomType == "CompositeSolid") {

                const solids = cityObject.geometry[geom_i].boundaries;

                for (let i = 0; i < solids.length; i++) {

                    for (let j = 0; j < solids[i].length; j++) {

                        this.parseShell(solids[i][j], vertices, triangles, ids, objectId, json);

                    }

                }

            }

        }

    },
	parseShell( boundaries, vertices, triangles, ids, id, json ) {

		// Contains the boundary but with the right verticeId
		for ( let i = 0; i < boundaries.length; i ++ ) {

			let boundary = [];
			let holes = [];

			for ( let j = 0; j < boundaries[ i ].length; j ++ ) {

				if ( boundary.length > 0 ) {

					holes.push( boundary.length );

				}

				// const new_boundary = this.extractLocalIndices( geom, boundaries[ i ][ j ], vertices, json );
				// boundary.push( ...new_boundary );
				boundary.push( ...boundaries[ i ][ j ] );

			}

			if ( boundary.length == 3 ) {

				for ( let n = 0; n < 3; n ++ ) {

					const index = vertices.indexOf( boundary[ n ] );

					if ( index == - 1 ) {

						triangles.push( vertices.length );
            vertices.push( boundary[ n ] );

					} else {

						triangles.push( index );

          }
          
          ids.push( id );

				}


			} else if ( boundary.length > 3 ) {

				//create list of points
				let pList = [];
				for ( let k = 0; k < boundary.length; k ++ ) {

					pList.push( {
						x: json.vertices[ boundary[ k ] ][ 0 ],
						y: json.vertices[ boundary[ k ] ][ 1 ],
						z: json.vertices[ boundary[ k ] ][ 2 ]
					} );

				}

				//get normal of these points
				const normal = this.get_normal_newell( pList );

				//convert to 2d (for triangulation)
				let pv = [];
				for ( let k = 0; k < pList.length; k ++ ) {

					const re = this.to_2d( pList[ k ], normal );
					pv.push( re.x );
					pv.push( re.y );

				}

				//triangulate
				const tr = earcut( pv, holes, 2 );

				// create faces based on triangulation
				for ( let k = 0; k < tr.length; k += 3 ) {

					for ( let n = 0; n < 3; n ++ ) {

						const vertex = boundary[ tr[ k + n ] ];
						const index = vertices.indexOf( vertex );

						if ( index == - 1 ) {

							triangles.push( vertices.length );
							vertices.push( vertex );

						} else {

							triangles.push( index );

						}

					}

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
    getBbox( data ) {

      var bbox;

      if ( data[ "metadata" ] != undefined && data[ "metadata" ][ "geographicalExtent" ] != undefined ) {


        bbox = data[ "metadata" ][ "geographicalExtent" ];

        if ( data[ "transform" ] != undefined ) {

          const transform = data[ "transform" ];

          for (let i = 0; i < 3; i ++ ) {

            bbox[ i ] = bbox[ i ] - transform[ "translate" ][ i ];
            bbox[ i + 3 ] = ( bbox[ i + 3 ] - transform[ "translate" ][ i ] ) / transform[ "scale" ][ i ];

          }

        }
        

      } else {
      
        const vertices = data.vertices;

        bbox = [ Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE, Number.MIN_VALUE, Number.MIN_VALUE, Number.MIN_VALUE ];

        for ( const v of vertices ) {

          const x = v[ 0 ];
          const y = v[ 1 ];
          const z = v[ 2 ];

          if ( x < bbox[ 0 ] ) {

            bbox[ 0 ] = x;

          } else if ( x > bbox[ 3 ] ) {

            bbox[ 3 ] = x;

          }

          if ( y < bbox[ 1 ] ) {

            bbox[ 1 ] = y;

          } else if ( y > bbox[ 4 ] ) {

            bbox[ 4 ] = y;

          }

          if ( z < bbox[ 2 ] ) {

            bbox[ 2 ] = z;

          } else if ( z > bbox[ 5 ] ) {

            bbox[ 5 ] = z;

          }

        }

      }

      return bbox;
      
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