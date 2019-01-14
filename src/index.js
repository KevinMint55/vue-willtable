import KmExcel from './components/Excel.vue';

const install = (Vue) => {
  Vue.component(KmExcel.name, KmExcel);
};

/* 支持使用标签的方式引入 */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  KmExcel,
};
