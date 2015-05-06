/* jshint devel:true */
/* global goku */

(function () {

  'use strict';

  document.getElementById('play').addEventListener('click', function () {

    // #elem-a animations

    goku('#elem-a')

    .animate({
      transform: 'translate(10rem, 0)'
    }, {
      before: function () { console.log('before the 1st #elem-a animation'); },
      start: function () { console.log('start the 1st #elem-a animation'); },
      complete: function () { console.log('complete the 1st #elem-a animation'); }
    })

    .animate({
      transform: 'translate(10rem, 0) scale(2)'
    }, {
      start: function () { console.log('start the 2nd #elem-a animation'); },
      complete: function () { console.log('complete the 2nd #elem-a animation'); }
    })

    .delay(2000)

    .animate({
      transform: 'rotate(270deg)'
    }, {
      duration: 1000,
      start: function () { console.log('start the 3rd #elem-a animation'); },
      complete: function () { console.log('complete the 3rd #elem-a animation'); }
    })

    .animate({
      transform: 'none'
    }, {
      duration: 600,
      start: function () { console.log('start the 4th #elem-a animation'); },
      complete: function () { console.log('complete the 4th #elem-a animation'); }
    });

    // #elem-b animations

    goku('#elem-b')

    .delay(500)

    .animate({
      transform: 'translate(5rem, 10rem)'
    }, {
      duration: 2000,
      start: function () { console.log('start the 1st animation'); },
      complete: function () { console.log('complete the 1st animation'); }
    })

    .then(function() {
      console.log('promise resolved!');
    });

    goku('#elem-b')

    .animate({
      transform: 'none'
    }, {
      start: function () { console.log('start the 2nd #elem-b animation'); },
      complete: function () { console.log('complete the 2nd #elem-b animation'); }
    });
  });

  // document.getElementById('pause').addEventListener('click', function () {
  //   goku('#elem-a').pause();
  // });

  // document.getElementById('end').addEventListener('click', function () {
  //   goku('#elem-a').end();
  // });

})(window);
