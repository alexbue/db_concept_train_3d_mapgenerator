<template>
    <div id="container">
     </div>
</template>

<script>

import * as THREE from 'three';
import * as dat from 'dat.gui';
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import Stats from 'three/examples/jsm/libs/stats.module'
import * as GEOLIB from "geolib";

import DBSANS from './../../public/DB Sans Bold/DB Sans Bold.ttf';

export default {

    name: 'EuropeMap',

    data() {

        return {

            FPS: new Stats(),
            RAM: new Stats(),
            MS: new Stats(),

            GUI: new dat.GUI({ width: 400 }),

            // GUI CONTROLS:
            GUI_CONTROLS: new function () {
                this.GLOBAL_MIX = 1;
                this.GLOBAL_DEBUG_ON = true;
                this.IN_OUT_DISTANCE = 0.03;
                this.IN_OUT_ANGLE = 45;
                this.IN_OUT_ALIGNMENT_DISTANCE = 0.004;
                this.IN_OUT_ALIGN_ANGLE = 30;
            },
            GUI_RESET: new function(){
                this.GUI_RESET = function(){
                };
            },

            GUI_RESET_CAMERA: new function(){
                this.GUI_RESET = function(){
                };
            },
            

            // 3D OBJECTS
            data_mesh_debug_pnts: [],
            data_mesh_trainlines: [],

            // SCENE BASICS
            camera: null,
            scene: new THREE.Scene(),
            renderer: null,

            mesh: null,
            controls: null,
            iR: null,
            text: null,

            material_building: new THREE.MeshNormalMaterial(),
            HEIGHT: 1,

            xy_center: [10, 51],
            map_scale: 1000000,

            k: 0,

            FONTLOADER: null,
            TTFLOADER: null,

            y_height_default: 0.025,

            COUNTRIES_MESH: [],
            COUNTRIES_TEXT: [],
            COUNTRIES_TEXT_ROT: [],
            COUNTRIES_TEXT_POS: [],

            ADAPTIVE_TEXT_HEIGHT_MIN: 0.025,
            ADAPTIVE_TEXT_HEIGHT_MAX: 0.05,
            COUNTRIES_POINT: [],

            stations_obj: [],
            stations_rot: [],
            stations_pos: [],

            GEO_POINT: new THREE.BoxGeometry(0.005, 0.005, 0.005),
            geo_station_sphere: new THREE.SphereGeometry(0.002, 8, 4),
            GEO_SPHERE: new THREE.SphereGeometry(0.005, 16, 8),
            GEO_STATION: new THREE.BoxGeometry(0.01, 0.01, 0.02),

            GEO_POINTS: [],

            // FLAGS: 
            DATA_LOADED: false,


            // TRAINLINE DATA
            
            data_vectors2: [],
            DATA_MOD: [],             
            DATA_VIEW: [],  
            
            // THREEJS-OBJECT REFERENCES

            GRIDHELPER: null,

            COL_OCEAN: new THREE.Color(0xabd8ea),
            COL_TARGET: new THREE.Color(0x181818), // white
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

            mat_colormap: [
                new THREE.LineBasicMaterial({ color: 0xFFADAD, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xFFD6A5, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xFDFFB6, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xCAFFBF, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0x9BF6FF, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xA0C4FF, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xBDB2FF, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xFFC6FF, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xff5d8f, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xffeedd, linewidth: 3 }),
                new THREE.LineBasicMaterial({ color: 0xff686b, linewidth: 3 }),
            ],

            MAT_BASIC_BLACK: new THREE.MeshBasicMaterial({ color: 0x000000 }),
            MAT_BASIC_RED: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
            MAT_BASIC_WHITE: new THREE.MeshBasicMaterial({ color: 0xFAF8F6 }),
            // MAT_TEXT: new THREE.MeshBasicMaterial({ color: 0x484848 }),

            MAT_TEXT: new THREE.MeshBasicMaterial({ color: 0xff0000 }),

            MAT_LINE_EDGES: new THREE.LineBasicMaterial({ color: new THREE.Color(0x97B49C) }),

            MAT_NAME_OPAQUE: new THREE.MeshBasicMaterial({ color: 0x484848, transparent: true, opacity: 1 }),

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

            CITIES: [
                "München",
                "Frankfurt",
                "Nürnberg",
                "Leipzig",
                "Stuttgart",
                "Hamburg",
                "Berlin",
       ],

            TRAINLINES: [
                ["München", "Stuttgart", "Leipzig"],
                ["München", "Leipzig"],
                ["München", "Stuttgart", "Frankfurt", "Leipzig"],
                ["München", "Stuttgart", "Frankfurt", "Leipzig"],
                ["München", "Nürnberg", "Frankfurt"],
                ["München", "Stuttgart", "Frankfurt"],
                ["München", "Stuttgart", "Leipzig", "Hamburg"],
                ["München", "Leipzig", "Hamburg"],
                ["München", "Stuttgart", "Frankfurt", "Leipzig", "Hamburg"],
                ["München", "Stuttgart", "Frankfurt", "Leipzig", "Hamburg"],
                ["München", "Nürnberg", "Frankfurt", "Hamburg"],
                ["München", "Stuttgart", "Frankfurt", "Hamburg"],
                ["München", "Nürnberg", "Berlin", "Hamburg"],
                ["München", "Nürnberg", "Berlin", "Hamburg"],
                ["München", "Nürnberg", "Berlin", "Hamburg"],
                ["München", "Nürnberg", "Berlin", "Hamburg"],
            ],

            data_occu: {},
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

            // STATS
            this.FPS.showPanel( 0 );
            this.RAM.showPanel( 2 );
            this.MS.showPanel( 1 );
            this.RAM.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
            this.FPS.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';
            this.MS.domElement.style.cssText = 'position:absolute;top:0px;left:160px;';
            document.body.appendChild(this.RAM.domElement);
            document.body.appendChild(this.FPS.domElement);
            document.body.appendChild(this.MS.domElement);

            // GUI
            let folder = this.GUI.addFolder("modifier");
            folder.add(this.GUI_CONTROLS, 'IN_OUT_DISTANCE', 0.005, 0.04).onChange(() => { this.update_data() });
            folder.add(this.GUI_CONTROLS, 'IN_OUT_ANGLE', 1, 89).onChange(() => { this.update_data() });
            folder.add(this.GUI_CONTROLS, 'IN_OUT_ALIGNMENT_DISTANCE', 0.004, 0.02).onChange(() => { this.update_data() });
            folder.add(this.GUI_CONTROLS, 'IN_OUT_ALIGN_ANGLE', 1, 89).onChange(() => { this.update_data() });
            folder.open();
            let folder2 = this.GUI.addFolder("globals");
            folder2.add(this.GUI_CONTROLS, 'GLOBAL_MIX', 0, 1).name('GLOBAL MIX').onChange(() => { this.update_data() });
            folder2.add(this.GUI_CONTROLS, "GLOBAL_DEBUG_ON").name("DEBUG MODE").onChange(() => {this.update_data(); console.log(this.GUI_CONTROLS.GLOBAL_DEBUG_ON);});
            folder2.add(this.GUI_RESET, "GUI_RESET").name("RESET MODIFIER").onChange(() => { this.reset_gui(); this.update_data() });            
            folder2.open();
            let folder3 = this.GUI.addFolder("camera");
            folder3.add(this.GUI_RESET_CAMERA, "GUI_RESET").name("RESET CAMERA").onChange(() => { this.reset_camera(); this.update_data() });
            folder3.open();

            this.FONTLOADER = new FontLoader();
            this.TTFLOADER = new TTFLoader();

            let container = document.getElementById('container');

            // this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 100);
            // this.camera.position.set(8, 4, 0);

            // initial bird view
            this.camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
            this.camera.rotation.y = Math.PI / 2;
            this.camera.position.set(0, 4, 0); // XYZ
            this.camera.zoom = 1800;
            this.camera.lookAt(0, 0, 0);
            
            // this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 100);

            


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
            this.animateToCamera();

            this.controls.update();
            this.FPS.update();
            this.RAM.update();
            this.MS.update();
        },

        animateToCamera: function () {

            // OPACITY, HEIGHT

            for (let m = 0; m < this.COUNTRIES_TEXT.length; m++) {
                this.COUNTRIES_TEXT[m].material.opacity = this.clamp(this.camera.position.y, 0, 1.5) / 1.5;
            }

            for (let m = 0; m < this.stations_obj.length; m++) {
                this.stations_obj[m].position.y = this.clamp(((1 - (this.clamp(this.camera.position.y, 0, 3.85) / 3.85)) * this.ADAPTIVE_TEXT_HEIGHT_MAX), this.ADAPTIVE_TEXT_HEIGHT_MIN, this.ADAPTIVE_TEXT_HEIGHT_MAX);
            }

            // ROTATION
            if (this.camera.position.y <= 3.85) {

                if (this.camera.position.y <= 1.75) {

                    // COUNTRY NAMES
                    for (let m = 0; m < this.COUNTRIES_TEXT.length; m++) {
                        this.COUNTRIES_TEXT[m].lookAt(this.camera.position);
                    }
                    // CITY NAMES
                    for (let m = 0; m < this.stations_obj.length; m++) {
                        this.stations_obj[m].lookAt(this.camera.position);
                    }
                }
                else {

                    // COUNTRY NAMES
                    for (let m = 0; m < this.COUNTRIES_TEXT.length; m++) {
                        this.COUNTRIES_TEXT[m].lookAt(this.camera.position);
                        this.COUNTRIES_TEXT[m].rotation.z = this.camera.rotation.z;
                    }
                    // CITY NAMES
                    for (let m = 0; m < this.stations_obj.length; m++) {
                        this.stations_obj[m].lookAt(this.camera.position);
                        this.stations_obj[m].rotation.z = this.camera.rotation.z;
                    }
                }

            }
            else {
                // COUNTRY NAMES
                for (let m = 0; m < this.COUNTRIES_TEXT.length; m++) {
                    this.COUNTRIES_TEXT[m].rotation.x = this.COUNTRIES_TEXT_ROT[m][0];
                    this.COUNTRIES_TEXT[m].rotation.y = this.COUNTRIES_TEXT_ROT[m][1];
                    // this.COUNTRIES_TEXT[m].rotation.z = this.COUNTRIES_TEXT_ROT[m][2];
                    this.COUNTRIES_TEXT[m].rotation.z = this.camera.rotation.z;
                }
                // CITY NAMES
                for (let m = 0; m < this.stations_obj.length; m++) {
                    this.stations_obj[m].rotation.x = this.stations_rot[m][0];
                    this.stations_obj[m].rotation.y = this.stations_rot[m][1];
                    // this.COUNTRIES_TEXT[m].rotation.z = this.COUNTRIES_TEXT_ROT[m][2];
                    this.stations_obj[m].rotation.z = this.camera.rotation.z;
                }
            }
        },

        addMesh_Point: function (coordinates, h) {
            // POINT ;
            let mesh = new THREE.Mesh(this.GEO_POINT, this.MAT_BASIC_RED);
            mesh.position.x = -coordinates[1];
            mesh.position.z = -coordinates[0];
            mesh.position.y = h;
            this.scene.add(mesh);
        },

        addMesh_Station: function (coordinates, h) {
            // POINT ;
            let mesh = new THREE.Mesh(this.GEO_SPHERE, this.MAT_BASIC_WHITE);
            mesh.position.x = -coordinates[1];
            mesh.position.z = -coordinates[0];
            mesh.position.y = h;
            this.scene.add(mesh);
            this.addMesh_Edges(this.GEO_SPHERE, mesh.position.x, mesh.position.y, mesh.position.z);
        },

        addMesh_Edges: function (geometry, x, y, z) {
            let edges = new THREE.EdgesGeometry(geometry);
            let line = new THREE.LineSegments(edges, this.MAT_LINE_EDGES);
            line.position.x = x;
            line.position.z = z;
            line.position.y = y;
            this.scene.add(line);
        },

        addMesh_StationNames: function (coordinates, h, name,) {
            this.TTFLOADER.load(DBSANS, (json) => {
                // First parse the font.
                let dbsans = this.FONTLOADER.parse(json);
                // Use parsed font as normal.
                let textGeometry = new TextGeometry(name, { height: 0.0001, size: 0.0048, font: dbsans });
                let textMaterial = this.MAT_TEXT;
                let textMesh = new THREE.Mesh(textGeometry, textMaterial);
                textMesh.position.x = -coordinates[1];
                textMesh.position.z = -coordinates[0];
                textMesh.position.y = h;
                textMesh.rotateX(Math.PI / 2);
                textMesh.rotateZ(Math.PI);
                textMesh.rotateY(Math.PI);
                this.scene.add(textMesh);
                this.stations_pos.push([textMesh.position.x, textMesh.position.y, textMesh.position.z]);
                this.stations_rot.push([textMesh.rotation.x, textMesh.rotation.y, textMesh.rotation.z]);
                this.stations_obj.push(textMesh);
            })
        },

        getDataTrainstations: function () {
            fetch("./german_top_603_cities.json")
                .then((response) => {
                    response.json()
                        .then((data) => {
                            this.addTrainStations(data);
                            this.get_data_trainlines(data);
                        })
                    // .catch(() =>{ /* NO ERROR MSGS */ })
                })
        },

        addTrainStations: function (data) {
            for (let i = 0; i < data.length; i++) {
                if (this.CITIES.includes(data[i]["city"])) {
                    // console.log(data[i]["city"]);
                    let coordinates = this.getGPSRelativePosition([data[i]["lng"], data[i]["lat"]], this.xy_center);
                    this.addMesh_Station(coordinates, this.y_height_default);
                    this.addMesh_StationNames([coordinates[0] - 0.002, coordinates[1] - 0.005], this.y_height_default + 0.005, data[i]["city"]);
                }
            }
        },


        get_data_trainlines: function (data) {
            let trainlines_vector2 = [];
            for (let i = 0; i < this.TRAINLINES.length; i++) {
                let path = [];
                for (let s = 0; s < this.TRAINLINES[i].length; s++) {
                    
                    for (let t = 0; t < data.length; t++) {

                        if (data[t]["city"] == this.TRAINLINES[i][s]) {
                            
                            // get pos vec3
                            let coordinates = this.getGPSRelativePosition([data[t]["lng"], data[t]["lat"]], this.xy_center);
                            let vec = new THREE.Vector3(-coordinates[1], this.y_height_default, -coordinates[0]);
                            path.push(vec);

                            /*[
                                {
                                "city": "München", 
                                "features": {
                                    "lat": "52.5167", 
                                    "lng": "13.3833", 
                                    "xyz_coordinates": "vector3",
                                    "sum_edges": 5,
                                    "quadrants": [0,0,1,2]
                                    }
                                }
                            ]
                            ,*/

                            this.data_occu[data[t]["city"]] = {};
                            this.data_occu[data[t]["city"]].city = data[t]["city"];
                            this.data_occu[data[t]["city"]].lng = data[t]["lng"];
                            this.data_occu[data[t]["city"]].lat= data[t]["lat"];
                            this.data_occu[data[t]["city"]].vec3 = vec;
                            this.data_occu[data[t]["city"]].quadrant = [0,0,0,0];
                            this.data_occu[data[t]["city"]].sum = [0,0,0,0];
                        }
                    }
                }
                trainlines_vector2.push(path);
                
            }

            // console.log(this.data_occu);
            this.get_station_quadrants();
            // console.log(this.data_occu);           
            
            this.data_vectors2 = trainlines_vector2;

            console.log(this.DATA_MOD);

            // subdivide
            this.subdivide();
            // initial render
            this.update_data();
        },

        get_station_quadrants: function(){

                 /*[
                                {
                                "city": "München", 
                                "features": {
                                    "lat": "52.5167", 
                                    "lng": "13.3833", 
                                    "xyz_coordinates": "vector3",
                                    "sum_edges": 5,
                                    "quadrants": [0,0,1,2]
                                    }
                                }
                            ]
                            ,*/

            
            for (let t = 0; t < this.TRAINLINES.length; t++) {                    
                    for (let s = 0; s < this.TRAINLINES[t].length; s++) {          
                         if (s == 0){ // check outgoing connection 

                            let station = this.data_occu[ this.TRAINLINES[t][s] ].vec3;
                            let next = this.data_occu[ this.TRAINLINES[t][s+1] ].vec3;
                            let quadrant = this.get_quadrant(station, next);
                            this.data_occu[this.TRAINLINES[t][s]].quadrant[quadrant] += 1;
                            this.data_occu[this.TRAINLINES[t][s]].sum[quadrant] += 1;
                         }
                         else if (s == this.TRAINLINES[t].length-1 ){ // check incoming connection

                            let station = this.data_occu[ this.TRAINLINES[t][s] ].vec3;
                            let previous = this.data_occu[ this.TRAINLINES[t][s-1] ].vec3;
                            let quadrant = this.get_quadrant(station, previous);
                            this.data_occu[this.TRAINLINES[t][s]].quadrant[quadrant] += 1;
                            this.data_occu[this.TRAINLINES[t][s]].sum[quadrant] += 1;
                         }
                         else{ //  check in+out connection

                            let station = this.data_occu[ this.TRAINLINES[t][s] ].vec3;
                            let next = this.data_occu[ this.TRAINLINES[t][s+1] ].vec3;
                            let quadrant1 = this.get_quadrant(station, next);
                            this.data_occu[this.TRAINLINES[t][s]].quadrant[quadrant1] += 1;
                            this.data_occu[this.TRAINLINES[t][s]].sum[quadrant1] += 1;
                            let previous = this.data_occu[ this.TRAINLINES[t][s-1] ].vec3;
                            let quadrant2 = this.get_quadrant(station, previous);
                            this.data_occu[this.TRAINLINES[t][s]].quadrant[quadrant2] += 1;   
                            this.data_occu[this.TRAINLINES[t][s]].sum[quadrant2] += 1;                          
                         }
                     }
                }
        },

        get_quadrant: function(p1, p2){
            let axis = new THREE.Vector2(p1.x, p1.z);
            let point = new THREE.Vector2(p2.x, p2.z);
            let current = this.getAngle(axis, point);
            if (current < 0) current = 360 + current;
            return Math.floor(current / 90);
        },
    
        clamp: function (num, min, max) { return Math.min(Math.max(num, min), max); },
        getAngle: function (a, b) { return -Math.atan2((b.y - a.y), (b.x - a.x)) * 180 / Math.PI; },

        reset_gui: function(){
            this.GUI_CONTROLS.GLOBAL_MIX = 1; 
            this.GUI_CONTROLS.IN_OUT_DISTANCE = 0.03;
            this.GUI_CONTROLS.IN_OUT_ANGLE = 45;
            this.GUI_CONTROLS.IN_OUT_ALIGNMENT_DISTANCE = 0.002;
            this.GUI_CONTROLS.IN_OUT_ALIGN_ANGLE = 30;
            
            // refresh GUI values manually
            for (var i = 0; i < Object.keys(this.GUI.__folders).length; i++) {
                var key = Object.keys(this.GUI.__folders)[i];
                for (var j = 0; j < this.GUI.__folders[key].__controllers.length; j++ )
                {
                    this.GUI.__folders[key].__controllers[j].updateDisplay();
                }
            }

            this.controls.update();
        },

        reset_camera: function(){            
            this.camera.position.set(0, 4, 0); // XYZ            
            this.camera.lookAt(0, 0, 0);
            this.camera.rotation.y = Math.PI / 2;
            this.camera.zoom = 1800;
        },
    
        // #
        // DATA CONTROL FUNCTIONS
        // #

        subdivide: function () {

        let data = this.data_vectors2;
     
        let data_mod = [];    // local duplicates to avoid overwrite original referenced data
        let original = [];
        let view = [];

        for (let t = 0; t < data.length; t++) {

            let updates = [];
            let updates2= [];
            let updates3 = [];

            for (let s = 0; s < data[t].length - 1; s++) {

                updates.push( new THREE.LineCurve3(data[t][s], data[t][s + 1]).getSpacedPoints(7));
                updates2.push(new THREE.LineCurve3(data[t][s], data[t][s + 1]).getSpacedPoints(7));
                updates3.push(new THREE.LineCurve3(data[t][s], data[t][s + 1]).getSpacedPoints(7));

                let len = updates[s].length;
                
                updates [s][1] = updates [s][0]; 
                updates2[s][1] = updates2[s][0]; 
                updates2[s][1] = updates2[s][0]; 

                updates [s][len-2] = updates [s][len-1]; 
                updates2[s][len-2] = updates2[s][len-1]; 
                updates3[s][len-2] = updates3[s][len-1]; 

            }

            data_mod.push   (updates);
            original.push   (updates2);
            view.push       (updates3);

        }

        this.DATA_MOD = data_mod;
        this.data_vectors2 = original;
        this.DATA_VIEW = view;

        },


        update_data: function () {

            // console.log(this.DATA_MOD);

            // clear scene
            this.clear_3d_scene();
            // update in/out distances + rotation
            this.updateData(this.update_in_out_station);
            // // update in/out orthogonal distribution
            this.updateData(this.update_rail_alignment);
            // update view_data
            this.update_global_view();
            // create geometries
            this.update_3d_objects();
            // draw 3d models
            this.update_3d_scene();
        },

        updateData: function (fun, data=this.DATA_MOD) {
            for (let l = 0; l < data.length; l++) {
                for (let s = 0; s < data[l].length; s++) {
                    fun(data, l, s);
                }
            }
        },


        update_in_out_station: function (d, l, s) {

            // vec[len - 1] = rotation axis point - is clone of station a - should never be altered!
            // vec[len - 2] = station a           
            // vec[len - 3] = first point outcoming of station a 
            // vec[0] = rotation axis point - is clone of station b - should never be altered!
            // vec[1] = station b                 
            // vec[2] = last point incoming to station b

            let len  = d[l][s].length;
            let vec = d[l][s];
          
            vec[2] =  this.update_distance(vec[0], vec[2]);
            vec[len - 3]  = this.update_distance(vec[len - 1], vec[len - 3]);

            vec[2] = this.rotatePointAround(vec[0], vec[2]);
            vec[len - 3]  = this.rotatePointAround(vec[len - 1], vec[len - 3]);
        
        },

        update_rail_alignment: function(data, l, s){

            // vec[len - 1] = rotation axis point - is clone of station  - should never be altered!
            // vec[len - 2] = station a           
            // vec[len - 3] = first point outcoming of station a 
            // vec[0] = rotation axis point - is clone of station b - should never be altered!
            // vec[1] = station b                 
            // vec[2] = last point incoming to station b

            let len  = data[l][s].length; 

            let vec = data[l][s];         
            
            Object.keys(this.data_occu).forEach(key => {

            let coordinates = this.data_occu[key].vec3;

            // console.log(coordinates);


            if (coordinates.equals(vec[0])){

                console.log(this.data_occu[key].quadrants);

                let quadrant_index = this.get_quadrant(vec[0], vec[1]);
                let sum = this.data_occu[key].sum[quadrant_index];
                let quadrant = this.data_occu[key].quadrant[quadrant_index];

                // console.log(sum);
                // console.log(quadrant);

                let res = this.update_rail_distance(vec[0], vec[2], sum, quadrant);
                
                vec[1] = res[0];         
                vec[2] = res[1];   

                this.data_occu[key].quadrant[quadrant_index] += 1;     
                }  

            if (coordinates.equals(vec[len - 1])){

                console.log(this.data_occu[key].quadrants);

                let quadrant_index = this.get_quadrant(vec[len - 1], vec[len - 2]);
                let sum = this.data_occu[key].sum[quadrant_index];

                // sum = (sum - quadrant) + 1;

                let quadrant = this.data_occu[key].quadrant[quadrant_index];

                // console.log(sum);
                // console.log(quadrant);

                let res = this.update_rail_distance(vec[len - 1], vec[len - 3], sum, sum-quadrant);

                vec[len - 2]= res[0];         
                vec[len - 3] = res[1];   

                this.data_occu[key].quadrant[quadrant_index] += 1;     
                }  

            });


        

        },

        update_rail_distance: function(p1, p2, sum, rail){

            let axis = new THREE.Vector2(p1.x, p1.z);
            let point = new THREE.Vector2(p2.x, p2.z);
            
            let distance = axis.distanceTo(point);

            let d = this.GUI_CONTROLS.IN_OUT_ALIGNMENT_DISTANCE;
 
            if (sum % 2 == 0){ // even number of rails
                d = (rail * d) - (2 * d);
            }
            else{ // odd number of rails
                d = (rail * d) - (1 * d);
            }

            if ( d < 0) distance *= -1;
  
            let vec1 =  point.rotateAround(axis, -THREE.MathUtils.degToRad(-90));
            vec1 = this.update_distance(p1, new THREE.Vector3(vec1.x, p1.y, vec1.y), d);
            let vec2 = axis.rotateAround(new THREE.Vector2(vec1.x, vec1.z), -THREE.MathUtils.degToRad(-90));
            vec2 = this.update_distance(vec1, new THREE.Vector3(vec2.x, p1.y, vec2.y), distance);
            return [vec1, vec2];

        },

        

        update_global_view: function(){
            for (let line = 0; line < this.DATA_MOD.length; line++) {
                for (let section = 0; section < this.DATA_MOD[line].length; section++) {
                    for (let vec = 0; vec < this.DATA_MOD[line][section].length; vec++) {
                        //weighted average between two vectors
                        let t = this.GUI_CONTROLS.GLOBAL_MIX;                        
                        let x = (this.DATA_MOD[line][section][vec].x * t) + (this.data_vectors2[line][section][vec].x * (1-t));
                        let z = (this.DATA_MOD[line][section][vec].z * t) + (this.data_vectors2[line][section][vec].z * (1-t));
                        this.DATA_VIEW[line][section][vec] = new THREE.Vector3(x, this.DATA_MOD[line][section][vec].y, z);
                    }
                }
            }
        },

        clear_3d_scene: function () {
            // remove + dispose
            for (let m = 0; m < this.data_mesh_debug_pnts.length; m++) {
                this.data_mesh_debug_pnts[m].geometry.dispose();
                this.data_mesh_debug_pnts[m].material.dispose();
                this.scene.remove(this.data_mesh_debug_pnts[m]);
            }
            for (let m = 0; m < this.data_mesh_trainlines.length; m++) {
                for (let n = 0; n < this.data_mesh_trainlines[m].length; n++) {
                    this.data_mesh_trainlines[m][n].geometry.dispose();
                    this.data_mesh_trainlines[m][n].material.dispose();
                    this.scene.remove(this.data_mesh_trainlines[m][n]);
                }
            }
            this.renderer.renderLists.dispose();
        },

        update_3d_scene: function () {

            // trainline sections
            for (let m = 0; m < this.data_mesh_debug_pnts.length; m++) {
                this.scene.add(this.data_mesh_debug_pnts[m]);
            }

            if (this.GUI_CONTROLS.GLOBAL_DEBUG_ON){
            // section points
            for (let m = 0; m < this.data_mesh_trainlines.length; m++) {
                for (let n = 0; n < this.data_mesh_trainlines[m].length; n++) {
                    this.scene.add(this.data_mesh_trainlines[m][n]);
                }
            }

            }
     
        },

        update_3d_objects: function () {

            let DATA = this.DATA_VIEW;

            let models_connections = [];
            let models_sections = [];            

            for (let t = 0; t < DATA.length; t++) {
                for (let section = 0; section < DATA[t].length; section++) {
                    //  create train line sections
                    models_sections.push(this.createLine(DATA[t][section], t));
                    let connections = []
                    // create section points
                    for (let s = 1; s < DATA[t][section].length - 1; s++) {
                        connections.push(this.createPoint(DATA[t][section][s], t));
                    }
                    models_connections.push(connections);
                }
            }

            this.data_mesh_debug_pnts = models_sections;
            this.data_mesh_trainlines = models_connections;
        },

        createPoint: function (pos_vec3, color_index) {
            let mesh = new THREE.Mesh(this.geo_station_sphere, this.mat_colormap[color_index]);
            mesh.position.x = pos_vec3.x;
            mesh.position.y = pos_vec3.y;
            mesh.position.z = pos_vec3.z;
            return mesh;
        },

        createLine: function (pos_vec3_array, color_index) {
            let geometry = new THREE.BufferGeometry().setFromPoints(pos_vec3_array);
            let line = new THREE.Line(geometry, this.mat_colormap[color_index]);
            return line;
        },

        emptyPointer: function () { },

        getMapData: function () {
            fetch("./europe_borders_7MB_6p.geojson").then((response) => {
                response.json().then((data) => {

                    let f = data.features;
                    let ckey = 0;
                    // console.log(f);
                    for (let i = 0; i < f.length; i++) {
                        if (this.COUNTRIES.includes(f[i].properties["NAME"])) {
                            // console.log(f[i].properties["NAME"]);
                            if (f[i].properties["NAME"] == "Austria" || f[i].properties["NAME"] == "Belgium" || f[i].properties["NAME"] == "Switzerland" || f[i].properties["NAME"] == "Czech Republic" || f[i].properties["NAME"] == "Luxembourg" || f[i].properties["NAME"] == "Liechtenstein" || f[i].properties["NAME"] == "Hungary" || f[i].properties["NAME"] == "Slovakia") {
                                this.getPolygons([f[i].geometry.coordinates], ckey, f[i].properties["NAME"]);
                            }
                            else {
                                this.getPolygons(f[i].geometry.coordinates, ckey, f[i].properties["NAME"]);
                            }

                            ckey++;
                        }
                    }
                })
            })
        },

        addCountryNames: function () {

            fetch("./countries_centroids_mod.geojson").then((response) => {
                response.json().then((data) => {
                    for (let c = 0; c < this.COUNTRIES.length; c++) {

                        for (let i = 0; i < data.features.length; i++) {
                            if (data.features[i].properties["COUNTRY"] == this.COUNTRIES[c]) {
                                // console.log(this.COUNTRIES[c]);
                                let coordinates = this.getGPSRelativePosition(data.features[i].geometry["coordinates"], this.xy_center);
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
                                    let textMesh = new THREE.Mesh(textGeometry, this.MAT_NAME_OPAQUE);
                                    textMesh.position.x = -coordinates[1];
                                    textMesh.position.z = -coordinates[0];
                                    textMesh.position.y = this.ADAPTIVE_TEXT_HEIGHT_MIN; // HEIGHT
                                    textMesh.rotateX(Math.PI / 2);
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
            if (country == "Germany") {
                material.color.set(this.COL_TARGET);
            }
            else {
                material.color.set(this.COL_REST);
            }

            for (let i = 0; i < patches.length; i++) {

                let shape = this.genShape(patches[i], this.xy_center);


                let geometry = this.genGeometry(shape, { curveSegments: 1, depth: 0.02 * this.HEIGHT, bevelEnabled: false });
                geometry.rotateX(Math.PI / 2);
                geometry.rotateZ(Math.PI);
                geometry.rotateY(-Math.PI / 2);
                let mesh = new THREE.Mesh(geometry, material);
                mesh.position.y -= 0.0001;
                this.scene.add(mesh);
                let edges = new THREE.EdgesGeometry(geometry);
                let line = new THREE.LineSegments(edges, this.MAT_LINE_EDGES);
                this.scene.add(line);

            }
        },

        genShape: function (points, xy_center) {

            let shape = new THREE.Shape();

            for (let i = 0; i < points.length; i++) {

                let p = points[i];

                for (let j = 0; j < p.length; j++) {

                    let elp = this.getGPSRelativePosition(p[j], xy_center);
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

    },
}
</script>

<style scoped>
#container {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: graymap_scale;
    text-align: xy_center;
    color: #2c3e50;
    background-color: red;
};



#gui {
    width: 800px;
};


</style>