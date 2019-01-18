import Vue from 'vue';

export default () => new Vue({
  data() {
    return {
      columns: [],
      showData: [],

      // 编辑器
      editor: {
        editorRange: {},
        editorXIndex: 0,
        editorYIndex: 0,
        curEditorCoverValue: '',
        editorShow: false,
        editorIsFixed: false,
        editing: false,
        editType: 'text',
        options: [],
        curEditorWidth: 80,
      },

      // 自动填充
      autofill: {
        autofillXIndex: 0,
        autofillYIndex: 0,
        isAutofill: false,
        autofillYArr: [],
      },

      // 选择区域
      selector: {
        isSelected: false,
        selectedXIndex: 0,
        selectedYIndex: 0,
        selectedXArr: [],
        selectedYArr: [],
      },

      filters: {},
      dropdown: {
        index: null,
        list: {},
        key: '',
        sort: '',
      },
    };
  },
  methods: {
    // 编辑器
    getEditorContent(editContent) {
      this.showData[this.editor.editorYIndex][this.columns[this.editor.editorXIndex].key] = editContent;
    },
    resetEditor() {
      this.editor.editing = false;
      this.editor.editType = 'text';
    },
    // 自动填充
    handleAutofill() {
      this.autofill.isAutofill = true;
      window.addEventListener('mouseup', this.autofillUp);
    },
    autofillUp() {
      if (this.autofill.autofillYArr[1] > this.selector.selectedYArr[1]) {
        for (let i = 0; i <= this.autofill.autofillYArr[1] - this.autofill.autofillYArr[0]; i += 1) {
          for (let j = 0; j <= this.selector.selectedXArr[1] - this.selector.selectedXArr[0]; j += 1) {
            if (this.columns[j + this.selector.selectedXArr[0]].type !== 'disabled') {
              this.showData[i + this.autofill.autofillYArr[0]][this.columns[j + this.selector.selectedXArr[0]].key] = this.showData[this.selector.selectedYArr[1]][this.columns[j + this.selector.selectedXArr[0]].key];
            }
          }
        }
        this.selector.selectedYArr.splice(1, 1, this.autofill.autofillYArr[1]);
        const autofillYIndex = this.autofill.autofillYArr[1];
        this.autofill.autofillYIndex = autofillYIndex;
      }
      if (this.autofill.autofillYArr[0] < this.selector.selectedYArr[0]) {
        for (let i = 0; i <= this.autofill.autofillYArr[1] - this.autofill.autofillYArr[0]; i += 1) {
          for (let j = 0; j <= this.selector.selectedXArr[1] - this.selector.selectedXArr[0]; j += 1) {
            if (this.columns[j + this.selector.selectedXArr[0]].type !== 'disabled') {
              this.showData[i + this.autofill.autofillYArr[0]][this.columns[j + this.selector.selectedXArr[0]].key] = this.showData[this.selector.selectedYArr[0]][this.columns[j + this.selector.selectedXArr[0]].key];
            }
          }
        }
        this.selector.selectedYArr.splice(0, 1, this.autofill.autofillYArr[0]);
      }
      setTimeout(() => {
        this.autofill.autofillYArr = [];
        this.autofill.isAutofill = false;
      }, 0);
    },
    // 选择器
    multiSelect(e, x, y, columnType) {
      if (columnType === 'selection') return;
      if (this.selector.isSelected) {
        this.autofill.autofillXIndex = x > this.editor.editorXIndex ? x : this.editor.editorXIndex;
        this.autofill.autofillYIndex = y > this.editor.editorYIndex ? y : this.editor.editorYIndex;
        this.selector.selectedXIndex = x;
        this.selector.selectedYIndex = y;
        if (this.selector.selectedXIndex > this.editor.editorXIndex) {
          this.selector.selectedXArr.splice(0, 1, this.editor.editorXIndex);
          this.selector.selectedXArr.splice(1, 1, this.selector.selectedXIndex);
        } else {
          this.selector.selectedXArr.splice(0, 1, this.selector.selectedXIndex);
          this.selector.selectedXArr.splice(1, 1, this.editor.editorXIndex);
        }
        if (this.selector.selectedYIndex > this.editor.editorYIndex) {
          this.selector.selectedYArr.splice(0, 1, this.editor.editorYIndex);
          this.selector.selectedYArr.splice(1, 1, this.selector.selectedYIndex);
        } else {
          this.selector.selectedYArr.splice(0, 1, this.selector.selectedYIndex);
          this.selector.selectedYArr.splice(1, 1, this.editor.editorYIndex);
        }
      }
      if (this.autofill.isAutofill) {
        if (y > this.selector.selectedYArr[1]) {
          this.autofill.autofillYArr = [this.selector.selectedYArr[1] + 1, y];
        } else if (y < this.selector.selectedYArr[0]) {
          this.autofill.autofillYArr = [y, this.selector.selectedYArr[0] - 1];
        } else {
          this.autofill.autofillYArr = [];
        }
      }
    },
    // 下拉
    openDropdown(i, columnsStatusList) {
      console.log(i, columnsStatusList);
      if (typeof (i) === 'number') {
        if (this.dropdown.index === i) {
          this.dropdown.index = null;
        } else {
          this.dropdown.index = i;
          this.dropdown = JSON.parse(JSON.stringify({
            ...columnsStatusList[this.dropdown.index],
            index: this.dropdown.index,
          }));
        }
      } else {
        this.dropdown.index = null;
      }
    },
  },
});
