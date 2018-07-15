<template lang="pug">
  div#app
    app-header
    vue-toastr(ref="toastr")
    router-view
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@import '../node_modules/materialize-css/dist/css/materialize.css';
@import '../node_modules/font-awesome/css/font-awesome.min.css';
#app {
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}
.fa {
  margin-right: 5px;
}
</style>
