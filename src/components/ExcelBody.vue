<template>
    <table cellspacing="0" cellpadding="0" style="position: relative;">
        <colgroup>
            <col 
                v-for="(columnWidth, index) in columnsWidth" :width="columnWidth" 
                :key="index">
        </colgroup>
        <tbody class="km-tbody">
            <tr 
                v-for="(tr, yIndex) in data" :key="yIndex" 
                :class="{curRow:editorShow && editorYIndex == yIndex}">
                <td 
                    v-for="(th, xIndex) in columns" 
                    :key="xIndex" 
                    :title="tr[th.key]" 
                    :style="{width: `${columnsWidth[xIndex]}px`, 'text-align': th.align}" 
                    :class="{
                        selected: xIndex <= selectedXArr[1] && xIndex >=selectedXArr[0] && yIndex <= selectedYArr[1] && yIndex >= selectedYArr[0],
                        autofill: xIndex <= selectedXArr[1] && xIndex >=selectedXArr[0]&&yIndex<=autofillYArr[1] && yIndex >= autofillYArr[0],
                        disabled: th.type == 'disabled',
                        error: th.type == 'date' && !verifyDate(tr[th.key], yIndex, th.key) || 
                               th.type == 'month' && !verifyMonth(tr[th.key], yIndex, th.key) || 
                               th.type == 'select' && !verifySelect(tr[th.key], th.options, yIndex, th.key) || th.type == 'number' && !verifyNumber(tr[th.key], yIndex, th.key)
                    }" 
                    :data-key="th.key" 
                    @mouseenter="multiSelect($event, xIndex, yIndex, th.type)" 
                    @mousedown="selectCell($event, xIndex, yIndex, th.type)" v-show="th.fixed || allShow">
                    <el-checkbox 
                        size="mini" 
                        v-model="tr.checked" 
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
    import clickoutside from '../mixins/clickoutside.js';
    import { checkbox } from 'element-ui';

    export default {
        directives: { clickoutside },
        props: {
            allShow: Boolean,
            columns: {
                type: Array,
                default: () => {
                    return []
                }
            },
            data: {
                type: Array,
                default: () => {
                    return []
                }
            },
            columnsWidth: {
                type: Array,
                default: () => {
                    return []
                }
            },
            editorShow: Boolean,
            editorYIndex: [String, Number],
            selectedXArr: {
                type: Array,
                default: () => {
                    return []
                }
            },
            selectedYArr: {
                type: Array,
                default: () => {
                    return []
                }
            },
            autofillYArr: {
                type: Array,
                default: () => {
                    return []
                }
            },
        },
        components: {
            'el-checkbox': checkbox
        },
        data() {
            return {
            }
        },
        methods: {
            selectionChange() {
                this.$parent.selectionChange();
            },
            multiSelect(e, x, y, columnType) {
                this.$parent.multiSelect(e, x, y, columnType);
            },
            selectCell(e, x, y, type) {
                this.$parent.selectCell(e, x, y, type);
            },
            verifyDate(date, index, key) {
                if (!date) {
                    this.$parent.setErrors(index, key, true);
                    return true;
                }
                let result = date.match(/^(\d{1,4})(-|\/)(\d{1,2})\2(\d{1,2})$/);
                if (result == null) {
                    this.$parent.setErrors(index, key, false);
                    return false;
                }
                let d = new Date(result[1], result[3] - 1, result[4]);
                if (d.getFullYear() == result[1] && d.getMonth() + 1 == result[3] && d.getDate() == result[4]) {
                    this.$parent.setErrors(index, key, true);
                    return true;
                } else {
                    this.$parent.setErrors(index, key, false);
                    return false;
                }
            },
            verifyMonth(month, index, key) {
                if (!month) {
                    this.$parent.setErrors(index, key, true);
                    return true;
                }
                let result = month.match(/^(\d{1,4})(-|\/)(\d{1,2})$/);
                if (result == null) {
                    this.$parent.setErrors(index, key, false);
                    return false;
                }
                let d = new Date(result[1], result[3] - 1);
                if (d.getFullYear() == result[1] && d.getMonth() + 1 == result[3]) {
                    this.$parent.setErrors(index, key, true);
                    return true;
                } else {
                    this.$parent.setErrors(index, key, false);
                    return false;
                }
            },
            verifySelect(value, options, index, key) {
                if (!value) {
                    this.$parent.setErrors(index, key, true);
                    return true;
                }
                let arr = options.map(item => item.value);
                if (arr.includes(value)) {
                    this.$parent.setErrors(index, key, true);
                    return true;
                } else {
                    this.$parent.setErrors(index, key, false);
                    return false;
                }
            },
            verifyNumber(value, index, key) {
                if (isNaN(value)) {
                    this.$parent.setErrors(index, key, false);
                    return false;
                } else {
                    this.$parent.setErrors(index, key, true);
                    return true;
                }
            },
            format(value, type, format = true) {
                if (!format) return value;
                if (!value) return;
                if (type == 'number') {
                    if (!parseInt(value)) {
                        return value;
                    }
                    return parseInt(value).toLocaleString();
                }
                return value
            }
        }
    }
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