// import * as dat from 'dat.gui';
// import Stats from 'three/examples/jsm/libs/stats.module';
import * as dat from 'dat.gui';
import { globals } from '@/components/globals.js';
import { show_hide } from '@/components/trainnet/render.js';


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
    folder.add(globals.GUI_CONTROLS, 'middle_section_offset_x', -0.01, 0.01, 0.001).onChange(() => { globals.update(true) });
    folder.add(globals.GUI_CONTROLS, 'middle_section_offset_y', -0.01, 0.01, 0.001).onChange(() => { globals.update(true) });
    folder.add(globals.GUI_CONTROLS, 'io_section_offset', 0, 0.01, 0.001).name("station i/o offset ").onChange(() => { globals.update(true) });
    // folder.add(globals.GUI_CONTROLS, 'io_section_distance', 0, 0.03, 0.001).name("station io distance").onChange(() => { globals.update(true) });

    folder.open();

    let folder2 = globals.GUI.addFolder("station modifier");
    folder2.add(globals.GUI_CONTROLS, 'station_sectors', 1, 32, 1).name('STATION SECTORS').onChange(() => { globals.update(true); console.log(globals.GUI_CONTROLS.station_sectors); });

    folder2.add(globals.GUI_CONTROLS, 'station_sector_offset', 0, 1, 0.01).name('SECTOR OFFSET').onChange(() => { 
        globals.update(true);  
      });

    folder2.add(globals.GUI_INFO_RENDERER, "INFO_RENDERER").name("RENDERER INFO").onChange(() => {  renderer_info_log() });
    folder2.open();

    let folder3 = globals.GUI.addFolder("globals");
    folder3.add(globals.GUI_CONTROLS, 'GLOBAL_MIX', 0, 1).name('GLOBAL MIX').onChange(() => { globals.update() });
    folder3.open();

    let folder4 = globals.GUI.addFolder("debug");
    folder4.add(globals.GUI_CONTROLS, "GLOBAL_GRID_ON").name("SHOW GRID").onChange(() => {  globals.GRIDHELPER.visible = globals.GUI_CONTROLS.GLOBAL_GRID_ON; });
    folder4.add(globals.GUI_CONTROLS, "GLOBAL_AXIS_ON").name("SHOW AXIS").onChange(() => {  globals.axes_helper.visible = globals.GUI_CONTROLS.GLOBAL_AXIS_ON; });
    folder4.add(globals.GUI_CONTROLS, "GLOBAL_DEBUG_ON").name("DEBUG MODE").onChange(() => { 

        globals.update(); 
        show_hide(globals.data_mesh_debug_pnts);
        });

    folder4.add(globals.GUI_RESET, "GUI_RESET").name("RESET MODIFIER").onChange(() => { reset_gui(); globals.update(true) });
    folder4.open();

    let folder5 = globals.GUI.addFolder("camera");
    folder5.add(globals.GUI_RESET_CAMERA, "GUI_RESET").name("RESET CAMERA").onChange(() => { reset_camera(); });
    folder5.open();

}

function reset_gui(){

     // station build modifier
     globals.GUI_CONTROLS.station_sectors = 8;
     globals.GUI_CONTROLS.station_sector_offset = 0;

     // processing
     globals.GUI_CONTROLS.middle_section_offset_x = 0.000;
     globals.GUI_CONTROLS.middle_section_offset_y = 0.000;

     globals.GUI_CONTROLS.io_section_offset = 0.005;
     globals.GUI_CONTROLS.io_section_distance = 0.015;

     // globals
     globals.GUI_CONTROLS.GLOBAL_MIX = 1;

     // debug
     globals.GUI_CONTROLS.GLOBAL_DEBUG_ON = true;
     globals.GUI_CONTROLS.GLOBAL_GRID_ON = true;
     globals.GUI_CONTROLS.GLOBAL_AXIS_ON = false;

     // old 
     globals.GUI_CONTROLS.IN_OUT_DISTANCE = 0.03;
     globals.GUI_CONTROLS.IN_OUT_ANGLE = 45;
     globals.GUI_CONTROLS.IN_OUT_ALIGNMENT_DISTANCE = 0.004;
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



