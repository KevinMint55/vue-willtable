import Vue from 'vue';
import App from './App.vue';

require('./mock.js');

new Vue({
  render: (h) => h(App),
}).$mount('#app');
