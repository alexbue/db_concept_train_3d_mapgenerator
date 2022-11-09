/* eslint-disable */

// import * as THREE from 'three';
// import { globals }from '@/components/globals.js';

import { 
    interpolate_vec2, 
    get_quadrant, get_angle, 
    rotate_by_quadrant, 
    weighted_average, 
    shift_vector_by_offset_x, 
    shift_vector_by_offset_y, 
    shift_vector_ordered_by_offset,
    shift_vector_by_offset_vec2,
    update_distance2,
 } from '@/components/utils/utils.js';

import { globals } from '../globals';
import { get_station_by_vector, 
    insert_sector_angle, 
    get_sector_info,
    rebuild_stations,
} from '@/components/trainnet/data';


export function init_data(){
    
    globals.data_tl_trainnet = subdivide_data(globals.data_tl_trainnet, 5)
}

export function build_data(){

    globals.data_tl_trainnet_build = clone_data(globals.data_tl_trainnet);
    rebuild_stations();


    build_station_sectors( globals.data_tl_trainnet_build );
    rot_station_sectors(   globals.data_tl_trainnet_build );   
    }

export function process_data(){

    let  data = clone_data(globals.data_tl_trainnet);
    let _data = clone_data(globals.data_tl_trainnet_build);  

    _data = ordered_shift_io_sections(data, _data);

    _data = process_sections(_data, _data, shift_station_entry_distance); 
    _data = process_sections(_data, _data, shift_middle_sections);  
    _data = process_sections(_data, _data, straighten__middle_sections);  
   
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


function ordered_shift_io_sections(d, _d){ // set ordered alignment offset for incoming/outgoing sections of stations

    let  data = clone_data(d);
    let _data = clone_data(_d);

    for (let tl = 0; tl < data.length; tl++) {

        let _order_sec = null;

        for (let sec = 0; sec < data[tl].length; sec++) {

            let len = data[tl][sec].length;

            // station a 
            let _off = null;
            [ _data[tl][sec][1], _off, _order_sec ] = ordered_shift(data[tl][sec][0], _data[tl][sec][0], data[tl][sec][1], _data[tl][sec][1], false);
            _data[tl][sec][2].add(_off);
            
            // station b
            [ _data[tl][sec][len-2], _off, _order_sec] = ordered_shift(data[tl][sec][len-1], _data[tl][sec][len-1], data[tl][sec][len-2], _data[tl][sec][len-2], true);
            _data[tl][sec][len-3].add(_off);
        }
    }
    return _data;  
}

function ordered_shift(ax_vec, _ax_vec, p_vec, _p_vec, reverse=false){

    let _p = null, _off = null, _order = null, _sector_length = null;

    let angle =       get_angle(ax_vec, p_vec);
    let quadrant = get_quadrant(ax_vec, p_vec);
    
    [_order, _sector_length] = get_sector_info(ax_vec, quadrant, angle, reverse);
    _order += 1;

    [ _p, _off ] = shift_vector_ordered_by_offset(_ax_vec, _p_vec, _order, _sector_length);
    return [ _p, _off, _order];
}


function build_station_sectors(data){
    
    for (let tl = 0; tl < data.length; tl++) {

        for (let sec = 0; sec < data[tl].length; sec++) {

            let station_a = data[tl][sec][0];
            let station_b = data[tl][sec][data[tl][sec].length-1];

            // station a 
            let a_angle = get_angle(station_a, station_b);
            let a_quadrant = get_quadrant(station_a, station_b);
            insert_sector_angle(a_quadrant, a_angle, station_a);

             // station b 
            let b_angle = get_angle(station_b, station_a);
            let b_quadrant = get_quadrant(station_b, station_a);
            insert_sector_angle(b_quadrant, b_angle, station_b);
        }
    }
 }

 function rot_station_sectors(data){

    for (let tl = 0; tl < data.length; tl++) {

        for (let sec = 0; sec < data[tl].length; sec++) {

            let len = data[tl][sec].length;

            // station a 
            let station_a = data[tl][sec][0];
            let point_a =   data[tl][sec][1];

            data[tl][sec][1] = rotate_by_quadrant(station_a , point_a)
            data[tl][sec][2] = rotate_by_quadrant(station_a , point_a)

            //station b 
            let station_b  = data[tl][sec][len-1];
            let point_b =    data[tl][sec][len-2];     

            data[tl][sec][len-2] = rotate_by_quadrant(station_b, point_b)
            data[tl][sec][len-3] = rotate_by_quadrant(station_b, point_b);
        }
    }
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

function shift_station_entry_distance(data, _data, tl, sec){ // set offset for middle section 

    let len = _data[tl][sec].length;

    let p1 = _data[tl][sec][1]
    let p2 = _data[tl][sec][2]
    
    _data[tl][sec][2] = update_distance2(p1, p2, globals.GUI_CONTROLS.entry_section_distance);

    p1 = _data[tl][sec][len-2]
    p2 = _data[tl][sec][len-3]

    _data[tl][sec][len-3] = update_distance2(p1, p2, globals.GUI_CONTROLS.entry_section_distance);
}

function shift_middle_sections(data, _data, tl, sec){ // set offset for middle section 

    for (let vert = 2; vert < data[tl][sec].length-2; vert++ ){

        _data[tl][sec][vert] = shift_vector_by_offset_x( data[tl][sec][vert]); 
        _data[tl][sec][vert] = shift_vector_by_offset_y(_data[tl][sec][vert]); 
    }
}

function straighten__middle_sections(data, _data, tl, sec){   // straighten middle section 

    let mid_sec_len = data[tl][sec].length - 4; 
    let divisions = mid_sec_len -1;

    let _section = interpolate_vec2(data[tl][sec][2], data[tl][sec][data[tl][sec].length -3], divisions);

    for (let vert = 0; vert < _section.length; vert++ ){

        _data[tl][sec][vert+2] = _section[vert];
    }
}





