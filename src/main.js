import Vue from 'vue'
import VeeValidate from 'vee-validate'
import App from '@/App'
import Header from '@/components/Header'
import router from '@/router'
import Toastr from 'vue-toastr'
import Logger from 'js-logger'
import store from '@/store'
import VueMaterial from 'vue-material'
import 'vue-material/dist/vue-material.min.css'
import 'vue-toastr/src/vue-toastr.scss'

Logger.useDefaults()

Vue.config.productionTip = false
Vue.use(VeeValidate)
Vue.use(Toastr)
Vue.use(VueMaterial)

Vue.component('app-header', Header)

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
  validations: {}
})
