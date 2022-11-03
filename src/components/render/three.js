import * as THREE from 'three';
// import * as dat from 'dat.gui';
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { globals } from '@/components/globals.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
// import Stats from 'three/examples/jsm/libs/stats.module'

import DBSANS from './../../../public/DB Sans Bold/DB Sans Bold.ttf';

import { convert_geocoord_to_xy } from '@/components/utils/utils';




export function update_scene() {

}


export function createPoint(pos_vec3, color_index) {
    let mesh = new THREE.Mesh(globals.geo_station_sphere, globals.mat_colormap[color_index]);
    mesh.position.x = pos_vec3.x;
    mesh.position.y = pos_vec3.y;
    mesh.position.z = pos_vec3.z;
    return mesh;
}

export function createLine(pos_vec3_array, color_index) {
    let geometry = new THREE.BufferGeometry().setFromPoints(pos_vec3_array);
    let line = new THREE.Line(geometry, globals.mat_colormap[color_index]);
    return line;
}

export function update_3d_objects() {

    let DATA = globals.DATA_VIEW;

    let models_connections = [];
    let models_sections = [];

    for (let t = 0; t < DATA.length; t++) {
        for (let section = 0; section < DATA[t].length; section++) {
            //  create train line sections
            models_sections.push(createLine(DATA[t][section], t));
            let connections = []
            // create section points
            for (let s = 1; s < DATA[t][section].length - 1; s++) {
                connections.push(createPoint(DATA[t][section][s], t));
            }
            models_connections.push(connections);
        }
    }

    globals.MODEL_SECTIONS = models_sections;
    globals.MODEL_SECTIONS_CONNECTIONS = models_connections;
}





export function reset_gui() {
    globals.GUI_CONTROLS.GLOBAL_MIX = 1;
    globals.GUI_CONTROLS.IN_OUT_DISTANCE = 0.03;
    globals.GUI_CONTROLS.IN_OUT_ANGLE = 45;
    globals.GUI_CONTROLS.IN_OUT_ALIGNMENT_DISTANCE = 0.002;
    globals.GUI_CONTROLS.IN_OUT_ALIGN_ANGLE = 30;

    // refresh GUI values manually
    for (var i = 0; i < Object.keys(globals.GUI.__folders).length; i++) {
        var key = Object.keys(globals.GUI.__folders)[i];
        for (var j = 0; j < globals.GUI.__folders[key].__controllers.length; j++) {
            globals.GUI.__folders[key].__controllers[j].updateDisplay();
        }
    }

    globals.controls.update();
}

export function reset_camera() {
    globals.camera.position.set(0, 4, 0); // XYZ            
    globals.camera.lookAt(0, 0, 0);
    globals.camera.rotation.y = Math.PI / 2;
    globals.camera.zoom = 1800;
}

export function update_global_view() {
    for (let line = 0; line < globals.DATA_MOD.length; line++) {
        for (let section = 0; section < globals.DATA_MOD[line].length; section++) {
            for (let vec = 0; vec < globals.DATA_MOD[line][section].length; vec++) {
                //weighted average between two vectors
                let t = globals.GUI_CONTROLS.GLOBAL_MIX;
                let x = (globals.DATA_MOD[line][section][vec].x * t) + (globals.data_vectors2[line][section][vec].x * (1 - t));
                let z = (globals.DATA_MOD[line][section][vec].z * t) + (globals.data_vectors2[line][section][vec].z * (1 - t));
                globals.DATA_VIEW[line][section][vec] = new THREE.Vector3(x, globals.DATA_MOD[line][section][vec].y, z);
            }
        }
    }
}

