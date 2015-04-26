(function (exports) {
  'use strict';

  var TRANSITION_FINISH_THRESHOLD = 0;

  var elements = {};

  function Transition (options) {
    // Currently only support ES6 Promise, add support for various promise implementations later.

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
     * [description]
     * @param  {[type]} selector [description]
     * @param  {[type]} options  Example: { property: 'transform', value: 'scale(1.5)', delay: 1000, duration: 500, timingFunction: 'ease' }
     * @return {[type]}          [description]
     */
    play: function (selector, options) {
      console.log('play');

      if (this.isPaused && !this.promise) {
        this.isPaused = false;
      }

      var element = document.querySelector(selector);
      element.addEventListener('transitionend', function () {
        console.log('transitionend');
      });

      element.style.transitionProperty = options.property;
      element.style.transitionDuration = options.duration + 'ms';
      if (options.delay) {
        element.style.transitionDelay = options.delay + 'ms';
      }
      if (options.timingFunction) {
        element.style.timingFunction = options.timingFunction;
      }

      var task = function () {
        // Workaround for triggering a transition.
        // http://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
        element.offsetWidth;
        element.style[options.property] = options.value;
      };

      options.delay = options.delay || 0;
      this.queue.push(task);
      this.timings.push(options.duration + options.delay);

      if (!this.requestId) {
        this.playingIndex = 0;
        this.queue[this.playingIndex]();
        this.requestId = requestAnimationFrame(this.step.bind(this));
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

    end: function () {

      return this;
    },

    then: function (callback) {
      console.log('then');

      if (callback) {
        this.queue.push(callback);
        this.timings.push(0);
      }

      return this;
    },

    at: function (time) {},

    step: function (timestamp) {
      // timestamp is started when page loaded, reset the elapsed time first
      if (!this.isPaused && this.lastTimestamp) {
        this.elapsedTime += timestamp - this.lastTimestamp;
      }
      this.lastTimestamp = timestamp;

      if (!this.isPaused) {
        console.log('step', this.elapsedTime);

        var duration = 0;
        for (var i=0; i <= this.playingIndex; i++) {
          duration += this.timings[i] + TRANSITION_FINISH_THRESHOLD;
        }
      }

      this.requestId = requestAnimationFrame(this.step.bind(this));

      if (this.elapsedTime > duration) {
        this._next();
      }
    },

    _next: function () {
      this.playingIndex += 1;

      if (this.queue[this.playingIndex]) {
        console.log('next');

        var promise = this.queue[this.playingIndex]();
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

      } else {
        console.log('end');
        this._clear();
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
