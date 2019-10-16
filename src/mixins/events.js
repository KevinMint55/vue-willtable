export default {
  methods: {
    selectionChange() {
      const { states } = this.store;
      const selection = this.store.states.showData.filter((item, index) => states.dataStatusList[index].checked);
      this.$emit('selection-change', selection);
      if (states.dataStatusList.every((item) => item.checked)) {
        this.$refs.theaderContent.checkedAll = true;
        this.$refs.fixedTheaderContent.checkedAll = true;
      } else {
        this.$refs.theaderContent.checkedAll = false;
        this.$refs.fixedTheaderContent.checkedAll = false;
      }
    },
  },
};
