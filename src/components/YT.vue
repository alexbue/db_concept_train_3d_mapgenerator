<template>
    <div id="container">
        TRAINMAP - 2 - YT 
    </div>
 </template>
    

<script>

import * as THREE from 'three'
import { MapControls } from "three/examples/jsm/controls/OrbitControls"

export default{

    name: 'TrainMapYT',  

    data(){

        return{

            // THREEJS variables
            scene: null,
            camera: null,
            renderer: null, 
            controls:null,

            iR:  null,

        }
    },

    mounted(){

        let that = this;

        this.init();

        // user resizes browser window 
        window.addEventListener( 'resize', onWindowResize, false );

        function onWindowResize(){
            that.camera.aspect = window.innerWidth / window.innerHeight;
            that.camera.updateProjectionMatrix();
            that.renderer.setSize(window.innerWidth, window.innerHeight);
        }

        this.animate();

    },

    methods: {

        init: function(){

            let cont = document.getElementById("container");

            // Init Scene

            this.scene = new THREE.Scene();
            this.scene.background = new THREE.Color(0x222222);

            // Init camera
            this.camera = new THREE.PerspectiveCamera(25, window.clientWidth/window.clientHeight, 1, 100);
            this.camera.position.set(8, 4 , 0);

            // Init group 
            this.iR = new THREE.Group();
            this.iR = "Interactive Root";
            this.scene.add(this.iR);

            // Init lights 

            let light0 = new THREE.AmbientLight(0xfafafa, 0.25);
            let light1 = new THREE.PointLight(0xfafafa, 0.4);         
            let light2 = new THREE.PointLight(0xfafafa, 0.4);

            light1.position.set(200,90, 40);
            light2.position.set(200, 90, 40);

            this.scene.add(light0);
            this.scene.add(light1);
            this.scene.add(light2);

            let gridHelper = new THREE.GridHelper(60, 150,  new THREE.Color(0x555555), new THREE.Color(0x333333));
            this.scene.add(gridHelper);

            let geometry = new THREE.BoxGeometry(1,1,1);
            let material = new THREE.MeshPhongMaterial({color: 0x00ff00});
            let mesh = new THREE.Mesh(geometry, material);
            this.scene.add(mesh);

            // Init renderer
            this.renderer = new THREE.WebGLRenderer({antialias: true});
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(cont.innerWidth, cont.innerHeight);

            cont.appendChild(this.renderer.domElement);

            this.controls = new MapControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.25;
            this.controls.screenSpacePanning = false;
            this.controls.maxDistance = 80;



        },

        animate: function(){

            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
            this.controls.update();

        }

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
  background-color:rgb(95, 59, 161);
  width: auto;
  height: 900px;
}
</style>

