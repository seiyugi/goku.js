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
