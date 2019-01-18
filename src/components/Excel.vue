<template>
  <div ref="excel">
    <div
      v-if="store.columns.length > 0"
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
          :tableScrollLeft="tableScrollLeft"
          :fixedCount="fixedCount"
          :all-show="true" />
      </div>
      <div ref="tbody" class="km-table-body" :style="{maxHeight: `${maxHeight}px`}">
        <table-body
          ref="tbodyContent"
          :dataStatusList="dataStatusList"
          :columnsWidth="columnsWidth"
          :all-show="true"
          :cellStyle="cellStyle"
          :cellClassName="cellClassName">
          <!-- 编辑器 -->
          <editor
            ref="editor"
            :tableScrollLeft="tableScrollLeft"
            :columnsWidth="columnsWidth"
            :fixedCount="fixedCount" />
        </table-body>
        <div v-if="store.showData.length == 0" class="empty-block" :style="{width: `${tableWidth}px`}">
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
            :tableScrollLeft="tableScrollLeft" />
        </div>
        <div ref="fixedTbody" class="km-table-fixed-body">
          <table-body
            ref="fixedTbodyContent"
            :dataStatusList="dataStatusList"
            :columnsWidth="columnsWidth"
            :cellStyle="cellStyle"
            :cellClassName="cellClassName" />
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
      :tableScrollLeft="tableScrollLeft"
      :tableScrollTop="tableScrollTop"
      :columnsWidth="columnsWidth"
      :fixedCount="fixedCount"
    ></dropdown>
  </div>
</template>

