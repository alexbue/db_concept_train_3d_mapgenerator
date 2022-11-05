import * as THREE from 'three';
// import * as dat from 'dat.gui';
// import { MapControls } from "three/examples/jsm/controls/OrbitControls";
// import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
// import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
// import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import Stats from 'three/examples/jsm/libs/stats.module'

// import DBSANS from './../../public/DB Sans Bold/DB Sans Bold.ttf';

export const globals = {

    loader: null,

    // new 

    
    update_data: null,

    data_tl_trainnet: null,
    data_tl_trainnet_view: null,
    data_tl_stations: {},   
   
    data_mesh_debug_pnts: [],
    data_mesh_trainlines: [],

    stations_obj: [],
    stations_rot: [],
    stations_pos: [],

    mat_stations: new THREE.MeshBasicMaterial({ color: 0x000000 }), // white

    mat_map_1:  new THREE.MeshBasicMaterial({ color: 0xF8F8F8}), // white or black
    mat_map_2: new THREE.MeshBasicMaterial({ color: 0xCCFF0CC}), // green
    mat_map_edges: new THREE.LineBasicMaterial({ color: new THREE.Color(0x97B49C) }), // dark green 

    geo_station_sphere: new THREE.SphereGeometry(0.002, 8, 4),

    axes_helper: null,
    
    



    GUI: null,

    // GUI CONTROLS:
    GUI_CONTROLS: new function () {

        // station modifier
        this.station_sectors = 16;

        // globals
        this.GLOBAL_MIX = 1;

        // debug
        this.GLOBAL_DEBUG_MODE = true;
        this.GLOBAL_GRID_MODE = true;
        this.GLOBAL_AXIS_MODE = true;

        this.IN_OUT_DISTANCE = 0.03;
        this.IN_OUT_ANGLE = 45;
        this.IN_OUT_ALIGNMENT_DISTANCE = 0.004;
        this.IN_OUT_ALIGN_ANGLE = 30;
    },

    GUI_INFO_RENDERER: new function(){
        this.INFO_RENDERER = function(){
        };
    },

    GUI_RESET: new function(){
        this.GUI_RESET = function(){
        };
    },

    GUI_RESET_CAMERA: new function(){
        this.GUI_RESET = function(){
        };
    },
    

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
        ["München", "Nürnberg", "Leipzig", "Berlin", "Hamburg"],
        ["München", "Stuttgart", "Frankfurt", "Leipzig"],
        ["München", "Nürnberg", "Frankfurt"],
        ["München", "Stuttgart", "Frankfurt"],
        ["München", "Stuttgart", "Frankfurt", "Leipzig", "Hamburg"],
        ["München", "Nürnberg", "Frankfurt", "Hamburg"],
        ["München", "Stuttgart", "Frankfurt", "Hamburg"],
        ["München", "Leipzig", "Hamburg"],
        ["München", "Stuttgart", "Leipzig"],
        ["München", "Leipzig"],
        ["München", "Nürnberg", "Leipzig", "Berlin", "Hamburg"],
        ["München", "Stuttgart", "Frankfurt", "Leipzig"],
        ["München", "Nürnberg", "Frankfurt"],
        ["München", "Stuttgart", "Frankfurt"],
        ["München", "Stuttgart", "Frankfurt", "Leipzig", "Hamburg"],
        ["München", "Nürnberg", "Frankfurt", "Hamburg"],
        ["München", "Stuttgart", "Frankfurt", "Hamburg"],
        ["München", "Leipzig", "Hamburg"],
    ],




    // old 

    FPS: new Stats(),
    RAM: new Stats(),
    MS: new Stats(),

   

    // 3D OBJECTS

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


    GEO_POINT: new THREE.BoxGeometry(0.005, 0.005, 0.005),
 
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

    new THREE.LineBasicMaterial({ color:0x83AF9B, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xECD078, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xD95B43, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xC02942, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x542437, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x53777A, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x556270, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x4ECDC4, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xC7F464, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xFF6B6B, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xC44D58, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x774F38, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xE08E79, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xF1D4AF, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xECE5CE, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xC5E0DC, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xE8DDCB, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xCDB380, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x036564, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x033649, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x490A3D, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xBD1550, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xE97F02, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xF8CA00, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x8A9B0F, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0x69D2E7, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xA7DBD8, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xE0E4CC, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xF38630, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xFA6900, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xFE4365, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xFC9D9A, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xF9CDAD, linewidth: 3 }),
    new THREE.LineBasicMaterial({ color:0xC8C8A9, linewidth: 3 }),
    
        ],


    MAT_BASIC_BLACK: new THREE.MeshBasicMaterial({ color: 0x000000 }),
    MAT_BASIC_RED: new THREE.MeshBasicMaterial({ color: 0xff0000 }),
    MAT_BASIC_WHITE: new THREE.MeshBasicMaterial({ color: 0xFAF8F6 }),
    // MAT_TEXT: new THREE.MeshBasicMaterial({ color: 0x484848 }),

    MAT_TEXT: new THREE.MeshBasicMaterial({ color: 0xff0000 }),

    MAT_LINE_EDGES: new THREE.LineBasicMaterial({ color: new THREE.Color(0x97B49C) }),

    MAT_NAME_OPAQUE: new THREE.MeshBasicMaterial({ color: 0x484848, transparent: true, opacity: 1 }),



} 