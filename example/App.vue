<template>
	<div class="main">
		<excel ref="excel" :columns-data="columns" v-model="data1" style="width: 100%;" maxHeight="800" @selection-change="selectionChange"></excel>
        <!-- <excel :columns-data="columns" v-model="data2" style="width: 100%;" maxHeight="800"></excel> -->
        <el-button @click="getList2">getList2</el-button>
        <el-button @click="getList3">getList3</el-button>
	</div>
</template>

<script>
import Excel from 'Excel';
import axios from 'axios';
import { button } from 'element-ui';

export default {
    name: 'App',
    components: {
        Excel,
        'el-button': button
    },
    data() {
        return {
            columns: [
                {
                    // key: 'selection',
                    type: 'selection',
                    width: 40,
                    fixed: true
                },
                {
                    title: '序号',
                    key: 'sid',
                    fixed: true,
                    type: 'number',
                    // format: false
                },
                {
                    title: '日期',
                    key: 'date',
                    type: 'date',
                    fixed: true,
                    width: 100
                },
                {
                    title: '邮箱地址',
                    key: 'email',
                    width: 300,
                    type: 'select',
                    options: [
                        {
                            value: 'New York',
                            label: 'New York'
                        },
                        {
                            value: 'London',
                            label: 'London'
                        },
                        {
                            value: 'Sydney',
                            label: 'Sydney'
                        },
                    ]
                },
                {
                    title: '月份',
                    key: 'month',
                    type: 'month'
                },
                {
                    title: '地址',
                    key: 'address',
                    width: 200
                },
                {
                    title: '标题',
                    key: 'title',
                    width: 300
                },
                {
                    title: '内容',
                    key: 'paragraph',
                    width: 300
                },
                {
                    title: '链接',
                    key: 'url',
                    width: 200
                },
                {
                    title: 'ip',
                    key: 'ip',
                    width: 200
                },
                {
                    title: '总金额',
                    key: 'sum',
                    width: 200
                },
                {
                    title: 'ID',
                    key: 'id',
                    type: 'disabled',
                    width: 200,
                },
            ],
            data1: [],
            data2: [],
        }
    },
    mounted() {
        this.getList();
    },
    methods: {
        getList() {
            axios.get('https://demo.kevinmint.com/1.json').then(res => {
                this.data1 = res.data.list;
                // this.data2 = res.data.list;
            }).catch(err => {

            });
        },
        getList2() {
            axios.get('http://3.json').then(res => {
                this.data1 = res.data.list;
                this.$nextTick(() => {
                    this.$refs.excel.initData();
                })
            }).catch(err => {

            });
        },
        getList3() {
            axios.get('http://4.json').then(res => {
                this.data1 = res.data.list;
                this.$nextTick(() => {
                    this.$refs.excel.initData();
                })
            }).catch(err => {

            });
        },
        selectionChange(selection) {
            console.log(selection);
        }
    }
}
</script>

<style>
.main {
  padding: 100px;
}
</style>