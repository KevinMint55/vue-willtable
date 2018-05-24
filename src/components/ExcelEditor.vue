<template>
    <div>
        <div 
            class="cell-editor" 
            :style="cellEditorStyle" 
            :class="{
                'else': editType != 'text' && editType != 'number'
            }"
            @dblclick="setEditing" 
            :title="editContent || curEditorCoverValue"
            v-show="editorShow">
            <textarea 
                ref="clipboard"
                class="clipboard" 
                @paste="clipboardToContent"></textarea>
            <div style="flex:1;" v-show="editing">
                <textarea v-model="editContent" ref="text" v-if="editType == 'text'"></textarea>
                <el-date-picker 
                    size="mini" 
                    v-model="editContent" 
                    value-format="yyyy-MM-dd" 
                    type="date" 
                    :style="{width:`${curEditorWidth > 140 ? curEditorWidth : 140}px`}" 
                    @blur="resetEditor"
                    v-else-if="editType == 'date'" 
                    ref="date"></el-date-picker>
                <el-select 
                    size="mini" 
                    :automatic-dropdown="true" 
                    v-model="editContent" 
                    :style="{width:`${curEditorWidth}px`}" 
                    v-else-if="editType == 'select'" 
                    placeholder="请选择"
                    clearable
                    ref="select">
                    <el-option 
                        v-for="item in options" 
                        :value="item.value" 
                        :key="item.value" 
                        :label="item.label"></el-option>
                </el-select>
                <textarea 
                    v-model="editContent" 
                    v-else-if="editType == 'number'" 
                    ref="number" 
                    @input="limitNumber(editContent)" 
                    @paste="limitNumber(editContent)"></textarea>
            </div>
        </div>
        <div 
            class="autofill-handler" 
            :style="autofillHandlerStyle" 
            @mousedown="autofill" 
            v-show="!editing&&editorShow">
        </div>
    </div>
</template>

<script>
    import clickoutside from '../mixins/clickoutside.js';
    import { DatePicker, Select, Option } from 'element-ui';

    export default {
        directives: { clickoutside },
        props: {
            editType: String,
            editing: Boolean,
            editorShow: Boolean,
            editorIsFixed: Boolean,
            options: {
                type: Array,
                default: () => {
                    return []
                }
            },
            curEditorWidth: [String, Number],
            tableScrollLeft: [String, Number],
            columns: {
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
            editorXIndex: [String, Number],
            editorYIndex: [String, Number],
            curEditorCoverValue: null,
            selectedYArr: {
                type: Array,
                default: () => {
                    return []
                }
            },
            autofillXIndex: [String, Number],
            autofillYIndex: [String, Number],
            fixedCount: [String, Number],
        },
        components: {
            'el-date-picker': DatePicker,
            'el-select': Select,
            'el-option': Option,
        },
        data() {
            return {
                editContent: '',
            }
        },
        computed: {
            cellEditorStyle() {
                let left;
                if (this.editorIsFixed) {
                    left = this.tableScrollLeft + this.columnsWidth.filter((item, index) => index < this.editorXIndex).reduce((sum, item) => {
                        return sum + item
                    }, 0)
                } else {
                    left = this.columnsWidth.filter((item, index) => index < this.editorXIndex).reduce((sum, item) => {
                        return sum + item
                    }, 0)
                }
                return {
                    'top': `${this.editorYIndex * 28}px`,
                    'left': `${left}px`,
                    'width': `${this.columnsWidth[this.editorXIndex]}px`,
                    'z-index': this.editorIsFixed ? 4 : 1
                }
            },
            autofillHandlerStyle() {
                let left;
                if (this.editorIsFixed && this.selectedYArr[0] == this.selectedYArr[1]) {
                    left = this.tableScrollLeft + this.columnsWidth.filter((item, index) => index < this.autofillXIndex).reduce((sum, item) => {
                        return sum + item
                    }, 0)
                } else {
                    left = this.columnsWidth.filter((item, index) => index < this.autofillXIndex).reduce((sum, item) => {
                        return sum + item
                    }, 0)
                }
                left = left + this.columnsWidth[this.autofillXIndex] - 5;
                return {
                    'top': `${this.autofillYIndex * 28 + 24}px`,
                    'left': `${left}px`,
                    'z-index': this.fixedCount > this.autofillXIndex ? 4 : 1
                }
            }
        },
        watch: {
            editing(val) {
                if (!val) {
                    if (this.columns[this.editorXIndex].type == 'number') {
                        this.limitNumber(this.editContent, true);
                    }
                    this.$parent.$parent.getEditorContent(this.editContent);
                    this.editContent = '';
                }
            }
        },
        methods: {
            // 限制输入数字
            limitNumber(val, format) {
                let nVal;
                try {
                    nVal = val.replace(/[^\d\.\-]/g, "");
                } catch (err) {
                    return;
                }
                if (/^0\d+/.test(nVal)) {
                    nVal = nVal.replace(/0/, "");
                }
                if (format && isNaN(nVal)) {
                    nVal = '';
                }
                this.editContent = nVal;
            },
            setEditing() {
                this.$parent.$parent.setEditing();
            },
            clipboardToContent(e) {
                this.$parent.$parent.clipboardToContent(e);
            },
            autofill() {
                this.$parent.$parent.autofill();
            },
            resetEditor() {
                this.$parent.$parent.resetEditor();
            }
        }
    }
</script>

<style lang="scss" scoped>
    // 编辑框
    .cell-editor {
      position: absolute;
      top: 30px;
      left: 0;
      display: flex;
      width: 200px;
      height: 28px;
      border: 1px solid #57a3f3;
      z-index: 4;
      overflow: hidden;
      &.else {
        overflow: visible;
        border: none;
      }
      textarea {
        width: 100%;
        height: 50px;
        outline: 0;
        resize: none;
        padding: 4px 6px;
        white-space: pre;
        border: none;
      }
    }

    .autofill-handler {
      position: absolute;
      top: 56px;
      left: 196px;
      width: 8px;
      height: 8px;
      border: 1px solid #57a3f3;
      background-color: #fff;
      cursor: crosshair;
      z-index: 5;
    }

    .clipboard {
      width: 0 !important;
      height: 0 0 !important;
      flex: 0 0 !important;
      padding: 0 !important;
    }
</style>