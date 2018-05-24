import Vue from 'vue'
import App from './App'
// import '../src/style/reset.scss';

// mockjs数据
if (process.env.NODE_ENV === 'development') {
  require('./mock.js');
}

Vue.config.productionTip = false;

new Vue({
  el: '#app',
  components: {
    App
  },
  template: '<App/>'
})
