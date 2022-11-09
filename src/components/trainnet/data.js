import { convert_geocoord_to_xy } from '@/components/utils/utils.js';
import { globals } from '../globals';


export function unpack_data(cities, trainlines) {   

    let trainlines_vectors2 = [];
    let trainlines_stations = {};
    
    for (let line = 0; line < trainlines.length; line++) {

        let section_vec2 = [];

        for (let section = 0; section < trainlines[line].length; section++) {

            for (let station = 0; station < cities.length; station++) {

                if (cities[station]["city"] == trainlines[line][section]) {
                    
                    let vec2 = convert_geocoord_to_xy([cities[station]["lng"], cities[station]["lat"]]);
                    vec2.x *= -1;
                    vec2.y *= -1;
                    section_vec2.push(vec2);   

                    create_station_data(trainlines_stations, station, cities, vec2);
                }
            }
        }
        trainlines_vectors2.push(section_vec2);
    }

    globals.data_tl_trainnet = trainlines_vectors2;
    globals.data_tl_stations = trainlines_stations;

    return;
}

function create_station_data(occ, station, data, vec2, sectors=globals.GUI_CONTROLS.station_sectors){

    occ[data[station]["city"]] = {};
    occ[data[station]["city"]].city = data[station]["city"];
    occ[data[station]["city"]].lng =  data[station]["lng"];
    occ[data[station]["city"]].lat =  data[station]["lat"];
    occ[data[station]["city"]].vec2 = vec2;
    occ[data[station]["city"]].sectors = new Array(sectors).fill(null);
}

export function rebuild_stations(stations=globals.data_tl_stations, sectors=globals.GUI_CONTROLS.station_sectors){

    for (let s in stations){
        stations[s].sectors = new Array(sectors).fill(null);
    }
}

export function insert_sector_angle(sector, angle, vector){

    let station = get_station_by_vector(vector);

    if(station != undefined){ // no station found by vector

        if ( station.sectors[sector] == null ) {
             station.sectors[sector] = [];
       }       
       station.sectors[sector].push(angle);
       station.sectors[sector].sort();   
    }
}


function get_station_by_vector(vec){

    let stations =  globals.data_tl_stations;

    for (let s in stations){       
        if ( stations[s].vec2.equals(vec)){
            return stations[s];        
        }
    }
}

export function get_sector_info(station_vec, sector, angle, reverse){


    let station = get_station_by_vector(station_vec);   
    let _len = station.sectors[sector].length;
    let _order = get_sector_order_by_angle(station.sectors[sector], angle, reverse);
    _order += 1;
    
    // _order:  station sectors rails order as int of [1,2,3, ...] 
    // _len:    total amount of rails in this station sector
    return [_order, _len] ; 
}

function get_sector_order_by_angle(station_sectors, angle, reverse){
    
    let _order = 0;

    if (!reverse){
        for(let o = 0; o < station_sectors.length; o++){
            if(station_sectors[o].toFixed(12) == angle.toFixed(12)){
                _order = o;
                station_sectors[o] = -1;
                break;
            }
        }
    }
    else{
        for(let o = station_sectors.length-1; o >= 0; o--){
        
            if(station_sectors[o].toFixed(12) == angle.toFixed(12)){
                _order = o;
                station_sectors[o] = -1;
                break;
            }
        }
    }
    return _order;
}









// 5 808 491 106 007
// 1 / 1000000000000




































