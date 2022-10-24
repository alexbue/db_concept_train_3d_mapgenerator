<template>
  <div id="app">
    <div id="banner"></div>
    <!-- <TrainMap/> -->
    <!-- <GermanyMap /> -->
    <EuropeMap />
  </div>

</template>

<script>
// import TrainMap from './components/TrainMap.vue'
// import GermanyMap from './components/germany.vue'
import EuropeMap from './components/europe.vue'

export default {
  name: 'App',
  components: {
    //TrainMap,
    //GermanyMap,
    EuropeMap,
  }
}
</script>

<style>
*{
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#banner {
    background-color: red;
    background-image: url("./../public/banner_01.png");
    position: absolute;
    display: block;
    z-index: 99;
    left: 0%;
    bottom: 0%;
    width:1421px;
    height:179px;
    overflow-x: hidden;
    overflow-y: hidden;
    }

</style>
