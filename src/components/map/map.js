
import { globals } from '@/components/globals.js';
import { clamp, geometry_rotate_to_scene, three_create_text } from '@/components/utils/utils.js';
import { loader_hide } from '@/components/gui/gui.js';
import { convert_geocoord_to_xy } from '@/components/utils/utils.js';

import * as THREE from 'three';


const COUNTRIES = [

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
    "Slovakia"
    
];



const scene = globals.scene;
const target = "Germany";

export function create_map(data) { // "./europe_borders_7MB_6p.geojson";

    let countries = data.features;
    // let color_key = 0;

    for (let c = 0; c < countries.length; c++) {

        if (COUNTRIES.includes(countries[c].properties["NAME"])) {

            let country = countries[c]
            let patches = null; // a country can consist of multiple patches (eg. islands, colonies ...)

            if (
                country.properties["NAME"] == "Austria" ||
                country.properties["NAME"] == "Belgium" ||
                country.properties["NAME"] == "Switzerland" ||
                country.properties["NAME"] == "Czech Republic" ||
                country.properties["NAME"] == "Luxembourg" ||
                country.properties["NAME"] == "Liechtenstein" ||
                country.properties["NAME"] == "Hungary" ||
                country.properties["NAME"] == "Slovakia"
            ) {
                patches = [country.geometry.coordinates]; // correct array unfolding for this explicit json data file
            }
            else {
                patches = country.geometry.coordinates;   // correct array unfolding for this explicit json data file
            }

            for (let p = 0; p < patches.length; p++) {

                let shape = new THREE.Shape();
                let patch = patches[p][0];

                for (let vert = 0; vert < patch.length; vert++) {

                    let vertice = convert_geocoord_to_xy(patch[vert]);
                    if (vert == 0) shape.moveTo(vertice.x, vertice.y);
                    else shape.lineTo(vertice.x, vertice.y);

                }
                let meshes = map_from_vec2_vertices(shape, target == country.properties["NAME"]);
                scene.add(meshes[0]);
                scene.add(meshes[1]);
            }
            // color_key++;
        }
    }
}



const mat_target = globals.mat_map_1;
const mat_rest = globals.mat_map_2;
const mat_edge = globals.mat_map_edges;
const extrude_conf = { curveSegments: 1, depth: 0.02 * globals.HEIGHT, bevelEnabled: false };

function map_from_vec2_vertices(shape, target) {

    let material = mat_rest;
    if (target) material = mat_target;

    let geometry = new THREE.ExtrudeGeometry(shape, extrude_conf);
    geometry_rotate_to_scene(geometry);
    geometry.computeBoundingBox();

    let mesh = new THREE.Mesh(geometry, material);
    let edg = new THREE.EdgesGeometry(geometry);
    let edges = new THREE.LineSegments(edg, mat_edge);
    edges.position.y += 0.0001;

    return [mesh, edges];
}




export function create_country_names(data) { // "./countries_centroids_mod.geojson";

    for (let c = 0; c < globals.COUNTRIES.length; c++) {

        for (let i = 0; i < data.features.length; i++) {

            if (data.features[i].properties["COUNTRY"] == globals.COUNTRIES[c]) {

                // console.log(globals.COUNTRIES[c]);
                let vectors2 = convert_geocoord_to_xy(data.features[i].geometry["coordinates"]);


                // let mesh = new THREE.Mesh(globals.GEO_POINT, globals.MAT_BASIC_BLACK);
                // mesh.position.x = -vectors2.y;
                // mesh.position.y = 0.1;
                // mesh.position.z = -vectors2.x;

                // globals.scene.add(mesh);
                // globals.COUNTRIES_POINT.push(mesh);   


                let callback = function(){
                    if (data.features[i].properties["COUNTRY"] == globals.COUNTRIES[globals.COUNTRIES.length-1]){
                        loader_hide();
                    } 
                }

                three_create_text(globals.COUNTRIES[c], vectors2, callback)
              
            }
        }    
    }   
}




export function animate_map() {

    // OPACITY, HEIGHT

    for (let m = 0; m < globals.COUNTRIES_TEXT.length; m++) {
        globals.COUNTRIES_TEXT[m].material.opacity = clamp(globals.camera.position.y, 0, 1.5) / 1.5;
    }

    for (let m = 0; m < globals.stations_obj.length; m++) {
        globals.stations_obj[m].position.y = clamp(((1 - (clamp(globals.camera.position.y, 0, 3.85) / 3.85)) * globals.ADAPTIVE_TEXT_HEIGHT_MAX), globals.ADAPTIVE_TEXT_HEIGHT_MIN, globals.ADAPTIVE_TEXT_HEIGHT_MAX);
    }

    // ROTATION
    if (globals.camera.position.y <= 3.85) {

        if (globals.camera.position.y <= 1.75) {

            // COUNTRY NAMES
            for (let m = 0; m < globals.COUNTRIES_TEXT.length; m++) {
                globals.COUNTRIES_TEXT[m].lookAt(globals.camera.position);
            }
            // CITY NAMES
            for (let m = 0; m < globals.stations_obj.length; m++) {
                globals.stations_obj[m].lookAt(globals.camera.position);
            }
        }
        else {

            // COUNTRY NAMES
            for (let m = 0; m < globals.COUNTRIES_TEXT.length; m++) {
                globals.COUNTRIES_TEXT[m].lookAt(globals.camera.position);
                globals.COUNTRIES_TEXT[m].rotation.z = globals.camera.rotation.z;
            }
            // CITY NAMES
            for (let m = 0; m < globals.stations_obj.length; m++) {
                globals.stations_obj[m].lookAt(globals.camera.position);
                globals.stations_obj[m].rotation.z = globals.camera.rotation.z;
            }
        }

    }
    else {
        // COUNTRY NAMES
        for (let m = 0; m < globals.COUNTRIES_TEXT.length; m++) {
            globals.COUNTRIES_TEXT[m].rotation.x = globals.COUNTRIES_TEXT_ROT[m][0];
            globals.COUNTRIES_TEXT[m].rotation.y = globals.COUNTRIES_TEXT_ROT[m][1];
            // globals.COUNTRIES_TEXT[m].rotation.z = globals.COUNTRIES_TEXT_ROT[m][2];
            globals.COUNTRIES_TEXT[m].rotation.z = globals.camera.rotation.z;
        }
        // CITY NAMES
        for (let m = 0; m < globals.stations_obj.length; m++) {
            globals.stations_obj[m].rotation.x = globals.stations_rot[m][0];
            globals.stations_obj[m].rotation.y = globals.stations_rot[m][1];
            // globals.COUNTRIES_TEXT[m].rotation.z = globals.COUNTRIES_TEXT_ROT[m][2];
            globals.stations_obj[m].rotation.z = globals.camera.rotation.z;
        }
    }

}

