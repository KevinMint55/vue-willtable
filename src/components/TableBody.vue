<template>
  <div
    class="ww-tbody"
    :class="{
      fixed,
      scrollY,
    }">
    <div
      :style="{
        width: `${store.states.tableWidth}px`,
      }">
      <div
        class="ww-tr"
        v-for="(tr, yIndex) in showData" :key="yIndex">
        <div
          v-for="(th, xIndex) in columns"
          class="ww-td"
          :key="xIndex"
          :title="tr[th.key]"
          :style="styleObj(tr, th, yIndex, xIndex, columnsWidth)"
          :class="classObj(tr, th, yIndex, xIndex)"
          :data-key="th.key"
          @mouseenter="multiSelect($event, xIndex, yIndex, th.type)"
          @mousedown.prevent="selectCell($event, xIndex, yIndex, th.type)"
          v-show="th.fixed || allShow">
          <el-checkbox
            v-if="th.type === 'selection' && dataStatusList[yIndex]"
            size="mini"
            v-model="dataStatusList[yIndex].checked"
            @change="selectionChange">
          </el-checkbox>
          <div
            v-else
            class="ww-cell-content"
            :style="{'max-width':  `${columnsWidth[xIndex]}px`}">
            {{ format(tr[th.key], th.type, th.format) }}
          </div>
        </div>
      </div>
      <div
        v-if="showData.length === 0 && !fixed"
        class="ww-empty-block">
        暂无数据
      </div>
      <slot></slot>
    </div>
  </div>
</template>

<script>
import { checkbox } from 'element-ui';

export default {
  props: {
    fixed: {
      type: Boolean,
      default: false,
    },
    allShow: Boolean,
    columnsWidth: {
      type: Array,
      default: () => ([]),
    },
    cellStyle: {
      type: [Object, Function],
      default: () => () => ({}),
    },
    cellClassName: {
      type: [Object, Function],
      default: () => () => ({}),
    },
    store: {
      required: true,
    },
    scrollY: {
      type: Boolean,
      default: false,
    },
  },
  components: {
    'el-checkbox': checkbox,
  },
  data() {
    return {
    };
  },
  computed: {
    rowHeight() {
      return this.store.states.rowHeight;
    },
    columns() {
      return this.store.states.columns;
    },
    dataStatusList() {
      return this.store.states.dataStatusList;
    },
    showData() {
      return this.store.states.showData;
    },
    editor() {
      return this.store.states.editor;
    },
    selector() {
      return this.store.states.selector;
    },
    autofill() {
      return this.store.states.autofill;
    },
  },
  methods: {
    selectionChange() {
      this.$parent.selectionChange();
    },
    multiSelect(e, x, y, columnType) {
      this.store.multiSelect(e, x, y, columnType);
    },
    selectCell(e, x, y, type) {
      this.$parent.selectCell(e, x, y, type);
    },
    format(value, type, format = true) {
      if (!format) return value;
      if (!value) return;
      if (type === 'number') {
        if (!parseInt(value, 10)) {
          return value;
        }
        return parseInt(value, 10).toLocaleString();
      }
      return value;
    },
    styleObj(row, column, rowIndex, columnIndex, columnsWidth) {
      return {
        width: `${columnsWidth[columnIndex]}px`,
        height: `${this.rowHeight}px`,
        textAlign: column.align,
        ...this.cellStyle({
          row, column, rowIndex, columnIndex,
        }),
      };
    },
    classObj(row, column, rowIndex, columnIndex) {
      return {
        disabled: column.disabled,
        selection: column.type === 'selection',
        error: !this.store.verify(column, row[column.key], rowIndex),
        ...this.cellClassName({
          row, column, rowIndex, columnIndex,
        }),
      };
    },
  },
};
</script>

<style lang="scss">
.ww-tbody {
  position: relative;
  font-size: 12px;
  overflow: hidden;
  user-select: none;
  border-bottom: 1px solid #d6dfe4;
  border-right: 1px solid #d6dfe4;
  &.fixed {
    position: absolute;
    top: 31px;
    left: 0;
    z-index: 3;
  }
  &.scrollY {
    padding-bottom: 8px;
  }
  .ww-tr {
    display: flex;
    &:first-child {
      .ww-td {
        border-top: none;
      }
    }
  }
  .ww-td {
    position: relative;
    display: flex;
    align-items: center;
    border-top: 1px solid #d6dfe4;
    border-left: 1px solid #d6dfe4;
    min-width: 0;
    &.selection {
      justify-content: center;
    }

    &.disabled {
      color: #c5c5c5;
    }

    &.error {
      background-color: #ff4c42 !important;
    }
  }
}

.ww-cell-content {
  width: 100%;
  text-indent: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

// 数据为空
.ww-empty-block {
  position: relative;
  z-index: 9;
  font-size: 14px;
  padding: 30px;
  text-align: center;
  color: #909399;
}
</style>
