export default {
  methods: {
    getData() {
      return this.data;
    },
    setData(data) {
      this.data = data;
      this.$nextTick(() => {
        this.initData();
        this.store.handleFilters();
      });
    },
    setCellData(rowIndex, columnIndex, value) {
      const { states } = this.store;
      this.data[rowIndex][states.columns[columnIndex].key] = value;
      this.$nextTick(() => {
        this.store.handleFilters();
      });
    },
    getChangeData() {
      return this.store.states.changeData;
    },
    getErrorRows() {
      const { states } = this.store;
      const errorRowsIndex = states.dataStatusList.map((item, index) => {
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
      }).filter((i) => i);
      return errorRows;
    },
    addItem(item) {
      const { states } = this.store;
      this.data.push(item);
      states.dataStatusList.push({
        checked: false,
        errors: [],
      });
      states.initialData.push(item);
    },
    addRow(rowIndex, copyRow, customData) {
      this.store.addRow(rowIndex, copyRow, customData);
    },
    removeItems(key, values) {
      const { states } = this.store;
      if (key && values instanceof Array) {
        values.forEach((value) => {
          const dIndex = this.data.findIndex((d) => d[key] === value);
          states.dataStatusList.splice(dIndex, 1);
          states.initialData.splice(dIndex, 1);
          this.data.splice(dIndex, 1);
        });
      }
    },
    fullscreen() {
      if (this.$refs.willtable.requestFullscreen) {
        this.$refs.willtable.requestFullscreen();
      } else if (this.$refs.willtable.webkitRequestFullScreen) {
        this.$refs.willtable.webkitRequestFullScreen();
      } else if (this.$refs.willtable.mozRequestFullScreen) {
        this.$refs.willtable.mozRequestFullScreen();
      } else if (this.$refs.willtable.msRequestFullscreen) {
        this.$refs.willtable.msRequestFullscreen();
      }
    },
    exitFullscreen() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitCancelFullScreen) {
        document.webkitCancelFullScreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    },
  },
};
