<template>
  <table cellspacing="0" cellpadding="0" style="position: relative;">
    <colgroup>
      <col
        v-for="(columnWidth, index) in columnsWidth" :width="columnWidth"
        :key="index">
    </colgroup>
    <tbody class="km-tbody">
      <tr
        v-for="(tr, yIndex) in showData" :key="yIndex"
        :class="{
          curRow: editor.editorShow && editor.editorYIndex == yIndex
        }">
        <td
          v-for="(th, xIndex) in columns"
          :key="xIndex"
          :title="tr[th.key]"
          :style="{
            width: `${columnsWidth[xIndex]}px`, 'text-align': th.align
          }"
          :class="{
            selected:
              xIndex <= selector.selectedXArr[1] &&
              xIndex >= selector.selectedXArr[0] &&
              yIndex <= selector.selectedYArr[1] &&
              yIndex >= selector.selectedYArr[0],
            autofill:
              xIndex <= selector.selectedXArr[1] &&
              xIndex >= selector.selectedXArr[0] &&
              yIndex <= autofill.autofillYArr[1] &&
              yIndex >= autofill.autofillYArr[0],
            disabled: th.type == 'disabled',
            error:
              th.type == 'date' && !verifyDate(tr[th.key], yIndex, th.key) ||
              th.type == 'month' && !verifyMonth(tr[th.key], yIndex, th.key) ||
              th.type == 'select' && !verifySelect(tr[th.key], th.options, yIndex, th.key) ||
              th.type == 'number' && !verifyNumber(tr[th.key], yIndex, th.key)
          }"
          :data-key="th.key"
          @mouseenter="multiSelect($event, xIndex, yIndex, th.type)"
          @mousedown="selectCell($event, xIndex, yIndex, th.type)" v-show="th.fixed || allShow">
          <el-checkbox
            size="mini"
            v-model="dataStatusList[yIndex].checked"
            @change="selectionChange"
            v-if="th.type == 'selection'"></el-checkbox>
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
import store from '../store';
import clickoutside from '../directives/clickoutside';

export default {
  directives: { clickoutside },
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
  },
  components: {
    'el-checkbox': checkbox,
  },
  data() {
    return {
    };
  },
  computed: {
    ...store.mapState(['columns', 'showData', 'editor', 'autofill', 'selector']),
  },
  methods: {
    selectionChange() {
      this.$parent.selectionChange();
    },
    multiSelect(e, x, y, columnType) {
      store.multiSelect(e, x, y, columnType);
    },
    selectCell(e, x, y, type) {
      this.$parent.selectCell(e, x, y, type);
    },
    verifyDate(date, index, key) {
      if (!date) {
        this.$parent.setErrors(index, key, true);
        return true;
      }
      const result = date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
      if (result == null) {
        this.$parent.setErrors(index, key, false);
        return false;
      }
      const d = new Date(result[1], result[3] - 1, result[4]);
      if (d.getFullYear() === Number(result[1]) && d.getMonth() + 1 === Number(result[3]) && d.getDate() === Number(result[4])) {
        this.$parent.setErrors(index, key, true);
        return true;
      }
      this.$parent.setErrors(index, key, false);
      return false;
    },
    verifyMonth(month, index, key) {
      if (!month) {
        this.$parent.setErrors(index, key, true);
        return true;
      }
      const result = month.match(/^(\d{1,4})(-|\/)(\d{1,2})$/);
      if (result == null) {
        this.$parent.setErrors(index, key, false);
        return false;
      }
      const d = new Date(result[1], result[3] - 1);
      if (d.getFullYear() === Number(result[1]) && d.getMonth() + 1 === Number(result[3])) {
        this.$parent.setErrors(index, key, true);
        return true;
      }
      this.$parent.setErrors(index, key, false);
      return false;
    },
    verifySelect(value, options, index, key) {
      if (!value) {
        this.$parent.setErrors(index, key, true);
        return true;
      }
      const arr = options.map(item => item.value);
      if (arr.includes(value)) {
        this.$parent.setErrors(index, key, true);
        return true;
      }
      this.$parent.setErrors(index, key, false);
      return false;
    },
    verifyNumber(value, index, key) {
      if (isNaN(value)) {
        this.$parent.setErrors(index, key, false);
        return false;
      }
      this.$parent.setErrors(index, key, true);
      return true;
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
