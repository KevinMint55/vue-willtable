import WillTable from './components/Table.vue';

const install = (Vue) => {
  Vue.component(WillTable.name, WillTable);
};

/* 支持使用标签的方式引入 */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export {
  install,
  WillTable,
};

export default WillTable;
