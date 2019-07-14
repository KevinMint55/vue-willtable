import VueWilltable from './components/Table.vue';

const install = (Vue) => {
  Vue.component(VueWilltable.name, VueWilltable);
};

/* 支持使用标签的方式引入 */
if (typeof window !== 'undefined' && window.Vue) {
  install(window.Vue);
}

export {
  install,
  VueWilltable,
};

export default VueWilltable;
