<template>
  <div id="group">
    <div ref="escape"></div>
  </div>
</template>

<script>
// import {test} from "./test_p5"
import {start} from './escape_main'


export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: "Escape",
  mounted() {
    start(this.$refs.escape)
  }
}
</script>

<style >
body {
  background-color: black;
}


</style>