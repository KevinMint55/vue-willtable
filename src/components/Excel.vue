<template>
  <div class="km-excel" ref="excel">
    <div
      v-if="store.states.columns.length > 0"
      ref="wrapper"
      class="km-table-wrapper"
      :class="{ scrollX: tableWidth > wrapperWidth }"
      :style="{ maxWidth: `${tableWidth}px` }"
      v-clickoutside="clickoutside">
      <div class="km-table-header" ref="theader">
        <table-header
          ref="theaderContent"
          :showIcon="showIcon"
          :columnsWidth="columnsWidth"
          :columnsStatusList="columnsStatusList"
          :fixedCount="fixedCount"
          :all-show="true"
          :store="store" />
      </div>
      <div ref="tbody" class="km-table-body" :style="{maxHeight: `${maxHeight}px`}">
        <table-body
          ref="tbodyContent"
          :dataStatusList="dataStatusList"
          :columnsWidth="columnsWidth"
          :all-show="true"
          :cellStyle="cellStyle"
          :cellClassName="cellClassName"
          :store="store">
          <!-- 编辑器 -->
          <editor
            ref="editor"
            :columnsWidth="columnsWidth"
            :fixedCount="fixedCount"
            :store="store" />
        </table-body>
        <div v-if="store.states.showData.length == 0" class="empty-block" :style="{width: `${tableWidth}px`}">
            暂无数据
        </div>
      </div>
      <!-- 左侧固定- -->
      <div ref="fixedWrapper" class="km-table-fixed" :style="{width: `${fixedWidth}px`}">
        <div class="km-table-fixed-header" ref="fixedTheader">
          <table-header
            ref="fixedTheaderContent"
            :showIcon="showIcon"
            :columnsWidth="columnsWidth"
            :columnsStatusList="columnsStatusList"
            :fixedCount="fixedCount"
            :store="store" />
        </div>
        <div ref="fixedTbody" class="km-table-fixed-body">
          <table-body
            ref="fixedTbodyContent"
            :dataStatusList="dataStatusList"
            :columnsWidth="columnsWidth"
            :cellStyle="cellStyle"
            :cellClassName="cellClassName"
            :store="store" />
        </div>
      </div>
    </div>
    <div ref="wrapper" class="empty-columns" v-else>
      <div ref="theader">
        <div ref="theaderContent"></div>
      </div>
      <div ref="tbody">
        <div ref="tbodyContent"></div>
      </div>
      暂无表头
    </div>
    <dropdown
      :columnsWidth="columnsWidth"
      :fixedCount="fixedCount"
      :store="store"
    ></dropdown>
    <div class="adjustLine" :style="{ left: `${store.states.adjustLineLeft}px` }" v-show="store.states.adjustLineShow"></div>
  </div>
</template>

<script>
import TableStore from '../store';
import '../style/reset.scss';
import clickoutside from '../directives/clickoutside';
import methods from '../mixins/methods';
import events from '../mixins/events';
import TableHeader from './ExcelHeader.vue';
import TableBody from './ExcelBody.vue';
import Editor from './ExcelEditor.vue';
import Dropdown from './ExcelDropdown.vue';

const scrollBarWidth = 10;

