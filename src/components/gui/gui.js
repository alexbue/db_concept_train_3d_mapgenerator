// import * as dat from 'dat.gui';
// import Stats from 'three/examples/jsm/libs/stats.module';
import * as dat from 'dat.gui';
import { globals } from '@/components/globals.js';


export function init_gui() {

    try{
        globals.GUI.remove();
        globals.GUI.destroy(); // for development, avoid vue.js adding additional guis to screen, if rendered before
        console.log("removed previous gui");
    }
    catch{
        console.log("no gui found to remove");
    }  

    globals.GUI = new dat.GUI({ width: 400 })

    // STATS
    globals.FPS.showPanel(0);
    globals.RAM.showPanel(2);
    globals.MS.showPanel(1);
    globals.RAM.domElement.style.cssText = 'position:absolute;top:0px;left:0px;';
    globals.FPS.domElement.style.cssText = 'position:absolute;top:0px;left:80px;';
    globals.MS.domElement.style.cssText = 'position:absolute;top:0px;left:160px;';
    document.body.appendChild(globals.RAM.domElement);
    document.body.appendChild(globals.FPS.domElement);
    document.body.appendChild(globals.MS.domElement);

    // GUI
    let folder = globals.GUI.addFolder("modifier");

    folder.add(globals.GUI_CONTROLS, 'IN_OUT_DISTANCE', 0.005, 0.04).onChange(() => { globals.update() });
    folder.add(globals.GUI_CONTROLS, 'IN_OUT_ANGLE', 1, 89).onChange(() => { globals.update() });
    folder.add(globals.GUI_CONTROLS, 'IN_OUT_ALIGNMENT_DISTANCE', 0.004, 0.02).onChange(() => { globals.update() });
    folder.add(globals.GUI_CONTROLS, 'IN_OUT_ALIGN_ANGLE', 1, 89).onChange(() => { globals.update() });
    folder.open();

    let folder2 = globals.GUI.addFolder("station modifier");
    folder2.add(globals.GUI_CONTROLS, 'station_sectors', 1, 32).name('STATION SECTORS').onChange(() => { globals.update(true);  });
    folder2.add(globals.GUI_INFO_RENDERER, "INFO_RENDERER").name("RENDERER INFO").onChange(() => {  renderer_info_log() });
    folder2.open();

    let folder3 = globals.GUI.addFolder("globals");
    folder3.add(globals.GUI_CONTROLS, 'GLOBAL_MIX', 0, 1).name('GLOBAL MIX').onChange(() => { globals.update() });
    folder3.open();

    let folder4 = globals.GUI.addFolder("debug");
    folder4.add(globals.GUI_CONTROLS, "GLOBAL_GRID_MODE").name("SHOW GRID").onChange(() => {  globals.GRIDHELPER.visible = globals.GUI_CONTROLS.GLOBAL_GRID_MODE; });
    folder4.add(globals.GUI_CONTROLS, "GLOBAL_AXIS_MODE").name("SHOW AXIS").onChange(() => {  globals.axes_helper.visible = globals.GUI_CONTROLS.GLOBAL_AXIS_MODE; });
    folder4.add(globals.GUI_CONTROLS, "GLOBAL_DEBUG_MODE").name("DEBUG MODE").onChange(() => { globals.update(); console.log(globals.GUI_CONTROLS.GLOBAL_DEBUG_MODE); });
    folder4.add(globals.GUI_RESET, "GUI_RESET").name("RESET MODIFIER").onChange(() => { reset_gui(); globals.update() });
    folder4.open();

    let folder5 = globals.GUI.addFolder("camera");
    folder5.add(globals.GUI_RESET_CAMERA, "GUI_RESET").name("RESET CAMERA").onChange(() => { reset_camera(); });
    folder5.open();

}

export function reset_gui(){

    globals.GUI_CONTROLS.GLOBAL_MIX = 1; 
    globals.GUI_CONTROLS.IN_OUT_DISTANCE = 0.03;
    globals.GUI_CONTROLS.IN_OUT_ANGLE = 45;
    globals.GUI_CONTROLS.IN_OUT_ALIGNMENT_DISTANCE = 0.002;
    globals.GUI_CONTROLS.IN_OUT_ALIGN_ANGLE = 30;
    
    // refresh GUI values manually
    for (var i = 0; i < Object.keys(globals.GUI.__folders).length; i++) {
        var key = Object.keys(globals.GUI.__folders)[i];
        for (var j = 0; j < globals.GUI.__folders[key].__controllers.length; j++ )
        {
            globals.GUI.__folders[key].__controllers[j].updateDisplay();
        }
    }

    globals.controls.update();
}

function reset_camera() {

    globals.camera.position.set(0, 4, 0); // XYZ            
    globals.camera.lookAt(0, 0, 0);
    globals.camera.rotation.y = Math.PI / 2;
    globals.camera.zoom = 1800;
}

export function renderer_info_log(){
    console.log("Scene polycount:", globals.renderer.info.render.triangles);
    console.log("Active Drawcalls:", globals.renderer.info.render.calls);
    console.log("Textures in Memory", globals.renderer.info.memory.textures);
    console.log("Geometries in Memory", globals.renderer.info.memory.geometries);
}


export function loader_hide(){
    globals.loader.style.visibility = "hidden";
}



