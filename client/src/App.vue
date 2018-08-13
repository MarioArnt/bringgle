<template lang="pug">
  div#app
    app-header
    vue-toastr(ref="toastr")
    router-view
</template>

<script lang="ts">
import CookiesUtils from './cookies'
import store from './store'

export default {
  name: 'App',
  created: function () {
    store.commit('changeCurrentUser', CookiesUtils.getUser())
  }
}
</script>

<style lang="scss">
@import '../node_modules/font-awesome/css/font-awesome.min.css';
@import "~vue-material/dist/theme/engine";

@include md-register-theme("default", (
  primary: md-get-palette-color(deeppurple, 400),
  accent: md-get-palette-color(amber, A200)
));

@import "~vue-material/dist/theme/all"; // Apply the theme

body {
  background-color: white;
}
#app {
  font-family: 'Roboto', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  margin: 0;
}
.main-content {
  padding: 20px 10%;
}
.fa {
  margin-right: 5px;
}
.md-icon-button {
  .fa {
    margin: 0;
  }
}

.white {
  color: white;
}
.primary {
  color: #7e57c2;
}
.primary-lighter {
  color: #B39DDB;
}
.md-xsmall-show {
  display: none;
}
@media screen and (max-width: 600px) {
  .md-xsmall-show {
    display: block;
  }
}
.ellipsis {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
