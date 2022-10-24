<template>
    <div id="container">
    </div>
</template>

<script>
import * as THREE from 'three';
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import * as GEOLIB from "geolib";

import DBSANS from './../../public/DB Sans Bold/DB Sans Bold.ttf';

export default {

    name: 'EuropeMap',

    data() {

        return {
            camera: null,
            scene: new THREE.Scene(),
            renderer: null,
            mesh: null,
            controls: null,
            iR: null,
            text: null,

            material_building: new THREE.MeshNormalMaterial(),
            HEIGHT: 1,

            center: [10, 51],
            SCALE: 1000000,

            k: 0,

            COUNTRIES: [
                "Germany",
                "France", 
                "Denmark",                
                "Netherlands", 
                "Luxembourg",                 
                "Switzerland",                 
                "Poland", 
                "Italy",
                "Liechtenstein",
                "Czech Republic", 
                "Austria", 
                "Belgium", 
                "Sweden",
                "Finland",
                "Norway",
                "Hungary",
                "Slovakia",
            ],

            COUNTRIES_MESH: [],
            COUNTRIES_TEXT: [],
            COUNTRIES_TEXT_ROT: [],
            COUNTRIES_TEXT_POS: [],
            COUNTRIES_TEXT_HEIGHT: 0.09,
            COUNTRIES_POINT:[],

            GEO_POINT: new THREE.BoxGeometry(0.005, 0.005, 0.005),

            MAT_BASIC_BLACK: new THREE.MeshBasicMaterial({color: 0x000000}),

            COL_OCEAN: new THREE.Color(0xabd8ea),
            COL_TARGET : new THREE.Color(0xF8F8FF), // white
            COL_REST: new THREE.Color(0xCCFF0CC), // green
            COL_EDGES: new THREE.Color(0x97B49C), // dark green
            COL_FONT: new THREE.Color(0x484848), // gray
            COL_FONT2: new THREE.Color(0xff0000), // red

            COLORMAPS: [
                new THREE.Color(0xFFADAD), 
                new THREE.Color(0xFFD6A5), //orange
                new THREE.Color(0xFDFFB6), // yellow
                new THREE.Color(0xCAFFBF), // green
                new THREE.Color(0x9BF6FF), // aqua
                new THREE.Color(0xA0C4FF), // pastell-blue
                new THREE.Color(0xBDB2FF), // violet
                new THREE.Color(0xFFC6FF), // pastell-pink
                new THREE.Color(0xFF00FC), // neon pink
                new THREE.Color(0xff5d8f), // pastell pink 2
                new THREE.Color(0xffeedd), // pastell-orange
                new THREE.Color(0xff686b), // green 2 
         ],

        }

    },

    methods: {

        init: function () {

            let that = this;

            window.addEventListener('resize', onWindowResize, false);

            function onWindowResize() {
                that.camera.aspect = window.innerWidth / window.innerHeight;
                that.camera.updateProjectionMatrix();
                that.renderer.setSize(window.innerWidth, window.innerHeight);
            }

            let container = document.getElementById('container');

            // this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 100);
            // this.camera.position.set(8, 4, 0);

            // initial bird view
            this.camera = new THREE.OrthographicCamera( window.innerWidth  / - 2, window.innerWidth  / 2, window.innerHeight/ 2, window.innerHeight / - 2, 1, 1000 );
            this.camera.zoom = 1800;
            // this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 100);
            this.camera.position.set(0, 4, 0); // XYZ
            this.camera.lookAt(0,0,0);
            this.camera.rotation.y = Math.PI/2 ;
            

            this.scene.background = this.COL_OCEAN;

            let gridHelper = new THREE.GridHelper(60, 150, new THREE.Color(0xff0000), new THREE.Color(0xffffff));
            this.scene.add(gridHelper);


            let light0 = new THREE.AmbientLight(0xfafafa, 0.005);
            let light1 = new THREE.PointLight(0xfafafa, 0.005);
            let light2 = new THREE.PointLight(0xfafafa, 0.005);

            light1.position.set(200, 90, 40);
            light2.position.set(200, 90, 40);

            this.scene.add(light0);
            this.scene.add(light1);
            this.scene.add(light2);

            this.renderer = new THREE.WebGLRenderer({ antialias: true });
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.updateProjectionMatrix();

            container.appendChild(this.renderer.domElement);

            this.controls = new MapControls(this.camera, this.renderer.domElement);
            this.controls.enableDamping = true;
            this.controls.dampingFactor = 0.25;
            this.controls.screenSpacePanning = false;
            this.controls.maxDistance = 80;

            // POINT 
            let geometry = new THREE.BoxGeometry(0.005, 0.005, 0.005);
            let material = new THREE.MeshBasicMaterial({color: 0xff0000});
            let mesh = new THREE.Mesh(geometry, material);
            mesh.position.y = 0.1;
            this.scene.add(mesh);


            // // FONT 
            // let fontloader = new FontLoader();
            // let ttfLoader = new TTFLoader();

            // ttfLoader.load(DBSANS, (json) => {
            //     // First parse the font.
            //     let dbsans = fontloader.parse(json);
            //     // Use parsed font as normal.
            //     let textGeometry = new TextGeometry('hello world', { height: 0.005, size: 0.005, font: dbsans });
            //     let textMaterial = new THREE.MeshBasicMaterial({ color: this.COL_FONT } );
            //     let textMesh = new THREE.Mesh(textGeometry, textMaterial);
            //     textMesh.position.x = 0.0075; // RIGHT-LEFT
            //     textMesh.position.z =  0.002; // Up-DOWN
            //     textMesh.position.y = 0.1; // HEIGHT
            //     textMesh.rotateX(Math.PI/2);
            //     textMesh.rotateZ(Math.PI);  
            //     textMesh.rotateY(Math.PI);   
            //     this.scene.add(textMesh);

            // });
     
            
            
        },

        animate: function () {
            
            requestAnimationFrame(this.animate);
            // this.mesh.rotation.x += 0.01;
            // this.mesh.rotation.y += 0.02;
            this.renderer.render(this.scene, this.camera);
            this.controls.update();
            this.faceTowardsCamera();
        },

        faceTowardsCamera: function(){
            if (this.camera.position.y <= 3.85){

                if (this.camera.position.y <= 1.75){

                    for(let m=0; m < this.COUNTRIES_TEXT.length; m++){
                        this.COUNTRIES_TEXT[m].lookAt(this.camera.position);

                    }
                }
                else{

                    for(let m=0; m < this.COUNTRIES_TEXT.length; m++){
                        this.COUNTRIES_TEXT[m].lookAt(this.camera.position);
                        this.COUNTRIES_TEXT[m].rotation.z = this.camera.rotation.z;
                    }
                }
             
            }
            else{
                for(let m=0; m < this.COUNTRIES_TEXT.length; m++){
                    
                    this.COUNTRIES_TEXT[m].rotation.x = this.COUNTRIES_TEXT_ROT[m][0];
                    this.COUNTRIES_TEXT[m].rotation.y = this.COUNTRIES_TEXT_ROT[m][1];
                    // this.COUNTRIES_TEXT[m].rotation.z = this.COUNTRIES_TEXT_ROT[m][2];
                    this.COUNTRIES_TEXT[m].rotation.z = this.camera.rotation.z;

                   
                }
            }   
        },


        getCityData: function(){

        },

        getMapData: function () {
            fetch("./europe_borders_7MB_6p.geojson").then((response) => {
                response.json().then((data) => {

                    let f = data.features;
                    let ckey = 0;
                    // console.log(f);
                    for (let i = 0; i < f.length; i++) {
                        if (this.COUNTRIES.includes(f[i].properties["NAME"])) {
                            // console.log(f[i].properties["NAME"]);
                            if(f[i].properties["NAME"] == "Austria" || f[i].properties["NAME"] == "Belgium" || f[i].properties["NAME"] == "Switzerland" || f[i].properties["NAME"] == "Czech Republic" || f[i].properties["NAME"] == "Luxembourg" || f[i].properties["NAME"] == "Liechtenstein" || f[i].properties["NAME"] == "Hungary" || f[i].properties["NAME"] == "Slovakia"){
                                this.getPolygons([f[i].geometry.coordinates], ckey, f[i].properties["NAME"]);
                            }
                            else{
                                this.getPolygons(f[i].geometry.coordinates, ckey, f[i].properties["NAME"]);
                            }
                            
                            ckey ++;
                        }
                    }
                })
            })
        },

        setCountryNames: function(){

            fetch("./countries_centroids_mod.geojson").then((response) => {
                response.json().then((data) => {
                    for (let c = 0; c < this.COUNTRIES.length; c++) {
                        for (let i = 0; i < data.features.length; i++) {
                            if(data.features[i].properties["COUNTRY"] == this.COUNTRIES[c]){
                                // console.log(this.COUNTRIES[c]);
                                let coordinates = this.getGPSRelativePosition(data.features[i].geometry["coordinates"], this.center);
                                let mesh = new THREE.Mesh(this.GEO_POINT, this.MAT_BASIC_BLACK);
                                mesh.position.y = 0.1;
                                mesh.position.z = -coordinates[0];
                                mesh.position.x = -coordinates[1];
                                // this.scene.add(mesh); 
                                let fontloader = new FontLoader();
                                let ttfLoader = new TTFLoader();
                                ttfLoader.load(DBSANS, (json) => {
                                    // First parse the font.
                                    let dbsans = fontloader.parse(json);
                                    // Use parsed font as normal.
                                    let textGeometry = new TextGeometry(this.COUNTRIES[c], { height: 0.0001, size: 0.0048, font: dbsans });
                                    let textMaterial = new THREE.MeshBasicMaterial({ color: this.COL_FONT } );
                                    let textMesh = new THREE.Mesh(textGeometry, textMaterial);
                                    textMesh.position.x = -coordinates[1];
                                    textMesh.position.z = -coordinates[0];
                                    textMesh.position.y = this.COUNTRIES_TEXT_HEIGHT; // HEIGHT
                                    textMesh.rotateX(Math.PI/2);
                                    textMesh.rotateZ(Math.PI);  
                                    textMesh.rotateY(Math.PI);
                                    this.COUNTRIES_TEXT_POS.push([textMesh.position.x, textMesh.position.y, textMesh.position.z]);
                                    this.COUNTRIES_TEXT_ROT.push([textMesh.rotation.x, textMesh.rotation.y, textMesh.rotation.z]);    
                                    this.scene.add(textMesh);
                                    
                                    this.COUNTRIES_POINT.push(mesh);                
                                    this.COUNTRIES_TEXT.push(textMesh);

                                });

                            }
                        }
                    }



                })
            })



        },

        getPolygons: function (patches, key, country) {

            // console.log("Patches", key, patches);

            let material = new THREE.MeshBasicMaterial();
          
            // material.color.set(this.COLORMAPS[key]);
            if (country == "Germany"){
                material.color.set(this.COL_TARGET);
            }
            else{
                material.color.set(this.COL_REST);
            }

            for (let i = 0; i < patches.length; i++) {

                let shape = this.genShape(patches[i], this.center);
                let geometry = this.genGeometry(shape, { curveSegments: 1, depth: 0.02* this.HEIGHT, bevelEnabled: false });
                geometry.rotateX(Math.PI / 2);
                geometry.rotateZ(Math.PI);     
                geometry.rotateY(-Math.PI / 2);  
                let mesh = new THREE.Mesh(geometry, material);
                this.scene.add(mesh);
                let edges = new THREE.EdgesGeometry( geometry );
                let line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: this.COL_EDGES } ) );
                this.scene.add( line );

            }
        },

        genShape: function (points, center) {

            let shape = new THREE.Shape();

            for (let i = 0; i < points.length; i++) {

                let p = points[i];

                for (let j = 0; j < p.length; j++) {

                    let elp = this.getGPSRelativePosition(p[j], center);
                       if (j == 0) {
                        shape.moveTo(elp[0], elp[1]);
                    }
                    else {
                        shape.lineTo(elp[0], elp[1]);
                    }
                }
            }
            return shape;
        },

        genGeometry: function (shape, config) {
            let geometry = new THREE.ExtrudeGeometry(shape, config);
            geometry.computeBoundingBox();
            return geometry;
        },

        // alogorithm for normalizing geojson point coordinates while considering map projection distortion
        getGPSRelativePosition: function (objPos, centerPos) {

            // get gps distance 
            let dis = GEOLIB.getDistance(objPos, centerPos);

            // get bearing angle
            let bearing = GEOLIB.getRhumbLineBearing(objPos, centerPos);

            // calculate X by centerpos.x + distance * cos(rad)
            // calculate Y by centerpos.y + distance * sind(rad)
            let x = centerPos[0] + (dis * Math.cos(bearing * Math.PI / 180));
            let y = centerPos[1] + (dis * Math.sin(bearing * Math.PI / 180));

            x /= this.SCALE;
            y /= this.SCALE;

            return [-x, y]
        }
    },

    mounted() {

        this.init();
        this.animate();
        this.setCountryNames();
        this.getMapData();
        

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
    background-color: red;
}
</style>