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
    addItem(item) {
      this.data.push(item);
      this.dataStatusList.push({
        checked: false,
        errors: [],
      });
    },
    removeItems(key, values) {
      if (key && values instanceof Array) {
        values.forEach((value) => {
          const dIndex = this.data.findIndex(d => d[key] === value);
          if (dIndex) {
            this.dataStatusList.splice(dIndex, 1);
            this.data.splice(dIndex, 1);
          }
        });
      }
    },
  },
};
