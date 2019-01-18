export default {
  methods: {
    selectionChange() {
      const selection = this.store.showData.filter((item, index) => this.dataStatusList[index].checked);
      this.$emit('selection-change', selection);
      if (this.dataStatusList.every(item => item.checked)) {
        this.$refs.theaderContent.checkedAll = true;
        this.$refs.fixedTheaderContent.checkedAll = true;
      } else {
        this.$refs.theaderContent.checkedAll = false;
        this.$refs.fixedTheaderContent.checkedAll = false;
      }
    },
  },
};
