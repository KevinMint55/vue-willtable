<template>
  <div
    class="ww_scroll_wrap"
    :class="barType">
    <div
      class="ww_scroll_box"
      @mousedown="handleDown"
      :style="boxStyle">
    </div>
  </div>
</template>

<script>
const tableLength = {
  x: 'tableWidth',
  y: 'tableHeight',
};
const pagePos = {
  x: 'pageX',
  y: 'pageY',
};
const barLength = {
  x: 'xWidth',
  y: 'yHeight',
};
const barPos = {
  x: 'posX',
  y: 'posY',
};

export default {
  props: {
    store: {
      required: true,
    },
    barType: {
      type: String,
    },
  },
  data() {
    return {
      canScroll: false,
      oriMousePos: 0,
    };
  },
  computed: {
    scrollbar() {
      return this.store.states.scrollbar;
    },
    boxStyle() {
      const length = `${this.scrollbar[barLength[this.barType]]}px`;
      if (this.barType === 'x') {
        return {
          width: length,
          transform: `translateX(${this.scrollbar[barPos[this.barType]]}px)`,
        };
      }
      if (this.barType === 'y') {
        return {
          height: length,
          transform: `translateY(${this.scrollbar[barPos[this.barType]]}px)`,
        };
      }
      return {};
    },
  },
  methods: {
    handleDown(e) {
      this.canScroll = true;
      this.oriMousePos = e[pagePos[this.barType]] - this.scrollbar[barPos[this.barType]];
      window.addEventListener('mouseup', this.handleUp);
      window.addEventListener('mousemove', this.handleMove);
    },
    handleMove(e) {
      const { states } = this.store;
      if (this.canScroll) {
        const scrollBarPos = e[pagePos[this.barType]] - this.oriMousePos;
        if (scrollBarPos <= 0) {
          states.scrollbar[barPos[this.barType]] = 0;
        } else if (scrollBarPos >= states[tableLength[this.barType]] - states.scrollbar[barLength[this.barType]]) {
          states.scrollbar[barPos[this.barType]] = states[tableLength[this.barType]] - states.scrollbar[barLength[this.barType]];
        } else {
          states.scrollbar[barPos[this.barType]] = scrollBarPos;
        }
      }
    },
    handleUp() {
      this.canScroll = false;
      window.removeEventListener('mouseup', this.handleUp);
      window.removeEventListener('mousemove', this.handleMove);
    },
  },
};
</script>

<style lang="scss" scoped>
.ww_scroll_wrap {
  position: absolute;
  z-index: 20;
  &.x {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 8px;
    .ww_scroll_box {
      height: 8px;
    }
  }
  &.y {
    top: 0;
    right: 0;
    width: 8px;
    height: 100%;
    .ww_scroll_box {
      width: 8px;
    }
  }
}

.ww_scroll_box {
  border-radius: 4px;
  background-color: #bbbec4;
  transition: background-color 0.3s;
  user-select: none;
  &:hover {
    background-color: #80848f;
  }
}
</style>
