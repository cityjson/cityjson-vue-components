<template>
  <div
    id="viewer"
    class="col-12 px-0 h-100"
  />
</template>

<script>
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { CityJSONLoader, CityJSONWorkerParser } from 'cityjson-threejs-loader';
import { sRGBEncoding } from 'three';

export default {
	name: 'ThreeJsViewer',
	props: {
		citymodel: {
			type: Object,
			default: function () {

				return {};

			}
		},
		selectedObjid: {
			type: String,
			default: null
		},
		objectColors: {
			type: Object,
			default: function () {

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
				};

			}
		},
		backgroundColor: {
			type: Number,
			default: 0xd9eefc
		},
		showSemantics: {
			type: Boolean,
			default: true
		},
		activeLoD: {
			type: Number,
			default: - 1
		}
	},
	data() {

		return {
			camera_init: true
		};

	},
	watch: {
		backgroundColor: function ( newVal ) {

			this.renderer.setClearColor( newVal );

			this.renderer.render( this.scene, this.camera );

		},
		objectColors: {
			handler: function ( newVal ) {

				const scope = this;

				this.scene.traverse( mesh => {

					mesh.material.color.setHex( newVal[ scope.citymodel.CityObjects[ mesh.name ].type ] );

				} );

				this.renderer.render( this.scene, this.camera );

			},
			deep: true
		},
		citymodel: {
			handler: function ( newVal ) {

				this.$emit( 'rendering', true );

				this.clearScene();

				const parser = new CityJSONWorkerParser();
				parser.chunkSize = 2000;

				const scope = this;
				parser.onChunkLoad = () => {

					scope.renderer.render( scope.scene, scope.camera );

				};

				const loader = new CityJSONLoader( parser );
				loader.load( this.citymodel );

				this.scene.add( loader.scene );

				this.$emit( 'rendering', false );

			},
			deep: true
		},
		selectedObjid: function ( newId ) {

			const idx = Object.keys( this.citymodel.CityObjects ).indexOf( newId );

			this.scene.traverse( c => {

				if ( c.material ) {

					c.material.uniforms.selectSurface.value = false;
					c.material.uniforms.highlightedObjId.value = idx;

				}

			} );

			this.renderer.render( this.scene, this.camera );

		},
		showSemantics: function ( value ) {

			this.scene.traverse( c => {

				if ( c.material ) {

					c.material.uniforms.showSemantics.value = value;

				}

			} );

			this.renderer.render( this.scene, this.camera );

		},
		activeLoD: function ( lodIdx ) {

			this.scene.traverse( c => {

				if ( c.material ) {

					c.material.uniforms.showLod.value = lodIdx;

				}

			} );

			this.renderer.render( this.scene, this.camera );

		}
	},
	beforeCreate() {

		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.controls = null;
		this.raycaster = null;
		this.mouse = null;

	},
	mounted() {

		this.$emit( 'rendering', true );

		this.initScene();

		if ( Object.keys( this.citymodel ).length > 0 ) {

			const parser = new CityJSONWorkerParser();
			parser.chunkSize = 2000;

			const scope = this;
			parser.onChunkLoad = () => {

				scope.renderer.render( scope.scene, scope.camera );

			};

			const loader = new CityJSONLoader( parser );
			loader.load( this.citymodel );

			this.scene.add( loader.scene );

		}

		this.renderer.render( this.scene, this.camera );

		let self = this;

		this.renderer.domElement.addEventListener( 'dblclick', ev => {

			if ( ev.button == 0 ) { //leftClick

				self.handleClick();

			}

		} );

		this.$emit( 'rendering', false );

	},
	methods: {
		handleClick() {

			var rect = this.renderer.domElement.getBoundingClientRect();
			this.mouse.x = ( ( event.clientX - rect.left ) / this.renderer.domElement.clientWidth ) * 2 - 1;
			this.mouse.y = - ( ( event.clientY - rect.top ) / this.renderer.domElement.clientHeight ) * 2 + 1;

			//get cameraposition
			this.raycaster.setFromCamera( this.mouse, this.camera );

			//calculate intersects
			var intersects = this.raycaster.intersectObject( this.scene, true );

			//if clicked on nothing return
			if ( intersects.length == 0 ) {

				this.$emit( 'object_clicked', null );
				return;

			}

			//get the id of the first object that intersects (equals the clicked object)
			const { face, object } = intersects[ 0 ];

			const objIds = object.geometry.getAttribute( 'objectid' );

			if ( objIds ) {

				const idx = objIds.getX( face.a );
				const objectId = Object.keys( this.citymodel.CityObjects )[ idx ];
				this.$emit( 'object_clicked', objectId );

			}

		},
		initScene() {

			const viewer = document.getElementById( "viewer" );
			const ratio = viewer.clientWidth / viewer.clientHeight;

			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera( 60, ratio, 0.0001, 4000 );
			this.camera.position.set( 0, - 2, 2 );
			this.camera.up.set( 0, 0, 1 );

			this.renderer = new THREE.WebGLRenderer( {
				antialias: true
			} );
			this.renderer.outputEncoding = sRGBEncoding;
			viewer.appendChild( this.renderer.domElement );
			this.renderer.setSize( viewer.clientWidth, viewer.clientHeight );
			this.renderer.setClearColor( this.backgroundColor );
			this.renderer.shadowMap.enabled = true;
			this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

			let self = this;

			// add raycaster and mouse (for clickable objects)
			this.raycaster = new THREE.Raycaster();
			this.mouse = new THREE.Vector2();

			//add AmbientLight (light that is only there that there's a minimum of light and you can see color)
			//kind of the natural daylight
			var am_light = new THREE.AmbientLight( 0xFFFFFF, 0.7 ); // soft white light
			this.scene.add( am_light );

			// Add directional light
			var spot_light = new THREE.SpotLight( 0xDDDDDD );
			spot_light.position.set( 84616, - 1, 447422 );
			spot_light.target = this.scene;
			spot_light.castShadow = true;
			spot_light.intensity = 0.4;
			spot_light.position.normalize();
			this.scene.add( spot_light );

			//render & orbit controls
			this.controls = new OrbitControls( this.camera, this.renderer.domElement );
			this.controls.addEventListener( 'change', function () {

				self.renderer.render( self.scene, self.camera );

			} );
			this.controls.target.set( 0, 0, 0 );

		},
		clearScene() {

			while ( this.scene.children.length > 0 ) {

				this.scene.remove( this.scene.children[ 0 ] );

			}

			var am_light = new THREE.AmbientLight( 0xFFFFFF, 0.7 ); // soft white light
			this.scene.add( am_light );

			// Add directional light
			var spot_light = new THREE.SpotLight( 0xDDDDDD );
			spot_light.position.set( 84616, - 1, 447422 );
			spot_light.target = this.scene;
			spot_light.castShadow = true;
			spot_light.intensity = 0.4;
			spot_light.position.normalize();
			this.scene.add( spot_light );

		}
	}
};
</script>
