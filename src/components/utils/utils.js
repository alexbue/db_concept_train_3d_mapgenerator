import * as THREE from 'three';
import * as GEOLIB from "geolib";
import { globals }from '@/components/globals.js';



export function convert_geocoord_to_xy(pos) { // alogorithm for normalizing geojson point coordinates with consideration distortion from map projection 

            const xy_center = globals.xy_center;
            const map_scale = globals.map_scale;

            // get gps distance 
            let dis = GEOLIB.getDistance(pos, xy_center);

            // get bearing angle
            let bearing = GEOLIB.getRhumbLineBearing(pos, xy_center);

            // calculate X by xy_center.x + distance * cos(rad)
            // calculate Y by xy_center.y + distance * sind(rad)
            let x = xy_center[0] + (dis * Math.cos(bearing * Math.PI / 180));
            let y = xy_center[1] + (dis * Math.sin(bearing * Math.PI / 180));

            x /= map_scale;
            y /= map_scale;

            return new THREE.Vector2(-x, y);
        }


export function clamp(num, min, max) { 

    return Math.min(Math.max(num, min), max); 
}


export function get_angle(a, b) { 

    return -Math.atan2((b.x - a.x), (b.y - a.y)) * 180 / Math.PI; 
}


export function get_quadrant(a, b){
    let current = get_angle(a, b);
    if (current < 0) current += 360;
    return Math.floor(current / 90);
}


export function update_distance(p1, p2, distance=globals.GUI_CONTROLS.IN_OUT_DISTANCE) {

    let station = new THREE.Vector2(p1.x, p1.z);
    let point = new THREE.Vector2(p2.x, p2.z);
    point = point.sub(station).normalize().multiplyScalar(distance).add(station);
    return new THREE.Vector3(point.x, p1.y, point.y);
}


export function rotatePointAround(p1, p2, angle=globals.GUI_CONTROLS.IN_OUT_ANGLE) {

    let axis = new THREE.Vector2(p1.x, p1.z);
    let point = new THREE.Vector2(p2.x, p2.z);
    let current = get_angle(axis, point);
    let target = angle + (Math.floor(current / 90) * 90); // unreadable, but elegant conditional switch-statement ;)
    let r = point.rotateAround(axis, -THREE.MathUtils.degToRad(target - current));
    return new THREE.Vector3(r.x, p1.y, r.y);
}


export function geometry_rotate_to_scene(geometry){

    geometry.rotateX(Math.PI / 2);
    geometry.rotateZ(Math.PI);
    geometry.rotateY(-Math.PI / 2);
}


export function interpolate_vec2(a, b, divisions){  

    let arr = [];
    arr.push(a);
    for(let div = 1; div < divisions; div++ ){
        let fac = ( 1 / divisions ) * (div)
        let l = a.clone().lerp(b, fac);
        arr.push(l);
    }
    arr.push(b);
    return arr
}


// export function three_create_axis_helper(size){

// };