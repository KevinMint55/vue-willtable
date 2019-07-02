<template>
  <table cellspacing="0" cellpadding="0" style="position: relative;">
    <colgroup>
      <col
        v-for="(columnWidth, index) in columnsWidth" :width="columnWidth"
        :key="index">
    </colgroup>
    <tbody class="km-tbody">
      <tr
        v-for="(tr, yIndex) in showData" :key="yIndex">
        <td
          v-for="(th, xIndex) in columns"
          :key="xIndex"
          :title="tr[th.key]"
          :style="styleObj(tr, th, yIndex, xIndex, columnsWidth)"
          :class="classObj(tr, th, yIndex, xIndex)"
          :data-key="th.key"
          @mouseenter="multiSelect($event, xIndex, yIndex, th.type)"
          @mousedown.prevent="selectCell($event, xIndex, yIndex, th.type)"
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
import verify from '../mixins/verify';

export default {
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
    store: {
      required: true,
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
    columns() {
      return this.store.states.columns;
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
  mixins: [verify],
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
        disabled: column.type === 'disabled',
        error: !this.verify(column, row[column.key], rowIndex),
        ...this.cellClassName({
          row, column, rowIndex, columnIndex,
        }),
      };
    },
    verify(column, value) {
      if (!value) {
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
      return correct;
    },
  },
};
</script>

<style lang="scss" scoped>
.km-tbody {
  td {
    position: relative;
    border: none;
    border: 1px solid #d6dfe4;
    min-width: 0;
    text-indent: 4px;
    height: 28px;
  }
}
.disabled {
  color: #80848f;
}
.error {
  background-color: #ff4c42 !important;
}
</style>
