<template>
    <div class="dropdown-wrapper" :class="{active:parseInt(dropdownIndex) >= 0}" :style="{'top': `${$parent.$refs.wrapper.offsetTop + 30}px`, 'left': left}" ref="dropdown" v-clickoutside="openDropdown">
        <div class="sort">
            <span :class="{active: dropdownColumn.sort == 'ascending'}" @click="sort('ascending')">升序</span>
            <span :class="{active: dropdownColumn.sort == 'descending'}" @click="sort('descending')">降序</span>
        </div>
        <div class="filter">
            <div class="title">名称<span>（计数）</span></div>
            <ul class="content">
                <li v-for="(item, key) in dropdownColumn.filters" :key="key">
                    <el-checkbox 
                        size="mini" 
                        v-model="item.checked"></el-checkbox>
                    <p>
                        <span :title="key">{{ key }}</span>
                        <i>（{{ item.count }}）</i>
                    </p>
                </li>
            </ul>
            <div class="btns">
                <span :style="filterBtnStyle" @click="handleFilter">筛选</span>
                <span @click="resetFilter">重置</span>
            </div>
        </div>
    </div>
</template>

<script>
    import clickoutside from '../mixins/clickoutside.js';
    import { checkbox } from 'element-ui';

    export default {
        directives: { clickoutside },
        props: {
            dropdownIndex: [String, Number],
            tableScrollLeft: [String, Number],
            columnsWidth: {
                type: Array,
                default: () => {
                    return []
                }
            },
            fixedCount: [String, Number],
            value: {
                type: Object,
                default: () => {
                    return {}
                }
            },
            data: {
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
                dropdownColumn: {},
                left: 0,
            }
        },
        computed: {
            filterBtnStyle() {
                let haveChecked = false;
                for (const key in this.dropdownColumn.filters) {
                    if (this.dropdownColumn.filters[key].checked) {
                        haveChecked = true;
                    }
                }
                if (!haveChecked) {
                    return {
                        'cursor': 'not-allowed',
                        'color': '#c0c4cc',
                    }
                }
            }
        },
        watch: {
            value(val) {
                this.dropdownColumn = val;
            },
            dropdownColumn(val) {
                this.$emit('input', val);
            },
            dropdownIndex(val) {
                if (!val) return;
                let left;
                if (this.dropdownIndex < this.fixedCount) {
                    left = this.tableScrollLeft + this.columnsWidth.filter((item, index) => index <= this.dropdownIndex).reduce((sum, item) => {
                        return sum + item
                    }, 0)
                } else {
                    left = this.columnsWidth.filter((item, index) => index <= this.dropdownIndex).reduce((sum, item) => {
                        return sum + item
                    }, 0)
                }
                this.$nextTick(() => {
                    left = left - this.$refs.dropdown.offsetWidth + this.$parent.$refs.wrapper.offsetLeft - this.tableScrollLeft;
                    if (left < this.$parent.$refs.wrapper.offsetLeft) {
                        left = this.$parent.$refs.wrapper.offsetLeft;
                    }
                    this.left = `${left}px`;
                })
            }
        },
        methods: {
            openDropdown() {
                this.$parent.openDropdown();
            },
            sort(type) {
                this.$parent.sort(type);
            },
            handleFilter() {
                let haveChecked = false;
                for (const key in this.dropdownColumn.filters) {
                    if (this.dropdownColumn.filters[key].checked) {
                        haveChecked = true;
                    }
                }
                if (!haveChecked) return;
                this.$parent.handleFilter(this.dropdownColumn);
            },
            resetFilter() {
                this.$parent.resetFilter();
            }
        }
    }
</script>

<style lang="scss" scoped>
    .dropdown-wrapper {
      position: absolute;
      top: 0;
      left: 0;
      z-index: 10;
      min-width: 100px;
      opacity: 0;
      transform: rotateX(90deg);
      transform-origin: top center;
      transition: transform 0.3s;
      border: 1px solid #ebeef5;
      border-radius: 2px;
      background-color: #fff;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
      padding: 8px;
      overflow-y: auto;
      &.active {
        opacity: 1;
        transform: rotateX(0);
      }
    }

    .sort {
      display: flex;
      font-size: 13px;
      span {
        display: flex;
        align-items: center;
        cursor: pointer;
        padding: 4px 8px;
        transition: all 0.3s;
        &.active {
          background-color: #c5e1ba;
        }
        &:hover {
          background-color: #ccffcc;
        }
        &:before {
          content: "";
          display: inline-block;
          width: 14px;
          height: 14px;
          margin-right: 2px;
        }
        &:first-child {
          &:before {
            background: url("../assets/ascending.png") center center no-repeat;
            background-size: contain;
          }
        }
        &:last-child {
          &:before {
            background: url("../assets/descending.png") center center no-repeat;
            background-size: contain;
          }
        }
      }
    }

    .filter {
      border: 1px solid #e0e0e0;
      padding: 4px;
      .title {
        padding: 2px 6px;
        background-color: #f3f4f5;
        span {
          color: #909399;
        }
      }
      .content {
        border-bottom: 1px solid #e0e0e0;
        padding: 4px 0;
        margin-bottom: 4px;
        overflow-y: auto;
        max-height: 300px;
        li {
          display: flex;
          align-items: center;
        }
        p {
          margin-left: 4px;
          span {
            display: inline-block;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            vertical-align: middle;
          }
          i {
            color: #909399;
          }
        }
      }
      .btns {
        font-size: 13px;
        span {
          display: inline-block;
          cursor: pointer;
          transition: all 0.5s;
          padding: 0 4px;
          &:hover {
            color: #20a0ff;
          }
        }
      }
    }
</style>