<script>
import store from '../store';
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
  provide() {
    return {
      store: this.store,
    };
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
    return {
      store: store(),
      wrapperWidth: null,
      tableWidth: null,
      theaderHeight: null,
      columnsWidth: [],

      data: [],
      initialData: null,
      changeData: [],
      columnsStatusList: [],
      dataStatusList: [],

      tableScrollLeft: 0,
      tableScrollTop: 0,
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
          this.historyData.push(JSON.stringify(val));
          this.curHisory += 1;
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
    tableScrollLeft() {
      this.store.dropdown.index = null;
    },
    tableScrollTop() {
      this.store.dropdown.index = null;
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
        this.tableScrollLeft = this.$refs.tbody.scrollLeft;
        this.tableScrollTop = this.$refs.tbody.scrollTop;
      });
      this.initColumns();
      this.handleResize();
    },
    initColumns() {
      const fixedArr = this.columns.filter(item => item.fixed);
      const unFixedArr = this.columns.filter(item => !item.fixed);
      this.store.columns = fixedArr.concat(unFixedArr).map((item) => {
        if (item.width) {
          item.width = parseInt(item.width, 10);
        }
        return item;
      });
      this.columnsWidth = this.store.columns.map(item => item.width);
      this.columnsStatusList = this.store.columns.map(item => ({
        key: item.key,
        type: item.type,
        list: {},
        sort: '',
      }));
      this.store.filters = {};
    },
    initData() {
      this.store.showData = this.data;
      this.dataStatusList = this.data.map(() => ({
        checked: false,
        errors: [],
      }));
      this.initialData = JSON.parse(JSON.stringify(this.data));
      this.historyData = [JSON.stringify(this.data)];
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
      this.store.editor.editorRange = {
        minX: this.store.columns.filter(item => item.type === 'selection').length,
        maxX: this.store.columns.length - 1,
        minY: 0,
        maxY: this.store.showData.length - 1,
      };

      this.wrapperWidth = this.$refs.wrapper.offsetWidth;

      this.$nextTick(() => {
        // 计算剩余列宽度
        const surplusColumns = this.store.columns.filter(item => !item.width);
        let surplusColumnAvg;

        if (!this.$refs.tbodyContent.$el) return;
        if (surplusColumns.length > 0) {
          const surplusWidth = this.wrapperWidth - this.store.columns.filter(item => item.width).reduce((total, item) => total + item.width, 0);
          if (surplusWidth > 0) {
            if (this.$refs.tbodyContent.$el.offsetHeight > this.maxHeight) {
              surplusColumnAvg = (surplusWidth - 1 - scrollBarWidth) / surplusColumns.length;
            } else {
              surplusColumnAvg = (surplusWidth - 1) / surplusColumns.length;
            }
          }
        }

        // 设置单元格宽度
        this.store.columns.forEach((column, index) => {
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

        this.scrollTopArr = this.store.showData.map((item, index) => {
          const sum = this.store.showData.reduce((total, curVal, curIndex) => {
            if (curIndex <= index) {
              return total + 28;
            }
            return total;
          }, 0);
          return sum;
        });
        this.scrollTopArr.unshift(0);

        this.fixedCount = this.store.columns.filter(item => item.fixed).length;
        this.fixedWidth = this.scrollLeftArr[this.fixedCount - 1] || 0;

        // 如果每列均设置了宽度
        const allWidth = this.store.columns.every(cell => cell.width);
        if (allWidth) {
          this.tableWidth = this.store.columns.map(cell => cell.width).reduce((a, b) => a + b, 0);
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
      const data = JSON.parse(JSON.stringify(this.data));
      const initialData = JSON.parse(JSON.stringify(this.initialData));
      this.changeData = data.filter((item, index) => JSON.stringify(item) !== JSON.stringify(initialData[index]));
    },
    clickoutside() {
      if (this.store.selector.isSelected || this.store.autofill.isAutofill) return;
      this.store.editor.editing = false;
      this.store.editor.editorShow = false;
      this.store.selector.selectedXArr = [];
      this.store.selector.selectedYArr = [];
      window.removeEventListener('keydown', this.keySubmit);
      window.removeEventListener('mousemove', this.multiSelectAdjustPostion);
    },
    // 选择单元格
    selectCell(e, x, y, type) {
      console.log('selectCell', { x, y });
      if (this.disabled) return;
      if (e.button !== 0) return;
      window.addEventListener('keydown', this.keySubmit);
      window.addEventListener('mousemove', this.multiSelectAdjustPostion);
      if (type === 'selection') return;
      this.store.editor.editing = false;
      this.store.editor.editType = 'text';

      this.store.autofill.autofillXIndex = x;
      this.store.autofill.autofillYIndex = y;
      this.store.editor.editorShow = true;

      this.store.selector.selectedXIndex = x;
      this.store.selector.selectedYIndex = y;
      this.store.selector.selectedXArr = [x, x];
      this.store.selector.selectedYArr = [y, y];
      this.$nextTick(() => {
        this.store.editor.editorXIndex = x;
        this.store.editor.editorYIndex = y;
        this.store.editor.curEditorCoverValue = this.store.showData[this.store.editor.editorYIndex][this.store.columns[this.store.editor.editorXIndex].key];
        this.$nextTick(() => {
          this.adjustPosition();
          this.$refs.editor.$refs.clipboard.focus();
        });
      });
      console.log('false：', this.store.selector.isSelected);
      this.store.selector.isSelected = true;
      console.log('true：', this.store.selector.isSelected);
      this.timer = setInterval(this.multiSelectAdjustPostion, 10);
      window.addEventListener('mouseup', this.selectUp);
    },
    keySubmit(e) {
      if ((e.ctrlKey && e.keyCode === 90) || (e.metaKey && e.keyCode === 90)) {
        return this.operation('undo');
      }
      if ((e.ctrlKey && e.keyCode === 89) || (e.metaKey && e.keyCode === 89)) {
        return this.operation('recovery');
      }
      if (this.store.editor.editing && e.keyCode === 13) {
        this.store.editor.editing = false;
        this.store.editor.editType = 'text';
        return;
      }
      if (this.store.editor.editing || !this.store.editor.editorShow) {
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
          if (this.store.editor.editorXIndex === this.store.editor.editorRange.minX) {
            this.store.editor.editorXIndex = this.store.editor.editorRange.minX;
          } else {
            this.store.editor.editorXIndex -= 1;
          }
          this.adjustPosition();
          break;
        case e.keyCode === 38:
          // 上
          if (this.store.editor.editorYIndex === this.store.editor.editorRange.minY) {
            this.store.editor.editorYIndex = this.store.editor.editorRange.minY;
          } else {
            this.store.editor.editorYIndex -= 1;
          }
          this.adjustPosition();
          break;
        case e.keyCode === 39:
          // 右
          if (this.store.editor.editorXIndex === this.store.editor.editorRange.maxX) {
            this.store.editor.editorXIndex = this.store.editor.editorRange.maxX;
          } else {
            this.store.editor.editorXIndex += 1;
          }
          this.adjustPosition();
          break;
        case e.keyCode === 40:
          // 下
          if (this.store.editor.editorYIndex === this.store.editor.editorRange.maxY) {
            this.store.editor.editorYIndex = this.store.editor.editorRange.maxY;
          } else {
            this.store.editor.editorYIndex += 1;
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
      for (let i = 0; i <= this.store.selector.selectedYArr[1] - this.store.selector.selectedYArr[0]; i += 1) {
        for (let j = 0; j <= this.store.selector.selectedXArr[1] - this.store.selector.selectedXArr[0]; j += 1) {
          if (this.store.selector.selectedXArr[1] - this.store.selector.selectedXArr[0] === 0) {
            content += `${this.store.showData[i + this.store.selector.selectedYArr[0]][this.store.columns[j + this.store.selector.selectedXArr[0]].key] || ''}\n`;
          } else if (j === 0) {
            content += (this.store.showData[i + this.store.selector.selectedYArr[0]][this.store.columns[j + this.store.selector.selectedXArr[0]].key] || '');
          } else if (j === this.store.selector.selectedXArr[1] - this.store.selector.selectedXArr[0]) {
            content += `\t${this.store.showData[i + this.store.selector.selectedYArr[0]][this.store.columns[j + this.store.selector.selectedXArr[0]].key] || ''}\n`;
          } else {
            content += `\t${this.store.showData[i + this.store.selector.selectedYArr[0]][this.store.columns[j + this.store.selector.selectedXArr[0]].key] || ''}`;
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
          if (index < curArr.length - 1) {
            arr.push(item.split('\t'));
          }
        });
        for (let i = 0; i <= arr.length - 1; i += 1) {
          for (let j = 0; j <= arr[i].length - 1; j += 1) {
            if (this.store.showData[i + this.store.selector.selectedYArr[0]] && this.store.columns[j + this.store.selector.selectedXArr[0]]) {
              if (this.store.columns[j + this.store.selector.selectedXArr[0]].type !== 'disabled') {
                this.store.showData[i + this.store.selector.selectedYArr[0]][this.store.columns[j + this.store.selector.selectedXArr[0]].key] = arr[i][j];
              }
            }
          }
        }
        this.$refs.editor.$refs.clipboard.value = '';
      });
    },
    clearSelected() {
      for (let i = 0; i <= this.store.selector.selectedYArr[1] - this.store.selector.selectedYArr[0]; i += 1) {
        for (let j = 0; j <= this.store.selector.selectedXArr[1] - this.store.selector.selectedXArr[0]; j += 1) {
          if (this.store.columns[j + this.store.selector.selectedXArr[0]].type !== 'disabled') {
            this.store.showData[i + this.store.selector.selectedYArr[0]][this.store.columns[j + this.store.selector.selectedXArr[0]].key] = '';
          }
        }
      }
    },
    // 设置启用编辑
    setEditing(key) {
      if (this.store.columns[this.store.editor.editorXIndex].type === 'disabled') {
        return;
      }
      this.store.editor.editType = this.store.columns[this.store.editor.editorXIndex].type ? this.store.columns[this.store.editor.editorXIndex].type : 'text';
      this.store.editor.curEditorWidth = this.columnsWidth[this.store.editor.editorXIndex];
      if (key && (this.store.editor.editType === 'text' || this.store.editor.editType === 'number')) {
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
        this.$refs.editor.editContent = this.store.showData[this.store.editor.editorYIndex][this.store.columns[this.store.editor.editorXIndex].key];
      }
      this.store.editor.editing = true;
      if (this.store.editor.editType === 'select') {
        this.store.editor.options = this.store.columns[this.store.editor.editorXIndex].options;
      }
      this.$nextTick(() => {
        this.$refs.editor.$refs[this.store.editor.editType].focus();
      });
    },
    selectUp() {
      clearInterval(this.timer);
      setTimeout(() => {
        this.store.selector.isSelected = false;
      }, 0);
    },
    adjustPosition() {
      if (this.store.editor.editorXIndex < this.fixedCount) {
        this.store.editor.editorIsFixed = true;
      } else {
        this.store.editor.editorIsFixed = false;
      }
      this.store.autofill.autofillXIndex = this.store.editor.editorXIndex;
      this.store.autofill.autofillYIndex = this.store.editor.editorYIndex;
      this.store.selector.selectedXArr = [this.store.editor.editorXIndex, this.store.editor.editorXIndex];
      this.store.selector.selectedYArr = [this.store.editor.editorYIndex, this.store.editor.editorYIndex];
      // 左右调整
      let curLeftShould; let
        curRightShould;
      if (this.fixedCount > 0) {
        const unFixedLeftArr = this.scrollLeftArr.slice(this.fixedCount - 1, -1).map(item => item - this.fixedWidth);
        const unFixedRightArr = this.scrollLeftArr.slice(this.fixedCount).map(item => item - this.fixedWidth);
        curLeftShould = unFixedLeftArr[this.store.editor.editorXIndex - this.fixedCount];
        curRightShould = unFixedRightArr[this.store.editor.editorXIndex - this.fixedCount] + this.fixedWidth - this.wrapperWidth + scrollBarWidth + 2;
      } else {
        const scrollLeftArr = [0, ...this.scrollLeftArr];
        curLeftShould = scrollLeftArr[this.store.editor.editorXIndex];
        curRightShould = scrollLeftArr[this.store.editor.editorXIndex + 1] - this.wrapperWidth + scrollBarWidth + 2;
      }
      if (this.tableWidth > this.wrapperWidth) {
        if (this.tableScrollLeft > curLeftShould) {
          this.$refs.theader.scrollLeft = curLeftShould;
          this.$refs.tbody.scrollLeft = curLeftShould;
        }
        if (this.tableScrollLeft < curRightShould) {
          this.$refs.theader.scrollLeft = curRightShould + 2;
          this.$refs.tbody.scrollLeft = curRightShould + 2;
        }
      }
      // 上下调整
      if (this.maxHeight) {
        const curTopShould = this.scrollTopArr[this.store.editor.editorYIndex];
        if (this.tableScrollTop > curTopShould) {
          this.$refs.tbody.scrollTop = curTopShould;
          this.$refs.fixedTbody.scrollTop = curTopShould;
        }
        const curBottomShould = this.scrollTopArr[this.store.editor.editorYIndex + 1] - this.maxHeight + scrollBarWidth + 2;
        if (this.tableScrollTop < curBottomShould) {
          this.$refs.tbody.scrollTop = curBottomShould;
          this.$refs.fixedTbody.scrollTop = curBottomShould;
        }
      }
    },
    multiSelectAdjustPostion(e) {
      if (this.store.selector.isSelected) {
        if (e) {
          e = e || window.event;
          this.mouseX = e.pageX;
          this.mouseY = e.pageY;
        }
        if (this.store.selector.selectedYArr[0] === this.store.selector.selectedYArr[1] && this.store.selector.selectedXArr[0] === this.store.selector.selectedXArr[1]) {
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
      if (!this.store.editor.editing) {
        if (type === 'undo' && this.curHisory > 1) {
          this.curHisory -= 1;
        }
        if (type === 'recovery' && this.curHisory < this.historyData.length) {
          this.curHisory += 1;
        }
        this.isOperation = true;
        this.data.forEach((i, index) => {
          Object.keys(i).forEach((j) => {
            i[j] = JSON.parse(this.historyData[this.curHisory - 1])[index][j];
          });
        });
        this.$nextTick(() => {
          this.isOperation = false;
        });
      }
    },
    adjustWidth(index, width) {
      this.store.columns[index].width = width;
      this.handleResize();
    },
    sort(type) {
      this.columnsStatusList.forEach((item) => {
        item.sort = '';
      });
      this.columnsStatusList[this.store.dropdown.index].sort = type;
      if (type === 'ascending') {
        this.store.showData.sort((x, y) => (x[this.columnsStatusList[this.store.dropdown.index].key] > y[this.columnsStatusList[this.store.dropdown.index].key] ? 1 : -1));
      } else {
        this.store.showData.sort((x, y) => (x[this.columnsStatusList[this.store.dropdown.index].key] > y[this.columnsStatusList[this.store.dropdown.index].key] ? -1 : 1));
      }
      this.store.dropdown.index = null;
    },
    handleFilter() {
      this.columnsStatusList[this.store.dropdown.index] = {
        list: this.store.dropdown.list,
        key: this.store.dropdown.key,
        sort: this.store.dropdown.sort,
      };
      const arr = [];
      Object.keys(this.store.dropdown.list).forEach((key) => {
        if (this.store.dropdown.list[key].checked) {
          arr.push(key);
        }
      });
      this.store.filters[this.columnsStatusList[this.store.dropdown.index].key] = arr;
      this.filterData();
    },
    resetFilter() {
      delete this.store.filters[this.columnsStatusList[this.store.dropdown.index].key];
      Object.keys(this.columnsStatusList[this.store.dropdown.index].list).forEach((key) => {
        this.columnsStatusList[this.store.dropdown.index].list[key].checked = false;
      });
      this.filterData();
    },
    filterData() {
      this.store.showData = this.data;
      Object.keys(this.store.filters).forEach((key) => {
        this.store.showData = this.store.showData.filter(item => this.store.filters[key].includes(item[key].toString()));
      });
      this.store.dropdown.index = null;
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
</style>
