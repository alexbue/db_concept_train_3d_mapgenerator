/* eslint-disable */


import * as THREE from 'three';
import { globals } from '@/components/globals.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import DBSANS from './../../../public/DB Sans Bold/DB Sans Bold.ttf';
import { SphereGeometry } from 'three';
import * as BufferGeometryUtils from '@/components/render/BufferGeometryUtils';

const scene = globals.scene;

export function show_hide(objects){
    for(let o = 0; o < objects.length; o++){
        objects[o].visible = globals.GUI_CONTROLS.GLOBAL_DEBUG_MODE;
    }
}

export function update_render() {

    let data = globals.data_tl_trainnet_view;

    let mesh_trainlines = [];
    let mesh_debug_pnts = [];

    dispose();   

    [mesh_trainlines, mesh_debug_pnts] = create_meshes(data);

    globals.data_mesh_trainlines = mesh_trainlines;
    globals.data_mesh_debug_pnts = mesh_debug_pnts;

    render();
}


function render(){

    let debug_mode = globals.GUI_CONTROLS.GLOBAL_DEBUG_MODE;

    const a = globals.data_mesh_trainlines;
    const b = globals.data_mesh_debug_pnts;

    if(a.length != 0) for (let m in a) scene.add(a[m]);
    if(b.length != 0 && debug_mode ) for (let m in b) scene.add(b[m]);
}


function dispose(){

    const a = globals.data_mesh_trainlines;
    const b = globals.data_mesh_debug_pnts;

    if(a.length != 0) {
        for (let m in a) {
            a[m].geometry.dispose();
            a[m].material.dispose();
            scene.remove(a[m]);
            }
        }

    if(b.length != 0) {
        for ( let m in b ) {
            b[m].geometry.dispose();
            b[m].material.dispose();
            scene.remove(b[m]);
            }
        }

    globals.renderer.renderLists.dispose();
}


// single draw calls 

function create_meshes(data) {

    let connections = [];
    let sections = [];

    for (let tl = 0; tl < data.length; tl++) { // trainline

        for (let sec = 0; sec < data[tl].length; sec++) { // [station a -> station b] as array: [a, p, p, , ... , b]]

            let line_section = create_tl_line(data[tl][sec], tl);
            sections.push(line_section);

            for (let vert = 0; vert < data[tl][sec].length; vert++) {
                
                let con = create_debug_point(data[tl][sec][vert], tl);
                connections.push(con);
            }
        }
    }
    return [sections, connections];
}


const y_height_default = globals.y_height_default;
const geo_station_sphere = globals.geo_station_sphere;
const mat_colormap = globals.mat_colormap;

function create_debug_point(vertex, col_idx) {

    let mesh = new THREE.Mesh(geo_station_sphere, mat_colormap[col_idx]);
    mesh.position.x = vertex.y;
    mesh.position.y = y_height_default;
    mesh.position.z = vertex.x;

    return mesh;
}

function create_tl_line(vertices, col_idx) {

    let vertices_3 = [];

    for (let v in vertices) {
        vertices_3.push(new THREE.Vector3(vertices[v].y, y_height_default, vertices[v].x));
    }
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(vertices_3), mat_colormap[col_idx]);
}


































export function render_stations() {

    let data = globals.data_tl_stations;
    for (let station in data) create_station_mesh( data[station].vec2, data[station].city );
}


// const y_height_default = globals.y_height_default;
// const scene = globals.scene;

const mat_stations = globals.mat_stations;
const stations_pos = globals.stations_pos;
const stations_rot = globals.stations_rot;
const stations_obj = globals.stations_obj;

function create_station_mesh(vertex, station_text) {

    globals.TTFLOADER.load(DBSANS, (json) => {

        let dbsans = globals.FONTLOADER.parse(json);

        let textGeometry = new TextGeometry(station_text, { height: 0.0001, size: 0.0048, font: dbsans });
        let textMaterial = mat_stations;
        let text = new THREE.Mesh(textGeometry, textMaterial);

        text.position.x = vertex.y;
        text.position.y = y_height_default;
        text.position.z = vertex.x;

        text.rotateX(Math.PI / 2);
        text.rotateZ(Math.PI);
        text.rotateY(Math.PI);
        
        scene.add(text);

        stations_pos.push([text.position.x, text.position.y, text.position.z]);
        stations_rot.push([text.rotation.x, text.rotation.y, text.rotation.z]);
        stations_obj.push(text);
    })
}

