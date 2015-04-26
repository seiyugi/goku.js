/* jshint devel:true */

(function (window) {

  'use strict';

  var transition = new Transition();

  function startTransition() {
    transition.play('#elem-a', {
      property: 'transform',
      value: 'scale(1.5)',
      duration: 1000});

    transition.then(function() {
      console.log('oh');
      // transition.clear();
      return new Promise(function(resolve, reject) {
        setTimeout(function() {
          console.log('yeah');
          resolve();
        }, 5000);
      });
    });

    transition.play('#elem-a', {
      property: 'transform',
      value: 'translate(10rem, 0)',
      duration: 1000});

    transition.play('#elem-a', {
      property: 'transform',
      value: 'translate(5rem, 0)',
      duration: 1000});

    transition.play('#elem-a', {
      property: 'transform',
      value: 'translate(0, 5rem)',
      duration: 1000});
  }

  document.getElementById('play').addEventListener('click', function () {
    startTransition();
  });

  // document.getElementById('pause').addEventListener('click', function () {
  //   transition.pause();
  // });

  // document.getElementById('end').addEventListener('click', function () {
  //   transition.end();
  // });

})(window);
