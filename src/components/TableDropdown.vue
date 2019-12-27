<template>
  <div class="ww-dropdown-wrapper"
    :class="{ active: parseInt(dropdown.index) >= 0 }"
    :style="{
      'top': `${$parent.$refs.wrapper.offsetTop + store.states.theaderHeight}px`,
      'left': left
    }"
    ref="dropdown"
    v-clickoutside="openDropdown">
    <div class="ww-sort">
      <span :class="{ active: dropdown.sort == 'ascending' }" @click="sort('ascending')">升序</span>
      <span :class="{ active: dropdown.sort == 'descending' }" @click="sort('descending')">降序</span>
    </div>
    <div class="ww-filter">
      <div class="title">名称<span>（计数）</span></div>
      <ul class="content">
        <li v-for="(item, key) in dropdown.list" :key="key">
          <el-checkbox
            size="mini"
            v-model="item.checked"
            style="margin-right: 2px;">
          </el-checkbox>
          <p>
            <span :title="key">{{ key }}</span>
            <i>（{{ item.count }}）</i>
          </p>
        </li>
      </ul>
      <div class="btns">
        <span :style="filterBtnStyle" @click="handleFilter">筛选</span>
        <span @click="resetFilter">重置</span>
      </div>
    </div>
  </div>
</template>

<script>
import { checkbox } from 'element-ui';
import clickoutside from '../directives/clickoutside';

export default {
  directives: { clickoutside },
  props: {
    columnsWidth: {
      type: Array,
      default: () => ([]),
    },
    fixedCount: [String, Number],
    value: {
      type: Object,
      default: () => ({}),
    },
    store: {
      required: true,
    },
  },
  components: {
    'el-checkbox': checkbox,
  },
  data() {
    return {
      left: 0,
    };
  },
  computed: {
    filterBtnStyle() {
      let haveChecked = false;
      Object.keys(this.dropdown.list).forEach((key) => {
        if (this.dropdown.list[key].checked) {
          haveChecked = true;
        }
      });
      if (!haveChecked) {
        return {
          cursor: 'not-allowed',
          color: '#c0c4cc',
        };
      }
      return {};
    },
    dropdown() {
      return this.store.states.dropdown;
    },
  },
  watch: {
    'dropdown.index': {
      handler(val) {
        if (!val) return;
        let left;
        if (this.dropdown.index < this.fixedCount) {
          left = this.store.states.tableBodyLeft + this.columnsWidth.filter((item, index) => index <= this.dropdown.index).reduce((sum, item) => sum + item, 0);
        } else {
          left = this.columnsWidth.filter((item, index) => index <= this.dropdown.index).reduce((sum, item) => sum + item, 0);
        }
        this.$nextTick(() => {
          left = left - this.$refs.dropdown.offsetWidth + this.$parent.$refs.wrapper.offsetLeft - this.store.states.tableBodyLeft;
          if (left < this.$parent.$refs.wrapper.offsetLeft) {
            left = this.$parent.$refs.wrapper.offsetLeft;
          }
          this.left = `${left}px`;
        });
      },
    },
  },
  methods: {
    openDropdown() {
      this.store.openDropdown();
    },
    sort(type) {
      this.store.sort(type);
    },
    handleFilter() {
      let haveChecked = false;
      Object.keys(this.dropdown.list).forEach((key) => {
        if (this.dropdown.list[key].checked) {
          haveChecked = true;
        }
      });
      if (!haveChecked) return;
      this.store.handleFilter();
      this.$parent.handleResize();
    },
    resetFilter() {
      this.store.resetFilter();
      this.$parent.handleResize();
    },
  },
};
</script>

<style lang="scss">
.ww-dropdown-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 30;
  min-width: 100px;
  opacity: 0;
  transform: rotateX(90deg);
  transform-origin: top center;
  transition: transform 0.3s;
  border: 1px solid #ebeef5;
  border-radius: 2px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 8px;
  overflow-y: auto;
  &.active {
    opacity: 1;
    transform: rotateX(0);
  }
}

.ww-sort {
  display: flex;
  font-size: 13px;
  span {
    display: flex;
    align-items: center;
    cursor: pointer;
    padding: 4px 8px;
    transition: all 0.3s;
    &.active {
      background-color: #c5e1ba;
    }
    &:hover {
      background-color: #ccffcc;
    }
    &:before {
      content: "";
      display: inline-block;
      width: 14px;
      height: 14px;
      margin-right: 2px;
    }
    &:first-child {
      &:before {
        background: url("../assets/ascending.png") center center no-repeat;
        background-size: contain;
      }
    }
    &:last-child {
      &:before {
        background: url("../assets/descending.png") center center no-repeat;
        background-size: contain;
      }
    }
  }
}

.ww-filter {
  border: 1px solid #e0e0e0;
  padding: 4px;
  .title {
    font-size: 13px;
    padding: 2px 6px;
    background-color: #f3f4f5;
    span {
      color: #909399;
    }
  }
  .content {
    border-bottom: 1px solid #e0e0e0;
    padding: 4px 0;
    margin-bottom: 4px;
    overflow-y: auto;
    max-height: 300px;
    li {
      display: flex;
      align-items: center;
    }
    p {
      display: flex;
      margin-left: 4px;
      font-size: 12px;
      span {
        display: inline-block;
        max-width: 200px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      i {
        color: #909399;
      }
    }
  }
  .btns {
    font-size: 13px;
    span {
      display: inline-block;
      cursor: pointer;
      transition: all 0.5s;
      padding: 0 4px;
      &:hover {
        color: #20a0ff;
      }
    }
  }
}
</style>
