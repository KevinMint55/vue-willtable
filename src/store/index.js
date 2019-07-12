class TableStore {
  constructor() {
    this.states = {
      scrollBarWidth: 10,
      tableBodyLeft: 0,
      tableBodyTop: 0,
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

      isMac: false,

      adjustLineLeft: 0,
      adjustLineShow: false,
    };
  }

  tableBodyScroll(el) {
    this.states.tableBodyLeft = el.scrollLeft;
    this.states.tableBodyTop = el.scrollTop;
  }

  // 判断是否是mac
  handleIsMac() {
    if (/macintosh|mac os x/i.test(navigator.userAgent)) {
      this.states.isMac = true;
    }
  }

  // 编辑器
  getEditorContent(editContent) {
    const { states } = this;
    states.showData[states.editor.editorYIndex][states.columns[states.editor.editorXIndex].key] = editContent;
  }

  resetEditor() {
    const { states } = this;
    states.editor.editing = false;
    states.editor.editType = 'text';
  }

  // 自动填充
  handleAutofill() {
    const { states } = this;
    states.autofill.isAutofill = true;
    window.addEventListener('mouseup', this.autofillUp.bind(this));
  }

  autofillUp() {
    const { states } = this;
    if (states.autofill.autofillYArr[1] > states.selector.selectedYArr[1]) {
      for (let i = 0; i <= states.autofill.autofillYArr[1] - states.autofill.autofillYArr[0]; i += 1) {
        for (let j = 0; j <= states.selector.selectedXArr[1] - states.selector.selectedXArr[0]; j += 1) {
          if (states.columns[j + states.selector.selectedXArr[0]].type !== 'disabled') {
            states.showData[i + states.autofill.autofillYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] = states.showData[states.selector.selectedYArr[1]][states.columns[j + states.selector.selectedXArr[0]].key];
          }
        }
      }
      states.selector.selectedYArr.splice(1, 1, states.autofill.autofillYArr[1]);
      const autofillYIndex = states.autofill.autofillYArr[1];
      states.autofill.autofillYIndex = autofillYIndex;
    }
    if (states.autofill.autofillYArr[0] < states.selector.selectedYArr[0]) {
      for (let i = 0; i <= states.autofill.autofillYArr[1] - states.autofill.autofillYArr[0]; i += 1) {
        for (let j = 0; j <= states.selector.selectedXArr[1] - states.selector.selectedXArr[0]; j += 1) {
          if (states.columns[j + states.selector.selectedXArr[0]].type !== 'disabled') {
            states.showData[i + states.autofill.autofillYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] = states.showData[states.selector.selectedYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key];
          }
        }
      }
      states.selector.selectedYArr.splice(0, 1, states.autofill.autofillYArr[0]);
    }
    setTimeout(() => {
      states.autofill.autofillYArr = [];
      states.autofill.isAutofill = false;
    }, 0);
  }

  // 选择器
  multiSelect(e, x, y, columnType) {
    const { states } = this;
    if (columnType === 'selection') return;
    if (states.selector.isSelected) {
      setTimeout(() => {
        states.autofill.autofillXIndex = x > states.editor.editorXIndex ? x : states.editor.editorXIndex;
        states.autofill.autofillYIndex = y > states.editor.editorYIndex ? y : states.editor.editorYIndex;
        states.selector.selectedXIndex = x;
        states.selector.selectedYIndex = y;
        if (states.selector.selectedXIndex > states.editor.editorXIndex) {
          states.selector.selectedXArr.splice(0, 1, states.editor.editorXIndex);
          states.selector.selectedXArr.splice(1, 1, states.selector.selectedXIndex);
        } else {
          states.selector.selectedXArr.splice(0, 1, states.selector.selectedXIndex);
          states.selector.selectedXArr.splice(1, 1, states.editor.editorXIndex);
        }
        if (states.selector.selectedYIndex > states.editor.editorYIndex) {
          states.selector.selectedYArr.splice(0, 1, states.editor.editorYIndex);
          states.selector.selectedYArr.splice(1, 1, states.selector.selectedYIndex);
        } else {
          states.selector.selectedYArr.splice(0, 1, states.selector.selectedYIndex);
          states.selector.selectedYArr.splice(1, 1, states.editor.editorYIndex);
        }
      }, 0);
    }
    if (states.autofill.isAutofill) {
      if (y > states.selector.selectedYArr[1]) {
        states.autofill.autofillYArr = [states.selector.selectedYArr[1] + 1, y];
      } else if (y < states.selector.selectedYArr[0]) {
        states.autofill.autofillYArr = [y, states.selector.selectedYArr[0] - 1];
      } else {
        states.autofill.autofillYArr = [];
      }
    }
  }

  openDropdown(i, columnsStatusList) {
    const { states } = this;
    if (typeof (i) === 'number') {
      if (states.dropdown.index === i) {
        states.dropdown.index = null;
      } else {
        states.dropdown.index = i;
        states.dropdown = JSON.parse(JSON.stringify({
          ...columnsStatusList[states.dropdown.index],
          index: states.dropdown.index,
        }));
      }
    } else {
      states.dropdown.index = null;
    }
  }

  selectAllCells() {
    const { states } = this;
    states.selector.selectedXIndex = states.editor.editorRange.minX;
    states.selector.selectedYIndex = states.editor.editorRange.minY;
    states.selector.selectedXArr = [states.editor.editorRange.minX, states.editor.editorRange.maxX];
    states.selector.selectedYArr = [states.editor.editorRange.minY, states.editor.editorRange.maxY];
  }
}

export default TableStore;
