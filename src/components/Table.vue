<template>
  <div
    ref="willtable"
    class="ww-willtable"
    :style="{
      width: allSetWidth && (tableWidth <= wrapperWidth) ? `${tableWidth}px` : ''
    }"
  >
    <div
      v-show="store.states.columns.length > 0"
      ref="wrapper"
      class="ww-table-wrapper"
      :class="{
        scrollX: tableWidth > wrapperWidth,
        scrollY: tableHeight > maxHeight
      }"
      v-clickoutside="clickoutside"
    >
      <table-header
        ref="theader"
        :showIcon="showIcon"
        :columnsWidth="columnsWidth"
        :fixedCount="fixedCount"
        :all-show="true"
        :store="store"
      />
      <table-body
        ref="tbody"
        :disabled="disabled"
        :disabledCell="disabledCell"
        :columnsWidth="columnsWidth"
        :all-show="true"
        :cellStyle="cellStyle"
        :cellClassName="cellClassName"
        :store="store"
        :style="{
          maxHeight: `${maxHeight}px`
        }"
      >
      </table-body>
      <!-- 编辑器 -->
      <editor
        ref="editor"
        :columnsWidth="columnsWidth"
        :fixedCount="fixedCount"
        :store="store"
      />
      <table-header
        ref="fixedTheader"
        :style="{width: `${fixedWidth}px`}"
        :fixed="true"
        :showIcon="showIcon"
        :columnsWidth="columnsWidth"
        :fixedCount="fixedCount"
        :store="store"
      />
      <table-body
        ref="fixedTbody"
        :disabled="disabled"
        :disabledCell="disabledCell"
        :style="{width: `${fixedWidth}px`}"
        :fixed="true"
        :columnsWidth="columnsWidth"
        :cellStyle="cellStyle"
        :cellClassName="cellClassName"
        :store="store"
        :scrollY="tableHeight > maxHeight"
      />
    </div>
    <div
      v-show="store.states.columns.length === 0"
      class="ww-empty-columns"
    >
      暂无表头
    </div>
    <dropdown
      :columnsWidth="columnsWidth"
      :fixedCount="fixedCount"
      :store="store"
    >
    </dropdown>
    <div
      class="ww-adjustLine"
      :style="{ left: `${store.states.adjustLineLeft}px` }"
      v-show="store.states.adjustLineShow"
    ></div>
    <scroll
      v-if="tableWidth > wrapperWidth"
      barType="x"
      :store="store"
    >
    </scroll>
    <scroll
      barType="y"
      :store="store"
    >
    </scroll>
  </div>
</template>

<script>
import '../style/reset.scss';
import TableStore from '../store';
import clickoutside from '../directives/clickoutside';
import methods from '../mixins/methods';
import events from '../mixins/events';
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';
import Editor from './TableEditor.vue';
import Dropdown from './TableDropdown.vue';
import Scroll from './TableScroll.vue';

