/** Node safety */
declare var window;
function has_window() {
  return typeof window != 'undefined';
}

/** Request animation polyfill from http://www.paulirish.com/2011/requestanimationframe-for-smart-animating/ */
function requestAnimationFramePolyfill() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window['requestAnimationFrame']; ++x) {
        window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame =
        window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}

/** Invoke an action async */
export function async(action:any):void {
    if (has_window()) {
      window['requestAnimationFrame'](action);
    }
    else {
      setTimeout(action, 1);
    }
}

// Ensure we have some kind of animation helper
if (has_window()) {
  requestAnimationFramePolyfill();
}
