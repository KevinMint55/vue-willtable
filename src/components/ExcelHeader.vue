<template>
    <table cellspacing="0" cellpadding="0">
        <colgroup>
            <col 
                v-for="(columnWidth, index) in columnsWidth" :width="columnWidth" 
                :key="index">
        </colgroup>
        <thead class="km-thead">
            <tr ref="tr">
                <th 
                    v-for="(th, index) in columns" 
                    :key="index" 
                    :style="{
                        width: `${columnsWidth[index]}px`, 
                        'text-align': th.align
                    }"
                    :title="th.title"
                    v-show="th.fixed || allShow">
                    <el-checkbox 
                        size="mini" 
                        v-model="checkedAll" 
                        @change="selectAll" 
                        v-if="th.type == 'selection'"></el-checkbox>
                    <p 
                        class="cell-content" 
                        :style="{width: `${columnsWidth[index] - 20}px`}" 
                        :class="{active: isActive(th)}"
                        v-else>{{ th.title }}</p>
                    <div class="dropdown" v-if="th.type != 'selection'" :class="{active: dropdownIndex == index}">
                        <i @click.stop="openDropdown(index)"></i>
                    </div>
                    <div class="handler" @mousedown="handlerDown(index)" v-if="th.type != 'selection'"></div>
                </th>
            </tr>
        </thead>
    </table>
</template>

<script>
    import clickoutside from '../mixins/clickoutside.js';
    import { checkbox } from 'element-ui';

    export default {
        directives: { clickoutside },
        components: {
            'el-checkbox': checkbox
        },
        props: {
            allShow: Boolean,
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
            fixedCount: [String, Number],
            tableScrollLeft: [String, Number],
            dropdownIndex: [String, Number],
            filters: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data() {
            return {
                checkedAll: false,
                adjustWidthFlag: false,
                adjustWidthIndex: 0,
                adjustWidthType: '',
                mouseX: 0,
            }
        },
        methods: {
            selectAll() {
                this.$parent.selectAll();
            },
            handlerDown(index) {
                this.adjustWidthFlag = true;
                this.adjustWidthIndex = index;
                window.addEventListener("mousemove", this.handlerMove);
                window.addEventListener('mouseup', this.handlerUp);
            },
            handlerMove(e) {
                if (this.adjustWidthFlag) {
                    e = e || window.event;
                    let width;
                    if (this.fixedCount >= this.adjustWidthIndex + 1) {
                        width = e.pageX - this.$parent.$refs.wrapper.offsetLeft - this.$refs.tr.children[this.adjustWidthIndex].offsetLeft;
                    } else {
                        width = e.pageX + this.tableScrollLeft - this.$parent.$refs.wrapper.offsetLeft - this.$refs.tr.children[this.adjustWidthIndex].offsetLeft;
                    }
                    if (width >= 80) {
                        this.$parent.adjustWidth(this.adjustWidthIndex, width);
                    }
                }
            },
            handlerUp() {
                this.adjustWidthFlag = false;
                window.removeEventListener("mousemove", this.handlerMove);
                window.removeEventListener('mouseup', this.handlerUp);
            },
            openDropdown(i) {
                this.$parent.openDropdown(i);
            },
            isActive(th) {
                if (this.filters.hasOwnProperty(th.key)) {
                    return true;
                } else if (th.sort) {
                    return true;
                } else {
                    return false;
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
    .km-thead {
      position: relative;
      user-select: none;
      tr {
        background-color: #eef1f6;
      }
      th {
        position: relative;
        text-align: left;
        text-indent: 4px;
        border: 1px solid #d6dfe4;
        border-bottom: none;
        height: 30px;
      }
      .dropdown {
        position: absolute;
        top: 8px;
        right: 10px;
        z-index: 1;
        display: flex;
        i {
          display: inline-block;
          width: 10px;
          height: 10px;
          background: url("../assets/dropdown.png") center center no-repeat;
          cursor: pointer;
          transition: all 0.3s;
        }
        &.active {
          i {
            transform: rotateZ(180deg);
          }
        }
      }
      .handler {
        position: absolute;
        z-index: 1;
        top: 0;
        right: -8px;
        width: 16px;
        height: 30px;
        cursor: ew-resize;
        text-align: center;
        &:hover {
          &:after {
            background-color: #b7d5ec;
          }
        }
        &:after {
          content: "";
          display: inline-block;
          width: 4px;
          height: 30px;
          transition: all 0.3s;
        }
      }
    }

    .active {
      color: #2d8cf0;
    }
</style>