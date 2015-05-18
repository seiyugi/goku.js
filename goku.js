/* global Transition */
(function (exports) {
  'use strict';

  var requestId;
  // Transition elements
  var elements = {};
  // Elements that are running animations
  var animatingElements = [];

  var gokuIndex = 0;

  var requestAnimationFrame = window.requestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              function fakeAnimationFrame(callback) {
                                return window.setTimeout(callback, 1000 / 60);
                              };

  var cancelAnimationFrame = window.cancelAnimationFrame ||
                             window.webkitCancelAnimationFrame ||
                             window.mozCancelAnimationFrame ||
                             function fakeAnimationFrame(id) {
                               window.clearTimeout(id);
                             };

  function isObjectEmpty(obj) {
    if (!obj) {
      return true;
    }

    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        return false;
      }
    }

    return true;
  }

  function newId () {
    return 'goku-' + gokuIndex++;
  }

  function goku (element) {
    if (!element) {
      throw new Error('Goku: no argument');
    }

    if (typeof element === 'string') {
      element = document.querySelector(element);
    }

    if (!element) {
      throw new Error('Goku: no element found');
    }

    if (elements[element.dataset.gokuId]) {
      return elements[element.dataset.gokuId];
    }

    // Use MutationObserver to release the obj when done
    // https://developer.mozilla.org/en/docs/Web/API/MutationObserver
    // https://hacks.mozilla.org/2012/05/dom-mutationobserver-reacting-to-dom-changes-without-killing-browser-performance/
    // http://jsbin.com/yeferi/1/edit?html,js,console,output

    var id = newId();

    element.dataset.gokuId = id;

    elements[id] = new Transition(element, {
      id: id,
      onstart: function (id) {
        if (animatingElements.indexOf(id) < 0) {
          animatingElements.push(id);
        }
        if (!requestId) {
          console.log('goku.js: start animation loop');
          requestId = requestAnimationFrame(step);
        }
      },
      oncomplete: function (element) {
        var id = element.dataset.gokuId;

        if (animatingElements.indexOf(id) > -1) {
          animatingElements.splice(animatingElements.indexOf(id), 1);
        }
        if (animatingElements.length < 1) {
          console.log('goku.js: complete animation loop');
          cancelAnimationFrame(requestId);
          requestId = null;
        }
      }
    });

    return elements[id];
  }

  /**
   * The main and only loop for monitoring animated elements.
   * @param  {[type]} timestamp [description]
   * @return {[type]}           [description]
   */
  function step (timestamp) {
    requestId = requestAnimationFrame(step);

    animatingElements.forEach(function (id) {
      if (elements[id].step) {
        elements[id].step(timestamp);
      }
    });
  }

  exports.goku = goku;

})(window);

