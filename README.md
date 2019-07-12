# vue-willtable编辑表格组件

适用于Vue的表格编辑组件，支持多种快捷键操作，模拟Excel的操作体验

## Installation

```
npm install vue-willtable --save
```

## Usage

### use with global

``` javascript
import Vue from 'vue'
import VueWilltable from 'vue-willtable'

// require styles
import 'vue-willtable/dist/vue-willtable.min.css'

Vue.component('VueWilltable', VueWilltable)
```

### use with component

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

### Value-Binding

`v-model`进行值的绑定

调用setData方法来更新整表数据

### Attributes

参数 | 说明 | 类型 | 可选值 | 默认值
---|---|---|---|---
columns | 表格列的配置描述 | Arry | —— | []
maxHeight | 表格最大高度 | string / number  | —— | ——
disabled | 是否可编辑 | Boolean  | —— | true
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
type | 列类型 | String | selection/number/date/select/month/disabled | ——
format | number类型是否格式化千分号 | Boolean | —— | true
options | select下拉选项 | Array | { value: '值', label: '显示文字' } | ——
fixed | 是否固定在左侧 | Boolean | —— | false

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

### Feature

- 表格宽度调整
- 表单列固定
- 数据过滤与筛选
- 框选单元格拖动超过表格时自动滚动表格区域
- 数据下拉复制
- 获取数据改变的行
- 多种数据类型选择和校验
- 可与Excel互相复制粘贴
- 支持撤销与重做
- 可自定义每个单元格样式与类名