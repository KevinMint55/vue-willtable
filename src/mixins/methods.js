export default {
  methods: {
    getChangeData() {
      return this.changeData;
    },
    getErrorRows() {
      const errorRowsIndex = this.dataStatusList.map((item, index) => {
        if (item.errors.length > 0) {
          return index;
        }
        return null;
      });
      const errorRows = this.data.map((d, index) => {
        if (errorRowsIndex.includes(index)) {
          return {
            data: d,
            index,
          };
        }
        return null;
      }).filter(i => i);
      return errorRows;
    },
  },
};
