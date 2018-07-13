// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuelidate from 'vuelidate'
import App from './App'
import Header from './components/Header'
import router from './router'
import 'materialize-css/dist/js/materialize'

Vue.config.productionTip = false
Vue.use(Vuelidate)
Vue.component('app-header', Header)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
