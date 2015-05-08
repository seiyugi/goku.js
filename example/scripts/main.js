/* jshint devel:true */
/* global goku */

(function () {

  'use strict';

  var playButton = document.getElementById('play');
  var pauseAButton = document.getElementById('pause-a');
  var pauseBButton = document.getElementById('pause-b');

  playButton.addEventListener('click', function () {

    playButton.setAttribute('disabled', true);

    // #elem-a animations

    goku('#elem-a')

    .animate({
      transform: 'translate(50rem, 0)'
    }, {
      duration: 5000,
      before: function () { console.log('before the 1st #elem-a animation'); },
      start: function () { console.log('start the 1st #elem-a animation'); },
      complete: function () { console.log('complete the 1st #elem-a animation'); }
    })

    .animate({
      transform: 'translate(50rem, 0) scale(2)'
    }, {
      duration: 2000,
      start: function () { console.log('start the 2nd #elem-a animation'); },
      complete: function () { console.log('complete the 2nd #elem-a animation'); }
    })

    // .delay(2000)

    .animate({
      transform: 'translate(70rem, 0) rotate(270deg)'
    }, {
      duration: 2000,
      start: function () { console.log('start the 3rd #elem-a animation'); },
      complete: function () { console.log('complete the 3rd #elem-a animation'); }
    });

    // #elem-b animations

    goku('#elem-b')

    // .delay(500)

    .animate({
      transform: 'translate(70rem, 10rem)'
    }, {
      duration: 5000,
      start: function () { console.log('start the 1st #elem-b animation'); },
      complete: function () { console.log('complete the 1st #elem-b animation'); }
    })

    .then(function() {
      console.log('promise resolved!');

      goku('#elem-b')

      .animate({
        transform: 'none'
      }, {
        duration: 2500,
        start: function () { console.log('start the 2nd #elem-b animation'); },
        complete: function () { console.log('complete the 2nd #elem-b animation'); }
      });
    });
  });

  pauseAButton.addEventListener('click', function () {
    if (pauseAButton.textContent === 'pause blue') {
      goku('#elem-a').pause();
      pauseAButton.textContent = 'play blue';
    } else {
      goku('#elem-a').play();
      pauseAButton.textContent = 'pause blue';
    }
  });

  pauseBButton.addEventListener('click', function () {
    if (pauseBButton.textContent === 'pause red') {
      goku('#elem-b').pause();
      pauseBButton.textContent = 'play red';
    } else {
      goku('#elem-b').play();
      pauseBButton.textContent = 'pause red';
    }
  });

  document.getElementById('fast-forward').addEventListener('click', function () {
    goku('#elem-a').speed(7, true);
    goku('#elem-b').speed();
  });

  document.getElementById('slow-motion').addEventListener('click', function () {
    goku('#elem-a').speed(0.25, true);
    goku('#elem-b').speed();
  });

  document.getElementById('stop').addEventListener('click', function () {
    goku('#elem-a').stop();
    goku('#elem-b').stop();
  });

  document.getElementById('finish').addEventListener('click', function () {
    goku('#elem-a').finish();
    goku('#elem-b').finish();
  });

})(window);
