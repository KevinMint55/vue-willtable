import {
  verifyDate,
  verifyMonth,
  verifySelect,
  verifyNumber,
} from '../mixins/verify';

class TableStore {
  constructor() {
    this.states = {
      tableWidth: null,
      tableHeight: null,
      mainWidth: null,
      mainHeight: null,
      rowHeight: 28,
      theaderHeight: 30,
      scrollBarWidth: 8,
      tableBodyLeft: 0,
      tableBodyTop: 0,
      columns: [],
      data: [],
      showData: [],
      domData: [],
      initialData: null,
      changeData: [],
      dataStatusList: [],
      columnsStatusList: [],

      // editor
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

      // autofill
      autofill: {
        autofillXIndex: 0,
        autofillYIndex: 0,
        isAutofill: false,
        autofillYArr: [],
      },

      // selection area
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

      // history data
      historyData: [],
      curHisory: 0,
      isOperation: false,

      // custom scrollbars
      scrollbar: {
        posX: 0,
        posY: 0,
        xWidth: 0,
        yHeight: 0,
      },

      visibleRowStartIndex: 0,
      visibleRowEndIndex: 0,
    };
  }

  calcDomData() {
    const { states } = this;
    states.visibleRowStartIndex = Math.floor(states.tableBodyTop / states.rowHeight);
    states.visibleRowEndIndex = states.visibleRowStartIndex + Math.ceil(states.mainHeight / states.rowHeight);
    states.domData = states.showData.slice(states.visibleRowStartIndex, states.visibleRowEndIndex + 1);
  }

  initScrollBarLength() {
    const { states } = this;
    const barWidth = states.mainWidth / states.tableWidth * states.mainWidth;
    if (barWidth > states.mainWidth) {
      states.scrollbar.xWidth = 0;
    } else if (barWidth <= 20) {
      states.scrollbar.xWidth = 20;
    } else {
      states.scrollbar.xWidth = barWidth;
    }
    const barHeight = states.mainHeight / states.tableHeight * states.mainHeight;
    if (barHeight > states.mainHeight) {
      states.scrollbar.yHeight = 0;
    } else if (barHeight <= 20) {
      states.scrollbar.yHeight = 20;
    } else {
      states.scrollbar.yHeight = barHeight;
    }
  }

  setScrollStatus(tableBodyTop, tableBodyLeft) {
    const { states } = this;
    if (tableBodyTop <= 0) {
      states.tableBodyTop = 0;
    } else if (tableBodyTop > states.tableHeight - states.mainHeight) {
      states.tableBodyTop = states.tableHeight - states.mainHeight;
    } else {
      states.tableBodyTop = tableBodyTop;
    }
    if (tableBodyLeft <= 0) {
      states.tableBodyLeft = 0;
    } else if (tableBodyLeft > states.tableWidth - states.mainWidth) {
      states.tableBodyLeft = states.tableWidth - states.mainWidth;
    } else {
      states.tableBodyLeft = tableBodyLeft;
    }
    states.scrollbar.posX = states.tableBodyLeft / (states.tableWidth - states.mainWidth) * (states.mainWidth - states.scrollbar.xWidth);
    states.scrollbar.posY = states.tableBodyTop / (states.tableHeight - states.mainHeight) * (states.mainHeight - states.scrollbar.yHeight);
  }

  handleIsMac() {
    if (/macintosh|mac os x/i.test(navigator.userAgent)) {
      this.states.isMac = true;
    }
  }

  // editor
  getEditorContent(editContent) {
    const { states } = this;
    states.showData[states.editor.editorYIndex][states.columns[states.editor.editorXIndex].key] = editContent;
  }

  resetEditor() {
    const { states } = this;
    states.editor.editing = false;
    states.editor.editType = 'text';
  }

