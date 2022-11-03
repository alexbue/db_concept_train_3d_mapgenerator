<template>
    <div id="container"></div>
</template>

<script>


import { globals } from '@/components/globals.js';
import { reset_gui, init_gui } from '@/components/gui/gui.js';

import { init_scene, renderer_info_log } from '@/components/render/init.js';
// import { update_scene } from '@/components/render/update.js';

import { create_map, create_country_names, animate_map } from '@/components/map/map.js';

import { unpack_data } from '@/components/data/data.js';
import { render_data, render_stations } from '@/components/data/render.js';
import { preprocess_data } from '@/components/data/processing.js';

const map = "./europe_borders_7MB_6p.geojson";
const stations = "./german_top_603_cities.json";
const country_centroids = "./countries_centroids_mod.geojson";

const trainlines = globals.TRAINLINES;

let data_tl_trainnet = globals.data_tl_trainnet;
let data_tl_stations = globals.data_tl_stations;


export default {

    name: 'MainComponent',

    data() {

        return {

            g: globals,
        }
    },

    mounted() {

        this.init();

        // map data
        fetch(map).then((response) => {
            response.json().then((data) => {  
                create_map(data); // create map from data and add it to scene
            })
        });

        //  country names
        fetch(country_centroids).then((response) => { 
            response.json().then((data) => {

                create_country_names(data);                
            })
        });

        // trainlines + stations
        fetch(stations).then((response) => {
            response.json().then((data) => {

                [data_tl_trainnet, data_tl_stations] = unpack_data(data, trainlines);

                data_tl_trainnet = preprocess_data(data_tl_trainnet);      

                render_data(data_tl_trainnet)       // inital render
                render_stations(data_tl_stations);

                renderer_info_log();

            })
        });
    },

    methods: {


        init: function () {

            init_scene();
            init_gui();
            console.log(reset_gui);

            let that = this;
            window.addEventListener('resize', onWindowResize, false);
            function onWindowResize() {
                that.g.camera.aspect = window.innerWidth / window.innerHeight;
                that.g.camera.updateProjectionMatrix();
                that.g.renderer.setSize(window.innerWidth, window.innerHeight);
            }

            this.animate();
        },


        animateToCamera: function () { animate_map(); },


        animate: function () {

            this.animateToCamera();

            this.g.controls.update();
            this.g.FPS.update();
            this.g.RAM.update();
            this.g.MS.update();

            this.g.renderer.render(this.g.scene, this.g.camera);

            requestAnimationFrame(this.animate);
        },


        updateRender: function () {

        }


    },
}
</script>

<style scoped>
#container {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: graymap_scale;
    text-align: xy_center;
    color: #2c3e50;
    background-color: red;
}

;
</style>