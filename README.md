# vue-willtable可编辑的表格组件

适用于Vue的可编辑的表格组件，支持多种快捷键操作，模拟Excel的操作体验

Demo here: https://demo.kevinmint.com/willtable/

基于该组件实现的多人实时在线编辑表格系统: https://castle.kevinmint.com

![image](https://qiniu.kevinmint.com/willtable1.gif)

![image](https://qiniu.kevinmint.com/willtable2.gif)

## Features

- 表格宽度调整
- 表格列固定
- 数据过滤与筛选
- 选择多行数据时使用Checkbox
- 批量框选删除与复制粘贴
- 可与Excel互相复制粘贴
- 框选单元格拖动超过表格区域时自动滚动
- 数据下拉复制
- 获取改变的数据行
- 按需使用[element-ui](https://github.com/ElemeFE/element)组件作为部分数据类型选择器
- 多种数据类型校验
- 获取校验非法的数据行
- 支持撤销与重做
- 可自定义每个单元格样式与类名

## Maybe TODO
- 自定义滚动条
- 过滤筛选传入自定义函数
- 列或单元格传入自定义校验函数
- table 与 table-column 拆分成两个组件使用
- 撤销与重做功能数据操作优化

## Installation

```
npm install vue-willtable --save
```

## Mount

### mount with global

``` javascript
import Vue from 'vue'
import VueWilltable from 'vue-willtable'

// require styles
import 'vue-willtable/dist/vue-willtable.min.css'

Vue.component('VueWilltable', VueWilltable)
```

### mount with component

``` javascript
import VueWilltable from 'vue-willtable'

// require styles
import 'vue-willtable/dist/vue-willtable.min.css'

export default {
  components: {
    VueWilltable
  }
}
```

## Usage

```vue
<template>
  <willtable
    ref="willtable"
    :columns="columns"
    v-model="data"
    maxHeight="800" />
</template>

<script>
export default {
  data() {
    return {
      columns: [
        {
          type: 'selection',
          width: 40,
          fixed: true,
        },
        {
          title: '序号',
          key: 'sid',
          fixed: true,
          type: 'number',
          width: 100,
        },
        {
          title: '姓名',
          key: 'name',
          fixed: true,
          width: 120,
        },
        {
          title: '日期',
          key: 'date',
          type: 'date',
          width: 100,
        },
        {
          title: '工作岗位',
          key: 'email',
          width: 300,
          type: 'select',
          options: [
            {
              value: 'Web前端开发',
              label: 'Web前端开发',
            },
            {
              value: 'Java开发',
              label: 'Java开发',
            },
            {
              value: 'Python开发',
              label: 'Python开发',
            },
            {
              value: 'Php开发',
              label: 'Php开发',
            },
          ],
        },
        {
          title: '月份',
          key: 'month',
          type: 'month',
          width: 100,
        },
        {
          title: '地址',
          key: 'address',
          width: 200,
        },
        {
          title: '标题',
          key: 'title',
          width: 300,
        },
        {
          title: '内容',
          key: 'paragraph',
          width: 300,
        },
        {
          title: '链接',
          key: 'url',
          width: 200,
        },
        {
          title: 'ip',
          key: 'ip',
          width: 200,
        },
        {
          title: '总金额',
          key: 'sum',
          width: 200,
        },
        {
          title: 'ID',
          key: 'id',
          width: 200,
        },
        {
          title: '色值',
          key: 'color',
          width: 200,
        },
      ],
      data: [],
    },
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      const data = [];
      this.$refs.willtable.setData(data);
    },
  },
};
</script>
```

### Value-Binding

`v-model`进行值的绑定

调用setData方法来更新整表数据

### Attributes

参数 | 说明 | 类型 | 可选值 | 默认值
---|---|---|---|---
columns | 表格列的配置描述 | Array | —— | []
maxHeight | 表格最大高度 | string / number  | —— | ——
rowHeight | 每行高度 | string / number | —— | ——
disabled | 是否禁止编辑 | Boolean  | —— | true
showIcon | 是否显示表头类型图标 | Boolean  | —— | false
cellStyle | 单元格的 style 的回调方法 | Function({row, column, rowIndex, columnIndex}) | —— | ——
cellClassName | 单元格的 className 的回调方法 | Function({row, column, rowIndex, columnIndex})  | —— | ——

### Events

事件名称 | 说明 | 回调参数
---|---|---
selection-change | 当选择项发生变化时会触发该事件 | selection

### Methods

方法名 | 说明 | 参数
---|---|---
setData | 用来设置数据，更新初始数据来判断改变数据 | data 
getChangeData | 获取变化的数据行 | ——
getErrorRows | 获取校验错误的数据和索引 | ——
addItem | 底部添加一行数据 | item
removeItems | 批量删除，参数key为每行的唯一标识属性如id，values为该标识属性的数组 | key, values

### Columns-Attributes

参数 | 说明 | 类型 | 可选值 | 默认值
---|---|---|---|---
key | 对应列内容的字段名 | String | —— | ——
title | 列头显示文字 | String | —— | ——
width | 列宽度 | String / Number | —— | ——
type | 列类型 | String | selection/number/date/select/month | ——
format | number类型是否格式化千分号 | Boolean | —— | true
options | select下拉选项 | Array | { value: '值', label: '显示文字' } | ——
fixed | 是否固定在左侧 | Boolean | —— | false
action | 是否启用过滤和筛选 | Boolean | —— | false
disabled | 是否禁止编辑 | Boolean | —— | false

### Shortcut

快捷键 | 说明
---|---
方向键 | 编辑框上下左右移动
Ctrl + C | 粘贴
Ctrl + V | 复制
Ctrl + A | 单元格全选
Ctrl + Z | 撤销
Ctrl + Y | 重做
Enter | 单元格编辑/完成单元格编辑

## Author

[KevinMint](https://www.kevinmint.com)