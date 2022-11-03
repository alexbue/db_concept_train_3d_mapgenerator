import { globals } from '@/components/globals.js';
import * as THREE from 'three';
import { MapControls } from "three/examples/jsm/controls/OrbitControls";
import { TTFLoader } from "three/examples/jsm/loaders/TTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";

export function init_scene() {

    globals.scene.background = globals.COL_OCEAN;

    globals.FONTLOADER = new FontLoader();
    globals.TTFLOADER = new TTFLoader();

    let container = document.getElementById('container');
    globals.loader = document.getElementById('loader');
    // this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 100);
    // this.camera.position.set(8, 4, 0);

    // initial bird view
    globals.camera = new THREE.OrthographicCamera(window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, 1, 1000);
    globals.camera.rotation.y = Math.PI / 2;
    globals.camera.position.set(0, 4, 0); // XYZ
    globals.camera.zoom = 1800;
    globals.camera.lookAt(0, 0, 0);

    // this.camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 100);

    // axis helper
    globals.axes_helper = new THREE.AxesHelper( 0.1 );
    globals.axes_helper.position.y += 0.0202;
    globals.scene.add( globals.axes_helper );

    globals.GRIDHELPER = new THREE.GridHelper(4, 40, new THREE.Color(0xC0C0C0), new THREE.Color(0xC0C0C0));
    globals.GRIDHELPER.position.y += 0.02;
    globals.scene.add(globals.GRIDHELPER);

    globals.scene.fog = new THREE.Fog(globals.COL_OCEAN, 0.001, 12);


    let light0 = new THREE.AmbientLight(0xfafafa, 0.005);
    let light1 = new THREE.PointLight(0xfafafa, 0.005);
    let light2 = new THREE.PointLight(0xfafafa, 0.005);

    light1.position.set(200, 90, 40);
    light2.position.set(200, 90, 40);

    globals.scene.add(light0);
    globals.scene.add(light1);
    globals.scene.add(light2);

    let AA = true;
    // let pixelRatio = window.devicePixelRatio;    
    // if (pixelRatio > 1) { AA = false }

    globals.renderer = new THREE.WebGLRenderer({ antialias: AA, powerPreference: "high-performance" });
    globals.renderer.setPixelRatio(window.devicePixelRatio);
    globals.renderer.setSize(window.innerWidth, window.innerHeight);
    globals.camera.updateProjectionMatrix();

    container.appendChild(globals.renderer.domElement);

    globals.controls = new MapControls(globals.camera, globals.renderer.domElement);
    globals.controls.enableDamping = true;
    globals.controls.dampingFactor = 0.25;
    globals.controls.screenSpacePanning = false;
    globals.controls.maxDistance = 80;
}

export function loader_hide(){
    globals.loader.style.visibility = "hidden";
}


export function renderer_info_log(){
    console.log("Scene polycount:", globals.renderer.info.render.triangles);
    console.log("Active Drawcalls:", globals.renderer.info.render.calls);
    console.log("Textures in Memory", globals.renderer.info.memory.textures);
    console.log("Geometries in Memory", globals.renderer.info.memory.geometries);
}

export function reset_camera(){            
    globals.camera.position.set(0, 4, 0); // XYZ            
    globals.camera.lookAt(0, 0, 0);
    globals.camera.rotation.y = Math.PI / 2;
    globals.camera.zoom = 1800;
}
