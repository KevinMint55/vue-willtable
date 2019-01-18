<template>
  <div>
    <div
      class="cell-editor"
      :style="cellEditorStyle"
      :class="{
        'else': store.editor.editType != 'text' && store.editor.editType != 'number'
      }"
      @dblclick="setEditing"
      :title="editContent || store.editor.curEditorCoverValue"
      v-show="store.editor.editorShow">
      <textarea
        ref="clipboard"
        class="clipboard"
        @paste="clipboardToContent">
      </textarea>
      <div style="flex:1;" v-show="store.editor.editing">
        <textarea v-model="editContent" ref="text" v-if="store.editor.editType == 'text'"></textarea>
        <el-date-picker
          size="mini"
          v-model="editContent"
          value-format="yyyy-MM-dd"
          type="date"
          :style="{width:`${store.editor.curEditorWidth > 140 ? store.editor.curEditorWidth : 140}px`}"
          @blur="resetEditor"
          v-else-if="store.editor.editType === 'date'"
          ref="date">
        </el-date-picker>
        <el-date-picker
          size="mini"
          v-model="editContent"
          value-format="yyyy-MM"
          type="month"
          :style="{width:`${store.editor.curEditorWidth > 140 ? store.editor.curEditorWidth : 140}px`}"
          @blur="resetEditor"
          v-else-if="store.editor.editType === 'month'"
          ref="month">
        </el-date-picker>
        <el-select
          size="mini"
          :automatic-dropdown="true"
          v-model="editContent"
          :style="{width:`${store.editor.curEditorWidth}px`}"
          v-else-if="store.editor.editType === 'select'"
          placeholder="请选择"
          clearable
          ref="select">
          <el-option
            v-for="item in store.editor.options"
            :value="item.value"
            :key="item.value"
            :label="item.label">
          </el-option>
        </el-select>
        <textarea
          v-model="editContent"
          v-else-if="store.editor.editType === 'number'"
          ref="number"
          @input="limitNumber(editContent)"
          @paste="limitNumber(editContent)">
        </textarea>
      </div>
    </div>
    <div
      class="autofill-handler"
      :style="autofillHandlerStyle"
      @mousedown="handleAutofill"
      v-show="!store.editor.editing && store.editor.editorShow">
    </div>
  </div>
</template>

<script>
import { DatePicker, Select, Option } from 'element-ui';
import clickoutside from '../directives/clickoutside';

export default {
  directives: { clickoutside },
  inject: ['store'],
  props: {
    tableScrollLeft: [String, Number],
    columnsWidth: {
      type: Array,
      default: () => [],
    },
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
    };
  },
  computed: {
    cellEditorStyle() {
      let left;
      if (this.store.editor.editorIsFixed) {
        left = this.tableScrollLeft + this.columnsWidth.filter((item, index) => index < this.store.editor.editorXIndex).reduce((sum, item) => sum + item, 0);
      } else {
        left = this.columnsWidth.filter((item, index) => index < this.store.editor.editorXIndex).reduce((sum, item) => sum + item, 0);
      }
      return {
        top: `${this.store.editor.editorYIndex * 28}px`,
        left: `${left}px`,
        width: `${this.columnsWidth[this.store.editor.editorXIndex]}px`,
        'z-index': this.store.editor.editorIsFixed ? 4 : 1,
      };
    },
    autofillHandlerStyle() {
      let left;
      if (this.store.editor.editorIsFixed && this.store.selector.selectedYArr[0] === this.store.selector.selectedYArr[1]) {
        left = this.tableScrollLeft + this.columnsWidth.filter((item, index) => index < this.store.autofill.autofillXIndex).reduce((sum, item) => sum + item, 0);
      } else {
        left = this.columnsWidth.filter((item, index) => index < this.store.autofill.autofillXIndex).reduce((sum, item) => sum + item, 0);
      }
      left = left + this.columnsWidth[this.store.autofill.autofillXIndex] - 5;
      return {
        top: `${this.store.autofill.autofillYIndex * 28 + 24}px`,
        left: `${left}px`,
        'z-index': this.fixedCount > this.store.autofill.autofillXIndex ? 4 : 1,
      };
    },
  },
  watch: {
    'store.editor.editing': {
      handler(val) {
        console.log('editing', val);
        if (!val) {
          if (this.store.columns[this.store.editor.editorXIndex].type === 'number') {
            this.limitNumber(this.editContent, true);
          }
          this.store.getEditorContent(this.editContent);
          this.editContent = '';
        }
      },
    },
  },
  methods: {
    // 限制输入数字
    limitNumber(val, format) {
      let nVal;
      try {
        nVal = val.replace(/[^\d.-]/g, '');
      } catch (err) {
        return;
      }
      if (/^0\d+/.test(nVal)) {
        nVal = nVal.replace(/0/, '');
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
    handleAutofill() {
      this.store.handleAutofill();
    },
    resetEditor() {
      this.store.resetEditor();
    },
  },
};
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
