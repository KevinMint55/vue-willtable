export default {
  methods: {
    debounce(func, waitTime = 3e2, immediate) {
      let timer = null;
      return function (...args) {
        if (immediate && !timer) func.apply(this, args);
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, waitTime);
      };
    },
    throttle(func, waitTime = 3e2, immediate) {
      let timer = null;
      let callNow = immediate;
      return function (...args) {
        if (callNow) {
          func.apply(this, args);
          callNow = false;
        }
        if (!timer) {
          timer = setTimeout(() => {
            func.apply(this, args);
            timer = null;
          }, waitTime);
        }
      };
    },
  },
};
