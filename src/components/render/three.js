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

    globals.data_mesh_debug_pnts = models_sections;
    globals.data_mesh_trainlines = models_connections;
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
    for (let m = 0; m < globals.data_mesh_debug_pnts.length; m++) {
        globals.data_mesh_debug_pnts[m].geometry.dispose();
        globals.data_mesh_debug_pnts[m].material.dispose();
        globals.scene.remove(globals.data_mesh_debug_pnts[m]);
    }
    for (let m = 0; m < globals.data_mesh_trainlines.length; m++) {
        for (let n = 0; n < globals.data_mesh_trainlines[m].length; n++) {
            globals.data_mesh_trainlines[m][n].geometry.dispose();
            globals.data_mesh_trainlines[m][n].material.dispose();
            globals.scene.remove(globals.data_mesh_trainlines[m][n]);
        }
    }
    globals.renderer.renderLists.dispose();
}

export function update_3d_scene() {

    // trainline sections
    for (let m = 0; m < globals.data_mesh_debug_pnts.length; m++) {
        globals.scene.add(globals.data_mesh_debug_pnts[m]);
    }

    if (globals.GUI_CONTROLS.GLOBAL_DEBUG_MODE) {
        // section points
        for (let m = 0; m < globals.data_mesh_trainlines.length; m++) {
            for (let n = 0; n < globals.data_mesh_trainlines[m].length; n++) {
                globals.scene.add(globals.data_mesh_trainlines[m][n]);
            }
        }

    }

}

