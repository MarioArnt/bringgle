import Vue from 'vue'
import VeeValidate from 'vee-validate'
import App from '@/App'
import Header from '@/components/Header'
import router from '@/router'
import Toastr from 'vue-toastr'
import store from '@/store'
import 'materialize-css/dist/js/materialize'
require('vue-toastr/src/vue-toastr.scss')

Vue.config.productionTip = false
Vue.use(VeeValidate)
Vue.use(Toastr)

Vue.component('app-header', Header)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
