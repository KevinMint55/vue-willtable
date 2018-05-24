<template>
	<div class="main">
		<excel :columns-data="columns" v-model="data" style="width: 100%;" maxHeight="800"></excel>
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
                columns: [
                    {
                        key: 'selection',
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
                data: [],
            }
        },
        created() {
            this.init();
        },
        methods: {
            init() {
                axios.get('http://1.json').then(res => {
                    this.data = res.data.list;
                }).catch(err => {

                });
            }
        }
    }
</script>

<style>
    .main {
      padding: 100px;
    }
</style>