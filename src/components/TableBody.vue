<template>
  <div
    class="ww-tbody"
    :class="{
      fixed,
      scrollY,
      empty: showData.length === 0,
    }"
    :style="{
      top: fixed ? `${store.states.theaderHeight}px` : '',
    }"
  >
    <div
      :style="{
        width: `${store.states.tableWidth}px`,
        height: `${showData.length ? showData.length * store.states.rowHeight : 80}px`,
        transform: `translate3d(
          -${fixed ? 0 : store.states.tableBodyLeft}px,
          -${store.states.tableBodyTop}px,
          0
        )`
      }"
    >
      <div
        class="ww-tr"
        v-for="(tr, yIndex) in domData"
        :key="yIndex"
        :style="{
          transform: `translate3d(
            0,
            ${(yIndex + store.states.visibleRowStartIndex) * store.states.rowHeight}px,
            0
          )`,
        }"
      >
        <div
          v-for="(th, xIndex) in columns"
          class="ww-td"
          :key="xIndex"
          :title="tr[th.key]"
          :style="styleObj(tr, th, yIndex + store.states.visibleRowStartIndex, xIndex, columnsWidth)"
          :class="classObj(tr, th, yIndex + store.states.visibleRowStartIndex, xIndex)"
          :data-key="th.key"
          @mouseenter="multiSelect($event, xIndex, yIndex + store.states.visibleRowStartIndex, th.type)"
          @mousedown.prevent="selectCell($event, xIndex, yIndex + store.states.visibleRowStartIndex, th.type)"
          v-show="th.fixed || allShow"
        >
          <el-checkbox
            v-if="th.type === 'selection' && dataStatusList[yIndex + store.states.visibleRowStartIndex]"
            size="mini"
            v-model="dataStatusList[yIndex + store.states.visibleRowStartIndex].checked"
            @change="selectionChange"
          ></el-checkbox>
          <div
            v-else
            class="ww-cell-content"
            :style="{'max-width':  `${columnsWidth[xIndex]}px`}"
          >{{ format(tr[th.key], th.type, th.format) }}</div>
        </div>
        <template v-if="editor.editorShow && !disabled && showAddRow">
          <div class="ww-tr-add prev" v-if="yIndex + store.states.visibleRowStartIndex === 0"  @click="addRow(yIndex + store.states.visibleRowStartIndex)"></div>
          <div class="ww-tr-add next" @click="addRow(yIndex + store.states.visibleRowStartIndex + 1)"></div>
        </template>
      </div>
      <div v-if="showData.length === 0 && !fixed" class="ww-empty-block">暂无数据</div>
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
    disabled: {
      type: Boolean,
      default: false,
    },
    disabledCell: {
      type: [Object, Function],
      default: () => () => false,
    },
    showAddRow: {
      type: Boolean,
      default: false,
    },
    addRowAndCopy: {
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
    domData() {
      return this.store.states.domData;
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
        disabled: column.disabled || this.disabled || this.disabledCell({
          row,
          column,
          rowIndex,
          columnIndex,
        }),
        selection: column.type === 'selection',
        error: !this.store.verify(column, row[column.key], rowIndex),
        ...this.cellClassName({
          row, column, rowIndex, columnIndex,
        }),
      };
    },
    addRow(rowIndex) {
      this.store.addRow(rowIndex, this.addRowAndCopy);
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
  > div {
    position: relative;
  }
  &.empty {
    border-left: 1px solid #d6dfe4;
  }
  &.fixed {
    position: absolute;
    left: 0;
    box-shadow: 1px 0 8px #d3d4d6;
    overflow-x: hidden;
    background: #fff;
    user-select: none;
    z-index: 2;
  }
  &.scrollY {
    padding-bottom: 8px;
  }
  .ww-tr {
    position: absolute;
    top: 0;
    left: 0;
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

// 添加行
.ww-tr-add {
  position: absolute;
  left: -16px;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
  cursor: pointer;
  z-index: 10;
  &.prev {
    top: -16px;
  }
  &.next {
    bottom: -16px;
  }
  &::before {
    content: "";
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #d6dfe4;
    transition: all 0.3s;
  }
  &:hover {
    &::before {
      width: 16px;
      height: 16px;
      background-color: #57a3f3;
    }
  }
}
</style>
