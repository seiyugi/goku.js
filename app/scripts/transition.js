(function (exports) {
  'use strict';

  // var TRANSITION_FINISH_THRESHOLD = 0;
  var DEFAULT_DURATION = 400;
  var DEFAULT_EASING = 'ease';

  function Transition (element, options) {
    // Currently only support ES6 Promise, add support for various promise implementations later.
    options = options || {};
    this.element = element;
    this.id = options.id;
    this.onstart = options.onstart;
    this.oncomplete = options.oncomplete;

    // this.element.style.transitionProperty = 'transform';
    // log purpose only
    // this.element.addEventListener('transitionend', function (evt) {
    //   console.log('transitionend', evt);
    // });

    this.queue = [];
    this.timings = [];
    this.playingIndex = -1;
    this.elapsedTime = 0;
    this.lastTimestamp = 0;
    this.isPaused = false;
    this.requestId = null;
    this.promise = null;
  }

  Transition.prototype = {

    /**
     * Update the transform value of an element by chaining the original and the new transform values.
     * @param  {[type]} element [description]
     * @param  {[type]} value   [description]
     * @return {[type]}         [description]
     */
    _generateTransform: function (element, value) {
      var originalTransform = getComputedStyle(element).transform;
      if (originalTransform === 'none') {
        element.style.transform = value;
      } else {
        element.style.transform = originalTransform + ' ' + value;
      }
    },

    /**
     * Maybe try this approach later for performance comparisons.
     * @param  {[type]} element [description]
     * @param  {[type]} value   [description]
     * @return {[type]}         [description]
     */
    _generateTransformByMatrix: function (element, value) {
      // If transform was applied on the element
        // Get orinial transform matrix
        // Get new transform matrix
        // Compute the result transform matrix
      // Else, set the value directly

    },

    addClass: function (className) {},

    /**
     * By default the animate calls are queued.
     * @return {[type]} [description]
     */
    animate: function () {
      // Optimize this later
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments
      var args = Array.prototype.slice.call(arguments);
      if (!args[0]) {
        throw new Error('Goku: missing arguments!');
      }

      if (typeof args[0] === 'string') {
        // Run animation by adding CSS class
        throw new Error('Goku: implement this!');
      }

      if (typeof args[0] === 'object') {
        var properties = args[0];
        var options = args[1] || {};

        var transitionPropertyArray = [];
        for (var key in properties) {
          transitionPropertyArray.push(key);
        }
        var transitionProperty = transitionPropertyArray.join(' ');
        var duration = options.duration || DEFAULT_DURATION;
        this.timings.push(duration);

        var that = this;
        var task = {
          options: options,
          start: function () {
            that.element.style.transitionProperty = transitionProperty;
            that.element.style.transitionDuration = duration + 'ms';
            that.element.style.transitionTimingFunction = options.easing || DEFAULT_EASING;
            // Workaround for triggering a transition.
            // http://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
            that.element.offsetWidth;
            for (var key in properties) {
              if (key === 'transform') {
                // Although this is helpful, but it contradicts the principle of CSS rules.
                // that._generateTransform(that.element, properties[key]);
                that.element.style[key] = properties[key];
              } else {
                that.element.style[key] = properties[key];
              }
            }

            if (options.start) {
              options.start();
            }
          }
        };

        this.queue.push(task);
        if (this.queue.length === 1) {
          that.onstart();
        }

        return this;
      }
    },

    delay: function (time) {
      if (time > 0) {
        this.queue.push(function () {});
        this.timings.push(time);
      } else {
        throw new Error('Goku: missing arguments!');
      }

      return this;
    },

    pause: function () {
      console.log('pause');
      this.isPaused = true;

      return this;
    },

    reset: function () {},

    next: function () {},

    /**
     * End the animation immediately.
     * @return {[type]} [description]
     */
    end: function () {

      return this;
    },

    then: function (callback) {
      console.log('then');

      if (callback) {
        this.queue.push(callback);
        this.timings.push(0);
      }
    },

    step: function (timestamp) {
      // timestamp is started when page loaded, reset the elapsed time first
      if (!this.isPaused && this.lastTimestamp) {
        this.elapsedTime += timestamp - this.lastTimestamp;
      }
      this.lastTimestamp = timestamp;

      if (this.playingIndex === -1) {
        this._next();
        return;
      }

      if (!this.isPaused) {
        console.log('step', this.id, this.elapsedTime);
      }

      if (this.elapsedTime > this.timings[this.playingIndex]) {
        var task = this.queue[this.playingIndex];
        if (task.options.complete) {
          task.options.complete();
        }
        this._next();
      }
    },

    _next: function () {
      this.playingIndex += 1;

      if (this.queue[this.playingIndex]) {
        console.log('next');

        var task = this.queue[this.playingIndex];
        var promise = task.start();

        if (promise instanceof Promise) {
          console.log('promise');
          var that = this;
          this.isPaused = true;
          this.promise = promise;
          promise.then(function () {
            that.isPaused = false;
            that.promise = null;
            that._next();
          });
        }

        this.elapsedTime = 0;
        this.lastTimestamp = 0;

      } else {
        console.log('end');
        this._clear();
        this.oncomplete(this.element);
      }
    },

    _clear: function () {
      console.log('clear');
      this.playingIndex = -1;
      this.queue.length = 0;
      this.timings.length = 0;
      this.elapsedTime = 0;
      this.lastTimestamp = 0;
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  };

  exports.Transition = Transition;

})(window);
