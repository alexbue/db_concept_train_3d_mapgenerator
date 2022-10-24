<template>
    <div id="container">
    </div>
</template>

<script>
import * as THREE from 'three'
import { MapControls } from "three/examples/jsm/controls/OrbitControls"
import * as GEOLIB from "geolib"
//import geodata from "./../assets/geo_test.geojson"

export default {

  name: 'TrainMap',

  data() {

    return {
      camera: null,
      scene: new THREE.Scene(),
      renderer: null,
      mesh: null,
      controls: null,
      iR: null,

      material_building: new THREE.MeshPhongMaterial(),

      center: [12.5006847, 41.8877406],
      
    }

  },

  methods: {

    init: function() {

      let that = this;

      window.addEventListener( 'resize', onWindowResize, false );

        function onWindowResize(){
            that.camera.aspect = window.innerWidth / window.innerHeight;
            that.camera.updateProjectionMatrix();
            that.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        let container = document.getElementById('container');

        this.camera = new THREE.PerspectiveCamera(25,  window.innerWidth / window.innerHeight, 1, 100);
        this.camera.position.set(8, 4 , 0);

        this.scene.background = new THREE.Color(0x2a2a2a);

        let gridHelper = new THREE.GridHelper(60, 150,  new THREE.Color(0x555555), new THREE.Color(0x333333));
          this.scene.add(gridHelper);

          
        let light0 = new THREE.AmbientLight(0xfafafa, 0.25);
        let light1 = new THREE.PointLight(0xfafafa, 0.4);         
        let light2 = new THREE.PointLight(0xfafafa, 0.4);

        light1.position.set(200,90, 40);
        light2.position.set(200, 90, 40);

        this.scene.add(light0);
        this.scene.add(light1);
        this.scene.add(light2);

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);        
        this.camera.updateProjectionMatrix();

        container.appendChild(this.renderer.domElement);

        this.controls = new MapControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.25;
            this.controls.screenSpacePanning = false;
            this.controls.maxDistance = 80;


    },

    animate: function() {

        requestAnimationFrame(this.animate);
        // this.mesh.rotation.x += 0.01;
        // this.mesh.rotation.y += 0.02;
        this.renderer.render(this.scene, this.camera);
        this.controls.update();

    },

    getData: function(){
      fetch("./geo_test.geojson").then((response) => {
        response.json().then((data) => {
          console.log(data);
          this.loadBuildings(data);
        })
      })
    },

    loadBuildings: function(data){

      let features = data.features;

      for( let key = 0; key < features.length; key ++){

        let f = features[key];
        if (!f["properties"]) return;
        if (f.properties["building"]) {
          //this.addBuilding(f.geometry.coordinates, f.properties, f.properties["building:levels"]);
          this.addBuilding(f.geometry.coordinates, f.properties, 2);
          console.log("Found Building!");
          console.log(f);
        }
      }
    },

    addBuilding: function(data, info, height){

      height = height ? height : 1;

       for(let i=0; i < data.length; i++){
        let el = data[i];
        console.log(el)
        let shape = this.genShape(el, this.center);
        let geometry = this.genGeometry(shape, {curveSegments: 1, depth: 0.05 * height, bevelEnabled: false});
        geometry.rotateX(Math.PI / 2);
        geometry.rotateZ(Math.PI);
        let mesh = new THREE.Mesh(geometry, this.material_building);
        this.scene.add(mesh);
       }
    },

    genShape: function(points, center){
      let shape = new THREE.Shape();
      for(let i = 0; i < points.length; i++){
        let elp = points[i];
        elp = this.getGPSRelativePosition(elp, center);
        console.log(elp)
        if( i == 0){
          shape.moveTo(elp[0], elp[1]);
        }
        else{
          shape.lineTo(elp[0], elp[1]);
        }
      }
      return shape;
    },

    genGeometry: function(shape, config){
      let geometry = new THREE.ExtrudeGeometry(shape, config);
      geometry.computeBoundingBox();
      return geometry;
    },

    // alogorithm for normalizing geojson point coordinates while considering map projection distortion
    getGPSRelativePosition: function(objPos, centerPos){

      // get gps distance 
      let dis = GEOLIB.getDistance(objPos, centerPos);

      // get bearing angle
      let bearing = GEOLIB.getRhumbLineBearing(objPos, centerPos);

      // calculate X by centerpos.x + distance * cos(rad)
      // calculate Y by centerpos.y + distance * sind(rad)
      let x = centerPos[0] + (dis * Math.cos(bearing * Math.PI / 180));
      let y = centerPos[1] + (dis * Math.sin(bearing * Math.PI / 180));

      return [-x/100, y/100]
    }
  },

  mounted() {

      this.init();
      this.animate();
      this.getData();

  }
}
</script>

<style scoped>
#container {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color:red;
  margin: 0px;
}
</style>