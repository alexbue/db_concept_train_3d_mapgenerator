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

            FONTLOADER: null,
            TTFLOADER: null,

            OBJ_HEIGHT_DEFAULT: 0.025,

            COUNTRIES_MESH: [],
            COUNTRIES_TEXT: [],
            COUNTRIES_TEXT_ROT: [],
            COUNTRIES_TEXT_POS: [],

            ADAPTIVE_TEXT_HEIGHT_MIN: 0.025,
            ADAPTIVE_TEXT_HEIGHT_MAX: 0.05,
            COUNTRIES_POINT:[],

            CITIES_TEXT: [],
            CITIES_TEXT_ROT: [],
            CITIES_TEXT_POS: [],            

            GEO_POINT: new THREE.BoxGeometry(0.005, 0.005, 0.005),
            GEO_POINT_LINE: new THREE.SphereGeometry(0.002,8, 4),
            GEO_SPHERE: new THREE.SphereGeometry(0.005,16,8),
            GEO_STATION: new THREE.BoxGeometry(0.01, 0.01, 0.02),

            GEO_POINTS: [],

            // FLAGS: 
            DATA_LOADED: false, 

            // MAPGENERATOR CONTROLS: 
            CON_INOUT_DISTANCE: 0.03,

            // THREEJS-OBJECT REFERENCES

            GRIDHELPER: null,  
            
            TRAINLINES_ORIGINAL: [],
            TRAINLINES_MODIFIED: [],

            MAT_BASIC_BLACK: new THREE.MeshBasicMaterial({color: 0x000000}),
            MAT_BASIC_RED: new THREE.MeshBasicMaterial({color: 0xff0000}),
            MAT_BASIC_WHITE: new THREE.MeshBasicMaterial({color: 0xFAF8F6}),

            MAT_NAME_OPAQUE: new THREE.MeshBasicMaterial({color: 0x484848, transparent: true, opacity: 1}),

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

            TRAIN_STATIONS: [
                "München Hbf",
                "Frankfurt (Main) Hbf",
                "Nürnberg",
                "Leipzig",
                "Stuttgart",
            ],

            CITIES: [
                "München",
                "Frankfurt",
                "Nürnberg",
                "Leipzig",
                "Stuttgart",
            ],

            TRAINLINES: [
                ["München", "Stuttgart", "Leipzig"],
                ["München", "Leipzig"],
                ["München", "Stuttgart", "Frankfurt", "Leipzig"],
                ["München", "Stuttgart", "Frankfurt", "Leipzig"],
                ["München", "Nürnberg", "Frankfurt"],
                ["München", "Stuttgart", "Frankfurt"],
            ],

        }

    },

    mounted() {

    this.init();
    this.animate();   
    this.getMapData();
    this.getDataTrainstations();
    this.addCountryNames();

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

            this.FONTLOADER = new FontLoader();
            this.TTFLOADER = new TTFLoader();

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

            this.GRIDHELPER = new THREE.GridHelper(60, 150, new THREE.Color(0xff0000), new THREE.Color(0xffffff));
            this.scene.add(this.GRIDHELPER);

            this.scene.fog = new THREE.Fog(this.COL_OCEAN, 0.001, 12);


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
            
        },

        animate: function () {
            
            requestAnimationFrame(this.animate);
            this.renderer.render(this.scene, this.camera);
            this.controls.update();
            this.animateToCamera();
        },

        animateToCamera: function(){

            // OPACITY, HEIGHT

            for(let m=0; m < this.COUNTRIES_TEXT.length; m++){
                this.COUNTRIES_TEXT[m].material.opacity = this.clamp(this.camera.position.y, 0, 1.5)/1.5;
            }

            for(let m=0; m < this.CITIES_TEXT.length; m++){
                this.CITIES_TEXT[m].position.y = this.clamp((( 1 - (this.clamp(this.camera.position.y, 0, 3.85) / 3.85 )) * this.ADAPTIVE_TEXT_HEIGHT_MAX),this.ADAPTIVE_TEXT_HEIGHT_MIN, this.ADAPTIVE_TEXT_HEIGHT_MAX );
            }

            // ROTATION
            if (this.camera.position.y <= 3.85){

                if (this.camera.position.y <= 1.75){

                    // COUNTRY NAMES
                    for(let m=0; m < this.COUNTRIES_TEXT.length; m++){
                        this.COUNTRIES_TEXT[m].lookAt(this.camera.position);
                    }
                    // CITY NAMES
                    for(let m=0; m < this.CITIES_TEXT.length; m++){
                        this.CITIES_TEXT[m].lookAt(this.camera.position);
                    }
                }
                else{
                    
                    // COUNTRY NAMES
                    for(let m=0; m < this.COUNTRIES_TEXT.length; m++){
                        this.COUNTRIES_TEXT[m].lookAt(this.camera.position);
                        this.COUNTRIES_TEXT[m].rotation.z = this.camera.rotation.z;
                    }
                    // CITY NAMES
                    for(let m=0; m < this.CITIES_TEXT.length; m++){
                        this.CITIES_TEXT[m].lookAt(this.camera.position);
                        this.CITIES_TEXT[m].rotation.z = this.camera.rotation.z;
                    }
                }
             
            }
            else{
                // COUNTRY NAMES
                for(let m=0; m < this.COUNTRIES_TEXT.length; m++){                    
                    this.COUNTRIES_TEXT[m].rotation.x = this.COUNTRIES_TEXT_ROT[m][0];
                    this.COUNTRIES_TEXT[m].rotation.y = this.COUNTRIES_TEXT_ROT[m][1];
                    // this.COUNTRIES_TEXT[m].rotation.z = this.COUNTRIES_TEXT_ROT[m][2];
                    this.COUNTRIES_TEXT[m].rotation.z = this.camera.rotation.z;                   
                }
                // CITY NAMES
                for(let m=0; m < this.CITIES_TEXT.length; m++){                    
                    this.CITIES_TEXT[m].rotation.x = this.CITIES_TEXT_ROT[m][0];
                    this.CITIES_TEXT[m].rotation.y = this.CITIES_TEXT_ROT[m][1];
                    // this.COUNTRIES_TEXT[m].rotation.z = this.COUNTRIES_TEXT_ROT[m][2];
                    this.CITIES_TEXT[m].rotation.z = this.camera.rotation.z;                   
                }
            }   
        },


        addMesh_Point: function(coordinates, h){
            // POINT ;
            let mesh = new THREE.Mesh(this.GEO_POINT, this.MAT_BASIC_RED);
            mesh.position.x = -coordinates[1];
            mesh.position.z = -coordinates[0];
            mesh.position.y = h;
            this.scene.add(mesh);
        },

        addMesh_Station: function(coordinates, h){
            // POINT ;
            let mesh = new THREE.Mesh(this.GEO_SPHERE, this.MAT_BASIC_WHITE);
            mesh.position.x = -coordinates[1];
            mesh.position.z = -coordinates[0];
            mesh.position.y = h;
            this.scene.add(mesh);
            this.addMesh_Edges(this.GEO_SPHERE,mesh.position.x, mesh.position.y, mesh.position.z);
        },

        addMesh_Edges: function(geometry, x,y,z){
            let edges = new THREE.EdgesGeometry( geometry );
            let line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: this.COL_EDGES } ) );
            line.position.x = x;
            line.position.z = z;
            line.position.y = y;
            this.scene.add( line );
        },

        addMesh_StationNames: function(coordinates, h, name, ){
        this.TTFLOADER.load(DBSANS, (json) => {
            // First parse the font.
            let dbsans = this.FONTLOADER.parse(json);
            // Use parsed font as normal.
            let textGeometry = new TextGeometry(name, { height: 0.0001, size: 0.0048, font: dbsans });
            let textMaterial = new THREE.MeshBasicMaterial({ color: this.COL_FONT } );
            let textMesh = new THREE.Mesh(textGeometry, textMaterial);
            textMesh.position.x = -coordinates[1];
            textMesh.position.z = -coordinates[0];
            textMesh.position.y = h;
            textMesh.rotateX(Math.PI/2);
            textMesh.rotateZ(Math.PI);  
            textMesh.rotateY(Math.PI);
            this.scene.add(textMesh);
            this.CITIES_TEXT_POS.push([textMesh.position.x, textMesh.position.y, textMesh.position.z]);
            this.CITIES_TEXT_ROT.push([textMesh.rotation.x, textMesh.rotation.y, textMesh.rotation.z]);    
            this.CITIES_TEXT.push(textMesh);
            })
        },  

        getDataTrainstations: function(){
            fetch("./german_top_603_cities.json")
            .then((response)  => { 
                response.json()
                .then((data)  => {  
                    this.addTrainStations(data);
                    this.getTRAINLINES(data); 
                })
                // .catch(() =>{ /* NO ERROR MSGS */ })
            })
        },

        addTrainStations: function(data){
            for(let i=0; i < data.length; i++){
                        if (this.CITIES.includes(data[i]["city"])) {
                            // console.log(data[i]["city"]);
                            let coordinates = this.getGPSRelativePosition([data[i]["lng"], data[i]["lat"]], this.center);
                            this.addMesh_Station(coordinates, this.OBJ_HEIGHT_DEFAULT);
                            this.addMesh_StationNames([coordinates[0]-0.002, coordinates[1]-0.005], this.OBJ_HEIGHT_DEFAULT+0.005, data[i]["city"]);
                        }
                    }
        },

        getTRAINLINES: function(data){
            let trainline_paths = [];
                    for(let i=0; i < this.TRAINLINES.length; i++){
                        let path = []
                        for(let j=0; j < this.TRAINLINES[i].length; j++){
                            for(let t=0; t < data.length; t++){
                                if (data[t]["city"] == this.TRAINLINES[i][j]) {   
                                    let coordinates = this.getGPSRelativePosition([data[t]["lng"], data[t]["lat"]], this.center);
                                    path.push( new THREE.Vector3(-coordinates[1], this.OBJ_HEIGHT_DEFAULT, -coordinates[0] ) );
                                }
                            }
                        }
                        trainline_paths.push(path);
                    }
                    this.TRAINLINES_ORIGINAL = trainline_paths;   
                    console.log(this.TRAINLINES_ORIGINAL);
                this.modTRAINLINES(trainline_paths); 
        },

        clamp: function(num, min, max){ return Math.min(Math.max(num, min), max); },
        getAngle: function(a, b){ return -Math.atan2((b.y - a.y),(b.x - a.x)) * 180 / Math.PI; },

        rotatePointAround: function(p1, p2){
            // 2.1 determine point's quadrant around the station, where the point originates
            // 2.2 Rotate point on station as axis
            // 0-90°:    = in 1st quadrant -> set new out angle: 45°
            // 90-180°:  = in 2end quadrant -> set new out angle: 135°
            // 180-270°: = in 3rd quadrant -> set new out angle: 225°
            // 270-360°: = in 4th quadrant -> set new out angle: 315°
            let axis = new THREE.Vector2(p1.x, p1.z);
            let point = new THREE.Vector2(p2.x, p2.z);
            let current = this.getAngle(axis, point);
            let target = 45 + ( Math.floor ( current / 90 ) * 90 ); // unreadable, but elegant conditional switch-statement ;)
            let r = point.rotateAround(axis, -THREE.MathUtils.degToRad(target - current));         
            return new THREE.Vector3(r.x, p1.y, r.y);                              
        },

        setDistanceStationInOut: function(p1, p2){            
            let station = new THREE.Vector2(p1.x, p1.z);
            let point = new THREE.Vector2(p2.x, p2.z);
            point = point.sub(station).normalize().multiplyScalar(this.CON_INOUT_DISTANCE).add(station);
            return new THREE.Vector3(point.x, p1.y, point.y); 
        }, 

        emptyPointer: function(){},

        modTRAINLINES: function(trainline_paths){
            console.log("CALLED modTRAINLINES +++++++++++++++++");
                    // console.log(trainline_paths.length);

                    for (let p=0; p < trainline_paths.length; p++){                    

                        let path = trainline_paths[p];
                        let segments = [];
                        // console.log(path.length-1);

                        for (let seg = 0; seg < path.length-1; seg++){                           
                            

                            // STEP 1 - SUBDIVIDE PATH FROM STATION A -> B INTO 5 EQUALLY LONG CHUNKS
                            segments.push(new THREE.LineCurve3(path[seg], path[seg+1]).getSpacedPoints(5));

                            let station_out = segments[seg][0]
                            let point_out = segments[seg][1]
                            let station_in = segments[seg][segments[seg].length-1]
                            let point_in = segments[seg][segments[seg].length-2]                            

                            // STEP 2 RE-ARRANGE THE DIRECTION (angle) + POSITION (coordinates) OF EVERY FIRST OUTCOMING/INCOMING POINT FOR EVERY STATION BY ITS QUADRANT-ANGLE
                            segments[seg][1] = this.rotatePointAround(station_out, point_out);
                            segments[seg][segments[seg].length-2] = this.rotatePointAround(station_in, point_in);

                            station_out = segments[seg][0]
                            point_out = segments[seg][1]
                            station_in = segments[seg][segments[seg].length-1]
                            point_in = segments[seg][segments[seg].length-2]    
                     
                            // set distance of in/out points to station
                            segments[seg][1] = this.setDistanceStationInOut(station_out, point_out);
                            segments[seg][segments[seg].length-2] = this.setDistanceStationInOut(station_in, point_in);
                           
                            // DRAW TRAIN LINES
                            let geometry = new THREE.BufferGeometry().setFromPoints(segments[seg]);
                            let line = new THREE.Line( geometry, new THREE.LineBasicMaterial({color: this.COLORMAPS[p], linewidth: 3}));
                            this.scene.add(line);  
                            
                            // DRAW CONNECTION POINTS FOR BETTER VISUALIZATION
                            for (let s=1; s < segments[seg].length-1; s++){
                                let mesh = new THREE.Mesh(this.GEO_POINT_LINE, new THREE.MeshBasicMaterial({color: this.COLORMAPS[p],}));
                                mesh.position.x = segments[seg][s].x; 
                                mesh.position.y = segments[seg][s].y;  
                                mesh.position.z = segments[seg][s].z;                 
                                this.scene.add(mesh);    
                            }
                            
                            // let axesHelper = new THREE.AxesHelper( 1 );
                            // axesHelper.position.x = segments[1].x;
                            // axesHelper.position.y += this.OBJ_HEIGHT_DEFAULT;
                            // axesHelper.position.z = segments[1].z;
                            // this.scene.add( axesHelper );                       

                           
                            
                        }
                        this.TRAINLINES_MODIFIED.push(segments);
                    }
                    console.log(this.TRAINLINES_MODIFIED);      
                    // this.getTRAINLINES = this.emptyPointer();  
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

        addCountryNames: function(){

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

                                this.TTFLOADER.load(DBSANS, (json) => {
                                    // First parse the font.
                                    let dbsans = this.FONTLOADER.parse(json);
                                    // Use parsed font as normal.
                                    let textGeometry = new TextGeometry(this.COUNTRIES[c], { height: 0.0001, size: 0.0048, font: dbsans });
                                    let textMaterial = this.MAT_NAME_OPAQUE;
                                    let textMesh = new THREE.Mesh(textGeometry, textMaterial);
                                    textMesh.position.x = -coordinates[1];
                                    textMesh.position.z = -coordinates[0];
                                    textMesh.position.y = this.ADAPTIVE_TEXT_HEIGHT_MIN; // HEIGHT
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