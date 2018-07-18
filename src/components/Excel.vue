<template>
    <div>
        <div class="km-table-wrapper" ref="wrapper" :class="{scrollX: tableWidth > wrapperWidth}" :style="{maxWidth: `${tableWidth}px`}" v-clickoutside="clickoutside" v-if="columns.length > 0">
            <div class="km-table-header" ref="theader">
                <table-header 
                    :columns="columns" 
                    :columnsWidth="columnsWidth" 
                    :tableScrollLeft="tableScrollLeft"
                    :fixedCount="fixedCount"
                    :all-show="true"
                    :dropdownIndex="dropdownIndex"
                    :filters="filters"
                    ref="theaderContent">
                </table-header>
            </div>
            <div class="km-table-body" ref="tbody" :style="{maxHeight: `${maxHeight}px`}">
                <table-body 
                    :columns="columns" 
                    :data="showData" 
                    :dataStatusList="dataStatusList"
                    :columnsWidth="columnsWidth" 
                    :editorShow="editorShow" 
                    :editorYIndex="editorYIndex" 
                    :selectedXArr="selectedXArr" 
                    :selectedYArr="selectedYArr" 
                    :autofillYArr="autofillYArr" 
                    :all-show="true"
                    ref="tbodyContent">
                    <!-- 编辑器 -->
                    <editor 
                        :editType="editType" 
                        :editing="editing" 
                        :editorShow="editorShow" 
                        :editorIsFixed="editorIsFixed" 
                        :options="options" 
                        :curEditorWidth="curEditorWidth" :tableScrollLeft="tableScrollLeft" 
                        :columns="columns" 
                        :columnsWidth="columnsWidth" 
                        :editorXIndex="editorXIndex" 
                        :editorYIndex="editorYIndex" 
                        :curEditorCoverValue="curEditorCoverValue"
                        :selectedYArr="selectedYArr" 
                        :autofillXIndex="autofillXIndex" 
                        :autofillYIndex="autofillYIndex" 
                        :fixedCount="fixedCount"
                        ref="editor"></editor>
                </table-body>
                <div class="empty-block" v-if="showData.length == 0" :style="{width: `${tableWidth}px`}">
                    暂无数据
                </div>
            </div>
            <!-- 左侧固定- -->
            <div class="km-table-fixed" ref="fixedWrapper" :style="{width: `${fixedWidth}px`}">
                <div class="km-table-fixed-header" ref="fixedTheader">
                    <table-header 
                        :columns="columns" 
                        :columnsWidth="columnsWidth" 
                        :fixedCount="fixedCount"
                        :tableScrollLeft="tableScrollLeft"
                        :dropdownIndex="dropdownIndex"
                        :filters="filters"
                        ref="fixedTheaderContent"></table-header>
                </div>
                <div class="km-table-fixed-body" ref="fixedTbody">
                    <table-body 
                        :columns="columns" 
                        :data="showData" 
                        :dataStatusList="dataStatusList"
                        :columnsWidth="columnsWidth" 
                        :editorShow="editorShow" 
                        :editorYIndex="editorYIndex" 
                        :selectedXArr="selectedXArr" 
                        :selectedYArr="selectedYArr" 
                        :autofillYArr="autofillYArr"
                        ref="fixedTbodyContent"></table-body>
                </div>
            </div>
        </div>
        <div class="empty-columns" ref="wrapper" v-else>
            <div ref="theader">
                <div ref="theaderContent"></div>
            </div>
            <div ref="tbody">
                <div ref="tbodyContent"></div>
            </div>
            暂无表头
        </div>
        <dropdown
            :dropdownIndex="dropdownIndex"
            :tableScrollLeft="tableScrollLeft"
            :tableScrollTop="tableScrollTop"
            :columnsWidth="columnsWidth"
            :fixedCount="fixedCount"
            :data="data"
            v-model="dropdownColumn"
        ></dropdown>
    </div>
</template>

<script>
import '../style/reset.scss';
import clickoutside from '../mixins/clickoutside.js';
import TableHeader from './ExcelHeader.vue';
import TableBody from './ExcelBody.vue';
import Editor from './ExcelEditor.vue';
import Dropdown from './ExcelDropdown.vue';
import { checkbox } from 'element-ui';

