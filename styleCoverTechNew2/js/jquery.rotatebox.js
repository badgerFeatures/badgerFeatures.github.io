/* This plugin assumes the folowing:

  DOM:

  A container for the box with planes:

  <section id="box-container">
    <div id="box">
      <figure data-image-nozoom class="front"></figure>
      <figure data-image-nozoom class="bottom"></figure>
      <figure data-image-nozoom class="right"></figure>
      <figure data-image-nozoom class="top"></figure>
      <figure data-image-nozoom class="left"></figure>
      <figure data-image-nozoom class="back"></figure>
    </div>
  </section>

  Some buttons to navigate the planes of the box:

  <button class="box-nav-button" data-box-show="bottom">1</button>
  <button class="box-nav-button" data-box-show="right">2</button>
  <button class="box-nav-button" data-box-show="top">3</button>
  <button class="box-nav-button" data-box-show="left">4</button>

  STYLE:

  Please include rotate-box.css

  USAGE:
  $('#box').rotateBox(options);

  OPTIONS:
  {
    boxNavButtons : [class],
    initialPanelName : [string],
    boxFlipBefore : [callback function],
    boxFlipAfter : [callback function]
  }
*/
(function($) {
  $.fn.rotateBox = function(options) {

    var _box = this,
      $button,
      previousPlane,

    // Create some defaults, extending them with any options that were provided
    settings = $.extend({
      boxNavButtons: '.box-nav-button', // Selector of box navigation elements
      initialPanelName: 'bottom',       // The data value for the initial box face to show
      perspective: 1000,                // Default perspective of the box in pixels
      duration: 1,                      // Animation duration in seconds
      boxFlipBefore: null,              // Callback function with parameters: element, event
      boxFlipAfter: null                // Callback function with parameter event
    }, options);

    // Add container perspective
    _box.parent().css({
      perspective: settings.perspective,
      webkitPerspective: settings.perspective,
      mozPerspective: settings.perspective,
    });
    // Configure transition duration
    _box.css({
      transition: 'transform '+ settings.duration +'s',
      webkitTransition: '-webkit-transform '+ settings.duration +'s',
      mozTransition: '-moz-transform '+ settings.duration +'s',
    });

    // Show initial cube face and set its associated button active
    _box.addClass('show-'+ settings.initialPanelName);
    _box.attr('data-current-plane', settings.initialPanelName);
    $(settings.boxNavButtons +'[data-box-show="' + settings.initialPanelName + '"]').addClass('selected');

    // Click listener for buttons
    $(settings.boxNavButtons).on('click', function(e) {
      $button = $(this);
      previousPlane = _box.attr('data-current-plane');

      $button.siblings().removeClass('selected');

      if (_box.attr('data-current-plane') != $(e.target).attr('data-box-show')) {
        _boxFlipBefore(e, $button);
        _box.removeClass('show-'+ settings.initialPanelName);
        settings.initialPanelName = $(e.target).attr('data-box-show');
        currentPlane = settings.initialPanelName;
        console.log(settings.initialPanelName);
        _box.addClass('show-'+ settings.initialPanelName);
        _box.attr('data-current-plane', currentPlane);
      }

      $button.addClass('selected');
      // Wait for box rotate/flip animation to complete
    });

    _box.on('transitionend webkitTransitionEnd', function(e) { _boxFlipAfter(e); });

    // Call custom callback before the transition
    function _boxFlipBefore(button, e) {
      if (typeof settings.boxFlipBefore == 'function') {
        settings.boxFlipBefore.call(this, e, button);
      }
    }

    // Call custom callback after the transition
    function _boxFlipAfter(e) {
      if (typeof settings.boxFlipAfter == 'function') {
        settings.boxFlipAfter.call(this, e);
      }
    }

  };
})(jQuery);
