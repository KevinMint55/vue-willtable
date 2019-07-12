<template>
  <div class="main">
    <div class="button-bar">
      <div>
        <el-button @click="getList2">获取20条数据</el-button>
        <el-button @click="getList3">获取200条数据</el-button>
        <el-button @click="getChangeData">获取改变的数据行</el-button>
        <el-button @click="getErrorRows">获取错误行</el-button>
        <el-button @click="disabled = !disabled">{{ disabled ? '启用' : '禁用'}}</el-button>
        <el-button @click="show = !show">{{ show ? '隐藏' : '显示'}}</el-button>
        <el-button @click="add">添加行</el-button>
        <el-button @click="remove">勾选删除行</el-button>
      </div>
    </div>
    <excel
      v-if="show"
      ref="willtable"
      :columns="columns"
      v-model="data"
      style="width: 100%;margin-top: 10px;"
      maxHeight="800"
      @selection-change="selectionChange"
      :disabled="disabled"
      :showIcon="true" />
  </div>
</template>

<script>
import axios from 'axios';
import { button } from 'element-ui';
import Excel from '../src/components/Table.vue';

export default {
  name: 'App',
  components: {
    Excel,
    'el-button': button,
  },
  data() {
    return {
      show: true,
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
        },
        {
          title: '日期',
          key: 'date',
          type: 'date',
          width: '100',
        },
        {
          title: '邮箱地址',
          key: 'email',
          width: 300,
          type: 'select',
          fixed: true,
          options: [
            {
              value: 'New York',
              label: 'New York',
            },
            {
              value: 'London',
              label: 'London',
            },
            {
              value: 'Sydney',
              label: 'Sydney',
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
          action: true,
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
          type: 'disabled',
          width: 200,
        },
      ],
      data: [],
      disabled: false,
      selection: [],
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    getList() {
      axios.get('https://demo.kevinmint.com/1.json').then((res) => {
        this.$refs.willtable.setData(res.data.list);
        // this.data = res.data.list;
      }).catch(() => {});
    },
    getList2() {
      axios.get('http://3.json').then((res) => {
        this.$refs.willtable.setData(res.data.list);
      }).catch(() => {});
    },
    getList3() {
      axios.get('http://4.json').then((res) => {
        this.$refs.willtable.setData(res.data.list);
      }).catch(() => {});
    },
    selectionChange(selection) {
      this.selection = selection;
    },
    getErrorRows() {
      console.log(this.$refs.willtable.getErrorRows());
    },
    getChangeData() {
      console.log(this.$refs.willtable.getChangeData());
    },
    cellStyle({ rowIndex, columnIndex }) {
      if (rowIndex === 1) {
        return {
          color: 'red',
        };
      }
      if (columnIndex === 5) {
        return {
          color: 'green',
        };
      }
    },
    add() {
      const obj = {};
      obj.id = new Date().getTime();
      this.columns.forEach((item) => {
        if (item.key) {
          obj[item.key] = '';
        }
      });
      this.$refs.willtable.addItem(obj);
    },
    remove() {
      this.$refs.willtable.removeItems('sid', this.selection.map(s => s.sid));
    },
  },
};
</script>

<style>
.main {
  padding: 20px;
}

.button-bar {
  display: flex;
  justify-content: space-between;
}
</style>