const scrollBarWidth = 10;

export default {
    directives: { clickoutside },
    components: {
        TableHeader,
        TableBody,
        Editor,
        Dropdown,
        'el-checkbox': checkbox
    },
    props: {
        columnsData: {
            type: Array,
            default: () => {
                return []
            }
        },
        value: {
            type: Array,
            default: () => {
                return []
            }
        },
        maxHeight: {
            type: [String, Number]
        }
    },
    data() {
        return {
            columns: [],

            wrapperWidth: null,
            tableWidth: null,
            theaderHeight: null,
            columnsWidth: [],

            data: [],
            initialData: null,
            showData: [],
            changeData: [],
            columnsStatusList: [],
            dataStatusList: [],

            tableScrollLeft: 0,
            tableScrollTop: 0,
            scrollLeftArr: [],
            scrollTopArr: [],
            fixedCount: 0,
            fixedWidth: 0,

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

            // 自动填充
            autofillXIndex: 0,
            autofillYIndex: 0,
            isAutofill: false,
            autofillYArr: [],

            // 选择区域
            isSelected: false,
            selectedXIndex: 0,
            selectedYIndex: 0,
            selectedXArr: [],
            selectedYArr: [],

            // 鼠标
            mouseX: 0,
            mouseY: 0,
            timer: null,

            historyData: [],
            curHisory: 0,
            isOperation: false,

            dropdownIndex: null,
            dropdownColumn: {},

            filters: {},
        }
    },
    watch: {
        value(val) {
            this.data = val;
        },
        data: {
            handler(val) {
                if (!this.isOperation) {
                    if (this.historyData.length != this.curHisory) {
                        this.historyData = this.historyData.slice(0, this.curHisory)
                    }
                    this.historyData.push(JSON.stringify(val));
                    this.curHisory++;
                }
                this.$emit('input', val);
                if (!this.initialData) {
                    this.initData();
                }
                this.handleResize();
                this.handleFilters();
                this.handleChangeData();
            },
            deep: true
        },
        tableScrollLeft() {
            this.dropdownIndex = null;
        },
        tableScrollTop() {
            this.dropdownIndex = null;
        },
        columnsData: {
            handler(val) {
                this.initColumns();
                this.handleResize();
            },
            deep: true,
        },
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            this.$refs.tbody.addEventListener('scroll', () => {
                this.$refs.theader.scrollLeft = this.$refs.tbody.scrollLeft;
                this.$refs.fixedTbody.scrollTop = this.$refs.tbody.scrollTop;
                this.tableScrollLeft = this.$refs.tbody.scrollLeft;
                this.tableScrollTop = this.$refs.tbody.scrollTop;
            })
            this.initColumns();
            this.handleResize();
        },
        initColumns() {
            let fixedArr = this.columnsData.filter(item => item.fixed);
            let unFixedArr = this.columnsData.filter(item => !item.fixed);
            this.columns = fixedArr.concat(unFixedArr);
            this.columnsWidth = this.columns.map(item => item.width);
        },
        initData() {
            this.showData = this.data;
            this.dataStatusList = this.data.map(item => {
                return {
                    checked: false,
                    errors: [],
                }
            });
            this.initialData = JSON.parse(JSON.stringify(this.data));
            this.historyData = [JSON.stringify(this.data)];
            this.curHisory = 1;
            this.$refs.theaderContent.checkedAll = false;
            this.$refs.fixedTheaderContent.checkedAll = false;
            this.handleResize();
            this.handleFilters();
            this.handleChangeData();
        },
        handleResize() {
            // 获取编辑框可移动范围, X是横轴, Y是竖轴 
            this.editorRange = {
                minX: this.columns.filter(item => item.type == 'selection').length,
                maxX: this.columns.length - 1,
                minY: 0,
                maxY: this.showData.length - 1
            }

            this.wrapperWidth = this.$refs.wrapper.offsetWidth;

            this.$nextTick(() => {
                // 计算剩余列宽度
                let surplusColumns = this.columns.filter(item => !item.width);
                let surplusColumnAvg;

                if (!this.$refs.tbodyContent.$el) return;
                if (surplusColumns.length > 0) {
                    let surplusWidth = this.wrapperWidth - this.columns.filter(item => item.width).reduce((total, item) => {
                        return total + item.width;
                    }, 0);
                    if (surplusWidth > 0) {
                        if (this.$refs.tbodyContent.$el.offsetHeight > this.maxHeight) {
                            surplusColumnAvg = (surplusWidth - 1 - scrollBarWidth) / surplusColumns.length;
                        } else {
                            surplusColumnAvg = (surplusWidth - 1) / surplusColumns.length;
                        }
                    }
                }

                // 设置单元格宽度
                this.columns.forEach((column, index) => {
                    if (column.width) {
                        this.$set(this.columnsWidth, index, column.width)
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
                    let sum = this.columnsWidth.reduce((total, item, curIndex) => {
                        if (curIndex <= index) {
                            return total + item;
                        } else {
                            return total
                        }
                    }, 0)
                    return sum
                })

                this.scrollTopArr = this.showData.map((item, index) => {
                    let sum = this.showData.reduce((total, item, curIndex) => {
                        if (curIndex <= index) {
                            return total + 28
                        } else {
                            return total
                        }
                    }, 0)
                    return sum
                })
                this.scrollTopArr.unshift(0);

                this.fixedCount = this.columns.filter(item => item.fixed).length;
                this.fixedWidth = this.scrollLeftArr[this.fixedCount - 1] || 0;

                // 如果每列均设置了宽度
                const allWidth = this.columns.every(cell => cell.width);
                if (allWidth) {
                    this.tableWidth = this.columns.map(cell => cell.width).reduce((a, b) => a + b, 0);
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
                        let colgroup = this.$refs.theaderContent.$el.querySelector('colgroup');
                        let tr = this.$refs.theaderContent.$el.querySelector('tr');

                        // 如果已存在Col，删除组中重新在末尾添加
                        for (let i = 0; i < colgroup.children.length; i++) {
                            if (colgroup.children[i].width == scrollBarWidth) {
                                colgroup.removeChild(colgroup.children[i]);
                                tr.removeChild(tr.children[i]);
                            }
                        }
                        let col = document.createElement('col');
                        col.width = scrollBarWidth;
                        colgroup.appendChild(col);

                        let th = document.createElement('th');
                        th.style.width = `${scrollBarWidth}px`;
                        th.style.borderTop = '1px solid #d6dfe4';
                        tr.appendChild(th);

                        this.$refs.tbodyContent.$el.style.width = `${this.tableWidth - scrollBarWidth - 1}px`;
                    })
                }
            })
        },
        handleFilters() {
            this.columns.forEach(th => {
                if (th.type == 'selection') return;
                if (th.filters) {
                    Object.keys(th.filters).forEach(item => {
                        th.filters[item].count = 0;
                    })
                } else {
                    th.filters = {};
                }
                this.data.forEach(td => {
                    if (td[th.key]) {
                        if (th.filters[td[th.key]]) {
                            th.filters[td[th.key]].count += 1;
                        } else {
                            th.filters[td[th.key]] = {};
                            th.filters[td[th.key]].count = 1;
                        }
                    }
                })
                Object.keys(th.filters).forEach(item => {
                    if (th.filters[item].count == 0) {
                        delete th.filters[item]
                    }
                })
            })
        },
        handleChangeData() {
            let data = JSON.parse(JSON.stringify(this.data));
            let initialData = JSON.parse(JSON.stringify(this.initialData));
            this.changeData = data.filter((item, index) => {
                return JSON.stringify(item) !== JSON.stringify(initialData[index])
            });
        },
        clickoutside() {
            if (this.isSelected || this.isAutofill) return;
            this.editing = false;
            this.editorShow = false;
            this.selectedXArr = [];
            this.selectedYArr = [];
            window.removeEventListener("keydown", this.keySubmit);
            window.removeEventListener("mousemove", this.multiSelectAdjustPostion);
        },
        // 选择单元格
        selectCell(e, x, y, type) {
            if (e.button != 0) return;
            window.addEventListener("keydown", this.keySubmit);
            window.addEventListener("mousemove", this.multiSelectAdjustPostion);
            if (type == 'selection') return;
            this.editing = false;
            this.editType = 'text';

            this.autofillXIndex = x;
            this.autofillYIndex = y;
            this.editorShow = true;

            this.selectedXIndex = x;
            this.selectedYIndex = y;
            this.selectedXArr = [x, x];
            this.selectedYArr = [y, y];
            this.$nextTick(() => {
                this.editorXIndex = x;
                this.editorYIndex = y;
                this.curEditorCoverValue = this.showData[this.editorYIndex][this.columns[this.editorXIndex].key];
                this.$nextTick(() => {
                    this.adjustPosition();
                    this.$refs.editor.$refs.clipboard.focus();
                })
            })

            this.isSelected = true;
            this.timer = setInterval(this.multiSelectAdjustPostion, 10);
            window.addEventListener('mouseup', this.selectUp);
        },
        keySubmit(e) {
            if ((e.ctrlKey && e.keyCode == 90) || (e.metaKey && e.keyCode == 90)) {
                return this.operation('undo');
            }
            if ((e.ctrlKey && e.keyCode == 89) || (e.metaKey && e.keyCode == 89)) {
                return this.operation('recovery');
            }
            if (this.editing && e.keyCode == 13) {
                this.editing = false;
                this.editType = 'text';
                return;
            }
            if (this.editing || !this.editorShow) {
                return;
            }
            if ((e.ctrlKey && e.keyCode == 67) || (e.metaKey && e.keyCode == 67)) {
                return this.getContentToclipboard();
            }
            if (e.ctrlKey || e.metaKey) {
                return;
            }
            e.preventDefault();
            const isImportability = (k) => {
                if ((k >= 65 && k <= 90) || (k >= 48 && k <= 57) || (k >= 96 && k <= 107) || (k >= 109 && k <= 111) || k == 32 || (k >= 186 && k <= 222)) {
                    return true;
                } else {
                    return false;
                }
            }
            switch (true) {
                case e.keyCode == 37:
                    // 左
                    if (this.editorXIndex == this.editorRange.minX) {
                        this.editorXIndex = this.editorRange.minX;
                    } else {
                        this.editorXIndex = this.editorXIndex - 1;
                    }
                    this.adjustPosition();
                    break;
                case e.keyCode == 38:
                    // 上
                    if (this.editorYIndex == this.editorRange.minY) {
                        this.editorYIndex = this.editorRange.minY;
                    } else {
                        this.editorYIndex = this.editorYIndex - 1;
                    }
                    this.adjustPosition();
                    break;
                case e.keyCode == 39:
                    // 右
                    if (this.editorXIndex == this.editorRange.maxX) {
                        this.editorXIndex = this.editorRange.maxX;
                    } else {
                        this.editorXIndex = this.editorXIndex + 1;
                    }
                    this.adjustPosition();
                    break;
                case e.keyCode == 40:
                    // 下
                    if (this.editorYIndex == this.editorRange.maxY) {
                        this.editorYIndex = this.editorRange.maxY;
                    } else {
                        this.editorYIndex = this.editorYIndex + 1;
                    }
                    this.adjustPosition();
                    break;
                case e.keyCode == 8:
                    // 删除
                    this.clearSelected();
                    break;
                case e.keyCode == 13:
                    this.setEditing();
                    break;
                case isImportability(e.keyCode) || e.key == 'Process' || e.key == 'Unidentified':
                    this.setEditing(e.key);
                    break;
            }
        },
        getContentToclipboard() {
            let content = '';
            for (let i = 0; i <= this.selectedYArr[1] - this.selectedYArr[0]; i++) {
                for (let j = 0; j <= this.selectedXArr[1] - this.selectedXArr[0]; j++) {
                    if (this.selectedXArr[1] - this.selectedXArr[0] == 0) {
                        content += (this.showData[i + this.selectedYArr[0]][this.columns[j + this.selectedXArr[0]].key] || '') + '\n';
                    } else if (j == 0) {
                        content += (this.showData[i + this.selectedYArr[0]][this.columns[j + this.selectedXArr[0]].key] || '');
                    } else if (j == this.selectedXArr[1] - this.selectedXArr[0]) {
                        content += '\t' + (this.showData[i + this.selectedYArr[0]][this.columns[j + this.selectedXArr[0]].key] || '') + '\n';
                    } else {
                        content += '\t' + (this.showData[i + this.selectedYArr[0]][this.columns[j + this.selectedXArr[0]].key] || '');
                    }
                }
            }
            let textArea = document.createElement("textarea");
            textArea.value = content;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                let successful = document.execCommand('copy');
            } catch (err) {
            }
            document.body.removeChild(textArea);
        },
        clipboardToContent(e) {
            this.$nextTick(() => {
                let arr = [];
                e.target.value.split('\n').forEach((item, index, curArr) => {
                    if (index < curArr.length - 1) {
                        arr.push(item.split('\t'))
                    }
                });
                for (let i = 0; i <= arr.length - 1; i++) {
                    for (let j = 0; j <= arr[i].length - 1; j++) {
                        if (this.showData[i + this.selectedYArr[0]] && this.columns[j + this.selectedXArr[0]]) {
                            if (this.columns[j + this.selectedXArr[0]].type != 'disabled') {
                                this.showData[i + this.selectedYArr[0]][this.columns[j + this.selectedXArr[0]].key] = arr[i][j];
                            }
                        }
                    }
                }
                this.$refs.editor.$refs.clipboard.value = '';
            })
        },
        clearSelected() {
            for (let i = 0; i <= this.selectedYArr[1] - this.selectedYArr[0]; i++) {
                for (let j = 0; j <= this.selectedXArr[1] - this.selectedXArr[0]; j++) {
                    if (this.columns[j + this.selectedXArr[0]].type != 'disabled') {
                        this.showData[i + this.selectedYArr[0]][this.columns[j + this.selectedXArr[0]].key] = '';
                    }
                }
            }
        },
        // 设置启用编辑
        setEditing(key) {
            if (this.columns[this.editorXIndex].type == 'disabled') {
                return;
            }
            this.editType = this.columns[this.editorXIndex].type ? this.columns[this.editorXIndex].type : 'text';
            this.curEditorWidth = this.columnsWidth[this.editorXIndex];
            if (key && (this.editType == 'text' || this.editType == 'number')) {
                if (key == 'Process' || key == 'Unidentified') {
                    if (key.match(/\d/)) {
                        this.$refs.editor.editContent = key.match(/\d/)[0];
                    } else {
                        this.$refs.editor.editContent = '';
                    }
                } else {
                    this.$refs.editor.editContent = key;
                }
            } else {
                this.$refs.editor.editContent = this.showData[this.editorYIndex][this.columns[this.editorXIndex].key];
            }
            this.editing = true;
            if (this.editType == 'select') {
                this.options = this.columns[this.editorXIndex].options;
            }
            this.$nextTick(() => {
                this.$refs.editor.$refs[this.editType].focus();
            })
        },
        selectUp() {
            clearInterval(this.timer);
            setTimeout(() => {
                this.isSelected = false;
            }, 0)
        },
        adjustPosition() {
            if (this.editorXIndex < this.fixedCount) {
                this.editorIsFixed = true;
            } else {
                this.editorIsFixed = false;
            }
            this.autofillXIndex = this.editorXIndex;
            this.autofillYIndex = this.editorYIndex;
            this.selectedXArr = [this.editorXIndex, this.editorXIndex];
            this.selectedYArr = [this.editorYIndex, this.editorYIndex];
            // 左右调整
            let curLeftShould, curRightShould;
            if (this.fixedCount > 0) {
                let unFixedLeftArr = this.scrollLeftArr.slice(this.fixedCount - 1, -1).map(item => {
                    return item - this.fixedWidth;
                })
                let unFixedRightArr = this.scrollLeftArr.slice(this.fixedCount).map(item => {
                    return item - this.fixedWidth;
                })
                curLeftShould = unFixedLeftArr[this.editorXIndex - this.fixedCount];
                curRightShould = unFixedRightArr[this.editorXIndex - this.fixedCount] + this.fixedWidth - this.wrapperWidth + scrollBarWidth + 2;
            } else {
                let scrollLeftArr = [0, ...this.scrollLeftArr];
                curLeftShould = scrollLeftArr[this.editorXIndex];
                curRightShould = scrollLeftArr[this.editorXIndex + 1] - this.wrapperWidth + scrollBarWidth + 2;
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
                let curTopShould = this.scrollTopArr[this.editorYIndex];
                if (this.tableScrollTop > curTopShould) {
                    this.$refs.tbody.scrollTop = curTopShould;
                    this.$refs.fixedTbody.scrollTop = curTopShould;
                }
                let curBottomShould = this.scrollTopArr[this.editorYIndex + 1] - this.maxHeight + scrollBarWidth + 2;
                if (this.tableScrollTop < curBottomShould) {
                    this.$refs.tbody.scrollTop = curBottomShould;
                    this.$refs.fixedTbody.scrollTop = curBottomShould;
                }
            }
        },
        multiSelect(e, x, y, columnType) {
            if (columnType == 'selection') return;
            if (this.isSelected) {
                this.autofillXIndex = x > this.editorXIndex ? x : this.editorXIndex;
                this.autofillYIndex = y > this.editorYIndex ? y : this.editorYIndex;
                this.selectedXIndex = x;
                this.selectedYIndex = y;
                if (this.selectedXIndex > this.editorXIndex) {
                    this.selectedXArr.splice(0, 1, this.editorXIndex);
                    this.selectedXArr.splice(1, 1, this.selectedXIndex);
                } else {
                    this.selectedXArr.splice(0, 1, this.selectedXIndex);
                    this.selectedXArr.splice(1, 1, this.editorXIndex);
                }
                if (this.selectedYIndex > this.editorYIndex) {
                    this.selectedYArr.splice(0, 1, this.editorYIndex);
                    this.selectedYArr.splice(1, 1, this.selectedYIndex);
                } else {
                    this.selectedYArr.splice(0, 1, this.selectedYIndex);
                    this.selectedYArr.splice(1, 1, this.editorYIndex);
                }
            }
            if (this.isAutofill) {
                if (y > this.selectedYArr[1]) {
                    this.autofillYArr = [this.selectedYArr[1] + 1, y]
                } else if (y < this.selectedYArr[0]) {
                    this.autofillYArr = [y, this.selectedYArr[0] - 1];
                } else {
                    this.autofillYArr = [];
                }
            }
        },
        multiSelectAdjustPostion(e) {
            if (this.isSelected) {
                if (e) {
                    e = e || window.event;
                    this.mouseX = e.pageX;
                    this.mouseY = e.pageY;
                }
                if (this.selectedYArr[0] == this.selectedYArr[1] && this.selectedXArr[0] == this.selectedXArr[1]) {
                    return;
                }
                let sTop = this.$refs.wrapper.offsetTop + 30;
                let sLeft = this.$refs.wrapper.offsetLeft + this.fixedWidth;
                let sBottom = this.$refs.wrapper.offsetTop + this.$refs.wrapper.offsetHeight - 10;
                let sRight = this.$refs.wrapper.offsetLeft + this.$refs.wrapper.offsetWidth - 10;
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
        autofill() {
            this.isAutofill = true;
            window.addEventListener('mouseup', this.autofillUp);
        },
        autofillUp() {
            if (this.autofillYArr[1] > this.selectedYArr[1]) {
                for (let i = 0; i <= this.autofillYArr[1] - this.autofillYArr[0]; i++) {
                    for (let j = 0; j <= this.selectedXArr[1] - this.selectedXArr[0]; j++) {
                        if (this.columns[j + this.selectedXArr[0]].type != 'disabled') {
                            this.showData[i + this.autofillYArr[0]][this.columns[j + this.selectedXArr[0]].key] = this.showData[this.selectedYArr[1]][this.columns[j + this.selectedXArr[0]].key]
                        }
                    }
                }
                this.selectedYArr.splice(1, 1, this.autofillYArr[1]);
                this.autofillYIndex = this.autofillYArr[1];
            }
            if (this.autofillYArr[0] < this.selectedYArr[0]) {
                for (let i = 0; i <= this.autofillYArr[1] - this.autofillYArr[0]; i++) {
                    for (let j = 0; j <= this.selectedXArr[1] - this.selectedXArr[0]; j++) {
                        if (this.columns[j + this.selectedXArr[0]].type != 'disabled') {
                            this.showData[i + this.autofillYArr[0]][this.columns[j + this.selectedXArr[0]].key] = this.showData[this.selectedYArr[0]][this.columns[j + this.selectedXArr[0]].key]
                        }
                    }
                }
                this.selectedYArr.splice(0, 1, this.autofillYArr[0]);
            }
            setTimeout(() => {
                this.autofillYArr = [];
                this.isAutofill = false;
            }, 0)
        },
        // 行选择
        selectionChange() {
            let selection = this.showData.filter((item, index) => this.dataStatusList[index].checked);
            this.$emit('selection-change', selection);
            if (this.dataStatusList.every(item => item.checked)) {
                this.$refs.theaderContent.checkedAll = true;
                this.$refs.fixedTheaderContent.checkedAll = true;
            } else {
                this.$refs.theaderContent.checkedAll = false;
                this.$refs.fixedTheaderContent.checkedAll = false;
            }
        },
        selectAll() {
            const checkedAll = this.dataStatusList.every(item => item.checked);
            this.dataStatusList.forEach((item, index) => {
                this.$set(this.dataStatusList[index], 'checked', !checkedAll)
            });
            this.selectionChange();
        },
        operation(type) {
            if (!this.editing) {
                if (type == 'undo' && this.curHisory > 1) {
                    this.curHisory--;
                }
                if (type == 'recovery' && this.curHisory < this.historyData.length) {
                    this.curHisory++;
                }
                this.isOperation = true;
                this.data.forEach((i, index) => {
                    Object.keys(i).forEach(j => {
                        i[j] = JSON.parse(this.historyData[this.curHisory - 1])[index][j];
                    })
                })
                this.$nextTick(() => {
                    this.isOperation = false;
                })
            }
        },
        getEditorContent(editContent) {
            this.showData[this.editorYIndex][this.columns[this.editorXIndex].key] = editContent;
        },
        resetEditor() {
            this.editing = false;
            this.editType = 'text';
        },
        adjustWidth(index, width) {
            this.columns[index].width = width;
            this.handleResize();
        },
        openDropdown(i) {
            if (i) {
                if (this.dropdownIndex == i) {
                    this.dropdownIndex = null;
                } else {
                    this.dropdownIndex = i;
                    this.dropdownColumn = JSON.parse(JSON.stringify(this.columns[this.dropdownIndex]));
                }
            } else {
                this.dropdownIndex = null;
            }
        },
        sort(type) {
            this.columns.forEach(item => {
                item.sort = '';
            })
            this.columns[this.dropdownIndex].sort = type;
            if (type == 'ascending') {
                this.showData.sort((x, y) => {
                    return x[this.columns[this.dropdownIndex].key] > y[this.columns[this.dropdownIndex].key] ? 1 : -1;
                })
            } else {
                this.showData.sort((x, y) => {
                    return x[this.columns[this.dropdownIndex].key] > y[this.columns[this.dropdownIndex].key] ? -1 : 1;
                })
            }
            this.dropdownIndex = null;
        },
        handleFilter(dropdownColumn) {
            this.columns[this.dropdownIndex] = dropdownColumn;
            let arr = [];
            for (const key in dropdownColumn.filters) {
                if (dropdownColumn.filters[key].checked) {
                    arr.push(key);
                }
            }
            this.filters[this.columns[this.dropdownIndex].key] = arr;
            this.filterData();
        },
        resetFilter() {
            delete this.filters[this.columns[this.dropdownIndex].key];
            for (const key in this.columns[this.dropdownIndex].filters) {
                this.columns[this.dropdownIndex].filters[key].checked = false;
            }
            this.filterData();
        },
        filterData() {
            this.showData = this.data;
            for (const key in this.filters) {
                this.showData = this.showData.filter(item => {
                    return this.filters[key].includes(item[key].toString())
                })
            }
            this.dropdownIndex = null;
            this.handleResize();
        },
        setErrors(index, key, correct) {
            if (!this.dataStatusList[index].errors) {
                this.dataStatusList[index].errors = []
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
        }
    }
}
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
