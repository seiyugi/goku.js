/* jshint devel:true */

(function (window) {

  'use strict';

  document.getElementById('play').addEventListener('click', function () {
    goku('#elem-a')
    .animate({
      transform: 'translate(10rem, 0)'
    }, {
      start: function () { console.log('start the 1st animation'); },
      complete: function () { console.log('complete the 1st animation'); }
    })
    .animate({
      transform: 'translate(10rem, 0) scale(2)'
    }, {
      start: function () { console.log('start the 2nd animation'); },
      complete: function () { console.log('complete the 2nd animation'); }
    })
    .animate({
      transform: 'rotate(270deg)'
    }, {
      duration: 1000,
      start: function () { console.log('start the 3rd animation'); },
      complete: function () { console.log('complete the 3rd animation'); }
    })
    .animate({
      transform: 'none'
    }, {
      duration: 600,
      start: function () { console.log('start the 4th animation'); },
      complete: function () { console.log('complete the 4th animation'); }
    });
  });

  // document.getElementById('pause').addEventListener('click', function () {
  //   goku('#elem-a').pause();
  // });

  // document.getElementById('end').addEventListener('click', function () {
  //   goku('#elem-a').end();
  // });

})(window);
