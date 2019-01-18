<template>
  <table cellspacing="0" cellpadding="0" style="position: relative;">
    <colgroup>
      <col
        v-for="(columnWidth, index) in columnsWidth" :width="columnWidth"
        :key="index">
    </colgroup>
    <tbody class="km-tbody">
      <tr
        v-for="(tr, yIndex) in store.showData" :key="yIndex"
        :class="{
          curRow: store.editor.editorShow && store.editor.editorYIndex == yIndex
        }">
        <td
          v-for="(th, xIndex) in store.columns"
          :key="xIndex"
          :title="tr[th.key]"
          :style="styleObj(tr, th, yIndex, xIndex, columnsWidth)"
          :class="classObj(tr, th, yIndex, xIndex)"
          :data-key="th.key"
          @mouseenter="multiSelect($event, xIndex, yIndex, th.type)"
          @mousedown="selectCell($event, xIndex, yIndex, th.type)"
          v-show="th.fixed || allShow">
          <el-checkbox
            size="mini"
            v-model="dataStatusList[yIndex].checked"
            @change="selectionChange"
            v-if="th.type === 'selection' && dataStatusList[yIndex]"></el-checkbox>
          <div
            class="cell-content"
            :style="{'max-width':  `${columnsWidth[xIndex]}px`}"
            v-else>{{ format(tr[th.key], th.type, th.format) }}</div>
        </td>
      </tr>
    </tbody>
    <slot></slot>
  </table>
</template>

<script>
import { checkbox } from 'element-ui';
import clickoutside from '../directives/clickoutside';

export default {
  directives: { clickoutside },
  inject: ['store'],
  props: {
    allShow: Boolean,
    dataStatusList: {
      type: Array,
      default: () => [],
    },
    columnsWidth: {
      type: Array,
      default: () => [],
    },
    cellStyle: {
      type: [Object, Function],
      default: () => () => {},
    },
    cellClassName: {
      type: [Object, Function],
      default: () => () => {},
    },
  },
  components: {
    'el-checkbox': checkbox,
  },
  data() {
    return {
    };
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
        textAlign: column.align,
        ...this.cellStyle({
          row, column, rowIndex, columnIndex,
        }),
      };
    },
    classObj(row, column, rowIndex, columnIndex) {
      return {
        selected:
          columnIndex <= this.store.selector.selectedXArr[1]
          && columnIndex >= this.store.selector.selectedXArr[0]
          && rowIndex <= this.store.selector.selectedYArr[1]
          && rowIndex >= this.store.selector.selectedYArr[0],
        autofill:
          columnIndex <= this.store.selector.selectedXArr[1]
          && columnIndex >= this.store.selector.selectedXArr[0]
          && rowIndex <= this.store.autofill.autofillYArr[1]
          && rowIndex >= this.store.autofill.autofillYArr[0],
        disabled: column.type === 'disabled',
        error: !this.verify(column, row[column.key], rowIndex),
        ...this.cellClassName({
          row, column, rowIndex, columnIndex,
        }),
      };
    },
    verify(column, value, index) {
      if (!value) {
        this.$parent.setErrors(index, column.key, true);
        return true;
      }
      let correct;
      switch (column.type) {
        case 'date':
          correct = this.verifyDate(value);
          break;
        case 'month':
          correct = this.verifyMonth(value);
          break;
        case 'select':
          correct = this.verifySelect(value, column.options);
          break;
        case 'number':
          correct = this.verifyNumber(value);
          break;
        default:
          correct = true;
      }
      this.$parent.setErrors(index, column.key, correct);
      return correct;
    },
    verifyDate(value) {
      const result = value.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
      if (result == null) {
        return false;
      }
      const d = new Date(result[1], result[3] - 1, result[4]);
      if (d.getFullYear() === Number(result[1]) && d.getMonth() + 1 === Number(result[3]) && d.getDate() === Number(result[4])) {
        return true;
      }
      return false;
    },
    verifyMonth(value) {
      const result = value.match(/^(\d{1,4})(-|\/)(\d{1,2})$/);
      if (result == null) {
        return false;
      }
      const d = new Date(result[1], result[3] - 1);
      if (d.getFullYear() === Number(result[1]) && d.getMonth() + 1 === Number(result[3])) {
        return true;
      }
      return false;
    },
    verifySelect(value, options) {
      const arr = options.map(item => item.value);
      if (arr.includes(value)) {
        return true;
      }
      return false;
    },
    verifyNumber(value) {
      if (isNaN(value)) {
        return false;
      }
      return true;
    },
  },
};
</script>

<style lang="scss" scoped>
.km-tbody {
  tr {
    &.curRow {
      td {
        background-color: #dceff7;
      }
    }
  }
  td {
    position: relative;
    border: none;
    border: 1px solid #d6dfe4;
    min-width: 0;
    text-indent: 4px;
    height: 28px;
  }
}
.selected {
  background-color: rgba(74, 149, 235, 0.2) !important;
  &.error {
    background-color: #f1c4c4 !important;
  }
}
.autofill {
  background-color: rgba(127, 127, 127, 0.2) !important;
}
.disabled {
  color: #80848f;
}
.error {
  background-color: #ff4c42 !important;
}
</style>
