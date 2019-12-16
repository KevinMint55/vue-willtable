<template>
  <div
    class="ww-scroll-wrap"
    :class="barType">
    <div
      class="ww-scroll-box"
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
const mainLength = {
  x: 'mainWidth',
  y: 'mainHeight',
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
const scrollDir = {
  x: 'tableBodyLeft',
  y: 'tableBodyTop',
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
      const { barType } = this;
      if (this.canScroll) {
        const scrollBarPos = e[pagePos[barType]] - this.oriMousePos;
        if (scrollBarPos <= 0) {
          states.scrollbar[barPos[barType]] = 0;
        } else if (scrollBarPos >= states[mainLength[barType]] - states.scrollbar[barLength[barType]]) {
          states.scrollbar[barPos[barType]] = states[mainLength[barType]] - states.scrollbar[barLength[barType]];
        } else {
          states.scrollbar[barPos[barType]] = scrollBarPos;
        }
        states[scrollDir[barType]] = this.scrollbar[barPos[barType]] / (states[mainLength[barType]] - this.scrollbar[barLength[barType]]) * (states[tableLength[barType]] - states[mainLength[barType]]);
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

<style lang="scss">
.ww-scroll-wrap {
  position: absolute;
  z-index: 20;
  background-color: #f8f8f9;
  &.x {
    bottom: 0;
    left: 0;
    width: 100%;
    height: 8px;
    .ww-scroll-box {
      height: 8px;
    }
  }
  &.y {
    top: 0;
    right: 0;
    width: 8px;
    height: 100%;
    .ww-scroll-box {
      width: 8px;
    }
  }
}

.ww-scroll-box {
  border-radius: 4px;
  background-color: #bbbec4;
  transition: background-color 0.3s;
  user-select: none;
  &:hover {
    background-color: #80848f;
  }
}
</style>