(function (exports) {
  'use strict';

  // var TRANSITION_FINISH_THRESHOLD = 0;
  var DEFAULT_DURATION = 400;
  var DEFAULT_EASING = 'ease';
  var DEFAULT_SPEED_RATIO = 4;

  function Transition (element, options) {
    // Currently only support ES6 Promise, add support for various promise implementations later.
    options = options || {};
    this.element = element;
    this.id = options.id;
    // The callback to notify the goku instance (animation element manager) that the animations for this element has started.
    this.onstart = options.onstart;
    // The callback to notify the goku instance (animation element manager) that the animations for this element has stopped.
    this.oncomplete = function () {
      // Need to reset timings first since they might be modified by speed.
      this.isStarted = false;
      this._reset();
      options.oncomplete(this.element);
    }.bind(this);

    // this.element.style.transitionProperty = 'transform';
    // log purpose only
    // this.element.addEventListener('transitionend', function (evt) {
    //   console.log('transitionend', evt);
    // });

    // Store the default style before running animations.
    var cssText = this.element.style.cssText;
    this.defaultStyle = cssText;
    this.queue = [];
    // Store original animation timings, timings can be changed by speed method.
    this.originalTimings = [];
    this.timings = [];
    this.playingIndex = -1;
    this.elapsedTime = 0;
    this.lastTimestamp = 0;
    // Is any animation started running
    this.isStarted = false;
    // Is the running animation paused
    this.isPaused = false;
    this.isPauseHandled = false;
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
        options.duration = options.duration || DEFAULT_DURATION;
        this.originalTimings.push(options.duration);
        this.timings.push(options.duration);

        var that = this;
        var task = {
          properties: properties,
          options: options,
          start: function () {
            that.element.style.transitionProperty = transitionProperty;
            that.element.style.transitionDuration = options.duration + 'ms';
            that.element.style.transitionTimingFunction = options.easing || DEFAULT_EASING;
            // Force a transition.
            // http://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
            /* jshint -W030 */
            that.element.offsetWidth;
            for (var key in properties) {
              that.element.style[key] = properties[key];
            }

            if (options.start) {
              options.start();
            }
          }
        };

        this.queue.push(task);
        this.onstart(this.id);

        var promiseTask = this._generatePromiseTask();
        this.promiseQueue.push(promiseTask);
        return promiseTask.promise;
      }
    },

    /**
     * Delay the next animation for the specified time in miliseconds.
     * @param  {[type]} time [description]
     * @return {[type]}      [description]
     */
    delay: function (time) {
      if (time > 0) {
        this.queue.push({});
        this.originalTimings.push(time);
        this.timings.push(time);
      } else {
        throw new Error('Goku: missing arguments!');
      }

      this.onstart(this.id);

      var promiseTask = this._generatePromiseTask();
      this.promiseQueue.push(promiseTask);
      return promiseTask.promise;
    },

    /**
     * Pause the current animation.
     * @return {[type]} [description]
     */
    pause: function () {
      if (this.isStarted) {
        this.isPaused = true;
      }

      return this;
    },

    /**
     * Resume a pausing animation.
     * @return {[type]} [description]
     */
    play: function () {
      this.isPaused = false;

      return this.promiseQueue[this.playingIndex].promise;
    },

    /**
     * Reset the element to the initial state before applying animations.
     * @return {[type]} [description]
     */
    reset: function () {
      this.element.style.cssText = this.defaultStyle;
      this.playingIndex = -1;
      // Force a reflow and repaint.
      // http://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
      /* jshint -W030 */
      this.element.offsetWidth;
      this.oncomplete();
      return this;
    },

    reverse: function () {
    },

    /**
     * Change animation speed. Setting the 2nd parameter to true to change the speed of all queued animations.
     * @param  {[type]} ratio     [description]
     * @param  {[type]} jumpToEnd [description]
     * @return {[type]}           [description]
     */
    speed: function (ratio, jumpToEnd) {
      // Changing only the transition-duration once the transition has started
      // will not actually shorten or extend the transition duration.
      // Need to pause the transition first and then start a new transition
      // with the new duration.
      var task = this.queue[this.playingIndex];

      if (!task) {
        return;
      }

      ratio = ratio || DEFAULT_SPEED_RATIO;

      var properties = task.properties;
      var remainingTime = (task.options.duration - this.elapsedTime) / ratio;
      var styles = getComputedStyle(this.element);
      var key;
      for (key in properties) {
        this.element.style[key] = styles[key];
      }
      // Force a reflow and repaint.
      // http://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
      /* jshint -W030 */
      this.element.offsetWidth;

      for (key in properties) {
        this.element.style[key] = properties[key];
      }
      this.element.style.transitionDuration = remainingTime + 'ms';
      this.timings[this.playingIndex] = remainingTime;
      this.elapsedTime = 0;
      this.lastTimestamp = 0;

      if (jumpToEnd) {
        var newTiming = 0;
        for (var i = this.playingIndex + 1; i < this.queue.length; i++) {
          newTiming = this.originalTimings[i] / ratio;
          this.queue[i].options.duration = newTiming;
          this.timings[i] = newTiming;
        }
      }

      return this;
    },

    /**
     * Stop the current animation.
     * @return {[type]} [description]
     */
    stop: function () {
      if (this.isStarted) {
        this._goto(this.playingIndex);
        this._next();
      }
      return this;
    },

    _goto: function (index) {
      // Get the last animation task and its properties in the queue
      if (!this.queue[index] || !this.queue[index].properties) {
        return false;
      }
      var properties = this.queue[index].properties;
      // Remove transition-properties style
      this.element.style.transitionProperty = 'none';
      // Apply the final style properties onto the element
      for (var key in properties) {
        this.element.style[key] = properties[key];
      }
      // Force a reflow and repaint.
      // http://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
      /* jshint -W030 */
      this.element.offsetWidth;

      return true;
    },

    /**
     * End the animation immediately.
     * @return {[type]} [description]
     */
    finish: function () {
      if (this.queue.length < 1) {
        return this;
      }

      var index = this.queue.length - 1;
      while (!this._goto(index) && index > -1) {
        index -= 1;
      }
      // Resolving promises following the logic as follows to prevent error
      // when animate is called in the then() callback.
      // Save promiseQueue reference to be resolved below.
      var promiseQueue = this.promiseQueue;
      // Clean up transition tasks including the promiseQueue.
      this.playingIndex = this.queue.length - 1;
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

      if (!this.isStarted) {
        this.isStarted = true;
        this._next();
        return;
      }

      if (this.isPaused && this.isPauseHandled) {
        return;
      }

      var task;
      var properties;
      var key;

      if (this.isPaused && !this.isPauseHandled) {
        // Set the current style to element.style
        this.isPauseHandled = true;
        var styles = getComputedStyle(this.element);
        task = this.queue[this.playingIndex];
        properties = task.properties;

        for (key in properties) {
          this.element.style[key] = styles[key];
        }

        return;
      }

      if (!this.isPaused && this.isPauseHandled) {
        this.isPauseHandled = false;
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

        var task = this.queue[this.playingIndex];
        if (task.options && typeof task.options.before === 'function') {
          task.options.before();
        }

        if (task.start && typeof task.start === 'function') {
          task.start();
        }

      } else {
        console.log(this.id, 'end');
        this.playingIndex -= 1;
        this.oncomplete();
      }

      this.elapsedTime = 0;
      this.lastTimestamp = 0;
    },

    /**
     * Reset animations to it's original settings without changing its state.
     * @return {[type]} [description]
     */
    _reset: function () {
      for (var i = 0; i < this.queue.length; i++) {
        this.queue[i].options.duration = this.originalTimings[i];
        this.timings[i] = this.originalTimings[i];
      }
    },

    _clear: function () {
      this.playingIndex = -1;
      this.queue.length = 0;
      this.originalTimings.length = 0;
      this.timings.length = 0;
      this.elapsedTime = 0;
      this.lastTimestamp = 0;
      this.isStarted = false;
      this.isPaused = false;
      this.isPauseHandled = false;
      this.promiseQueue = [];
    }
  };

  exports.Transition = Transition;

})(window);