/*

 getcitiesTrainstations: function () {
            fetch("./german_top_603_cities.json")
                .then((response) => {
                    response.json()
                        .then((cities) => {
                            this.addTrainStations(cities);
                            globalset_cities_trainlines(cities);
                        })
                    // .catch(() =>{ /* NO ERROR MSGS  }) /*
                })
            },
    
    
            get_cities_trainlines: function (cities) {
                let vectors2= [];
                for (let i = 0; i < globals.TRAINLINES.length; i++) {
                    let path = [];
                    for (let s = 0; s < globals.TRAINLINES[i].length; s++) {
                        
                        for (let t = 0; t < cities.length; t++) {
    
                            if (cities[t]["city"] == globals.TRAINLINES[i][s]) {
                                
                                // get pos vec3
                                let coordinates = convert_geocoord_to_xy([cities[t]["lng"], cities[t]["lat"]], globals.xy_center, globals.map_scale);
                                let vec = new THREE.Vector3(-coordinates[1], globals.y_height_default, -coordinates[0]);
                                path.push(vec);
    
                                /*[
                                    {
                                    "city": "München", 
                                    "features": {
                                        "lat": "52.5167", 
                                        "lng": "13.3833", 
                                        "xyz_coordinates": "vector3",
                                        "sum_edges": 5,
                                        "sectors": [0,0,1,2]
                                        }
                                    }
                                ]
                                ,
    
                                globals.trainline_occupancies[cities[t]["city"]] = {};
                                globals.trainline_occupancies[cities[t]["city"]].city = cities[t]["city"];
                                globals.trainline_occupancies[cities[t]["city"]].lng = cities[t]["lng"];
                                globals.trainline_occupancies[cities[t]["city"]].lat= cities[t]["lat"];
                                globals.trainline_occupancies[cities[t]["city"]].vec3 = vec;
                                globals.trainline_occupancies[cities[t]["city"]].sector = [0,0,0,0];
                                globals.trainline_occupancies[cities[t]["city"]].sum = [0,0,0,0];
                            }
                        }
                    }
                    trainlines_vector2.push(path);
                    
                }
    
                // console.log(globals.trainline_occupancies);
                globalset_station_sectors();
                // console.log(this.trainline_occupancies);           
                
                this.cities_vectors2 = trainlines_vector2;
                // subdivide
                subdivide();
                // initial render
                this.update_data();
            },
    
            


        update_in_out_station: function (d, l, s) {

            // vec[len - 1] = rotation axis point - is clone of station a - should never be altered!
            // vec[len - 2] = station a           
            // vec[len - 3] = first point outcoming of station a 
            // vec[0] = rotation axis point - is clone of station b - should never be altered!
            // vec[1] = station b                 
            // vec[2] = last point incoming to station b

            let len  = d[l][s].length;
            let vec = d[l][s];
          
            vec[2] =  update_distance(vec[0], vec[2]);
            vec[len - 3]  = update_distance(vec[len - 1], vec[len - 3]);

            vec[2] = rotatePointAround(vec[0], vec[2]);
            vec[len - 3]  = rotatePointAround(vec[len - 1], vec[len - 3]);
        
        },

        update_rail_alignment: function(cities, l, s){

            // vec[len - 1] = rotation axis point - is clone of station  - should never be altered!
            // vec[len - 2] = station a           
            // vec[len - 3] = first point outcoming of station a 
            // vec[0] = rotation axis point - is clone of station b - should never be altered!
            // vec[1] = station b                 
            // vec[2] = last point incoming to station b

            let len  = cities[l][s].length; 

            let vec = cities[l][s];         
            
            Object.keys(globals.trainline_occupancies).forEach(key => {

            let coordinates = globals.trainline_occupancies[key].vec3;

            // console.log(coordinates);


            if (coordinates.equals(vec[0])){

                // console.log(globals.trainline_occupancies[key].sector);

                let sector_index = get_sector(vec[0], vec[1]);
                let sum = globals.trainline_occupancies[key].sum[sector_index];
                let sector = globals.trainline_occupancies[key].sector[sector_index];

                // console.log(sum);
                // console.log(sector);

                let res = this.update_rail_distance(vec[0], vec[2], sum, sector);
                
                vec[1] = res[0];         
                vec[2] = res[1];   

                globals.trainline_occupancies[key].sector[sector_index] += 1;     
                }  

            if (coordinates.equals(vec[len - 1])){

                // console.log(this.trainline_occupancies[key].sector);

                let sector_index = get_sector(vec[len - 1], vec[len - 2]);
                let sum = globals.trainline_occupancies[key].sum[sector_index];

                // sum = (sum - sector) + 1;

                let sector = globals.trainline_occupancies[key].sector[sector_index];

                // console.log(sum);
                // console.log(sector);

                let res = this.update_rail_distance(vec[len - 1], vec[len - 3], sum, sum-sector);

                vec[len - 2]= res[0];         
                vec[len - 3] = res[1];   

                globals.trainline_occupancies[key].sector[sector_index] += 1;     
                }  

            });


        

        },

        update_rail_distance: function(p1, p2, sum, rail){

            let axis = new THREE.Vector2(p1.x, p1.z);
            let point = new THREE.Vector2(p2.x, p2.z);
            
            let distance = axis.distanceTo(point);

            let d = globals.GUI_CONTROLS.IN_OUT_ALIGNMENT_DISTANCE;
 
            if (sum % 2 == 0){ // even number of rails
                d = (rail * d) - (2 * d);
            }
            else{ // odd number of rails
                d = (rail * d) - (1 * d);
            }

            if ( d < 0) distance *= -1;
  
            let vec1 =  point.rotateAround(axis, -THREE.MathUtils.degToRad(-90));
            vec1 = update_distance(p1, new THREE.Vector3(vec1.x, p1.y, vec1.y), d);
            let vec2 = axis.rotateAround(new THREE.Vector2(vec1.x, vec1.z), -THREE.MathUtils.degToRad(-90));
            vec2 = update_distance(vec1, new THREE.Vector3(vec2.x, p1.y, vec2.y), distance);
            return [vec1, vec2];

        },


    

*/