export function clear_3d_scene() {
    // remove + dispose
    for (let m = 0; m < globals.MODEL_SECTIONS.length; m++) {
        globals.MODEL_SECTIONS[m].geometry.dispose();
        globals.MODEL_SECTIONS[m].material.dispose();
        globals.scene.remove(globals.MODEL_SECTIONS[m]);
    }
    for (let m = 0; m < globals.MODEL_SECTIONS_CONNECTIONS.length; m++) {
        for (let n = 0; n < globals.MODEL_SECTIONS_CONNECTIONS[m].length; n++) {
            globals.MODEL_SECTIONS_CONNECTIONS[m][n].geometry.dispose();
            globals.MODEL_SECTIONS_CONNECTIONS[m][n].material.dispose();
            globals.scene.remove(globals.MODEL_SECTIONS_CONNECTIONS[m][n]);
        }
    }
    globals.renderer.renderLists.dispose();
}

export function update_3d_scene() {

    // trainline sections
    for (let m = 0; m < globals.MODEL_SECTIONS.length; m++) {
        globals.scene.add(globals.MODEL_SECTIONS[m]);
    }

    if (globals.GUI_CONTROLS.GLOBAL_DEBUG_MODE) {
        // section points
        for (let m = 0; m < globals.MODEL_SECTIONS_CONNECTIONS.length; m++) {
            for (let n = 0; n < globals.MODEL_SECTIONS_CONNECTIONS[m].length; n++) {
                globals.scene.add(globals.MODEL_SECTIONS_CONNECTIONS[m][n]);
            }
        }

    }

}

export function addMesh_Edges(geometry, x, y, z) {

    let edges = new THREE.EdgesGeometry(geometry);
    let line = new THREE.LineSegments(edges, globals.MAT_LINE_EDGES);
    line.position.x = x;
    line.position.z = z;
    line.position.y = y;
    globals.scene.add(line);

}

export function addMesh_Point(coordinates, h) {

    // POINT ;
    let mesh = new THREE.Mesh(globals.GEO_POINT, globals.MAT_BASIC_RED);
    mesh.position.x = -coordinates[1];
    mesh.position.z = -coordinates[0];
    mesh.position.y = h;
    globals.scene.add(mesh);

}

export function addMesh_Station(coordinates, h) {

    // POINT ;
    let mesh = new THREE.Mesh(globals.GEO_SPHERE, globals.MAT_BASIC_WHITE);
    mesh.position.x = -coordinates[1];
    mesh.position.z = -coordinates[0];
    mesh.position.y = h;
    globals.scene.add(mesh);
    addMesh_Edges(globals.GEO_SPHERE, mesh.position.x, mesh.position.y, mesh.position.z);

}

export function addMesh_StationNames(coordinates, h, name,) {

    globals.TTFLOADER.load(DBSANS, (json) => {

        // First parse the font.
        let dbsans = globals.FONTLOADER.parse(json);
        // Use parsed font as normal.
        let textGeometry = new TextGeometry(name, { height: 0.0001, size: 0.0048, font: dbsans });
        let textMaterial = globals.MAT_TEXT;
        let textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.x = -coordinates[1];
        textMesh.position.z = -coordinates[0];
        textMesh.position.y = h;
        textMesh.rotateX(Math.PI / 2);
        textMesh.rotateZ(Math.PI);
        textMesh.rotateY(Math.PI);
        globals.scene.add(textMesh);
        globals.stations_pos.push([textMesh.position.x, textMesh.position.y, textMesh.position.z]);
        globals.stations_rot.push([textMesh.rotation.x, textMesh.rotation.y, textMesh.rotation.z]);
        globals.stations_obj.push(textMesh);

    })
}

export function addTrainStations(data) {
    for (let i = 0; i < data.length; i++) {
        if (globals.CITIES.includes(data[i]["city"])) {
            // console.log(data[i]["city"]);
            let coordinates = convert_geocoord_to_xy([data[i]["lng"], data[i]["lat"]], globals.xy_center, globals.map_scale);
            addMesh_Station(coordinates, globals.y_height_default);
            addMesh_StationNames([coordinates[0] - 0.002, coordinates[1] - 0.005], globals.y_height_default + 0.005, data[i]["city"]);
        }
    }
}


