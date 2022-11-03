// import * as THREE from 'three';
// import { globals }from '@/components/globals.js';
import { interpolate_vec2 }from '@/components/utils/utils.js';


export function preprocess_data(data){

    let _data = subdivide(data, 5);
    return _data;
}


function subdivide(data, divisions){
    
    let _data = [];
    for (let tl = 0; tl < data.length; tl++) {
        let updates = [];
        for (let sec = 0; sec < data[tl].length-1; sec++) { 
            // division +2 as we want to keep end and start vector always fixed (non-modified) in future
            updates.push(interpolate_vec2(data[tl][sec], data[tl][sec + 1], divisions+2));  
        }
        _data.push(updates);
    }
    
    return _data;
}