export default {
  name: 'km-excel',
  directives: { clickoutside },
  components: {
    TableHeader,
    TableBody,
    Editor,
    Dropdown,
  },
  props: {
    columns: {
      type: Array,
      default: () => [],
    },
    value: {
      type: Array,
      default: () => [],
    },
    maxHeight: {
      type: [String, Number],
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
      default: () => () => {},
    },
    cellClassName: {
      type: [Object, Function],
      default: () => () => {},
    },
  },
  data() {
    const store = new TableStore();
    return {
      store,
      wrapperWidth: null,
      tableWidth: null,
      theaderHeight: null,
      columnsWidth: [],

      data: [],
      initialData: null,
      changeData: [],
      columnsStatusList: [],
      dataStatusList: [],
      scrollLeftArr: [],
      scrollTopArr: [],
      fixedCount: 0,
      fixedWidth: 0,

      // 鼠标
      mouseX: 0,
      mouseY: 0,
      timer: null,

      // 历史记录
      historyData: [],
      curHisory: 0,
      isOperation: false,

      excelPos: {},
    };
  },
  watch: {
    value(val) {
      this.data = val;
    },
    data: {
      handler(val) {
        if (!this.isOperation) {
          if (this.historyData.length !== this.curHisory) {
            this.historyData = this.historyData.slice(0, this.curHisory);
          }
          this.$nextTick(() => {
            this.historyData.push(JSON.stringify(this.changeData));
            console.log('changeData', this.changeData);
            this.curHisory += 1;
          });
        }
        this.$emit('input', val);
        if (!this.initialData) {
          this.initData();
        }
        this.handleResize();
        this.handleFilters();
        this.handleChangeData();
      },
      deep: true,
    },
    columns: {
      handler() {
        this.initColumns();
        this.handleResize();
      },
      deep: true,
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
      this.$refs.tbody.addEventListener('scroll', () => {
        this.$refs.theader.scrollLeft = this.$refs.tbody.scrollLeft;
        this.$refs.fixedTbody.scrollTop = this.$refs.tbody.scrollTop;
        this.store.tableBodyScroll(this.$refs.tbody);
        this.store.states.dropdown.index = null;
      });
      this.store.handleIsMac();
      this.initColumns();
      this.handleResize();
    },
    initColumns() {
      const fixedArr = this.columns.filter(item => item.fixed);
      const unFixedArr = this.columns.filter(item => !item.fixed);
      this.store.states.columns = fixedArr.concat(unFixedArr).map((item) => {
        if (item.width) {
          item.width = parseInt(item.width, 10);
        }
        return item;
      });
      this.columnsWidth = this.store.states.columns.map(item => item.width);
      this.columnsStatusList = this.store.states.columns.map(item => ({
        key: item.key,
        type: item.type,
        list: {},
        sort: '',
      }));
      this.store.states.filters = {};
    },
    initData() {
      this.store.states.showData = this.data;
      this.dataStatusList = this.data.map(() => ({
        checked: false,
        errors: [],
      }));
      this.initialData = JSON.parse(JSON.stringify(this.data));
      this.historyData = [JSON.stringify(this.data.map((v, i) => ({
        ...v,
        _index: i,
      })))];
      this.curHisory = 1;
      if (this.$refs.theaderContent) {
        this.$refs.theaderContent.checkedAll = false;
      }
      if (this.$refs.fixedTheaderContent) {
        this.$refs.fixedTheaderContent.checkedAll = false;
      }
      this.initColumns();
      this.handleResize();
      this.handleFilters();
      this.handleChangeData();
    },
    handleResize() {
      this.excelPos = this.$refs.excel.getBoundingClientRect();
      // 获取编辑框可移动范围, X是横轴, Y是竖轴
      this.store.states.editor.editorRange = {
        minX: this.store.states.columns.filter(item => item.type === 'selection').length,
        maxX: this.store.states.columns.length - 1,
        minY: 0,
        maxY: this.store.states.showData.length - 1,
      };

      this.wrapperWidth = this.$refs.wrapper.offsetWidth;

      this.$nextTick(() => {
        // 计算剩余列宽度
        const surplusColumns = this.store.states.columns.filter(item => !item.width);
        let surplusColumnAvg;

        if (!this.$refs.tbodyContent.$el) return;
        if (surplusColumns.length > 0) {
          const surplusWidth = this.wrapperWidth - this.store.states.columns.filter(item => item.width).reduce((total, item) => total + item.width, 0);
          if (surplusWidth > 0) {
            if (this.$refs.tbodyContent.$el.offsetHeight > this.maxHeight) {
              surplusColumnAvg = (surplusWidth - 1 - scrollBarWidth) / surplusColumns.length;
            } else {
              surplusColumnAvg = (surplusWidth - 1) / surplusColumns.length;
            }
          }
        }

        // 设置单元格宽度
        this.store.states.columns.forEach((column, index) => {
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

        this.scrollTopArr = this.store.states.showData.map((item, index) => {
          const sum = this.store.states.showData.reduce((total, curVal, curIndex) => {
            if (curIndex <= index) {
              return total + 28;
            }
            return total;
          }, 0);
          return sum;
        });
        this.scrollTopArr.unshift(0);

        this.fixedCount = this.store.states.columns.filter(item => item.fixed).length;
        this.fixedWidth = this.scrollLeftArr[this.fixedCount - 1] || 0;

        // 如果每列均设置了宽度
        const allWidth = this.store.states.columns.every(cell => cell.width);
        if (allWidth) {
          this.tableWidth = this.store.states.columns.map(cell => cell.width).reduce((a, b) => a + b, 0);
        } else {
          this.tableWidth = this.columnsWidth.reduce((total, cur) => total + cur, 0);
          if (this.tableWidth < this.wrapperWidth) {
            this.tableWidth = this.wrapperWidth;
          }
        }

        this.$refs.theaderContent.$el.style.width = `${this.tableWidth}px`;
        this.$refs.tbodyContent.$el.style.width = `${this.tableWidth}px`;

        // 设置左侧theader高度与tbody距离顶部距离
        this.theaderHeight = this.$refs.theaderContent.$el.offsetHeight;

        // 设置左侧定位高度
        if (this.tableWidth > this.wrapperWidth) {
          this.$refs.fixedWrapper.style.height = `${this.$refs.wrapper.offsetHeight - scrollBarWidth}px`;
          this.$refs.fixedTbody.style.height = `${this.$refs.wrapper.offsetHeight - scrollBarWidth - this.theaderHeight}px`;
        } else {
          this.$refs.fixedWrapper.style.height = `${this.$refs.wrapper.offsetHeight}px`;
          this.$refs.fixedTbody.style.height = `${this.$refs.wrapper.offsetHeight - this.theaderHeight}px`;
        }
        // 当出现竖向滚动条时处理滚动条
        if (this.$refs.tbodyContent.$el.offsetHeight > this.maxHeight) {
          this.$refs.tbody.style.overflowY = 'auto';
          this.$nextTick(() => {
            const colgroup = this.$refs.theaderContent.$el.querySelector('colgroup');
            const tr = this.$refs.theaderContent.$el.querySelector('tr');

            // 如果已存在Col，删除组中重新在末尾添加
            for (let i = 0; i < colgroup.children.length; i += 1) {
              if (colgroup.children[i].width === scrollBarWidth) {
                colgroup.removeChild(colgroup.children[i]);
                tr.removeChild(tr.children[i]);
              }
            }
            const col = document.createElement('col');
            col.width = scrollBarWidth;
            colgroup.appendChild(col);

            const th = document.createElement('th');
            th.style.width = `${scrollBarWidth}px`;
            th.style.borderTop = '1px solid #d6dfe4';
            tr.appendChild(th);

            this.$refs.tbodyContent.$el.style.width = `${this.tableWidth - scrollBarWidth - 1}px`;
          });
        }
      });
    },
    handleFilters() {
      this.columnsStatusList.forEach((th) => {
        if (th.type === 'selection') return;
        if (th.list) {
          Object.keys(th.list).forEach((item) => {
            th.list[item].count = 0;
          });
        } else {
          th.list = {};
        }
        this.data.forEach((td) => {
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
    },
    handleChangeData() {
      const data = JSON.parse(JSON.stringify(this.data.map((v, i) => ({ ...v, _index: i }))));
      const initialData = JSON.parse(JSON.stringify(this.initialData));
      this.changeData = data.filter((item, index) => JSON.stringify(item) !== JSON.stringify(initialData[index]));
    },
    clickoutside() {
      if (this.store.states.selector.isSelected || this.store.states.autofill.isAutofill) return;
      this.store.states.editor.editing = false;
      this.store.states.editor.editorShow = false;
      this.store.states.selector.selectedXArr = [];
      this.store.states.selector.selectedYArr = [];
      window.removeEventListener('keydown', this.keySubmit);
      window.removeEventListener('mousemove', this.multiSelectAdjustPostion);
    },
    // 选择单元格
    selectCell(e, x, y, type) {
      if (this.disabled) return;
      if (e.button !== 0) return;
      window.addEventListener('keydown', this.keySubmit);
      window.addEventListener('mousemove', this.multiSelectAdjustPostion);
      if (type === 'selection') return;
      this.timer = setInterval(this.multiSelectAdjustPostion, 16);
      window.addEventListener('mouseup', this.selectUp);
      this.store.states.editor.editing = false;
      this.store.states.editor.editType = 'text';
      this.store.states.editor.editorShow = true;
      this.store.states.autofill.autofillXIndex = x;
      this.store.states.autofill.autofillYIndex = y;
      this.store.states.selector.selectedXIndex = x;
      this.store.states.selector.selectedYIndex = y;
      this.store.states.selector.selectedXArr = [x, x];
      this.store.states.selector.selectedYArr = [y, y];
      this.store.states.selector.isSelected = true;
      this.$nextTick(() => {
        this.store.states.editor.editorXIndex = x;
        this.store.states.editor.editorYIndex = y;
        this.store.states.editor.curEditorCoverValue = this.store.states.showData[this.store.states.editor.editorYIndex][this.store.states.columns[this.store.states.editor.editorXIndex].key];
        this.$nextTick(() => {
          this.adjustPosition();
          this.$refs.editor.$refs.clipboard.focus();
        });
      });
    },
    keySubmit(e) {
      if ((e.ctrlKey && e.keyCode === 90) || (e.metaKey && e.keyCode === 90)) {
        return this.operation('undo');
      }
      if ((e.ctrlKey && e.keyCode === 89) || (e.metaKey && e.keyCode === 89)) {
        return this.operation('recovery');
      }
      if (this.store.states.editor.editing && e.keyCode === 13) {
        this.store.states.editor.editing = false;
        this.store.states.editor.editType = 'text';
        return;
      }
      if (this.store.states.editor.editing || !this.store.states.editor.editorShow) {
        return;
      }
      if ((e.ctrlKey && e.keyCode === 67) || (e.metaKey && e.keyCode === 67)) {
        return this.getContentToclipboard();
      }
      if (e.ctrlKey || e.metaKey) {
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
        case e.keyCode === 37:
          // 左
          if (this.store.states.editor.editorXIndex === this.store.states.editor.editorRange.minX) {
            this.store.states.editor.editorXIndex = this.store.states.editor.editorRange.minX;
          } else {
            this.store.states.editor.editorXIndex -= 1;
          }
          this.adjustPosition();
          break;
        case e.keyCode === 38:
          // 上
          if (this.store.states.editor.editorYIndex === this.store.states.editor.editorRange.minY) {
            this.store.states.editor.editorYIndex = this.store.states.editor.editorRange.minY;
          } else {
            this.store.states.editor.editorYIndex -= 1;
          }
          this.adjustPosition();
          break;
        case e.keyCode === 39:
          // 右
          if (this.store.states.editor.editorXIndex === this.store.states.editor.editorRange.maxX) {
            this.store.states.editor.editorXIndex = this.store.states.editor.editorRange.maxX;
          } else {
            this.store.states.editor.editorXIndex += 1;
          }
          this.adjustPosition();
          break;
        case e.keyCode === 40:
          // 下
          if (this.store.states.editor.editorYIndex === this.store.states.editor.editorRange.maxY) {
            this.store.states.editor.editorYIndex = this.store.states.editor.editorRange.maxY;
          } else {
            this.store.states.editor.editorYIndex += 1;
          }
          this.adjustPosition();
          break;
        case e.keyCode === 8:
          // 删除
          this.clearSelected();
          break;
        case e.keyCode === 13:
          this.setEditing();
          break;
        case isImportability(e.keyCode) || e.key === 'Process' || e.key === 'Unidentified':
          this.setEditing(e.key);
          break;
      }
    },
    getContentToclipboard() {
      let content = '';
      for (let i = 0; i <= this.store.states.selector.selectedYArr[1] - this.store.states.selector.selectedYArr[0]; i += 1) {
        for (let j = 0; j <= this.store.states.selector.selectedXArr[1] - this.store.states.selector.selectedXArr[0]; j += 1) {
          if (this.store.states.selector.selectedXArr[1] - this.store.states.selector.selectedXArr[0] === 0) {
            content += `${this.store.states.showData[i + this.store.states.selector.selectedYArr[0]][this.store.states.columns[j + this.store.states.selector.selectedXArr[0]].key] || ''}\n`;
          } else if (j === 0) {
            content += (this.store.states.showData[i + this.store.states.selector.selectedYArr[0]][this.store.states.columns[j + this.store.states.selector.selectedXArr[0]].key] || '');
          } else if (j === this.store.states.selector.selectedXArr[1] - this.store.states.selector.selectedXArr[0]) {
            content += `\t${this.store.states.showData[i + this.store.states.selector.selectedYArr[0]][this.store.states.columns[j + this.store.states.selector.selectedXArr[0]].key] || ''}\n`;
          } else {
            content += `\t${this.store.states.showData[i + this.store.states.selector.selectedYArr[0]][this.store.states.columns[j + this.store.states.selector.selectedXArr[0]].key] || ''}`;
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
    clipboardToContent(e) {
      this.$nextTick(() => {
        const arr = [];
        e.target.value.split('\n').forEach((item, index, curArr) => {
          if (this.store.states.isMac) {
            arr.push(item.split('\t'));
          } else {
            if (index < curArr.length - 1) {
              arr.push(item.split('\t'));
            }
          }
        });
        for (let i = 0; i <= arr.length - 1; i += 1) {
          for (let j = 0; j <= arr[i].length - 1; j += 1) {
            if (this.store.states.showData[i + this.store.states.selector.selectedYArr[0]] && this.store.states.columns[j + this.store.states.selector.selectedXArr[0]]) {
              if (this.store.states.columns[j + this.store.states.selector.selectedXArr[0]].type !== 'disabled') {
                this.store.states.showData[i + this.store.states.selector.selectedYArr[0]][this.store.states.columns[j + this.store.states.selector.selectedXArr[0]].key] = arr[i][j];
              }
            }
          }
        }
        this.$refs.editor.$refs.clipboard.value = '';
      });
    },
    clearSelected() {
      for (let i = 0; i <= this.store.states.selector.selectedYArr[1] - this.store.states.selector.selectedYArr[0]; i += 1) {
        for (let j = 0; j <= this.store.states.selector.selectedXArr[1] - this.store.states.selector.selectedXArr[0]; j += 1) {
          if (this.store.states.columns[j + this.store.states.selector.selectedXArr[0]].type !== 'disabled') {
            this.store.states.showData[i + this.store.states.selector.selectedYArr[0]][this.store.states.columns[j + this.store.states.selector.selectedXArr[0]].key] = '';
          }
        }
      }
    },
    // 设置启用编辑
    setEditing(key) {
      if (this.store.states.columns[this.store.states.editor.editorXIndex].type === 'disabled') {
        return;
      }
      this.store.states.editor.editType = this.store.states.columns[this.store.states.editor.editorXIndex].type ? this.store.states.columns[this.store.states.editor.editorXIndex].type : 'text';
      this.store.states.editor.curEditorWidth = this.columnsWidth[this.store.states.editor.editorXIndex];
      if (key && (this.store.states.editor.editType === 'text' || this.store.states.editor.editType === 'number')) {
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
        this.$refs.editor.editContent = this.store.states.showData[this.store.states.editor.editorYIndex][this.store.states.columns[this.store.states.editor.editorXIndex].key];
      }
      this.store.states.editor.editing = true;
      if (this.store.states.editor.editType === 'select') {
        this.store.states.editor.options = this.store.states.columns[this.store.states.editor.editorXIndex].options;
      }
      this.$nextTick(() => {
        this.$refs.editor.$refs[this.store.states.editor.editType].focus();
      });
    },
    selectUp() {
      clearInterval(this.timer);
      setTimeout(() => {
        this.store.states.selector.isSelected = false;
      }, 0);
    },
    adjustPosition() {
      if (this.store.states.editor.editorXIndex < this.fixedCount) {
        this.store.states.editor.editorIsFixed = true;
      } else {
        this.store.states.editor.editorIsFixed = false;
      }
      this.store.states.autofill.autofillXIndex = this.store.states.editor.editorXIndex;
      this.store.states.autofill.autofillYIndex = this.store.states.editor.editorYIndex;
      this.store.states.selector.selectedXArr = [this.store.states.editor.editorXIndex, this.store.states.editor.editorXIndex];
      this.store.states.selector.selectedYArr = [this.store.states.editor.editorYIndex, this.store.states.editor.editorYIndex];
      // 左右调整
      let curLeftShould; let
        curRightShould;
      if (this.fixedCount > 0) {
        const unFixedLeftArr = this.scrollLeftArr.slice(this.fixedCount - 1, -1).map(item => item - this.fixedWidth);
        const unFixedRightArr = this.scrollLeftArr.slice(this.fixedCount).map(item => item - this.fixedWidth);
        curLeftShould = unFixedLeftArr[this.store.states.editor.editorXIndex - this.fixedCount];
        curRightShould = unFixedRightArr[this.store.states.editor.editorXIndex - this.fixedCount] + this.fixedWidth - this.wrapperWidth + scrollBarWidth + 2;
      } else {
        const scrollLeftArr = [0, ...this.scrollLeftArr];
        curLeftShould = scrollLeftArr[this.store.states.editor.editorXIndex];
        curRightShould = scrollLeftArr[this.store.states.editor.editorXIndex + 1] - this.wrapperWidth + scrollBarWidth + 2;
      }
      if (this.tableWidth > this.wrapperWidth) {
        if (this.store.states.tableBodyLeft > curLeftShould) {
          this.$refs.theader.scrollLeft = curLeftShould;
          this.$refs.tbody.scrollLeft = curLeftShould;
        }
        if (this.store.states.tableBodyLeft < curRightShould) {
          this.$refs.theader.scrollLeft = curRightShould + 2;
          this.$refs.tbody.scrollLeft = curRightShould + 2;
        }
      }
      // 上下调整
      if (this.maxHeight) {
        const curTopShould = this.scrollTopArr[this.store.states.editor.editorYIndex];
        if (this.store.states.tableBodyTop > curTopShould) {
          this.$refs.tbody.scrollTop = curTopShould;
          this.$refs.fixedTbody.scrollTop = curTopShould;
        }
        const curBottomShould = this.scrollTopArr[this.store.states.editor.editorYIndex + 1] - this.maxHeight + scrollBarWidth + 2;
        if (this.store.states.tableBodyTop < curBottomShould) {
          this.$refs.tbody.scrollTop = curBottomShould;
          this.$refs.fixedTbody.scrollTop = curBottomShould;
        }
      }
    },
    multiSelectAdjustPostion(e) {
      if (this.store.states.selector.isSelected) {
        if (e) {
          e = e || window.event;
          this.mouseX = e.pageX;
          this.mouseY = e.pageY;
        }
        if (this.store.states.selector.selectedYArr[0] === this.store.states.selector.selectedYArr[1] && this.store.states.selector.selectedXArr[0] === this.store.states.selector.selectedXArr[1]) {
          return;
        }
        const sTop = this.$refs.excel.offsetTop + 30;
        const sLeft = this.excelPos.left + this.fixedWidth;
        const sBottom = this.$refs.excel.offsetTop + this.$refs.excel.offsetHeight - 10;
        const sRight = this.excelPos.left + this.$refs.excel.offsetWidth - 10;
        if (this.mouseY < sTop) {
          this.$refs.tbody.scrollTop -= 20;
          this.$refs.fixedTbody.scrollTop -= 20;
        }
        if (this.mouseY > sBottom) {
          this.$refs.tbody.scrollTop += 20;
          this.$refs.fixedTbody.scrollTop += 20;
        }
        if (this.mouseX < sLeft) {
          this.$refs.theader.scrollLeft -= 20;
          this.$refs.tbody.scrollLeft -= 20;
        }
        if (this.mouseX > sRight) {
          this.$refs.theader.scrollLeft += 20;
          this.$refs.tbody.scrollLeft += 20;
        }
      }
    },
    selectAll() {
      const checkedAll = this.dataStatusList.every(item => item.checked);
      this.dataStatusList.forEach((item, index) => {
        this.$set(this.dataStatusList[index], 'checked', !checkedAll);
      });
      this.selectionChange();
    },
    operation(type) {
      if (!this.store.states.editor.editing) {
        if (type === 'undo' && this.curHisory > 1) {
          this.curHisory -= 1;
        }
        if (type === 'recovery' && this.curHisory < this.historyData.length) {
          this.curHisory += 1;
        }
        this.isOperation = true;
        JSON.parse(this.historyData[this.curHisory - 1]).forEach((i) => {
          Object.keys(i).forEach((j) => {
            this.data[i._index][j] = i[j];
          });
        });
        this.$nextTick(() => {
          this.isOperation = false;
        });
      }
    },
    adjustWidth(index, width) {
      this.store.states.columns[index].width = width;
      this.handleResize();
      this.$nextTick(() => {
        this.handleFilters();
      });
    },
    sort(type) {
      this.columnsStatusList.forEach((item) => {
        item.sort = '';
      });
      this.columnsStatusList[this.store.states.dropdown.index].sort = type;
      if (type === 'ascending') {
        this.store.states.showData.sort((x, y) => (x[this.columnsStatusList[this.store.states.dropdown.index].key] > y[this.columnsStatusList[this.store.states.dropdown.index].key] ? 1 : -1));
      } else {
        this.store.states.showData.sort((x, y) => (x[this.columnsStatusList[this.store.states.dropdown.index].key] > y[this.columnsStatusList[this.store.states.dropdown.index].key] ? -1 : 1));
      }
      this.store.states.dropdown.index = null;
    },
    handleFilter() {
      this.columnsStatusList[this.store.states.dropdown.index] = {
        list: this.store.states.dropdown.list,
        key: this.store.states.dropdown.key,
        sort: this.store.states.dropdown.sort,
      };
      const arr = [];
      Object.keys(this.store.states.dropdown.list).forEach((key) => {
        if (this.store.states.dropdown.list[key].checked) {
          arr.push(key);
        }
      });
      this.store.states.filters[this.columnsStatusList[this.store.states.dropdown.index].key] = arr;
      this.filterData();
    },
    resetFilter() {
      delete this.store.states.filters[this.columnsStatusList[this.store.states.dropdown.index].key];
      Object.keys(this.columnsStatusList[this.store.states.dropdown.index].list).forEach((key) => {
        this.columnsStatusList[this.store.states.dropdown.index].list[key].checked = false;
      });
      this.filterData();
    },
    filterData() {
      this.store.states.showData = this.data;
      Object.keys(this.store.states.filters).forEach((key) => {
        this.store.states.showData = this.store.states.showData.filter(item => this.store.states.filters[key].includes(item[key].toString()));
      });
      this.store.states.dropdown.index = null;
      this.handleResize();
    },
    setErrors(index, key, correct) {
      if (!this.dataStatusList[index]) return;
      if (!this.dataStatusList[index].errors) {
        this.dataStatusList[index].errors = [];
      }
      if (correct) {
        if (this.dataStatusList[index].errors.includes(key)) {
          this.dataStatusList[index].errors.splice(this.dataStatusList[index].errors.indexOf(key), 1);
        }
      } else {
        if (!this.dataStatusList[index].errors.includes(key)) {
          this.dataStatusList[index].errors.push(key);
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.km-excel {
  position: relative;
}

div,
section,
ul {
  &::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  &::-webkit-scrollbar-track {
    background-color: #e9eaec;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #bbbec4;
    border-radius: 10px;
    transition: all 1s;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #80848f;
  }
}

.km-table-wrapper {
  position: relative;
  overflow: hidden;
  &.scrollX {
    border-right: 1px solid #d6dfe4;
    border-left: 1px solid #d6dfe4;
    /deep/ th,
    /deep/ td {
      &:first-child {
        border-left: 0;
      }
      &:last-child {
        border-right: 0;
      }
    }
    .km-table-body {
      overflow-x: auto;
    }
  }
  /deep/ table {
    border-spacing: 0;
    border-collapse: collapse;
    font-size: 12px;
    table-layout: fixed;
    .cell-content {
      width: 100%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.km-table-header {
  overflow: hidden;
  /deep/ table {
    border-bottom: 1px solid #d6dfe4;
  }
}

.km-table-body {
  overflow: hidden;
  user-select: none;
  border-bottom: 1px solid #d6dfe4;

  /deep/ tbody {
    tr:first-child {
      td {
        border-top: none;
      }
    }
  }
}

// 左侧固定
.km-table-fixed {
  position: absolute;
  top: 0;
  left: 0;
  box-shadow: 1px 0 8px #d3d4d6;
  overflow-x: hidden;
  background: #fff;
  user-select: none;
  z-index: 2;
  .km-table-fixed-header {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 3;
    /deep/ table {
      border-bottom: 1px solid #d6dfe4;
    }
  }
  .km-table-fixed-body {
    position: absolute;
    top: 30px;
    left: 0;
    z-index: 3;
    overflow: hidden;
    border-bottom: 1px solid #d6dfe4;
    /deep/ tbody {
      tr:first-child {
        td {
          border-top: 2px solid transparent;
        }
      }
    }
  }
}

// 数据为空
.empty-block {
  position: relative;
  z-index: 9;
  font-size: 14px;
  padding: 30px;
  text-align: center;
  border-right: 1px solid #d6dfe4;
  border-left: 1px solid #d6dfe4;
  color: #909399;
}

.empty-columns {
    text-align: center;
    border: 1px solid #DCDFE6;
    padding: 10px 20px;
    color: #909399;
}

.el-checkbox {
  font-size: 12px;
}

.adjustLine {
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 100%;
  background-color: #d6dfe4;
  z-index: 10;
}
</style>