export default {
  name: 'vue-willtable',
  directives: { clickoutside },
  components: {
    TableHeader,
    TableBody,
    Editor,
    Dropdown,
    Scroll,
  },
  props: {
    value: {
      type: Array,
      default: () => ([]),
    },
    columns: {
      type: Array,
      default: () => ([]),
    },
    maxHeight: {
      type: [String, Number],
      default: () => window.innerHeight,
    },
    rowHeight: {
      type: [String, Number],
      default: 28,
    },
    theaderHeight: {
      type: [String, Number],
      default: 30,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    showIcon: {
      type: Boolean,
      default: false,
    },
    cellStyle: {
      type: [Object, Function],
      default: () => () => ({}),
    },
    cellClassName: {
      type: [Object, Function],
      default: () => () => ({}),
    },
    disabledCell: {
      type: [Object, Function],
      default: () => () => false,
    },
  },
  data() {
    const store = new TableStore();
    return {
      store,
      wrapperWidth: null,
      columnsWidth: [],
      allSetWidth: false,

      data: [],
      scrollLeftArr: [],
      scrollTopArr: [],
      fixedCount: 0,
      fixedWidth: 0,

      // 鼠标
      mouseX: 0,
      mouseY: 0,

      excelPos: {},
    };
  },
  computed: {
    tableWidth() {
      return this.store.states.tableWidth;
    },
    tableHeight() {
      return this.store.states.tableHeight;
    },
    tableBodyTop() {
      return this.store.states.tableBodyTop;
    },
    tableBodyLeft() {
      return this.store.states.tableBodyLeft;
    },
  },
  watch: {
    value(val) {
      this.data = val;
    },
    data: {
      handler(val) {
        const { states } = this.store;
        if (!states.isOperation) {
          if (states.historyData.length !== states.curHisory) {
            states.historyData = states.historyData.slice(0, states.curHisory);
          }
          states.historyData.push(JSON.stringify(val));
          states.curHisory += 1;
        }
        this.$emit('input', val);
        if (!states.initialData) {
          this.initData();
        }
        this.store.handleFilters();
        this.store.handleChangeData();
        this.store.handleErrors();
        this.handleResize();
      },
      deep: true,
    },
    columns: {
      handler() {
        this.initColumns();
        this.store.handleFilters();
        setTimeout(() => {
          this.handleResize();
        }, 0);
      },
      deep: true,
    },
    tableBodyTop() {
      this.store.calcDomData();
    },
    tableBodyLeft() {
      this.store.states.dropdown.index = null;
    },
  },
  mounted() {
    this.init();
  },
  mixins: [methods, events],
  methods: {
    init() {
      if (this.value.length > 0) {
        this.data = this.value;
      }
      this.store.states.rowHeight = this.rowHeight;
      window.addEventListener('resize', () => {
        this.handleResize();
      });
      this.store.handleIsMac();
      this.initColumns();
      this.handleResize();
      this.handleMousewheel();
    },
    // 鼠标滚轮处理
    handleMousewheel() {
      const { states } = this.store;
      const mainWrapperWheel = (e) => {
        e.preventDefault();
        if (this.tableHeight <= this.maxHeight) return;
        let { tableBodyTop } = states;
        let { tableBodyLeft } = states;
        if (e.wheelDelta) {
          if (e.wheelDeltaY) {
            tableBodyTop -= e.wheelDelta;
          } else {
            tableBodyLeft -= e.wheelDelta;
          }
        } else {
          if (e.axis === 2) {
            tableBodyTop += 40 * e.detail;
          } else {
            tableBodyLeft += 40 * e.detail;
          }
        }
        this.store.setScrollStatus(tableBodyTop, tableBodyLeft);
      };
      this.$refs.willtable.addEventListener('mousewheel', mainWrapperWheel);
      this.$refs.willtable.addEventListener('DOMMouseScroll', mainWrapperWheel);
    },
    initColumns() {
      const { states } = this.store;
      const fixedArr = this.columns.filter((item) => item.fixed);
      const unFixedArr = this.columns.filter((item) => !item.fixed);
      states.columns = fixedArr.concat(unFixedArr).map((item) => {
        if (item.width) {
          item.width = parseInt(item.width, 10);
        }
        return { ...item };
      });
      this.columnsWidth = states.columns.map((item) => item.width);
      states.columnsStatusList = states.columns.map((item) => ({
        key: item.key,
        type: item.type,
        list: {},
        sort: '',
      }));
      states.filters = {};
    },
    initData() {
      const { states } = this.store;
      states.data = this.data;
      states.showData = this.data;
      states.dataStatusList = this.data.map(() => ({
        checked: false,
        errors: [],
      }));
      states.initialData = JSON.parse(JSON.stringify(states.data));
      states.historyData = [JSON.stringify(states.data)];
      states.curHisory = 1;
      if (this.$refs.theader) {
        this.$refs.theader.checkedAll = false;
      }
      if (this.$refs.fixedTheader) {
        this.$refs.fixedTheader.checkedAll = false;
      }
      this.initColumns();
    },
    handleResize() {
      const { states } = this.store;
      this.excelPos = this.$refs.willtable.getBoundingClientRect();
      // 获取编辑框可移动范围, X是横轴, Y是竖轴
      states.editor.editorRange = {
        minX: states.columns.filter((item) => item.type === 'selection').length,
        maxX: states.columns.length - 1,
        minY: 0,
        maxY: states.showData.length - 1,
      };

      this.wrapperWidth = this.$refs.wrapper.offsetWidth;

      this.$nextTick(() => {
        // 计算剩余列宽度
        const surplusColumns = states.columns.filter((item) => !item.width);
        let surplusColumnAvg;

        if (!this.$refs.tbody.$el) return;
        if (surplusColumns.length > 0) {
          const surplusWidth = this.wrapperWidth - states.columns.filter((item) => item.width).reduce((total, item) => total + item.width, 0);
          if (surplusWidth > 0) {
            if (this.$refs.tbody.$el.offsetHeight > this.maxHeight) {
              surplusColumnAvg = (surplusWidth - 1 - states.scrollBarWidth) / surplusColumns.length;
            } else {
              surplusColumnAvg = (surplusWidth - 1) / surplusColumns.length;
            }
          }
        }

        // 设置单元格宽度
        states.columns.forEach((column, index) => {
          if (column.width) {
            this.$set(this.columnsWidth, index, column.width);
          } else {
            // 设置单元格最小宽度
            if (surplusColumnAvg > 80) {
              this.$set(this.columnsWidth, index, surplusColumnAvg);
            } else {
              this.$set(this.columnsWidth, index, 80);
            }
          }
        });

        this.scrollLeftArr = this.columnsWidth.map((item, index) => {
          const sum = this.columnsWidth.reduce((total, curVal, curIndex) => {
            if (curIndex <= index) {
              return total + curVal;
            }
            return total;
          }, 0);
          return sum;
        });

        this.scrollTopArr = states.showData.map((item, index) => {
          const sum = states.showData.reduce((total, curVal, curIndex) => {
            if (curIndex <= index) {
              return total + parseInt(this.rowHeight, 10);
            }
            return total;
          }, 0);
          return sum;
        });
        this.scrollTopArr.unshift(0);

        this.fixedCount = states.columns.filter((item) => item.fixed).length;
        this.fixedWidth = this.scrollLeftArr[this.fixedCount - 1] || 0;

        // 如果每列均设置了宽度
        this.allSetWidth = states.columns.every((cell) => cell.width);
        if (this.allSetWidth) {
          states.tableWidth = states.columns.map((cell) => cell.width).reduce((a, b) => a + b, 0);
        } else {
          states.tableWidth = this.columnsWidth.reduce((total, cur) => total + cur, 0);
          if (states.tableWidth < this.wrapperWidth) {
            states.tableWidth = this.wrapperWidth;
          }
        }
      });
      states.theaderHeight = this.theaderHeight;
      states.mainWidth = this.$refs.wrapper.offsetWidth - states.scrollBarWidth;
      states.mainHeight = this.maxHeight + this.theaderHeight;
      states.tableHeight = states.showData.length * this.rowHeight + this.theaderHeight;
      this.store.initScrollBarLength();
      this.store.calcDomData();
    },
    clickoutside() {
      const { states } = this.store;
      if (states.selector.isSelected || states.autofill.isAutofill) return;
      states.editor.editing = false;
      states.editor.editorShow = false;
      states.selector.selectedXArr = [];
      states.selector.selectedYArr = [];
      window.removeEventListener('keydown', this.keySubmit);
      window.removeEventListener('mousemove', this.multiSelectAdjustPostion);
    },
    // 选择单元格
    selectCell(e, x, y, type) {
      if (e.button !== 0) return;
      const { states } = this.store;
      window.addEventListener('keydown', this.keySubmit);
      window.addEventListener('mousemove', this.multiSelectAdjustPostion);
      if (type === 'selection') return;
      window.addEventListener('mouseup', this.selectUp);
      states.editor.editing = false;
      states.editor.editType = 'text';
      states.editor.editorShow = true;
      states.autofill.autofillXIndex = x;
      states.autofill.autofillYIndex = y;
      states.selector.selectedXIndex = x;
      states.selector.selectedYIndex = y;
      states.selector.selectedXArr = [x, x];
      states.selector.selectedYArr = [y, y];
      states.selector.isSelected = true;
      this.$nextTick(() => {
        states.editor.editorXIndex = x;
        states.editor.editorYIndex = y;
        states.editor.curEditorCoverValue = states.showData[states.editor.editorYIndex][states.columns[states.editor.editorXIndex].key];
        this.$nextTick(() => {
          this.adjustPosition();
          this.$refs.editor.$refs.clipboard.focus();
        });
      });
    },
    keySubmit(e) {
      const { states } = this.store;
      const { keyCode, ctrlKey, metaKey } = e;
      if ((ctrlKey && keyCode === 90) || (metaKey && keyCode === 90)) {
        return this.store.operation('undo');
      }
      if ((ctrlKey && keyCode === 89) || (metaKey && keyCode === 89)) {
        return this.store.operation('recovery');
      }
      if (states.editor.editing && (keyCode === 13 || keyCode === 27)) {
        states.editor.editing = false;
        states.editor.editType = 'text';
        return;
      }
      if (states.editor.editing || !states.editor.editorShow) {
        return;
      }
      if ((ctrlKey && keyCode === 67) || (metaKey && keyCode === 67)) {
        return this.getContentToclipboard();
      }
      if ((ctrlKey && keyCode === 65) || (metaKey && keyCode === 65)) {
        return this.store.selectAllCells();
      }
      if (ctrlKey || metaKey) {
        return;
      }
      e.preventDefault();
      const isImportability = (k) => {
        if ((k >= 65 && k <= 90) || (k >= 48 && k <= 57) || (k >= 96 && k <= 107) || (k >= 109 && k <= 111) || k === 32 || (k >= 186 && k <= 222)) {
          return true;
        }
        return false;
      };
      switch (true) {
        case keyCode === 37:
          // 左
          if (states.editor.editorXIndex === states.editor.editorRange.minX) {
            states.editor.editorXIndex = states.editor.editorRange.minX;
          } else {
            states.editor.editorXIndex -= 1;
          }
          this.adjustPosition();
          break;
        case keyCode === 38:
          // 上
          if (states.editor.editorYIndex === states.editor.editorRange.minY) {
            states.editor.editorYIndex = states.editor.editorRange.minY;
          } else {
            states.editor.editorYIndex -= 1;
          }
          this.adjustPosition();
          break;
        case keyCode === 39:
          // 右
          if (states.editor.editorXIndex === states.editor.editorRange.maxX) {
            states.editor.editorXIndex = states.editor.editorRange.maxX;
          } else {
            states.editor.editorXIndex += 1;
          }
          this.adjustPosition();
          break;
        case keyCode === 40:
          // 下
          if (states.editor.editorYIndex === states.editor.editorRange.maxY) {
            states.editor.editorYIndex = states.editor.editorRange.maxY;
          } else {
            states.editor.editorYIndex += 1;
          }
          this.adjustPosition();
          break;
        case keyCode === 8 || keyCode === 46:
          // 删除
          if (this.disabled) return;
          this.store.clearSelected(this.disabledCell);
          break;
        case keyCode === 13:
          this.setEditing();
          break;
        case isImportability(keyCode) || e.key === 'Process' || e.key === 'Unidentified':
          this.setEditing(e.key);
          break;
      }
    },
    getContentToclipboard() {
      const { states } = this.store;
      let content = '';
      for (let i = 0; i <= states.selector.selectedYArr[1] - states.selector.selectedYArr[0]; i += 1) {
        for (let j = 0; j <= states.selector.selectedXArr[1] - states.selector.selectedXArr[0]; j += 1) {
          if (states.selector.selectedXArr[1] - states.selector.selectedXArr[0] === 0) {
            content += `${states.showData[i + states.selector.selectedYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] || ''}\n`;
          } else if (j === 0) {
            content += (states.showData[i + states.selector.selectedYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] || '');
          } else if (j === states.selector.selectedXArr[1] - states.selector.selectedXArr[0]) {
            content += `\t${states.showData[i + states.selector.selectedYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] || ''}\n`;
          } else {
            content += `\t${states.showData[i + states.selector.selectedYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] || ''}`;
          }
        }
      }
      const textArea = document.createElement('textarea');
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        const successful = document.execCommand('copy');
        console.log(successful);
      } catch (err) {
        console.log(err);
      }
      document.body.removeChild(textArea);
    },
    // 粘贴
    clipboardToContent(e) {
      if (this.disabled) return;
      setTimeout(() => {
        const { states } = this.store;
        const arr = [];
        e.target.value.split('\n').forEach((item, index, curArr) => {
          if (states.isMac) {
            arr.push(item.split('\t'));
          } else {
            if (index < curArr.length - 1) {
              arr.push(item.split('\t'));
            }
          }
        });
        const selectorXLength = states.selector.selectedXArr[1] - states.selector.selectedXArr[0] + 1;
        const selectorYLength = states.selector.selectedYArr[1] - states.selector.selectedYArr[0] + 1;
        if (selectorYLength % arr.length === 0 && selectorXLength % arr[0].length === 0) {
          for (let i = 0; i <= selectorYLength - 1; i += 1) {
            for (let j = 0; j <= selectorXLength - 1; j += 1) {
              if (!states.columns[j + states.selector.selectedXArr[0]].disabled) {
                states.showData[i + states.selector.selectedYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] = arr[i % arr.length][j % arr[0].length];
              }
            }
          }
        } else {
          for (let i = 0; i <= arr.length - 1; i += 1) {
            for (let j = 0; j <= arr[i].length - 1; j += 1) {
              if (states.showData[i + states.selector.selectedYArr[0]] && states.columns[j + states.selector.selectedXArr[0]]) {
                if (!states.columns[j + states.selector.selectedXArr[0]].disabled) {
                  states.showData[i + states.selector.selectedYArr[0]][states.columns[j + states.selector.selectedXArr[0]].key] = arr[i][j];
                }
              }
            }
          }
        }
        this.$refs.editor.$refs.clipboard.value = '';
      }, 0);
    },
    // 设置启用编辑
    setEditing(key) {
      const { states } = this.store;
      if (this.disabledCell({
        row: states.showData[states.editor.editorYIndex],
        column: states.columns[states.editor.editorXIndex],
        rowIndex: states.editor.editorYIndex,
        columnIndex: states.editor.editorXIndex,
      })) return;
      if (this.disabled || states.columns[states.editor.editorXIndex].disabled) {
        return;
      }
      states.editor.editType = states.columns[states.editor.editorXIndex].type ? states.columns[states.editor.editorXIndex].type : 'text';
      states.editor.curEditorWidth = this.columnsWidth[states.editor.editorXIndex];
      if (key && (states.editor.editType === 'text' || states.editor.editType === 'number')) {
        if (key === 'Process' || key === 'Unidentified') {
          if (key.match(/\d/)) {
            [this.$refs.editor.editContent] = key.match(/\d/);
          } else {
            this.$refs.editor.editContent = '';
          }
        } else {
          this.$refs.editor.editContent = key;
        }
      } else {
        this.$refs.editor.editContent = states.showData[states.editor.editorYIndex][states.columns[states.editor.editorXIndex].key];
      }
      states.editor.editing = true;
      if (states.editor.editType === 'select') {
        states.editor.options = states.columns[states.editor.editorXIndex].options;
      }
      this.$nextTick(() => {
        this.$refs.editor.$refs[states.editor.editType].focus();
      });
    },
    selectUp() {
      setTimeout(() => {
        this.store.states.selector.isSelected = false;
      }, 0);
    },
    adjustPosition() {
      const { states } = this.store;
      if (states.editor.editorXIndex < this.fixedCount) {
        states.editor.editorIsFixed = true;
      } else {
        states.editor.editorIsFixed = false;
      }
      states.autofill.autofillXIndex = states.editor.editorXIndex;
      states.autofill.autofillYIndex = states.editor.editorYIndex;
      states.selector.selectedXArr = [states.editor.editorXIndex, states.editor.editorXIndex];
      states.selector.selectedYArr = [states.editor.editorYIndex, states.editor.editorYIndex];
      // 左右调整
      let curLeftShould; let
        curRightShould;
      if (this.fixedCount > 0) {
        const unFixedLeftArr = this.scrollLeftArr.slice(this.fixedCount - 1, -1).map((item) => item - this.fixedWidth);
        const unFixedRightArr = this.scrollLeftArr.slice(this.fixedCount).map((item) => item - this.fixedWidth);
        curLeftShould = unFixedLeftArr[states.editor.editorXIndex - this.fixedCount];
        curRightShould = unFixedRightArr[states.editor.editorXIndex - this.fixedCount] + this.fixedWidth - this.wrapperWidth + states.scrollBarWidth + 1;
      } else {
        const scrollLeftArr = [0, ...this.scrollLeftArr];
        curLeftShould = scrollLeftArr[states.editor.editorXIndex];
        curRightShould = scrollLeftArr[states.editor.editorXIndex + 1] - this.wrapperWidth + states.scrollBarWidth + 1;
      }
      if (states.tableWidth > this.wrapperWidth) {
        if (states.tableBodyLeft > curLeftShould) {
          states.tableBodyLeft = curLeftShould;
        }
        if (states.tableBodyLeft < curRightShould) {
          states.tableBodyLeft = curRightShould;
        }
        states.scrollbar.posX = states.tableBodyLeft / (states.tableWidth - states.mainWidth) * (states.mainWidth - states.scrollbar.xWidth);
      }
      // 上下调整
      if (this.maxHeight) {
        const curTopShould = this.scrollTopArr[states.editor.editorYIndex] + 1;
        if (states.tableBodyTop > curTopShould) {
          states.tableBodyTop = curTopShould;
        }
        const curBottomShould = this.scrollTopArr[states.editor.editorYIndex + 1] - this.maxHeight + 1;
        if (states.tableBodyTop < curBottomShould) {
          states.tableBodyTop = curBottomShould;
        }
        states.scrollbar.posY = states.tableBodyTop / (states.tableHeight - states.mainHeight) * (states.mainHeight - states.scrollbar.yHeight);
      }
    },
    multiSelectAdjustPostion(e) {
      const { states } = this.store;
      if (states.selector.isSelected || states.autofill.isAutofill) {
        if (e) {
          e = e || window.event;
          this.mouseX = e.pageX;
          this.mouseY = e.pageY;
        }
        if (states.selector.selectedYArr[0] === states.selector.selectedYArr[1] && states.selector.selectedXArr[0] === states.selector.selectedXArr[1]) {
          return;
        }
        const sTop = this.$refs.willtable.offsetTop + this.theaderHeight;
        const sLeft = this.excelPos.left + this.fixedWidth;
        const sBottom = this.$refs.willtable.offsetTop + this.$refs.willtable.offsetHeight - 10;
        const sRight = this.excelPos.left + this.$refs.willtable.offsetWidth - 10;
        let { tableBodyTop } = states;
        let { tableBodyLeft } = states;
        if (this.tableHeight > this.maxHeight) {
          if (this.mouseY < sTop) {
            tableBodyTop -= 20;
          }
          if (this.mouseY > sBottom) {
            tableBodyTop += 20;
          }
        }
        if (this.mouseX < sLeft) {
          tableBodyLeft -= 20;
        }
        if (this.mouseX > sRight) {
          tableBodyLeft += 20;
        }
        this.store.setScrollStatus(tableBodyTop, tableBodyLeft);
        setTimeout(() => {
          this.multiSelectAdjustPostion();
        }, 16);
      } else {
        window.removeEventListener('mousemove', this.multiSelectAdjustPostion);
      }
    },
    selectAll() {
      const { states } = this.store;
      const checkedAll = states.dataStatusList.every((item) => item.checked);
      states.dataStatusList.forEach((item, index) => {
        this.$set(states.dataStatusList[index], 'checked', !checkedAll);
      });
      this.selectionChange();
    },
    adjustWidth(index, width) {
      this.store.states.columns[index].width = width;
      this.handleResize();
    },
  },
};
</script>

<style lang="scss">
.ww-willtable {
  position: relative;
  .el-checkbox {
    font-size: 12px;
  }
}

.ww-table-wrapper {
  position: relative;
  overflow: hidden;
  &.scrollX {
    padding-bottom: 8px;
  }
  &.scrollY {
    padding-right: 8px;
  }
}

.ww-empty-columns {
  text-align: center;
  border: 1px solid #dcdfe6;
  padding: 10px 20px;
  color: #909399;
}

.ww-adjustLine {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background-color: #d6dfe4;
  z-index: 10;
}
</style>
