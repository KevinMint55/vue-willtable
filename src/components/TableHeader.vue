<template>
  <table cellspacing="0" cellpadding="0" style="position: relative;">
    <colgroup>
      <col
        v-for="(columnWidth, index) in columnsWidth" :width="columnWidth"
        :key="index">
    </colgroup>
    <thead class="km-thead">
      <tr ref="tr">
        <th
          v-for="(th, index) in columns"
          :key="index"
          :style="{
              width: `${columnsWidth[index]}px`,
              'text-align': th.align
          }"
          :title="th.title"
          v-show="th.fixed || allShow">
          <el-checkbox
            v-if="th.type === 'selection'"
            size="mini"
            v-model="checkedAll"
            @change="selectAll">
          </el-checkbox>
          <p
            class="km-cell-content"
            :style="{width: `${columnsWidth[index] - 20}px`}"
            :class="{active: isActive(columnsStatusList[index])}"
            v-else>
            <span class="icon" :class="iconClass(th.type)" v-if="showIcon"></span>
            <span class="content">{{ th.title }}</span>
          </p>
          <div
            v-if="th.type != 'selection'"
            class="dropdown"
            :class="{active: dropdown.index === index}">
            <i v-if="th.action" @click.stop="openDropdown(index)"></i>
          </div>
          <div
            v-if="th.type != 'selection'"
            class="handler"
            @mousedown="handlerDown(index)">
          </div>
        </th>
      </tr>
    </thead>
  </table>
</template>

<script>
import { checkbox } from 'element-ui';

export default {
  components: {
    'el-checkbox': checkbox,
  },
  props: {
    showIcon: {
      type: Boolean,
      default: false,
    },
    allShow: Boolean,
    columnsWidth: {
      type: Array,
      default: () => [],
    },
    fixedCount: [String, Number],
    store: {
      required: true,
    },
  },
  data() {
    return {
      checkedAll: false,
      adjustWidthValue: 80,
      adjustWidthFlag: false,
      adjustWidthIndex: 0,
      adjustWidthType: '',
      mouseX: 0,
    };
  },
  computed: {
    columns() {
      return this.store.states.columns;
    },
    columnsStatusList() {
      return this.store.states.columnsStatusList;
    },
    dropdown() {
      return this.store.states.dropdown;
    },
    filters() {
      return this.store.states.filters;
    },
  },
  methods: {
    selectAll() {
      this.$parent.selectAll();
    },
    handlerDown(index) {
      this.adjustWidthFlag = true;
      this.adjustWidthIndex = index;
      this.store.states.adjustLineShow = true;
      window.addEventListener('mousemove', this.handlerMove);
      window.addEventListener('mouseup', this.handlerUp);
    },
    handlerMove(e) {
      if (this.adjustWidthFlag) {
        e = e || window.event;
        let width;
        if (this.fixedCount >= this.adjustWidthIndex + 1) {
          width = e.pageX - this.$parent.excelPos.left - this.$refs.tr.children[this.adjustWidthIndex].offsetLeft;
        } else {
          width = e.pageX + this.store.states.tableBodyLeft - this.$parent.excelPos.left - this.$refs.tr.children[this.adjustWidthIndex].offsetLeft;
        }
        if (width >= 80) {
          this.adjustWidthValue = width;
          this.store.states.adjustLineLeft = e.pageX - this.$parent.excelPos.left;
        }
      }
    },
    handlerUp() {
      this.$parent.adjustWidth(this.adjustWidthIndex, this.adjustWidthValue);
      this.adjustWidthFlag = false;
      this.store.states.adjustLineShow = false;
      window.removeEventListener('mousemove', this.handlerMove);
      window.removeEventListener('mouseup', this.handlerUp);
    },
    openDropdown(i) {
      this.store.openDropdown(i);
    },
    isActive(th) {
      if (!th) return false;
      if (this.filters.hasOwnProperty(th.key)) {
        return true;
      } if (th.sort) {
        return true;
      }
      return false;
    },
    iconClass(type) {
      let className;
      switch (type) {
        case 'number':
          className = 'number';
          break;
        case 'date':
          className = 'date';
          break;
        case 'month':
          className = 'date';
          break;
        case 'select':
          className = 'select';
          break;
        default:
          className = 'text';
      }
      return {
        [className]: true,
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.km-thead {
  position: relative;
  user-select: none;
  tr {
    background-color: #eef1f6;
  }
  th {
    position: relative;
    text-align: left;
    text-indent: 4px;
    border: 1px solid #d6dfe4;
    border-bottom: none;
    height: 30px;
  }
  .dropdown {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1;
    display: flex;
    i {
      display: inline-block;
      width: 10px;
      height: 10px;
      background: url("../assets/dropdown.png") center center no-repeat;
      cursor: pointer;
      transition: all 0.3s;
    }
    &.active {
      i {
        transform: rotateZ(180deg);
      }
    }
  }
  .handler {
    position: absolute;
    z-index: 1;
    top: 0;
    right: -8px;
    width: 16px;
    height: 30px;
    cursor: col-resize;
    text-align: center;
  }
  .active {
    color: #2d8cf0;
  }

  .content {
    vertical-align: middle;
  }

  .icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    background-position: center;
    background-repeat: no-repeat;
    background-size: contain;
    vertical-align: middle;
    &.text {
      background-image: url("../assets/text.png");
    }
    &.select {
      background-image: url("../assets/select.png");
    }
    &.date {
      background-image: url("../assets/date.png");
    }
    &.number {
      background-image: url("../assets/number.png");
    }
  }
}
</style>
