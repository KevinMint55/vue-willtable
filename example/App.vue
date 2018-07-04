<template>
	<div class="main">
		<excel :columns-data="columns" v-model="data1" style="width: 100%;" maxHeight="800"></excel>
        <!-- <excel :columns-data="columns" v-model="data2" style="width: 100%;" maxHeight="800"></excel> -->
        <button @click="changeColumns">改变表头</button>
	</div>
</template>

<script>
import Excel from 'Excel';
import axios from 'axios';

export default {
    name: 'App',
    components: {
        Excel
    },
    data() {
        return {
            columns: [],
            data1: [],
            data2: [],
        }
    },
    mounted() {
        this.init();
    },
    methods: {
        init() {
            axios.get('https://demo.kevinmint.com/1.json').then(res => {
                // this.columns = [
                //     {
                //         // key: 'selection',
                //         type: 'selection',
                //         width: 40,
                //         fixed: true
                //     },
                //     {
                //         title: '序号',
                //         key: 'sid',
                //         fixed: true,
                //         type: 'number',
                //         // format: false
                //     },
                //     {
                //         title: '日期',
                //         key: 'date',
                //         type: 'date',
                //         fixed: true,
                //         width: 100
                //     },
                //     {
                //         title: '邮箱地址',
                //         key: 'email',
                //         width: 300,
                //         type: 'select',
                //         options: [
                //             {
                //                 value: 'New York',
                //                 label: 'New York'
                //             },
                //             {
                //                 value: 'London',
                //                 label: 'London'
                //             },
                //             {
                //                 value: 'Sydney',
                //                 label: 'Sydney'
                //             },
                //         ]
                //     },

                //     {
                //         title: '月份',
                //         key: 'month',
                //         type: 'month'
                //     },
                //     {
                //         title: '地址',
                //         key: 'address',
                //         width: 200
                //     },
                //     {
                //         title: '标题',
                //         key: 'title',
                //         width: 300
                //     },
                //     {
                //         title: '内容',
                //         key: 'paragraph',
                //         width: 300
                //     },
                //     {
                //         title: '链接',
                //         key: 'url',
                //         width: 200
                //     },
                //     {
                //         title: 'ip',
                //         key: 'ip',
                //         width: 200
                //     },
                //     {
                //         title: '总金额',
                //         key: 'sum',
                //         width: 200
                //     },
                //     {
                //         title: 'ID',
                //         key: 'id',
                //         type: 'disabled',
                //         width: 200,
                //     },
                // ]
                this.data1 = JSON.parse(JSON.stringify(res.data.list));
                this.data2 = JSON.parse(JSON.stringify(res.data.list));
            }).catch(err => {

            });
        },
        changeColumns() {
            this.columns = [
                {
                    "type" : "selection",
                    "width" : 40,
                    "fixed" : true
                }, 
                {
                    "title" : "标题",
                    "key" : "9d8fcf57b763417bb4c68186fda3211d",
                }, 
                {
                    "title" : "日期",
                    "key" : "fcf5f899cad34734a0e20523cf591b55",
                    "type" : "date",
                }, 
                {
                    "title" : "总数",
                    "key" : "7ba7ae4f084d4f5cb9b5a7f1eb4abfbf",
                    "type" : "number",
                }, 
            ]
        }
    }
}
</script>

<style>
.main {
  padding: 100px;
}
</style>