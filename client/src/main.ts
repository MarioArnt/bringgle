import Vue from 'vue';
import VeeValidate from 'vee-validate';
import App from '@/App';
import Header from '@/components/Header';
import router from '@/router';
import Toastr from 'vue-toastr';
import Logger from 'js-logger';
import store from '@/store';
import VueMaterial from 'vue-material';
import VueScrollTo from 'vue-scrollto';
import 'vue-material/dist/vue-material.min.css';
import 'vue-toastr/src/vue-toastr.scss';
import 'perfect-scrollbar/css/perfect-scrollbar.css';

Logger.useDefaults();

Vue.config.productionTip = false;
Vue.use(VeeValidate);
Vue.use(Toastr);
Vue.use(VueMaterial);
Vue.use(VueScrollTo);

Vue.component('app-header', Header);

new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>',
});
