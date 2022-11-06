/* eslint-disable */

// import * as THREE from 'three';
// import { globals }from '@/components/globals.js';
import { interpolate_vec2, get_quadrant, rotate_by_quadrant, weighted_average, shift_vector_by_offset }from '@/components/utils/utils.js';
import { globals } from '../globals';

const data_tl_trainnet = globals.data_tl_trainnet;
const data_tl_stations = globals.data_tl_stations;


export function init_data(){

    globals.data_tl_trainnet = subdivide_data(globals.data_tl_trainnet, 5)
}

export function build_data(){

    globals.data_tl_trainnet_build = clone_data(globals.data_tl_trainnet);
    unpack_sections_with_stations(globals.data_tl_trainnet_build, globals.data_tl_stations, set_station_sector_rails);  
}

export function process_data(){

    let data = globals.data_tl_trainnet_build;  
    let _data = clone_data(data);

    _data = process_sections(data, _data, shift_sections);  
    _data = process_sections(_data, _data, straighten_sections);  

    globals.data_tl_trainnet_process = _data;
    update_view_data();
}

function update_view_data(){

    if (globals.GUI_CONTROLS.GLOBAL_MIX == 1) {

        globals.data_tl_trainnet_view = globals.data_tl_trainnet_process;
    }
    else {
        
        let t = globals.GUI_CONTROLS.GLOBAL_MIX; // t for weighted average between two vectors 

        let data_a = globals.data_tl_trainnet;   
        let data_b = globals.data_tl_trainnet_process; 

        let _data = clone_data(data_a);

        for (let tl = 0; tl < _data.length; tl++) {

            for (let sec = 0; sec < _data[tl].length; sec++) {

                for (let vec = 0; vec < _data[tl][sec].length; vec++) {     

                    _data[tl][sec][vec] = weighted_average(data_a[tl][sec][vec], data_b[tl][sec][vec], t);
                }
            }
        }
        globals.data_tl_trainnet_view = _data;
    }
}

function clone_data(data){ // 5x faster than structuredClone() :)

    let _data = [];

    for (let tl = 0; tl < data.length; tl++) { 

        let _trainline = [];

        for (let sec = 0; sec < data[tl].length; sec++) {

            let _section = [];

            for (let vertex = 0; vertex < data[tl][sec].length; vertex++) {

                _section.push(data[tl][sec][vertex].clone());
            }
            _trainline.push(_section);
        }
        _data.push(_trainline);
    }
    return _data;
}


// unpack vertices from data arrays 

function process_sections(data, _data, func){

    for (let tl = 0; tl < data.length; tl++) {

        for (let sec = 0; sec < data[tl].length; sec++) {

            func(data, _data, tl, sec);
        }
    }
    return _data;
}

function unpack_sections_with_stations(data, stations, func){

    for (let tl = 0; tl < data.length; tl++) {

        for (let section = 0; section < data[tl].length; section++) {

            func(data[tl][section], section, stations, tl);
        }
    }
}


// process vertices

function subdivide_data(data, divisions){    

    let _data = [];

    for (let tl = 0; tl < data.length; tl++) {

        let _updates = [];

        for (let sec = 0; sec < data[tl].length-1; sec++) { 

            // division +2 as we want to keep end and start vector always fixed (non-modified) in future
            _updates.push(interpolate_vec2(data[tl][sec], data[tl][sec + 1], divisions+2));  
        }
        _data.push(_updates);
    }
    return _data;
}


function shift_sections(data, _data, tl, sec){ // set offset for middle section 

    for (let vert = 2; vert < data[tl][sec].length-2; vert++ ){

        _data[tl][sec][vert] = shift_vector_by_offset(data[tl][sec][vert]); 
    }
}

function straighten_sections(data, _data, tl, sec){   // straighten middle section 

    let mid_sec_len = data[tl][sec].length - 4; 
    let divisions = mid_sec_len -1;
    
    let _section = interpolate_vec2(data[tl][sec][2], data[tl][sec][data[tl][sec].length -3], divisions);

    for (let vert = 0; vert < _section.length; vert++ ){
        _data[tl][sec][vert+2] = _section[vert];
    }
}


function set_station_sector_rails(section, section_id, stations, traintl_idx){

    for (let s in stations){

        if ( (stations[s].vec2.equals(section[0])) ){ // get station name by vector-coordinates 

            let ax = section[0];
            let pt = section[1];

            pt = rotate_by_quadrant(ax, pt);
            section[2] = pt.clone();
        }
        else if (stations[s].vec2.equals(section[section.length-1])){ // get station name by vector-coordinates 

            let ax = section[section.length-1];
            let pt = section[section.length-2];

            pt = rotate_by_quadrant(ax, pt);
            section[section.length-3] = pt.clone();
        }
    }
 }


// export function write_station_quadrants(trainlines, station){


//     stations.push([cities[station]["city"], vec2]);            

//     for (let line = 0; line < trainlines.length; line++) {

//         for (let section = 0; section < trainlines[line].length; section++) {

//             for(let s = 0; s < stations.length; s++){

//                 let station = occ[stations[s][0]];
//                 let station_vert = stations[s][1];
        
//                 if (s == 0) { // check outgoing connection
        
//                     set_quadrants(station_vert, stations[s+1][1], station);        
//                 }
//                 else if (s == stations.length-1) { // check incoming connection
        
//                     set_quadrants(station_vert, stations[s-1][1], station);
//                 } 
//                 else { //  check in+out connection
        
//                     set_quadrants(station_vert, stations[s+1][1], station);  
//                     set_quadrants(station_vert, stations[s-1][1], station);
//                 }
//             }  

//         }
//     }
// }

// function set_quadrants(a, b, station){

//     station.quadrants[get_quadrant(a, b)] +=1;
//     station.q_current = station.quadrants;
// }




/* 

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

*/


