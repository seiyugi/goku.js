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
    this.oncomplete = function () {
      this._clear();
      options.oncomplete(this.element);
    }.bind(this);

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
    this.pausingIndex = -1;
    this.promiseQueue = [];

    this.animate = this.animate.bind(this);
    this.delay = this.delay.bind(this);
    this.pause = this.pause.bind(this);
  }

  Transition.prototype = {

    _generatePromiseTask: function () {
      var promiseTask = {};
      var promise = new Promise(function (resolve, reject) {
        promiseTask.resolve = resolve;
        promiseTask.reject = reject;
      });
      promise.animate = this.animate;
      promise.delay = this.delay;
      promise.pause = this.pause;
      promiseTask.promise = promise;

      return promiseTask;
    },

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
    _generateTransformByMatrix: function (/*element, value*/) {
      // If transform was applied on the element
        // Get originial transform matrix
        // Get new transform matrix
        // Compute the result transform matrix
      // Else, set the value directly

    },

    addClass: function (/*className*/) {},

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
          properties: properties,
          options: options,
          start: function () {
            that.element.style.transitionProperty = transitionProperty;
            that.element.style.transitionDuration = duration + 'ms';
            that.element.style.transitionTimingFunction = options.easing || DEFAULT_EASING;
            // Workaround for triggering a transition.
            // http://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
            /* jshint -W030 */
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
          this.onstart();
        }

        var promiseTask = this._generatePromiseTask();
        this.promiseQueue.push(promiseTask);
        return promiseTask.promise;
      }
    },

    delay: function (time) {
      console.log(this.id, 'delay');
      if (time > 0) {
        this.queue.push({});
        this.timings.push(time);
      } else {
        throw new Error('Goku: missing arguments!');
      }

      if (this.queue.length === 1) {
        this.onstart();
      }

      var promiseTask = this._generatePromiseTask();
      this.promiseQueue.push(promiseTask);
      return promiseTask.promise;
    },

    pause: function () {
      console.log(this.id, 'pause');
      this.isPaused = true;

      return this;
    },

    play: function () {
      console.log(this.id, 'play');
      this.isPaused = false;

      return this.promiseQueue[this.playingIndex].promise;
    },

    reset: function () {},

    reverse: function () {},

    next: function () {},

    /**
     * End the animation immediately.
     * @return {[type]} [description]
     */
    finish: function () {
      console.log(this.id, 'finish');
      // Get the last animation task and its properties in the queue
      var index = this.queue.length - 1;
      var properties = this.queue[index].properties;
      while (!properties) {
        properties = this.queue[index].properties;
        index -= 1;
      }
      // Remove transition-properties tyle
      this.element.style.transitionProperty = 'none';
      // Apply the final style properties onto the element
      for (var key in properties) {
        this.element.style[key] = properties[key];
      }
      // Workaround for triggering a reflow and repaint.
      // http://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
      /* jshint -W030 */
      this.element.offsetWidth;
      // Resolving promises following the logic as follows to prevent error
      // when animate is called in the then() callback.
      // Save promiseQueue reference to be resolved below.
      var promiseQueue = this.promiseQueue;
      // Clean up transition tasks including the promiseQueue.
      this.oncomplete();
      // Resolve promises
      promiseQueue.forEach(function (promise) {
        promise.resolve();
      });

      return this;
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

      if (this.isPaused && this.pausingIndex > -1) {
        return;
      }

      var task;
      var properties;
      var key;

      if (this.isPaused && this.pausingIndex < 0) {
        // Set the current style to element.style
        this.pausingIndex = this.playingIndex;
        var styles = getComputedStyle(this.element);
        task = this.queue[this.playingIndex];
        properties = task.properties;

        for (key in properties) {
          this.element.style[key] = styles[key];
        }

        return;
      }

      if (!this.isPaused && this.pausingIndex > -1) {
        this.pausingIndex = -1;
        task = this.queue[this.playingIndex];
        properties = task.properties;

        for (key in properties) {
          this.element.style[key] = properties[key];
        }

        return;
      }

      // if (!this.isPaused) {
      //   console.log('step', this.id, this.elapsedTime);
      // }

      if (this.elapsedTime > this.timings[this.playingIndex]) {
        task = this.queue[this.playingIndex];
        if (task.options && typeof task.options.complete === 'function') {
          task.options.complete();
        }
        var promiseTask = this.promiseQueue[this.playingIndex];
        promiseTask.resolve();
        this._next();
      }
    },

    _next: function () {
      this.playingIndex += 1;

      if (this.queue[this.playingIndex]) {
        console.log(this.id, 'next');

        var task = this.queue[this.playingIndex];
        if (task.options && typeof task.options.before === 'function') {
          task.options.before();
        }

        if (task.start && typeof task.start === 'function') {
          task.start();
        }

        this.elapsedTime = 0;
        this.lastTimestamp = 0;

      } else {
        console.log(this.id, 'end');
        this.oncomplete();
      }
    },

    _clear: function () {
      console.log(this.id, 'clear');
      this.playingIndex = -1;
      this.queue.length = 0;
      this.timings.length = 0;
      this.elapsedTime = 0;
      this.lastTimestamp = 0;
      this.isPaused = false;
      this.pausingIndex = -1;
      this.promiseQueue = [];
    }
  };

  exports.Transition = Transition;

})(window);
