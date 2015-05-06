/* global Transition */
(function (exports) {
  'use strict';

  var requestId;

  var elements = {};

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

    // var that = this;
    var id = newId();

    element.dataset.gokuId = id;

    elements[id] = new Transition(element, {
      id: id,
      onstart: function () {
        if (!requestId) {
          requestId = requestAnimationFrame(step);
        }
      },
      oncomplete: function (element) {
        var id = element.dataset.gokuId;
        delete element.dataset.gokuId;
        delete elements[id];
        if (isObjectEmpty(elements)) {
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
    for (var key in elements) {
      if (elements[key].step) {
        elements[key].step(timestamp);
      }
    }

    requestId = requestAnimationFrame(step);
  }

  exports.goku = goku;

})(window);

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
    this.promiseQueue = [];

    this.animate = this.animate.bind(this);
    this.delay = this.animate.bind(this);
    this.pause = this.pause.bind(this);
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
    _generateTransformByMatrix: function (/*element, value*/) {
      // If transform was applied on the element
        // Get orinial transform matrix
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
          that.onstart();
        }

        var promiseTask = {};
        var promise = new Promise(function (resolve, reject) {
          promiseTask.resolve = resolve;
          promiseTask.reject = reject;
        });
        promise.animate = this.animate;
        promise.delay = this.delay;
        promise.pause = this.pause;
        promiseTask.promise = promise;
        this.promiseQueue.push(promiseTask);

        return promise;
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
        // console.log('step', this.id, this.elapsedTime);
      }

      if (this.elapsedTime > this.timings[this.playingIndex]) {
        var task = this.queue[this.playingIndex];
        if (typeof task.options.complete === 'function') {
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
        if (typeof task.options.before === 'function') {
          task.options.before();
        }
        task.start();

        this.elapsedTime = 0;
        this.lastTimestamp = 0;

      } else {
        console.log(this.id, 'end');
        this._clear();
        this.oncomplete(this.element);
      }
    },

    _clear: function () {
      console.log(this.id, 'clear');
      this.playingIndex = -1;
      this.queue.length = 0;
      this.timings.length = 0;
      this.elapsedTime = 0;
      this.lastTimestamp = 0;
      this.requestId = null;
    }
  };

  exports.Transition = Transition;

})(window);
