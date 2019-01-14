import Vue from 'vue';
import App from './App';

require('./mock.js');

new Vue({
  render: h => h(App),
}).$mount('#app');
