import * as THREE from 'three';
import * as GEOLIB from "geolib";
import { globals }from '@/components/globals.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry';
import DBSANS from './../../../public/DB Sans Bold/DB Sans Bold.ttf';

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

    return -Math.atan2((b.x - a.x), (b.y - a.y)) * 180 / Math.PI; // (b.x - a.x), (b.y - a.y) swapped! 
}

export function get_quadrant(a, b, sectors=globals.GUI_CONTROLS.station_sectors){

    let sector_angle = 360 / sectors;
    let current = get_angle(a, b);
    if (current < 0) current += 360;
    return Math.floor(current / sector_angle);
}

export function rotate_by_quadrant(a, b, sectors=globals.GUI_CONTROLS.station_sectors) {
    let sector_angle = 360 / sectors;
    let offset = sector_angle * globals.GUI_CONTROLS.station_sector_offset;
    let current = get_angle(a, b);
    let target = sector_angle + (get_quadrant(a, b) * sector_angle) - offset;
    let rotated = b.rotateAround(a, THREE.MathUtils.degToRad(target - current));
    return rotated;
}


export function shift_vector_by_offset(a){   

    return a.clone().add(new THREE.Vector2(0, globals.GUI_CONTROLS.section_offset));
}

export function update_distance(p1, p2, distance=globals.GUI_CONTROLS.IN_OUT_DISTANCE) {

    let station = new THREE.Vector2(p1.x, p1.z);
    let point = new THREE.Vector2(p2.x, p2.z);
    point = point.sub(station).normalize().multiplyScalar(distance).add(station);
    return new THREE.Vector3(point.x, p1.y, point.y);
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

export function weighted_average(b, a, t){

    let _x = (a.x * t) + (b.x * (1 - t));
    let _y = (a.y * t) + (b.y * (1 - t));

    return new THREE.Vector2(_x, _y);
}

export function three_create_text(text, pos_vec2, callback=function(){console.log("");}){

    globals.TTFLOADER.load(DBSANS, (json) => {

        // First parse the font.
        let dbsans = globals.FONTLOADER.parse(json);

        // Use parsed font as normal.
        let textGeometry = new TextGeometry(text, { height: 0.0001, size: 0.0048, font: dbsans });
        let textMesh = new THREE.Mesh(textGeometry, globals.MAT_NAME_OPAQUE);
    
        textMesh.position.x = -pos_vec2.y;
        textMesh.position.y = globals.ADAPTIVE_TEXT_HEIGHT_MIN; // HEIGHT
        textMesh.position.z = -pos_vec2.x;
    
        textMesh.rotateX(Math.PI / 2);
        textMesh.rotateZ(Math.PI);
        textMesh.rotateY(Math.PI);
    
        globals.COUNTRIES_TEXT_POS.push([textMesh.position.x, textMesh.position.y, textMesh.position.z]);
        globals.COUNTRIES_TEXT_ROT.push([textMesh.rotation.x, textMesh.rotation.y, textMesh.rotation.z]);
    
        globals.scene.add(textMesh);
        globals.COUNTRIES_TEXT.push(textMesh);

        callback();

        return textMesh;     
    });
}

