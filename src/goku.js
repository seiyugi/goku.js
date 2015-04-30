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
                                window.setTimeout(callback, 1000 / 60);
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