  // autofill
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
          if (!states.columns[j + states.selector.selectedXArr[0]].disabled) {
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
          if (!states.columns[j + states.selector.selectedXArr[0]].disabled) {
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

  // selector
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

  openDropdown(i) {
    const { states } = this;
    if (typeof (i) === 'number') {
      if (states.dropdown.index === i) {
        states.dropdown.index = null;
      } else {
        states.dropdown.index = i;
        states.dropdown = JSON.parse(JSON.stringify({
          ...states.columnsStatusList[states.dropdown.index],
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

  handleFilters() {
    const { states } = this;
    states.columnsStatusList.forEach((th) => {
      if (th.type === 'selection') return;
      if (th.list) {
        Object.keys(th.list).forEach((item) => {
          th.list[item].count = 0;
        });
      } else {
        th.list = {};
      }
      states.data.forEach((td) => {
        if (td[th.key]) {
          if (th.list[td[th.key]]) {
            th.list[td[th.key]].count += 1;
          } else {
            th.list[td[th.key]] = {};
            th.list[td[th.key]].count = 1;
          }
        }
      });
      Object.keys(th.list).forEach((item) => {
        if (th.list[item].count === 0) {
          delete th.list[item];
        }
      });
    });
  }

  // handle error data
  handleErrors() {
    const { states } = this;
    setTimeout(() => {
      states.dataStatusList.forEach((item, yIndex) => {
        states.columns.forEach((column) => {
          if (this.verify(column, states.data[yIndex][column.key])) {
            if (item.errors.includes(column.key)) {
              item.errors.splice(item.errors.indexOf(column.key), 1);
            }
          } else {
            if (!item.errors.includes(column.key)) {
              item.errors.push(column.key);
            }
          }
        });
      });
    }, 0);
  }

  verify(column, value) {
    if (!value || column.noVerify) {
      return true;
    }
    let correct;
    if (column.validate) {
      correct = column.validate(value);
    } else {
      switch (column.type) {
        case 'date':
          correct = verifyDate(value);
          break;
        case 'month':
          correct = verifyMonth(value);
          break;
        case 'select':
          correct = verifySelect(value, column.options);
          break;
        case 'number':
          correct = verifyNumber(value);
          break;
        default:
          correct = true;
      }
    }
    return correct;
  }

  sort(type) {
    const { states } = this;
    states.columnsStatusList.forEach((item) => {
      item.sort = '';
    });
    states.columnsStatusList[states.dropdown.index].sort = type;
    if (type === 'ascending') {
      states.showData.sort((x, y) => (x[states.columnsStatusList[states.dropdown.index].key] > y[states.columnsStatusList[states.dropdown.index].key] ? 1 : -1));
    } else {
      states.showData.sort((x, y) => (x[states.columnsStatusList[states.dropdown.index].key] > y[states.columnsStatusList[states.dropdown.index].key] ? -1 : 1));
    }
    states.dropdown.index = null;
  }

  // filter
  handleFilter() {
    const { states } = this;
    states.columnsStatusList[states.dropdown.index] = {
      list: states.dropdown.list,
      key: states.dropdown.key,
      sort: states.dropdown.sort,
    };
    const arr = [];
    Object.keys(states.dropdown.list).forEach((key) => {
      if (states.dropdown.list[key].checked) {
        arr.push(key);
      }
    });
    states.filters[states.columnsStatusList[states.dropdown.index].key] = arr;
    this.filterData();
  }

  resetFilter() {
    const { states } = this;
    delete states.filters[states.columnsStatusList[states.dropdown.index].key];
    Object.keys(states.columnsStatusList[states.dropdown.index].list).forEach((key) => {
      states.columnsStatusList[states.dropdown.index].list[key].checked = false;
    });
    this.filterData();
  }

  filterData() {
    const { states } = this;
    states.showData = states.data;
    Object.keys(states.filters).forEach((key) => {
      states.showData = states.showData.filter((item) => states.filters[key].includes(item[key].toString()));
    });
    states.dropdown.index = null;
  }

  handleChangeData() {
    const { states } = this;
    const data = JSON.parse(JSON.stringify(states.data));
    const initialData = JSON.parse(JSON.stringify(states.initialData));
    states.changeData = data.filter((item, index) => JSON.stringify(item) !== JSON.stringify(initialData[index]));
  }

  // undo and recovery
  operation(type) {
    const { states } = this;
    if (!states.editor.editing) {
      if (type === 'undo' && states.curHisory > 1) {
        states.curHisory -= 1;
      }
      if (type === 'recovery' && states.curHisory < states.historyData.length) {
        states.curHisory += 1;
      }
      states.isOperation = true;
      JSON.parse(states.historyData[states.curHisory - 1]).forEach((i, index) => {
        Object.keys(i).forEach((j) => {
          states.data[index][j] = i[j];
        });
      });
      setTimeout(() => {
        states.isOperation = false;
      }, 0);
    }
  }

  // delete the selected data
  clearSelected(disabledCell) {
    const { states } = this;
    for (let i = 0; i <= states.selector.selectedYArr[1] - states.selector.selectedYArr[0]; i += 1) {
      for (let j = 0; j <= states.selector.selectedXArr[1] - states.selector.selectedXArr[0]; j += 1) {
        if (!states.columns[j + states.selector.selectedXArr[0]].disabled && !disabledCell({
          row: states.showData[i + states.selector.selectedYArr[0]], column: states.columns[j + states.selector.selectedXArr[0]], rowIndex: i + states.selector.selectedYArr[0], columnIndex: j + states.selector.selectedXArr[0],
        })) {
          states.showData[i + states.selector.selectedYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] = '';
        }
      }
    }
  }
}

export default TableStore;
